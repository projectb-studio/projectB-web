import { readFileSync, writeFileSync, renameSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * LLM API 비용 하드캡 가드.
 *
 * 목적: ANTHROPIC_API_KEY 로 나가는 실제 과금이 정해진 예산(기본 $5)을 절대
 * 넘지 않게 한다. "넘으면 경고" 가 아니라 "넘을 것 같으면 호출 자체를 차단" 한다.
 *
 * 패턴 — 사전 예약 후 정산(reserve → settle):
 *   1. 호출 직전에 worst-case 비용(입력 추정치 + max_tokens 전량 출력)을 예약한다.
 *      예약분까지 포함해 예산을 넘기면 BudgetExceededError 로 호출을 막는다.
 *   2. 호출이 끝나면 응답의 실제 usage 로 정산해, 과다 예약분을 예산에 되돌린다.
 *   3. 호출이 실패하면 release 로 예약을 통째로 되돌린다.
 *
 * 이 순서 덕분에 "먼저 쓰고 나중에 세는" 초과 과금이 구조적으로 불가능하다.
 * 원장은 파일에 남으므로 프로세스를 다시 띄워도 누적 사용량이 이어진다.
 */

/** 모델별 100만 토큰당 단가(USD). */
export const MODEL_PRICING: Record<
  string,
  { inputPerMTok: number; outputPerMTok: number }
> = {
  "claude-haiku-4-5-20251001": { inputPerMTok: 1, outputPerMTok: 5 },
  "claude-haiku-4-5": { inputPerMTok: 1, outputPerMTok: 5 },
  "claude-sonnet-4-5": { inputPerMTok: 3, outputPerMTok: 15 },
  "claude-sonnet-5": { inputPerMTok: 3, outputPerMTok: 15 },
  "claude-opus-4-5": { inputPerMTok: 15, outputPerMTok: 75 },
  "claude-opus-5": { inputPerMTok: 15, outputPerMTok: 75 },
};

/** 정산되지 못한 예약을 좀비로 보고 회수하기까지의 시간. LLM 호출 1건보다 충분히 길다. */
const RESERVATION_TTL_MS = 15 * 60 * 1000;

const LEDGER_VERSION = 1;

export class BudgetExceededError extends Error {
  constructor(
    readonly requestedUsd: number,
    readonly availableUsd: number,
    readonly budgetUsd: number
  ) {
    super(
      `AI 예산 초과로 호출을 차단했습니다. ` +
        `요청 $${requestedUsd.toFixed(4)} > 잔여 $${availableUsd.toFixed(4)} ` +
        `(예산 $${budgetUsd.toFixed(2)})`
    );
    this.name = "BudgetExceededError";
  }
}

/**
 * 알 수 없는 모델은 알려진 단가 중 최고가로 계산한다.
 * 예산 가드에서 모르는 값은 "싸다"가 아니라 "비싸다"로 가정해야 안전하다.
 */
function pricingFor(model: string): { inputPerMTok: number; outputPerMTok: number } {
  const known = MODEL_PRICING[model];
  if (known) return known;
  const all = Object.values(MODEL_PRICING);
  return {
    inputPerMTok: Math.max(...all.map((p) => p.inputPerMTok)),
    outputPerMTok: Math.max(...all.map((p) => p.outputPerMTok)),
  };
}

export function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const p = pricingFor(model);
  return (
    (inputTokens / 1_000_000) * p.inputPerMTok +
    (outputTokens / 1_000_000) * p.outputPerMTok
  );
}

/** 한글은 토큰당 글자 수가 적어 보수적으로 잡는다(과소추정 방지). */
export function estimateInputTokens(text: string): number {
  return Math.ceil(text.length / 1.5) + 32;
}

interface LedgerEntry {
  id: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  at: number;
  label?: string;
}

interface Reservation {
  costUsd: number;
  model: string;
  at: number;
  label?: string;
}

interface Ledger {
  version: number;
  entries: LedgerEntry[];
  reservations: Record<string, Reservation>;
}

export interface LedgerSnapshot {
  budgetUsd: number;
  spentUsd: number;
  reservedUsd: number;
  availableUsd: number;
  callCount: number;
}

export interface ReserveInput {
  model: string;
  estimatedInputTokens: number;
  maxOutputTokens: number;
  label?: string;
}

export interface CostGuardOptions {
  filePath: string;
  budgetUsd: number;
  now?: () => number;
}

function emptyLedger(): Ledger {
  return { version: LEDGER_VERSION, entries: [], reservations: {} };
}

export class CostGuard {
  private readonly filePath: string;
  private readonly budgetUsd: number;
  private readonly now: () => number;
  /** 모든 읽기-수정-쓰기를 직렬화해 동시 예약이 예산을 초과 확약하지 못하게 한다. */
  private chain: Promise<unknown> = Promise.resolve();
  private seq = 0;

  constructor(opts: CostGuardOptions) {
    this.filePath = opts.filePath;
    this.budgetUsd = opts.budgetUsd;
    this.now = opts.now ?? Date.now;
  }

  async reserve(input: ReserveInput): Promise<string> {
    return this.locked(() => {
      const ledger = this.load();
      const cost = estimateCostUsd(
        input.model,
        input.estimatedInputTokens,
        input.maxOutputTokens
      );
      const available = this.availableOf(ledger);

      if (cost > available) {
        // 차단된 예약은 원장에 흔적을 남기지 않는다.
        throw new BudgetExceededError(cost, available, this.budgetUsd);
      }

      const id = `r${this.now()}-${this.seq++}`;
      ledger.reservations[id] = {
        costUsd: cost,
        model: input.model,
        at: this.now(),
        label: input.label,
      };
      this.save(ledger);
      return id;
    });
  }

  async settle(
    reservationId: string,
    actual: { inputTokens: number; outputTokens: number }
  ): Promise<void> {
    await this.locked(() => {
      const ledger = this.load();
      const reservation = ledger.reservations[reservationId];
      // 이미 정산·회수된 예약이면 중복 계상하지 않는다.
      if (!reservation) return;

      delete ledger.reservations[reservationId];
      ledger.entries.push({
        id: reservationId,
        model: reservation.model,
        inputTokens: actual.inputTokens,
        outputTokens: actual.outputTokens,
        costUsd: estimateCostUsd(
          reservation.model,
          actual.inputTokens,
          actual.outputTokens
        ),
        at: this.now(),
        label: reservation.label,
      });
      this.save(ledger);
    });
  }

  async release(reservationId: string): Promise<void> {
    await this.locked(() => {
      const ledger = this.load();
      if (!ledger.reservations[reservationId]) return;
      delete ledger.reservations[reservationId];
      this.save(ledger);
    });
  }

  async snapshot(): Promise<LedgerSnapshot> {
    return this.locked(() => {
      const ledger = this.load();
      // 좀비 예약 회수 결과를 원장에도 반영한다.
      this.save(ledger);
      const spentUsd = this.spentOf(ledger);
      const reservedUsd = this.reservedOf(ledger);
      return {
        budgetUsd: this.budgetUsd,
        spentUsd,
        reservedUsd,
        availableUsd: Math.max(0, this.budgetUsd - spentUsd - reservedUsd),
        callCount: ledger.entries.length,
      };
    });
  }

  /** 사람이 읽는 한 줄 요약 — 로그·보고서용. */
  async summary(): Promise<string> {
    const s = await this.snapshot();
    const pct = s.budgetUsd > 0 ? (s.spentUsd / s.budgetUsd) * 100 : 0;
    return (
      `AI 비용: $${s.spentUsd.toFixed(4)} / $${s.budgetUsd.toFixed(2)} ` +
      `(${pct.toFixed(1)}%, ${s.callCount}회 호출, 잔여 $${s.availableUsd.toFixed(4)})`
    );
  }

  private locked<T>(fn: () => T): Promise<T> {
    const run = this.chain.then(fn, fn);
    // 앞선 작업이 실패해도 체인이 끊기지 않게 한다.
    this.chain = run.catch(() => undefined);
    return run;
  }

  private spentOf(ledger: Ledger): number {
    return ledger.entries.reduce((sum, e) => sum + e.costUsd, 0);
  }

  private reservedOf(ledger: Ledger): number {
    return Object.values(ledger.reservations).reduce((sum, r) => sum + r.costUsd, 0);
  }

  private availableOf(ledger: Ledger): number {
    return Math.max(0, this.budgetUsd - this.spentOf(ledger) - this.reservedOf(ledger));
  }

  /** 원장을 읽고 만료된 예약을 회수한다. 파일이 없거나 손상됐으면 빈 원장에서 시작. */
  private load(): Ledger {
    let ledger: Ledger;
    try {
      const parsed = JSON.parse(readFileSync(this.filePath, "utf8")) as Partial<Ledger>;
      ledger = {
        version: LEDGER_VERSION,
        entries: Array.isArray(parsed.entries) ? parsed.entries : [],
        reservations:
          parsed.reservations && typeof parsed.reservations === "object"
            ? parsed.reservations
            : {},
      };
    } catch {
      // 파일 없음 또는 손상 — 안전하게 빈 원장. (손상 시 사용량을 0 으로 보는 편이
      // 호출을 영구 차단하는 것보다 낫고, 실제 과금은 콘솔 한도로도 이중 방어된다.)
      ledger = emptyLedger();
    }

    const cutoff = this.now() - RESERVATION_TTL_MS;
    for (const [id, r] of Object.entries(ledger.reservations)) {
      if (r.at < cutoff) delete ledger.reservations[id];
    }
    return ledger;
  }

  private save(ledger: Ledger): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
    // 원자적 교체 — 쓰기 도중 죽어도 원장이 반쪽으로 남지 않는다.
    const tmp = `${this.filePath}.tmp`;
    writeFileSync(tmp, JSON.stringify(ledger, null, 2), "utf8");
    renameSync(tmp, this.filePath);
  }
}

let singleton: CostGuard | null = null;

/** 기본 예산. AI_DRAFT_BUDGET_USD 로 오버라이드. */
export const DEFAULT_BUDGET_USD = 5;

export function getCostGuard(): CostGuard {
  if (singleton) return singleton;

  const parsed = Number(process.env.AI_DRAFT_BUDGET_USD);
  const budgetUsd =
    Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_BUDGET_USD;

  singleton = new CostGuard({
    filePath:
      process.env.AI_DRAFT_USAGE_FILE ?? join(process.cwd(), ".ai-draft-usage.json"),
    budgetUsd,
  });
  return singleton;
}

/** 테스트용 — 싱글턴 초기화. */
export function resetCostGuard(): void {
  singleton = null;
}

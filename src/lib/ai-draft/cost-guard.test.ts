import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  CostGuard,
  BudgetExceededError,
  estimateCostUsd,
  MODEL_PRICING,
} from "./cost-guard";

const HAIKU = "claude-haiku-4-5-20251001";

let dir: string;
let ledgerPath: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "pb-cost-"));
  ledgerPath = join(dir, "usage.json");
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function guard(budgetUsd = 5, now = () => 1_000_000): CostGuard {
  return new CostGuard({ filePath: ledgerPath, budgetUsd, now });
}

describe("estimateCostUsd", () => {
  it("Haiku 1M 입력 + 1M 출력 토큰 비용을 단가표대로 계산한다", () => {
    const price = MODEL_PRICING[HAIKU];
    expect(estimateCostUsd(HAIKU, 1_000_000, 1_000_000)).toBeCloseTo(
      price.inputPerMTok + price.outputPerMTok,
      6
    );
  });

  it("토큰 수에 비례한다", () => {
    const full = estimateCostUsd(HAIKU, 1_000_000, 0);
    expect(estimateCostUsd(HAIKU, 500_000, 0)).toBeCloseTo(full / 2, 6);
  });

  it("모르는 모델은 가장 비싼 단가로 보수적으로 계산한다", () => {
    const known = Object.values(MODEL_PRICING);
    const maxIn = Math.max(...known.map((p) => p.inputPerMTok));
    const maxOut = Math.max(...known.map((p) => p.outputPerMTok));
    expect(estimateCostUsd("some-future-model", 1_000_000, 1_000_000)).toBeCloseTo(
      maxIn + maxOut,
      6
    );
  });
});

describe("CostGuard 예약", () => {
  it("예산 안이면 예약을 허용하고 available 을 줄인다", async () => {
    const g = guard(5);
    await g.reserve({ model: HAIKU, estimatedInputTokens: 1000, maxOutputTokens: 1500 });

    const snap = await g.snapshot();
    expect(snap.reservedUsd).toBeGreaterThan(0);
    expect(snap.availableUsd).toBeLessThan(5);
    expect(snap.spentUsd).toBe(0);
  });

  it("예산을 넘기는 예약은 BudgetExceededError 로 차단한다", async () => {
    const g = guard(0.001);
    await expect(
      g.reserve({ model: HAIKU, estimatedInputTokens: 1_000_000, maxOutputTokens: 1_000_000 })
    ).rejects.toBeInstanceOf(BudgetExceededError);
  });

  it("차단된 예약은 원장에 아무것도 남기지 않는다", async () => {
    const g = guard(0.001);
    await g
      .reserve({ model: HAIKU, estimatedInputTokens: 1_000_000, maxOutputTokens: 1_000_000 })
      .catch(() => undefined);

    const snap = await g.snapshot();
    expect(snap.spentUsd).toBe(0);
    expect(snap.reservedUsd).toBe(0);
  });

  it("예약이 쌓여 예산을 채우면 다음 예약을 차단한다 (초과 확약 방지)", async () => {
    // 예약 1건당 worst-case 비용의 2.5배만 예산으로 잡아 2건까지만 통과하게 한다.
    const per = estimateCostUsd(HAIKU, 1000, 1500);
    const g = guard(per * 2.5);

    await g.reserve({ model: HAIKU, estimatedInputTokens: 1000, maxOutputTokens: 1500 });
    await g.reserve({ model: HAIKU, estimatedInputTokens: 1000, maxOutputTokens: 1500 });
    await expect(
      g.reserve({ model: HAIKU, estimatedInputTokens: 1000, maxOutputTokens: 1500 })
    ).rejects.toBeInstanceOf(BudgetExceededError);
  });

  it("동시 예약이 예산을 초과 확약하지 않는다", async () => {
    const per = estimateCostUsd(HAIKU, 1000, 1500);
    const g = guard(per * 2.5);

    const results = await Promise.allSettled(
      Array.from({ length: 6 }, () =>
        g.reserve({ model: HAIKU, estimatedInputTokens: 1000, maxOutputTokens: 1500 })
      )
    );

    const ok = results.filter((r) => r.status === "fulfilled").length;
    expect(ok).toBe(2);

    const snap = await g.snapshot();
    expect(snap.reservedUsd).toBeLessThanOrEqual(per * 2.5);
  });
});

describe("CostGuard 정산", () => {
  it("실사용으로 정산하면 예약이 풀리고 실제 비용만 남는다", async () => {
    const g = guard(5);
    const id = await g.reserve({
      model: HAIKU,
      estimatedInputTokens: 1000,
      maxOutputTokens: 1500,
    });
    await g.settle(id, { inputTokens: 900, outputTokens: 300 });

    const snap = await g.snapshot();
    expect(snap.reservedUsd).toBe(0);
    expect(snap.spentUsd).toBeCloseTo(estimateCostUsd(HAIKU, 900, 300), 8);
    expect(snap.callCount).toBe(1);
  });

  it("release 하면 예약이 전액 반환된다", async () => {
    const g = guard(5);
    const id = await g.reserve({
      model: HAIKU,
      estimatedInputTokens: 1000,
      maxOutputTokens: 1500,
    });
    await g.release(id);

    const snap = await g.snapshot();
    expect(snap.reservedUsd).toBe(0);
    expect(snap.spentUsd).toBe(0);
    expect(snap.availableUsd).toBeCloseTo(5, 8);
  });

  it("같은 예약을 두 번 정산해도 비용이 중복 계상되지 않는다", async () => {
    const g = guard(5);
    const id = await g.reserve({
      model: HAIKU,
      estimatedInputTokens: 1000,
      maxOutputTokens: 1500,
    });
    await g.settle(id, { inputTokens: 900, outputTokens: 300 });
    await g.settle(id, { inputTokens: 900, outputTokens: 300 });

    const snap = await g.snapshot();
    expect(snap.callCount).toBe(1);
    expect(snap.spentUsd).toBeCloseTo(estimateCostUsd(HAIKU, 900, 300), 8);
  });
});

describe("CostGuard 지속성", () => {
  it("사용량이 파일에 남아 새 인스턴스에서도 이어진다", async () => {
    const g1 = guard(5);
    const id = await g1.reserve({
      model: HAIKU,
      estimatedInputTokens: 1000,
      maxOutputTokens: 1500,
    });
    await g1.settle(id, { inputTokens: 1000, outputTokens: 500 });

    const g2 = guard(5);
    const snap = await g2.snapshot();
    expect(snap.spentUsd).toBeCloseTo(estimateCostUsd(HAIKU, 1000, 500), 8);
    expect(snap.callCount).toBe(1);
  });

  it("누적 사용량이 예산을 채우면 새 인스턴스도 차단한다", async () => {
    const per = estimateCostUsd(HAIKU, 100_000, 100_000);
    const g1 = guard(per * 1.5);
    const id = await g1.reserve({
      model: HAIKU,
      estimatedInputTokens: 100_000,
      maxOutputTokens: 100_000,
    });
    await g1.settle(id, { inputTokens: 100_000, outputTokens: 100_000 });

    const g2 = guard(per * 1.5);
    await expect(
      g2.reserve({ model: HAIKU, estimatedInputTokens: 100_000, maxOutputTokens: 100_000 })
    ).rejects.toBeInstanceOf(BudgetExceededError);
  });

  it("원장 파일이 손상돼도 크래시하지 않고 안전하게 0 부터 시작한다", async () => {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(ledgerPath, "{ not json", "utf8");

    const g = guard(5);
    const snap = await g.snapshot();
    expect(snap.spentUsd).toBe(0);
  });

  it("원장에 개별 호출 내역을 감사 가능하게 기록한다", async () => {
    const g = guard(5);
    const id = await g.reserve({
      model: HAIKU,
      estimatedInputTokens: 1000,
      maxOutputTokens: 1500,
      label: "draft:generate",
    });
    await g.settle(id, { inputTokens: 900, outputTokens: 300 });

    const raw = JSON.parse(readFileSync(ledgerPath, "utf8")) as {
      entries: Array<{ label?: string; model: string; costUsd: number }>;
    };
    expect(raw.entries).toHaveLength(1);
    expect(raw.entries[0].label).toBe("draft:generate");
    expect(raw.entries[0].model).toBe(HAIKU);
    expect(raw.entries[0].costUsd).toBeGreaterThan(0);
  });
});

describe("CostGuard 좀비 예약 회수", () => {
  it("오래된 예약은 만료 처리해 예산을 되돌린다", async () => {
    let clock = 1_000_000;
    const g1 = new CostGuard({ filePath: ledgerPath, budgetUsd: 5, now: () => clock });
    await g1.reserve({ model: HAIKU, estimatedInputTokens: 1000, maxOutputTokens: 1500 });
    expect((await g1.snapshot()).reservedUsd).toBeGreaterThan(0);

    // 프로세스가 죽어 정산되지 못한 예약 — TTL 경과 후 회수되어야 한다.
    clock += 60 * 60 * 1000;
    const g2 = new CostGuard({ filePath: ledgerPath, budgetUsd: 5, now: () => clock });
    const snap = await g2.snapshot();
    expect(snap.reservedUsd).toBe(0);
    expect(snap.availableUsd).toBeCloseTo(5, 8);
  });
});

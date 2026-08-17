import type { DraftProvider } from "@/lib/ai-draft/provider";
import type { ProductFacts, VoiceCopy } from "@/lib/ai-draft/recipe";

/**
 * 생성 → 비평 → 재생성 품질 루프 (bounded).
 *
 * 설계 원칙:
 *   - **유한하다.** maxAttempts 를 넘지 않는다. "좋아질 때까지" 는 비용이 무한대다.
 *   - **최선을 잃지 않는다.** 재생성이 오히려 나빠질 수 있으므로 시도 중 최고점을 남긴다.
 *   - **수확체감에서 멈춘다.** 점수가 나아지지 않으면 남은 시도를 쓰지 않는다.
 *   - **비평 실패가 생성 실패가 아니다.** 비평가가 죽어도 카피는 나와야 한다.
 *
 * 그래프 라이브러리를 쓰지 않은 이유: 분기가 "통과/재시도/중단" 세 갈래뿐이고
 * 사이클이 단일하다. 이 규모에서 LangGraph 류를 얹는 것은 오버엔지니어링이다.
 */

export interface CriticInput {
  voice: VoiceCopy;
  facts: ProductFacts;
}

export interface CriticVerdict {
  score: number;
  passed: boolean;
  /** 미달 시 재생성 프롬프트에 넣을 구체적 수정 지시 */
  feedback: string;
  /** 비평가별 부가 정보 (감사용) */
  detail?: unknown;
}

export interface QualityCritic {
  name: string;
  evaluate(input: CriticInput): Promise<CriticVerdict>;
}

export interface AttemptVerdict extends Partial<CriticVerdict> {
  critic: string;
  /** 비평가가 터진 경우의 메시지. 있으면 이 비평은 판정에서 제외된다. */
  error?: string;
}

export interface AttemptRecord {
  attempt: number;
  score: number;
  passed: boolean;
  voice: VoiceCopy;
  verdicts: AttemptVerdict[];
  feedback: string;
}

export interface QualityLoopInput {
  facts: ProductFacts;
  provider: DraftProvider;
  critics: QualityCritic[];
  maxAttempts: number;
  /** 점수가 개선되지 않으면 남은 시도를 포기한다. */
  stopWhenNoImprovement?: boolean;
  /** 운영자 반려 의견 — 첫 시도부터 반영한다. */
  operatorFeedback?: string | null;
  /**
   * 반려된 직전 초안의 보이스. 전면 재작성이 아니라 수정 기반 재생성이 되도록
   * 첫 시도부터 모델에 넘긴다.
   */
  initialPreviousVoice?: VoiceCopy | null;
}

export interface QualityLoopResult {
  voice: VoiceCopy;
  generator: string;
  rawMeta?: Record<string, unknown>;
  passed: boolean;
  /** 채택된 보이스의 종합 점수 */
  bestScore: number;
  attempts: number;
  stoppedEarly: boolean;
  history: AttemptRecord[];
  /** 재생성 도중 생성기가 실패한 경우의 메시지 (최초 시도 실패는 throw) */
  generationError?: string;
}

/** 비평가 여럿의 판정을 하나로 합친다. 가장 낮은 점수를 종합 점수로 본다. */
function combine(verdicts: AttemptVerdict[]): {
  score: number;
  passed: boolean;
  feedback: string;
} {
  const usable = verdicts.filter((v) => !v.error && typeof v.score === "number");

  // 전부 실패했으면 판정 불가 — 통과시키지 않되 점수는 0 으로 두지 않는다.
  if (usable.length === 0) {
    return { score: 0, passed: false, feedback: "" };
  }

  const score = Math.min(...usable.map((v) => v.score as number));
  const passed = usable.every((v) => v.passed === true);
  const feedback = usable
    .filter((v) => v.feedback)
    .map((v) => v.feedback as string)
    .join("\n\n");

  return { score, passed, feedback };
}

async function evaluateAll(
  critics: QualityCritic[],
  input: CriticInput
): Promise<AttemptVerdict[]> {
  const settled = await Promise.allSettled(
    critics.map((c) => c.evaluate(input))
  );

  return settled.map((s, i) => {
    const name = critics[i].name;
    if (s.status === "fulfilled") return { critic: name, ...s.value };
    return {
      critic: name,
      error: s.reason instanceof Error ? s.reason.message : String(s.reason),
    };
  });
}

export async function runQualityLoop(
  input: QualityLoopInput
): Promise<QualityLoopResult> {
  const {
    facts,
    provider,
    critics,
    maxAttempts,
    stopWhenNoImprovement = false,
    operatorFeedback = null,
    initialPreviousVoice = null,
  } = input;

  const history: AttemptRecord[] = [];
  let best: { record: AttemptRecord; generator: string; rawMeta?: Record<string, unknown> } | null =
    null;
  let stoppedEarly = false;
  let generationError: string | undefined;
  let previousVoice: VoiceCopy | null = initialPreviousVoice;
  let carriedFeedback: string | null = operatorFeedback;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let output;
    try {
      output = await provider.generate({
        facts,
        feedback: carriedFeedback,
        previousVoice,
      });
    } catch (e) {
      // 첫 시도부터 실패하면 돌려줄 카피가 없다 — 조용히 삼키지 않고 그대로 던진다.
      if (best === null) throw e;
      generationError = e instanceof Error ? e.message : String(e);
      break;
    }

    const verdicts = await evaluateAll(critics, { voice: output.voice, facts });
    const combined = combine(verdicts);

    const record: AttemptRecord = {
      attempt,
      score: combined.score,
      passed: combined.passed,
      voice: output.voice,
      verdicts,
      feedback: combined.feedback,
    };
    history.push(record);

    const isBetter = best === null || record.score > best.record.score;
    if (isBetter) {
      best = { record, generator: output.generator, rawMeta: output.rawMeta };
    }

    if (combined.passed) break;

    if (attempt < maxAttempts) {
      // 재생성해도 나아지지 않았다면 남은 시도를 쓰지 않는다.
      if (stopWhenNoImprovement && !isBetter) {
        stoppedEarly = true;
        break;
      }
      previousVoice = output.voice;
      carriedFeedback = [operatorFeedback, combined.feedback]
        .filter(Boolean)
        .join("\n\n");
    }
  }

  // 루프는 최소 1회 생성하거나 throw 한다 — best 는 여기서 항상 존재한다.
  if (best === null) {
    throw new Error("품질 루프가 카피를 생성하지 못했습니다");
  }

  return {
    voice: best.record.voice,
    generator: best.generator,
    rawMeta: best.rawMeta,
    passed: best.record.passed,
    bestScore: best.record.score,
    attempts: history.length,
    stoppedEarly,
    history,
    generationError,
  };
}

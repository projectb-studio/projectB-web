import { lintVoice, violationsToFeedback } from "@/lib/ai-draft/voice-lint";
import { LlmJudge } from "@/lib/ai-draft/llm-judge";
import type { CriticInput, CriticVerdict, QualityCritic } from "@/lib/ai-draft/quality-loop";

/**
 * 품질 루프에 꽂을 비평가 구성.
 *
 * 반복 횟수는 2회가 상한이다. Self-Refine 계열 연구가 반복 이득이 초기에 몰린다고
 * 보고하고(수확체감), 우리는 한국어 카피에서 검증된 바가 없으며, 매 반복이 실제
 * 과금이기 때문이다. 점수가 나아지지 않으면 남은 시도도 쓰지 않는다.
 */
export const MAX_QUALITY_ATTEMPTS = 2;

/** 결정론적 린터를 비평가 인터페이스로 감싼다. 비용이 들지 않으므로 항상 켠다. */
export class LintCritic implements QualityCritic {
  readonly name = "voice-lint";

  async evaluate(input: CriticInput): Promise<CriticVerdict> {
    const result = lintVoice(input.voice, input.facts);
    return {
      score: result.score,
      passed: result.passed,
      feedback: violationsToFeedback(result.violations),
      detail: { violations: result.violations },
    };
  }
}

/**
 * 비평가 목록을 만든다.
 *
 * LLM 판정은 유료라 키가 있을 때만 붙인다. 키가 없으면 린터만으로도 사실 침범·
 * 브랜드 톤·상투어는 걸러지므로 전체 흐름은 그대로 동작한다.
 */
export function buildCritics(options: { useLlmJudge?: boolean } = {}): QualityCritic[] {
  const critics: QualityCritic[] = [new LintCritic()];

  const useJudge = options.useLlmJudge ?? Boolean(process.env.ANTHROPIC_API_KEY);
  if (useJudge) critics.push(new LlmJudge());

  return critics;
}

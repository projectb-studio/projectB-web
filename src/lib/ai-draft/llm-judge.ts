import { callAnthropic, type AnthropicCallInput, type AnthropicCallResult } from "@/lib/ai-draft/anthropic-client";
import type { ProductFacts, VoiceCopy } from "@/lib/ai-draft/recipe";
import type { CriticInput, CriticVerdict, QualityCritic } from "@/lib/ai-draft/quality-loop";

/**
 * LLM 비평가 (LLM-as-judge).
 *
 * 결정론적 린터가 잡지 못하는 주관적 품질 — 후킹이 되는가, 이 상품에만 맞는
 * 카피인가, 한국어가 자연스러운가 — 를 판정한다.
 *
 * 알려진 판정 편향에 대한 방어:
 *   1. **자기선호 편향** — 생성 모델과 다른 모델로 판정한다. 모델은 자기 출력을
 *      알아보고 후하게 준다(Panickssery et al., NeurIPS 2024).
 *   2. **사후합리화** — 스키마에서 reasoning 을 점수보다 앞에 둔다. 점수를 먼저
 *      뱉으면 근거가 점수를 정당화하는 방향으로 붙는다(G-Eval, MEC).
 *   3. **점수 편중** — 객관 축은 binary, 주관 축만 0~5 로 나눈다. 판정자가 실제로
 *      구분하지 못하는 해상도에 점수를 주면 노이즈만 늘어난다.
 *   4. **장황함 편향** — 길이는 평가 대상이 아님을 프롬프트에 명시한다.
 */

/** 판정 모델 — 생성기(Haiku)와 달라야 한다. */
const DEFAULT_JUDGE_MODEL =
  process.env.AI_JUDGE_MODEL ?? "claude-sonnet-4-5-20250929";

const MAX_TOKENS = 1200;

/** 주관 3축 평균이 이 값 미만이면 통과시키지 않는다. */
const DEFAULT_MIN_SUBJECTIVE_AVG = 4;

const binaryAxis = (description: string) => ({
  type: "object",
  description,
  properties: {
    passed: { type: "boolean" },
    evidence: {
      type: "string",
      description: "실패 시 문제가 된 카피 문구를 그대로 인용. 통과면 빈 문자열.",
    },
  },
  required: ["passed", "evidence"],
  additionalProperties: false,
});

const scoredAxis = (description: string) => ({
  type: "object",
  description,
  properties: {
    score: {
      type: "integer",
      enum: [0, 1, 2, 3, 4, 5],
      description: "0=전혀 아님, 3=평범, 5=아주 좋음",
    },
    comment: { type: "string", description: "그 점수를 준 한 줄 이유" },
  },
  required: ["score", "comment"],
  additionalProperties: false,
});

/**
 * 판정 출력 스키마.
 * 주의: Structured Outputs 는 minLength/maxLength/minimum/maximum 을 지원하지
 * 않는다. 점수 범위는 enum 으로, 길이 규칙은 코드 검증으로 처리한다.
 */
export const JUDGE_SCHEMA = {
  type: "object",
  properties: {
    // 근거를 먼저 쓰게 해서 점수가 근거를 따라오게 한다.
    reasoning: {
      type: "string",
      description: "각 축을 어떻게 봤는지 먼저 서술. 점수는 이 판단의 결과여야 한다.",
    },
    factIntrusion: binaryAxis(
      "카피가 입력 사실값에 없는 수치·소재·관리법·가격을 단정했는가. 단정했으면 passed=false."
    ),
    structure: binaryAxis(
      "한 줄 컨셉이 있고, 컨셉 본문이 문단을 이루며, 핵심 포인트가 2~3개인가."
    ),
    brandVoice: scoredAxis(
      "절제된 산업적 미니멀 톤인가. 과장·감탄·상투어가 없는가."
    ),
    productSpecificity: scoredAxis(
      "이 카피를 다른 상품에 그대로 붙여도 말이 되면 낮은 점수. 이 상품에만 맞을수록 높은 점수."
    ),
    koreanQuality: scoredAxis(
      "번역투·AI 티가 없는 자연스러운 한국어인가."
    ),
    revisionInstruction: {
      type: "string",
      description:
        "통과가 아니면, 무엇을 어떻게 고칠지 카피라이터에게 줄 구체적 지시. 통과면 빈 문자열.",
    },
  },
  required: [
    "reasoning",
    "factIntrusion",
    "structure",
    "brandVoice",
    "productSpecificity",
    "koreanQuality",
    "revisionInstruction",
  ],
  additionalProperties: false,
} as const satisfies {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
};

const SYSTEM_PROMPT = `당신은 한국 핸드메이드 소품 쇼핑몰의 상세페이지 카피를 심사하는 편집장이다.

브랜드 톤 기준: 산업적 미니멀. 절제되고 단정한 평서문. 과장·감탄·이모지 없음.
'기능 → 혜택' 순으로 쓰되, 혜택은 과장이 아니라 구체적 장면이어야 한다.

심사 방법:
1. 먼저 reasoning 에 각 축을 어떻게 봤는지 서술한다. 점수는 그 판단의 결과여야 한다.
2. factIntrusion 과 structure 는 사실 판정이므로 통과/실패로만 답한다.
3. 나머지 세 축은 0~5 로 매긴다. 3 이 평범, 5 는 그대로 발행해도 좋은 수준이다.

주의:
- 길이는 평가 대상이 아니다. 짧다고 감점하지 말고, 길다고 가점하지 마라.
- 상투어를 특히 엄격히 보라. "일상", "고민 없이", "어디에나 어울리는", "특별한 순간",
  "당신의 공간" 처럼 어느 상품에나 붙는 표현은 productSpecificity 감점 사유다.
- 사실 침범 판정은 반드시 아래 '운영자 입력 사실값'과 대조해서 한다. 사실값에 없는
  수치·소재·관리법·제작기법이 카피에 있으면 factIntrusion.passed = false 다.

사실 침범의 경계 (이걸 정확히 지켜라):
- 침범이다 — 치수·무게·용량, 소재 구성이나 비율, 원산지, 세탁·관리 방법, 인증,
  구성품 개수, 가격, 그리고 **제작 기법**(손바느질·물레·용접·염색 등).
  이것들은 확인 가능한 주장이라 틀리면 소비자를 오인하게 만든다.
- 침범이 아니다 — 그 소재라면 일반적으로 알려진 성질(나무는 결이 제각각이다,
  황동은 시간이 지나면 어두워진다, 리넨은 쓸수록 부드러워진다), 용도에 대한 서술,
  사용 장면 묘사, 주관적 인상. 이런 건 지어낸 사실이 아니라 카피의 몫이다.

즉 "이 상품이 그렇다고 검증해야 하는 주장"만 침범이고, "이 소재가 원래 그렇다"는
침범이 아니다.`;

export interface JudgeOutput {
  reasoning: string;
  factIntrusion: { passed: boolean; evidence: string };
  structure: { passed: boolean; evidence: string };
  brandVoice: { score: number; comment: string };
  productSpecificity: { score: number; comment: string };
  koreanQuality: { score: number; comment: string };
  revisionInstruction: string;
}

/** 주관 3축(0~5) 평균을 10점 만점으로 환산. */
export function judgeScoreToTen(
  brandVoice: number,
  productSpecificity: number,
  koreanQuality: number
): number {
  const avg = (brandVoice + productSpecificity + koreanQuality) / 3;
  return (avg / 5) * 10;
}

export type CallImpl = (
  input: AnthropicCallInput,
  options?: { apiKey?: string }
) => Promise<AnthropicCallResult>;

export interface LlmJudgeOptions {
  model?: string;
  minSubjectiveAvg?: number;
  callImpl?: CallImpl;
  apiKey?: string;
}

function renderVoice(voice: VoiceCopy): string {
  const points = voice.points
    .map((p, i) => `  ${i + 1}. ${p.title} — ${p.bodyHtml}`)
    .join("\n");
  return [
    `한 줄 컨셉: ${voice.heroCaption}`,
    `컨셉 본문: ${voice.conceptHtml}`,
    `핵심 포인트:`,
    points,
  ].join("\n");
}

function renderFacts(facts: ProductFacts): string {
  return [
    `상품명: ${facts.name}`,
    `태그: ${facts.tag}`,
    `설명: ${facts.description ?? "(없음)"}`,
    `스펙: ${facts.details ?? "(없음)"}`,
    `관리: ${facts.care ?? "(없음)"}`,
  ].join("\n");
}

function parseJudge(text: string): JudgeOutput {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("판정 출력에서 JSON 을 찾지 못함");
  }
  const obj = JSON.parse(text.slice(start, end + 1)) as Partial<JudgeOutput>;

  const hasBinary = (v: unknown): v is { passed: boolean; evidence: string } =>
    typeof v === "object" && v !== null && typeof (v as { passed?: unknown }).passed === "boolean";
  const hasScore = (v: unknown): v is { score: number; comment: string } =>
    typeof v === "object" && v !== null && typeof (v as { score?: unknown }).score === "number";

  if (
    typeof obj.reasoning !== "string" ||
    !hasBinary(obj.factIntrusion) ||
    !hasBinary(obj.structure) ||
    !hasScore(obj.brandVoice) ||
    !hasScore(obj.productSpecificity) ||
    !hasScore(obj.koreanQuality)
  ) {
    throw new Error("판정 출력이 스키마와 불일치");
  }

  return {
    reasoning: obj.reasoning,
    factIntrusion: obj.factIntrusion,
    structure: obj.structure,
    brandVoice: obj.brandVoice,
    productSpecificity: obj.productSpecificity,
    koreanQuality: obj.koreanQuality,
    revisionInstruction: typeof obj.revisionInstruction === "string" ? obj.revisionInstruction : "",
  };
}

export class LlmJudge implements QualityCritic {
  readonly name = "llm-judge";
  private readonly model: string;
  private readonly minSubjectiveAvg: number;
  private readonly call: CallImpl;
  private readonly apiKey?: string;

  constructor(options: LlmJudgeOptions = {}) {
    this.model = options.model ?? DEFAULT_JUDGE_MODEL;
    this.minSubjectiveAvg = options.minSubjectiveAvg ?? DEFAULT_MIN_SUBJECTIVE_AVG;
    this.call = options.callImpl ?? callAnthropic;
    this.apiKey = options.apiKey;
  }

  async evaluate(input: CriticInput): Promise<CriticVerdict> {
    const user = [
      "## 운영자 입력 사실값 (이것만이 사실이다)",
      renderFacts(input.facts),
      "",
      "## 심사할 카피",
      renderVoice(input.voice),
    ].join("\n");

    const res = await this.call(
      {
        model: this.model,
        system: SYSTEM_PROMPT,
        user,
        maxTokens: MAX_TOKENS,
        label: "draft:judge",
        jsonSchema: JUDGE_SCHEMA as unknown as Record<string, unknown>,
      },
      this.apiKey ? { apiKey: this.apiKey } : undefined
    );

    const out = parseJudge(res.text);

    const subjectiveAvg =
      (out.brandVoice.score + out.productSpecificity.score + out.koreanQuality.score) / 3;

    const passed =
      out.factIntrusion.passed &&
      out.structure.passed &&
      subjectiveAvg >= this.minSubjectiveAvg;

    // 객관 축이 깨지면 주관 점수가 아무리 높아도 발행 후보가 아니다.
    const score = out.factIntrusion.passed && out.structure.passed
      ? judgeScoreToTen(
          out.brandVoice.score,
          out.productSpecificity.score,
          out.koreanQuality.score
        )
      : 0;

    return { score, passed, feedback: buildFeedback(out, passed), detail: out };
  }
}

function buildFeedback(out: JudgeOutput, passed: boolean): string {
  if (passed) return "";

  const lines: string[] = [];
  if (!out.factIntrusion.passed) {
    lines.push(
      `- 사실 침범: 입력에 없는 사실을 카피가 단정했다. 문제 문구: "${out.factIntrusion.evidence}"`
    );
  }
  if (!out.structure.passed) {
    lines.push(`- 구조 위반: ${out.structure.evidence}`);
  }
  for (const [label, axis] of [
    ["브랜드 톤", out.brandVoice],
    ["상품 고유성", out.productSpecificity],
    ["한국어 품질", out.koreanQuality],
  ] as const) {
    if (axis.score < 4) lines.push(`- ${label}(${axis.score}/5): ${axis.comment}`);
  }
  if (out.revisionInstruction) lines.push(out.revisionInstruction);

  return lines.join("\n");
}

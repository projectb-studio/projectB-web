import type { DraftProvider, GenerateInput, GenerateOutput } from "@/lib/ai-draft/provider";
import type { VoiceCopy } from "@/lib/ai-draft/recipe";
import { callAnthropic } from "@/lib/ai-draft/anthropic-client";

/**
 * 실제 LLM Provider (Anthropic Messages API).
 *
 * 환경변수 ANTHROPIC_API_KEY 가 있을 때만 팩토리가 이 Provider 를 선택한다.
 * 모델은 "보이스 카피"만 생성하며, 사실값·이미지·레이아웃은 레시피가 통제한다.
 * 출력은 엄격한 JSON 스키마로 강제하고, 파싱 실패 시 throw 한다(환각 격리).
 * 실제 호출은 비용 가드가 걸린 공용 클라이언트를 통해서만 나간다.
 */
// 카피 생성은 경량 작업 → 비용·품질 균형상 Haiku 가 기본값. AI_DRAFT_MODEL 로 오버라이드.
const MODEL = process.env.AI_DRAFT_MODEL ?? "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1500;

/**
 * 출력 스키마 (Structured Outputs).
 * 길이·개수 제약은 이 스키마로 강제되지 않으므로(minLength/minItems≥2 미지원)
 * parseVoice 와 voice-lint 가 이중으로 검증한다.
 */
export const VOICE_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    heroCaption: {
      type: "string",
      description: "후킹 한 줄. 40자 이내. 컨셉 설명이 아니라 고객이 얻는 것을 말한다.",
    },
    problemHtml: {
      type: "string",
      description:
        "이 상품이 없을 때의 불편을 짚고 해결로 잇는 <p>...</p> 1~2개. 겁주지 말고 담담하게.",
    },
    conceptHtml: {
      type: "string",
      description: "컨셉·제작 스토리 <p>...</p> 1~3개. 어떻게 만들어졌는지에 무게를 둔다.",
    },
    points: {
      type: "array",
      description: "핵심 포인트 2~3개",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "24자 이내" },
          bodyHtml: { type: "string", description: "<p>...</p> 1개" },
        },
        required: ["title", "bodyHtml"],
        additionalProperties: false,
      },
    },
    closingHtml: {
      type: "string",
      description: "마무리 <p>...</p> 1개. 재촉하지 않고 한 문장으로 닫는다.",
    },
  },
  required: ["heroCaption", "problemHtml", "conceptHtml", "points", "closingHtml"],
  additionalProperties: false,
};

/**
 * few-shot 예시.
 *
 * 추상적인 톤 형용사("산업적 미니멀")만으로는 문체가 잡히지 않는다. 공식 가이드가
 * 권장하는 대로 3건을 서로 다른 카테고리(패브릭·메탈·우드)에서 뽑아, 한 카테고리
 * 패턴에 과적합되지 않게 한다.
 */
const EXAMPLES = `<examples>
<example>
입력: 리넨 테이블러너 — 아이보리 / fabric / 워싱 가공한 리넨. 쓸수록 결이 부드러워짐.
출력:
{
  "heroCaption": "식탁에 결을 더하는 한 장",
  "problemHtml": "<p>식탁이 휑해 보여 무언가 깔고 싶지만, 매트는 자리를 많이 차지합니다.</p><p>러너 한 장이면 식탁의 인상만 바꿉니다.</p>",
  "conceptHtml": "<p>짜고 나서 한 번 더 워싱을 거칩니다. 새것 특유의 뻣뻣함 없이 처음부터 손에 감깁니다.</p><p>쓸수록 결이 눕고 색이 자리를 잡습니다.</p>",
  "points": [
    { "title": "첫날부터 부드러운 결", "bodyHtml": "<p>워싱을 거쳐 길들이는 시간이 필요하지 않습니다.</p>" },
    { "title": "빨아 쓸수록 자리잡는 색", "bodyHtml": "<p>세탁을 반복해도 색이 빠지기보다 톤이 차분해집니다.</p>" }
  ],
  "closingHtml": "<p>식탁을 바꾸지 않고 식탁의 인상을 바꾸는 방법입니다.</p>"
}
</example>
<example>
입력: 황동 캔들홀더 세트 / metal / 황동을 깎아 만듦. 시간이 지나면 표면이 어둡게 익음.
출력:
{
  "heroCaption": "쓸수록 색이 깊어지는 자리",
  "problemHtml": "<p>초를 켜 두면 촛농이 흐르고, 받침이 없으면 자리가 지저분해집니다.</p><p>받침 하나로 정리됩니다.</p>",
  "conceptHtml": "<p>황동 덩어리를 깎아 형태를 냅니다. 표면은 시간이 지나며 어둡게 익습니다.</p><p>변색은 흠이 아니라 이 소재가 나이 드는 방식입니다.</p>",
  "points": [
    { "title": "익어가는 표면", "bodyHtml": "<p>처음의 밝은 금빛에서 점차 깊은 색으로 바뀝니다.</p>" },
    { "title": "높이가 다른 두 개", "bodyHtml": "<p>나란히 두면 불빛의 층이 생깁니다.</p>" }
  ],
  "closingHtml": "<p>오래 두고 색이 변해가는 것을 지켜보는 물건입니다.</p>"
}
</example>
<example>
입력: 오크 원목 트레이 / wood / 오크 원목을 깎아 만든 트레이. (그 외 정보 없음)
출력:
{
  "heroCaption": "옮기는 김에 정리되는 자리",
  "problemHtml": "<p>컵과 주전자를 따로 나르다 보면 손이 모자랍니다.</p><p>한 번에 옮기고, 그대로 두면 자리가 됩니다.</p>",
  "conceptHtml": "<p>오크를 깎아 테두리를 세웠습니다. 나뭇결이 판마다 달라 같은 무늬가 없습니다.</p>",
  "points": [
    { "title": "판마다 다른 결", "bodyHtml": "<p>같은 나무에서 나와도 무늬가 겹치지 않습니다.</p>" },
    { "title": "두고 쓰는 받침", "bodyHtml": "<p>옮긴 뒤 치우지 않아도 자리로 남습니다.</p>" }
  ],
  "closingHtml": "<p>나르는 물건이면서 놓아두는 물건입니다.</p>"
}
</example>
</examples>`;

const SYSTEM_PROMPT = `당신은 한국 핸드메이드 소품 쇼핑몰의 상세페이지 카피라이터다.

## 쓰는 방식
- 평서형으로 끝낸다. 형용사는 문장당 1개 이하로 쓴다.
- 눈에 보이는 것과 손에 닿는 것을 쓴다. 감상은 독자가 하게 둔다.
- 기능을 먼저 말하고, 그것이 만드는 장면을 잇는다.
- 한 문장은 한 가지만 말한다.
- 핸드메이드는 "어떻게 만들어졌는가"가 유일한 차별점이다. 제작 방식에 무게를 둔다.

## 쓸 수 있는 것
분위기, 사용 장면, 감각적 인상, 제작 방식에 대한 서술.

## 상투어 대신 구체를 쓴다
아래 표현은 어느 상품에나 붙어서 아무것도 말하지 않는다. 쓰지 않는다.
"일상 속", "고민 없이", "어디에나 어울리는", "특별한 순간", "당신의 공간",
"부담 없이", "센스 있는", "감각적인", "공간을 완성", "매력을 더해"
→ 대신 그 상품에만 해당하는 장면을 쓴다.

## 사실 금지 (가장 중요)
- 소재·치수·무게·원산지·세탁법 같은 사실은 절대 지어내지 마라.
- 가격·할인·재고·배송일 같은 수치도 만들지 마라.
- 숫자와 단위는 카피에 쓰지 않는다.
- 입력에 주어진 사실만 언급할 수 있고, 확실하지 않으면 아예 언급하지 않는다.
  (이 정보들은 별도의 스펙표가 담당하므로 카피가 대신할 필요가 없다.)

${EXAMPLES}`;

export class AnthropicDraftProvider implements DraftProvider {
  constructor(private readonly apiKey: string) {}

  async generate(input: GenerateInput): Promise<GenerateOutput> {
    const { facts, feedback, previousVoice } = input;

    const userParts: string[] = [
      `상품명: ${facts.name}`,
      `태그: ${facts.tag}`,
      facts.description ? `상품 설명: ${facts.description}` : "",
      previousVoice
        ? `이전 초안 카피(JSON): ${JSON.stringify(previousVoice)}`
        : "",
      feedback?.trim() ? `운영자 반려 의견(반드시 반영): ${feedback.trim()}` : "",
      "위 정보를 바탕으로 스키마에 맞는 JSON 카피를 작성하라.",
    ].filter(Boolean);

    const res = await callAnthropic(
      {
        model: MODEL,
        system: SYSTEM_PROMPT,
        user: userParts.join("\n"),
        maxTokens: MAX_TOKENS,
        label: "draft:generate",
        jsonSchema: VOICE_SCHEMA,
      },
      { apiKey: this.apiKey }
    );

    const voice = parseVoice(res.text);

    return {
      voice,
      generator: `anthropic:${MODEL}`,
      rawMeta: {
        inputTokens: res.inputTokens,
        outputTokens: res.outputTokens,
        appliedFeedback: feedback?.trim() ? true : false,
      },
    };
  }
}

/** 모델 출력에서 JSON 을 추출·검증. 스키마 불일치 시 throw → 발행 경로로 새지 않음. */
function parseVoice(text: string): VoiceCopy {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("LLM 출력에서 JSON 을 찾지 못함");
  }
  const obj = JSON.parse(text.slice(start, end + 1)) as unknown;
  if (
    typeof obj !== "object" ||
    obj === null ||
    typeof (obj as Record<string, unknown>).heroCaption !== "string" ||
    typeof (obj as Record<string, unknown>).conceptHtml !== "string" ||
    !Array.isArray((obj as Record<string, unknown>).points)
  ) {
    throw new Error("LLM 출력이 VoiceCopy 스키마와 불일치");
  }
  const o = obj as {
    heroCaption: string;
    conceptHtml: string;
    points: unknown[];
    problemHtml?: unknown;
    closingHtml?: unknown;
  };
  const points = o.points
    .filter(
      (p): p is { title: string; bodyHtml: string } =>
        typeof p === "object" &&
        p !== null &&
        typeof (p as Record<string, unknown>).title === "string" &&
        typeof (p as Record<string, unknown>).bodyHtml === "string"
    )
    .slice(0, 3);
  // Structured Outputs 는 minItems 2 를 지원하지 않으므로 개수는 여기서 지킨다.
  if (points.length < 2) {
    throw new Error("LLM 출력 points 가 2개 미만");
  }
  return {
    heroCaption: o.heroCaption,
    conceptHtml: o.conceptHtml,
    points,
    ...(typeof o.problemHtml === "string" ? { problemHtml: o.problemHtml } : {}),
    ...(typeof o.closingHtml === "string" ? { closingHtml: o.closingHtml } : {}),
  };
}

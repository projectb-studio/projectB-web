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
설명: 입력에 가공 방식("압축 성형")이 적혀 있으므로 그것만 인용한다.
입력: 코튼 냅킨 세트 / fabric / 여러 번 빨아도 형태가 유지되도록 압축 성형한 원단. 4장 구성.
출력:
{
  "heroCaption": "빨수록 손에 익는 네 장",
  "problemHtml": "<p>냅킨은 몇 번 빨면 모양이 틀어지고 끝이 말립니다.</p><p>형태가 버티면 오래 씁니다.</p>",
  "conceptHtml": "<p>압축 성형을 거친 원단이라 세탁을 반복해도 끝이 덜 말립니다.</p><p>네 장을 돌려 쓰면 한 장에 부담이 몰리지 않습니다.</p>",
  "points": [
    { "title": "빨아도 버티는 형태", "bodyHtml": "<p>세탁 뒤에도 모서리가 각을 유지합니다.</p>" },
    { "title": "돌려 쓰는 네 장", "bodyHtml": "<p>한 장씩 쉬어가며 쓸 수 있습니다.</p>" }
  ],
  "closingHtml": "<p>매일 쓰는 자리에 두고 돌려 쓰는 물건입니다.</p>"
}
</example>
<example>
설명: 입력에 제작 기법이 없다. 그래서 "어떻게 만들었는지"는 한 글자도 쓰지 않고,
눈에 보이는 결과와 쓰는 장면만으로 채웠다. 이것이 정보가 적을 때의 올바른 태도다.
입력: 마블 비누 받침 / stone / 물이 고이지 않도록 홈을 냄. 표면이 차갑고 매끈함.
출력:
{
  "heroCaption": "비누가 무르지 않는 자리",
  "problemHtml": "<p>비누를 그냥 두면 바닥에 눌러붙어 금세 물러집니다.</p><p>물이 빠지면 오래 갑니다.</p>",
  "conceptHtml": "<p>홈을 따라 물이 흘러나가 비누 바닥이 젖은 채로 남지 않습니다.</p><p>표면은 차갑고 매끈해서 물때가 눈에 덜 띕니다.</p>",
  "points": [
    { "title": "물이 빠지는 홈", "bodyHtml": "<p>비누가 물에 잠긴 채로 있지 않습니다.</p>" },
    { "title": "차갑고 매끈한 표면", "bodyHtml": "<p>손이 닿을 때 온도가 먼저 느껴집니다.</p>" }
  ],
  "closingHtml": "<p>비누 하나를 끝까지 쓰게 만드는 받침입니다.</p>"
}
</example>
<example>
설명: 입력이 거의 없다. 이럴수록 지어내지 말고 용도와 장면으로만 짧게 쓴다.
소재 이름은 상품명에 있으니 써도 되지만, 어떻게 만들었는지는 알 수 없으므로 침묵한다.
입력: 라탄 수납 바구니 / handmade / (설명 없음)
출력:
{
  "heroCaption": "치우지 않아도 정리되는 자리",
  "problemHtml": "<p>잡동사니는 서랍에 넣으면 잊어버리고, 꺼내두면 어질러 보입니다.</p><p>담아두는 자리가 하나 있으면 됩니다.</p>",
  "conceptHtml": "<p>속이 보이지 않아 무엇을 담아도 밖에서는 정돈되어 보입니다.</p>",
  "points": [
    { "title": "담기만 하면 되는 자리", "bodyHtml": "<p>분류하지 않아도 겉은 정리되어 보입니다.</p>" },
    { "title": "가벼워 옮기기 쉬움", "bodyHtml": "<p>필요한 방으로 그때그때 옮길 수 있습니다.</p>" }
  ],
  "closingHtml": "<p>정리를 미루면서도 정돈되어 보이게 하는 물건입니다.</p>"
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
- **제작 방식도 사실이다.** 바느질·깎기·물레·용접·염색·직조 같은 기법은
  입력에 적혀 있을 때만 쓸 수 있다. "핸드메이드" 태그는 손으로 만들었다는
  것까지만 보증하지, 어떤 기법인지는 보증하지 않는다.
- 입력에 주어진 사실만 언급할 수 있고, 확실하지 않으면 아예 언급하지 않는다.
  (이 정보들은 별도의 스펙표가 담당하므로 카피가 대신할 필요가 없다.)

정보가 적으면 짧게 써라. 빈칸을 상상으로 메우는 것보다 적게 쓰는 편이 낫다.

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

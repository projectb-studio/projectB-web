import type { DraftProvider, GenerateInput, GenerateOutput } from "@/lib/ai-draft/provider";
import type { VoiceCopy } from "@/lib/ai-draft/recipe";

/**
 * 실제 LLM Provider (Anthropic Messages API, fetch 기반 — 새 의존성 없음).
 *
 * 환경변수 ANTHROPIC_API_KEY 가 있을 때만 팩토리가 이 Provider 를 선택한다.
 * 모델은 "보이스 카피"만 생성하며, 사실값·이미지·레이아웃은 레시피가 통제한다.
 * 출력은 엄격한 JSON 스키마로 강제하고, 파싱 실패 시 throw 한다(환각 격리).
 */
// 카피 생성은 경량 작업 → 비용·품질 균형상 Haiku 가 기본값. AI_DRAFT_MODEL 로 오버라이드.
const MODEL = process.env.AI_DRAFT_MODEL ?? "claude-haiku-4-5-20251001";
const API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `당신은 한국 핸드메이드 소품 쇼핑몰의 상세페이지 카피라이터다.
브랜드 톤: 산업적 미니멀 — 과장·이모지·느낌표 남발 금지, 절제되고 단정한 문장.
'기능 → 혜택(결과)' 순으로 쓴다.

반드시 아래 JSON 스키마로만 답한다(다른 텍스트 금지):
{
  "heroCaption": string,            // 한 줄 컨셉, 40자 이내
  "conceptHtml": string,            // <p>...</p> 1~3개. 컨셉·브랜드 스토리
  "points": [                       // 핵심 포인트 2~3개
    { "title": string, "bodyHtml": string }  // bodyHtml 은 <p>...</p>
  ]
}

중요(환각 금지):
- 소재·치수·원산지·세탁법 같은 사실은 절대 지어내지 마라. 그런 사실은 카피에 포함하지 않는다.
- 가격·할인·재고·배송일 같은 수치도 만들지 마라.
- 오직 분위기·컨셉·감성 카피만 작성한다.`;

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
}

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

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userParts.join("\n") }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Anthropic API error ${res.status}: ${detail.slice(0, 300)}`);
    }

    const json = (await res.json()) as AnthropicResponse;
    const text = json.content?.find((c) => c.type === "text")?.text ?? "";
    const voice = parseVoice(text);

    return {
      voice,
      generator: `anthropic:${MODEL}`,
      rawMeta: {
        inputTokens: json.usage?.input_tokens,
        outputTokens: json.usage?.output_tokens,
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
  const o = obj as { heroCaption: string; conceptHtml: string; points: unknown[] };
  const points = o.points
    .filter(
      (p): p is { title: string; bodyHtml: string } =>
        typeof p === "object" &&
        p !== null &&
        typeof (p as Record<string, unknown>).title === "string" &&
        typeof (p as Record<string, unknown>).bodyHtml === "string"
    )
    .slice(0, 3);
  if (points.length < 2) {
    throw new Error("LLM 출력 points 가 2개 미만");
  }
  return { heroCaption: o.heroCaption, conceptHtml: o.conceptHtml, points };
}

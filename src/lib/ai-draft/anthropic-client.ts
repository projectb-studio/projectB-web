import {
  getCostGuard,
  estimateInputTokens,
  type CostGuard,
} from "@/lib/ai-draft/cost-guard";

/**
 * Anthropic Messages API 공용 클라이언트.
 *
 * 이 모듈이 API 로 나가는 유일한 통로다. 초안 생성이든 품질 평가든 전부 여기를
 * 거치므로, 비용 가드를 한 곳에서만 채워도 모든 호출이 예산 안에 묶인다.
 * (새 호출 지점을 추가할 때 가드를 깜빡할 여지를 구조적으로 없앤다.)
 */
const API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export interface AnthropicCallInput {
  model: string;
  system: string;
  user: string;
  maxTokens: number;
  /** 원장에 남길 호출 용도. 예: 'draft:generate' | 'draft:critique' */
  label: string;
  temperature?: number;
}

export interface AnthropicCallResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export interface CallOptions {
  apiKey?: string;
  guard?: CostGuard;
  fetchImpl?: typeof fetch;
}

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
}

export async function callAnthropic(
  input: AnthropicCallInput,
  options: CallOptions = {}
): Promise<AnthropicCallResult> {
  const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY 가 설정되지 않았습니다");

  const guard = options.guard ?? getCostGuard();
  const doFetch = options.fetchImpl ?? fetch;

  // worst-case 로 먼저 예약한다 — 예산이 부족하면 여기서 throw 되어 fetch 자체가 안 나간다.
  const reservationId = await guard.reserve({
    model: input.model,
    estimatedInputTokens: estimateInputTokens(input.system + input.user),
    maxOutputTokens: input.maxTokens,
    label: input.label,
  });

  let res: Response;
  try {
    res = await doFetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: input.model,
        max_tokens: input.maxTokens,
        system: input.system,
        messages: [{ role: "user", content: input.user }],
        ...(input.temperature === undefined ? {} : { temperature: input.temperature }),
      }),
    });
  } catch (e) {
    await guard.release(reservationId);
    throw e;
  }

  if (!res.ok) {
    await guard.release(reservationId);
    const detail = await res.text().catch(() => "");
    throw new Error(`Anthropic API error ${res.status}: ${detail.slice(0, 300)}`);
  }

  let json: AnthropicResponse;
  try {
    json = (await res.json()) as AnthropicResponse;
  } catch (e) {
    await guard.release(reservationId);
    throw e;
  }

  const inputTokens = json.usage?.input_tokens ?? 0;
  const outputTokens = json.usage?.output_tokens ?? 0;
  // 여기부터는 이미 과금된 호출이므로, 파싱 실패 여부와 무관하게 반드시 정산한다.
  await guard.settle(reservationId, { inputTokens, outputTokens });

  return {
    text: json.content?.find((c) => c.type === "text")?.text ?? "",
    inputTokens,
    outputTokens,
  };
}

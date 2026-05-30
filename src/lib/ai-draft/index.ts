import type { DraftProvider } from "@/lib/ai-draft/provider";
import { StubDraftProvider } from "@/lib/ai-draft/stub-provider";
import { AnthropicDraftProvider } from "@/lib/ai-draft/anthropic-provider";

export type { DraftProvider, GenerateInput, GenerateOutput } from "@/lib/ai-draft/provider";
export {
  assembleBlocks,
  RECIPE_VERSION,
  FACT_PLACEHOLDER,
  type ProductFacts,
  type VoiceCopy,
} from "@/lib/ai-draft/recipe";

/**
 * 초안 Provider 팩토리.
 *
 * ANTHROPIC_API_KEY 가 설정돼 있으면 실제 LLM Provider 를, 없으면 결정적 스텁을 반환한다.
 * 키 유무와 무관하게 전체 생성→검수→발행 흐름은 동일하게 동작한다.
 */
export function getDraftProvider(): DraftProvider {
  const key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    return new AnthropicDraftProvider(key);
  }
  return new StubDraftProvider();
}

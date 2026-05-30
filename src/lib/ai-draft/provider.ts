import type { ProductFacts, VoiceCopy } from "@/lib/ai-draft/recipe";

/**
 * 초안 생성 Provider 인터페이스.
 *
 * Provider 의 책임은 "보이스 카피 생성"으로 한정된다 (사실값·이미지는 레시피가 처리).
 * 따라서 stub 이든 실제 LLM 이든 교체 가능하며, 환각 위험이 낮은 주관적 카피만 생성한다.
 */
export interface GenerateInput {
  facts: ProductFacts;
  /** 운영자 반려 의견 (재생성 시 반영) */
  feedback?: string | null;
  /** 직전 초안의 보이스 (전면 재작성이 아닌 수정 기반 재생성용) */
  previousVoice?: VoiceCopy | null;
}

export interface GenerateOutput {
  voice: VoiceCopy;
  /** 생성기 식별자 — 재현/감사용. 예: 'stub' | 'anthropic:claude-...' */
  generator: string;
  /** 모델 입력/토큰 등 부가 메타 */
  rawMeta?: Record<string, unknown>;
}

export interface DraftProvider {
  generate(input: GenerateInput): Promise<GenerateOutput>;
}

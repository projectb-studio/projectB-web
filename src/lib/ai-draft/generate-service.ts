import { createAdminClient } from "@/lib/supabase/admin";
import { getDraftProvider } from "@/lib/ai-draft";
import { assembleBlocks, type ProductFacts, type VoiceCopy } from "@/lib/ai-draft/recipe";
import { createDraft } from "@/lib/data/drafts";
import { runQualityLoop, type QualityCritic } from "@/lib/ai-draft/quality-loop";
import { buildCritics, MAX_QUALITY_ATTEMPTS } from "@/lib/ai-draft/critics";
import type { DbProductDetailDraft } from "@/types/database";

/**
 * 상품 1건에 대해 AI 초안을 생성한다.
 *
 * 흐름: 상품 사실/이미지 로드 → provider.generate(보이스) → assembleBlocks(레시피)
 *       → pb_product_detail_drafts 에 pending 으로 적재.
 *
 * 절대 pb_products.detail_blocks(라이브)를 건드리지 않는다 — 격리.
 */
export interface GenerateDraftOptions {
  /** 반려 후 재생성 시 운영자 의견 */
  feedback?: string | null;
  /** 재생성의 부모 초안 (리비전 체인 + 직전 보이스 복원) */
  parent?: DbProductDetailDraft | null;
  /** 품질 루프를 끄고 1회만 생성 (테스트·디버깅용) */
  skipQualityLoop?: boolean;
  /** 비평가 주입 (테스트용) */
  critics?: QualityCritic[];
}

export async function generateDraftForProduct(
  productId: string,
  options: GenerateDraftOptions = {}
): Promise<DbProductDetailDraft> {
  const supabase = createAdminClient();

  const { data, error } = await (
    supabase.from("pb_products") as ReturnType<typeof supabase.from>
  )
    .select("*, pb_product_images(*)")
    .eq("id", productId)
    .single();

  if (error || !data) {
    throw new Error("상품을 찾을 수 없습니다");
  }

  const row = data as Record<string, unknown>;
  const facts: ProductFacts = {
    name: row.name as string,
    price: (row.price as number) ?? 0,
    tag: (row.tag as string) ?? "handmade",
    description: (row.description as string | null) ?? null,
    details: (row.details as string | null) ?? null,
    care: (row.care as string | null) ?? null,
    shipping: (row.shipping as string | null) ?? null,
  };

  const images = ((row.pb_product_images as Record<string, unknown>[]) ?? [])
    .slice()
    .sort((a, b) => ((a.sort_order as number) ?? 0) - ((b.sort_order as number) ?? 0));
  const imageUrls = images.map((img) => img.url as string).filter(Boolean);

  const parent = options.parent ?? null;
  const previousVoice =
    (parent?.generation_meta as { voice?: VoiceCopy } | undefined)?.voice ?? null;

  const provider = getDraftProvider();

  // 품질 루프를 태운다 — 미달이면 비평 피드백을 붙여 재생성하고, 나아지지 않으면
  // 남은 시도를 쓰지 않는다. 어떤 경우에도 카피는 나오고, 판정 이력이 함께 남는다.
  const loop = await runQualityLoop({
    facts,
    provider,
    critics: options.critics ?? buildCritics(),
    maxAttempts: options.skipQualityLoop ? 1 : MAX_QUALITY_ATTEMPTS,
    stopWhenNoImprovement: true,
    operatorFeedback: options.feedback ?? null,
    initialPreviousVoice: previousVoice,
  });

  const assembled = assembleBlocks({ facts, imageUrls, voice: loop.voice });

  return createDraft({
    productId,
    blocks: assembled.blocks,
    source: "ai",
    generator: loop.generator,
    generationMeta: {
      recipe: assembled.meta,
      voice: loop.voice,
      raw: loop.rawMeta ?? {},
      feedback: options.feedback ?? null,
      // 검수 화면이 "이 초안이 몇 점인지"를 보여줄 수 있도록 남긴다.
      quality: {
        passed: loop.passed,
        score: loop.bestScore,
        attempts: loop.attempts,
        stoppedEarly: loop.stoppedEarly,
        generationError: loop.generationError ?? null,
        history: loop.history.map((h) => ({
          attempt: h.attempt,
          score: h.score,
          passed: h.passed,
          verdicts: h.verdicts,
        })),
      },
    },
    parentDraftId: parent?.id ?? null,
    revision: parent ? parent.revision + 1 : 1,
    feedback: options.feedback ?? null,
  });
}

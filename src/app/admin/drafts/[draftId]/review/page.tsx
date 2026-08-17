import { redirect, notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDraft } from "@/lib/data/drafts";
import type { Block } from "@/lib/detail-blocks/schema";

const DraftReviewShell = dynamic(
  () => import("@/components/admin/ai-draft/DraftReviewShell"),
  { ssr: false }
);

export const dynamicParams = true;
export const revalidate = 0;

function asBlocks(value: unknown): Block[] {
  return Array.isArray(value) ? (value as Block[]) : [];
}

export default async function DraftReviewPage({
  params,
}: {
  params: { draftId: string };
}) {
  const admin = await getAdminUser();
  if (!admin) redirect("/auth");

  const draft = await getDraft(params.draftId);
  if (!draft) notFound();

  // 이미 처리된 초안은 상품 초안 목록으로
  if (draft.status !== "pending") {
    redirect(`/admin/products/${draft.product_id}/drafts`);
  }

  const supabase = createAdminClient();
  const { data } = await (
    supabase.from("pb_products") as ReturnType<typeof supabase.from>
  )
    .select("name, detail_blocks")
    .eq("id", draft.product_id)
    .single();

  const product = data as { name: string; detail_blocks: unknown } | null;
  if (!product) notFound();

  const meta = draft.generation_meta as
    | {
        recipe?: { factsNeedingInput?: string[]; legalGaps?: string[] };
        quality?: { score?: number; passed?: boolean; attempts?: number };
      }
    | undefined;

  const factsNeedingInput = meta?.recipe?.factsNeedingInput ?? [];
  const legalGaps = meta?.recipe?.legalGaps ?? [];
  const quality = meta?.quality
    ? {
        score: meta.quality.score ?? 0,
        passed: meta.quality.passed ?? false,
        attempts: meta.quality.attempts ?? 1,
      }
    : null;

  return (
    <DraftReviewShell
      draftId={draft.id}
      productId={draft.product_id}
      productName={product.name}
      initialBlocks={asBlocks(draft.blocks)}
      liveBlocks={asBlocks(product.detail_blocks)}
      generator={draft.generator}
      revision={draft.revision}
      feedback={draft.feedback}
      factsNeedingInput={factsNeedingInput}
      legalGaps={legalGaps}
      quality={quality}
    />
  );
}

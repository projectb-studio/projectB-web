import { createAdminClient } from "@/lib/supabase/admin";
import type { DbProductDetailDraft } from "@/types/database";
import type { Block } from "@/lib/detail-blocks/schema";

/**
 * Draft repository — 모든 접근은 service_role(admin) 클라이언트로만 이루어진다.
 * pb_product_detail_drafts 는 RLS 로 클라이언트 직접 접근이 차단돼 있다(검수 전 미노출).
 */

type AdminClient = ReturnType<typeof createAdminClient>;

function table(supabase: AdminClient) {
  return supabase.from("pb_product_detail_drafts") as ReturnType<typeof supabase.from>;
}

export interface CreateDraftInput {
  productId: string;
  blocks: Block[];
  source: "ai" | "manual";
  generator: string | null;
  generationMeta: Record<string, unknown>;
  parentDraftId?: string | null;
  revision?: number;
  feedback?: string | null;
}

export async function createDraft(
  input: CreateDraftInput
): Promise<DbProductDetailDraft> {
  const supabase = createAdminClient();
  const { data, error } = await table(supabase)
    .insert({
      product_id: input.productId,
      status: "pending",
      blocks: input.blocks,
      source: input.source,
      generator: input.generator,
      generation_meta: input.generationMeta,
      parent_draft_id: input.parentDraftId ?? null,
      revision: input.revision ?? 1,
      feedback: input.feedback ?? null,
    } as never)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "초안 생성 실패");
  }
  return data as DbProductDetailDraft;
}

export async function getDraft(id: string): Promise<DbProductDetailDraft | null> {
  const supabase = createAdminClient();
  const { data } = await table(supabase).select("*").eq("id", id).single();
  return (data as DbProductDetailDraft | null) ?? null;
}

export async function listDraftsByProduct(
  productId: string
): Promise<DbProductDetailDraft[]> {
  const supabase = createAdminClient();
  const { data } = await table(supabase)
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  return (data as DbProductDetailDraft[] | null) ?? [];
}

/** 전체 검수 대기 큐 (pending) — 상품명 조인 */
export async function listPendingDrafts(): Promise<
  Array<DbProductDetailDraft & { product_name: string | null }>
> {
  const supabase = createAdminClient();
  const { data } = await table(supabase)
    .select("*, pb_products(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return ((data as Record<string, unknown>[] | null) ?? []).map((row) => ({
    ...(row as unknown as DbProductDetailDraft),
    product_name:
      (row.pb_products as { name?: string } | null)?.name ?? null,
  }));
}

/** 운영자 편집: pending 초안의 blocks 갱신 (상태 유지) */
export async function updateDraftBlocks(
  id: string,
  blocks: Block[]
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await table(supabase)
    .update({ blocks } as never)
    .eq("id", id)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
}

/** 발행: 초안을 published 로 전이 + reviewer 기록 */
export async function markDraftPublished(
  id: string,
  reviewedBy: string | null
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await table(supabase)
    .update({
      status: "published",
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
}

/** 반려: 초안을 rejected 로 전이 + 사유 기록 */
export async function markDraftRejected(
  id: string,
  note: string | null,
  reviewedBy: string | null
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await table(supabase)
    .update({
      status: "rejected",
      review_note: note,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
}

/** 라이브 detail_blocks 로 복사 (발행). 이미 sanitize 된 blocks 를 받는다. */
export async function publishToProduct(
  productId: string,
  blocks: Block[]
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await (
    supabase.from("pb_products") as ReturnType<typeof supabase.from>
  )
    .update({ detail_blocks: blocks } as never)
    .eq("id", productId);
  if (error) throw new Error(error.message);
}

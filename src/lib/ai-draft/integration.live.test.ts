/**
 * 실 DB 통합 스모크 — 실제 Supabase 에 붙어 전체 흐름과 격리 불변식을 검증한다.
 *
 * 평소 `npm test` 에서는 SKIP 된다. 실행하려면:
 *   RUN_LIVE_SMOKE=1 npx vitest run src/lib/ai-draft/integration.live.test.ts
 *
 * 임시 상품을 만들어 흐름을 돌리고 afterAll 에서 cascade 삭제로 자동 정리한다.
 * (임시 상품은 is_published=false 라 고객에게 노출되지 않는다.)
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env 없으면 그대로 진행 (테스트가 스킵될 것)
  }
}

const RUN = process.env.RUN_LIVE_SMOKE === "1";

describe.skipIf(!RUN)("AI draft — live integration smoke", () => {
  let productId: string;
  // 동적 import: env 로드 후 모듈을 가져온다.
  let mod: {
    generate: typeof import("@/lib/ai-draft/generate-service").generateDraftForProduct;
    drafts: typeof import("@/lib/data/drafts");
    sanitizeBlocks: typeof import("@/lib/detail-blocks/sanitize-blocks").sanitizeBlocks;
    createAdminClient: typeof import("@/lib/supabase/admin").createAdminClient;
  };

  beforeAll(async () => {
    loadEnv();
    const [gen, drafts, san, admin] = await Promise.all([
      import("@/lib/ai-draft/generate-service"),
      import("@/lib/data/drafts"),
      import("@/lib/detail-blocks/sanitize-blocks"),
      import("@/lib/supabase/admin"),
    ]);
    mod = {
      generate: gen.generateDraftForProduct,
      drafts,
      sanitizeBlocks: san.sanitizeBlocks,
      createAdminClient: admin.createAdminClient,
    };

    const supabase = mod.createAdminClient();
    const slug = `__ai-draft-smoke-${crypto.randomUUID().slice(0, 8)}`;
    const { data, error } = await (
      supabase.from("pb_products") as ReturnType<typeof supabase.from>
    )
      .insert({
        name: "__AI_DRAFT_SMOKE__",
        slug,
        price: 10000,
        tag: "handmade",
        is_published: false,
        sort_order: 9999,
        description: "smoke test product",
        detail_blocks: [],
      } as never)
      .select("id")
      .single();
    if (error || !data) throw new Error(`temp product insert failed: ${error?.message}`);
    productId = (data as { id: string }).id;
  }, 30_000);

  afterAll(async () => {
    if (!productId) return;
    const supabase = mod.createAdminClient();
    // cascade 로 draft 들도 함께 삭제됨
    await (supabase.from("pb_products") as ReturnType<typeof supabase.from>)
      .delete()
      .eq("id", productId);
  }, 30_000);

  async function liveDetailBlocks(): Promise<unknown> {
    const supabase = mod.createAdminClient();
    const { data } = await (
      supabase.from("pb_products") as ReturnType<typeof supabase.from>
    )
      .select("detail_blocks")
      .eq("id", productId)
      .single();
    return (data as { detail_blocks: unknown }).detail_blocks;
  }

  it("generate 는 pending 초안을 만들고 라이브 detail_blocks 는 건드리지 않는다 (격리)", async () => {
    const before = await liveDetailBlocks();
    const draft = await mod.generate(productId);

    expect(draft.status).toBe("pending");
    expect(draft.revision).toBe(1);
    expect(Array.isArray(draft.blocks)).toBe(true);
    expect((draft.blocks as unknown[]).length).toBeGreaterThan(0);

    // 핵심: 생성만으로 라이브가 바뀌면 안 된다
    const after = await liveDetailBlocks();
    expect(after).toEqual(before);
    expect(after).toEqual([]);
  }, 30_000);

  it("초안은 anon 클라이언트로 직접 조회되지 않는다 (RLS 차단)", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
    const { data } = await anon
      .from("pb_product_detail_drafts")
      .select("*")
      .eq("product_id", productId);
    // RLS USING(false) → 0 행 (혹은 권한 오류). 어떤 경우든 초안이 새어나오면 안 된다.
    expect(data ?? []).toHaveLength(0);
  }, 30_000);

  it("approve 는 sanitize 후 라이브로 복사하고 초안을 published 로 전이한다", async () => {
    const draft = await mod.generate(productId);
    const safe = mod.sanitizeBlocks(draft.blocks);
    await mod.drafts.publishToProduct(productId, safe);
    await mod.drafts.markDraftPublished(draft.id, null);

    const live = (await liveDetailBlocks()) as unknown[];
    expect(live.length).toBe(safe.length);

    const reloaded = await mod.drafts.getDraft(draft.id);
    expect(reloaded?.status).toBe("published");
    expect(reloaded?.published_at).not.toBeNull();
  }, 30_000);

  it("반려 후 재생성은 의견을 반영한 v2 초안을 리비전 체인으로 만든다", async () => {
    const v1 = await mod.generate(productId);
    await mod.drafts.markDraftRejected(v1.id, "소재 강조를 더 해주세요", null);

    const v2 = await mod.generate(productId, {
      feedback: "소재 강조를 더 해주세요",
      parent: v1,
    });

    expect(v2.revision).toBe(v1.revision + 1);
    expect(v2.parent_draft_id).toBe(v1.id);
    expect((v2.generation_meta as { feedback?: string }).feedback).toBe(
      "소재 강조를 더 해주세요"
    );

    const v1Reloaded = await mod.drafts.getDraft(v1.id);
    expect(v1Reloaded?.status).toBe("rejected");
  }, 30_000);
});

import { describe, it } from "vitest";
import { resolveNoticeCategory, noticeRowsFor } from "./notice-categories";
import type { ProductFacts } from "./recipe";

/**
 * 실 DB 상품이 어떤 고시 품목으로 분류되는지 훑어보는 점검용.
 * RUN_CLASSIFY_CHECK=1 일 때만 돈다 (실 DB 조회).
 */
const enabled = process.env.RUN_CLASSIFY_CHECK === "1";
const d = enabled ? describe : describe.skip;

d("고시 품목 분류 점검", () => {
  it("실 상품 전체의 분류 결과를 출력한다", async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const res = await fetch(
      `${url}/rest/v1/pb_products?select=name,tag,details,care&limit=50`,
      { headers: { apikey: key ?? "", Authorization: `Bearer ${key}` } }
    );
    const rows = (await res.json()) as Array<{
      name: string;
      tag: string;
      details: string | null;
      care: string | null;
    }>;

    const lines: string[] = [];
    for (const r of rows) {
      const facts: ProductFacts = {
        name: r.name,
        price: 0,
        tag: r.tag,
        description: null,
        details: r.details,
        care: r.care,
        shipping: null,
      };
      const cat = resolveNoticeCategory(facts);
      const gaps = noticeRowsFor(facts).filter(
        (x) => x.value === "[운영자 입력 필요]"
      ).length;
      lines.push(`${cat.code.padEnd(8)} | 미기입 ${gaps}건 | ${r.name}`);
    }
    const { writeFileSync, mkdirSync } = await import("node:fs");
    mkdirSync(".ai-eval", { recursive: true });
    writeFileSync(".ai-eval/classify.txt", lines.sort().join("\n"), "utf8");
  }, 60_000);
});

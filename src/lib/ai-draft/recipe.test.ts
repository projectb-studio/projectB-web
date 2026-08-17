import { describe, it, expect } from "vitest";
import {
  assembleBlocks,
  FACT_PLACEHOLDER,
  type ProductFacts,
  type VoiceCopy,
} from "./recipe";
import { BlocksSchema, type Block } from "@/lib/detail-blocks/schema";

const VOICE: VoiceCopy = {
  heroCaption: "손끝에서 완성된 소품",
  conceptHtml: "<p>컨셉 카피</p>",
  points: [
    { title: "포인트1", bodyHtml: "<p>본문1</p>" },
    { title: "포인트2", bodyHtml: "<p>본문2</p>" },
  ],
};

const BASE_FACTS: ProductFacts = {
  name: "Ceramic vase",
  price: 38000,
  tag: "handmade",
  description: "matte black vase",
  details: null,
  care: null,
  shipping: null,
};

const IMG = (n: number) => `https://cdn.example.com/img${n}.jpg`;

function imageUrlsIn(blocks: Block[]): string[] {
  const urls: string[] = [];
  for (const b of blocks) {
    if (b.type === "image") urls.push(b.data.url);
    if (b.type === "twocol") urls.push(b.data.image.url);
    if (b.type === "gallery") b.data.images.forEach((i) => urls.push(i.url));
  }
  return urls.filter(Boolean);
}

describe("assembleBlocks", () => {
  it("produces blocks valid against BlocksSchema", () => {
    const { blocks } = assembleBlocks({
      facts: BASE_FACTS,
      imageUrls: [IMG(0), IMG(1), IMG(2), IMG(3)],
      voice: VOICE,
    });
    expect(BlocksSchema.safeParse(blocks).success).toBe(true);
  });

  it("only ever places images that were provided (never invents imagery)", () => {
    const input = [IMG(0), IMG(1), IMG(2), IMG(3)];
    const { blocks } = assembleBlocks({ facts: BASE_FACTS, imageUrls: input, voice: VOICE });
    const used = imageUrlsIn(blocks);
    expect(used.length).toBeGreaterThan(0);
    for (const u of used) {
      expect(input).toContain(u);
    }
  });

  it("with no images: emits no image/gallery blocks and stays valid", () => {
    const { blocks } = assembleBlocks({ facts: BASE_FACTS, imageUrls: [], voice: VOICE });
    expect(BlocksSchema.safeParse(blocks).success).toBe(true);
    expect(blocks.some((b) => b.type === "image" || b.type === "gallery")).toBe(false);
    // 이미지 없는 포인트는 twocol 대신 richtext 로 폴백
    expect(blocks.some((b) => b.type === "twocol")).toBe(false);
  });

  it("does not fabricate facts: empty details/care become placeholders + flagged", () => {
    const { blocks, meta } = assembleBlocks({
      facts: BASE_FACTS,
      imageUrls: [IMG(0)],
      voice: VOICE,
    });
    const spec = blocks.find((b) => b.type === "spec");
    expect(spec).toBeDefined();
    if (spec && spec.type === "spec") {
      // 값은 절대 지어내지 않고 플레이스홀더로 비워둔다
      expect(spec.data.rows.every((r) => r.value === FACT_PLACEHOLDER)).toBe(true);
    }
    expect(meta.factsNeedingInput.length).toBeGreaterThan(0);
  });

  it("uses operator-entered DB facts as the source of truth when present", () => {
    const facts: ProductFacts = {
      ...BASE_FACTS,
      details: "소재: 도자기\n원산지: 대한민국",
      care: "물세탁 금지\n마른 천으로 닦기",
    };
    const { blocks, meta } = assembleBlocks({ facts, imageUrls: [IMG(0)], voice: VOICE });
    const spec = blocks.find((b) => b.type === "spec");
    if (spec && spec.type === "spec") {
      expect(spec.data.rows).toContainEqual({ label: "소재", value: "도자기" });
      expect(spec.data.rows).toContainEqual({ label: "원산지", value: "대한민국" });
    }
    const care = blocks.find((b) => b.type === "care");
    if (care && care.type === "care") {
      expect(care.data.items[0].text).toBe("물세탁 금지");
      expect(care.data.items[0].icon).toBe("wash");
    }
    // 사실이 채워졌으므로 입력 필요 플래그 없음
    expect(meta.factsNeedingInput).toHaveLength(0);
  });

  it("sanitizes voice HTML at generation time (draft preview is safe)", () => {
    const malicious: VoiceCopy = {
      heroCaption: "x",
      conceptHtml: "<p>ok</p><script>alert(1)</script>",
      points: [
        { title: "p1", bodyHtml: "<p>a</p><img src=x onerror=alert(1)>" },
        { title: "p2", bodyHtml: "<p>b</p>" },
      ],
    };
    const { blocks } = assembleBlocks({
      facts: BASE_FACTS,
      imageUrls: [],
      voice: malicious,
    });
    const html = blocks
      .filter((b): b is Extract<Block, { type: "richtext" }> => b.type === "richtext")
      .map((b) => b.data.html)
      .join("");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("onerror");
    expect(html).toContain("ok");
  });

  it("records recipe version + slot fill provenance in meta", () => {
    const { meta } = assembleBlocks({ facts: BASE_FACTS, imageUrls: [IMG(0)], voice: VOICE });
    expect(meta.recipeVersion).toBe("soft-goods-editorial-v2");
    expect(meta.slots.find((s) => s.slot === "hero")?.filledWith).toContain("product-image");
  });
});

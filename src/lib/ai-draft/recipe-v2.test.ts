import { describe, it, expect } from "vitest";
import { assembleBlocks, FACT_PLACEHOLDER, type ProductFacts, type VoiceCopy } from "./recipe";
import type { Block } from "@/lib/detail-blocks/schema";

const IMG = "https://cdn.example.com/a.jpg";

function facts(over: Partial<ProductFacts> = {}): ProductFacts {
  return {
    name: "리넨 테이블러너 — 아이보리",
    price: 28000,
    tag: "fabric",
    description: "워싱 가공한 리넨으로 만든 테이블러너입니다.",
    details: "제품 소재(혼용률): 리넨 100%\n치수: 40cm × 180cm\n제조국: 대한민국",
    care: "30도 찬물 손세탁\n표백제 금지",
    shipping: null,
    ...over,
  };
}

function voice(over: Partial<VoiceCopy> = {}): VoiceCopy {
  return {
    heroCaption: "식탁에 결을 더하는 한 장",
    conceptHtml: "<p>워싱을 거쳐 처음부터 부드럽습니다. 쓸수록 결이 자리잡습니다.</p>",
    points: [
      { title: "쓸수록 부드러워지는 결", bodyHtml: "<p>워싱 가공으로 첫날부터 뻣뻣하지 않습니다.</p>" },
      { title: "물을 잘 머금는 조직", bodyHtml: "<p>흘린 물을 빠르게 흡수합니다.</p>" },
    ],
    ...over,
  };
}

function specTitles(blocks: Block[]): string[] {
  return blocks
    .filter((b): b is Extract<Block, { type: "spec" }> => b.type === "spec")
    .map((b) => b.data.title ?? "");
}

function richTexts(blocks: Block[]): string[] {
  return blocks
    .filter((b): b is Extract<Block, { type: "richtext" }> => b.type === "richtext")
    .map((b) => b.data.html);
}

describe("레시피 v2 — 법정 고지 블록", () => {
  it("상품정보제공고시 블록을 항상 만든다", () => {
    const { blocks } = assembleBlocks({ facts: facts(), imageUrls: [IMG], voice: voice() });
    expect(specTitles(blocks).some((t) => t.includes("상품정보제공고시"))).toBe(true);
  });

  it("마케팅 스펙표와 법정 고지를 별개 블록으로 둔다", () => {
    const { blocks } = assembleBlocks({ facts: facts(), imageUrls: [IMG], voice: voice() });
    const titles = specTitles(blocks);
    expect(titles.some((t) => t.includes("PRODUCT SPEC"))).toBe(true);
    expect(titles.some((t) => t.includes("상품정보제공고시"))).toBe(true);
    expect(titles.length).toBeGreaterThanOrEqual(2);
  });

  it("적용된 고시 품목을 메타에 남긴다", () => {
    const { meta } = assembleBlocks({ facts: facts(), imageUrls: [IMG], voice: voice() });
    expect(meta.noticeCategory).toBe("bedding");
  });

  it("운영자가 입력한 값은 고지에 반영된다", () => {
    const { blocks } = assembleBlocks({ facts: facts(), imageUrls: [IMG], voice: voice() });
    const notice = blocks.find(
      (b): b is Extract<Block, { type: "spec" }> =>
        b.type === "spec" && (b.data.title ?? "").includes("고시")
    );
    const soko = notice?.data.rows.find((r) => r.label.includes("소재"));
    expect(soko?.value).toBe("리넨 100%");
  });

  it("빠진 법정 항목을 legalGaps 로 보고한다 (발행 차단용)", () => {
    const { meta } = assembleBlocks({ facts: facts(), imageUrls: [IMG], voice: voice() });
    expect(meta.legalGaps.length).toBeGreaterThan(0);
    expect(meta.legalGaps).toContain("A/S 책임자와 전화번호");
  });

  it("법정 항목이 다 채워지면 legalGaps 가 빈다", () => {
    const complete = facts({
      details: [
        "제품 소재(혼용률): 리넨 100%",
        "색상: 아이보리",
        "치수: 40cm × 180cm",
        "제품구성: 러너 1장",
        "제조자(수입자): 프로젝트비",
        "제조국: 대한민국",
        "품질보증기준: 소비자분쟁해결기준에 따름",
        "A/S 책임자와 전화번호: 프로젝트비 02-000-0000",
      ].join("\n"),
    });
    const { meta } = assembleBlocks({ facts: complete, imageUrls: [IMG], voice: voice() });
    expect(meta.legalGaps).toEqual([]);
  });

  it("법정 고지 값은 보이스 카피의 영향을 받지 않는다", () => {
    // 모델이 카피에 무슨 말을 하든 고지 행은 DB 값에서만 나온다.
    const { blocks } = assembleBlocks({
      facts: facts(),
      imageUrls: [IMG],
      voice: voice({ conceptHtml: "<p>제조국은 이탈리아이고 소재는 실크입니다.</p>" }),
    });
    const notice = blocks.find(
      (b): b is Extract<Block, { type: "spec" }> =>
        b.type === "spec" && (b.data.title ?? "").includes("고시")
    );
    expect(notice?.data.rows.find((r) => r.label.includes("제조국"))?.value).toBe("대한민국");
    expect(notice?.data.rows.find((r) => r.label.includes("소재"))?.value).toBe("리넨 100%");
  });
});

describe("레시피 v2 — 거래조건", () => {
  it("거래조건 5개 대분류를 본문에 담는다", () => {
    const { blocks } = assembleBlocks({ facts: facts(), imageUrls: [IMG], voice: voice() });
    const all = richTexts(blocks).join(" ");
    expect(all).toContain("공급방법");
    expect(all).toContain("청약철회");
    expect(all).toContain("교환·반품");
    expect(all).toContain("분쟁");
    expect(all).toContain("약관");
  });

  it("운영자가 쓴 배송 문구가 있으면 함께 싣는다", () => {
    const { blocks } = assembleBlocks({
      facts: facts({ shipping: "우체국택배로 발송합니다" }),
      imageUrls: [IMG],
      voice: voice(),
    });
    expect(richTexts(blocks).join(" ")).toContain("우체국택배");
  });
});

describe("레시피 v2 — 신규 보이스 슬롯", () => {
  it("문제·솔루션 카피가 있으면 블록으로 넣는다", () => {
    const { blocks, meta } = assembleBlocks({
      facts: facts(),
      imageUrls: [IMG],
      voice: voice({ problemHtml: "<p>식탁이 휑해 보이지만 매트는 부담스럽습니다.</p>" }),
    });
    expect(richTexts(blocks).join(" ")).toContain("휑해 보이지만");
    expect(meta.slots.find((s) => s.slot === "problem_solution")?.filledWith).toBe("voice");
  });

  it("클로징 카피가 있으면 블록으로 넣는다", () => {
    const { blocks } = assembleBlocks({
      facts: facts(),
      imageUrls: [IMG],
      voice: voice({ closingHtml: "<p>한 장으로 식탁의 인상이 달라집니다.</p>" }),
    });
    expect(richTexts(blocks).join(" ")).toContain("식탁의 인상이");
  });

  it("v1 초안처럼 신규 슬롯이 없어도 동작한다 (하위 호환)", () => {
    const { blocks, meta } = assembleBlocks({
      facts: facts(),
      imageUrls: [IMG],
      voice: voice(),
    });
    expect(blocks.length).toBeGreaterThan(0);
    expect(meta.slots.find((s) => s.slot === "problem_solution")?.filledWith).toContain(
      "skipped"
    );
  });
});

describe("레시피 v2 — 핸드메이드 고지", () => {
  it("수작업 개체차 고지를 항상 넣는다", () => {
    const { blocks } = assembleBlocks({ facts: facts(), imageUrls: [IMG], voice: voice() });
    expect(richTexts(blocks).join(" ")).toContain("수작업");
  });

  it("개체차 고지는 플레이스홀더가 아니다 (발행을 막지 않는다)", () => {
    const { blocks } = assembleBlocks({ facts: facts(), imageUrls: [IMG], voice: voice() });
    const handmade = richTexts(blocks).find((h) => h.includes("수작업"));
    expect(handmade).not.toContain(FACT_PLACEHOLDER);
  });
});

describe("레시피 v2 — 이미지 대체텍스트", () => {
  it("이미지마다 다른 alt 를 준다", () => {
    const urls = Array.from({ length: 6 }, (_, i) => `https://cdn.example.com/${i}.jpg`);
    const { blocks } = assembleBlocks({ facts: facts(), imageUrls: urls, voice: voice() });

    const alts: string[] = [];
    for (const b of blocks) {
      if (b.type === "image") alts.push(b.data.alt);
      if (b.type === "twocol") alts.push(b.data.image.alt);
      if (b.type === "gallery") alts.push(...b.data.images.map((i) => i.alt));
    }

    expect(alts.length).toBeGreaterThan(2);
    expect(new Set(alts).size).toBe(alts.length);
    expect(alts.every((a) => a.includes("리넨 테이블러너"))).toBe(true);
  });
});

describe("레시피 v2 — 결핍 상품", () => {
  it("사실값이 전혀 없어도 지어내지 않고 고지를 스캐폴딩한다", () => {
    const bare = facts({
      name: "핸드블로운 글라스 컵",
      tag: "glass",
      description: null,
      details: null,
      care: null,
    });
    const { meta, blocks } = assembleBlocks({ facts: bare, imageUrls: [], voice: voice() });

    expect(meta.noticeCategory).toBe("kitchen");
    expect(meta.legalGaps.length).toBeGreaterThan(3);

    const notice = blocks.find(
      (b): b is Extract<Block, { type: "spec" }> =>
        b.type === "spec" && (b.data.title ?? "").includes("고시")
    );
    // 품명은 상품명에서 채워지고, 나머지는 플레이스홀더로 남는다.
    expect(notice?.data.rows.find((r) => r.label.includes("품명"))?.value).toBe(
      "핸드블로운 글라스 컵"
    );
    expect(notice?.data.rows.find((r) => r.label.includes("제조자"))?.value).toBe(
      FACT_PLACEHOLDER
    );
  });
});

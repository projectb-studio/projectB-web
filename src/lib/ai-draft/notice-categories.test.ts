import { describe, it, expect } from "vitest";
import {
  resolveNoticeCategory,
  noticeRowsFor,
  NOTICE_CATEGORIES,
  TRADE_TERMS_SECTIONS,
} from "./notice-categories";
import type { ProductFacts } from "./recipe";

function facts(over: Partial<ProductFacts> = {}): ProductFacts {
  return {
    name: "무광 블랙 세라믹 화병",
    price: 38000,
    tag: "handmade",
    description: null,
    details: null,
    care: null,
    shipping: null,
    ...over,
  };
}

describe("resolveNoticeCategory", () => {
  it("패브릭 태그는 침구류·커튼 품목으로 본다", () => {
    expect(resolveNoticeCategory(facts({ tag: "fabric" })).code).toBe("bedding");
  });

  it("유리 태그는 주방용품으로 본다", () => {
    expect(resolveNoticeCategory(facts({ tag: "glass" })).code).toBe("kitchen");
  });

  it("이름에 주방 기물이 있으면 주방용품으로 본다", () => {
    expect(resolveNoticeCategory(facts({ name: "오크 원목 트레이", tag: "wood" })).code).toBe(
      "kitchen"
    );
    expect(resolveNoticeCategory(facts({ name: "클레이 핀치볼 3P", tag: "handmade" })).code).toBe(
      "kitchen"
    );
  });

  it("판단 근거가 없으면 고시가 정한 폴백인 기타 재화를 쓴다", () => {
    expect(resolveNoticeCategory(facts({ name: "황동 캔들홀더", tag: "metal" })).code).toBe(
      "etc"
    );
  });

  it("패브릭 태그는 이름이 주방 기물이어도 섬유 품목을 우선한다", () => {
    // 소재 기반 표시의무(혼용률·세탁방법)가 더 구체적이므로 섬유가 우선이다.
    expect(
      resolveNoticeCategory(facts({ name: "울펠트 코스터 4P", tag: "fabric" })).code
    ).toBe("bedding");
  });
});

describe("noticeRowsFor", () => {
  it("품목별 법정 필수 항목을 빠짐없이 스캐폴딩한다", () => {
    const kitchen = noticeRowsFor(facts({ tag: "glass" }));
    const labels = kitchen.map((r) => r.label);

    expect(labels).toContain("품명 및 모델명");
    expect(labels).toContain("재질");
    expect(labels).toContain("크기");
    expect(labels).toContain("제조자(수입자)");
    expect(labels).toContain("제조국");
    expect(labels).toContain("품질보증기준");
    expect(labels).toContain("A/S 책임자와 전화번호");
  });

  it("섬유 품목은 혼용률과 세탁방법을 요구한다", () => {
    const labels = noticeRowsFor(facts({ tag: "fabric" })).map((r) => r.label);
    expect(labels.some((l) => l.includes("소재"))).toBe(true);
    expect(labels.some((l) => l.includes("세탁"))).toBe(true);
  });

  it("기타 재화는 최소 항목만 요구한다", () => {
    const etc = noticeRowsFor(facts({ tag: "metal", name: "황동 캔들홀더" }));
    expect(etc.length).toBeLessThan(noticeRowsFor(facts({ tag: "glass" })).length);
    expect(etc.map((r) => r.label)).toContain("품명 및 모델명");
  });

  it("품명은 상품명에서 자동으로 채운다 (운영자가 이미 준 사실)", () => {
    const rows = noticeRowsFor(facts({ name: "무광 블랙 세라믹 화병" }));
    const nameRow = rows.find((r) => r.label === "품명 및 모델명");
    expect(nameRow?.value).toBe("무광 블랙 세라믹 화병");
  });

  it("운영자가 details 에 쓴 값이 있으면 그 값을 쓴다", () => {
    const rows = noticeRowsFor(
      facts({ tag: "glass", details: "재질: 보로실리케이트 유리\n크기: 지름 8cm" })
    );
    expect(rows.find((r) => r.label === "재질")?.value).toBe("보로실리케이트 유리");
    expect(rows.find((r) => r.label === "크기")?.value).toBe("지름 8cm");
  });

  it("세탁방법은 care 값에서 끌어온다", () => {
    const rows = noticeRowsFor(
      facts({ tag: "fabric", care: "30도 찬물 손세탁\n표백제 금지" })
    );
    const row = rows.find((r) => r.label.includes("세탁"));
    expect(row?.value).toContain("손세탁");
  });

  it("근거가 없는 항목은 지어내지 않고 플레이스홀더로 남긴다", () => {
    const rows = noticeRowsFor(facts({ tag: "glass" }));
    const maker = rows.find((r) => r.label === "제조자(수입자)");
    expect(maker?.value).toBe("[운영자 입력 필요]");
  });

  it("모든 행은 라벨과 값을 갖는다 (빈 값 없음)", () => {
    for (const code of Object.keys(NOTICE_CATEGORIES)) {
      const rows = noticeRowsFor(facts({ tag: code === "bedding" ? "fabric" : "glass" }));
      for (const r of rows) {
        expect(r.label.length).toBeGreaterThan(0);
        expect(r.value.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("TRADE_TERMS_SECTIONS", () => {
  it("거래조건 5개 대분류를 모두 담는다", () => {
    expect(TRADE_TERMS_SECTIONS).toHaveLength(5);
  });

  it("각 대분류가 제목과 본문을 갖는다", () => {
    for (const s of TRADE_TERMS_SECTIONS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.body.length).toBeGreaterThan(0);
    }
  });

  it("법이 요구하는 세부 항목을 문구에 포함한다", () => {
    const all = TRADE_TERMS_SECTIONS.map((s) => s.title + s.body).join(" ");
    expect(all).toContain("도서산간");
    expect(all).toContain("청약철회");
    expect(all).toContain("품질보증기준");
    expect(all).toContain("분쟁");
  });
});

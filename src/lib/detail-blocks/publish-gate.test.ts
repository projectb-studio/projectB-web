import { describe, it, expect } from "vitest";
import { findPlaceholders, assertPublishable, PlaceholderError } from "./publish-gate";
import type { Block } from "./schema";

const P = "[운영자 입력 필요]";

function id(n: number): string {
  return `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

const cleanSpec: Block = {
  id: id(1),
  type: "spec",
  data: { title: "상품정보제공고시", rows: [{ label: "제조국", value: "대한민국" }] },
};

describe("findPlaceholders", () => {
  it("빈 블록에서는 아무것도 찾지 않는다", () => {
    expect(findPlaceholders([])).toEqual([]);
  });

  it("다 채워진 블록은 통과다", () => {
    expect(findPlaceholders([cleanSpec])).toEqual([]);
  });

  it("스펙 행의 플레이스홀더를 찾는다", () => {
    const blocks: Block[] = [
      {
        id: id(2),
        type: "spec",
        data: { title: "상품정보제공고시", rows: [{ label: "A/S 전화번호", value: P }] },
      },
    ];
    const found = findPlaceholders(blocks);
    expect(found).toHaveLength(1);
    expect(found[0].label).toBe("A/S 전화번호");
  });

  it("케어 항목의 플레이스홀더를 찾는다", () => {
    const blocks: Block[] = [
      { id: id(3), type: "care", data: { items: [{ icon: "custom", text: P }] } },
    ];
    expect(findPlaceholders(blocks)).toHaveLength(1);
  });

  it("본문에 남은 플레이스홀더도 찾는다", () => {
    const blocks: Block[] = [
      { id: id(4), type: "richtext", data: { html: `<p>배송비: ${P}</p>` } },
    ];
    expect(findPlaceholders(blocks)).toHaveLength(1);
  });

  it("배너 문구의 플레이스홀더도 찾는다", () => {
    const blocks: Block[] = [
      { id: id(5), type: "banner", data: { text: P, bgColor: "black", align: "center" } },
    ];
    expect(findPlaceholders(blocks)).toHaveLength(1);
  });

  it("여러 개를 모두 찾는다", () => {
    const blocks: Block[] = [
      {
        id: id(6),
        type: "spec",
        data: {
          title: "고시",
          rows: [
            { label: "제조자", value: P },
            { label: "제조국", value: "대한민국" },
            { label: "A/S", value: P },
          ],
        },
      },
      { id: id(7), type: "care", data: { items: [{ icon: "custom", text: P }] } },
    ];
    expect(findPlaceholders(blocks)).toHaveLength(3);
  });

  it("어느 블록에서 났는지 알려준다", () => {
    const blocks: Block[] = [
      {
        id: id(8),
        type: "spec",
        data: { title: "고시", rows: [{ label: "제조자", value: P }] },
      },
    ];
    const found = findPlaceholders(blocks);
    expect(found[0].blockId).toBe(id(8));
    expect(found[0].blockType).toBe("spec");
  });
});

describe("assertPublishable", () => {
  it("플레이스홀더가 없으면 통과한다", () => {
    expect(() => assertPublishable([cleanSpec])).not.toThrow();
  });

  it("플레이스홀더가 있으면 PlaceholderError 를 던진다", () => {
    const blocks: Block[] = [
      { id: id(9), type: "care", data: { items: [{ icon: "custom", text: P }] } },
    ];
    expect(() => assertPublishable(blocks)).toThrow(PlaceholderError);
  });

  it("에러가 무엇을 채워야 하는지 알려준다", () => {
    const blocks: Block[] = [
      {
        id: id(10),
        type: "spec",
        data: { title: "고시", rows: [{ label: "A/S 책임자와 전화번호", value: P }] },
      },
    ];
    try {
      assertPublishable(blocks);
      expect.unreachable("던졌어야 한다");
    } catch (e) {
      expect(e).toBeInstanceOf(PlaceholderError);
      expect((e as PlaceholderError).message).toContain("A/S 책임자와 전화번호");
      expect((e as PlaceholderError).placeholders).toHaveLength(1);
    }
  });
});

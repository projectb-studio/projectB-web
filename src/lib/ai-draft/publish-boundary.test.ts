import { describe, it, expect } from "vitest";
import { sanitizeBlocks } from "@/lib/detail-blocks/sanitize-blocks";

const UUID = "11111111-1111-4111-8111-111111111111";

/**
 * 발행 경계 재검증 — approve 시 sanitizeBlocks 를 통과해야만 라이브로 나간다.
 * 이 테스트는 AI 가 만든 블록도 동일 신뢰 경계를 거친다는 불변식을 검증한다.
 */
describe("publish boundary (sanitizeBlocks)", () => {
  it("strips disallowed markup from richtext (e.g. injected <script>)", () => {
    const out = sanitizeBlocks([
      {
        id: UUID,
        type: "richtext",
        data: { html: "<p>정상</p><script>alert(1)</script>" },
      },
    ]);
    expect(out[0].type).toBe("richtext");
    if (out[0].type === "richtext") {
      expect(out[0].data.html).not.toContain("<script>");
      expect(out[0].data.html).toContain("정상");
    }
  });

  it("rejects images from a non-allowlisted origin", () => {
    expect(() =>
      sanitizeBlocks([
        {
          id: UUID,
          type: "image",
          data: { url: "https://evil.example.com/x.jpg", alt: "x", width: "full" },
        },
      ])
    ).toThrow();
  });

  it("rejects structurally invalid blocks", () => {
    expect(() =>
      sanitizeBlocks([{ id: UUID, type: "youtube", data: { videoId: "too-short" } }])
    ).toThrow();
  });
});

import { describe, it, expect } from "vitest";
import { BlockSchema, BlocksSchema } from "./schema";

describe("BlockSchema", () => {
  it("accepts a valid image block", () => {
    const ok = BlockSchema.safeParse({
      id: "11111111-1111-4111-8111-111111111111",
      type: "image",
      data: { url: "https://cdn.example.com/a.jpg", alt: "a", width: "full" },
    });
    expect(ok.success).toBe(true);
  });

  it("rejects invalid youtube videoId", () => {
    const bad = BlockSchema.safeParse({
      id: "11111111-1111-4111-8111-111111111111",
      type: "youtube",
      data: { videoId: "too-short" },
    });
    expect(bad.success).toBe(false);
  });

  it("rejects unknown block type", () => {
    const bad = BlockSchema.safeParse({
      id: "11111111-1111-4111-8111-111111111111",
      type: "nope" as never,
      data: {},
    });
    expect(bad.success).toBe(false);
  });

  it("accepts spec block with empty rows", () => {
    const ok = BlockSchema.safeParse({
      id: "11111111-1111-4111-8111-111111111111",
      type: "spec",
      data: { rows: [] },
    });
    expect(ok.success).toBe(true);
  });
});

describe("BlocksSchema", () => {
  it("rejects arrays longer than 50", () => {
    const arr = Array.from({ length: 51 }, (_, i) => ({
      id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
      type: "image" as const,
      data: { url: "https://x.y/z.jpg", alt: "a", width: "full" as const },
    }));
    expect(BlocksSchema.safeParse(arr).success).toBe(false);
  });
});

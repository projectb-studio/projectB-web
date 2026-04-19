import { describe, it, expect } from "vitest";
import { sanitizeRichText } from "./sanitize";

describe("sanitizeRichText", () => {
  it("keeps allowed tags", () => {
    expect(sanitizeRichText("<p>hi <strong>there</strong></p>")).toBe(
      "<p>hi <strong>there</strong></p>"
    );
  });
  it("strips script tags", () => {
    const out = sanitizeRichText('<p>ok</p><script>alert(1)</script>');
    expect(out).not.toContain("<script>");
  });
  it("removes on* handlers", () => {
    const out = sanitizeRichText('<a href="/" onclick="x">a</a>');
    expect(out).not.toContain("onclick");
  });
  it("strips javascript: URLs", () => {
    const out = sanitizeRichText('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain("javascript:");
  });
});

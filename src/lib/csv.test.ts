import { describe, it, expect } from "vitest";
import { toCsv, escapeCell } from "./csv";

describe("escapeCell", () => {
  it("leaves plain text untouched", () => {
    expect(escapeCell("hello")).toBe("hello");
  });
  it("wraps comma-containing cells in quotes", () => {
    expect(escapeCell("a,b")).toBe('"a,b"');
  });
  it("escapes embedded double quotes", () => {
    expect(escapeCell('say "hi"')).toBe('"say ""hi"""');
  });
  it("wraps newline-containing cells", () => {
    expect(escapeCell("a\nb")).toBe('"a\nb"');
  });
  it("coerces null/undefined to empty", () => {
    expect(escapeCell(null)).toBe("");
    expect(escapeCell(undefined)).toBe("");
  });
});

describe("toCsv", () => {
  it("prepends UTF-8 BOM", () => {
    const out = toCsv(["a"], [["b"]]);
    expect(out.charCodeAt(0)).toBe(0xfeff);
  });
  it("joins header and rows with CRLF", () => {
    const out = toCsv(["a", "b"], [["1", "2"], ["3", "4"]]);
    expect(out.slice(1)).toBe("a,b\r\n1,2\r\n3,4");
  });
  it("escapes cells containing comma", () => {
    const out = toCsv(["n"], [["a,b"]]);
    expect(out.slice(1)).toBe('n\r\n"a,b"');
  });
});

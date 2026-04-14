import { describe, it, expect } from "vitest";
import { assertNotBlocked, BlockedError } from "./require-active-user";

describe("assertNotBlocked", () => {
  it("passes when user is not blocked", () => {
    expect(() => assertNotBlocked({ id: "u1", is_blocked: false })).not.toThrow();
  });
  it("throws BlockedError when user is blocked", () => {
    expect(() => assertNotBlocked({ id: "u1", is_blocked: true })).toThrow(BlockedError);
  });
  it("passes when is_blocked is missing (treated as not blocked)", () => {
    expect(() => assertNotBlocked({ id: "u1" } as never)).not.toThrow();
  });
});

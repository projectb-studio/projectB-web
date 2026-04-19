import { describe, it, expect } from "vitest";
import { parsePeriod, previousPeriod } from "./period";

describe("parsePeriod", () => {
  it("returns today for preset=today (KST)", () => {
    const p = parsePeriod({ preset: "today" }, new Date("2026-04-14T03:00:00Z"));
    expect(p.from.toISOString().slice(0, 10)).toBe("2026-04-13");
    expect(p.to.toISOString().slice(0, 10)).toBe("2026-04-14");
  });

  it("returns last 7 days for preset=7d (includes today)", () => {
    const p = parsePeriod({ preset: "7d" }, new Date("2026-04-14T03:00:00Z"));
    // KST 기준: 2026-04-14 14시 → from = 2026-04-08 00:00 KST (= 2026-04-07T15:00Z)
    expect(p.from.toISOString().slice(0, 10)).toBe("2026-04-07");
    expect(p.to.toISOString().slice(0, 10)).toBe("2026-04-14");
  });

  it("rejects to < from", () => {
    expect(() => parsePeriod({ from: "2026-04-10", to: "2026-04-01" })).toThrow();
  });

  it("rejects missing range when preset is absent", () => {
    expect(() => parsePeriod({})).toThrow();
  });
});

describe("previousPeriod", () => {
  it("returns the equally-long previous window", () => {
    const p = parsePeriod({ from: "2026-04-08", to: "2026-04-14" });
    const prev = previousPeriod(p);
    // 7일 구간이므로 직전 7일
    const span = p.to.getTime() - p.from.getTime();
    const prevSpan = prev.to.getTime() - prev.from.getTime();
    expect(Math.abs(prevSpan - span)).toBeLessThan(1000); // ~1초 오차 허용
    expect(prev.to.getTime()).toBeLessThan(p.from.getTime());
  });
});

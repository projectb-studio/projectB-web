import { describe, it, expect } from "vitest";
import { formatDateISO } from "./utils";

describe("formatDateISO", () => {
  it("YYYY-MM-DD 로 만든다", () => {
    expect(formatDateISO(new Date(2026, 3, 24, 13, 52))).toBe("2026-04-24");
  });

  it("월·일을 두 자리로 채운다", () => {
    expect(formatDateISO(new Date(2026, 0, 5, 9, 7))).toBe("2026-01-05");
  });

  it("시각을 떼어낸다 (하루 중 언제든 같은 날짜)", () => {
    const early = formatDateISO(new Date(2026, 3, 24, 0, 1));
    const late = formatDateISO(new Date(2026, 3, 24, 23, 59));
    expect(early).toBe(late);
  });

  it("ISO 문자열도 받는다", () => {
    // 리뷰 API 가 넘겨주는 형태 그대로.
    const kstNoon = new Date(2026, 3, 24, 12, 0).toISOString();
    expect(formatDateISO(kstNoon)).toBe("2026-04-24");
  });

  it("현지 시각 기준이라 UTC 로 날짜가 밀리지 않는다", () => {
    // KST 오전 8시는 UTC 로는 전날 23시다. 화면에는 사용자의 날짜가 보여야 한다.
    const morning = new Date(2026, 3, 24, 8, 30);
    expect(formatDateISO(morning)).toBe("2026-04-24");
  });
});

const DAY_MS = 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export type Period = { from: Date; to: Date };
export type Preset = "today" | "7d" | "30d" | "90d";

function startOfKstDay(d: Date): Date {
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  kst.setUTCHours(0, 0, 0, 0);
  return new Date(kst.getTime() - KST_OFFSET_MS);
}

function endOfKstDay(d: Date): Date {
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  kst.setUTCHours(23, 59, 59, 999);
  return new Date(kst.getTime() - KST_OFFSET_MS);
}

export function parsePeriod(
  input: { preset?: Preset; from?: string; to?: string },
  now: Date = new Date()
): Period {
  if (input.preset) {
    const to = endOfKstDay(now);
    const days =
      input.preset === "today"
        ? 0
        : input.preset === "7d"
          ? 6
          : input.preset === "30d"
            ? 29
            : 89;
    const from = startOfKstDay(new Date(now.getTime() - days * DAY_MS));
    return { from, to };
  }
  if (!input.from || !input.to) throw new Error("missing period");
  // YYYY-MM-DD 를 KST 자정으로 해석
  const from = startOfKstDay(new Date(input.from + "T00:00:00+09:00"));
  const to = endOfKstDay(new Date(input.to + "T00:00:00+09:00"));
  if (to.getTime() < from.getTime()) throw new Error("to must be >= from");
  return { from, to };
}

export function previousPeriod(p: Period): Period {
  const span = p.to.getTime() - p.from.getTime();
  const prevTo = new Date(p.from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - span);
  return { from: prevFrom, to: prevTo };
}

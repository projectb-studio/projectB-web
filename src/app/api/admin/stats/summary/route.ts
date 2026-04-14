import { NextResponse } from "next/server";
import { statsGuard } from "@/lib/stats/api";
import { previousPeriod } from "@/lib/stats/period";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 60;

export async function GET(req: Request) {
  const g = await statsGuard(req);
  if (g.error) return g.error;

  const supabase = createAdminClient();

  const [cur, prev] = await Promise.all([
    supabase.rpc("pb_stats_summary", {
      p_from: g.period.from.toISOString(),
      p_to: g.period.to.toISOString(),
    }),
    (async () => {
      const p = previousPeriod(g.period);
      return supabase.rpc("pb_stats_summary", {
        p_from: p.from.toISOString(),
        p_to: p.to.toISOString(),
      });
    })(),
  ]);

  return NextResponse.json({
    current: (cur.data as unknown[] | null)?.[0] ?? null,
    previous: (prev.data as unknown[] | null)?.[0] ?? null,
  });
}

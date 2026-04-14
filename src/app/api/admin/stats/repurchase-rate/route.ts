import { NextResponse } from "next/server";
import { statsGuard } from "@/lib/stats/api";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 300; // 재구매율은 5분 캐시

export async function GET(req: Request) {
  const g = await statsGuard(req);
  if (g.error) return g.error;

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("pb_stats_repurchase_rate", {
    p_from: g.period.from.toISOString(),
    p_to: g.period.to.toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

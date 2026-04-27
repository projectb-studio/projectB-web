import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// 포트원 기본 수수료 (약 3.3% + VAT). 추후 실제 정산 데이터로 대체.
const PG_FEE_RATE = 0.033;

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const groupBy = searchParams.get("group_by") ?? "day"; // day | order

  const supabase = createAdminClient();
  let query = (supabase.from("pb_orders") as ReturnType<typeof supabase.from>)
    .select("id, status, total_amount, shipping_fee, payment_method, created_at, order_name, customer_name")
    .in("status", ["paid", "preparing", "shipped", "delivered", "confirmed"])
    .order("created_at", { ascending: false });

  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orders = (data ?? []) as Array<{
    id: string;
    status: string;
    total_amount: number;
    shipping_fee: number;
    payment_method: string | null;
    created_at: string;
    order_name: string | null;
    customer_name: string | null;
  }>;

  const enriched = orders.map((o) => {
    const fee = Math.round(o.total_amount * PG_FEE_RATE);
    const net = o.total_amount - fee;
    return { ...o, fee, net };
  });

  if (groupBy === "day") {
    const byDay: Record<string, { date: string; gross: number; fee: number; net: number; count: number }> = {};
    for (const o of enriched) {
      const date = o.created_at.slice(0, 10);
      if (!byDay[date]) {
        byDay[date] = { date, gross: 0, fee: 0, net: 0, count: 0 };
      }
      byDay[date].gross += o.total_amount;
      byDay[date].fee += o.fee;
      byDay[date].net += o.net;
      byDay[date].count += 1;
    }
    return NextResponse.json({
      group_by: "day",
      rows: Object.values(byDay).sort((a, b) => (a.date < b.date ? 1 : -1)),
    });
  }

  return NextResponse.json({ group_by: "order", rows: enriched });
}

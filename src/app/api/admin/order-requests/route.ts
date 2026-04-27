import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderRequestType } from "@/types/database";

const ALLOWED_TYPES: readonly OrderRequestType[] = ["cancel", "return", "exchange"];

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get("type");
  const statusParam = searchParams.get("status");

  const supabase = createAdminClient();
  let query = (supabase.from("pb_order_requests") as ReturnType<typeof supabase.from>)
    .select("*, pb_orders(id, order_name, customer_name, customer_phone, total_amount, status)")
    .order("requested_at", { ascending: false });

  if (typeParam && ALLOWED_TYPES.includes(typeParam as OrderRequestType)) {
    query = query.eq("type", typeParam);
  }

  if (statusParam) {
    query = query.eq("status", statusParam);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { order_id, type, reason, refund_amount, admin_note } = body as {
    order_id?: string;
    type?: OrderRequestType;
    reason?: string | null;
    refund_amount?: number | null;
    admin_note?: string | null;
  };

  if (!order_id || !type || !ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("pb_order_requests") as ReturnType<typeof supabase.from>)
    .insert({
      order_id,
      type,
      status: "pending",
      reason: reason ?? null,
      refund_amount: refund_amount ?? null,
      admin_note: admin_note ?? null,
      processed_at: null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

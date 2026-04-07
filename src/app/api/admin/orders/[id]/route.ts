import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const [orderRes, itemsRes] = await Promise.all([
    supabase.from("pb_orders").select("*").eq("id", id).single(),
    supabase.from("pb_order_items").select("*").eq("order_id", id),
  ]);

  if (orderRes.error) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json({
    ...orderRes.data,
    items: itemsRes.data ?? [],
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("pb_orders")
    .update(body)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

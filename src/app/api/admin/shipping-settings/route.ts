import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("pb_shipping_settings") as ReturnType<typeof supabase.from>)
    .select("*")
    .eq("id", 1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    default_fee,
    free_threshold,
    courier,
    return_address,
    estimated_days,
    notes,
  } = body as {
    default_fee?: number;
    free_threshold?: number;
    courier?: string;
    return_address?: Record<string, unknown>;
    estimated_days?: string;
    notes?: string | null;
  };

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (default_fee !== undefined) update.default_fee = default_fee;
  if (free_threshold !== undefined) update.free_threshold = free_threshold;
  if (courier !== undefined) update.courier = courier;
  if (return_address !== undefined) update.return_address = return_address;
  if (estimated_days !== undefined) update.estimated_days = estimated_days;
  if (notes !== undefined) update.notes = notes;

  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("pb_shipping_settings") as ReturnType<typeof supabase.from>)
    .update(update)
    .eq("id", 1)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

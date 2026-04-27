import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CouponType } from "@/types/database";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("pb_coupons") as ReturnType<typeof supabase.from>)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    code,
    name,
    type,
    value,
    min_order_amount,
    max_discount_amount,
    usage_limit,
    valid_from,
    valid_until,
    is_active,
  } = body as {
    code?: string;
    name?: string;
    type?: CouponType;
    value?: number;
    min_order_amount?: number;
    max_discount_amount?: number | null;
    usage_limit?: number | null;
    valid_from?: string | null;
    valid_until?: string | null;
    is_active?: boolean;
  };

  if (!code || !name || !type || value === undefined) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }
  if (type !== "percent" && type !== "amount") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("pb_coupons") as ReturnType<typeof supabase.from>)
    .insert({
      code,
      name,
      type,
      value,
      min_order_amount: min_order_amount ?? 0,
      max_discount_amount: max_discount_amount ?? null,
      usage_limit: usage_limit ?? null,
      valid_from: valid_from ?? null,
      valid_until: valid_until ?? null,
      is_active: is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "쿠폰 코드가 중복됩니다" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

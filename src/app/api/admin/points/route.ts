import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PointType } from "@/types/database";

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");

  const supabase = createAdminClient();
  let query = (supabase.from("pb_points") as ReturnType<typeof supabase.from>)
    .select("*, pb_users_profile!inner(full_name, user_id)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// 수동 지급/차감
export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { user_id, amount, type, reason } = body as {
    user_id?: string;
    amount?: number;
    type?: PointType;
    reason?: string | null;
  };

  if (!user_id || amount === undefined || !type) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 현재 잔액 조회
  const { data: profile, error: pErr } = await (supabase.from("pb_users_profile") as ReturnType<typeof supabase.from>)
    .select("point_balance")
    .eq("user_id", user_id)
    .single();

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const currentBalance = (profile as unknown as { point_balance: number } | null)?.point_balance ?? 0;
  const balanceAfter = currentBalance + amount;

  if (balanceAfter < 0) {
    return NextResponse.json({ error: "잔액 부족 — 음수 잔액이 됩니다" }, { status: 400 });
  }

  // 포인트 기록 생성
  const { data: record, error: rErr } = await (supabase.from("pb_points") as ReturnType<typeof supabase.from>)
    .insert({
      user_id,
      amount,
      type,
      reason: reason ?? null,
      order_id: null,
      balance_after: balanceAfter,
    })
    .select()
    .single();

  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  // 프로필 잔액 업데이트
  const { error: uErr } = await (supabase.from("pb_users_profile") as ReturnType<typeof supabase.from>)
    .update({ point_balance: balanceAfter })
    .eq("user_id", user_id);

  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });

  return NextResponse.json(record);
}

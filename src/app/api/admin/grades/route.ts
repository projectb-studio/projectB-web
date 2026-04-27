import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MemberGrade } from "@/types/database";

const ALLOWED_GRADES: readonly MemberGrade[] = ["bronze", "silver", "gold", "vip"];

// 등급별 회원 수 + 등급별 총 구매액 통계
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("pb_users_profile") as ReturnType<typeof supabase.from>)
    .select("user_id, full_name, grade, total_spent, point_balance")
    .eq("role", "customer")
    .order("total_spent", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as Array<{
    user_id: string;
    full_name: string | null;
    grade: MemberGrade;
    total_spent: number;
    point_balance: number;
  }>;

  const stats: Record<MemberGrade, { count: number; total_spent: number }> = {
    bronze: { count: 0, total_spent: 0 },
    silver: { count: 0, total_spent: 0 },
    gold: { count: 0, total_spent: 0 },
    vip: { count: 0, total_spent: 0 },
  };

  for (const r of rows) {
    if (ALLOWED_GRADES.includes(r.grade)) {
      stats[r.grade].count += 1;
      stats[r.grade].total_spent += r.total_spent;
    }
  }

  return NextResponse.json({ stats, members: rows });
}

// 특정 회원 등급 변경
export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { user_id, grade } = body as { user_id?: string; grade?: MemberGrade };

  if (!user_id || !grade || !ALLOWED_GRADES.includes(grade)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("pb_users_profile") as ReturnType<typeof supabase.from>)
    .update({ grade })
    .eq("user_id", user_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

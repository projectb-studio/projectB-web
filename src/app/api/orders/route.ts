import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "인증이 필요합니다." },
      { status: 401 }
    );
  }

  const { data: orders, error } = await supabase
    .from("pb_orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: "주문 조회 실패" },
      { status: 500 }
    );
  }

  return NextResponse.json({ orders });
}

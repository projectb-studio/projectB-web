import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const PatchSchema = z.object({
  admin_memo: z.string().max(5000).optional(),
  grade: z.enum(["normal", "vip"]).optional(),
  is_blocked: z.boolean().optional(),
});

// params.id = auth user_id
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const { data: profile, error: profileErr } = await supabase
    .from("pb_users_profile")
    .select("user_id, full_name, phone, grade, is_blocked, admin_memo, created_at")
    .eq("user_id", params.id)
    .single();

  if (profileErr || !profile) {
    return NextResponse.json({ error: profileErr?.message ?? "not found" }, { status: 404 });
  }

  // email 조회는 auth.users 에서
  const { data: authUser } = await supabase.auth.admin.getUserById(params.id);

  const { data: orders } = await supabase
    .from("pb_orders")
    .select("id, status, total_amount, order_name, created_at")
    .eq("user_id", params.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { count: reviewCount } = await supabase
    .from("pb_reviews")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", params.id);

  return NextResponse.json({
    user: {
      ...profile,
      email: authUser?.user?.email ?? null,
    },
    orders: orders ?? [],
    reviewCount: reviewCount ?? 0,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = PatchSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.format() }, { status: 422 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("pb_users_profile")
    .update(body.data)
    .eq("user_id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pb_reviews")
    .select("*, pb_products(name)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const reviews = (data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    product_name: (r.pb_products as Record<string, unknown> | null)?.name ?? "삭제된 상품",
    pb_products: undefined,
  }));

  return NextResponse.json(reviews);
}

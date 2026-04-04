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

  const { data, error } = await supabase
    .from("pb_reviews")
    .select("*, pb_products(name, slug)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  return NextResponse.json({
    ...data,
    product_name: (data.pb_products as Record<string, unknown> | null)?.name ?? "삭제된 상품",
    product_slug: (data.pb_products as Record<string, unknown> | null)?.slug ?? null,
    pb_products: undefined,
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {};
  if ("admin_reply" in body) updateData.admin_reply = body.admin_reply;
  if ("is_hidden" in body) updateData.is_hidden = body.is_hidden;

  const { error } = await supabase
    .from("pb_reviews")
    .update(updateData)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase.from("pb_reviews").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

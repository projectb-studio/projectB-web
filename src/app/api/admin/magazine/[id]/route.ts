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
    .from("pb_magazine")
    .select("*, pb_magazine_categories(name)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  return NextResponse.json({
    ...data,
    category_name: (data.pb_magazine_categories as Record<string, unknown> | null)?.name ?? null,
    pb_magazine_categories: undefined,
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {};
  if ("title" in body) updateData.title = body.title;
  if ("slug" in body) updateData.slug = body.slug;
  if ("excerpt" in body) updateData.excerpt = body.excerpt;
  if ("content" in body) updateData.content = body.content;
  if ("image_url" in body) updateData.image_url = body.image_url;
  if ("category_id" in body) updateData.category_id = body.category_id;
  if ("is_published" in body) updateData.is_published = body.is_published;

  const { error } = await supabase
    .from("pb_magazine")
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

  const { error } = await supabase.from("pb_magazine").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

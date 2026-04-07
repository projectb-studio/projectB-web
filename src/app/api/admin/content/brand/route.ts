import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pb_brand_content")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sections = await request.json();
  if (!Array.isArray(sections)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const supabase = createAdminClient();

  for (const section of sections) {
    await supabase
      .from("pb_brand_content")
      .upsert({
        section_key: section.section_key,
        title: section.title ?? null,
        content: section.content ?? null,
        image_url: section.image_url ?? null,
        sort_order: section.sort_order ?? 0,
      }, { onConflict: "section_key" });
  }

  return NextResponse.json({ success: true });
}

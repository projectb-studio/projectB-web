import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { THEME_PRESETS, DEFAULT_THEME_ID } from "@/constants/themes";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("pb_site_settings")
    .select("*")
    .limit(1)
    .single();

  return NextResponse.json({ theme_id: data?.theme_id ?? DEFAULT_THEME_ID });
}

export async function PUT(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const themeId = body.theme_id;

  if (!THEME_PRESETS.some((t) => t.id === themeId)) {
    return NextResponse.json({ error: "Invalid theme_id" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("pb_site_settings")
    .select("id")
    .limit(1)
    .single();

  if (existing) {
    await supabase
      .from("pb_site_settings")
      .update({ theme_id: themeId })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("pb_site_settings")
      .insert({ theme_id: themeId });
  }

  return NextResponse.json({ success: true, theme_id: themeId });
}

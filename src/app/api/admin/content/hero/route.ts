import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const [settingsRes, slidesRes] = await Promise.all([
    supabase.from("pb_hero_settings").select("*").limit(1).single(),
    supabase.from("pb_hero_slides").select("*").order("sort_order", { ascending: true }),
  ]);

  return NextResponse.json({
    settings: settingsRes.data,
    slides: slidesRes.data ?? [],
  });
}

export async function PUT(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { settings, slides } = await request.json();
  const supabase = createAdminClient();

  // Update settings (upsert single row)
  if (settings) {
    const { data: existing } = await supabase.from("pb_hero_settings").select("id").limit(1).single();
    if (existing) {
      await supabase.from("pb_hero_settings").update(settings).eq("id", existing.id);
    } else {
      await supabase.from("pb_hero_settings").insert(settings);
    }
  }

  // Replace slides
  if (slides && Array.isArray(slides)) {
    await supabase.from("pb_hero_slides").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (slides.length > 0) {
      const rows = slides.map((s: { type: string; media_url: string; alt: string; is_active: boolean }, i: number) => ({
        type: s.type || "image",
        media_url: s.media_url,
        alt: s.alt || "",
        sort_order: i,
        is_active: s.is_active ?? true,
      }));
      await supabase.from("pb_hero_slides").insert(rows);
    }
  }

  return NextResponse.json({ success: true });
}

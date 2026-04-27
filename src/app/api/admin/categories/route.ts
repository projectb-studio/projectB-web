import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("pb_categories") as ReturnType<typeof supabase.from>)
    .select("*")
    .order("display_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { slug, name, display_order, is_visible, description } = body as {
    slug?: string;
    name?: string;
    display_order?: number;
    is_visible?: boolean;
    description?: string | null;
  };

  if (!slug || !name) {
    return NextResponse.json({ error: "slug and name are required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("pb_categories") as ReturnType<typeof supabase.from>)
    .insert({
      slug,
      name,
      display_order: display_order ?? 0,
      is_visible: is_visible ?? true,
      description: description ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "slug가 중복됩니다" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

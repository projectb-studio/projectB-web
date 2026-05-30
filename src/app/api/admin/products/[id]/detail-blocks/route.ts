import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { type Block } from "@/lib/detail-blocks/schema";
import { sanitizeBlocks } from "@/lib/detail-blocks/sanitize-blocks";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pb_products")
    .select("detail_blocks")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "not found" }, { status: 404 });
  }

  const blocks = ((data as { detail_blocks?: unknown }).detail_blocks ?? []) as unknown;
  return NextResponse.json({ blocks });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let blocks: Block[];
  try {
    const body = await req.json();
    blocks = sanitizeBlocks(body.blocks);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 422 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("pb_products")
    .update({ detail_blocks: blocks } as never)
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

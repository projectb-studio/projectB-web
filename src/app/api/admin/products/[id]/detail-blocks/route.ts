import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlocksSchema, type Block } from "@/lib/detail-blocks/schema";
import { sanitizeRichText } from "@/lib/detail-blocks/sanitize";

const R2_PREFIX = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
// Supabase Storage URL도 허용 (현재 업로드 경로)
const SUPABASE_PREFIX =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "") + "/storage/v1/object/public/";

function isAllowedImageUrl(url: string): boolean {
  if (R2_PREFIX && url.startsWith(R2_PREFIX)) return true;
  if (SUPABASE_PREFIX && url.startsWith(SUPABASE_PREFIX)) return true;
  return false;
}

function sanitizeBlocks(input: unknown): Block[] {
  const parsed = BlocksSchema.parse(input);
  return parsed.map((b) => {
    if (b.type === "richtext") {
      return { ...b, data: { html: sanitizeRichText(b.data.html) } };
    }
    if (b.type === "twocol") {
      if (!isAllowedImageUrl(b.data.image.url) && b.data.image.url !== "") {
        throw new Error("twocol image must be on R2 or Supabase Storage");
      }
      return {
        ...b,
        data: { ...b.data, text: { html: sanitizeRichText(b.data.text.html) } },
      };
    }
    if (b.type === "image" && b.data.url !== "" && !isAllowedImageUrl(b.data.url)) {
      throw new Error("image url must be on R2 or Supabase Storage");
    }
    if (b.type === "gallery") {
      b.data.images.forEach((im) => {
        if (im.url !== "" && !isAllowedImageUrl(im.url)) {
          throw new Error("gallery url must be on R2 or Supabase Storage");
        }
      });
    }
    return b;
  });
}

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

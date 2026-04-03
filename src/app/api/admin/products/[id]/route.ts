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

  const { data: product, error } = await supabase
    .from("pb_products")
    .select("*, pb_product_images(*), pb_product_options(*)")
    .eq("id", id)
    .single();

  if (error || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { images, options, ...productData } = body;

  const supabase = createAdminClient();

  // Update product fields
  const { error: updateError } = await supabase
    .from("pb_products")
    .update(productData)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Replace images: delete all then re-insert
  if (images && Array.isArray(images)) {
    await supabase.from("pb_product_images").delete().eq("product_id", id);
    if (images.length > 0) {
      const imageRows = images.map((img: { url: string; sort_order: number }) => ({
        product_id: id,
        url: img.url,
        sort_order: img.sort_order,
      }));
      await supabase.from("pb_product_images").insert(imageRows);
    }
  }

  // Replace options: delete all then re-insert
  if (options && Array.isArray(options)) {
    await supabase.from("pb_product_options").delete().eq("product_id", id);
    if (options.length > 0) {
      const optionRows = options.map((opt: { type: string; name: string; value?: string; sort_order: number }) => ({
        product_id: id,
        type: opt.type,
        name: opt.name,
        value: opt.value ?? null,
        sort_order: opt.sort_order,
      }));
      await supabase.from("pb_product_options").insert(optionRows);
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("pb_products")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

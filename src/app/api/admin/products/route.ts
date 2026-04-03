import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data: products, error } = await supabase
    .from("pb_products")
    .select("*, pb_product_images(*), pb_product_options(*)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { images, options, ...productData } = body;

  const supabase = createAdminClient();

  // Insert product
  const { data: product, error: productError } = await supabase
    .from("pb_products")
    .insert(productData)
    .select()
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: productError?.message ?? "Failed to create product" }, { status: 500 });
  }

  const productId = product.id;

  // Insert images
  if (images && Array.isArray(images) && images.length > 0) {
    const imageRows = images.map((img: { url: string; sort_order: number }) => ({
      product_id: productId,
      url: img.url,
      sort_order: img.sort_order,
    }));
    await supabase.from("pb_product_images").insert(imageRows);
  }

  // Insert options
  if (options && Array.isArray(options) && options.length > 0) {
    const optionRows = options.map((opt: { type: string; name: string; value?: string; sort_order: number }) => ({
      product_id: productId,
      type: opt.type,
      name: opt.name,
      value: opt.value ?? null,
      sort_order: opt.sort_order,
    }));
    await supabase.from("pb_product_options").insert(optionRows);
  }

  return NextResponse.json(product, { status: 201 });
}

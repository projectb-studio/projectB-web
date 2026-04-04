import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productSlug = searchParams.get("product");

  const supabase = await createClient();

  let query = supabase
    .from("pb_reviews")
    .select("*, pb_products(name, slug)")
    .eq("is_published", true)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });

  if (productSlug) {
    query = query.eq("pb_products.slug", productSlug);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const reviews = (data ?? []).map((r: Record<string, unknown>) => {
    const images = r.image_urls as string[] | null;
    return {
      id: r.id as string,
      productName: ((r.pb_products as Record<string, unknown> | null)?.name as string) ?? "삭제된 상품",
      productSlug: ((r.pb_products as Record<string, unknown> | null)?.slug as string) ?? "",
      author: r.author_name as string,
      rating: r.rating as number,
      content: (r.content as string) ?? "",
      imageUrl: images && images.length > 0 ? images[0] : null,
      date: r.created_at as string,
    };
  });

  return NextResponse.json(reviews);
}

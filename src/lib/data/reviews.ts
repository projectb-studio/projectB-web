import { createClient } from "@/lib/supabase/server";

export interface Review {
  id: string;
  productName: string;
  productSlug: string;
  author: string;
  rating: number;
  content: string;
  imageUrl: string;
  date: string;
}

export async function getReviews(): Promise<Review[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pb_reviews")
    .select("*, pb_products(name, slug)")
    .eq("is_published", true)
    .eq("is_hidden", false)
    .not("image_urls", "is", null)
    .order("created_at", { ascending: false });

  return (data ?? [])
    .filter((r: Record<string, unknown>) => {
      const urls = r.image_urls as string[] | null;
      return urls && urls.length > 0;
    })
    .map((r: Record<string, unknown>) => ({
      id: r.id as string,
      productName: ((r.pb_products as Record<string, unknown> | null)?.name as string) ?? "삭제된 상품",
      productSlug: ((r.pb_products as Record<string, unknown> | null)?.slug as string) ?? "",
      author: r.author_name as string,
      rating: r.rating as number,
      content: (r.content as string) ?? "",
      imageUrl: (r.image_urls as string[])[0],
      date: r.created_at as string,
    }));
}

import { createClient } from "@/lib/supabase/server";

export interface BrandSection {
  sectionKey: string;
  title: string | null;
  content: string | null;
  imageUrl: string | null;
}

export async function getBrandContent(): Promise<BrandSection[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pb_brand_content")
    .select("section_key, title, content, image_url, sort_order")
    .order("sort_order", { ascending: true });

  if (!data) return [];

  return (data as Record<string, unknown>[]).map((row) => ({
    sectionKey: row.section_key as string,
    title: row.title as string | null,
    content: row.content as string | null,
    imageUrl: row.image_url as string | null,
  }));
}

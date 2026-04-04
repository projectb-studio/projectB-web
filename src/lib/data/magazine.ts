import { createClient } from "@/lib/supabase/server";

export interface MagazinePost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  content: string | null;
  category: string;
  categoryId: string | null;
  date: string;
}

export interface MagazineCategory {
  id: string;
  name: string;
}

export async function getMagazinePosts(categoryId?: string): Promise<MagazinePost[]> {
  const supabase = await createClient();

  let query = supabase
    .from("pb_magazine")
    .select("*, pb_magazine_categories(name)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data } = await query;

  return (data ?? []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    title: p.title as string,
    excerpt: (p.excerpt as string) ?? "",
    slug: p.slug as string,
    imageUrl: (p.image_url as string) ?? "",
    content: p.content as string | null,
    category: ((p.pb_magazine_categories as Record<string, unknown> | null)?.name as string) ?? "",
    categoryId: p.category_id as string | null,
    date: p.created_at as string,
  }));
}

export async function getMagazinePost(slug: string): Promise<MagazinePost | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pb_magazine")
    .select("*, pb_magazine_categories(name)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) return null;

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    title: row.title as string,
    excerpt: (row.excerpt as string) ?? "",
    slug: row.slug as string,
    imageUrl: (row.image_url as string) ?? "",
    content: row.content as string | null,
    category: ((row.pb_magazine_categories as Record<string, unknown> | null)?.name as string) ?? "",
    categoryId: row.category_id as string | null,
    date: row.created_at as string,
  };
}

export async function getMagazineCategories(): Promise<MagazineCategory[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pb_magazine_categories")
    .select("id, name")
    .order("sort_order", { ascending: true });

  return (data ?? []) as MagazineCategory[];
}

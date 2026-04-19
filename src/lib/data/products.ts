import type { Product, ProductTag, ProductBadge } from "@/types/database";
import { ITEMS_PER_PAGE } from "@/constants/site";
import { createClient } from "@/lib/supabase/server";

// ---- Dummy product data (kept as fallback reference, not used in production) ----
/*
const DUMMY_PRODUCTS: Product[] = [
  { id: "1", name: "Ceramic vase — matte black", price: 38000, tag: "handmade", badge: null, slug: "ceramic-vase-matte-black", imageUrl: "...", options: { colors: [{ name: "Matte Black", value: "#1A1A1A" }, { name: "Ivory", value: "#F5F0E8" }] } },
  { id: "2", name: "Linen table runner — ivory", price: 28000, tag: "fabric", badge: "NEW", slug: "linen-table-runner-ivory", imageUrl: "...", options: { colors: [{ name: "Ivory", value: "#F5F0E8" }, { name: "Natural", value: "#D4C5A9" }], sizes: ["S", "L"] } },
  { id: "3", name: "Brass candle holder set", price: 52000, tag: "metal", badge: null, slug: "brass-candle-holder-set", imageUrl: "..." },
  { id: "4", name: "Wool felt coaster (4p)", price: 18000, tag: "fabric", badge: "BEST", slug: "wool-felt-coaster-4p", imageUrl: "...", options: { colors: [{ name: "Gray", value: "#8B8B8B" }, { name: "Beige", value: "#D9C9AE" }] } },
  { id: "5", name: "Oak wood tray — natural", price: 45000, tag: "wood", badge: null, slug: "oak-wood-tray-natural", imageUrl: "..." },
  { id: "6", name: "Cotton blend napkin set", price: 27500, salePrice: 22000, tag: "fabric", badge: "SALE", slug: "cotton-blend-napkin-set", imageUrl: "..." },
  { id: "7", name: "Stone incense holder", price: 32000, tag: "stone", badge: "NEW", slug: "stone-incense-holder", imageUrl: "..." },
  { id: "8", name: "Hand-blown glass cup", price: 28000, tag: "glass", badge: null, slug: "hand-blown-glass-cup", imageUrl: "..." },
  { id: "9", name: "Handwoven rattan basket", price: 42000, tag: "handmade", badge: "NEW", slug: "handwoven-rattan-basket", imageUrl: "..." },
  { id: "10", name: "Copper wire ring holder", price: 25000, tag: "metal", badge: "BEST", slug: "copper-wire-ring-holder", imageUrl: "..." },
  { id: "11", name: "Walnut cutting board — small", price: 35000, tag: "wood", badge: null, slug: "walnut-cutting-board-small", imageUrl: "..." },
  { id: "12", name: "Marble soap dish", price: 29000, tag: "stone", badge: null, slug: "marble-soap-dish", imageUrl: "..." },
  { id: "13", name: "Linen cushion cover — charcoal", price: 32000, salePrice: 25600, tag: "fabric", badge: "SALE", slug: "linen-cushion-cover-charcoal", imageUrl: "..." },
  { id: "14", name: "Borosilicate glass carafe", price: 38000, tag: "glass", badge: null, slug: "borosilicate-glass-carafe", imageUrl: "..." },
  { id: "15", name: "Clay pinch bowl set (3p)", price: 24000, tag: "handmade", badge: "BEST", slug: "clay-pinch-bowl-set-3p", imageUrl: "..." },
  { id: "16", name: "Iron candle snuffer", price: 18000, tag: "metal", badge: null, slug: "iron-candle-snuffer", imageUrl: "..." },
];
*/

// ---- DB row → Product mapper ----

function dbToProduct(
  row: Record<string, unknown>,
  images?: Record<string, unknown>[],
  options?: Record<string, unknown>[],
): Product {
  const sortedImages = (images ?? []).sort(
    (a, b) => ((a.sort_order as number) ?? 0) - ((b.sort_order as number) ?? 0),
  );
  const colorOptions = (options ?? [])
    .filter((o) => o.type === "color")
    .sort((a, b) => (a.sort_order as number) - (b.sort_order as number));
  const sizeOptions = (options ?? [])
    .filter((o) => o.type === "size")
    .sort((a, b) => (a.sort_order as number) - (b.sort_order as number));

  return {
    id: row.id as string,
    name: row.name as string,
    price: row.price as number,
    salePrice: (row.sale_price as number | null) ?? undefined,
    tag: row.tag as ProductTag,
    badge: (row.badge as ProductBadge) ?? undefined,
    slug: row.slug as string,
    imageUrl: (sortedImages[0]?.url as string) ?? "",
    images: sortedImages.map((img) => img.url as string),
    description: (row.description as string | null) ?? undefined,
    details: (row.details as string | null) ?? undefined,
    shipping: (row.shipping as string | null) ?? undefined,
    care: (row.care as string | null) ?? undefined,
    material: row.tag as string,
    detailBlocks: Array.isArray(row.detail_blocks)
      ? (row.detail_blocks as unknown[])
      : undefined,
    options:
      colorOptions.length > 0 || sizeOptions.length > 0
        ? {
            colors:
              colorOptions.length > 0
                ? colorOptions.map((c) => ({
                    name: c.name as string,
                    value: c.value as string,
                  }))
                : undefined,
            sizes:
              sizeOptions.length > 0
                ? sizeOptions.map((s) => s.name as string)
                : undefined,
          }
        : undefined,
  };
}

// ---- Exported data functions ----

// Returns products for the "New In" section:
// badge = 'NEW' products first, then others, limit 4
export async function getNewProducts(): Promise<Product[]> {
  const supabase = await createClient();

  // Fetch NEW badge products first
  const { data: newData } = await (
    supabase.from("pb_products") as ReturnType<typeof supabase.from>
  )
    .select("*, pb_product_images(*)")
    .eq("is_published", true)
    .eq("badge", "NEW")
    .order("sort_order", { ascending: true })
    .limit(4);

  const newProducts = (newData ?? []) as Record<string, unknown>[];

  if (newProducts.length >= 4) {
    return newProducts.slice(0, 4).map((row) => {
      const images = (row.pb_product_images as Record<string, unknown>[]) ?? [];
      return dbToProduct(row, images);
    });
  }

  // Fill remaining slots with other published products
  const remaining = 4 - newProducts.length;
  const newIds = newProducts.map((p) => p.id as string);

  const { data: otherData } = await (
    supabase.from("pb_products") as ReturnType<typeof supabase.from>
  )
    .select("*, pb_product_images(*)")
    .eq("is_published", true)
    .neq("badge", "NEW")
    .order("sort_order", { ascending: true })
    .limit(remaining);

  const otherProducts = ((otherData ?? []) as Record<string, unknown>[]).filter(
    (p) => !newIds.includes(p.id as string),
  );

  return [...newProducts, ...otherProducts].map((row) => {
    const images = (row.pb_product_images as Record<string, unknown>[]) ?? [];
    return dbToProduct(row, images);
  });
}

// Returns products for the "Best Sellers" section:
// badge = 'BEST' or price >= 30000, limit 4
export async function getBestSellers(): Promise<Product[]> {
  const supabase = await createClient();

  // Fetch BEST badge products first
  const { data: bestData } = await (
    supabase.from("pb_products") as ReturnType<typeof supabase.from>
  )
    .select("*, pb_product_images(*)")
    .eq("is_published", true)
    .eq("badge", "BEST")
    .order("sort_order", { ascending: true })
    .limit(4);

  const bestProducts = (bestData ?? []) as Record<string, unknown>[];

  if (bestProducts.length >= 4) {
    return bestProducts.slice(0, 4).map((row) => {
      const images = (row.pb_product_images as Record<string, unknown>[]) ?? [];
      return dbToProduct(row, images);
    });
  }

  // Fill remaining slots with high-price products (price >= 30000)
  const remaining = 4 - bestProducts.length;
  const bestIds = bestProducts.map((p) => p.id as string);

  const { data: priceData } = await (
    supabase.from("pb_products") as ReturnType<typeof supabase.from>
  )
    .select("*, pb_product_images(*)")
    .eq("is_published", true)
    .neq("badge", "BEST")
    .gte("price", 30000)
    .order("sort_order", { ascending: true })
    .limit(remaining);

  const priceProducts = ((priceData ?? []) as Record<string, unknown>[]).filter(
    (p) => !bestIds.includes(p.id as string),
  );

  return [...bestProducts, ...priceProducts].map((row) => {
    const images = (row.pb_product_images as Record<string, unknown>[]) ?? [];
    return dbToProduct(row, images);
  });
}

// Returns a single product by slug, with images and options
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await (
    supabase.from("pb_products") as ReturnType<typeof supabase.from>
  )
    .select("*, pb_product_images(*), pb_product_options(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  const images = (row.pb_product_images as Record<string, unknown>[]) ?? [];
  const options = (row.pb_product_options as Record<string, unknown>[]) ?? [];

  return dbToProduct(row, images, options);
}

// Search products by name (ILIKE, case-insensitive), limit 20
export async function searchProducts(query: string): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const supabase = await createClient();

  const { data } = await (
    supabase.from("pb_products") as ReturnType<typeof supabase.from>
  )
    .select("*, pb_product_images(*)")
    .eq("is_published", true)
    .ilike("name", `%${trimmed}%`)
    .order("sort_order", { ascending: true })
    .limit(20);

  return ((data ?? []) as Record<string, unknown>[]).map((row) => {
    const images = (row.pb_product_images as Record<string, unknown>[]) ?? [];
    return dbToProduct(row, images);
  });
}

// Returns filtered + paginated products for the Shop page
export async function getProducts(
  tag?: ProductTag | "all",
  page = 1,
): Promise<{ products: Product[]; total: number; totalPages: number }> {
  const supabase = await createClient();

  // Build base query for count
  let countQuery = (
    supabase.from("pb_products") as ReturnType<typeof supabase.from>
  )
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);

  if (tag && tag !== "all") {
    countQuery = countQuery.eq("tag", tag);
  }

  const { count } = await countQuery;
  const total = count ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Fetch paginated rows with images
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let dataQuery = (
    supabase.from("pb_products") as ReturnType<typeof supabase.from>
  )
    .select("*, pb_product_images(*)")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .range(start, end);

  if (tag && tag !== "all") {
    dataQuery = dataQuery.eq("tag", tag);
  }

  const { data } = await dataQuery;

  const products = ((data ?? []) as Record<string, unknown>[]).map((row) => {
    const images = (row.pb_product_images as Record<string, unknown>[]) ?? [];
    return dbToProduct(row, images);
  });

  return { products, total, totalPages };
}

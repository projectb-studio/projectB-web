import type { Product } from "@/types/database";

const DUMMY_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Ceramic vase — matte black",
    price: 38000,
    tag: "handmade",
    badge: null,
    slug: "ceramic-vase-matte-black",
    imageUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: "2",
    name: "Linen table runner — ivory",
    price: 28000,
    tag: "fabric",
    badge: "NEW",
    slug: "linen-table-runner-ivory",
    imageUrl: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: "3",
    name: "Brass candle holder set",
    price: 52000,
    tag: "metal",
    badge: null,
    slug: "brass-candle-holder-set",
    imageUrl: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: "4",
    name: "Wool felt coaster (4p)",
    price: 18000,
    tag: "fabric",
    badge: "BEST",
    slug: "wool-felt-coaster-4p",
    imageUrl: "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: "5",
    name: "Oak wood tray — natural",
    price: 45000,
    tag: "wood",
    badge: null,
    slug: "oak-wood-tray-natural",
    imageUrl: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: "6",
    name: "Cotton blend napkin set",
    price: 27500,
    salePrice: 22000,
    tag: "fabric",
    badge: "SALE",
    slug: "cotton-blend-napkin-set",
    imageUrl: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: "7",
    name: "Stone incense holder",
    price: 32000,
    tag: "stone",
    badge: "NEW",
    slug: "stone-incense-holder",
    imageUrl: "https://images.unsplash.com/photo-1600056809880-a46e89b2e704?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: "8",
    name: "Hand-blown glass cup",
    price: 28000,
    tag: "glass",
    badge: null,
    slug: "hand-blown-glass-cup",
    imageUrl: "https://images.unsplash.com/photo-1514651029227-c09ada3d8a33?w=600&h=600&fit=crop&crop=center",
  },
];

// Returns products for the "New In" section
// When Supabase is ready, replace the body of this function only
export async function getNewProducts(): Promise<Product[]> {
  // Returns the newest products (badge NEW first, then others by recency)
  // When Supabase is ready, replace with: ORDER BY created_at DESC LIMIT 4
  const newBadge = DUMMY_PRODUCTS.filter((p) => p.badge === "NEW");
  const others = DUMMY_PRODUCTS.filter((p) => p.badge !== "NEW");
  return [...newBadge, ...others].slice(0, 4);
}

// Returns products for the "Best Sellers" section
// When Supabase is ready, replace the body of this function only
export async function getBestSellers(): Promise<Product[]> {
  return DUMMY_PRODUCTS.filter(
    (p) => p.badge === "BEST" || p.price >= 30000
  ).slice(0, 4);
}

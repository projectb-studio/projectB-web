import type { Product } from "@/types/database";

const DUMMY_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Ceramic vase — matte black",
    price: 38000,
    tag: "handmade",
    badge: null,
    slug: "ceramic-vase-matte-black",
    imageUrl: "/images/placeholder-product.jpg",
  },
  {
    id: "2",
    name: "Linen table runner — ivory",
    price: 28000,
    tag: "fabric",
    badge: "NEW",
    slug: "linen-table-runner-ivory",
    imageUrl: "/images/placeholder-product.jpg",
  },
  {
    id: "3",
    name: "Brass candle holder set",
    price: 52000,
    tag: "metal",
    badge: null,
    slug: "brass-candle-holder-set",
    imageUrl: "/images/placeholder-product.jpg",
  },
  {
    id: "4",
    name: "Wool felt coaster (4p)",
    price: 18000,
    tag: "fabric",
    badge: "BEST",
    slug: "wool-felt-coaster-4p",
    imageUrl: "/images/placeholder-product.jpg",
  },
  {
    id: "5",
    name: "Oak wood tray — natural",
    price: 45000,
    tag: "wood",
    badge: null,
    slug: "oak-wood-tray-natural",
    imageUrl: "/images/placeholder-product.jpg",
  },
  {
    id: "6",
    name: "Cotton blend napkin set",
    price: 22000,
    salePrice: 27500,
    tag: "fabric",
    badge: "SALE",
    slug: "cotton-blend-napkin-set",
    imageUrl: "/images/placeholder-product.jpg",
  },
  {
    id: "7",
    name: "Stone incense holder",
    price: 32000,
    tag: "stone",
    badge: "NEW",
    slug: "stone-incense-holder",
    imageUrl: "/images/placeholder-product.jpg",
  },
  {
    id: "8",
    name: "Hand-blown glass cup",
    price: 28000,
    tag: "glass",
    badge: null,
    slug: "hand-blown-glass-cup",
    imageUrl: "/images/placeholder-product.jpg",
  },
];

// Returns products for the "New In" section
// When Supabase is ready, replace the body of this function only
export async function getNewProducts(): Promise<Product[]> {
  return DUMMY_PRODUCTS.filter(
    (p) => p.badge === "NEW" || p.badge === null
  ).slice(0, 4);
}

// Returns products for the "Best Sellers" section
// When Supabase is ready, replace the body of this function only
export async function getBestSellers(): Promise<Product[]> {
  return DUMMY_PRODUCTS.filter(
    (p) => p.badge === "BEST" || p.price >= 30000
  ).slice(0, 4);
}

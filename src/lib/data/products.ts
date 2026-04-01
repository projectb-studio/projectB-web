import type { Product, ProductTag } from "@/types/database";
import { ITEMS_PER_PAGE } from "@/constants/site";

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
  {
    id: "9",
    name: "Handwoven rattan basket",
    price: 42000,
    tag: "handmade",
    badge: "NEW",
    slug: "handwoven-rattan-basket",
    imageUrl: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: "10",
    name: "Copper wire ring holder",
    price: 25000,
    tag: "metal",
    badge: "BEST",
    slug: "copper-wire-ring-holder",
    imageUrl: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: "11",
    name: "Walnut cutting board — small",
    price: 35000,
    tag: "wood",
    badge: null,
    slug: "walnut-cutting-board-small",
    imageUrl: "https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: "12",
    name: "Marble soap dish",
    price: 29000,
    tag: "stone",
    badge: null,
    slug: "marble-soap-dish",
    imageUrl: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: "13",
    name: "Linen cushion cover — charcoal",
    price: 32000,
    salePrice: 25600,
    tag: "fabric",
    badge: "SALE",
    slug: "linen-cushion-cover-charcoal",
    imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: "14",
    name: "Borosilicate glass carafe",
    price: 38000,
    tag: "glass",
    badge: null,
    slug: "borosilicate-glass-carafe",
    imageUrl: "https://images.unsplash.com/photo-1570784061670-6fb0a7eb8869?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: "15",
    name: "Clay pinch bowl set (3p)",
    price: 24000,
    tag: "handmade",
    badge: "BEST",
    slug: "clay-pinch-bowl-set-3p",
    imageUrl: "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=600&h=600&fit=crop&crop=center",
  },
  {
    id: "16",
    name: "Iron candle snuffer",
    price: 18000,
    tag: "metal",
    badge: null,
    slug: "iron-candle-snuffer",
    imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&h=600&fit=crop&crop=center",
  },
];

// Returns products for the "New In" section
export async function getNewProducts(): Promise<Product[]> {
  const newBadge = DUMMY_PRODUCTS.filter((p) => p.badge === "NEW");
  const others = DUMMY_PRODUCTS.filter((p) => p.badge !== "NEW");
  return [...newBadge, ...others].slice(0, 4);
}

// Returns products for the "Best Sellers" section
export async function getBestSellers(): Promise<Product[]> {
  return DUMMY_PRODUCTS.filter(
    (p) => p.badge === "BEST" || p.price >= 30000
  ).slice(0, 4);
}

// Detail info shared across dummy products
const DUMMY_DETAIL = {
  description: "Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan's touch.",
  details: "Dimensions: approx. 15 × 10 × 8 cm\nWeight: approx. 250g\nOrigin: South Korea",
  shipping: "Free shipping on orders over ₩50,000.\nStandard delivery: 2-3 business days.\nIsland/remote areas: 3-5 business days.",
  care: "Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.",
};

// Returns a single product by slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = DUMMY_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return null;

  return {
    ...product,
    images: [
      product.imageUrl,
      product.imageUrl.replace("&crop=center", "&crop=top"),
      product.imageUrl.replace("&crop=center", "&crop=bottom"),
      product.imageUrl.replace("w=600&h=600", "w=600&h=600&blur=0"),
    ],
    ...DUMMY_DETAIL,
    material: product.tag,
  };
}

// Returns filtered + paginated products for the Shop page
export async function getProducts(
  tag?: ProductTag | "all",
  page = 1,
): Promise<{ products: Product[]; total: number; totalPages: number }> {
  const filtered =
    !tag || tag === "all"
      ? DUMMY_PRODUCTS
      : DUMMY_PRODUCTS.filter((p) => p.tag === tag);

  const total = filtered.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const products = filtered.slice(start, start + ITEMS_PER_PAGE);

  return { products, total, totalPages };
}

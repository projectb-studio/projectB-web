export const HERO_CONTENT = {
  heading: "PROJECT B",
  subtext: "Curated accessories for mindful living",
  image: "/images/hero-home.jpg",
  primaryCta: { label: "SHOP ONLINE", href: "/shop" },
  secondaryCta: { label: "VISIT STORE", href: "/store-location" },
} as const;

export const BRAND_STORE_CTA = {
  store: {
    title: "VISIT OUR\nSTORE",
    description: "오프라인 매장에서 직접 만나보세요.\n모든 제품을 직접 보고, 만지고, 느껴보세요.",
    cta: { label: "STORE LOCATION", href: "/store-location" },
  },
  brand: {
    title: "OUR\nCRAFT",
    description: "하나하나 정성을 담아 만듭니다.\n장인의 손끝에서 탄생하는 소품들.",
    cta: { label: "BRAND STORY", href: "/brand" },
  },
} as const;

export const SECTION_TITLES = {
  newIn: "NEW IN",
  bestSellers: "BEST SELLERS",
} as const;

export const VIEW_ALL_LABEL = "전체 보기" as const;

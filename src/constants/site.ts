/**
 * Project B — Site configuration & constants.
 */

export const SITE_CONFIG = {
  name: "PROJECT B",
  description: "Handcrafted accessories & lifestyle goods",
  url: "https://projectb.kr", // TODO: confirm domain
  locale: "ko-KR",
  currency: "KRW",
} as const;

export const NAV_ITEMS = [
  { label: "SHOP", href: "/shop" },
  { label: "BRAND", href: "/brand" },
  { label: "MAGAZINE", href: "/magazine" },
  { label: "STORE", href: "/store-location" },
  { label: "REVIEWS", href: "/reviews" },
] as const;

export const FOOTER_LINKS = {
  cs: [
    { label: "FAQ", href: "/cs?tab=faq" },
    { label: "1:1 문의", href: "/cs?tab=inquiry" },
    { label: "교환/반품", href: "/cs?tab=return" },
  ],
  info: [
    { label: "브랜드 소개", href: "/brand" },
    { label: "공지사항", href: "/notice" },
    { label: "이벤트", href: "/notice?tab=event" },
  ],
  legal: [
    { label: "이용약관", href: "/terms" },
    { label: "개인정보처리방침", href: "/privacy" },
  ],
} as const;

export const PRODUCT_TAGS = [
  "all",
  "handmade",
  "fabric",
  "metal",
  "wood",
  "stone",
  "glass",
] as const;

export type ProductTag = (typeof PRODUCT_TAGS)[number];

export const FREE_SHIPPING_THRESHOLD = 50_000; // 5만원 이상 무료배송

export const ITEMS_PER_PAGE = 12;

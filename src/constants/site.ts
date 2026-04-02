/**
 * Project B — Site configuration & constants.
 */

export const SITE_CONFIG = {
  name: "PROJECT B",
  description: "Handcrafted accessories & lifestyle goods",
  url: "https://projectb.kr",
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

export const STORE_INFO = {
  name: "PROJECT B STORE",
  address: "서울특별시 중구 다산로 240 동원빌딩",
  addressEn: "240, Dasan-ro, Jung-gu, Seoul (Dongwon Bldg.)",
  hours: [
    { days: "MON — SAT", time: "11:00 — 20:00" },
    { days: "SUN & HOLIDAYS", time: "CLOSED" },
  ],
  phone: "010-2122-0691",
  kakao: "@projectb",
  instagram: "@project_b_sindang",
  instagramUrl: "https://www.instagram.com/project_b_sindang",
  mapQuery: "서울특별시 중구 다산로 240 동원빌딩",
} as const;

export const BUSINESS_INFO = {
  companyName: "프로젝트비(PROJECT B)",
  representative: "이기복",
  businessNumber: "611-43-00831",
  address: "서울특별시 중구 다산로 240. 1층 102호(신당동, 동원빌딩)",
  phone: "010-2122-0691",
  email: "project_b_sindang@naver.com",
} as const;

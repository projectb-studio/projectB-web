# Home 페이지 디자인 스펙

> 작성일: 2026-03-31
> 상태: 사장님 컨펌 전 프로토타입

---

## 1. 개요

CLAUDE.md Section 7 와이어프레임 + Figma 보드 디자인을 기준으로 Home 페이지를 구현한다.
Newsletter 섹션은 사장님 판단에 따라 포함 여부 결정 (UI만 구현, 기능 없음).

### Figma 소스
- Board URL: `figma.com/board/LChFkKgnJLXfkLfzwa2f5O/ProjectB`
- Home Page 프레임 ID: `1:2`

### 핵심 설계 원칙
- **디자인 변경 용이성:** 사장님 컨펌 전이므로, 한 곳만 바꾸면 전체가 바뀌는 구조
- **섹션 독립성:** 컴포넌트 단위로 분리, 순서 변경/제거가 page.tsx 한 줄로 가능
- **콘텐츠 분리:** UI 텍스트/이미지 경로는 상수 파일에서 관리
- **데이터 레이어 분리:** 더미 데이터로 시작, Supabase 전환 시 page.tsx 변경 없음

---

## 2. 파일 구조

```
src/
├── app/page.tsx                        # 섹션 컴포넌트 조합만
├── components/
│   ├── home/
│   │   ├── HeroSection.tsx             # Hero 배너
│   │   ├── ProductGridSection.tsx      # New In + Best Sellers 공용
│   │   └── BrandStoreCta.tsx           # Store / Brand 2-column CTA
│   └── shop/
│       └── ProductCard.tsx             # 상품 카드 (Home + Shop 공유)
├── constants/home.ts                   # Hero 카피, CTA 텍스트, 이미지 경로
├── lib/data/products.ts                # 더미 데이터 + fetch 함수
└── types/database.ts                   # Product 타입 추가
```

---

## 3. page.tsx 구조

```tsx
import { getNewProducts, getBestSellers } from "@/lib/data/products";
import { HeroSection } from "@/components/home/HeroSection";
import { ProductGridSection } from "@/components/home/ProductGridSection";
import { BrandStoreCta } from "@/components/home/BrandStoreCta";

export default async function HomePage() {
  const newProducts = await getNewProducts();
  const bestSellers = await getBestSellers();

  return (
    <>
      <HeroSection />
      <ProductGridSection title="NEW IN" products={newProducts} viewAllHref="/shop" />
      <BrandStoreCta />
      <ProductGridSection title="BEST SELLERS" products={bestSellers} viewAllHref="/shop" variant="horizontal" />
    </>
  );
}
```

---

## 4. 섹션별 상세 디자인

### 4.1 HeroSection

- **배경:** `public/images/hero-home.jpg` placeholder (full-width)
- **오버레이:** `bg-black/40` 반투명 검정
- **높이:** `h-[70vh] lg:h-[85vh]`
- **타이포:** `heading-display` 클래스
- **장식용 수직 라인 (Figma):** 좌우 25% 지점에 1px 수직 라인 (`border-r border-white/20`), 인더스트리얼 미니멀 톤 강화. absolute 배치, pointer-events-none.
- **서브텍스트 (Figma):** "Curated accessories for mindful living" (기존 "Handcrafted lifestyle goods"에서 변경)
- **CTA 2개:**
  - "SHOP ONLINE" → `btn-primary` (흰 텍스트, 검정 배경)
  - "VISIT STORE" → `btn-secondary` 흰색 변형 (hero 오버레이 위)
- **콘텐츠:** `constants/home.ts`에서 `HERO_HEADING`, `HERO_SUBTEXT`, `HERO_IMAGE`
- **모바일:** CTA 세로 배치, 폰트 크기 축소, 수직 라인 숨김 (`hidden lg:block`)
- **변경 포인트:**
  - 이미지 → `constants/home.ts`에서 경로 변경
  - 텍스트 → `constants/home.ts`에서 수정
  - 오버레이 → `HeroSection.tsx`에서 `bg-black/40` 조정
  - 수직 라인 → `HeroSection.tsx`에서 위치/색상 조정 또는 제거
  - 완전히 다른 디자인 → `HeroSection.tsx` 파일만 교체

### 4.2 ProductGridSection (New In + Best Sellers 공용)

- **Props:** `title`, `products`, `viewAllHref`, `variant?: "vertical" | "horizontal"`
- **variant 설명:**
  - `"vertical"` (기본값, New In용): 카테고리 → 이름 → 가격 세로 배치
  - `"horizontal"` (Best Sellers용, Figma 기반): 이름+카테고리(좌) / 가격(우) 가로 배치
- **그리드:** `grid-cols-2 lg:grid-cols-4`, `gap-3 lg:gap-6`
- **ProductCard:**
  - 1:1 이미지 (`aspect-ratio: 1/1` 강제)
  - 배지: `badge-new`, `badge-best`, `badge-sale` (globals.css)
  - 상품명: `line-clamp-2` (2줄 제한, 높이 불일치 방지)
  - 가격: 할인 시 원가 취소선 + 빨간색 할인가
  - hover: `group-hover:scale-105` (이미지)
  - `variant` prop으로 레이아웃 분기
- **"View all →"** 링크 → `viewAllHref`로 이동
- **모바일:** 2열, gap 축소. horizontal variant는 모바일에서 vertical로 폴백

### 4.3 BrandStoreCta

- **레이아웃:** `grid-cols-1 lg:grid-cols-2`
- **각 카드 높이:** `min-h-[320px] lg:min-h-[400px]` 동일
- **좌측 (Visit Our Store):**
  - bg: `#0A0A0A` (jet-black), text: white
  - CTA: "STORE LOCATION" → `/store-location`
  - 설명: "오프라인 매장에서 직접 만나보세요"
- **우측 (Our Craft):**
  - bg: `#F0F0F0` (off-white), text: black
  - CTA: "BRAND STORY" → `/brand`
  - 설명: "하나하나 정성을 담아 만듭니다"
- **텍스트:** `constants/home.ts`에서 관리
- **모바일:** 1열, 세로 쌓임, 동일 높이 유지

---

## 5. 데이터 레이어

### types/database.ts — Product 타입

```typescript
export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  tag: string;
  badge?: string | null;
  slug: string;
  imageUrl: string;
}
```

### lib/data/products.ts

```typescript
// 더미 데이터 (CLAUDE.md Section 8 기반)
const DUMMY_PRODUCTS: Product[] = [ ... ];

// Supabase 전환 시 이 함수 내부만 교체
export async function getNewProducts(): Promise<Product[]> { ... }
export async function getBestSellers(): Promise<Product[]> { ... }
```

---

## 6. 상수 파일 구조

### constants/home.ts

```typescript
export const HERO_CONTENT = {
  heading: "PROJECT B",
  subtext: "Curated accessories for mindful living",
  image: "/images/hero-home.jpg",
  primaryCta: { label: "SHOP ONLINE", href: "/shop" },
  secondaryCta: { label: "VISIT STORE", href: "/store-location" },
};

export const BRAND_STORE_CTA = {
  store: {
    title: "VISIT OUR STORE",
    description: "오프라인 매장에서 직접 만나보세요",
    cta: { label: "STORE LOCATION", href: "/store-location" },
  },
  brand: {
    title: "OUR CRAFT",
    description: "하나하나 정성을 담아 만듭니다",
    cta: { label: "BRAND STORY", href: "/brand" },
  },
};
```

---

## 7. 반응형 브레이크포인트

| 요소 | 모바일 (<1024px) | 데스크톱 (≥1024px) |
|------|-------------------|---------------------|
| Hero 높이 | 70vh | 85vh |
| Hero CTA | 세로 배치 | 가로 배치 |
| Hero 수직 라인 | 숨김 (hidden) | 표시 (lg:block) |
| 상품 그리드 | 2열, gap-3 | 4열, gap-6 |
| Best Sellers 카드 | vertical 폴백 | horizontal 레이아웃 |
| Brand/Store CTA | 1열 (세로 쌓임) | 2열 |
| CTA 카드 높이 | min-h-[320px] | min-h-[400px] |

---

## 8. 선택적 구현 (사장님 판단)

- **Newsletter "STAY IN TOUCH" 섹션:** Figma에 포함되어 있음. UI만 구현 (폼 제출 시 동작 없음). 사장님이 원하면 포함, 아니면 제외. 포함 시 `components/home/NewsletterSection.tsx`로 분리.

## 9. 구현하지 않는 것

- Supabase 연결 (더미 데이터로 시작)
- 실제 상품 이미지 (placeholder 사용)
- 장바구니 기능 연동
- SEO meta tags (별도 태스크)

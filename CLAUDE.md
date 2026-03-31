# PROJECT B — CLAUDE.md

> This file is the single source of truth for Claude Code.
> Read this ENTIRE document before starting any task.

---

## 1. Project Overview

**Project B**는 핸드메이드 소품샵 쇼핑몰이다.
오프라인 매장이 메인이고, 온라인을 추가하는 구조.
개발자 고테크(5~6년차 TypeScript/C++ 개발자)가 1인 개발한다.

### Key Facts
- 브랜드명: PROJECT B
- 업종: 악세사리(소품) — 자체제작, 퀄리티 강조
- 상품 수: 10~50개 (단일 품목)
- 타겟: 남여노소
- 오프라인: 메인 → Store Location 페이지가 핵심
- 사업자: 개인사업자, 통신판매업 신고 완료
- 세금계산서: 필요 (기업 고객 있음)
- 도메인: www.projectB.com (이미 사용 중 → 대안 필요, 미정)
- 경쟁 참고: https://decoview.co.kr/

### Related Project (나중에 진행)
- **Delfina** (의류 쇼핑몰) — Project B 완료 후 진행
- 두 쇼핑몰은 Supabase DB 공유 (테이블명 prefix로 분리: `pb_`, `df_`)
- GitHub Organization: `projectb-studio` (Multi-repo)

---

## 2. Tech Stack (확정)

```
Frontend:  Next.js 14+ / TypeScript (strict) / Tailwind CSS / App Router
Backend:   Supabase (PostgreSQL + Auth + Edge Functions)
Images:    Cloudflare R2
Deploy:    Vercel
Payment:   토스페이먼츠 (Tosspayments)
```

### Package Dependencies
```json
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "@supabase/supabase-js": "^2.45.0",
  "@supabase/ssr": "^0.5.0",
  "zustand": "^4.5.0",
  "lucide-react": "^0.400.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.4.0",
  "tailwindcss": "^3.4.0",
  "@tailwindcss/typography": "^0.5.0",
  "@tailwindcss/container-queries": "^0.1.0"
}
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=projectb-images
NEXT_PUBLIC_R2_PUBLIC_URL=
NEXT_PUBLIC_TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 3. Architecture

```
[Customer Browser]
  → [Cloudflare CDN] → [Vercel (Next.js Frontend)]
  → [Cloudflare R2 (Images)]
  → [Supabase (DB + Auth + API)]
    → [Tosspayments (PG)]
    → [Kakao Alimtalk]

[Admin Dashboard] → [Vercel] → [Supabase]
```

### GitHub Organization: projectb-studio
```
github.com/projectb-studio/
├── projectb-web       ← 지금 이 프로젝트 (Next.js)
├── delfina-web        # Delfina 프론트엔드 (나중)
├── shared-api         # 공유 백엔드 API / DB 마이그레이션
└── admin-dashboard    # 사장님용 관리자 패널
```

### Branch Strategy
| Branch | Purpose | Deploy |
|--------|---------|--------|
| `main` | Production | Vercel Production auto-deploy |
| `develop` | Dev integration | Vercel Preview auto-deploy |
| `feature/*` | Feature dev | PR Preview URL |

### Monthly Cost by Stage
| Stage | Daily Visitors | Monthly Cost |
|-------|---------------|--------------|
| Launch | 0~100 | ~₩28,000 |
| Growing | 100~1,000 | ~₩70,000 |
| Scaling | 1,000~10,000 | ₩200K~350K |

---

## 4. Design System — Industrial Minimal

### CRITICAL DESIGN RULES
- **Generic AI aesthetic is STRICTLY FORBIDDEN.** No Inter, no Roboto, no purple gradients.
- Every corner is sharp: `border-radius: 0` everywhere.
- All headings: UPPERCASE with wide letter-spacing.
- Product images: 1:1 square ratio.
- Maximum whitespace. Let content breathe.

### Color Palette (Monochrome)
```
Jet Black    #0A0A0A  ← Primary foreground
Rich Black   #1A1A1A  ← Dark surfaces
Charcoal     #333333  ← Secondary text
Gray         #666666  ← Muted text
Silver       #999999  ← Disabled/hint
Light Gray   #D4D4D4  ← Borders
Off-white    #F0F0F0  ← Light surfaces
Snow         #FAFAFA  ← Background

Accent:
Sale Red     #C75050  ← Sale prices, error
Success      #2D8F4E  ← Success states
```

### Typography
```
Heading:  Archivo (geometric sans-serif)
          - font-weight: 500~700
          - text-transform: uppercase
          - letter-spacing: 0.15em ~ 0.25em

Body:     Pretendard Variable (Korean optimized sans-serif)
          - font-weight: 400
          - line-height: 1.6
```

### Components
```
Buttons:
  Primary   → bg: #0A0A0A, text: #FAFAFA, hover: invert
  Secondary → bg: transparent, border: 1px solid #0A0A0A, hover: fill black

Badges:
  NEW       → bg: #0A0A0A, text: white
  BEST      → bg: #F0F0F0, text: #0A0A0A, border: 1px solid #D4D4D4
  SALE      → bg: #C75050, text: white
  HANDMADE  → bg: transparent, text: #0A0A0A, border: 1px solid #0A0A0A

Inputs:
  border: 1.5px solid #D4D4D4
  focus border: #0A0A0A
  no border-radius
```

---

## 5. Sitemap & Page Structure

```
Home
├── Shop (All Products — tag filter: all/handmade/fabric/metal/wood/stone/glass)
│   └── Product Detail → Cart → Checkout → Order Complete
├── Brand Story
├── Magazine (Blog)
├── CS Center
│   ├── FAQ
│   ├── 1:1 Inquiry
│   ├── KakaoTalk
│   └── Return/Exchange
├── My Page
│   ├── Order History
│   ├── Wishlist
│   ├── Profile Edit
│   └── Point/Coupon
├── Store Location  ★ 핵심 (오프라인이 메인)
├── Photo Reviews
├── Login/Signup (Kakao, Naver, Google, Apple, Email)
├── Notice/Events
└── Terms/Privacy
```

---

## 6. Folder Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx            # Root layout (fonts, header, footer)
│   ├── page.tsx              # Home
│   ├── shop/page.tsx         # Product listing + tag filter
│   ├── product/[slug]/page.tsx # Product detail
│   ├── brand/page.tsx        # Brand story
│   ├── magazine/page.tsx     # Blog/magazine
│   ├── store-location/page.tsx # ★ Offline store info + map
│   ├── reviews/page.tsx      # Photo reviews
│   ├── cs/page.tsx           # Customer service (FAQ/1:1/Return)
│   ├── cart/page.tsx         # Shopping cart
│   ├── checkout/page.tsx     # Checkout (Tosspayments)
│   ├── order-complete/page.tsx # Order confirmation
│   ├── mypage/page.tsx       # My page
│   ├── auth/page.tsx         # Login/Signup
│   └── notice/page.tsx       # Notice & Events
├── components/
│   ├── ui/                   # Base UI (Button, Input, Badge, Modal)
│   ├── layout/               # Header, Footer, Nav
│   ├── shop/                 # ProductCard, ProductGrid, TagFilter
│   └── common/               # Shared (SEO, Loading, Error)
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client (Client Components)
│   │   ├── server.ts         # Server client (Server Components)
│   │   └── middleware.ts     # Auth session refresh
│   └── utils.ts              # cn(), formatPrice(), formatDate()
├── hooks/                    # Custom React hooks
├── types/
│   └── database.ts           # Supabase generated types (pb_ prefix)
├── constants/
│   └── site.ts               # NAV_ITEMS, FOOTER_LINKS, PRODUCT_TAGS
├── styles/
│   └── globals.css           # Design system + Tailwind
└── middleware.ts              # Supabase auth middleware
```

---

## 7. Page Wireframe Details

### Home Page
1. **Announcement Bar** — "Free shipping on orders over ₩50,000" (black bg, white text)
2. **Hero** — Full-width image, "PROJECT B" heading, "Handcrafted lifestyle" subtext, two CTAs: "Shop online" + "Visit store"
3. **New In** — 4-column product grid, "View all" link
4. **Store / Brand CTA** — 2-column grid: left = "Visit our store" (black bg), right = "Our craft" (off-white bg)
5. **Best Sellers** — 4-column product grid
6. **Newsletter** — Email input + subscribe button
7. **Footer** — 4-column: Brand, CS, Info, Legal

### Shop Page
1. **Tag Filter Bar** — Horizontal tabs: All / Handmade / Fabric / Metal / Wood / Stone / Glass
2. **Product Count** — "Showing N items"
3. **Product Grid** — 4 columns desktop, 2 columns mobile
4. **Pagination**

### Product Detail Page
1. **Breadcrumb** — Home / Shop / Detail
2. **2-column layout:**
   - Left: Main photo (1:1) + 4 thumbnail grid
   - Right: Tag label, product name, price, description, quantity selector, "Add to cart" button, accordion (Details/Shipping/Care)

### Cart Page
1. **Cart items** — Image + name + price + quantity ± + remove
2. **Summary sidebar** — Subtotal, Shipping, Total, Checkout button
3. **"Continue shopping" link**

### Store Location Page ★
1. **Header** — Black bg, "VISIT US"
2. **2-column:** Map (Kakao/Naver) + Store info (Address, Hours, Phone, KakaoTalk)
3. **CTA buttons** — "Get directions" + "KakaoTalk"

### Brand Story Page
1. **Header image** — Off-white, brand name
2. **Story text** — Centered, max-width 560px
3. **3-column grid** — "Designed with care" / "Made by hand" / "Built to last"

---

## 8. Dummy Product Data

```typescript
const PRODUCTS = [
  { name: "Ceramic vase — matte black", price: 38000, tag: "handmade", badge: null },
  { name: "Linen table runner — ivory", price: 28000, tag: "fabric", badge: "NEW" },
  { name: "Brass candle holder set", price: 52000, tag: "metal", badge: null },
  { name: "Wool felt coaster (4p)", price: 18000, tag: "fabric", badge: "BEST" },
  { name: "Oak wood tray — natural", price: 45000, tag: "wood", badge: null },
  { name: "Cotton blend napkin set", price: 22000, salePrice: 27500, tag: "fabric", badge: "-20%" },
  { name: "Stone incense holder", price: 32000, tag: "stone", badge: "NEW" },
  { name: "Hand-blown glass cup", price: 28000, tag: "glass", badge: null },
];
```

---

## 9. Required Features (from Client Checklist)

### Payment
- 카드 결제, 무통장 입금, 카카오페이, 네이버페이, 토스페이
- 포인트/적립금 결제, 해외 결제(페이팔), 휴대폰 결제
- PG사: **토스페이먼츠**

### Member
- 회원가입 (이메일), 카카오/네이버/구글/애플 로그인
- 쿠폰 발급, 적립금/포인트, 회원 등급 (VIP)
- 비회원 주문, 찜하기/위시리스트

### Product
- 상품 옵션 선택 (색상, 사이즈 등)
- 상품 리뷰/별점, 상품 문의 (Q&A)
- 재입고 알림, 최근 본 상품, 예약 주문

### Shipping
- 택배 배송, 배송 추적
- 무료 배송 조건: ₩50,000 이상
- 해외 배송

### Marketing
- 이벤트/할인 배너, 타임세일/한정판매
- 카카오 알림톡, SNS 공유 버튼

### CS
- 1:1 문의 게시판, 카카오톡 상담 연결
- FAQ, 교환/반품 신청

### Admin (사장님 혼자 사용)
- 상품 등록/수정/삭제, 주문 확인/처리
- 매출/통계 확인, 회원 관리, 쿠폰/이벤트 생성
- 공지사항 작성, 리뷰/문의 답변, 재고 관리, 정산 확인
- 현재 관리 방식: 엑셀/스프레드시트

---

## 10. Database Schema (Supabase — pb_ prefix)

```sql
-- All Project B tables use pb_ prefix.
-- Delfina will use df_ prefix later. Same Supabase instance.

-- Core tables (to be created):
pb_products        -- Products
pb_product_options -- Product options (color, size)
pb_product_images  -- Product images (R2 URLs)
pb_categories      -- Product categories/tags
pb_users           -- Extended user profiles (Supabase Auth + metadata)
pb_orders          -- Orders
pb_order_items     -- Order line items
pb_cart            -- Cart (per user)
pb_cart_items      -- Cart items
pb_reviews         -- Product reviews with photos
pb_inquiries       -- Product Q&A
pb_coupons         -- Coupons
pb_points          -- Point history
pb_notices         -- Notices & events
pb_magazine        -- Blog/magazine posts
pb_faq             -- FAQ items
pb_cs_inquiries    -- 1:1 CS inquiries
pb_store_info      -- Store location info
pb_banners         -- Marketing banners
```

---

## 11. Supabase Auth Setup

```typescript
// Browser client (Client Components)
import { createBrowserClient } from "@supabase/ssr";

// Server client (Server Components, Route Handlers)
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Middleware (auth session refresh) — src/middleware.ts
// Refreshes expired tokens on every request
```

Social login providers to configure:
- Kakao, Naver, Google, Apple

---

## 12. Development Priorities

### P0 — Immediate
1. ✅ GitHub Organization 생성 (projectb-studio)
2. Next.js 프로젝트 초기화 + 디자인 시스템 세팅
3. Supabase DB 스키마 설계 + 마이그레이션
4. 개인정보처리방침 작성

### P1 — This Week
5. 메인(Home) 페이지 구현
6. Shop 페이지 (상품 목록 + 태그 필터)
7. Product Detail 페이지
8. Store Location 페이지 ★
9. Vercel 배포 + 도메인 연결

### P2 — Next Week
10. Cart + Checkout 플로우
11. 토스페이먼츠 결제 연동
12. Auth (소셜 로그인)
13. My Page (주문내역, 위시리스트)

### P3 — After
14. Admin Dashboard
15. Magazine (블로그)
16. Photo Reviews
17. CS Center
18. 카카오 알림톡 연동
19. SEO + GA4 세팅

---

## 13. Model Usage Convention

토큰 비용 최적화를 위해 단계별로 모델을 전환해 사용한다.
세션 전환은 `/model` 명령어로 수동으로 진행한다.

| 단계 | 모델 | 전환 명령 | 해당 작업 |
|------|------|-----------|-----------|
| 설계·분석 | Opus | `/model opus` | 브레인스토밍, 아키텍처 설계, 스펙 작성, 코드 리뷰 |
| 구현·테스트 | Sonnet | `/model sonnet` | 코드 작성, 버그 수정, 테스트 실행 |

> 기본값(settings.json): `sonnet` — 새 세션은 항상 Sonnet으로 시작.

---

## 14. Coding Conventions

### Rules
- Language: TypeScript strict mode (`"strict": true`)
- Comments: English only
- Conversation: Korean (대화는 한국어)
- Framework: Next.js 14+ App Router (NO Pages Router)
- Styling: Tailwind CSS only (no CSS modules, no styled-components)
- State: Zustand for client state, React Server Components for server state
- Data fetching: Server Components + Supabase server client preferred
- Forms: React Hook Form (to be added when needed)
- Icons: lucide-react only
- Imports: Use `@/*` alias (maps to `./src/*`)
- 모든 설명, 요약, TODO, 커밋 메시지 초안, 코드 주석은 기본적으로 한국어로 작성한다.
- 사용자에게 보여지는 UI 텍스트는 한국어를 기본으로 한다.
- 영어는 코드 식별자, 라이브러리 이름, 공식 고유명사에만 사용한다.

### File Naming
- Components: PascalCase (`ProductCard.tsx`)
- Utilities: camelCase (`formatPrice.ts`)
- Constants: camelCase file, UPPER_SNAKE for values (`site.ts` → `SITE_CONFIG`)
- Types: PascalCase (`Database`, `Product`)

### Component Pattern
```typescript
// Server Component (default) — no "use client"
export default async function PageName() { ... }

// Client Component — only when needed (interactivity, hooks, browser APIs)
"use client";
export function InteractiveComponent() { ... }
```

### Utility: cn() for class merging
```typescript
import { cn } from "@/lib/utils";
<div className={cn("base-class", condition && "conditional-class")} />
```

---

## 15. Business Context

### Client (사장님) Info
- 비개발자 — 모든 사장님 향 자료는 쉬운 용어로
- 예산: 100만원 이하 (실제 필요: 700~1,050만원 → 갭 존재)
- 일정: 급함 (1개월 이내)
- SNS: 인스타그램, 카카오 채널
- 마켓플레이스 입점 계획 있음
- 배송사: 여러 곳 사용
- 반품율: 거의 없음
- 재구매율: 50% 이상
- 주요 문의: 세탁문의
- 로고: 새로 만들어야 함
- 개인정보처리방침: 만들어야 함
- 앱: 나중에 추가 예정

### Estimate Structure (A Plan)
| Phase | Content | Amount |
|-------|---------|--------|
| Phase 1 | Planning/Design | ₩150~200만 |
| Phase 2 | Design mockup | ₩100~150만 |
| Phase 3 | Frontend dev | ₩200~300만 |
| Phase 4 | Backend + PG | ₩200~300만 |
| Phase 5 | QA + Launch | ₩50~100만 |
| **Total** | | **₩700~1,050만** |

---

## 16. Don'ts (절대 하지 말 것)

- ❌ Generic AI aesthetic (Inter font, purple gradients, rounded everything)
- ❌ border-radius on ANY element (this is industrial minimal)
- ❌ Pages Router (use App Router only)
- ❌ CSS Modules or styled-components (Tailwind only)
- ❌ Any ORM other than Supabase client
- ❌ NextAuth.js (use Supabase Auth)
- ❌ Mixing Project B and Delfina styles
- ❌ Committing .env.local or secrets
- ❌ Using `any` type in TypeScript
- ❌ Console.log in production code (use console.warn/error only)

---

## 17. Reference Files (from planning phase)

These files exist in the project planning repo:
- `project-b-wireframe.jsx` — Interactive wireframe (6 pages: home, shop, detail, cart, brand, store)
- `shopping-mall-checklist-v2.jsx` — Client checklist (50 questions)
- `phase2-analysis-template.jsx` — Analysis template
- `쇼핑몰_견적서_A플랜.pdf` — Estimate document
- `쇼핑몰_용역계약서_A플랜.pdf` — Contract
- `사장님_계정생성_가이드.pdf` — Client account setup guide
- `GitHub_Organization_가이드.pdf` — GitHub setup guide
- `PROJECT_KNOWLEDGE_BASE.md` — Master knowledge base

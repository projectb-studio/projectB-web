# Admin Dashboard Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supabase DB 스키마 생성, 관리자 인증 가드, 관리자 레이아웃(사이드바/헤더), 대시보드 홈 페이지 구현

**Architecture:** Supabase에 전체 `pb_` 테이블을 SQL로 생성하고, `/admin` 라우트에 Supabase Auth 기반 role 체크를 적용한 관리자 레이아웃을 구현한다. 서버 컴포넌트에서 `pb_users_profile.role`을 확인하여 접근을 제어한다.

**Tech Stack:** Next.js 14 App Router, Supabase (PostgreSQL + Auth + RLS), Tailwind CSS, Lucide React

**Spec:** `docs/superpowers/specs/2026-04-04-admin-dashboard-design.md`

---

## File Structure

### 신규 생성
- `src/lib/supabase/admin.ts` — service_role 키를 사용하는 admin 전용 Supabase 클라이언트
- `src/app/admin/layout.tsx` — 관리자 레이아웃 (인증 가드 + 사이드바 + 헤더)
- `src/app/admin/page.tsx` — 대시보드 홈
- `src/components/admin/layout/AdminSidebar.tsx` — 사이드바 네비게이션
- `src/components/admin/layout/AdminHeader.tsx` — 상단 헤더
- `src/components/admin/ui/AdminCard.tsx` — 통계 카드
- `src/constants/admin.ts` — 관리자 메뉴 항목, 상수
- `supabase/schema.sql` — 전체 DB 스키마 SQL (기록 보관용)

### 수정
- `src/middleware.ts` — `/admin/*` 라우트 세션 체크 추가
- `src/types/database.ts` — 새 DB 스키마에 맞게 타입 재정의

---

## Task 1: Supabase DB 스키마 생성

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: 스키마 SQL 파일 작성**

`supabase/schema.sql`에 모든 테이블 생성 SQL을 작성한다. 스펙의 섹션 2 전체를 포함.

```sql
-- ============================================
-- Project B — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. 상품
CREATE TABLE pb_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL,
  sale_price INTEGER,
  tag TEXT NOT NULL DEFAULT 'handmade',
  badge TEXT,
  description TEXT,
  details TEXT,
  shipping TEXT,
  care TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pb_product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES pb_products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pb_product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES pb_products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('color', 'size')),
  name TEXT NOT NULL,
  value TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 콘텐츠
CREATE TABLE pb_hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT NOT NULL DEFAULT 'PROJECT B',
  subheading TEXT NOT NULL DEFAULT 'Curated accessories for mindful living',
  cta_primary_text TEXT DEFAULT 'SHOP ONLINE',
  cta_primary_link TEXT DEFAULT '/category',
  cta_secondary_text TEXT DEFAULT 'VISIT STORE',
  cta_secondary_link TEXT DEFAULT '/store-location',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pb_hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pb_brand_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 주문
CREATE TABLE pb_orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  total_amount INTEGER NOT NULL,
  shipping_fee INTEGER NOT NULL DEFAULT 0,
  shipping_address JSONB,
  payment_id TEXT,
  payment_method TEXT,
  order_name TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pb_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES pb_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES pb_products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  options JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. 사용자
CREATE TABLE pb_users_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. 리뷰
CREATE TABLE pb_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES pb_products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL DEFAULT '익명',
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  image_urls TEXT[],
  is_published BOOLEAN NOT NULL DEFAULT true,
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. CS 문의
CREATE TABLE pb_cs_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('product', 'order', 'shipping', 'wholesale', 'etc')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  author_email TEXT,
  author_phone TEXT,
  company_name TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'answered')),
  answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. 공지사항
CREATE TABLE pb_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. 배너
CREATE TABLE pb_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE pb_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_brand_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_cs_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_banners ENABLE ROW LEVEL SECURITY;

-- Public read for published products
CREATE POLICY "Public can read published products" ON pb_products
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can read product images" ON pb_product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pb_products WHERE id = product_id AND is_published = true)
  );

CREATE POLICY "Public can read product options" ON pb_product_options
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pb_products WHERE id = product_id AND is_published = true)
  );

-- Public read for content
CREATE POLICY "Public can read hero settings" ON pb_hero_settings
  FOR SELECT USING (true);

CREATE POLICY "Public can read active hero slides" ON pb_hero_slides
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read brand content" ON pb_brand_content
  FOR SELECT USING (true);

-- Public read for published notices
CREATE POLICY "Public can read published notices" ON pb_notices
  FOR SELECT USING (is_published = true);

-- Public read for active banners
CREATE POLICY "Public can read active banners" ON pb_banners
  FOR SELECT USING (is_active = true);

-- Public read for published reviews
CREATE POLICY "Public can read published reviews" ON pb_reviews
  FOR SELECT USING (is_published = true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews" ON pb_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read own orders
CREATE POLICY "Users can read own orders" ON pb_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own order items" ON pb_order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pb_orders WHERE id = order_id AND user_id = auth.uid())
  );

-- Users can read/update own profile
CREATE POLICY "Users can read own profile" ON pb_users_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON pb_users_profile
  FOR UPDATE USING (auth.uid() = user_id);

-- Anyone can create inquiries
CREATE POLICY "Anyone can create inquiries" ON pb_cs_inquiries
  FOR INSERT WITH CHECK (true);

-- Users can read own inquiries
CREATE POLICY "Users can read own inquiries" ON pb_cs_inquiries
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Admin full access (service_role bypasses RLS, but also add explicit policies)
-- Admin reads all products (including unpublished)
CREATE POLICY "Admin can read all products" ON pb_products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage product images" ON pb_product_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage product options" ON pb_product_options
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage hero settings" ON pb_hero_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage hero slides" ON pb_hero_slides
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage brand content" ON pb_brand_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage orders" ON pb_orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage order items" ON pb_order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage reviews" ON pb_reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage inquiries" ON pb_cs_inquiries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage notices" ON pb_notices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage banners" ON pb_banners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage profiles" ON pb_users_profile
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pb_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pb_hero_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pb_brand_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pb_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pb_users_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pb_cs_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pb_notices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Seed: default hero settings
-- ============================================

INSERT INTO pb_hero_settings (heading, subheading, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link)
VALUES ('PROJECT B', 'Curated accessories for mindful living', 'SHOP ONLINE', '/category', 'VISIT STORE', '/store-location');

INSERT INTO pb_hero_slides (type, media_url, alt, sort_order) VALUES
  ('image', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80', 'Handcrafted interior accessories', 0),
  ('image', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80', 'Artisan ceramics collection', 1),
  ('image', 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1920&q=80', 'Minimal lifestyle objects', 2),
  ('image', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80', 'Handmade craft workspace', 3);

INSERT INTO pb_brand_content (section_key, title, content, sort_order) VALUES
  ('hero', 'PROJECT B', NULL, 0),
  ('story', 'Our Story', 'We believe in the beauty of handcrafted objects. Each piece in our collection is carefully selected or made by skilled artisans who share our passion for quality and authenticity.', 1),
  ('material_1', 'Designed with care', 'Every detail is considered, from material selection to finishing touches.', 2),
  ('material_2', 'Made by hand', 'Traditional techniques meet modern design in every piece we offer.', 3),
  ('material_3', 'Built to last', 'Quality materials and craftsmanship ensure lasting beauty.', 4);
```

- [ ] **Step 2: Supabase SQL Editor에서 스키마 실행**

Run: Supabase 대시보드 → SQL Editor → `supabase/schema.sql` 내용 붙여넣기 → Run

Expected: 13개 테이블 생성, RLS 정책 적용, 시드 데이터 삽입 완료

- [ ] **Step 3: 테이블 생성 확인**

Supabase 대시보드 → Table Editor에서 다음 테이블들이 보이는지 확인:
`pb_products`, `pb_product_images`, `pb_product_options`, `pb_hero_settings`, `pb_hero_slides`, `pb_brand_content`, `pb_orders`, `pb_order_items`, `pb_users_profile`, `pb_reviews`, `pb_cs_inquiries`, `pb_notices`, `pb_banners`

- [ ] **Step 4: 커밋**

```bash
git add supabase/schema.sql
git commit -m "feat: add Supabase DB schema for all pb_ tables with RLS"
```

---

## Task 2: Admin Supabase 클라이언트 + 타입 업데이트

**Files:**
- Create: `src/lib/supabase/admin.ts`
- Modify: `src/types/database.ts`

- [ ] **Step 1: admin 전용 Supabase 클라이언트 작성**

`src/lib/supabase/admin.ts` — API Route에서 admin 체크 후 service_role로 접근할 때 사용:

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client using service_role key.
 * Use ONLY in API Route Handlers after verifying admin role.
 * This client bypasses RLS.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createSupabaseClient(url, key, {
    auth: { persistSession: false },
  });
}
```

- [ ] **Step 2: 타입 파일 업데이트**

`src/types/database.ts`를 새 DB 스키마에 맞게 재작성한다. 기존 `Product` 인터페이스와 `ProductTag` 등 프론트용 타입은 유지하되, DB Row 타입을 스키마와 일치시킨다:

```typescript
/**
 * Database type definitions.
 * Matches supabase/schema.sql tables.
 */

// ---- DB Row Types ----

export type DbProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  tag: string;
  badge: string | null;
  description: string | null;
  details: string | null;
  shipping: string | null;
  care: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DbProductImage = {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
  created_at: string;
};

export type DbProductOption = {
  id: string;
  product_id: string;
  type: "color" | "size";
  name: string;
  value: string | null;
  sort_order: number;
  created_at: string;
};

export type DbHeroSettings = {
  id: string;
  heading: string;
  subheading: string;
  cta_primary_text: string | null;
  cta_primary_link: string | null;
  cta_secondary_text: string | null;
  cta_secondary_link: string | null;
  updated_at: string;
};

export type DbHeroSlide = {
  id: string;
  type: "image" | "video";
  media_url: string;
  alt: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type DbBrandContent = {
  id: string;
  section_key: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  sort_order: number;
  updated_at: string;
};

export type DbOrder = {
  id: string;
  user_id: string | null;
  status: "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled" | "refunded";
  total_amount: number;
  shipping_fee: number;
  shipping_address: Record<string, unknown> | null;
  payment_id: string | null;
  payment_method: string | null;
  order_name: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
};

export type DbOrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  options: Record<string, unknown> | null;
  created_at: string;
};

export type DbUserProfile = {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string;
  updated_at: string;
};

export type DbReview = {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  content: string | null;
  image_urls: string[] | null;
  is_published: boolean;
  admin_reply: string | null;
  created_at: string;
};

export type DbCsInquiry = {
  id: string;
  type: "product" | "order" | "shipping" | "wholesale" | "etc";
  title: string;
  content: string;
  user_id: string | null;
  author_name: string | null;
  author_email: string | null;
  author_phone: string | null;
  company_name: string | null;
  status: "waiting" | "answered";
  answer: string | null;
  created_at: string;
  updated_at: string;
};

export type DbNotice = {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type DbBanner = {
  id: string;
  title: string;
  image_url: string;
  link: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

// ---- Frontend Types (used by components) ----

export type ProductTag = "handmade" | "fabric" | "metal" | "wood" | "stone" | "glass";
export type ProductBadge = "NEW" | "BEST" | "SALE" | "HANDMADE" | null;

export interface ProductColorOption {
  name: string;
  value: string;
}

export interface ProductOptions {
  colors?: ProductColorOption[];
  sizes?: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  tag: ProductTag;
  badge?: ProductBadge;
  slug: string;
  imageUrl: string;
  images?: string[];
  description?: string;
  details?: string;
  shipping?: string;
  care?: string;
  material?: string;
  options?: ProductOptions;
}
```

- [ ] **Step 3: 빌드 확인**

Run: `npx next build`
Expected: 빌드 성공 (기존 코드에서 import하는 Product 등 타입이 그대로 유지됨)

- [ ] **Step 4: 커밋**

```bash
git add src/lib/supabase/admin.ts src/types/database.ts
git commit -m "feat: add admin Supabase client and update DB types"
```

---

## Task 3: 관리자 인증 가드

**Files:**
- Modify: `src/middleware.ts`
- Create: `src/lib/admin-auth.ts`

- [ ] **Step 1: admin 인증 헬퍼 작성**

`src/lib/admin-auth.ts` — 서버 컴포넌트/API Route에서 재사용하는 admin 체크 함수:

```typescript
import { createClient } from "@/lib/supabase/server";
import type { DbUserProfile } from "@/types/database";

/**
 * Check if current authenticated user has admin role.
 * Returns the user profile if admin, null otherwise.
 */
export async function getAdminUser(): Promise<DbUserProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("pb_users_profile")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "admin") return null;

  return profile as DbUserProfile;
}
```

- [ ] **Step 2: 미들웨어에 admin 라우트 세션 체크 추가**

`src/middleware.ts`를 수정하여 `/admin` 경로 접근 시 세션이 없으면 로그인 페이지로 리다이렉트한다:

```typescript
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Protect /admin routes: redirect to /auth if no session cookie
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const hasSession = request.cookies.getAll().some(
      (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
    );

    if (!hasSession) {
      const loginUrl = new URL("/auth", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 3: 빌드 확인**

Run: `npx next build`
Expected: 빌드 성공

- [ ] **Step 4: 커밋**

```bash
git add src/middleware.ts src/lib/admin-auth.ts
git commit -m "feat: add admin auth guard middleware and helper"
```

---

## Task 4: 관리자 상수 + 사이드바 + 헤더

**Files:**
- Create: `src/constants/admin.ts`
- Create: `src/components/admin/layout/AdminSidebar.tsx`
- Create: `src/components/admin/layout/AdminHeader.tsx`

- [ ] **Step 1: 관리자 상수 작성**

`src/constants/admin.ts`:

```typescript
import {
  LayoutDashboard,
  Package,
  PanelTop,
  ShoppingCart,
  Star,
  MessageSquare,
  Megaphone,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { label: "대시보드", href: "/admin", icon: LayoutDashboard },
  { label: "상품 관리", href: "/admin/products", icon: Package },
  { label: "콘텐츠 편집", href: "/admin/content/hero", icon: PanelTop },
  { label: "주문 관리", href: "/admin/orders", icon: ShoppingCart },
  { label: "리뷰 관리", href: "/admin/reviews", icon: Star },
  { label: "문의 관리", href: "/admin/inquiries", icon: MessageSquare },
  { label: "공지사항", href: "/admin/notices", icon: Megaphone },
] as const;
```

- [ ] **Step 2: AdminSidebar 컴포넌트 작성**

`src/components/admin/layout/AdminSidebar.tsx`:

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/constants/admin";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-60 bg-[var(--pb-jet-black)] z-50",
          "flex flex-col transition-transform duration-200",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
          <Link
            href="/admin"
            className="font-heading text-sm tracking-[0.25em] text-white uppercase"
          >
            PB Admin
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-white/50 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 text-sm transition-colors",
                  active
                    ? "text-white bg-white/10"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={16} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer: back to site */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            ← 사이트로 돌아가기
          </Link>
        </div>
      </aside>
    </>
  );
}
```

- [ ] **Step 3: AdminHeader 컴포넌트 작성**

`src/components/admin/layout/AdminHeader.tsx`:

```typescript
"use client";

import { Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

interface AdminHeaderProps {
  title: string;
  onMenuToggle: () => void;
}

export function AdminHeader({ title, onMenuToggle }: AdminHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-[var(--pb-snow)] border-b border-[var(--pb-light-gray)] flex items-center justify-between px-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] transition-colors"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
        <h1 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">
          {title}
        </h1>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] transition-colors"
      >
        <LogOut size={14} strokeWidth={1.5} />
        로그아웃
      </button>
    </header>
  );
}
```

- [ ] **Step 4: 빌드 확인**

Run: `npx next build`
Expected: 빌드 성공

- [ ] **Step 5: 커밋**

```bash
git add src/constants/admin.ts src/components/admin/layout/AdminSidebar.tsx src/components/admin/layout/AdminHeader.tsx
git commit -m "feat: add admin sidebar, header, and nav constants"
```

---

## Task 5: Admin Layout + 대시보드 홈 + AdminCard

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/components/admin/ui/AdminCard.tsx`

- [ ] **Step 1: AdminCard 컴포넌트 작성**

`src/components/admin/ui/AdminCard.tsx`:

```typescript
interface AdminCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function AdminCard({ label, value, sub }: AdminCardProps) {
  return (
    <div className="border border-[var(--pb-light-gray)] bg-white p-5">
      <p className="text-xs text-[var(--pb-gray)] uppercase tracking-industrial mb-2">
        {label}
      </p>
      <p className="text-2xl font-heading font-semibold">{value}</p>
      {sub && (
        <p className="text-xs text-[var(--pb-silver)] mt-1">{sub}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Admin Layout 작성**

`src/app/admin/layout.tsx`:

```typescript
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { AdminLayoutClient } from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/auth?redirect=/admin");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
```

그리고 클라이언트 래퍼를 별도 파일로 작성한다.

`src/app/admin/AdminLayoutClient.tsx`:

```typescript
"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/constants/admin";

function getPageTitle(pathname: string): string {
  if (pathname === "/admin") return "대시보드";
  const item = ADMIN_NAV_ITEMS.find(
    (nav) => nav.href !== "/admin" && pathname.startsWith(nav.href)
  );
  return item?.label ?? "관리자";
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[var(--pb-snow)]">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title={getPageTitle(pathname)}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 대시보드 홈 페이지 작성**

`src/app/admin/page.tsx`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { AdminCard } from "@/components/admin/ui/AdminCard";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch summary counts
  const [productsRes, ordersRes, inquiriesRes, reviewsRes] = await Promise.all([
    supabase.from("pb_products").select("id", { count: "exact", head: true }),
    supabase.from("pb_orders").select("id", { count: "exact", head: true }),
    supabase
      .from("pb_cs_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "waiting"),
    supabase
      .from("pb_reviews")
      .select("id", { count: "exact", head: true })
      .is("admin_reply", null),
  ]);

  const productCount = productsRes.count ?? 0;
  const orderCount = ordersRes.count ?? 0;
  const pendingInquiries = inquiriesRes.count ?? 0;
  const unrepliedReviews = reviewsRes.count ?? 0;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AdminCard label="Total Products" value={productCount} />
        <AdminCard label="Total Orders" value={orderCount} />
        <AdminCard label="Pending Inquiries" value={pendingInquiries} sub="답변 대기" />
        <AdminCard label="Unreplied Reviews" value={unrepliedReviews} sub="답변 미작성" />
      </div>

      <div className="border border-[var(--pb-light-gray)] bg-white p-6">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <a href="/admin/products/new" className="btn-primary text-center text-xs py-3">
            상품 등록
          </a>
          <a href="/admin/content/hero" className="btn-secondary text-center text-xs py-3">
            히어로 편집
          </a>
          <a href="/admin/orders" className="btn-secondary text-center text-xs py-3">
            주문 확인
          </a>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 빌드 확인**

Run: `npx next build`
Expected: 빌드 성공

- [ ] **Step 5: 로컬에서 `/admin` 접근 테스트**

Run: `npm run dev`
브라우저에서 `http://localhost:3000/admin` 접근 → 로그인 안 된 상태면 `/auth?redirect=/admin`으로 리다이렉트되는지 확인

- [ ] **Step 6: 커밋**

```bash
git add src/app/admin/ src/components/admin/ui/AdminCard.tsx
git commit -m "feat: add admin layout with auth guard, sidebar, header, and dashboard home"
```

---

## Summary

| Task | 내용 | 파일 수 |
|------|------|---------|
| 1 | DB 스키마 생성 (13 테이블 + RLS + 시드) | 1 |
| 2 | Admin Supabase 클라이언트 + 타입 업데이트 | 2 |
| 3 | 관리자 인증 가드 (미들웨어 + 헬퍼) | 2 |
| 4 | 사이드바 + 헤더 + 상수 | 3 |
| 5 | Admin Layout + 대시보드 홈 + AdminCard | 4 |

Phase 1 완료 후 → Phase 2 (상품 CRUD) 플랜 작성

# Admin Dashboard — Design Spec

> 2026-04-04 — 기존 admin-dashboard-plan.md + 4/2 미팅 결과 기반

---

## 1. 개요

대표님(비개발자, 1인 사용)이 쇼핑몰 콘텐츠를 직접 관리할 수 있는 관리자 대시보드.
엑셀/스프레드시트 관리 → 웹 기반 관리 전환.

### 결정 사항
- **위치**: `projectb-web` 레포 내 `/admin` 라우트 (규모 커지면 분리)
- **DB**: Supabase 실제 연동 (더미 데이터 아님)
- **범위**: 상품 CRUD + 콘텐츠 편집(히어로/브랜드) 동시 진행
- **디자인**: 하이브리드 — 브랜드 폰트/색상 유지 + 관리자 레이아웃(사이드바, 테이블)
- **인증**: Supabase Auth + `pb_users_profile.role = "admin"` 체크

---

## 2. DB 스키마

모든 테이블은 `pb_` prefix. Supabase RLS 적용.
`created_at`, `updated_at`은 모든 테이블 공통.

### 2.1 상품

```sql
-- 상품
CREATE TABLE pb_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL,              -- 원 단위
  sale_price INTEGER,                  -- 할인가 (nullable)
  tag TEXT NOT NULL DEFAULT 'handmade', -- handmade, fabric, metal, wood, stone, glass
  badge TEXT,                           -- NEW, BEST, SALE, HANDMADE (nullable)
  description TEXT,
  details TEXT,
  shipping TEXT,
  care TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 상품 이미지
CREATE TABLE pb_product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES pb_products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 상품 옵션 (색상, 사이즈)
CREATE TABLE pb_product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES pb_products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('color', 'size')),
  name TEXT NOT NULL,       -- "Matte Black", "S"
  value TEXT,               -- "#1A1A1A" (색상용), null (사이즈)
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.2 콘텐츠

```sql
-- 히어로 섹션 설정 (단일 row — 텍스트/CTA 설정)
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

-- 히어로 슬라이드 이미지 (복수)
CREATE TABLE pb_hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 브랜드 페이지 섹션
CREATE TABLE pb_brand_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,  -- 'hero', 'story', 'material_1', 'material_2', 'material_3'
  title TEXT,
  content TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.3 주문

```sql
-- 주문
CREATE TABLE pb_orders (
  id TEXT PRIMARY KEY,                 -- PB-xxxxx 형식 (결제 시 생성)
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

-- 주문 아이템
CREATE TABLE pb_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES pb_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES pb_products(id),
  product_name TEXT NOT NULL,          -- 삭제된 상품 대비 스냅샷
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  options JSONB,                        -- {"color": "Matte Black", "size": "S"}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.4 사용자

```sql
-- 유저 확장 프로필
CREATE TABLE pb_users_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.5 리뷰 / CS / 공지

```sql
-- 상품 리뷰
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

-- CS 문의
CREATE TABLE pb_cs_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('product', 'order', 'shipping', 'wholesale', 'etc')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  author_email TEXT,
  author_phone TEXT,
  company_name TEXT,                   -- 도매/제휴용
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'answered')),
  answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 공지사항
CREATE TABLE pb_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 배너
CREATE TABLE pb_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 3. 관리자 라우트 구조

```
src/app/admin/
├── layout.tsx              — AdminLayout (사이드바 + 헤더 + 인증 가드)
├── page.tsx                — 대시보드 홈 (오늘 주문 수, 총 상품 수, 최근 문의)
├── products/
│   ├── page.tsx            — 상품 목록 (테이블, 검색/필터, 공개/비공개 토글)
│   ├── new/page.tsx        — 상품 등록
│   └── [id]/page.tsx       — 상품 수정
├── content/
│   ├── hero/page.tsx       — 히어로 섹션 편집 (이미지/영상 전환, 텍스트, CTA)
│   └── brand/page.tsx      — 브랜드 페이지 편집 (섹션별 텍스트/이미지)
├── orders/
│   ├── page.tsx            — 주문 목록 (상태 필터, 검색)
│   └── [id]/page.tsx       — 주문 상세 (상태 변경, 배송 추적번호 입력)
├── reviews/page.tsx        — 리뷰 관리 (답변 작성, 공개/비공개)
├── inquiries/page.tsx      — 문의 관리 (Q&A + 도매 문의 답변)
└── notices/
    ├── page.tsx            — 공지사항 목록
    ├── new/page.tsx        — 공지 작성
    └── [id]/page.tsx       — 공지 수정
```

---

## 4. 관리자 컴포넌트

```
src/components/admin/
├── layout/
│   ├── AdminSidebar.tsx    — 사이드바 (네비게이션, 로고, 모바일 토글)
│   └── AdminHeader.tsx     — 상단 헤더 (페이지 타이틀, 로그아웃)
├── ui/
│   ├── DataTable.tsx       — 재사용 테이블 컴포넌트
│   ├── StatusBadge.tsx     — 주문 상태 뱃지
│   ├── ImageUploader.tsx   — 이미지 업로드 (drag & drop, R2 연동 예정)
│   └── AdminCard.tsx       — 통계 카드 (숫자 + 라벨)
└── forms/
    ├── ProductForm.tsx     — 상품 등록/수정 폼
    ├── HeroForm.tsx        — 히어로 편집 폼
    ├── BrandForm.tsx       — 브랜드 편집 폼
    └── NoticeForm.tsx      — 공지사항 폼
```

---

## 5. 인증 흐름

```
1. src/middleware.ts 수정:
   - /admin/* 접근 시 Supabase 세션 확인
   - 세션 없음 → /auth?redirect=/admin 리다이렉트

2. AdminLayout (서버 컴포넌트):
   - Supabase server client로 user 조회
   - pb_users_profile에서 role 조회
   - role !== "admin" → 403 페이지 렌더
   - role === "admin" → children 렌더

3. 초기 세팅:
   - 대표님 계정으로 로그인 후 pb_users_profile에 role: "admin" INSERT
   - 또는 Supabase 대시보드에서 직접 INSERT
```

---

## 6. API Route 구조

```
src/app/api/admin/
├── products/
│   ├── route.ts            — GET (목록), POST (등록)
│   └── [id]/route.ts       — GET (상세), PUT (수정), DELETE (삭제)
├── upload/route.ts         — POST (이미지 업로드, 초기엔 Supabase Storage → 추후 R2)
├── content/
│   ├── hero/route.ts       — GET, PUT (히어로 설정)
│   └── brand/route.ts      — GET, PUT (브랜드 콘텐츠)
├── orders/
│   └── [id]/route.ts       — GET (상세), PUT (상태 변경)
├── reviews/
│   └── [id]/route.ts       — PUT (답변 작성, 공개 토글)
├── inquiries/
│   └── [id]/route.ts       — PUT (답변 작성)
└── notices/
    ├── route.ts            — GET, POST
    └── [id]/route.ts       — PUT, DELETE
```

모든 API Route에서 admin role 체크 수행.

---

## 7. 프론트엔드 DB 전환

관리자 대시보드 구현과 동시에 기존 더미 데이터를 Supabase 조회로 전환:

| 페이지 | 현재 | 전환 후 |
|--------|------|---------|
| Home (New In, Best) | `lib/data/products.ts` 더미 | `pb_products` 조회 |
| Category | `getProducts()` 더미 | `pb_products` 필터 조회 |
| Product Detail | `getProductBySlug()` 더미 | `pb_products` + `pb_product_images` + `pb_product_options` JOIN |
| Hero 섹션 | 하드코딩 | `pb_hero_settings` 조회 |
| Brand 페이지 | 하드코딩 | `pb_brand_content` 조회 |
| 검색 | `searchProducts()` 더미 | `pb_products` ILIKE 조회 |
| CS 문의 | 로컬 상태 | `pb_cs_inquiries` INSERT |
| 리뷰 | 더미 | `pb_reviews` 조회 |
| 공지사항 | 더미 | `pb_notices` 조회 |

---

## 8. 관리자 디자인 가이드

- **레이아웃**: 사이드바(240px) + 메인 영역, 모바일은 사이드바 → 햄버거
- **배경**: `#FAFAFA` (Snow)
- **사이드바**: `#0A0A0A` (Jet Black) — 메인 사이트 헤더와 동일한 톤
- **폰트**: Archivo (heading) + Pretendard (body) — 메인 사이트와 동일
- **테이블**: 밝은 배경, 얇은 border, hover 효과
- **버튼**: 메인 사이트 `btn-primary` / `btn-secondary` 재사용
- **각진 모서리**: border-radius: 0 유지 (Industrial Minimal)
- **통계 카드**: 숫자 크게 + 라벨 작게, 그리드 배치

---

## 9. 구현 순서 (Phase)

### Phase 1: 기반
1. Supabase에 전체 DB 스키마 생성 (SQL 실행)
2. 관리자 인증 가드 (미들웨어 + AdminLayout)
3. 관리자 레이아웃 (사이드바, 헤더)
4. 대시보드 홈 페이지

### Phase 2: 상품 관리
5. 상품 CRUD API
6. 상품 목록 페이지 (테이블)
7. 상품 등록/수정 폼
8. 이미지 업로드 (Supabase Storage)
9. 프론트 Category/Product Detail → DB 조회 전환

### Phase 3: 콘텐츠 편집
10. 히어로 섹션 편집 API + UI
11. 브랜드 페이지 편집 API + UI
12. 프론트 Home Hero / Brand → DB 조회 전환

### Phase 4: 주문/CS 관리
13. 주문 목록/상세 API + UI
14. 리뷰 관리 (답변, 공개 토글)
15. 문의 관리 (답변)
16. 공지사항 CRUD

---

## 10. 이미지 업로드 전략

초기에는 **Supabase Storage** (무료 1GB) 사용.
추후 R2 전환 시 업로드 로직만 교체하면 됨 (URL 구조 변경).

```
Supabase Storage bucket: "product-images"
경로: product-images/{product_id}/{filename}
Public URL: {SUPABASE_URL}/storage/v1/object/public/product-images/...
```

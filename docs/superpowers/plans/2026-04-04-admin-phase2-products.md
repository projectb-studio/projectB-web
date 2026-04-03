# Admin Dashboard Phase 2: Product CRUD — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**Goal:** 관리자 상품 CRUD (등록/수정/삭제) API + UI 구현, 이미지 업로드(Supabase Storage), 프론트 페이지(Home, Category, Product Detail, Search)를 더미 데이터에서 Supabase DB 조회로 전환

**Architecture:** API Route Handler로 상품 CRUD 구현, 관리자 UI에서 폼 기반 등록/수정, 프론트엔드는 `lib/data/products.ts`의 더미 함수를 Supabase 쿼리로 교체

**Tech Stack:** Next.js 14 App Router, Supabase, Tailwind CSS, Lucide React

---

## Task 1: Supabase Storage 설정 + 이미지 업로드 API

**Files:**
- Create: `src/app/api/admin/upload/route.ts`

### Steps:
- [ ] Supabase 대시보드 → Storage → "product-images" 버킷 생성 (Public)
- [ ] 이미지 업로드 API Route 작성 — multipart/form-data 받아서 Supabase Storage에 업로드, public URL 반환
- [ ] 커밋

---

## Task 2: 상품 CRUD API

**Files:**
- Create: `src/app/api/admin/products/route.ts` (GET, POST)
- Create: `src/app/api/admin/products/[id]/route.ts` (GET, PUT, DELETE)

### Steps:
- [ ] GET /api/admin/products — 전체 상품 목록 (이미지, 옵션 포함)
- [ ] POST /api/admin/products — 상품 등록 (products + images + options 한번에)
- [ ] GET /api/admin/products/[id] — 단일 상품 상세
- [ ] PUT /api/admin/products/[id] — 상품 수정 (images/options diff 처리)
- [ ] DELETE /api/admin/products/[id] — 상품 삭제 (CASCADE로 images/options 자동 삭제)
- [ ] 모든 API에 admin role 체크 적용
- [ ] 커밋

---

## Task 3: 상품 목록 페이지 (관리자)

**Files:**
- Create: `src/app/admin/products/page.tsx`

### Steps:
- [ ] 테이블 UI — 이미지 썸네일, 이름, 가격, 태그, 뱃지, 공개 여부, 등록일
- [ ] 공개/비공개 토글
- [ ] 삭제 버튼 (확인 다이얼로그)
- [ ] "상품 등록" 버튼 → /admin/products/new 링크
- [ ] 커밋

---

## Task 4: 상품 등록/수정 폼 (관리자)

**Files:**
- Create: `src/app/admin/products/new/page.tsx`
- Create: `src/app/admin/products/[id]/page.tsx`
- Create: `src/components/admin/forms/ProductForm.tsx`
- Create: `src/components/admin/ui/ImageUploader.tsx`

### Steps:
- [ ] ProductForm — 이름, slug, 가격, 할인가, 태그, 뱃지, 설명, 상세, 배송, 케어, 공개 여부
- [ ] ImageUploader — 드래그앤드롭 또는 클릭 업로드, 미리보기, 정렬, 삭제
- [ ] 색상/사이즈 옵션 입력 UI
- [ ] 등록 페이지 (new) — ProductForm을 빈 상태로 렌더
- [ ] 수정 페이지 ([id]) — 기존 데이터를 불러와 ProductForm에 전달
- [ ] 커밋

---

## Task 5: 프론트엔드 DB 전환

**Files:**
- Modify: `src/lib/data/products.ts` — 더미 데이터 → Supabase 쿼리
- Modify: `src/components/layout/SearchOverlay.tsx` — searchProducts 사용 (변경 없이 동작해야 함)

### Steps:
- [ ] `getNewProducts()` → pb_products에서 badge='NEW' + is_published=true 조회, 첫 번째 이미지 포함
- [ ] `getBestSellers()` → pb_products에서 badge='BEST' + is_published=true 조회
- [ ] `getProducts(tag, page)` → pb_products 필터 + 페이지네이션
- [ ] `getProductBySlug(slug)` → pb_products + pb_product_images + pb_product_options JOIN
- [ ] `searchProducts(query)` → pb_products ILIKE 검색
- [ ] 더미 데이터 유지 (fallback — DB에 상품 없을 때 빈 화면 방지용)
- [ ] 빌드 확인
- [ ] 커밋

---

## Task 6: 더미 상품 DB 마이그레이션

**Files:**
- Create: `supabase/seed-products.sql`

### Steps:
- [ ] 기존 DUMMY_PRODUCTS 16개를 pb_products + pb_product_images + pb_product_options에 INSERT하는 SQL 작성
- [ ] Supabase SQL Editor에서 실행
- [ ] 프론트 페이지에서 상품이 정상 표시되는지 확인
- [ ] 커밋

# Admin v2 — ProjectB 관리자 개편 스펙

**작성일**: 2026-04-23
**브랜치**: `feature/admin-bundle` → `feature/admin-v2` (P0 이후 분기 고려)
**배경**: 네이버 스마트스토어 판매자센터 기능을 벤치마크하여, ProjectB(핸드메이드 소품샵, 10~50 상품, 1인 운영) 규모에 맞게 선별/재설계한다.

---

## 1. 분석 결과 요약

네이버 스마트스토어 9개 대메뉴를 검토한 결과, ProjectB에 필요/불필요 기능을 다음과 같이 분류했다.

### 🟢 필요 (ProjectB 규모에 적합)
- 판매관리: 발주/발송관리, 배송현황, 구매확정, **취소/반품/교환**
- 정산관리: 정산 내역(일별/건별), **세금계산서 조회** (기업 고객 대응 필수)
- 문의/리뷰: 기존 구조 유지
- 스토어관리: 기본정보, 카테고리/메뉴 관리, SNS 설정
- 혜택/마케팅: 쿠폰(혜택), 적립금, 회원등급, 알림톡
- 상품관리: 기존 + 배송정보 관리, 사진 보관함(P1)

### 🔴 제외 (네이버 전용 또는 과스펙)
- N배송/N pay/쇼핑윈도/광고관리/쇼핑라이브 (전부 네이버 플랫폼 전용)
- 그룹상품/카탈로그 가격관리/구독 관리
- 리뷰 인사이트(Beta) / 쇼핑챗봇 / 톡톡 응대분석 / 검색 순위 진단
- 선물 수락대기 / 반품안심케어 / 판매방해 고객관리

---

## 2. 최종 관리자 구조

```
/admin                          — 대시보드 (주문 파이프라인 위젯)
├─ /stats                       — 통계 (방문/매출 요약)
├─ /products
│   ├─ /[id]
│   ├─ /[id]/detail-editor
│   ├─ /new
│   ├─ /categories              ★ P1 신설 (카테고리/태그 관리)
│   └─ /media                    ★ P2 (사진 보관함)
├─ /orders                      — 주문 관리 (탭 구조 개편)
│   ├─ ?status=preparing        ★ P0 발송 대기
│   ├─ ?status=shipped          ★ P0 배송 중
│   ├─ ?status=delivered        ★ P0 배송 완료
│   ├─ ?status=confirmed        ★ P0 구매 확정
│   ├─ /cancellations           ★ P0 취소 관리
│   ├─ /returns                 ★ P0 반품 관리
│   └─ /exchanges               ★ P0 교환 관리
├─ /billing                     ★ P1 신설 (정산 관리)
│   ├─ /settlements             — 정산 내역 (일별/건별)
│   └─ /tax-invoices            — 세금계산서
├─ /marketing                   ★ P1 신설 (혜택/마케팅)
│   ├─ /coupons                 — 쿠폰 관리
│   ├─ /points                  — 적립금 관리
│   ├─ /grades                  — 회원등급 (VIP)
│   └─ /alimtalk                ★ P2 (카카오 알림톡)
├─ /members
├─ /reviews
├─ /inquiries
├─ /notices
├─ /magazine
├─ /content                     — 콘텐츠 편집 (Hero, Brand)
└─ /settings
    ├─ (기본정보 관리 — 현재 기본 페이지)
    ├─ /shipping                ★ P0 배송정보 (배송비, 무료배송 기준)
    └─ (SNS 링크 — 기본 페이지에 포함)
```

---

## 3. 우선순위

### P0 (런칭 필수)
1. **대시보드 주문 파이프라인 위젯** — 신규주문/발송대기/배송중/배송완료/구매확정 건수
2. **주문 관리 탭 개편** — URL 쿼리 기반 상태 필터, 송장 일괄 입력
3. **취소/반품/교환 페이지 신설** — `pb_order_requests` 테이블 신설
4. **배송정보 관리** — `/admin/settings/shipping`

### P1 (런칭 직후)
5. **정산 관리** — `/admin/billing/settlements`
6. **세금계산서 조회/발행** — `/admin/billing/tax-invoices`, `pb_tax_invoices` 신설
7. **쿠폰 관리** — `/admin/marketing/coupons`, `pb_coupons` + `pb_coupon_usages` 신설
8. **적립금 관리** — `/admin/marketing/points`, `pb_points` 신설
9. **회원등급** — `/admin/marketing/grades`, `pb_users_profile.grade` 필드 추가
10. **카테고리 관리** — `/admin/products/categories`, `pb_categories` 신설

### P2 (성장 단계 — 본 스펙 범위 외)
- 사진 보관함 (R2 미디어 라이브러리)
- 카카오 알림톡 발송
- 연관상품 관리
- GA4 방문/전환율 연동

---

## 4. DB 스키마 변경

### 신규 테이블

```sql
-- 배송 설정 (단일 레코드)
CREATE TABLE pb_shipping_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  default_fee INTEGER NOT NULL DEFAULT 3000,
  free_threshold INTEGER NOT NULL DEFAULT 50000,
  courier TEXT NOT NULL DEFAULT 'CJ대한통운',
  return_address JSONB,
  estimated_days TEXT DEFAULT '2-3일',
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 주문 요청 (취소/반품/교환)
CREATE TABLE pb_order_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES pb_orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cancel', 'return', 'exchange')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  reason TEXT,
  admin_note TEXT,
  refund_amount INTEGER,
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 카테고리 (상품 태그/카테고리)
CREATE TABLE pb_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 쿠폰
CREATE TABLE pb_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percent', 'amount')),
  value INTEGER NOT NULL,  -- percent: 10, amount: 5000
  min_order_amount INTEGER DEFAULT 0,
  max_discount_amount INTEGER,  -- percent 쿠폰 최대 할인액
  usage_limit INTEGER,  -- NULL = 무제한
  usage_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 쿠폰 사용 내역
CREATE TABLE pb_coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES pb_coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  order_id TEXT REFERENCES pb_orders(id),
  discount_amount INTEGER NOT NULL,
  used_at TIMESTAMPTZ DEFAULT now()
);

-- 적립금
CREATE TABLE pb_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,  -- 양수: 적립, 음수: 사용
  type TEXT NOT NULL CHECK (type IN ('earn', 'use', 'expire', 'manual_grant', 'refund')),
  reason TEXT,
  order_id TEXT REFERENCES pb_orders(id),
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 세금계산서
CREATE TABLE pb_tax_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES pb_orders(id),
  invoice_number TEXT UNIQUE,
  company_name TEXT NOT NULL,
  business_number TEXT NOT NULL,
  representative TEXT,
  address TEXT,
  email TEXT,
  supply_amount INTEGER NOT NULL,
  vat_amount INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'issued', 'cancelled')),
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 기존 테이블 수정

```sql
-- pb_users_profile에 등급 추가
ALTER TABLE pb_users_profile
  ADD COLUMN IF NOT EXISTS grade TEXT NOT NULL DEFAULT 'bronze'
  CHECK (grade IN ('bronze', 'silver', 'gold', 'vip'));

ALTER TABLE pb_users_profile
  ADD COLUMN IF NOT EXISTS total_spent INTEGER NOT NULL DEFAULT 0;

ALTER TABLE pb_users_profile
  ADD COLUMN IF NOT EXISTS point_balance INTEGER NOT NULL DEFAULT 0;
```

---

## 5. 주문 상태 표준화

현재 `pb_orders.status`: `pending, paid, preparing, shipped, delivered, cancelled, refunded`

**상태 흐름**:
```
pending (결제대기)
  → paid (결제완료)
    → preparing (발송대기, 송장 대기)
      → shipped (배송중)
        → delivered (배송완료)
          → confirmed (구매확정) ★ 추가
  → cancelled (취소)
  → refunded (환불)
```

**마이그레이션**: `status` CHECK 제약조건에 `confirmed` 추가

```sql
ALTER TABLE pb_orders DROP CONSTRAINT IF EXISTS pb_orders_status_check;
ALTER TABLE pb_orders ADD CONSTRAINT pb_orders_status_check
  CHECK (status IN ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'confirmed', 'cancelled', 'refunded'));
```

취소/반품/교환은 `pb_order_requests` 테이블로 관리 (주문 상태와 독립).

---

## 6. 네비게이션 구조 (constants/admin.ts)

```typescript
export const ADMIN_NAV_GROUPS = [
  {
    label: "운영",
    items: [
      { label: "대시보드", href: "/admin", icon: LayoutDashboard },
      { label: "통계", href: "/admin/stats", icon: BarChart3 },
    ],
  },
  {
    label: "상품 · 콘텐츠",
    items: [
      { label: "상품 관리", href: "/admin/products", icon: Package },
      { label: "카테고리", href: "/admin/products/categories", icon: Tag },
      { label: "콘텐츠 편집", href: "/admin/content/hero", icon: PanelTop },
      { label: "매거진", href: "/admin/magazine", icon: Newspaper },
    ],
  },
  {
    label: "주문 · 정산",
    items: [
      { label: "주문 관리", href: "/admin/orders", icon: ShoppingCart },
      { label: "정산 내역", href: "/admin/billing/settlements", icon: Receipt },
      { label: "세금계산서", href: "/admin/billing/tax-invoices", icon: FileText },
    ],
  },
  {
    label: "마케팅",
    items: [
      { label: "쿠폰 관리", href: "/admin/marketing/coupons", icon: Ticket },
      { label: "적립금 관리", href: "/admin/marketing/points", icon: Coins },
      { label: "회원등급", href: "/admin/marketing/grades", icon: Crown },
    ],
  },
  {
    label: "고객",
    items: [
      { label: "회원 관리", href: "/admin/members", icon: Users },
      { label: "리뷰 관리", href: "/admin/reviews", icon: Star },
      { label: "문의 관리", href: "/admin/inquiries", icon: MessageSquare },
      { label: "공지사항", href: "/admin/notices", icon: Megaphone },
    ],
  },
  {
    label: "설정",
    items: [
      { label: "사이트 설정", href: "/admin/settings", icon: Settings },
    ],
  },
];
```

---

## 7. 구현 계획 (파일 단위)

### DB 마이그레이션
- `supabase/migration-admin-v2.sql` 신설

### 신규 admin 페이지
- `src/app/admin/orders/cancellations/page.tsx`
- `src/app/admin/orders/returns/page.tsx`
- `src/app/admin/orders/exchanges/page.tsx`
- `src/app/admin/billing/settlements/page.tsx`
- `src/app/admin/billing/tax-invoices/page.tsx`
- `src/app/admin/marketing/coupons/page.tsx` + `new/page.tsx` + `[id]/page.tsx`
- `src/app/admin/marketing/points/page.tsx`
- `src/app/admin/marketing/grades/page.tsx`
- `src/app/admin/products/categories/page.tsx`
- `src/app/admin/settings/shipping/page.tsx`

### 신규 API 라우트
- `src/app/api/admin/order-requests/route.ts` (GET, POST)
- `src/app/api/admin/order-requests/[id]/route.ts` (PUT)
- `src/app/api/admin/billing/settlements/route.ts` (GET)
- `src/app/api/admin/billing/tax-invoices/route.ts` (GET, POST)
- `src/app/api/admin/coupons/route.ts` (GET, POST)
- `src/app/api/admin/coupons/[id]/route.ts` (PUT, DELETE)
- `src/app/api/admin/points/route.ts` (GET, POST)
- `src/app/api/admin/grades/route.ts` (GET, POST)
- `src/app/api/admin/categories/route.ts` (GET, POST)
- `src/app/api/admin/categories/[id]/route.ts` (PUT, DELETE)
- `src/app/api/admin/shipping-settings/route.ts` (GET, PUT)

### 수정되는 파일
- `src/constants/admin.ts` — 네비게이션 그룹화
- `src/app/admin/page.tsx` — 대시보드 파이프라인 위젯
- `src/app/admin/orders/page.tsx` — 탭 개편 + 쿼리 기반 필터
- `src/components/admin/layout/AdminSidebar.tsx` — 그룹 구조 반영
- `src/types/database.ts` — 신규 테이블 타입

---

## 8. 수용 기준 (Acceptance Criteria)

### P0
- [ ] 대시보드에 5단계 주문 파이프라인 위젯이 있고, 각 단계의 현재 건수가 표시된다.
- [ ] 주문 관리 페이지에서 URL 쿼리(`?status=`)로 상태 필터가 적용되고, 탭이 해당 쿼리와 동기화된다.
- [ ] `/admin/orders/cancellations`, `/returns`, `/exchanges`에서 각 요청 목록과 승인/반려 처리가 가능하다.
- [ ] `/admin/settings/shipping`에서 기본 배송비, 무료배송 기준, 택배사, 반품 주소를 설정할 수 있다.

### P1
- [ ] `/admin/billing/settlements`에서 일별/건별 정산 내역(결제금액 - 수수료)이 표시된다.
- [ ] `/admin/billing/tax-invoices`에서 세금계산서 발행 요청 목록과 상세를 볼 수 있다.
- [ ] `/admin/marketing/coupons`에서 쿠폰 CRUD가 가능하다 (코드, 할인율/금액, 유효기간, 사용 제한).
- [ ] `/admin/marketing/points`에서 사용자별 적립금 잔액 조회 및 수동 지급이 가능하다.
- [ ] `/admin/marketing/grades`에서 회원등급 기준 설정 및 등급별 회원 수 조회가 가능하다.
- [ ] `/admin/products/categories`에서 카테고리 CRUD 및 순서 변경이 가능하다.

### 공통
- [ ] 모든 페이지가 기존 디자인 시스템(Industrial Minimal, monochrome, no border-radius, uppercase heading)을 따른다.
- [ ] 모든 관리자 페이지는 `getAdminUser()` 체크를 통과한다.
- [ ] `pnpm build`가 오류 없이 통과한다.

---

## 9. 제외된 스마트스토어 기능 (의식적 선택)

- N배송/N pay/쇼핑윈도 — 네이버 플랫폼 전용
- 그룹상품 — 네이버 검색 노출 전용 (여러 상품을 하나로 묶기)
- 검색 순위 진단, 등록정보 검토 — 네이버 SEO 전용
- 톡톡 상담 / 쇼핑챗봇 — 카카오 채널로 대체
- 정기구독 / 예약구매 / 도착보장 — 범위 외
- 판매방해 고객관리 / 반품안심케어 — 1인샵 초기엔 과함

-- ============================================
-- Admin v2 Migration — Run in Supabase SQL Editor
-- P0: shipping_settings, order_requests, orders.status 'confirmed'
-- P1: categories, coupons, coupon_usages, points, tax_invoices, users_profile 확장
--
-- 주의: admin 쓰기는 API 라우트(getAdminUser + service_role)를 통해 수행.
--       RLS 는 public/authenticated 읽기만 열어둠.
-- ============================================

-- 1. pb_orders: 'confirmed' 상태 추가
ALTER TABLE pb_orders DROP CONSTRAINT IF EXISTS pb_orders_status_check;
ALTER TABLE pb_orders ADD CONSTRAINT pb_orders_status_check
  CHECK (status IN ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'confirmed', 'cancelled', 'refunded'));


-- 2. 배송 설정 (단일 레코드)
CREATE TABLE IF NOT EXISTS pb_shipping_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  default_fee INTEGER NOT NULL DEFAULT 3000,
  free_threshold INTEGER NOT NULL DEFAULT 50000,
  courier TEXT NOT NULL DEFAULT 'CJ대한통운',
  return_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  estimated_days TEXT NOT NULL DEFAULT '2-3일',
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO pb_shipping_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE pb_shipping_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public reads shipping settings" ON pb_shipping_settings;
CREATE POLICY "public reads shipping settings" ON pb_shipping_settings
  FOR SELECT USING (true);


-- 3. 주문 요청 (취소/반품/교환)
CREATE TABLE IF NOT EXISTS pb_order_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES pb_orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cancel', 'return', 'exchange')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  reason TEXT,
  admin_note TEXT,
  refund_amount INTEGER,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pb_order_requests_order ON pb_order_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_pb_order_requests_type_status ON pb_order_requests(type, status);

ALTER TABLE pb_order_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user reads own order requests" ON pb_order_requests;
CREATE POLICY "user reads own order requests" ON pb_order_requests
  FOR SELECT USING (
    order_id IN (SELECT id FROM pb_orders WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "user creates own order requests" ON pb_order_requests;
CREATE POLICY "user creates own order requests" ON pb_order_requests
  FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM pb_orders WHERE user_id = auth.uid())
  );


-- 4. 카테고리
CREATE TABLE IF NOT EXISTS pb_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pb_categories_order ON pb_categories(display_order);

ALTER TABLE pb_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public reads visible categories" ON pb_categories;
CREATE POLICY "public reads visible categories" ON pb_categories
  FOR SELECT USING (is_visible = true);

INSERT INTO pb_categories (slug, name, display_order) VALUES
  ('handmade', '핸드메이드', 1),
  ('fabric', '패브릭', 2),
  ('metal', '메탈', 3),
  ('wood', '우드', 4),
  ('stone', '스톤', 5),
  ('glass', '글라스', 6)
ON CONFLICT (slug) DO NOTHING;


-- 5. 쿠폰
CREATE TABLE IF NOT EXISTS pb_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percent', 'amount')),
  value INTEGER NOT NULL CHECK (value > 0),
  min_order_amount INTEGER NOT NULL DEFAULT 0,
  max_discount_amount INTEGER,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pb_coupons_active ON pb_coupons(is_active);

ALTER TABLE pb_coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public reads active coupons" ON pb_coupons;
CREATE POLICY "public reads active coupons" ON pb_coupons
  FOR SELECT USING (is_active = true);


-- 6. 쿠폰 사용 내역
CREATE TABLE IF NOT EXISTS pb_coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES pb_coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  order_id TEXT REFERENCES pb_orders(id),
  discount_amount INTEGER NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pb_coupon_usages_user ON pb_coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_pb_coupon_usages_coupon ON pb_coupon_usages(coupon_id);

ALTER TABLE pb_coupon_usages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user reads own coupon usages" ON pb_coupon_usages;
CREATE POLICY "user reads own coupon usages" ON pb_coupon_usages
  FOR SELECT USING (user_id = auth.uid());


-- 7. 적립금
CREATE TABLE IF NOT EXISTS pb_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'use', 'expire', 'manual_grant', 'refund')),
  reason TEXT,
  order_id TEXT REFERENCES pb_orders(id),
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pb_points_user ON pb_points(user_id, created_at DESC);

ALTER TABLE pb_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user reads own points" ON pb_points;
CREATE POLICY "user reads own points" ON pb_points
  FOR SELECT USING (user_id = auth.uid());


-- 8. 세금계산서
CREATE TABLE IF NOT EXISTS pb_tax_invoices (
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pb_tax_invoices_status ON pb_tax_invoices(status);

ALTER TABLE pb_tax_invoices ENABLE ROW LEVEL SECURITY;
-- 세금계산서는 admin 전용 — API 라우트(service_role)로 접근


-- 9. pb_users_profile 확장 (등급 세분화, 총 구매액, 포인트 잔액)
-- 기존: grade IN ('normal', 'vip')  →  bronze/silver/gold/vip 로 재정의
ALTER TABLE pb_users_profile
  ADD COLUMN IF NOT EXISTS total_spent INTEGER NOT NULL DEFAULT 0;

ALTER TABLE pb_users_profile
  ADD COLUMN IF NOT EXISTS point_balance INTEGER NOT NULL DEFAULT 0;

-- 기존 grade 데이터 마이그레이션: 'normal' → 'bronze'
UPDATE pb_users_profile SET grade = 'bronze' WHERE grade = 'normal';

-- 기존 제약 교체
ALTER TABLE pb_users_profile DROP CONSTRAINT IF EXISTS pb_users_profile_grade_chk;
ALTER TABLE pb_users_profile DROP CONSTRAINT IF EXISTS pb_users_profile_grade_check;

ALTER TABLE pb_users_profile ADD CONSTRAINT pb_users_profile_grade_check
  CHECK (grade IN ('bronze', 'silver', 'gold', 'vip'));

-- 기본값 bronze 로 변경
ALTER TABLE pb_users_profile ALTER COLUMN grade SET DEFAULT 'bronze';

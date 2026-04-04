-- ============================================
-- P3 Migration — Run in Supabase SQL Editor
-- ============================================

-- 1. pb_reviews에 is_hidden 컬럼 추가
ALTER TABLE pb_reviews
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;

-- 2. pb_faq 테이블 생성
CREATE TABLE IF NOT EXISTS pb_faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '일반',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. pb_magazine_categories 테이블 생성
CREATE TABLE IF NOT EXISTS pb_magazine_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. pb_magazine 테이블 생성
CREATE TABLE IF NOT EXISTS pb_magazine (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  category_id UUID REFERENCES pb_magazine_categories(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. RLS 정책 (pb_faq — 모든 사용자 읽기 가능)
ALTER TABLE pb_faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_faq: public read" ON pb_faq
  FOR SELECT USING (true);

-- 6. RLS 정책 (pb_magazine_categories — 모든 사용자 읽기 가능)
ALTER TABLE pb_magazine_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_magazine_categories: public read" ON pb_magazine_categories
  FOR SELECT USING (true);

-- 7. RLS 정책 (pb_magazine — 공개 글만 읽기 가능)
ALTER TABLE pb_magazine ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_magazine: public read published" ON pb_magazine
  FOR SELECT USING (is_published = true);

-- 8. 기본 FAQ 데이터 (선택)
INSERT INTO pb_faq (question, answer, category, sort_order) VALUES
  ('배송은 얼마나 걸리나요?', '일반 택배 기준 결제 완료 후 2~3영업일 내 발송됩니다. 도서산간 지역은 3~5영업일이 소요될 수 있습니다.', '배송', 1),
  ('무료배송 조건은 무엇인가요?', '50,000원 이상 구매 시 무료배송입니다. 미만 주문 시 배송비 3,000원이 부과됩니다.', '배송', 2),
  ('교환/반품은 어떻게 하나요?', '수령 후 7일 이내에 1:1 문의 또는 카카오톡으로 접수해 주세요. 단순 변심의 경우 반품 배송비는 고객 부담입니다.', '교환/반품', 3),
  ('핸드메이드 제품의 미세한 차이가 있나요?', '모든 핸드메이드 제품은 수작업으로 제작되어 크기, 색상, 패턴에 미세한 차이가 있을 수 있습니다. 이는 불량이 아닌 핸드메이드의 특성입니다.', '상품', 4),
  ('세탁은 어떻게 해야 하나요?', '패브릭 제품은 30도 이하 찬물에 중성세제로 손세탁을 권장합니다. 각 제품 상세 페이지의 Care 탭에서 관리법을 확인하실 수 있습니다.', '상품', 5),
  ('선물 포장이 가능한가요?', '네, 주문 시 배송 메모에 선물 포장 요청이라고 적어주시면 무료로 포장해 드립니다.', '주문', 6),
  ('적립금/포인트는 어떻게 사용하나요?', '결제 시 보유 적립금을 사용할 수 있습니다. 적립금은 구매 확정 후 자동 적립됩니다.', '주문', 7),
  ('오프라인 매장에서도 온라인 가격으로 구매할 수 있나요?', '온/오프라인 가격은 동일합니다. 다만, 온라인 전용 할인이나 쿠폰은 매장에서 적용되지 않을 수 있습니다.', '매장', 8);

-- 9. 기본 매거진 카테고리 데이터 (선택)
INSERT INTO pb_magazine_categories (name, sort_order) VALUES
  ('Craft', 1),
  ('Lifestyle', 2),
  ('Care Guide', 3),
  ('Styling', 4),
  ('Behind', 5),
  ('Guide', 6);

-- ============================================
-- Project B — Mock Test Data (제거 가능)
-- 모든 mock ID는 'mock-' prefix 사용
-- 제거: seed-mock-data-down.sql 실행
-- ============================================

-- 사용자 ID (실제 auth.users에서 가져와야 함)
-- 아래 user_id를 본인 auth.users ID로 교체하세요
DO $$
DECLARE
  v_user_id UUID := '16941235-f46f-415b-88d6-6cc7b50a5ea6';
  v_product_ids UUID[];
BEGIN

-- 기존 상품 ID 가져오기 (최대 5개)
SELECT ARRAY_AGG(id ORDER BY sort_order LIMIT 5)
INTO v_product_ids
FROM pb_products
WHERE is_published = true;

-- 상품이 없으면 중단
IF v_product_ids IS NULL OR array_length(v_product_ids, 1) IS NULL THEN
  RAISE NOTICE 'No published products found. Skipping mock data.';
  RETURN;
END IF;

-- ============================================
-- 주문 10건 (다양한 상태, 최근 90일 분산)
-- ============================================
INSERT INTO pb_orders (id, user_id, status, total_amount, shipping_fee, order_name, customer_name, customer_email, customer_phone, tracking_number, created_at) VALUES
('mock-order-001', v_user_id, 'delivered', 66000, 0, '세라믹 화병 외 1건', '고은석', 'kugll9606@gmail.com', '010-1234-5678', 'TRACK001', NOW() - INTERVAL '85 days'),
('mock-order-002', v_user_id, 'delivered', 38000, 3000, '리넨 테이블러너', '고은석', 'kugll9606@gmail.com', '010-1234-5678', 'TRACK002', NOW() - INTERVAL '72 days'),
('mock-order-003', v_user_id, 'delivered', 52000, 0, '황동 캔들 홀더 세트', '고은석', 'kugll9606@gmail.com', '010-1234-5678', 'TRACK003', NOW() - INTERVAL '60 days'),
('mock-order-004', v_user_id, 'shipped',   45000, 0, '오크 우드 트레이', '고은석', 'kugll9606@gmail.com', '010-1234-5678', 'TRACK004', NOW() - INTERVAL '14 days'),
('mock-order-005', v_user_id, 'paid',      28000, 3000, '울 펠트 코스터', '고은석', 'kugll9606@gmail.com', '010-1234-5678', NULL, NOW() - INTERVAL '7 days'),
('mock-order-006', v_user_id, 'preparing', 32000, 0, '스톤 인센스 홀더', '고은석', 'kugll9606@gmail.com', '010-1234-5678', NULL, NOW() - INTERVAL '3 days'),
('mock-order-007', v_user_id, 'delivered', 22000, 3000, '코튼 블렌드 냅킨 세트', '고은석', 'kugll9606@gmail.com', '010-1234-5678', 'TRACK007', NOW() - INTERVAL '45 days'),
('mock-order-008', v_user_id, 'cancelled', 28000, 0, '핸드블로운 글라스 컵', '고은석', 'kugll9606@gmail.com', '010-1234-5678', NULL, NOW() - INTERVAL '30 days'),
('mock-order-009', v_user_id, 'refunded',  18000, 3000, '울 펠트 코스터', '고은석', 'kugll9606@gmail.com', '010-1234-5678', NULL, NOW() - INTERVAL '50 days'),
('mock-order-010', v_user_id, 'pending',   90000, 0, '세라믹 화병 외 2건', '고은석', 'kugll9606@gmail.com', '010-1234-5678', NULL, NOW() - INTERVAL '1 day');

-- ============================================
-- 주문 항목 (주문당 1~2개 상품)
-- ============================================
INSERT INTO pb_order_items (order_id, product_id, product_name, quantity, price) VALUES
('mock-order-001', v_product_ids[1], 'Ceramic vase — matte black', 1, 38000),
('mock-order-001', v_product_ids[2], 'Linen table runner — ivory', 1, 28000),
('mock-order-002', v_product_ids[2], 'Linen table runner — ivory', 1, 38000),
('mock-order-003', v_product_ids[3], 'Brass candle holder set', 1, 52000),
('mock-order-004', v_product_ids[4], 'Oak wood tray — natural', 1, 45000),
('mock-order-005', v_product_ids[5], 'Wool felt coaster (4p)', 1, 28000),
('mock-order-006', v_product_ids[1], 'Stone incense holder', 1, 32000),
('mock-order-007', v_product_ids[2], 'Cotton blend napkin set', 1, 22000),
('mock-order-008', v_product_ids[3], 'Hand-blown glass cup', 1, 28000),
('mock-order-009', v_product_ids[5], 'Wool felt coaster (4p)', 1, 18000),
('mock-order-010', v_product_ids[1], 'Ceramic vase — matte black', 2, 38000),
('mock-order-010', v_product_ids[4], 'Oak wood tray — natural', 1, 14000);

-- ============================================
-- 리뷰 6건 (다양한 별점)
-- ============================================
INSERT INTO pb_reviews (product_id, user_id, author_name, rating, content, is_published, created_at) VALUES
(v_product_ids[1], v_user_id, '고은석', 5, '정말 퀄리티가 좋아요. 무광 블랙 색감이 사진 그대로예요. 인테리어 소품으로 딱입니다!', true, NOW() - INTERVAL '70 days'),
(v_product_ids[2], v_user_id, '고은석', 4, '린넨 질감이 좋고 아이보리 색상도 깔끔해요. 세탁법이 좀 까다롭긴 합니다.', true, NOW() - INTERVAL '55 days'),
(v_product_ids[3], NULL, '테스트 고객A', 5, '캔들 홀더 세트 선물용으로 샀는데 포장도 예쁘고 만족합니다.', true, NOW() - INTERVAL '40 days'),
(v_product_ids[1], NULL, '테스트 고객B', 3, '화병 자체는 예쁜데 생각보다 작아요. 사이즈 참고하세요.', true, NOW() - INTERVAL '25 days'),
(v_product_ids[4], NULL, '테스트 고객C', 5, '우드 트레이 퀄리티 최고! 재구매 의사 있습니다.', true, NOW() - INTERVAL '10 days'),
(v_product_ids[5], v_user_id, '고은석', 4, '코스터 두께감이 적당하고 흡수력도 좋아요.', true, NOW() - INTERVAL '5 days');

-- ============================================
-- CS 문의 4건
-- ============================================
INSERT INTO pb_cs_inquiries (type, title, content, user_id, author_name, author_email, author_phone, status, answer, created_at) VALUES
('product', '세라믹 화병 색상 문의', '무광 블랙 외에 다른 색상은 없나요?', v_user_id, '고은석', 'kugll9606@gmail.com', '010-1234-5678', 'answered', '안녕하세요! 현재는 무광 블랙만 제작하고 있으나, 화이트 색상을 준비 중입니다.', NOW() - INTERVAL '60 days'),
('shipping', '배송 일정 문의', '주문한 상품이 언제 배송되나요?', v_user_id, '고은석', 'kugll9606@gmail.com', '010-1234-5678', 'answered', '주문 확인 후 2-3일 내 출고됩니다. 감사합니다!', NOW() - INTERVAL '35 days'),
('product', '린넨 테이블러너 세탁 방법', '드라이클리닝만 가능한가요? 손세탁은 어떤가요?', NULL, '김지연', 'jiyeon.test@example.com', '010-9876-5432', 'waiting', NULL, NOW() - INTERVAL '3 days'),
('wholesale', '도매 제휴 문의', '소품샵 운영 중인데 도매 가격 문의드립니다. 카페 납품도 가능할까요?', NULL, '이승호', 'sh.lee@example.com', '010-5555-6666', 'waiting', NULL, NOW() - INTERVAL '1 day');

-- ============================================
-- 추가 회원 프로필 (게스트 리뷰어용은 auth.users 없이는 불가 → 스킵)
-- 기존 admin 유저의 full_name 업데이트
-- ============================================
UPDATE pb_users_profile
SET full_name = '고은석'
WHERE user_id = v_user_id AND (full_name IS NULL OR full_name = '' OR full_name = '관리자');

RAISE NOTICE 'Mock data inserted successfully!';
END $$;

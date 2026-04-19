-- ============================================
-- Project B — Mock Data 제거
-- seed-mock-data.sql 로 삽입한 데이터만 삭제
-- ============================================

-- 주문 항목 (CASCADE 로 주문 삭제 시 자동 제거되지만 명시적으로)
DELETE FROM pb_order_items WHERE order_id LIKE 'mock-order-%';

-- 주문
DELETE FROM pb_orders WHERE id LIKE 'mock-order-%';

-- 리뷰 (mock 기간 내 테스트 이름으로)
DELETE FROM pb_reviews WHERE author_name IN ('테스트 고객A', '테스트 고객B', '테스트 고객C');
DELETE FROM pb_reviews WHERE author_name = '고은석' AND content LIKE '%퀄리티%';
DELETE FROM pb_reviews WHERE author_name = '고은석' AND content LIKE '%린넨%';
DELETE FROM pb_reviews WHERE author_name = '고은석' AND content LIKE '%코스터%';

-- CS 문의 (테스트 데이터)
DELETE FROM pb_cs_inquiries WHERE title IN (
  '세라믹 화병 색상 문의',
  '배송 일정 문의',
  '린넨 테이블러너 세탁 방법',
  '도매 제휴 문의'
);

-- 확인
DO $$ BEGIN RAISE NOTICE 'Mock data removed successfully!'; END $$;

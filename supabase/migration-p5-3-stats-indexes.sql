-- P5-3: 통계 대시보드 쿼리 가속 인덱스
-- 실행: Supabase 대시보드 → SQL Editor

CREATE INDEX IF NOT EXISTS pb_orders_created_status_idx
  ON pb_orders (created_at DESC, status);

CREATE INDEX IF NOT EXISTS pb_order_items_product_id_idx
  ON pb_order_items (product_id);

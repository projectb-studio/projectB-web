-- P5 롤백 스크립트 (필요 시에만 실행)
-- 인덱스 → 제약 → 컬럼 순으로 제거

DROP INDEX IF EXISTS pb_order_items_product_id_idx;
DROP INDEX IF EXISTS pb_orders_created_status_idx;

ALTER TABLE pb_products DROP CONSTRAINT IF EXISTS pb_products_detail_blocks_size_chk;
ALTER TABLE pb_products DROP CONSTRAINT IF EXISTS pb_products_detail_blocks_array_chk;
ALTER TABLE pb_products DROP COLUMN IF EXISTS detail_blocks;

DROP INDEX IF EXISTS pb_users_created_at_idx;
DROP INDEX IF EXISTS pb_users_blocked_idx;
ALTER TABLE pb_users DROP CONSTRAINT IF EXISTS pb_users_admin_memo_len_chk;
ALTER TABLE pb_users DROP CONSTRAINT IF EXISTS pb_users_grade_chk;
ALTER TABLE pb_users
  DROP COLUMN IF EXISTS is_blocked,
  DROP COLUMN IF EXISTS grade,
  DROP COLUMN IF EXISTS admin_memo;

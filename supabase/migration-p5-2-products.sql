-- P5-2: pb_products.detail_blocks 컬럼 추가
-- 실행: Supabase 대시보드 → SQL Editor

ALTER TABLE pb_products
  ADD COLUMN IF NOT EXISTS detail_blocks JSONB NOT NULL DEFAULT '[]'::jsonb;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pb_products_detail_blocks_array_chk'
  ) THEN
    ALTER TABLE pb_products
      ADD CONSTRAINT pb_products_detail_blocks_array_chk
      CHECK (jsonb_typeof(detail_blocks) = 'array');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pb_products_detail_blocks_size_chk'
  ) THEN
    ALTER TABLE pb_products
      ADD CONSTRAINT pb_products_detail_blocks_size_chk
      CHECK (pg_column_size(detail_blocks) <= 1048576);
  END IF;
END $$;

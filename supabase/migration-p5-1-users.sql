-- P5-1: pb_users 관리 컬럼 확장
-- 실행: Supabase 대시보드 → SQL Editor

ALTER TABLE pb_users
  ADD COLUMN IF NOT EXISTS admin_memo TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS grade TEXT NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pb_users_grade_chk'
  ) THEN
    ALTER TABLE pb_users
      ADD CONSTRAINT pb_users_grade_chk CHECK (grade IN ('normal', 'vip'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pb_users_admin_memo_len_chk'
  ) THEN
    ALTER TABLE pb_users
      ADD CONSTRAINT pb_users_admin_memo_len_chk CHECK (char_length(admin_memo) <= 5000);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS pb_users_blocked_idx
  ON pb_users (is_blocked) WHERE is_blocked = TRUE;

CREATE INDEX IF NOT EXISTS pb_users_created_at_idx
  ON pb_users (created_at DESC);

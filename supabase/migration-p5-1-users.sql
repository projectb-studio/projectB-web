-- P5-1: pb_users_profile 관리 컬럼 확장
-- 실행: Supabase 대시보드 → SQL Editor
-- 주: 실제 사용자 테이블은 pb_users_profile (email/password는 auth.users)

ALTER TABLE pb_users_profile
  ADD COLUMN IF NOT EXISTS admin_memo TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS grade TEXT NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pb_users_profile_grade_chk'
  ) THEN
    ALTER TABLE pb_users_profile
      ADD CONSTRAINT pb_users_profile_grade_chk CHECK (grade IN ('normal', 'vip'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pb_users_profile_admin_memo_len_chk'
  ) THEN
    ALTER TABLE pb_users_profile
      ADD CONSTRAINT pb_users_profile_admin_memo_len_chk CHECK (char_length(admin_memo) <= 5000);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS pb_users_profile_blocked_idx
  ON pb_users_profile (is_blocked) WHERE is_blocked = TRUE;

CREATE INDEX IF NOT EXISTS pb_users_profile_created_at_idx
  ON pb_users_profile (created_at DESC);

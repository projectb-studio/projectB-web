-- ============================================
-- AI Draft Review Migration — Run in Supabase SQL Editor
-- AI 상품 상세페이지 초안과 운영자 검수/발행 흐름 분리 (환각 격리)
--
-- 핵심 원칙:
--   - AI 가 생성한 초안은 pb_product_detail_drafts 에만 적재된다.
--   - pb_products.detail_blocks (고객 노출 라이브 필드) 는 AI 가 직접 건드리지 않는다.
--   - 운영자가 'approve' API 를 명시적으로 호출할 때만 초안이 라이브로 복사된다.
--   - 발행 경계에서 detail-blocks sanitize(Zod + DOMPurify + 이미지 출처 allowlist) 를 재통과한다.
--
-- 주의: admin 쓰기는 API 라우트(getAdminUser + service_role)를 통해 수행.
--       RLS 는 초안에 대한 public/authenticated 직접 접근을 모두 차단(검수 전 미노출).
-- ============================================

CREATE TABLE IF NOT EXISTS pb_product_detail_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES pb_products(id) ON DELETE CASCADE,

  -- 검토 상태 머신: pending → (approve) published | (reject) rejected
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'published', 'rejected')),

  -- 초안 블록 (Block[]). 발행 전까지 고객에게 노출되지 않는다.
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- 생성 출처: ai(생성기) | manual(운영자 직접)
  source TEXT NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'manual')),

  -- 생성기 식별자: 'stub' | 'anthropic:claude-...' 등 (재현성/감사)
  generator TEXT,

  -- 생성 메타: 레시피 버전, 슬롯 채움 출처, 누락 사실 필드, 모델 입력 스냅샷 등
  generation_meta JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- 리비전 체인: 반려 후 피드백을 반영해 재생성한 초안은 부모를 가리킨다.
  parent_draft_id UUID REFERENCES pb_product_detail_drafts(id) ON DELETE SET NULL,
  revision INTEGER NOT NULL DEFAULT 1,

  -- 이 초안이 반영하려는 운영자 의견 (부모 초안 반려 시 입력된 review_note 복사본)
  feedback TEXT,

  -- 운영자 검토/반려 메모
  review_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  -- blocks 는 배열, 최대 1MB
  CONSTRAINT pb_drafts_blocks_array_chk CHECK (jsonb_typeof(blocks) = 'array'),
  CONSTRAINT pb_drafts_blocks_size_chk CHECK (pg_column_size(blocks) <= 1048576)
);

CREATE INDEX IF NOT EXISTS idx_pb_drafts_product ON pb_product_detail_drafts(product_id);
CREATE INDEX IF NOT EXISTS idx_pb_drafts_status ON pb_product_detail_drafts(status);
CREATE INDEX IF NOT EXISTS idx_pb_drafts_parent ON pb_product_detail_drafts(parent_draft_id);

-- RLS: 초안은 검수 전 자료이므로 클라이언트 직접 접근을 전면 차단.
-- 모든 읽기/쓰기는 service_role(admin API 라우트)로만 이루어진다. service_role 은 RLS 우회.
ALTER TABLE pb_product_detail_drafts ENABLE ROW LEVEL SECURITY;

-- 명시적 차단 정책 (정책 없는 RLS 활성 테이블은 anon/authenticated 접근이 막히지만,
-- 의도를 코드로 드러내기 위해 USING(false) 정책을 둔다.)
DROP POLICY IF EXISTS "no client access to drafts" ON pb_product_detail_drafts;
CREATE POLICY "no client access to drafts" ON pb_product_detail_drafts
  FOR ALL USING (false) WITH CHECK (false);

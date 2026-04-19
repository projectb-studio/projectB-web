-- P5-1b: 관리자 회원 목록 집계 RPC
-- 실행: Supabase 대시보드 → SQL Editor (p5-1 이후)
--
-- 매출 집계 대상 상태: paid, preparing, shipped, delivered
-- (pending = 결제 이전, cancelled/refunded = 제외)

CREATE OR REPLACE FUNCTION pb_admin_member_list(
  p_search TEXT,
  p_grade TEXT,
  p_blocked BOOLEAN,
  p_sort TEXT,
  p_limit INT,
  p_offset INT
) RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  grade TEXT,
  is_blocked BOOLEAN,
  joined_at TIMESTAMPTZ,
  order_count BIGINT,
  total_spent BIGINT,
  last_order_at TIMESTAMPTZ
) LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    p.user_id,
    p.full_name,
    au.email::TEXT,
    p.phone,
    p.grade,
    p.is_blocked,
    p.created_at AS joined_at,
    COUNT(o.id) AS order_count,
    COALESCE(
      SUM(o.total_amount) FILTER (
        WHERE o.status IN ('paid', 'preparing', 'shipped', 'delivered')
      ),
      0
    )::BIGINT AS total_spent,
    MAX(o.created_at) AS last_order_at
  FROM pb_users_profile p
  LEFT JOIN auth.users au ON au.id = p.user_id
  LEFT JOIN pb_orders o ON o.user_id = p.user_id
  WHERE p.role = 'customer'
    AND (
      p_search IS NULL
      OR p.full_name ILIKE '%' || p_search || '%'
      OR au.email ILIKE '%' || p_search || '%'
      OR p.phone ILIKE '%' || p_search || '%'
    )
    AND (p_grade IS NULL OR p.grade = p_grade)
    AND (p_blocked IS NULL OR p.is_blocked = p_blocked)
  GROUP BY p.user_id, p.full_name, au.email, p.phone, p.grade, p.is_blocked, p.created_at
  ORDER BY
    CASE WHEN p_sort = 'joined_at'     THEN p.created_at END DESC NULLS LAST,
    CASE WHEN p_sort = 'last_order_at' THEN MAX(o.created_at) END DESC NULLS LAST,
    CASE WHEN p_sort = 'total_spent'   THEN COALESCE(SUM(o.total_amount) FILTER (
      WHERE o.status IN ('paid', 'preparing', 'shipped', 'delivered')
    ), 0) END DESC NULLS LAST,
    p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

-- anon/authenticated 에게는 노출하지 않고, service_role 전용
REVOKE ALL ON FUNCTION pb_admin_member_list FROM PUBLIC;
REVOKE ALL ON FUNCTION pb_admin_member_list FROM anon, authenticated;

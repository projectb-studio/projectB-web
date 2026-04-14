-- P5-4: 관리자 통계 대시보드 RPC
-- 실행: Supabase 대시보드 → SQL Editor
--
-- 매출 집계 상태: paid, preparing, shipped, delivered
-- (pending = 결제 이전, cancelled/refunded = 제외)
-- 모든 date_trunc 는 Asia/Seoul 기준

CREATE OR REPLACE FUNCTION pb_stats_summary(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (revenue BIGINT, order_count BIGINT, new_users BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    COALESCE(SUM(total_amount) FILTER (
      WHERE status IN ('paid', 'preparing', 'shipped', 'delivered')
    ), 0)::BIGINT AS revenue,
    COUNT(*) FILTER (
      WHERE status IN ('paid', 'preparing', 'shipped', 'delivered')
    )::BIGINT AS order_count,
    (
      SELECT COUNT(*)::BIGINT FROM pb_users_profile
      WHERE created_at BETWEEN p_from AND p_to
    ) AS new_users
  FROM pb_orders
  WHERE created_at BETWEEN p_from AND p_to;
$$;

CREATE OR REPLACE FUNCTION pb_stats_revenue_daily(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (day DATE, revenue BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    (date_trunc('day', created_at AT TIME ZONE 'Asia/Seoul'))::DATE AS day,
    COALESCE(SUM(total_amount), 0)::BIGINT AS revenue
  FROM pb_orders
  WHERE created_at BETWEEN p_from AND p_to
    AND status IN ('paid', 'preparing', 'shipped', 'delivered')
  GROUP BY 1
  ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION pb_stats_orders_by_status(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (status TEXT, count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT status::TEXT, COUNT(*)::BIGINT
  FROM pb_orders
  WHERE created_at BETWEEN p_from AND p_to
  GROUP BY status;
$$;

CREATE OR REPLACE FUNCTION pb_stats_top_products(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (product_id UUID, name TEXT, qty BIGINT, revenue BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    p.id,
    p.name::TEXT,
    SUM(oi.quantity)::BIGINT AS qty,
    SUM(oi.price * oi.quantity)::BIGINT AS revenue
  FROM pb_order_items oi
  JOIN pb_orders o ON o.id = oi.order_id
  JOIN pb_products p ON p.id = oi.product_id
  WHERE o.created_at BETWEEN p_from AND p_to
    AND o.status IN ('paid', 'preparing', 'shipped', 'delivered')
  GROUP BY p.id, p.name
  ORDER BY revenue DESC
  LIMIT 10;
$$;

CREATE OR REPLACE FUNCTION pb_stats_new_users_daily(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (day DATE, count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    (date_trunc('day', created_at AT TIME ZONE 'Asia/Seoul'))::DATE AS day,
    COUNT(*)::BIGINT
  FROM pb_users_profile
  WHERE created_at BETWEEN p_from AND p_to
  GROUP BY 1
  ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION pb_stats_repurchase_rate(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (total_customers BIGINT, repeat_customers BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  WITH c AS (
    SELECT user_id, COUNT(*) AS n
    FROM pb_orders
    WHERE created_at BETWEEN p_from AND p_to
      AND status IN ('paid', 'preparing', 'shipped', 'delivered')
      AND user_id IS NOT NULL
    GROUP BY user_id
  )
  SELECT
    COUNT(*)::BIGINT AS total_customers,
    COUNT(*) FILTER (WHERE n >= 2)::BIGINT AS repeat_customers
  FROM c;
$$;

-- 권한: service_role 전용
REVOKE ALL ON FUNCTION pb_stats_summary, pb_stats_revenue_daily, pb_stats_orders_by_status,
  pb_stats_top_products, pb_stats_new_users_daily, pb_stats_repurchase_rate
  FROM PUBLIC;
REVOKE ALL ON FUNCTION pb_stats_summary, pb_stats_revenue_daily, pb_stats_orders_by_status,
  pb_stats_top_products, pb_stats_new_users_daily, pb_stats_repurchase_rate
  FROM anon, authenticated;

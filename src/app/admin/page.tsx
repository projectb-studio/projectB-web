import Link from "next/link";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminCard } from "@/components/admin/ui/AdminCard";

type StatusCount = { status: string; count: number };

function sinceDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const adminDb = createAdminClient();

  // 기본 카운트
  const [productsRes, ordersRes, inquiriesRes, reviewsRes] = await Promise.all([
    (supabase.from("pb_products") as ReturnType<typeof supabase.from>)
      .select("id", { count: "exact", head: true }),
    (supabase.from("pb_orders") as ReturnType<typeof supabase.from>)
      .select("id", { count: "exact", head: true }),
    (supabase.from("pb_cs_inquiries") as ReturnType<typeof supabase.from>)
      .select("id", { count: "exact", head: true })
      .eq("status", "received"),
    (supabase.from("pb_reviews") as ReturnType<typeof supabase.from>)
      .select("id", { count: "exact", head: true })
      .is("admin_reply", null),
  ]);

  // 주문 파이프라인: 단계별 건수
  const pipelineStatuses = ["paid", "preparing", "shipped", "delivered", "confirmed"] as const;
  const pipelineCounts = await Promise.all(
    pipelineStatuses.map(async (s) => {
      const { count } = await (adminDb.from("pb_orders") as ReturnType<typeof adminDb.from>)
        .select("id", { count: "exact", head: true })
        .eq("status", s);
      return { status: s, count: count ?? 0 } satisfies StatusCount;
    })
  );

  // 취소/반품/교환 요청 대기 건수
  const [cancelRes, returnRes, exchangeRes] = await Promise.all([
    (adminDb.from("pb_order_requests") as ReturnType<typeof adminDb.from>)
      .select("id", { count: "exact", head: true })
      .eq("type", "cancel")
      .eq("status", "pending"),
    (adminDb.from("pb_order_requests") as ReturnType<typeof adminDb.from>)
      .select("id", { count: "exact", head: true })
      .eq("type", "return")
      .eq("status", "pending"),
    (adminDb.from("pb_order_requests") as ReturnType<typeof adminDb.from>)
      .select("id", { count: "exact", head: true })
      .eq("type", "exchange")
      .eq("status", "pending"),
  ]);

  // 발송 지연: paid/preparing 상태인데 48시간 이상 경과
  const twoDaysAgo = sinceDays(2);
  const { count: shipDelayCount } = await (adminDb.from("pb_orders") as ReturnType<typeof adminDb.from>)
    .select("id", { count: "exact", head: true })
    .in("status", ["paid", "preparing"])
    .lt("created_at", twoDaysAgo);

  const productCount = productsRes.count ?? 0;
  const orderCount = ordersRes.count ?? 0;
  const pendingInquiries = inquiriesRes.count ?? 0;
  const unrepliedReviews = reviewsRes.count ?? 0;
  const cancelPending = cancelRes.count ?? 0;
  const returnPending = returnRes.count ?? 0;
  const exchangePending = exchangeRes.count ?? 0;
  const shipDelay = shipDelayCount ?? 0;

  const pipelineLabels: Record<(typeof pipelineStatuses)[number], string> = {
    paid: "신규 주문",
    preparing: "발송 대기",
    shipped: "배송중",
    delivered: "배송 완료",
    confirmed: "구매 확정",
  };

  return (
    <div className="space-y-8">
      {/* 요약 카드 */}
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
          <AdminCard label="전체 상품" value={productCount} />
          <AdminCard label="전체 주문" value={orderCount} />
          <AdminCard label="대기 문의" value={pendingInquiries} sub="답변 대기" />
          <AdminCard label="미답변 리뷰" value={unrepliedReviews} sub="답변 미작성" />
        </div>
        <Link
          href="/admin/stats"
          className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] underline inline-flex items-center gap-1"
        >
          자세한 통계 보기 <ChevronRight size={12} />
        </Link>
      </div>

      {/* 주문 파이프라인 */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">
            주문 현황
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] underline"
          >
            전체 주문 관리 →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0 border-t border-l border-[var(--pb-light-gray)]">
          {pipelineCounts.map((p) => (
            <Link
              key={p.status}
              href={`/admin/orders?status=${p.status}`}
              className="p-5 border-r border-b border-[var(--pb-light-gray)] hover:bg-[var(--pb-snow)] transition-colors"
            >
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--pb-gray)] font-heading font-semibold mb-2">
                {pipelineLabels[p.status as keyof typeof pipelineLabels]}
              </p>
              <p className="text-2xl font-heading font-semibold">
                {p.count}
                <span className="text-xs text-[var(--pb-silver)] ml-1">건</span>
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* 취소/반품/교환 + 지연 경고 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-[var(--pb-light-gray)] bg-white p-6">
          <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-5">
            취소 · 반품 · 교환
          </h2>
          <div className="grid grid-cols-3 gap-0 border-t border-l border-[var(--pb-light-gray)]">
            <Link
              href="/admin/orders/cancellations"
              className="p-4 border-r border-b border-[var(--pb-light-gray)] hover:bg-[var(--pb-snow)] transition-colors"
            >
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--pb-gray)] font-heading font-semibold mb-2">
                취소 요청
              </p>
              <p className="text-xl font-heading font-semibold text-[var(--accent-sale)]">
                {cancelPending}
              </p>
            </Link>
            <Link
              href="/admin/orders/returns"
              className="p-4 border-r border-b border-[var(--pb-light-gray)] hover:bg-[var(--pb-snow)] transition-colors"
            >
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--pb-gray)] font-heading font-semibold mb-2">
                반품 요청
              </p>
              <p className="text-xl font-heading font-semibold text-[var(--accent-sale)]">
                {returnPending}
              </p>
            </Link>
            <Link
              href="/admin/orders/exchanges"
              className="p-4 border-r border-b border-[var(--pb-light-gray)] hover:bg-[var(--pb-snow)] transition-colors"
            >
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--pb-gray)] font-heading font-semibold mb-2">
                교환 요청
              </p>
              <p className="text-xl font-heading font-semibold text-[var(--accent-sale)]">
                {exchangePending}
              </p>
            </Link>
          </div>
        </div>

        <div className="border border-[var(--pb-light-gray)] bg-white p-6">
          <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-5 flex items-center gap-2">
            <AlertTriangle size={14} />
            처리 지연
          </h2>
          <div className="space-y-3 text-sm">
            <Link
              href="/admin/orders?status=preparing"
              className="flex items-center justify-between py-2 border-b border-[var(--pb-light-gray)] hover:text-[var(--pb-jet-black)] transition-colors"
            >
              <span className="text-[var(--pb-gray)]">48시간 이상 미발송</span>
              <span
                className={
                  shipDelay > 0
                    ? "font-heading font-semibold text-[var(--accent-sale)]"
                    : "font-heading font-semibold text-[var(--pb-silver)]"
                }
              >
                {shipDelay}건
              </span>
            </Link>
            <Link
              href="/admin/inquiries"
              className="flex items-center justify-between py-2 border-b border-[var(--pb-light-gray)] hover:text-[var(--pb-jet-black)] transition-colors"
            >
              <span className="text-[var(--pb-gray)]">미답변 문의</span>
              <span
                className={
                  pendingInquiries > 0
                    ? "font-heading font-semibold text-[var(--accent-sale)]"
                    : "font-heading font-semibold text-[var(--pb-silver)]"
                }
              >
                {pendingInquiries}건
              </span>
            </Link>
            <Link
              href="/admin/reviews"
              className="flex items-center justify-between py-2 hover:text-[var(--pb-jet-black)] transition-colors"
            >
              <span className="text-[var(--pb-gray)]">미답변 리뷰</span>
              <span
                className={
                  unrepliedReviews > 0
                    ? "font-heading font-semibold text-[var(--accent-sale)]"
                    : "font-heading font-semibold text-[var(--pb-silver)]"
                }
              >
                {unrepliedReviews}건
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* 빠른 작업 */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-4">
          빠른 작업
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/admin/products/new" className="btn-primary text-center text-xs py-3">
            상품 등록
          </Link>
          <Link href="/admin/orders" className="btn-secondary text-center text-xs py-3">
            주문 확인
          </Link>
          <Link href="/admin/marketing/coupons/new" className="btn-secondary text-center text-xs py-3">
            쿠폰 생성
          </Link>
          <Link href="/admin/content/hero" className="btn-secondary text-center text-xs py-3">
            히어로 편집
          </Link>
        </div>
      </div>
    </div>
  );
}

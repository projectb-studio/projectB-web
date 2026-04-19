import { createClient } from "@/lib/supabase/server";
import { AdminCard } from "@/components/admin/ui/AdminCard";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

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

  const productCount = productsRes.count ?? 0;
  const orderCount = ordersRes.count ?? 0;
  const pendingInquiries = inquiriesRes.count ?? 0;
  const unrepliedReviews = reviewsRes.count ?? 0;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
        <AdminCard label="전체 상품" value={productCount} />
        <AdminCard label="전체 주문" value={orderCount} />
        <AdminCard label="대기 문의" value={pendingInquiries} sub="답변 대기" />
        <AdminCard label="미답변 리뷰" value={unrepliedReviews} sub="답변 미작성" />
      </div>
      <div className="mb-8">
        <a href="/admin/stats" className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] underline">
          자세한 통계 보기 →
        </a>
      </div>

      <div className="border border-[var(--pb-light-gray)] bg-white p-6">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-4">
          빠른 작업
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <a href="/admin/products/new" className="btn-primary text-center text-xs py-3">
            상품 등록
          </a>
          <a href="/admin/content/hero" className="btn-secondary text-center text-xs py-3">
            히어로 편집
          </a>
          <a href="/admin/orders" className="btn-secondary text-center text-xs py-3">
            주문 확인
          </a>
        </div>
      </div>
    </div>
  );
}

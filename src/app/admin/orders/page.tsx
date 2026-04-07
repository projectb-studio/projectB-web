"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  order_name: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  paid: "결제완료",
  preparing: "준비중",
  shipped: "배송중",
  delivered: "배송완료",
  cancelled: "취소",
  refunded: "환불",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-[var(--pb-silver)]",
  paid: "text-[#2D8F4E]",
  preparing: "text-[var(--pb-charcoal)]",
  shipped: "text-blue-600",
  delivered: "text-[var(--pb-gray)]",
  cancelled: "text-[var(--accent-sale)]",
  refunded: "text-[var(--accent-sale)]",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;
  }

  return (
    <div>
      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["all", "paid", "preparing", "shipped", "delivered", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1.5 text-xs border transition-colors whitespace-nowrap",
              filter === s
                ? "border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white"
                : "border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)]"
            )}
          >
            {s === "all" ? `전체 (${orders.length})` : `${STATUS_LABELS[s]} (${orders.filter((o) => o.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
          <p className="text-sm text-[var(--pb-gray)]">주문이 없습니다.</p>
        </div>
      ) : (
        <div className="border border-[var(--pb-light-gray)] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--pb-light-gray)] bg-[var(--pb-off-white)]">
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">주문번호</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">주문명</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">고객</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">금액</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">상태</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">날짜</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="hover:underline font-medium text-xs">
                      {order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs">{order.order_name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{order.customer_name ?? "비회원"}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(order.total_amount)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium", STATUS_COLORS[order.status] ?? "")}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--pb-silver)]">
                    {new Date(order.created_at).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

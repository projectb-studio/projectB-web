"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types/database";

interface Order {
  id: string;
  status: OrderStatus;
  total_amount: number;
  order_name: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  tracking_number: string | null;
  created_at: string;
}

const STATUS_TABS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "paid", label: "신규 주문" },
  { key: "preparing", label: "발송 대기" },
  { key: "shipped", label: "배송중" },
  { key: "delivered", label: "배송 완료" },
  { key: "confirmed", label: "구매 확정" },
  { key: "cancelled", label: "취소" },
  { key: "refunded", label: "환불" },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "결제 대기",
  paid: "결제 완료",
  preparing: "준비중",
  shipped: "배송중",
  delivered: "배송 완료",
  confirmed: "구매 확정",
  cancelled: "취소",
  refunded: "환불",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "text-[var(--pb-silver)]",
  paid: "text-[#2D8F4E]",
  preparing: "text-[var(--pb-charcoal)]",
  shipped: "text-blue-600",
  delivered: "text-[var(--pb-gray)]",
  confirmed: "text-[var(--pb-jet-black)]",
  cancelled: "text-[var(--accent-sale)]",
  refunded: "text-[var(--accent-sale)]",
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const filter = (statusParam ?? "all") as OrderStatus | "all";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders.length };
    for (const tab of STATUS_TABS) {
      if (tab.key !== "all") {
        map[tab.key] = orders.filter((o) => o.status === tab.key).length;
      }
    }
    return map;
  }, [orders]);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const handleTabChange = (key: OrderStatus | "all") => {
    if (key === "all") {
      router.push("/admin/orders");
    } else {
      router.push(`/admin/orders?status=${key}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[var(--pb-silver)]">로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      {/* 주문 관련 하위 네비 */}
      <div className="flex gap-4 mb-5 text-xs font-heading uppercase tracking-[0.15em]">
        <Link
          href="/admin/orders"
          className="py-1 border-b-2 border-[var(--pb-jet-black)] text-[var(--pb-jet-black)]"
        >
          주문
        </Link>
        <Link
          href="/admin/orders/cancellations"
          className="py-1 border-b-2 border-transparent text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)]"
        >
          취소
        </Link>
        <Link
          href="/admin/orders/returns"
          className="py-1 border-b-2 border-transparent text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)]"
        >
          반품
        </Link>
        <Link
          href="/admin/orders/exchanges"
          className="py-1 border-b-2 border-transparent text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)]"
        >
          교환
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={cn(
              "px-3 py-1.5 text-xs border transition-colors whitespace-nowrap",
              filter === tab.key
                ? "border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white"
                : "border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)]"
            )}
          >
            {tab.label} ({counts[tab.key] ?? 0})
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
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  주문번호
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  주문명
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  고객
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  금액
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  상태
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  송장
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  날짜
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="hover:underline font-medium text-xs"
                    >
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
                  <td className="px-4 py-3 text-xs text-[var(--pb-gray)]">
                    {order.tracking_number ?? "—"}
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

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderRequestStatus, OrderRequestType } from "@/types/database";

interface OrderRequestRow {
  id: string;
  order_id: string;
  type: OrderRequestType;
  status: OrderRequestStatus;
  reason: string | null;
  admin_note: string | null;
  refund_amount: number | null;
  requested_at: string;
  processed_at: string | null;
  pb_orders: {
    id: string;
    order_name: string | null;
    customer_name: string | null;
    customer_phone: string | null;
    total_amount: number;
    status: string;
  } | null;
}

const STATUS_TABS: { key: OrderRequestStatus | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pending", label: "접수" },
  { key: "approved", label: "승인" },
  { key: "completed", label: "완료" },
  { key: "rejected", label: "반려" },
];

const STATUS_LABELS: Record<OrderRequestStatus, string> = {
  pending: "접수",
  approved: "승인",
  rejected: "반려",
  completed: "완료",
};

const STATUS_COLORS: Record<OrderRequestStatus, string> = {
  pending: "text-[#C75050]",
  approved: "text-blue-600",
  rejected: "text-[var(--pb-silver)]",
  completed: "text-[#2D8F4E]",
};

interface Props {
  type: OrderRequestType;
  title: string;
}

export function OrderRequestList({ type, title }: Props) {
  const [rows, setRows] = useState<OrderRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderRequestStatus | "all">("all");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/order-requests?type=${type}`);
    if (res.ok) setRows(await res.json());
    setLoading(false);
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleUpdate(id: string, status: OrderRequestStatus) {
    setProcessing(id);
    const res = await fetch(`/api/admin/order-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await fetchData();
    } else {
      alert("처리 실패");
    }
    setProcessing(null);
  }

  const counts: Record<string, number> = { all: rows.length };
  for (const tab of STATUS_TABS) {
    if (tab.key !== "all") {
      counts[tab.key] = rows.filter((r) => r.status === tab.key).length;
    }
  }

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[var(--pb-silver)]">로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      {/* 상위 네비 */}
      <div className="flex gap-4 mb-5 text-xs font-heading uppercase tracking-[0.15em]">
        <Link
          href="/admin/orders"
          className="py-1 border-b-2 border-transparent text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)]"
        >
          주문
        </Link>
        <Link
          href="/admin/orders/cancellations"
          className={cn(
            "py-1 border-b-2",
            type === "cancel"
              ? "border-[var(--pb-jet-black)] text-[var(--pb-jet-black)]"
              : "border-transparent text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)]"
          )}
        >
          취소
        </Link>
        <Link
          href="/admin/orders/returns"
          className={cn(
            "py-1 border-b-2",
            type === "return"
              ? "border-[var(--pb-jet-black)] text-[var(--pb-jet-black)]"
              : "border-transparent text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)]"
          )}
        >
          반품
        </Link>
        <Link
          href="/admin/orders/exchanges"
          className={cn(
            "py-1 border-b-2",
            type === "exchange"
              ? "border-[var(--pb-jet-black)] text-[var(--pb-jet-black)]"
              : "border-transparent text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)]"
          )}
        >
          교환
        </Link>
      </div>

      <h1 className="font-heading text-lg tracking-[0.15em] uppercase font-semibold mb-5">
        {title}
      </h1>

      {/* 상태 필터 */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
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

      {filtered.length === 0 ? (
        <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
          <p className="text-sm text-[var(--pb-gray)]">요청이 없습니다.</p>
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
                  고객
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  사유
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  환불 금액
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  상태
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  요청일
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  처리
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${row.order_id}`}
                      className="hover:underline font-medium text-xs"
                    >
                      {row.order_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {row.pb_orders?.customer_name ?? "비회원"}
                  </td>
                  <td className="px-4 py-3 text-xs max-w-xs truncate">
                    {row.reason ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">
                    {row.refund_amount !== null ? formatPrice(row.refund_amount) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium", STATUS_COLORS[row.status])}>
                      {STATUS_LABELS[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--pb-silver)]">
                    {new Date(row.requested_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.status === "pending" ? (
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handleUpdate(row.id, "approved")}
                          disabled={processing === row.id}
                          className="text-xs px-2 py-1 border border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white hover:opacity-80 disabled:opacity-50"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleUpdate(row.id, "rejected")}
                          disabled={processing === row.id}
                          className="text-xs px-2 py-1 border border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-jet-black)] disabled:opacity-50"
                        >
                          반려
                        </button>
                      </div>
                    ) : row.status === "approved" ? (
                      <button
                        onClick={() => handleUpdate(row.id, "completed")}
                        disabled={processing === row.id}
                        className="text-xs px-2 py-1 border border-[#2D8F4E] text-[#2D8F4E] hover:bg-[#2D8F4E] hover:text-white disabled:opacity-50"
                      >
                        완료 처리
                      </button>
                    ) : (
                      <span className="text-xs text-[var(--pb-silver)]">—</span>
                    )}
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

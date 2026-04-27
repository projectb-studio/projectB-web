"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { BillingNav } from "@/components/admin/billing/BillingNav";

type GroupBy = "day" | "order";

interface DayRow {
  date: string;
  gross: number;
  fee: number;
  net: number;
  count: number;
}

interface OrderRow {
  id: string;
  status: string;
  total_amount: number;
  shipping_fee: number;
  payment_method: string | null;
  created_at: string;
  order_name: string | null;
  customer_name: string | null;
  fee: number;
  net: number;
}

function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default function AdminSettlementsPage() {
  const initialRange = getDefaultDateRange();
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const [dayRows, setDayRows] = useState<DayRow[]>([]);
  const [orderRows, setOrderRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams({
        from: `${from}T00:00:00`,
        to: `${to}T23:59:59`,
        group_by: groupBy,
      });
      const res = await fetch(`/api/admin/billing/settlements?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (groupBy === "day") setDayRows(data.rows);
        else setOrderRows(data.rows);
      }
      setLoading(false);
    }
    load();
  }, [from, to, groupBy]);

  const totals = groupBy === "day"
    ? dayRows.reduce(
        (acc, r) => ({
          gross: acc.gross + r.gross,
          fee: acc.fee + r.fee,
          net: acc.net + r.net,
          count: acc.count + r.count,
        }),
        { gross: 0, fee: 0, net: 0, count: 0 }
      )
    : orderRows.reduce(
        (acc, r) => ({
          gross: acc.gross + r.total_amount,
          fee: acc.fee + r.fee,
          net: acc.net + r.net,
          count: acc.count + 1,
        }),
        { gross: 0, fee: 0, net: 0, count: 0 }
      );

  const inputClass = "border border-[var(--pb-light-gray)] px-3 py-2 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";

  return (
    <div>
      <BillingNav />

      {/* 필터 */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label className="block text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1">
            시작일
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1">
            종료일
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setGroupBy("day")}
            className={cn(
              "px-3 py-2 text-xs border transition-colors",
              groupBy === "day"
                ? "border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white"
                : "border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)]"
            )}
          >
            일별
          </button>
          <button
            onClick={() => setGroupBy("order")}
            className={cn(
              "px-3 py-2 text-xs border transition-colors",
              groupBy === "order"
                ? "border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white"
                : "border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)]"
            )}
          >
            건별
          </button>
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-[var(--pb-light-gray)] mb-6">
        <div className="border-r border-b border-[var(--pb-light-gray)] bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--pb-gray)] font-heading font-semibold mb-2">
            총 주문 수
          </p>
          <p className="text-xl font-heading font-semibold">{totals.count}건</p>
        </div>
        <div className="border-r border-b border-[var(--pb-light-gray)] bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--pb-gray)] font-heading font-semibold mb-2">
            총 매출 (Gross)
          </p>
          <p className="text-xl font-heading font-semibold">{formatPrice(totals.gross)}</p>
        </div>
        <div className="border-r border-b border-[var(--pb-light-gray)] bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--pb-gray)] font-heading font-semibold mb-2">
            PG 수수료 (3.3%)
          </p>
          <p className="text-xl font-heading font-semibold text-[var(--pb-silver)]">
            −{formatPrice(totals.fee)}
          </p>
        </div>
        <div className="border-r border-b border-[var(--pb-light-gray)] bg-[var(--pb-jet-black)] p-5">
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/60 font-heading font-semibold mb-2">
            정산 예정액 (Net)
          </p>
          <p className="text-xl font-heading font-semibold text-white">{formatPrice(totals.net)}</p>
        </div>
      </div>

      {/* 표 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[var(--pb-silver)]">로딩 중...</p>
        </div>
      ) : groupBy === "day" ? (
        dayRows.length === 0 ? (
          <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
            <p className="text-sm text-[var(--pb-gray)]">해당 기간 정산 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="border border-[var(--pb-light-gray)] bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--pb-light-gray)] bg-[var(--pb-off-white)]">
                  <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                    일자
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                    주문 수
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                    매출
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                    수수료
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                    정산액
                  </th>
                </tr>
              </thead>
              <tbody>
                {dayRows.map((r) => (
                  <tr key={r.date} className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)]">
                    <td className="px-4 py-3 text-xs">{r.date}</td>
                    <td className="px-4 py-3 text-xs text-right">{r.count}</td>
                    <td className="px-4 py-3 text-xs text-right">{formatPrice(r.gross)}</td>
                    <td className="px-4 py-3 text-xs text-right text-[var(--pb-silver)]">
                      −{formatPrice(r.fee)}
                    </td>
                    <td className="px-4 py-3 text-xs text-right font-medium">
                      {formatPrice(r.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : orderRows.length === 0 ? (
        <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
          <p className="text-sm text-[var(--pb-gray)]">해당 기간 정산 내역이 없습니다.</p>
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
                  주문일
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  고객
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  매출
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  수수료
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  정산액
                </th>
              </tr>
            </thead>
            <tbody>
              {orderRows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)]">
                  <td className="px-4 py-3 text-xs">
                    <Link href={`/admin/orders/${r.id}`} className="hover:underline font-medium">
                      {r.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--pb-silver)]">
                    {new Date(r.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-xs">{r.customer_name ?? "비회원"}</td>
                  <td className="px-4 py-3 text-xs text-right">{formatPrice(r.total_amount)}</td>
                  <td className="px-4 py-3 text-xs text-right text-[var(--pb-silver)]">
                    −{formatPrice(r.fee)}
                  </td>
                  <td className="px-4 py-3 text-xs text-right font-medium">{formatPrice(r.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

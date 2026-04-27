"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { MarketingNav } from "@/components/admin/marketing/MarketingNav";
import type { DbCoupon } from "@/types/database";

export default function AdminCouponsPage() {
  const [rows, setRows] = useState<DbCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/coupons");
    if (res.ok) setRows(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete(id: string) {
    if (!confirm("쿠폰을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok) await fetchData();
  }

  async function handleToggle(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    });
    if (res.ok) await fetchData();
  }

  const counts = {
    all: rows.length,
    active: rows.filter((r) => r.is_active).length,
    inactive: rows.filter((r) => !r.is_active).length,
  };

  const filtered =
    filter === "all" ? rows : filter === "active" ? rows.filter((r) => r.is_active) : rows.filter((r) => !r.is_active);

  return (
    <div>
      <MarketingNav />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-1">쿠폰 관리</h2>
          <p className="text-xs text-[var(--pb-gray)]">할인 쿠폰을 생성하고 관리합니다.</p>
        </div>
        <Link href="/admin/marketing/coupons/new" className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
          <Plus size={14} /> 쿠폰 생성
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 text-xs border transition-colors",
              filter === f
                ? "border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white"
                : "border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)]"
            )}
          >
            {f === "all" ? "전체" : f === "active" ? "활성" : "비활성"} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[var(--pb-silver)]">로딩 중...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
          <p className="text-sm text-[var(--pb-gray)]">쿠폰이 없습니다.</p>
        </div>
      ) : (
        <div className="border border-[var(--pb-light-gray)] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--pb-light-gray)] bg-[var(--pb-off-white)]">
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  코드
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  이름
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  할인
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  최소 주문
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  사용
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  유효기간
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  상태
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)]">
                  <td className="px-4 py-3 text-xs font-mono font-medium">{c.code}</td>
                  <td className="px-4 py-3 text-xs">{c.name}</td>
                  <td className="px-4 py-3 text-xs font-medium">
                    {c.type === "percent" ? `${c.value}%` : formatPrice(c.value)}
                  </td>
                  <td className="px-4 py-3 text-xs">{formatPrice(c.min_order_amount)}</td>
                  <td className="px-4 py-3 text-xs">
                    {c.usage_count}
                    {c.usage_limit !== null && ` / ${c.usage_limit}`}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--pb-silver)]">
                    {c.valid_until ? new Date(c.valid_until).toLocaleDateString("ko-KR") : "무제한"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(c.id, c.is_active)}
                      className={cn(
                        "text-xs px-2 py-1 border",
                        c.is_active
                          ? "border-[#2D8F4E] text-[#2D8F4E]"
                          : "border-[var(--pb-silver)] text-[var(--pb-silver)]"
                      )}
                    >
                      {c.is_active ? "활성" : "비활성"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Link
                        href={`/admin/marketing/coupons/${c.id}`}
                        className="text-xs px-2 py-1 border border-[var(--pb-light-gray)] hover:border-[var(--pb-jet-black)]"
                      >
                        편집
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs px-2 py-1 border border-[var(--accent-sale)] text-[var(--accent-sale)] hover:bg-[var(--accent-sale)] hover:text-white"
                      >
                        삭제
                      </button>
                    </div>
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

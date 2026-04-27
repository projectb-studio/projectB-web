"use client";

import { useCallback, useEffect, useState } from "react";
import { cn, formatPrice } from "@/lib/utils";
import { MarketingNav } from "@/components/admin/marketing/MarketingNav";
import type { MemberGrade } from "@/types/database";

interface Member {
  user_id: string;
  full_name: string | null;
  grade: MemberGrade;
  total_spent: number;
  point_balance: number;
}

interface GradesResponse {
  stats: Record<MemberGrade, { count: number; total_spent: number }>;
  members: Member[];
}

const GRADE_ORDER: MemberGrade[] = ["bronze", "silver", "gold", "vip"];

const GRADE_LABELS: Record<MemberGrade, string> = {
  bronze: "BRONZE",
  silver: "SILVER",
  gold: "GOLD",
  vip: "VIP",
};

const GRADE_GUIDE: Record<MemberGrade, string> = {
  bronze: "신규 회원 (기본)",
  silver: "구매액 10만원 이상 권장",
  gold: "구매액 50만원 이상 권장",
  vip: "구매액 100만원 이상 권장",
};

const GRADE_BG: Record<MemberGrade, string> = {
  bronze: "bg-[#C0846B]",
  silver: "bg-[#9A9A9A]",
  gold: "bg-[#C9A866]",
  vip: "bg-[var(--pb-jet-black)]",
};

export default function AdminGradesPage() {
  const [data, setData] = useState<GradesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MemberGrade | "all">("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/grades");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleChange(userId: string, newGrade: MemberGrade) {
    const res = await fetch("/api/admin/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, grade: newGrade }),
    });
    if (res.ok) await fetchData();
  }

  if (loading) {
    return (
      <div>
        <MarketingNav />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[var(--pb-silver)]">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <MarketingNav />
        <p className="text-sm text-[var(--pb-gray)]">데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const filteredMembers =
    filter === "all" ? data.members : data.members.filter((m) => m.grade === filter);

  return (
    <div>
      <MarketingNav />

      <div className="mb-6">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-1">회원등급</h2>
        <p className="text-xs text-[var(--pb-gray)]">회원 등급 현황을 확인하고 개별 회원 등급을 변경합니다.</p>
      </div>

      {/* 등급별 통계 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-[var(--pb-light-gray)] mb-6">
        {GRADE_ORDER.map((g) => {
          const s = data.stats[g];
          return (
            <div key={g} className="border-r border-b border-[var(--pb-light-gray)] bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className={cn("px-2 py-0.5 text-[10px] tracking-[0.15em] font-heading font-semibold text-white", GRADE_BG[g])}>
                  {GRADE_LABELS[g]}
                </span>
              </div>
              <p className="text-xl font-heading font-semibold">
                {s.count}
                <span className="text-xs text-[var(--pb-silver)] ml-1">명</span>
              </p>
              <p className="text-xs text-[var(--pb-gray)] mt-1">
                누적 {formatPrice(s.total_spent)}
              </p>
              <p className="text-[10px] text-[var(--pb-silver)] mt-2">{GRADE_GUIDE[g]}</p>
            </div>
          );
        })}
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-3 py-1.5 text-xs border transition-colors whitespace-nowrap",
            filter === "all"
              ? "border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white"
              : "border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)]"
          )}
        >
          전체 ({data.members.length})
        </button>
        {GRADE_ORDER.map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={cn(
              "px-3 py-1.5 text-xs border transition-colors whitespace-nowrap",
              filter === g
                ? "border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white"
                : "border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)]"
            )}
          >
            {GRADE_LABELS[g]} ({data.stats[g].count})
          </button>
        ))}
      </div>

      {filteredMembers.length === 0 ? (
        <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
          <p className="text-sm text-[var(--pb-gray)]">회원이 없습니다.</p>
        </div>
      ) : (
        <div className="border border-[var(--pb-light-gray)] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--pb-light-gray)] bg-[var(--pb-off-white)]">
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  회원
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  총 구매액
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  적립금 잔액
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  현재 등급
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  등급 변경
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.user_id} className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)]">
                  <td className="px-4 py-3 text-xs">
                    {m.full_name ?? "—"}
                    <span className="block text-[10px] text-[var(--pb-silver)] font-mono">
                      {m.user_id.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-right font-medium">{formatPrice(m.total_spent)}</td>
                  <td className="px-4 py-3 text-xs text-right">{formatPrice(m.point_balance)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-block px-2 py-0.5 text-[10px] tracking-[0.15em] font-heading font-semibold text-white", GRADE_BG[m.grade])}>
                      {GRADE_LABELS[m.grade]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={m.grade}
                      onChange={(e) => handleChange(m.user_id, e.target.value as MemberGrade)}
                      className="text-xs border border-[var(--pb-light-gray)] px-2 py-1 bg-white focus:border-[var(--pb-jet-black)] focus:outline-none"
                    >
                      {GRADE_ORDER.map((g) => (
                        <option key={g} value={g}>
                          {GRADE_LABELS[g]}
                        </option>
                      ))}
                    </select>
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

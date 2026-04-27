"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { MarketingNav } from "@/components/admin/marketing/MarketingNav";
import type { PointType } from "@/types/database";

interface PointRow {
  id: string;
  user_id: string;
  amount: number;
  type: PointType;
  reason: string | null;
  balance_after: number;
  created_at: string;
  pb_users_profile: { full_name: string | null; user_id: string } | null;
}

const TYPE_LABELS: Record<PointType, string> = {
  earn: "자동 적립",
  use: "사용",
  expire: "소멸",
  manual_grant: "수동 지급",
  refund: "환불 적립",
};

const TYPE_COLORS: Record<PointType, string> = {
  earn: "text-[#2D8F4E]",
  use: "text-[var(--pb-gray)]",
  expire: "text-[var(--pb-silver)]",
  manual_grant: "text-[var(--pb-jet-black)]",
  refund: "text-[#2D8F4E]",
};

export default function AdminPointsPage() {
  const [rows, setRows] = useState<PointRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Grant form
  const [targetUserId, setTargetUserId] = useState("");
  const [grantAmount, setGrantAmount] = useState(0);
  const [grantReason, setGrantReason] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/points");
    if (res.ok) setRows(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: targetUserId,
        amount: grantAmount,
        type: grantAmount >= 0 ? "manual_grant" : "use",
        reason: grantReason || null,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setTargetUserId("");
      setGrantAmount(0);
      setGrantReason("");
      await fetchData();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "지급 실패");
    }
    setSaving(false);
  }

  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";
  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";

  return (
    <div>
      <MarketingNav />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-1">적립금 관리</h2>
          <p className="text-xs text-[var(--pb-gray)]">회원 적립금을 수동 지급/차감할 수 있습니다.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
        >
          <Plus size={14} /> 수동 지급
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleGrant} className="border border-[var(--pb-jet-black)] bg-white p-6 mb-6 space-y-4 max-w-xl">
          <h3 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">수동 지급/차감</h3>
          <div>
            <label className={labelClass}>대상 회원 (user_id) *</label>
            <input
              type="text"
              required
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className={inputClass}
              placeholder="회원의 user_id (UUID)"
            />
            <p className="text-[10px] text-[var(--pb-silver)] mt-1">
              회원 관리 페이지에서 회원 상세를 확인하면 user_id를 복사할 수 있습니다.
            </p>
          </div>
          <div>
            <label className={labelClass}>지급/차감 금액 (원) *</label>
            <input
              type="number"
              required
              value={grantAmount}
              onChange={(e) => setGrantAmount(Number(e.target.value))}
              className={inputClass}
              placeholder="양수는 지급, 음수는 차감"
            />
          </div>
          <div>
            <label className={labelClass}>사유</label>
            <input
              type="text"
              value={grantReason}
              onChange={(e) => setGrantReason(e.target.value)}
              className={inputClass}
              placeholder="예: 이벤트 당첨"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !targetUserId || grantAmount === 0}
            className="btn-primary text-sm py-2.5 px-6 disabled:opacity-50"
          >
            {saving ? "처리 중..." : "지급"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[var(--pb-silver)]">로딩 중...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
          <p className="text-sm text-[var(--pb-gray)]">적립금 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="border border-[var(--pb-light-gray)] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--pb-light-gray)] bg-[var(--pb-off-white)]">
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  회원
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  유형
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  금액
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  잔액
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  사유
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  일시
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)]">
                  <td className="px-4 py-3 text-xs">
                    {r.pb_users_profile?.full_name ?? "—"}
                    <span className="block text-[10px] text-[var(--pb-silver)] font-mono">
                      {r.user_id.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium", TYPE_COLORS[r.type])}>
                      {TYPE_LABELS[r.type]}
                    </span>
                  </td>
                  <td className={cn("px-4 py-3 text-xs text-right font-medium", r.amount >= 0 ? "text-[#2D8F4E]" : "text-[var(--accent-sale)]")}>
                    {r.amount >= 0 ? "+" : ""}
                    {formatPrice(r.amount)}
                  </td>
                  <td className="px-4 py-3 text-xs text-right">{formatPrice(r.balance_after)}</td>
                  <td className="px-4 py-3 text-xs max-w-xs truncate">{r.reason ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-[var(--pb-silver)]">
                    {new Date(r.created_at).toLocaleDateString("ko-KR")}
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

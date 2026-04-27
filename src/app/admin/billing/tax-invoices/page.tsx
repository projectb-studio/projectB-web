"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { BillingNav } from "@/components/admin/billing/BillingNav";
import type { DbTaxInvoice, TaxInvoiceStatus } from "@/types/database";

const STATUS_TABS: { key: TaxInvoiceStatus | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "requested", label: "요청" },
  { key: "issued", label: "발행 완료" },
  { key: "cancelled", label: "취소" },
];

const STATUS_LABELS: Record<TaxInvoiceStatus, string> = {
  requested: "요청",
  issued: "발행 완료",
  cancelled: "취소",
};

const STATUS_COLORS: Record<TaxInvoiceStatus, string> = {
  requested: "text-[#C75050]",
  issued: "text-[#2D8F4E]",
  cancelled: "text-[var(--pb-silver)]",
};

export default function AdminTaxInvoicesPage() {
  const [rows, setRows] = useState<DbTaxInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaxInvoiceStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [orderId, setOrderId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [bizNum, setBizNum] = useState("");
  const [representative, setRepresentative] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [supplyAmount, setSupplyAmount] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/billing/tax-invoices");
    if (res.ok) setRows(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const counts: Record<string, number> = { all: rows.length };
  for (const tab of STATUS_TABS) {
    if (tab.key !== "all") counts[tab.key] = rows.filter((r) => r.status === tab.key).length;
  }

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const vatAmount = Math.round(supplyAmount * 0.1);
    const res = await fetch("/api/admin/billing/tax-invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: orderId || null,
        company_name: companyName,
        business_number: bizNum,
        representative: representative || null,
        address: address || null,
        email: email || null,
        supply_amount: supplyAmount,
        vat_amount: vatAmount,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setOrderId("");
      setCompanyName("");
      setBizNum("");
      setRepresentative("");
      setAddress("");
      setEmail("");
      setSupplyAmount(0);
      await fetchData();
    } else {
      alert("등록 실패");
    }
    setSaving(false);
  }

  async function handleIssue(id: string, invoiceNumber: string) {
    const res = await fetch(`/api/admin/billing/tax-invoices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "issued", invoice_number: invoiceNumber }),
    });
    if (res.ok) await fetchData();
  }

  async function handleCancel(id: string) {
    if (!confirm("취소 처리하시겠습니까?")) return;
    const res = await fetch(`/api/admin/billing/tax-invoices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    if (res.ok) await fetchData();
  }

  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";
  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";

  return (
    <div>
      <BillingNav />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-1">세금계산서</h2>
          <p className="text-xs text-[var(--pb-gray)]">기업 고객을 위한 세금계산서 발행 요청을 관리합니다.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "취소" : "새 요청 등록"}
        </button>
      </div>

      {/* 등록 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-[var(--pb-jet-black)] bg-white p-6 mb-6 space-y-4">
          <h3 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">새 요청 등록</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>주문번호 (선택)</label>
              <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>이메일</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>회사명 *</label>
              <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>사업자번호 *</label>
              <input type="text" required value={bizNum} onChange={(e) => setBizNum(e.target.value)} className={inputClass} placeholder="000-00-00000" />
            </div>
            <div>
              <label className={labelClass}>대표자</label>
              <input type="text" value={representative} onChange={(e) => setRepresentative(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>공급가액 (원) *</label>
              <input
                type="number"
                required
                min={0}
                value={supplyAmount}
                onChange={(e) => setSupplyAmount(Number(e.target.value))}
                className={inputClass}
              />
              <p className="text-xs text-[var(--pb-silver)] mt-1">
                부가세 자동 계산: {formatPrice(Math.round(supplyAmount * 0.1))} / 합계:{" "}
                {formatPrice(supplyAmount + Math.round(supplyAmount * 0.1))}
              </p>
            </div>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>주소</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary text-sm py-2.5 px-6 disabled:opacity-50">
            {saving ? "등록 중..." : "등록"}
          </button>
        </form>
      )}

      {/* 필터 탭 */}
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[var(--pb-silver)]">로딩 중...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
          <p className="text-sm text-[var(--pb-gray)]">세금계산서 요청이 없습니다.</p>
        </div>
      ) : (
        <div className="border border-[var(--pb-light-gray)] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--pb-light-gray)] bg-[var(--pb-off-white)]">
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  회사명
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  사업자번호
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  공급가액
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  합계
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
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)]">
                  <td className="px-4 py-3 text-xs">
                    <div>
                      <p className="font-medium">{r.company_name}</p>
                      {r.order_id && (
                        <Link href={`/admin/orders/${r.order_id}`} className="text-[10px] text-[var(--pb-silver)] hover:underline">
                          {r.order_id}
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{r.business_number}</td>
                  <td className="px-4 py-3 text-xs text-right">{formatPrice(r.supply_amount)}</td>
                  <td className="px-4 py-3 text-xs text-right font-medium">{formatPrice(r.total_amount)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium", STATUS_COLORS[r.status])}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--pb-silver)]">
                    {new Date(r.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === "requested" ? (
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => {
                            const num = prompt("발행 번호 입력:");
                            if (num) handleIssue(r.id, num);
                          }}
                          className="text-xs px-2 py-1 border border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white hover:opacity-80"
                        >
                          발행 처리
                        </button>
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="text-xs px-2 py-1 border border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-jet-black)]"
                        >
                          취소
                        </button>
                      </div>
                    ) : r.status === "issued" ? (
                      <span className="text-xs text-[var(--pb-gray)]">#{r.invoice_number ?? "—"}</span>
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

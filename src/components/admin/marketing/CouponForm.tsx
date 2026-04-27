"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import type { CouponType, DbCoupon } from "@/types/database";

interface Props {
  mode: "create" | "edit";
  initial?: DbCoupon;
}

export function CouponForm({ mode, initial }: Props) {
  const router = useRouter();
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<CouponType>(initial?.type ?? "percent");
  const [value, setValue] = useState(initial?.value ?? 10);
  const [minOrder, setMinOrder] = useState(initial?.min_order_amount ?? 0);
  const [maxDiscount, setMaxDiscount] = useState<string>(
    initial?.max_discount_amount !== null && initial?.max_discount_amount !== undefined
      ? String(initial.max_discount_amount)
      : ""
  );
  const [usageLimit, setUsageLimit] = useState<string>(
    initial?.usage_limit !== null && initial?.usage_limit !== undefined
      ? String(initial.usage_limit)
      : ""
  );
  const [validFrom, setValidFrom] = useState(initial?.valid_from?.slice(0, 10) ?? "");
  const [validUntil, setValidUntil] = useState(initial?.valid_until?.slice(0, 10) ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...(mode === "create" ? { code, type } : {}),
      name,
      value,
      min_order_amount: minOrder,
      max_discount_amount: maxDiscount ? Number(maxDiscount) : null,
      usage_limit: usageLimit ? Number(usageLimit) : null,
      valid_from: validFrom ? new Date(validFrom).toISOString() : null,
      valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      is_active: isActive,
    };

    const url =
      mode === "create" ? "/api/admin/coupons" : `/api/admin/coupons/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/marketing/coupons");
      router.refresh();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "저장 실패");
    }
    setSaving(false);
  }

  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";
  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h3 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-2">기본 정보</h3>
        <div>
          <label className={labelClass}>쿠폰 코드 *</label>
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className={inputClass}
            placeholder="WELCOME10"
            disabled={mode === "edit"}
          />
        </div>
        <div>
          <label className={labelClass}>쿠폰 이름 *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="신규 가입 10% 할인" />
        </div>
      </div>

      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h3 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-2">할인</h3>
        <div>
          <label className={labelClass}>할인 유형 *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CouponType)}
            className={inputClass}
            disabled={mode === "edit"}
          >
            <option value="percent">정률 (%)</option>
            <option value="amount">정액 (원)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>할인값 * {type === "percent" ? "(%)" : "(원)"}</label>
          <input type="number" required min={1} value={value} onChange={(e) => setValue(Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>최소 주문 금액 (원)</label>
          <input type="number" min={0} value={minOrder} onChange={(e) => setMinOrder(Number(e.target.value))} className={inputClass} />
        </div>
        {type === "percent" && (
          <div>
            <label className={labelClass}>최대 할인 금액 (원, 선택)</label>
            <input
              type="number"
              min={0}
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              className={inputClass}
              placeholder="비워두면 무제한"
            />
          </div>
        )}
      </div>

      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h3 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-2">사용 제한</h3>
        <div>
          <label className={labelClass}>총 사용 한도 (선택)</label>
          <input
            type="number"
            min={1}
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            className={inputClass}
            placeholder="비워두면 무제한"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>시작일</label>
            <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>종료일</label>
            <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span className="text-sm">활성</span>
          </label>
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50">
        <Save size={14} />
        {saving ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}

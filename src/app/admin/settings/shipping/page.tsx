"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { SettingsNav } from "@/components/admin/settings/SettingsNav";
import type { DbShippingSettings } from "@/types/database";

interface ReturnAddress {
  recipient?: string;
  zipcode?: string;
  address1?: string;
  address2?: string;
  phone?: string;
}

export default function AdminShippingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaultFee, setDefaultFee] = useState(3000);
  const [freeThreshold, setFreeThreshold] = useState(50000);
  const [courier, setCourier] = useState("CJ대한통운");
  const [estimatedDays, setEstimatedDays] = useState("2-3일");
  const [notes, setNotes] = useState("");
  const [returnAddress, setReturnAddress] = useState<ReturnAddress>({});

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/shipping-settings");
      if (res.ok) {
        const data = (await res.json()) as DbShippingSettings;
        setDefaultFee(data.default_fee);
        setFreeThreshold(data.free_threshold);
        setCourier(data.courier);
        setEstimatedDays(data.estimated_days);
        setNotes(data.notes ?? "");
        setReturnAddress((data.return_address as ReturnAddress) ?? {});
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/shipping-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        default_fee: defaultFee,
        free_threshold: freeThreshold,
        courier,
        estimated_days: estimatedDays,
        notes: notes || null,
        return_address: returnAddress,
      }),
    });
    if (res.ok) {
      alert("저장되었습니다.");
    } else {
      alert("저장 실패");
    }
    setSaving(false);
  }

  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";
  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";

  if (loading) {
    return (
      <div>
        <SettingsNav />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[var(--pb-silver)]">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SettingsNav />

      <div className="mb-6">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-1">배송 설정</h2>
        <p className="text-xs text-[var(--pb-gray)]">기본 배송비, 무료배송 조건, 반품 주소를 설정합니다.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
          <h3 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-2">요금</h3>
          <div>
            <label className={labelClass}>기본 배송비 (원)</label>
            <input
              type="number"
              value={defaultFee}
              onChange={(e) => setDefaultFee(Number(e.target.value))}
              className={inputClass}
              min={0}
            />
          </div>
          <div>
            <label className={labelClass}>무료배송 기준 금액 (원)</label>
            <input
              type="number"
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(Number(e.target.value))}
              className={inputClass}
              min={0}
            />
            <p className="text-xs text-[var(--pb-silver)] mt-1">
              주문 금액이 이 값 이상이면 배송비 무료
            </p>
          </div>
          <div>
            <label className={labelClass}>배송 예상 소요일</label>
            <input
              type="text"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
              className={inputClass}
              placeholder="예: 2-3일"
            />
          </div>
        </div>

        <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
          <h3 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-2">택배사</h3>
          <div>
            <label className={labelClass}>기본 택배사</label>
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className={inputClass}
            >
              <option value="CJ대한통운">CJ대한통운</option>
              <option value="롯데택배">롯데택배</option>
              <option value="한진택배">한진택배</option>
              <option value="우체국택배">우체국택배</option>
              <option value="로젠택배">로젠택배</option>
            </select>
          </div>
        </div>

        <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
          <h3 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-2">반품 주소</h3>
          <div>
            <label className={labelClass}>수취인</label>
            <input
              type="text"
              value={returnAddress.recipient ?? ""}
              onChange={(e) => setReturnAddress({ ...returnAddress, recipient: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>우편번호</label>
            <input
              type="text"
              value={returnAddress.zipcode ?? ""}
              onChange={(e) => setReturnAddress({ ...returnAddress, zipcode: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>주소</label>
            <input
              type="text"
              value={returnAddress.address1 ?? ""}
              onChange={(e) => setReturnAddress({ ...returnAddress, address1: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>상세 주소</label>
            <input
              type="text"
              value={returnAddress.address2 ?? ""}
              onChange={(e) => setReturnAddress({ ...returnAddress, address2: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>연락처</label>
            <input
              type="text"
              value={returnAddress.phone ?? ""}
              onChange={(e) => setReturnAddress({ ...returnAddress, phone: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
          <h3 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-2">안내 문구</h3>
          <div>
            <label className={labelClass}>배송 관련 고객 안내 (선택)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${inputClass} min-h-[100px]`}
              placeholder="예: 제주/도서산간 지역은 추가 배송비가 발생할 수 있습니다."
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}

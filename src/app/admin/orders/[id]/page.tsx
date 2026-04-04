"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const STATUSES = ["pending", "paid", "preparing", "shipped", "delivered", "cancelled", "refunded"];
const STATUS_LABELS: Record<string, string> = {
  pending: "대기", paid: "결제완료", preparing: "준비중",
  shipped: "배송중", delivered: "배송완료", cancelled: "취소", refunded: "환불",
};

interface OrderDetail {
  id: string;
  status: string;
  total_amount: number;
  shipping_fee: number;
  order_name: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  tracking_number: string | null;
  shipping_address: Record<string, unknown> | null;
  payment_method: string | null;
  created_at: string;
  items: { product_name: string; quantity: number; price: number; options: Record<string, unknown> | null }[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetch_() {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setStatus(data.status);
        setTrackingNumber(data.tracking_number ?? "");
      }
      setLoading(false);
    }
    fetch_();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, tracking_number: trackingNumber || null }),
    });
    alert("저장되었습니다.");
    setSaving(false);
  }

  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";
  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;
  if (!order) return <div className="text-center py-20"><p className="text-sm text-[var(--pb-gray)]">주문을 찾을 수 없습니다.</p></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/orders" className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1">
        <ArrowLeft size={12} /> 주문 목록
      </Link>

      {/* Order info */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-3">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-4">주문 정보</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-[var(--pb-gray)]">주문번호:</span> {order.id}</div>
          <div><span className="text-[var(--pb-gray)]">주문일:</span> {new Date(order.created_at).toLocaleString("ko-KR")}</div>
          <div><span className="text-[var(--pb-gray)]">고객:</span> {order.customer_name ?? "비회원"}</div>
          <div><span className="text-[var(--pb-gray)]">연락처:</span> {order.customer_phone ?? "—"}</div>
          <div><span className="text-[var(--pb-gray)]">이메일:</span> {order.customer_email ?? "—"}</div>
          <div><span className="text-[var(--pb-gray)]">결제:</span> {order.payment_method ?? "—"}</div>
        </div>
      </div>

      {/* Items */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-4">주문 상품</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--pb-light-gray)] last:border-b-0">
              <div>
                <p className="text-sm font-medium">{item.product_name}</p>
                {item.options && Object.keys(item.options).length > 0 && (
                  <p className="text-xs text-[var(--pb-silver)]">
                    {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(", ")}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm">{formatPrice(item.price)} × {item.quantity}</p>
                <p className="text-xs font-medium">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-[var(--pb-light-gray)] flex justify-between text-sm font-medium">
          <span>합계</span>
          <span>{formatPrice(order.total_amount)}</span>
        </div>
      </div>

      {/* Status + tracking */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-2">상태 변경</h2>
        <div>
          <label className={labelClass}>주문 상태</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>배송 추적번호</label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className={inputClass}
            placeholder="배송 추적번호 입력"
          />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50">
          <Save size={14} />
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}

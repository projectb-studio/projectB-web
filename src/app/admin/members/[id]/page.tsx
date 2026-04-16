"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";

interface MemberDetail {
  user: {
    user_id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    grade: "normal" | "vip";
    is_blocked: boolean;
    admin_memo: string | null;
    created_at: string;
  };
  orders: {
    id: string;
    status: string;
    total_amount: number;
    order_name: string | null;
    created_at: string;
  }[];
  reviewCount: number;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  paid: "결제완료",
  preparing: "준비중",
  shipped: "배송중",
  delivered: "배송완료",
  cancelled: "취소",
  refunded: "환불",
};

const PAID_STATUSES = new Set(["paid", "preparing", "shipped", "delivered"]);

export default function AdminMemberDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [memo, setMemo] = useState("");
  const [grade, setGrade] = useState<"normal" | "vip">("normal");
  const [blocked, setBlocked] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/members/${params.id}`);
    if (res.ok) {
      const d: MemberDetail = await res.json();
      setData(d);
      setMemo(d.user.admin_memo ?? "");
      setGrade(d.user.grade);
      setBlocked(d.user.is_blocked);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const save = useCallback(
    async (patch: Partial<{ admin_memo: string; grade: "normal" | "vip"; is_blocked: boolean }>) => {
      setStatus("saving");
      const res = await fetch(`/api/admin/members/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 1500);
      } else {
        setStatus("error");
      }
    },
    [params.id]
  );

  // memo debounce
  useEffect(() => {
    if (!data) return;
    if (memo === (data.user.admin_memo ?? "")) return;
    const t = setTimeout(() => save({ admin_memo: memo }), 300);
    return () => clearTimeout(t);
  }, [memo, data, save]);

  if (loading || !data) return <p className="text-sm text-[var(--pb-gray)]">불러오는 중...</p>;

  const { user, orders, reviewCount } = data;
  const paidOrders = orders.filter((o) => PAID_STATUSES.has(o.status));
  const totalSpent = paidOrders.reduce((s, o) => s + o.total_amount, 0);
  const aov = paidOrders.length ? Math.round(totalSpent / paidOrders.length) : 0;

  return (
    <section className="space-y-6">
      <Link href="/admin/members" className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1">
        <ArrowLeft className="w-3 h-3" /> 회원 목록
      </Link>

      <div className="border border-[var(--pb-light-gray)] p-5 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Info label="이름" value={user.full_name ?? "-"} />
          <Info label="이메일" value={user.email ?? "-"} />
          <Info label="전화" value={user.phone ?? "-"} />
          <Info label="가입일" value={user.created_at.slice(0, 10)} />
        </div>
        <div className="flex flex-wrap gap-4 items-center pt-3 border-t border-[var(--pb-off-white)]">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-xs text-[var(--pb-gray)]">등급</span>
            <select
              value={grade}
              onChange={(e) => {
                const v = e.target.value as "normal" | "vip";
                setGrade(v);
                save({ grade: v });
              }}
              className="border border-[var(--pb-light-gray)] px-2 py-1 text-sm"
            >
              <option value="normal">일반</option>
              <option value="vip">VIP</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={blocked}
              onChange={(e) => {
                setBlocked(e.target.checked);
                save({ is_blocked: e.target.checked });
              }}
            />
            <span>로그인 차단</span>
          </label>
          <span className="text-xs text-[var(--pb-gray)]">
            {status === "saving" && "저장 중..."}
            {status === "saved" && "저장됨"}
            {status === "error" && "저장 실패"}
          </span>
        </div>
        <div className="pt-3 border-t border-[var(--pb-off-white)]">
          <label className="block text-xs text-[var(--pb-gray)] mb-1.5">
            관리 메모 <span className="normal-case">({memo.length}/5000)</span>
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value.slice(0, 5000))}
            rows={4}
            placeholder="내부용 메모 (예: VIP 단골, 상담 이력 등)"
            className="w-full border border-[var(--pb-light-gray)] px-3 py-2 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="총 주문" value={orders.length} />
        <StatCard label="총 구매금액" value={`₩${totalSpent.toLocaleString()}`} />
        <StatCard label="평균 객단가" value={paidOrders.length ? `₩${aov.toLocaleString()}` : "-"} />
        <StatCard label="리뷰 작성" value={reviewCount} />
      </div>

      <div>
        <h2 className="heading-display text-sm tracking-wide mb-3">최근 주문 (최대 20건)</h2>
        <div className="border border-[var(--pb-light-gray)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--pb-off-white)] text-xs tracking-wider">
              <tr>
                <th className="px-4 py-2 text-left">주문</th>
                <th className="px-4 py-2 text-left">일시</th>
                <th className="px-4 py-2 text-right">금액</th>
                <th className="px-4 py-2 text-left">상태</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--pb-gray)]">주문 내역이 없습니다.</td></tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-[var(--pb-light-gray)]">
                  <td className="px-4 py-2">{o.order_name ?? o.id.slice(0, 8)}</td>
                  <td className="px-4 py-2 text-[var(--pb-gray)]">{o.created_at.slice(0, 16).replace("T", " ")}</td>
                  <td className="px-4 py-2 text-right tabular-nums">₩{o.total_amount.toLocaleString()}</td>
                  <td className="px-4 py-2">{STATUS_LABELS[o.status] ?? o.status}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="text-xs underline">상세</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-[var(--pb-gray)] mb-0.5">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-[var(--pb-light-gray)] p-4">
      <div className="text-xs text-[var(--pb-gray)]">{label}</div>
      <div className="text-xl mt-1 tabular-nums">{value}</div>
    </div>
  );
}

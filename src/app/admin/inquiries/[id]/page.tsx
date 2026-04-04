"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface InquiryDetail {
  id: string;
  type: string;
  title: string;
  content: string;
  author_name: string | null;
  author_email: string | null;
  author_phone: string | null;
  company_name: string | null;
  status: string;
  answer: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  received: "접수",
  waiting: "대기",
  in_progress: "처리중",
  answered: "답변완료",
  closed: "종료",
};

const TYPE_LABELS: Record<string, string> = {
  product: "상품문의",
  order: "주문문의",
  shipping: "배송문의",
  wholesale: "도매문의",
  etc: "기타",
};

const STATUSES = ["received", "in_progress", "answered", "closed"];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminInquiryDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchInquiry() {
      const res = await fetch(`/api/admin/inquiries/${id}`);
      if (res.ok) {
        const data = await res.json();
        setInquiry(data);
        setStatus(data.status);
        setAnswer(data.answer ?? "");
      }
      setLoading(false);
    }
    fetchInquiry();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/inquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, answer: answer || null }),
    });
    alert("저장되었습니다.");
    setSaving(false);
  }

  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";
  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;
  if (!inquiry) return <div className="text-center py-20"><p className="text-sm text-[var(--pb-gray)]">문의를 찾을 수 없습니다.</p></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/inquiries" className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1">
        <ArrowLeft size={12} /> 문의 목록
      </Link>

      {/* Inquiry info */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">문의 정보</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-[var(--pb-gray)]">유형:</span> {TYPE_LABELS[inquiry.type] ?? inquiry.type}</div>
          <div><span className="text-[var(--pb-gray)]">작성일:</span> {new Date(inquiry.created_at).toLocaleString("ko-KR")}</div>
          <div><span className="text-[var(--pb-gray)]">작성자:</span> {inquiry.author_name ?? "비회원"}</div>
          <div><span className="text-[var(--pb-gray)]">이메일:</span> {inquiry.author_email ?? "—"}</div>
          <div><span className="text-[var(--pb-gray)]">연락처:</span> {inquiry.author_phone ?? "—"}</div>
          {inquiry.company_name && (
            <div><span className="text-[var(--pb-gray)]">업체명:</span> {inquiry.company_name}</div>
          )}
        </div>

        {/* Inquiry content */}
        <div className="pt-3 border-t border-[var(--pb-light-gray)]">
          <h3 className="text-sm font-medium mb-2">{inquiry.title}</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{inquiry.content}</p>
        </div>
      </div>

      {/* Status + answer */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">답변 및 상태</h2>
        <div>
          <label className={labelClass}>상태</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>답변 내용</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className={cn(inputClass, "h-40 resize-y")}
            placeholder="문의에 대한 답변을 작성하세요"
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

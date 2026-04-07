"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Inquiry {
  id: string;
  type: string;
  title: string;
  author_name: string | null;
  status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  received: "접수",
  in_progress: "처리중",
  answered: "답변완료",
  closed: "종료",
};

const STATUS_COLORS: Record<string, string> = {
  received: "text-[var(--pb-silver)]",
  in_progress: "text-blue-600",
  answered: "text-[#2D8F4E]",
  closed: "text-[var(--pb-gray)]",
};

const TYPE_LABELS: Record<string, string> = {
  product: "상품문의",
  order: "주문문의",
  shipping: "배송문의",
  wholesale: "도매문의",
  etc: "기타",
};

type FilterType = "all" | "received" | "in_progress" | "answered" | "closed";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/inquiries");
    if (res.ok) setInquiries(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const filtered = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "all", label: `전체 (${inquiries.length})` },
    { key: "received", label: `접수 (${inquiries.filter((i) => i.status === "received").length})` },
    { key: "in_progress", label: `처리중 (${inquiries.filter((i) => i.status === "in_progress").length})` },
    { key: "answered", label: `답변완료 (${inquiries.filter((i) => i.status === "answered").length})` },
    { key: "closed", label: `종료 (${inquiries.filter((i) => i.status === "closed").length})` },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {filterTabs.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3 py-1.5 text-xs border transition-colors whitespace-nowrap",
              filter === f.key
                ? "border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white"
                : "border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
          <p className="text-sm text-[var(--pb-gray)]">문의가 없습니다.</p>
        </div>
      ) : (
        <div className="border border-[var(--pb-light-gray)] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--pb-light-gray)] bg-[var(--pb-off-white)]">
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">유형</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">제목</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">작성자</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">상태</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">날짜</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inquiry) => (
                <tr key={inquiry.id} className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)] transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 border border-[var(--pb-light-gray)]">
                      {TYPE_LABELS[inquiry.type] ?? inquiry.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/inquiries/${inquiry.id}`} className="hover:underline text-xs font-medium">
                      {inquiry.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs">{inquiry.author_name ?? "비회원"}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium", STATUS_COLORS[inquiry.status] ?? "")}>
                      {STATUS_LABELS[inquiry.status] ?? inquiry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--pb-silver)]">
                    {new Date(inquiry.created_at).toLocaleDateString("ko-KR")}
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

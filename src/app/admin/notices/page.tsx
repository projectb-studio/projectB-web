"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Pin, Plus } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  is_pinned: boolean;
  is_published: boolean;
  created_at: string;
}

type FilterType = "all" | "published" | "draft";

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/notices");
    if (res.ok) setNotices(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const filtered = filter === "all"
    ? notices
    : filter === "published"
      ? notices.filter((n) => n.is_published)
      : notices.filter((n) => !n.is_published);

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "all", label: `전체 (${notices.length})` },
    { key: "published", label: `공개 (${notices.filter((n) => n.is_published).length})` },
    { key: "draft", label: `비공개 (${notices.filter((n) => !n.is_published).length})` },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;
  }

  return (
    <div>
      {/* Header with create button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 overflow-x-auto">
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
        <Link
          href="/admin/notices/new"
          className="btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5"
        >
          <Plus size={14} />
          새 공지
        </Link>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
          <p className="text-sm text-[var(--pb-gray)]">공지사항이 없습니다.</p>
        </div>
      ) : (
        <div className="border border-[var(--pb-light-gray)] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--pb-light-gray)] bg-[var(--pb-off-white)]">
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold w-8"></th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">제목</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">상태</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">날짜</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((notice) => (
                <tr key={notice.id} className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)] transition-colors">
                  <td className="px-4 py-3 text-center">
                    {notice.is_pinned && <Pin size={12} className="text-[var(--pb-jet-black)]" />}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/notices/${notice.id}`} className="hover:underline text-xs font-medium">
                      {notice.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium", notice.is_published ? "text-[#2D8F4E]" : "text-[var(--pb-silver)]")}>
                      {notice.is_published ? "공개" : "비공개"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--pb-silver)]">
                    {new Date(notice.created_at).toLocaleDateString("ko-KR")}
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

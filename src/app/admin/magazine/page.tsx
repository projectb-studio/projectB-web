"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Plus, Settings } from "lucide-react";

interface MagazinePost {
  id: string;
  title: string;
  image_url: string | null;
  category_name: string | null;
  is_published: boolean;
  created_at: string;
}

type FilterType = "all" | "published" | "draft";

export default function AdminMagazinePage() {
  const [posts, setPosts] = useState<MagazinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/magazine");
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const filtered = filter === "all"
    ? posts
    : filter === "published"
      ? posts.filter((p) => p.is_published)
      : posts.filter((p) => !p.is_published);

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "all", label: `전체 (${posts.length})` },
    { key: "published", label: `공개 (${posts.filter((p) => p.is_published).length})` },
    { key: "draft", label: `비공개 (${posts.filter((p) => !p.is_published).length})` },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;
  }

  return (
    <div>
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
        <div className="flex gap-2">
          <Link
            href="/admin/magazine/categories"
            className="px-4 py-1.5 text-xs flex items-center gap-1.5 border border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)] transition-colors"
          >
            <Settings size={14} />
            카테고리
          </Link>
          <Link
            href="/admin/magazine/new"
            className="btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Plus size={14} />
            새 글
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
          <p className="text-sm text-[var(--pb-gray)]">매거진 글이 없습니다.</p>
        </div>
      ) : (
        <div className="border border-[var(--pb-light-gray)] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--pb-light-gray)] bg-[var(--pb-off-white)]">
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold w-16"></th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">제목</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">카테고리</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">상태</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">날짜</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id} className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)] transition-colors">
                  <td className="px-4 py-3">
                    {post.image_url && (
                      <div className="relative w-12 h-8 bg-[var(--pb-off-white)]">
                        <Image src={post.image_url} alt="" fill className="object-cover" sizes="48px" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/magazine/${post.id}`} className="hover:underline text-xs font-medium">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--pb-gray)]">
                    {post.category_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium", post.is_published ? "text-[#2D8F4E]" : "text-[var(--pb-silver)]")}>
                      {post.is_published ? "공개" : "비공개"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--pb-silver)]">
                    {new Date(post.created_at).toLocaleDateString("ko-KR")}
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

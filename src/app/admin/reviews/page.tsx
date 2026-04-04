"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Star, ImageIcon } from "lucide-react";

interface Review {
  id: string;
  product_id: string;
  product_name: string;
  author_name: string;
  rating: number;
  content: string | null;
  image_urls: string[] | null;
  is_hidden: boolean;
  admin_reply: string | null;
  created_at: string;
}

type FilterType = "all" | "unreplied" | "replied";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    if (res.ok) setReviews(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const filtered = filter === "all"
    ? reviews
    : filter === "unreplied"
      ? reviews.filter((r) => !r.admin_reply)
      : reviews.filter((r) => !!r.admin_reply);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: `전체 (${reviews.length})` },
    { key: "unreplied", label: `미답변 (${reviews.filter((r) => !r.admin_reply).length})` },
    { key: "replied", label: `답변완료 (${reviews.filter((r) => !!r.admin_reply).length})` },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {filters.map((f) => (
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
          <p className="text-sm text-[var(--pb-gray)]">리뷰가 없습니다.</p>
        </div>
      ) : (
        <div className="border border-[var(--pb-light-gray)] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--pb-light-gray)] bg-[var(--pb-off-white)]">
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">상품</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">작성자</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">별점</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">내용</th>
                <th className="text-center px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">이미지</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">답변</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">날짜</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review.id} className={cn(
                  "border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)] transition-colors",
                  review.is_hidden && "opacity-50"
                )}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/reviews/${review.id}`} className="hover:underline text-xs font-medium">
                      {review.product_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs">{review.author_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? "fill-[var(--pb-jet-black)] text-[var(--pb-jet-black)]" : "text-[var(--pb-light-gray)]"} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs max-w-[200px] truncate">{review.content ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    {review.image_urls && review.image_urls.length > 0 && (
                      <ImageIcon size={14} className="inline text-[var(--pb-gray)]" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium", review.admin_reply ? "text-[#2D8F4E]" : "text-[var(--pb-silver)]")}>
                      {review.admin_reply ? "답변완료" : "미답변"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--pb-silver)]">
                    {new Date(review.created_at).toLocaleDateString("ko-KR")}
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

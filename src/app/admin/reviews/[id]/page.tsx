"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Star, Eye, EyeOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ReviewDetail {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string | null;
  author_name: string;
  rating: number;
  content: string | null;
  image_urls: string[] | null;
  is_hidden: boolean;
  admin_reply: string | null;
  created_at: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminReviewDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminReply, setAdminReply] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchReview() {
      const res = await fetch(`/api/admin/reviews/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReview(data);
        setAdminReply(data.admin_reply ?? "");
        setIsHidden(data.is_hidden ?? false);
      }
      setLoading(false);
    }
    fetchReview();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_reply: adminReply || null, is_hidden: isHidden }),
    });
    alert("저장되었습니다.");
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("정말 이 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    router.push("/admin/reviews");
  }

  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";
  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;
  if (!review) return <div className="text-center py-20"><p className="text-sm text-[var(--pb-gray)]">리뷰를 찾을 수 없습니다.</p></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/reviews" className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1">
        <ArrowLeft size={12} /> 리뷰 목록
      </Link>

      {/* Review info */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">리뷰 정보</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-[var(--pb-gray)]">상품: </span>
            {review.product_slug ? (
              <Link href={`/product/${review.product_slug}`} className="hover:underline">{review.product_name}</Link>
            ) : (
              <span>{review.product_name}</span>
            )}
          </div>
          <div><span className="text-[var(--pb-gray)]">작성자:</span> {review.author_name}</div>
          <div><span className="text-[var(--pb-gray)]">작성일:</span> {new Date(review.created_at).toLocaleString("ko-KR")}</div>
          <div className="flex items-center gap-1">
            <span className="text-[var(--pb-gray)]">별점:</span>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className={i < review.rating ? "fill-[var(--pb-jet-black)] text-[var(--pb-jet-black)]" : "text-[var(--pb-light-gray)]"} />
            ))}
          </div>
        </div>

        {/* Review content */}
        {review.content && (
          <div className="pt-3 border-t border-[var(--pb-light-gray)]">
            <p className="text-sm leading-relaxed">{review.content}</p>
          </div>
        )}

        {/* Review images */}
        {review.image_urls && review.image_urls.length > 0 && (
          <div className="pt-3 border-t border-[var(--pb-light-gray)]">
            <div className="flex gap-2 flex-wrap">
              {review.image_urls.map((url, i) => (
                <div key={i} className="relative w-24 h-24 border border-[var(--pb-light-gray)]">
                  <Image src={url} alt={`리뷰 이미지 ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin reply + actions */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">관리자 답변</h2>
        <div>
          <label className={labelClass}>답변 내용</label>
          <textarea
            value={adminReply}
            onChange={(e) => setAdminReply(e.target.value)}
            className={cn(inputClass, "h-32 resize-y")}
            placeholder="리뷰에 대한 답변을 작성하세요"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHidden(!isHidden)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors",
              isHidden
                ? "border-[var(--accent-sale)] text-[var(--accent-sale)]"
                : "border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)]"
            )}
          >
            {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
            {isHidden ? "숨김 상태" : "공개 상태"}
          </button>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50">
            <Save size={14} />
            {saving ? "저장 중..." : "저장"}
          </button>
          <button onClick={handleDelete} className="px-6 py-2.5 text-sm flex items-center gap-2 border border-[var(--accent-sale)] text-[var(--accent-sale)] hover:bg-[var(--accent-sale)] hover:text-white transition-colors">
            <Trash2 size={14} />
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

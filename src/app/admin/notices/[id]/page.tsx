"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/components/admin/ui/TiptapEditor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminNoticeEditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchNotice() {
      const res = await fetch(`/api/admin/notices/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);
        setIsPinned(data.is_pinned);
        setIsPublished(data.is_published);
      }
      setLoading(false);
    }
    fetchNotice();
  }, [id]);

  async function handleSave() {
    if (!title.trim()) { alert("제목을 입력하세요."); return; }
    setSaving(true);
    await fetch(`/api/admin/notices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        is_pinned: isPinned,
        is_published: isPublished,
      }),
    });
    alert("저장되었습니다.");
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("정말 이 공지사항을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
    router.push("/admin/notices");
  }

  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";
  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/notices" className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1">
        <ArrowLeft size={12} /> 공지 목록
      </Link>

      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">공지 수정</h2>

        <div>
          <label className={labelClass}>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="공지사항 제목"
          />
        </div>

        <div>
          <label className={labelClass}>내용</label>
          <TiptapEditor content={content} onChange={setContent} placeholder="공지사항 내용을 작성하세요" />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="accent-[var(--pb-jet-black)]"
            />
            상단 고정
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-[var(--pb-jet-black)]"
            />
            공개
          </label>
        </div>

        <div className="flex items-center gap-3">
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

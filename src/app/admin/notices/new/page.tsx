"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/components/admin/ui/TiptapEditor";

export default function AdminNoticeNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) { alert("제목을 입력하세요."); return; }
    setSaving(true);

    const res = await fetch("/api/admin/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        is_pinned: isPinned,
        is_published: isPublished,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/notices/${data.id}`);
    } else {
      alert("저장에 실패했습니다.");
      setSaving(false);
    }
  }

  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";
  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/notices" className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1">
        <ArrowLeft size={12} /> 공지 목록
      </Link>

      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">새 공지 작성</h2>

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
            즉시 공개
          </label>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50">
          <Save size={14} />
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}

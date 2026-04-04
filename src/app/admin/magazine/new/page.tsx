"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/components/admin/ui/TiptapEditor";
import { slugify } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

export default function AdminMagazineNewPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    fetch("/api/admin/magazine/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (autoSlug) setSlug(slugify(value));
  }

  function handleSlugChange(value: string) {
    setAutoSlug(false);
    setSlug(value);
  }

  async function handleSave() {
    if (!title.trim()) { alert("제목을 입력하세요."); return; }
    if (!slug.trim()) { alert("슬러그를 입력하세요."); return; }
    setSaving(true);

    const res = await fetch("/api/admin/magazine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        excerpt: excerpt || null,
        content: content || null,
        image_url: imageUrl || null,
        category_id: categoryId || null,
        is_published: isPublished,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/magazine/${data.id}`);
    } else {
      const err = await res.json();
      alert(err.error || "저장에 실패했습니다.");
      setSaving(false);
    }
  }

  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";
  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/magazine" className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1">
        <ArrowLeft size={12} /> 매거진 목록
      </Link>

      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">새 매거진 글</h2>

        <div>
          <label className={labelClass}>제목</label>
          <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} className={inputClass} placeholder="글 제목" />
        </div>

        <div>
          <label className={labelClass}>슬러그 (URL)</label>
          <input type="text" value={slug} onChange={(e) => handleSlugChange(e.target.value)} className={inputClass} placeholder="url-slug" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>카테고리</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              <option value="">선택 안함</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>대표 이미지 URL</label>
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={inputClass} placeholder="https://..." />
          </div>
        </div>

        <div>
          <label className={labelClass}>요약 (목록 미리보기)</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={`${inputClass} h-20 resize-y`} placeholder="글 요약을 입력하세요" />
        </div>

        <div>
          <label className={labelClass}>본문</label>
          <TiptapEditor content={content} onChange={setContent} />
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="accent-[var(--pb-jet-black)]" />
          즉시 공개
        </label>

        <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50">
          <Save size={14} />
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/components/admin/ui/TiptapEditor";

interface Category {
  id: string;
  name: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminMagazineEditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [postRes, catRes] = await Promise.all([
        fetch(`/api/admin/magazine/${id}`),
        fetch("/api/admin/magazine/categories"),
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (postRes.ok) {
        const data = await postRes.json();
        setTitle(data.title);
        setSlug(data.slug);
        setExcerpt(data.excerpt ?? "");
        setContent(data.content ?? "");
        setImageUrl(data.image_url ?? "");
        setCategoryId(data.category_id ?? "");
        setIsPublished(data.is_published);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  async function handleSave() {
    if (!title.trim()) { alert("제목을 입력하세요."); return; }
    setSaving(true);
    await fetch(`/api/admin/magazine/${id}`, {
      method: "PUT",
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
    alert("저장되었습니다.");
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("정말 이 글을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/magazine/${id}`, { method: "DELETE" });
    router.push("/admin/magazine");
  }

  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";
  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/magazine" className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1">
        <ArrowLeft size={12} /> 매거진 목록
      </Link>

      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">매거진 수정</h2>

        <div>
          <label className={labelClass}>제목</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="글 제목" />
        </div>

        <div>
          <label className={labelClass}>슬러그 (URL)</label>
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} placeholder="url-slug" />
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
          공개
        </label>

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

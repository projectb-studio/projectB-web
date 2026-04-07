"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Upload, X } from "lucide-react";

interface BrandSection {
  section_key: string;
  title: string;
  content: string;
  image_url: string;
  sort_order: number;
}

const SECTION_LABELS: Record<string, string> = {
  hero: "히어로 (브랜드 페이지 상단)",
  story: "브랜드 스토리",
  material_1: "소재 소개 1",
  material_2: "소재 소개 2",
  material_3: "소재 소개 3",
};

export default function AdminBrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<BrandSection[]>([]);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/content/brand");
    if (res.ok) setSections(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function updateSection(key: string, field: keyof BrandSection, value: string) {
    setSections((prev) =>
      prev.map((s) => (s.section_key === key ? { ...s, [field]: value } : s))
    );
  }

  async function handleImageUpload(sectionKey: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json() as { url: string };
        updateSection(sectionKey, "image_url", url);
      }
    };
    input.click();
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/content/brand", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sections),
    });
    if (res.ok) {
      alert("저장되었습니다.");
      router.refresh();
    } else {
      alert("저장 실패");
    }
    setSaving(false);
  }

  const inputClass =
    "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";
  const labelClass =
    "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[var(--pb-silver)]">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      {sections.map((section) => (
        <div
          key={section.section_key}
          className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4"
        >
          <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">
            {SECTION_LABELS[section.section_key] ?? section.section_key}
          </h2>

          <div>
            <label className={labelClass}>제목</label>
            <input
              type="text"
              value={section.title ?? ""}
              onChange={(e) => updateSection(section.section_key, "title", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>내용</label>
            <textarea
              value={section.content ?? ""}
              onChange={(e) => updateSection(section.section_key, "content", e.target.value)}
              rows={4}
              className={inputClass + " resize-none"}
            />
          </div>

          <div>
            <label className={labelClass}>이미지</label>
            {section.image_url ? (
              <div className="relative w-48 aspect-video bg-[var(--pb-off-white)] mb-2">
                <Image
                  src={section.image_url}
                  alt={section.title ?? ""}
                  fill
                  className="object-cover"
                  sizes="192px"
                />
                <button
                  type="button"
                  onClick={() => updateSection(section.section_key, "image_url", "")}
                  className="absolute top-1 right-1 p-1 bg-black/60 text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => handleImageUpload(section.section_key)}
              className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1"
            >
              <Upload size={12} />
              {section.image_url ? "이미지 변경" : "이미지 업로드"}
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary px-8 py-3 text-sm flex items-center gap-2 disabled:opacity-50"
      >
        <Save size={14} />
        {saving ? "저장 중..." : "저장"}
      </button>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Plus, X } from "lucide-react";

interface HeroSettings {
  heading: string;
  subheading: string;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
}

interface HeroSlide {
  type: "image" | "video";
  media_url: string;
  alt: string;
  is_active: boolean;
}

export default function AdminHeroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<HeroSettings>({
    heading: "PROJECT B",
    subheading: "",
    cta_primary_text: "SHOP ONLINE",
    cta_primary_link: "/category",
    cta_secondary_text: "VISIT STORE",
    cta_secondary_link: "/store-location",
  });
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/content/hero");
    if (res.ok) {
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
      if (data.slides) setSlides(data.slides);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleUploadSlide() {
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
        const { url } = await res.json();
        setSlides((prev) => [...prev, { type: "image", media_url: url, alt: "", is_active: true }]);
      }
    };
    input.click();
  }

  function removeSlide(index: number) {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/content/hero", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings, slides }),
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
      {/* Text settings */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-2">
          텍스트 설정
        </h2>
        <div>
          <label className={labelClass}>메인 타이틀</label>
          <input
            type="text"
            value={settings.heading}
            onChange={(e) => setSettings({ ...settings, heading: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>서브 타이틀</label>
          <input
            type="text"
            value={settings.subheading}
            onChange={(e) => setSettings({ ...settings, subheading: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>CTA 1 텍스트</label>
            <input
              type="text"
              value={settings.cta_primary_text}
              onChange={(e) => setSettings({ ...settings, cta_primary_text: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>CTA 1 링크</label>
            <input
              type="text"
              value={settings.cta_primary_link}
              onChange={(e) => setSettings({ ...settings, cta_primary_link: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>CTA 2 텍스트</label>
            <input
              type="text"
              value={settings.cta_secondary_text}
              onChange={(e) => setSettings({ ...settings, cta_secondary_text: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>CTA 2 링크</label>
            <input
              type="text"
              value={settings.cta_secondary_link}
              onChange={(e) => setSettings({ ...settings, cta_secondary_link: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Slides */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">
            슬라이드 이미지
          </h2>
          <button
            type="button"
            onClick={handleUploadSlide}
            className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1"
          >
            <Plus size={12} /> 이미지 추가
          </button>
        </div>
        {slides.length === 0 && (
          <p className="text-xs text-[var(--pb-silver)]">슬라이드 이미지가 없습니다.</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {slides.map((slide, index) => (
            <div key={index} className="relative group aspect-video bg-[var(--pb-off-white)]">
              <Image
                src={slide.media_url}
                alt={slide.alt}
                fill
                className="object-cover"
                sizes="300px"
              />
              <button
                type="button"
                onClick={() => removeSlide(index)}
                className="absolute top-1 right-1 p-1 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-1 left-1 p-1 bg-black/40 text-white text-[10px]">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
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

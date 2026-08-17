"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/admin/ui/ImageUploader";
import { Plus, Minus } from "lucide-react";

const TAGS = ["handmade", "fabric", "metal", "wood", "stone", "glass"];
const BADGES = [null, "NEW", "BEST", "SALE", "HANDMADE"];

interface ImageItem {
  url: string;
  sort_order: number;
}

interface OptionItem {
  type: "color" | "size";
  name: string;
  value: string;
  sort_order: number;
}

interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  tag: string;
  badge: string | null;
  description: string;
  details: string;
  shipping: string;
  care: string;
  is_published: boolean;
  images: ImageItem[];
  options: OptionItem[];
}

interface ProductFormProps {
  initialData?: ProductFormData;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialData?.id;
  const [saving, setSaving] = useState(false);
  // 등록 직후 AI 초안까지 이어서 만들지. 수정 화면에는 이미 'AI 초안' 버튼이 있어 안 쓴다.
  const [generateDraft, setGenerateDraft] = useState(true);
  const [phase, setPhase] = useState<"idle" | "saving" | "drafting">("idle");

  const [form, setForm] = useState<ProductFormData>(
    initialData ?? {
      name: "",
      slug: "",
      price: 0,
      sale_price: null,
      tag: "handmade",
      badge: null,
      description: "",
      details: "",
      shipping: "Free shipping on orders over ₩50,000.\nStandard delivery: 2-3 business days.",
      care: "",
      is_published: false,
      images: [],
      options: [],
    }
  );

  function updateField<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addOption(type: "color" | "size") {
    const newOption: OptionItem = {
      type,
      name: "",
      value: type === "color" ? "#000000" : "",
      sort_order: form.options.filter((o) => o.type === type).length,
    };
    updateField("options", [...form.options, newOption]);
  }

  function updateOption(index: number, field: keyof OptionItem, value: string) {
    const updated = [...form.options];
    updated[index] = { ...updated[index], [field]: value };
    updateField("options", updated);
  }

  function removeOption(index: number) {
    updateField("options", form.options.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setPhase("saving");

    const { images, options, ...productData } = form;

    const url = isEdit
      ? `/api/admin/products/${initialData!.id}`
      : "/api/admin/products";

    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...productData, images, options }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "저장 실패");
      setSaving(false);
      setPhase("idle");
      return;
    }

    // 등록만 하고 초안은 만들지 않는 경우 (수정 화면 포함)
    if (isEdit || !generateDraft) {
      router.push("/admin/products");
      router.refresh();
      return;
    }

    const created = (await res.json().catch(() => null)) as { id?: string } | null;
    if (!created?.id) {
      router.push("/admin/products");
      router.refresh();
      return;
    }

    // 여기부터 실패해도 상품 등록은 이미 끝났다. 초안 생성 실패가 등록을 되돌리지 않는다.
    setPhase("drafting");
    try {
      const draftRes = await fetch(`/api/admin/products/${created.id}/drafts`, {
        method: "POST",
      });
      const draftData = (await draftRes.json().catch(() => ({}))) as {
        draft?: { id?: string };
        error?: string;
      };

      if (draftRes.ok && draftData.draft?.id) {
        router.push(`/admin/drafts/${draftData.draft.id}/review`);
        router.refresh();
        return;
      }

      alert(
        `상품은 등록됐지만 AI 초안 생성에 실패했습니다: ${draftData.error ?? draftRes.status}\n` +
          `상품 초안 화면에서 다시 시도할 수 있습니다.`
      );
    } catch (err) {
      alert(
        `상품은 등록됐지만 AI 초안 생성에 실패했습니다: ${(err as Error).message}\n` +
          `상품 초안 화면에서 다시 시도할 수 있습니다.`
      );
    }

    router.push(`/admin/products/${created.id}/drafts`);
    router.refresh();
  }

  const inputClass =
    "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";
  const labelClass =
    "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";

  const colorOptions = form.options.filter((o) => o.type === "color");
  const sizeOptions = form.options.filter((o) => o.type === "size");

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* Basic info */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-2">기본 정보</h2>

        <div>
          <label className={labelClass}>상품명</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              updateField("name", e.target.value);
              if (!isEdit) updateField("slug", slugify(e.target.value));
            }}
            required
            className={inputClass}
            placeholder="상품명을 입력하세요"
          />
        </div>

        <div>
          <label className={labelClass}>Slug (URL)</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            required
            className={inputClass}
            placeholder="product-url-slug"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>가격 (원)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => updateField("price", Number(e.target.value))}
              required
              min={0}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>할인가 (원)</label>
            <input
              type="number"
              value={form.sale_price ?? ""}
              onChange={(e) =>
                updateField("sale_price", e.target.value ? Number(e.target.value) : null)
              }
              min={0}
              className={inputClass}
              placeholder="없으면 비워두세요"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>태그</label>
            <select
              value={form.tag}
              onChange={(e) => updateField("tag", e.target.value)}
              className={inputClass}
            >
              {TAGS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>뱃지</label>
            <select
              value={form.badge ?? ""}
              onChange={(e) => updateField("badge", e.target.value || null)}
              className={inputClass}
            >
              {BADGES.map((b) => (
                <option key={b ?? "none"} value={b ?? ""}>{b ?? "없음"}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => updateField("is_published", e.target.checked)}
              className="w-4 h-4"
            />
            공개 (체크 시 고객에게 표시)
          </label>
        </div>
      </div>

      {/* Images */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6">
        <ImageUploader
          images={form.images}
          onChange={(images) => updateField("images", images)}
        />
      </div>

      {/* Description */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-2">상세 정보</h2>

        <div>
          <label className={labelClass}>상품 설명</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            className={inputClass + " resize-none"}
            placeholder="상품 설명"
          />
        </div>
        <div>
          <label className={labelClass}>상세 정보 (Details)</label>
          <textarea
            value={form.details}
            onChange={(e) => updateField("details", e.target.value)}
            rows={3}
            className={inputClass + " resize-none"}
            placeholder="크기, 무게, 원산지 등"
          />
        </div>
        <div>
          <label className={labelClass}>배송 안내</label>
          <textarea
            value={form.shipping}
            onChange={(e) => updateField("shipping", e.target.value)}
            rows={3}
            className={inputClass + " resize-none"}
          />
        </div>
        <div>
          <label className={labelClass}>관리 방법 (Care)</label>
          <textarea
            value={form.care}
            onChange={(e) => updateField("care", e.target.value)}
            rows={2}
            className={inputClass + " resize-none"}
          />
        </div>
      </div>

      {/* Options */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-6">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-2">옵션</h2>

        {/* Colors */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className={labelClass}>색상 옵션</p>
            <button type="button" onClick={() => addOption("color")} className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1">
              <Plus size={12} /> 추가
            </button>
          </div>
          {colorOptions.length === 0 && (
            <p className="text-xs text-[var(--pb-silver)]">색상 옵션 없음</p>
          )}
          {colorOptions.map((opt) => {
            const globalIndex = form.options.indexOf(opt);
            return (
              <div key={globalIndex} className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={opt.value || "#000000"}
                  onChange={(e) => updateOption(globalIndex, "value", e.target.value)}
                  className="w-8 h-8 border border-[var(--pb-light-gray)] cursor-pointer"
                />
                <input
                  type="text"
                  value={opt.name}
                  onChange={(e) => updateOption(globalIndex, "name", e.target.value)}
                  placeholder="색상 이름"
                  className={inputClass + " flex-1"}
                />
                <button type="button" onClick={() => removeOption(globalIndex)} className="text-[var(--pb-silver)] hover:text-[var(--accent-sale)]">
                  <Minus size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Sizes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className={labelClass}>사이즈 옵션</p>
            <button type="button" onClick={() => addOption("size")} className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1">
              <Plus size={12} /> 추가
            </button>
          </div>
          {sizeOptions.length === 0 && (
            <p className="text-xs text-[var(--pb-silver)]">사이즈 옵션 없음</p>
          )}
          {sizeOptions.map((opt) => {
            const globalIndex = form.options.indexOf(opt);
            return (
              <div key={globalIndex} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={opt.name}
                  onChange={(e) => updateOption(globalIndex, "name", e.target.value)}
                  placeholder="사이즈 (예: S, M, L)"
                  className={inputClass + " flex-1"}
                />
                <button type="button" onClick={() => removeOption(globalIndex)} className="text-[var(--pb-silver)] hover:text-[var(--accent-sale)]">
                  <Minus size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI 초안 — 등록 시에만. 수정 화면에는 이미 'AI 초안' 버튼이 따로 있다. */}
      {!isEdit && (
        <label className="flex items-start gap-2.5 border border-[var(--pb-light-gray)] p-4 cursor-pointer">
          <input
            type="checkbox"
            checked={generateDraft}
            onChange={(e) => setGenerateDraft(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-sm">
            등록 후 AI 상세페이지 초안 만들기
            <span className="block text-xs text-[var(--pb-gray)] mt-1">
              등록이 끝나면 초안을 생성하고 검수 화면으로 이동합니다. 초안은 검토·승인해야만
              고객에게 발행되며, 지금 입력한 사진과 상세정보를 그대로 씁니다.
            </span>
          </span>
        </label>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary px-8 py-3 text-sm disabled:opacity-50">
          {phase === "drafting"
            ? "AI 초안 생성 중..."
            : phase === "saving"
              ? "저장 중..."
              : isEdit
                ? "상품 수정"
                : "상품 등록"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="btn-secondary px-8 py-3 text-sm"
        >
          취소
        </button>
      </div>
    </form>
  );
}

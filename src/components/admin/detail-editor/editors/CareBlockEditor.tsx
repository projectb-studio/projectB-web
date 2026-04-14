"use client";

import { Plus, X } from "lucide-react";
import type { Block } from "../types";

type B = Extract<Block, { type: "care" }>;
type CareIcon = "wash" | "dry" | "iron" | "bleach" | "custom";

const ICONS: { value: CareIcon; label: string }[] = [
  { value: "wash", label: "세탁" },
  { value: "dry", label: "건조" },
  { value: "iron", label: "다림질" },
  { value: "bleach", label: "표백" },
  { value: "custom", label: "기타" },
];

export default function CareBlockEditor({
  block,
  onChange,
}: {
  block: B;
  onChange: (b: B) => void;
}) {
  const d = block.data;

  function updateItem(i: number, patch: Partial<B["data"]["items"][number]>) {
    const items = d.items.map((it, j) => (j === i ? { ...it, ...patch } : it));
    onChange({ ...block, data: { ...d, items } });
  }
  function addItem() {
    if (d.items.length >= 10) return;
    onChange({
      ...block,
      data: { ...d, items: [...d.items, { icon: "wash", text: "" }] },
    });
  }
  function removeItem(i: number) {
    onChange({ ...block, data: { ...d, items: d.items.filter((_, j) => j !== i) } });
  }

  return (
    <div className="space-y-2">
      {d.items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <select
            value={it.icon}
            onChange={(e) => updateItem(i, { icon: e.target.value as CareIcon })}
            className="border border-[var(--pb-light-gray)] px-2 text-sm"
          >
            {ICONS.map((ic) => (
              <option key={ic.value} value={ic.value}>
                {ic.label}
              </option>
            ))}
          </select>
          <input
            placeholder="안내 문구 (예: 찬물 단독 세탁)"
            value={it.text}
            onChange={(e) => updateItem(i, { text: e.target.value })}
            className="border border-[var(--pb-light-gray)] px-3 py-2 text-sm flex-1"
          />
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="border border-[var(--pb-light-gray)] px-2 text-[var(--pb-gray)] hover:text-[var(--accent-sale)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        disabled={d.items.length >= 10}
        className="flex items-center gap-1 text-xs uppercase tracking-wider text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] disabled:opacity-40"
      >
        <Plus className="w-3 h-3" /> 항목 추가 ({d.items.length}/10)
      </button>
    </div>
  );
}

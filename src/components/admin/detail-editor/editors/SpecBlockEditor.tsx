"use client";

import { Plus, X } from "lucide-react";
import type { Block } from "../types";

type B = Extract<Block, { type: "spec" }>;

export default function SpecBlockEditor({
  block,
  onChange,
}: {
  block: B;
  onChange: (b: B) => void;
}) {
  const d = block.data;

  function updateRow(i: number, key: "label" | "value", v: string) {
    const rows = d.rows.map((r, j) => (j === i ? { ...r, [key]: v } : r));
    onChange({ ...block, data: { ...d, rows } });
  }
  function addRow() {
    if (d.rows.length >= 30) return;
    onChange({ ...block, data: { ...d, rows: [...d.rows, { label: "", value: "" }] } });
  }
  function removeRow(i: number) {
    onChange({ ...block, data: { ...d, rows: d.rows.filter((_, j) => j !== i) } });
  }

  return (
    <div className="space-y-2">
      <input
        placeholder="제목 (선택)"
        value={d.title ?? ""}
        onChange={(e) => onChange({ ...block, data: { ...d, title: e.target.value } })}
        className="border border-[var(--pb-light-gray)] px-3 py-2 text-sm w-full"
      />
      {d.rows.map((r, i) => (
        <div key={i} className="flex gap-2">
          <input
            placeholder="항목 (예: 소재)"
            value={r.label}
            onChange={(e) => updateRow(i, "label", e.target.value)}
            className="border border-[var(--pb-light-gray)] px-3 py-2 text-sm w-1/3"
          />
          <input
            placeholder="값 (예: 도자기)"
            value={r.value}
            onChange={(e) => updateRow(i, "value", e.target.value)}
            className="border border-[var(--pb-light-gray)] px-3 py-2 text-sm flex-1"
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="border border-[var(--pb-light-gray)] px-2 text-[var(--pb-gray)] hover:text-[var(--accent-sale)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        disabled={d.rows.length >= 30}
        className="flex items-center gap-1 text-xs uppercase tracking-wider text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] disabled:opacity-40"
      >
        <Plus className="w-3 h-3" /> 행 추가 ({d.rows.length}/30)
      </button>
    </div>
  );
}

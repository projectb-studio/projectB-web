"use client";

import type { Block } from "../types";
import SingleImageInput from "../SingleImageInput";

type B = Extract<Block, { type: "image" }>;

export default function ImageBlockEditor({
  block,
  onChange,
}: {
  block: B;
  onChange: (b: B) => void;
}) {
  const d = block.data;
  const patch = (next: Partial<B["data"]>) =>
    onChange({ ...block, data: { ...d, ...next } });

  return (
    <div className="space-y-3">
      <SingleImageInput value={d.url} onChange={(url) => patch({ url })} />
      <input
        placeholder="대체 텍스트 (alt) — 접근성"
        value={d.alt}
        onChange={(e) => patch({ alt: e.target.value })}
        className="border border-[var(--pb-light-gray)] px-3 py-2 text-sm w-full"
      />
      <input
        placeholder="캡션 (선택)"
        value={d.caption ?? ""}
        onChange={(e) => patch({ caption: e.target.value })}
        className="border border-[var(--pb-light-gray)] px-3 py-2 text-sm w-full"
      />
      <div className="flex gap-4 text-sm">
        <span className="text-xs uppercase text-[var(--pb-gray)]">폭:</span>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            checked={d.width === "full"}
            onChange={() => patch({ width: "full" })}
          />
          전체
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            checked={d.width === "narrow"}
            onChange={() => patch({ width: "narrow" })}
          />
          좁게
        </label>
      </div>
    </div>
  );
}

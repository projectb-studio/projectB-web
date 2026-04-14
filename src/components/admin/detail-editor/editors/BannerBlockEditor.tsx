"use client";

import type { Block } from "../types";

type B = Extract<Block, { type: "banner" }>;

export default function BannerBlockEditor({
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
      <input
        placeholder="배너 문구 (예: HANDMADE IN KOREA)"
        value={d.text}
        onChange={(e) => patch({ text: e.target.value.slice(0, 200) })}
        className="border border-[var(--pb-light-gray)] px-3 py-2 text-sm w-full"
      />
      <div className="flex flex-wrap gap-3 text-sm">
        <div className="flex gap-2 items-center">
          <span className="text-xs uppercase text-[var(--pb-gray)]">배경:</span>
          {(["black", "offwhite", "sale"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => patch({ bgColor: c })}
              className={`px-3 py-1 text-xs border ${
                d.bgColor === c
                  ? "border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white"
                  : "border-[var(--pb-light-gray)]"
              }`}
            >
              {c === "black" ? "검정" : c === "offwhite" ? "연회색" : "세일(빨강)"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs uppercase text-[var(--pb-gray)]">정렬:</span>
          {(["left", "center"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => patch({ align: a })}
              className={`px-3 py-1 text-xs border ${
                d.align === a
                  ? "border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white"
                  : "border-[var(--pb-light-gray)]"
              }`}
            >
              {a === "left" ? "왼쪽" : "가운데"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { BLOCK_LABELS, type BlockType, emptyBlock, type Block } from "./types";
import { Plus } from "lucide-react";

export default function BlockPalette({ onAdd }: { onAdd: (b: Block) => void }) {
  return (
    <aside className="sticky top-4 border border-[var(--pb-light-gray)] p-3 space-y-1 bg-white">
      <h3 className="text-xs uppercase tracking-wider text-[var(--pb-gray)] mb-2">
        블록 추가
      </h3>
      {(Object.keys(BLOCK_LABELS) as BlockType[]).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onAdd(emptyBlock(t))}
          className="flex items-center gap-1.5 w-full text-left border border-[var(--pb-light-gray)] px-2 py-1.5 text-sm hover:bg-[var(--pb-off-white)] hover:border-[var(--pb-jet-black)] transition-colors"
        >
          <Plus className="w-3 h-3" /> {BLOCK_LABELS[t]}
        </button>
      ))}
    </aside>
  );
}

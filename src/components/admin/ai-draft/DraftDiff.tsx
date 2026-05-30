"use client";

import type { Block } from "@/lib/detail-blocks/schema";
import DetailBlocksRenderer from "@/lib/detail-blocks/renderer";

/**
 * 라이브(현재 발행본) vs 초안 좌우 비교.
 * 운영자가 "무엇이 바뀌는지" 확인한 뒤 발행하도록 돕는다.
 */
export default function DraftDiff({
  liveBlocks,
  draftBlocks,
}: {
  liveBlocks: Block[];
  draftBlocks: Block[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <section className="border border-[var(--pb-light-gray)]">
        <header className="border-b border-[var(--pb-light-gray)] px-3 py-2 bg-[var(--pb-snow)]">
          <span className="text-xs uppercase tracking-[0.15em] text-[var(--pb-gray)]">
            현재 발행본 (LIVE)
          </span>
        </header>
        <div className="p-4">
          {liveBlocks.length === 0 ? (
            <p className="text-xs text-[var(--pb-silver)] py-8 text-center">
              발행된 상세페이지가 없습니다.
            </p>
          ) : (
            <DetailBlocksRenderer blocks={liveBlocks} />
          )}
        </div>
      </section>

      <section className="border border-[var(--pb-jet-black)]">
        <header className="border-b border-[var(--pb-jet-black)] px-3 py-2 bg-[var(--pb-jet-black)]">
          <span className="text-xs uppercase tracking-[0.15em] text-white">
            AI 초안 (DRAFT)
          </span>
        </header>
        <div className="p-4">
          <DetailBlocksRenderer blocks={draftBlocks} />
        </div>
      </section>
    </div>
  );
}

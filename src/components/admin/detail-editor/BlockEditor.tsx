"use client";

import type { Block } from "./types";
import { BLOCK_LABELS } from "./types";
import ImageBlockEditor from "./editors/ImageBlockEditor";
import GalleryBlockEditor from "./editors/GalleryBlockEditor";
import RichTextBlockEditor from "./editors/RichTextBlockEditor";
import TwoColBlockEditor from "./editors/TwoColBlockEditor";
import SpecBlockEditor from "./editors/SpecBlockEditor";
import CareBlockEditor from "./editors/CareBlockEditor";
import BannerBlockEditor from "./editors/BannerBlockEditor";
import YoutubeBlockEditor from "./editors/YoutubeBlockEditor";

export default function BlockEditor({
  block,
  onChange,
  onDuplicate,
  onRemove,
}: {
  block: Block;
  onChange: (b: Block) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-[var(--pb-gray)]">
          {BLOCK_LABELS[block.type]}
        </span>
        <div className="flex gap-3 text-xs">
          <button type="button" onClick={onDuplicate} className="underline hover:text-[var(--pb-jet-black)]">
            복제
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="underline text-[var(--accent-sale)] hover:opacity-80"
          >
            삭제
          </button>
        </div>
      </div>
      {block.type === "image" && (
        <ImageBlockEditor block={block} onChange={onChange as (b: typeof block) => void} />
      )}
      {block.type === "gallery" && (
        <GalleryBlockEditor block={block} onChange={onChange as (b: typeof block) => void} />
      )}
      {block.type === "richtext" && (
        <RichTextBlockEditor block={block} onChange={onChange as (b: typeof block) => void} />
      )}
      {block.type === "twocol" && (
        <TwoColBlockEditor block={block} onChange={onChange as (b: typeof block) => void} />
      )}
      {block.type === "spec" && (
        <SpecBlockEditor block={block} onChange={onChange as (b: typeof block) => void} />
      )}
      {block.type === "care" && (
        <CareBlockEditor block={block} onChange={onChange as (b: typeof block) => void} />
      )}
      {block.type === "banner" && (
        <BannerBlockEditor block={block} onChange={onChange as (b: typeof block) => void} />
      )}
      {block.type === "youtube" && (
        <YoutubeBlockEditor block={block} onChange={onChange as (b: typeof block) => void} />
      )}
    </div>
  );
}

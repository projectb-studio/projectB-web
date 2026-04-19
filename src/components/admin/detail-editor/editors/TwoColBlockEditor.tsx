"use client";

import type { Block } from "../types";
import SingleImageInput from "../SingleImageInput";
import RichTextBlockEditor from "./RichTextBlockEditor";

type B = Extract<Block, { type: "twocol" }>;

export default function TwoColBlockEditor({
  block,
  onChange,
}: {
  block: B;
  onChange: (b: B) => void;
}) {
  const d = block.data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="text-xs uppercase text-[var(--pb-gray)]">이미지</div>
        <SingleImageInput
          value={d.image.url}
          onChange={(url) =>
            onChange({ ...block, data: { ...d, image: { ...d.image, url } } })
          }
        />
        <input
          placeholder="대체 텍스트 (alt)"
          value={d.image.alt}
          onChange={(e) =>
            onChange({
              ...block,
              data: { ...d, image: { ...d.image, alt: e.target.value } },
            })
          }
          className="border border-[var(--pb-light-gray)] px-3 py-2 text-sm w-full"
        />
        <div className="flex gap-4 text-sm mt-1">
          <span className="text-xs uppercase text-[var(--pb-gray)]">이미지 위치:</span>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              checked={d.imageSide === "left"}
              onChange={() => onChange({ ...block, data: { ...d, imageSide: "left" } })}
            />
            왼쪽
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              checked={d.imageSide === "right"}
              onChange={() => onChange({ ...block, data: { ...d, imageSide: "right" } })}
            />
            오른쪽
          </label>
        </div>
      </div>
      <div>
        <div className="text-xs uppercase text-[var(--pb-gray)] mb-2">텍스트</div>
        <RichTextBlockEditor
          block={{ id: block.id, type: "richtext", data: d.text }}
          onChange={(rt) => onChange({ ...block, data: { ...d, text: rt.data } })}
        />
      </div>
    </div>
  );
}

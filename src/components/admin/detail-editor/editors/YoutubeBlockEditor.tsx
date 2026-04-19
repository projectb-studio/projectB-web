"use client";

import { useState } from "react";
import type { Block } from "../types";
import { extractYoutubeId } from "../types";

type B = Extract<Block, { type: "youtube" }>;

export default function YoutubeBlockEditor({
  block,
  onChange,
}: {
  block: B;
  onChange: (b: B) => void;
}) {
  const d = block.data;
  const [input, setInput] = useState(d.videoId);
  const [invalid, setInvalid] = useState(false);

  function commit(raw: string) {
    const id = extractYoutubeId(raw);
    if (!id) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onChange({ ...block, data: { ...d, videoId: id } });
  }

  return (
    <div className="space-y-3">
      <input
        placeholder="유튜브 URL 또는 video ID"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onBlur={() => commit(input)}
        className={`border px-3 py-2 text-sm w-full ${
          invalid
            ? "border-[var(--accent-sale)]"
            : "border-[var(--pb-light-gray)]"
        }`}
      />
      {invalid && (
        <p className="text-xs text-[var(--accent-sale)]">
          올바른 유튜브 URL 또는 video ID를 입력해주세요.
        </p>
      )}
      {d.videoId && !invalid && (
        <div className="aspect-video max-w-md">
          <iframe
            src={`https://www.youtube.com/embed/${d.videoId}`}
            className="w-full h-full"
            allowFullScreen
            title="미리보기"
          />
        </div>
      )}
      <input
        placeholder="캡션 (선택)"
        value={d.caption ?? ""}
        onChange={(e) => onChange({ ...block, data: { ...d, caption: e.target.value } })}
        className="border border-[var(--pb-light-gray)] px-3 py-2 text-sm w-full"
      />
    </div>
  );
}

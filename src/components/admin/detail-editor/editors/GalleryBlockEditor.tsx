"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import type { Block } from "../types";

type B = Extract<Block, { type: "gallery" }>;

export default function GalleryBlockEditor({
  block,
  onChange,
}: {
  block: B;
  onChange: (b: B) => void;
}) {
  const d = block.data;
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadAll(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const next = [...d.images];
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append("file", files[i]);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        next.push({ url, alt: "" });
      }
    }
    onChange({ ...block, data: { ...d, images: next } });
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {d.images.map((im, i) => (
          <div key={i} className="relative group aspect-square bg-[var(--pb-off-white)]">
            <Image src={im.url} alt={im.alt} fill className="object-cover" sizes="120px" />
            <button
              type="button"
              onClick={() => {
                const next = d.images.filter((_, j) => j !== i);
                onChange({ ...block, data: { ...d, images: next } });
              }}
              className="absolute top-1 right-1 p-1 bg-black/60 text-white opacity-0 group-hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square border border-dashed border-[var(--pb-light-gray)] text-xs text-[var(--pb-gray)] flex flex-col items-center justify-center hover:border-[var(--pb-jet-black)]"
        >
          <Upload className="w-4 h-4 mb-1" />
          {uploading ? "업로드 중..." : "추가"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => uploadAll(e.target.files)}
      />
      <div className="flex gap-4 text-sm">
        <span className="text-xs uppercase text-[var(--pb-gray)]">컬럼:</span>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            checked={d.columns === 2}
            onChange={() => onChange({ ...block, data: { ...d, columns: 2 } })}
          />
          2단
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            checked={d.columns === 3}
            onChange={() => onChange({ ...block, data: { ...d, columns: 3 } })}
          />
          3단
        </label>
      </div>
    </div>
  );
}

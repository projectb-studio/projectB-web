"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

export default function SingleImageInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", files[0]);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      onChange(url);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      {value ? (
        <div className="relative group aspect-square w-40 bg-[var(--pb-off-white)]">
          <Image src={value} alt="" fill className="object-cover" sizes="160px" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 p-1 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center w-40 aspect-square border border-dashed border-[var(--pb-light-gray)] text-xs text-[var(--pb-gray)] hover:border-[var(--pb-jet-black)] hover:text-[var(--pb-jet-black)] transition-colors"
        >
          <Upload className="w-5 h-5 mb-1" />
          {uploading ? "업로드 중..." : "이미지 선택"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />
    </div>
  );
}

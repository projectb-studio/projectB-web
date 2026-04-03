"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageItem {
  url: string;
  sort_order: number;
}

interface ImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    const newImages = [...images];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const { url } = await res.json();
        newImages.push({ url, sort_order: newImages.length });
      }
    }

    onChange(newImages);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index).map((img, i) => ({
      ...img,
      sort_order: i,
    }));
    onChange(updated);
  }

  return (
    <div>
      <p className="text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-2">
        상품 이미지
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {images.map((img, index) => (
          <div key={`${img.url}-${index}`} className="relative group aspect-square bg-[var(--pb-off-white)]">
            <Image src={img.url} alt={`Product image ${index + 1}`} fill className="object-cover" sizes="150px" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 p-1 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
            <div className="absolute bottom-1 left-1 p-1 bg-black/40 text-white text-[10px]">
              {index + 1}
            </div>
          </div>
        ))}

        {/* Upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "aspect-square border-2 border-dashed border-[var(--pb-light-gray)]",
            "flex flex-col items-center justify-center gap-2",
            "text-[var(--pb-silver)] hover:text-[var(--pb-gray)] hover:border-[var(--pb-gray)]",
            "transition-colors",
            uploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <Upload size={20} />
          <span className="text-[10px]">{uploading ? "업로드 중..." : "이미지 추가"}</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleUpload(e.target.files)}
        className="hidden"
      />
    </div>
  );
}

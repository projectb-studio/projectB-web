"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  name: string;
}

export function ImageGallery({ images, name }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-product bg-pb-off-white overflow-hidden">
        <Image
          src={images[activeIndex]}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "relative aspect-product bg-pb-off-white overflow-hidden border transition-colors",
              i === activeIndex
                ? "border-pb-jet-black"
                : "border-transparent hover:border-pb-light-gray",
            )}
          >
            <Image
              src={src}
              alt={`${name} — ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 25vw, 12vw"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

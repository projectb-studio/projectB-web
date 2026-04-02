"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlist";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/database";

interface WishlistButtonProps {
  product: Product;
  size?: number;
  className?: string;
}

export function WishlistButton({ product, size = 18, className }: WishlistButtonProps) {
  const { toggleItem, isWished } = useWishlistStore();
  const wished = isWished(product.id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(product);
      }}
      className={cn(
        "transition-colors",
        wished
          ? "text-[var(--pb-accent-sale)]"
          : "text-[var(--pb-silver)] hover:text-[var(--pb-jet-black)]",
        className,
      )}
      aria-label={wished ? "위시리스트에서 제거" : "위시리스트에 추가"}
    >
      <Heart
        size={size}
        strokeWidth={1.5}
        fill={wished ? "currentColor" : "none"}
      />
    </button>
  );
}

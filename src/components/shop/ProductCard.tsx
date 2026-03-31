"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/database";

interface ProductCardProps {
  product: Product;
  variant?: "vertical" | "horizontal";
}

export function ProductCard({ product, variant = "vertical" }: ProductCardProps) {
  const { name, price, salePrice, tag, badge, slug, imageUrl } = product;

  // Map badge value to the corresponding CSS class from globals.css
  const badgeClass =
    badge === "NEW"
      ? "badge-new"
      : badge === "BEST"
      ? "badge-best"
      : badge === "SALE" || (badge && badge.startsWith("-"))
      ? "badge-sale"
      : badge === "HANDMADE"
      ? "badge-handmade"
      : null;

  return (
    <Link href={`/product/${slug}`} className="group block">
      {/* Image container — 1:1 square ratio */}
      <div className="relative overflow-hidden aspect-product bg-pb-off-white">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 1024px) 50vw, 25vw"
        />
        {badgeClass && badge && (
          <span
            className={cn(
              "badge absolute top-3 left-3",
              badgeClass
            )}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Info — vertical layout (default, New In) */}
      {variant === "vertical" && (
        <div className="mt-3 space-y-1">
          <p className="text-xs text-pb-gray uppercase tracking-industrial">{tag}</p>
          <p className="text-sm text-pb-jet-black line-clamp-2 leading-snug">{name}</p>
          <div className="flex items-center gap-2">
            {salePrice ? (
              <>
                <span className="text-sm font-medium text-accent-sale">
                  ₩{salePrice.toLocaleString()}
                </span>
                <span className="text-xs text-pb-gray line-through">
                  ₩{price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-pb-jet-black">
                ₩{price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Info — horizontal layout (Best Sellers) */}
      {variant === "horizontal" && (
        <div className="mt-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-pb-jet-black line-clamp-2 leading-snug">{name}</p>
            <p className="text-xs text-pb-gray uppercase tracking-industrial mt-0.5">{tag}</p>
          </div>
          <div className="shrink-0 text-right">
            {salePrice ? (
              <>
                <p className="text-sm font-medium text-accent-sale">₩{salePrice.toLocaleString()}</p>
                <p className="text-xs text-pb-gray line-through">₩{price.toLocaleString()}</p>
              </>
            ) : (
              <p className="text-sm font-medium text-pb-jet-black">₩{price.toLocaleString()}</p>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}

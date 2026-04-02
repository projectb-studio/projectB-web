"use client";

import { useState } from "react";
import { cn, formatPrice } from "@/lib/utils";
import { QuantitySelector } from "./QuantitySelector";
import { Accordion } from "./Accordion";
import { useCartStore } from "@/stores/cart";
import { ChevronDown } from "lucide-react";
import { WishlistButton } from "@/components/common/WishlistButton";
import { ShareButtons } from "./ShareButtons";
import type { Product } from "@/types/database";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { name, price, salePrice, tag, badge, description, details, shipping, care, options } = product;
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    options?.colors?.[0]?.value ?? null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    options?.sizes?.[0] ?? null
  );
  const addItem = useCartStore((s) => s.addItem);

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

  const accordionItems = [
    details && { title: "Details", content: details },
    shipping && { title: "Shipping", content: shipping },
    care && { title: "Care", content: care },
  ].filter((item): item is { title: string; content: string } => Boolean(item));

  return (
    <div className="flex flex-col gap-6">
      {/* Tag + badge */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-pb-silver uppercase tracking-[0.2em]">{tag}</span>
        {badgeClass && badge && (
          <span className={cn("badge", badgeClass)}>{badge}</span>
        )}
      </div>

      {/* Name */}
      <h1 className="text-lg lg:text-xl font-medium leading-snug">{name}</h1>

      {/* Price */}
      <div className="flex items-center gap-3">
        {salePrice ? (
          <>
            <span className="text-lg font-medium text-accent-sale">
              {formatPrice(salePrice)}
            </span>
            <span className="text-sm text-pb-silver line-through">
              {formatPrice(price)}
            </span>
          </>
        ) : (
          <span className="text-lg font-medium">{formatPrice(price)}</span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-pb-charcoal leading-relaxed">{description}</p>
      )}

      {/* Divider */}
      <div className="h-px bg-pb-light-gray/40" />

      {/* Product options: Color + Size */}
      {options?.colors && options.colors.length > 0 && (
        <div>
          <p className="text-xs text-pb-gray uppercase tracking-industrial mb-2">
            Color
            {selectedColor && (
              <span className="ml-2 normal-case tracking-normal text-[var(--pb-charcoal)]">
                — {options.colors.find((c) => c.value === selectedColor)?.name}
              </span>
            )}
          </p>
          <div className="flex gap-2">
            {options.colors.map((color) => (
              <button
                key={color.value}
                type="button"
                title={color.name}
                onClick={() => setSelectedColor(color.value)}
                className={cn(
                  "w-6 h-6 transition-all",
                  "border",
                  selectedColor === color.value
                    ? "border-[2px] border-[var(--pb-jet-black)]"
                    : "border-[var(--pb-light-gray)] hover:border-[var(--pb-gray)]"
                )}
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>
        </div>
      )}

      {options?.sizes && options.sizes.length > 0 && (
        <div>
          <p className="text-xs text-pb-gray uppercase tracking-industrial mb-2">Size</p>
          <div className="flex gap-2">
            {options.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "px-4 py-2 text-xs uppercase tracking-industrial transition-colors border",
                  selectedSize === size
                    ? "bg-[var(--pb-jet-black)] text-white border-[var(--pb-jet-black)]"
                    : "bg-transparent text-[var(--pb-charcoal)] border-[var(--pb-light-gray)] hover:border-[var(--pb-jet-black)]"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity + Add to cart */}
      <div className="space-y-4">
        <div>
          <p className="text-xs text-pb-gray uppercase tracking-industrial mb-2">Quantity</p>
          <QuantitySelector onChange={setQuantity} />
        </div>
        <div className="flex gap-3">
          <button
            className="btn-primary flex-1"
            onClick={() => {
              addItem(product, quantity);
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
          >
            {added ? "Added!" : "Add to cart"}
          </button>
          <WishlistButton
            product={product}
            size={22}
            className="flex items-center justify-center w-12 border border-[var(--pb-light-gray)] hover:border-[var(--pb-jet-black)] transition-colors"
          />
        </div>
        {/* Review shortcut */}
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] transition-colors"
          onClick={() => {
            document
              .getElementById("reviews")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          리뷰 보기
          <ChevronDown size={14} strokeWidth={1.5} />
        </button>
        {/* SNS share */}
        <ShareButtons title={name} />
      </div>

      {/* Accordion */}
      {accordionItems.length > 0 && (
        <div className="mt-2">
          <Accordion items={accordionItems} />
        </div>
      )}
    </div>
  );
}

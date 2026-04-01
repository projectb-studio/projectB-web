"use client";

import { useState } from "react";
import { cn, formatPrice } from "@/lib/utils";
import { QuantitySelector } from "./QuantitySelector";
import { Accordion } from "./Accordion";
import { useCartStore } from "@/stores/cart";
import type { Product } from "@/types/database";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { name, price, salePrice, tag, badge, description, details, shipping, care } = product;
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
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

      {/* Quantity + Add to cart */}
      <div className="space-y-4">
        <div>
          <p className="text-xs text-pb-gray uppercase tracking-industrial mb-2">Quantity</p>
          <QuantitySelector onChange={setQuantity} />
        </div>
        <button
          className="btn-primary w-full"
          onClick={() => {
            addItem(product, quantity);
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
        >
          {added ? "Added!" : "Add to cart"}
        </button>
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

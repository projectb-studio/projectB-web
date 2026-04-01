"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore, type CartItem } from "@/stores/cart";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { product, quantity } = item;
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const unitPrice = product.salePrice ?? product.price;

  return (
    <div className="flex gap-4 py-6 border-b border-pb-light-gray/40">
      {/* Image */}
      <Link
        href={`/product/${product.slug}`}
        className="relative w-24 h-24 shrink-0 bg-pb-off-white overflow-hidden"
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/product/${product.slug}`}
              className="text-sm font-medium leading-snug hover:text-pb-gray transition-colors line-clamp-2"
            >
              {product.name}
            </Link>
            <p className="text-[10px] text-pb-silver uppercase tracking-[0.2em] mt-1">
              {product.tag}
            </p>
          </div>
          <button
            onClick={() => removeItem(product.id)}
            className="p-1 text-pb-silver hover:text-pb-jet-black transition-colors shrink-0"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Quantity */}
          <div className="inline-flex items-center border border-pb-light-gray">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              disabled={quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-pb-gray hover:text-pb-jet-black disabled:opacity-30 transition-colors"
            >
              <Minus size={12} strokeWidth={1.5} />
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-xs font-medium border-x border-pb-light-gray">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-pb-gray hover:text-pb-jet-black transition-colors"
            >
              <Plus size={12} strokeWidth={1.5} />
            </button>
          </div>

          {/* Price */}
          <span className="text-sm font-medium">
            {formatPrice(unitPrice * quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}

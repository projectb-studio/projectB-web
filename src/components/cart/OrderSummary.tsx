"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";
import { FREE_SHIPPING_THRESHOLD } from "@/constants/site";

export function OrderSummary() {
  const subtotal = useCartStore((s) => s.subtotal());
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 3000;
  const total = subtotal + shippingFee;

  return (
    <div className="border border-pb-light-gray p-6 space-y-5">
      <h2 className="text-xs font-heading font-semibold uppercase tracking-industrial">
        Order Summary
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-pb-gray">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-pb-gray">Shipping</span>
          <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
        </div>
        {shippingFee > 0 && (
          <p className="text-[10px] text-pb-silver">
            {formatPrice(FREE_SHIPPING_THRESHOLD)} 이상 구매 시 무료배송
          </p>
        )}
      </div>

      <div className="h-px bg-pb-light-gray/40" />

      <div className="flex justify-between text-sm font-medium">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <Link href="/checkout" className="btn-primary w-full text-center block">
        Checkout
      </Link>

      <Link
        href="/shop"
        className="block text-center text-xs text-pb-gray uppercase tracking-industrial hover:text-pb-jet-black transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

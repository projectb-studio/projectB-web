"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { OrderSummary } from "@/components/cart/OrderSummary";

export default function CartPage() {
  const items = useCartStore((s) => s.items);

  if (items.length === 0) {
    return (
      <section className="max-w-content mx-auto px-6 lg:px-12 py-20 text-center">
        <ShoppingBag size={40} strokeWidth={1} className="mx-auto text-pb-silver mb-6" />
        <h1 className="heading-display text-sm tracking-wide mb-4">
          Your cart is empty
        </h1>
        <p className="text-sm text-pb-gray mb-8">
          장바구니에 담긴 상품이 없습니다.
        </p>
        <Link href="/shop" className="btn-primary">
          Shop Now
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-content mx-auto px-6 lg:px-12 py-12 lg:py-20">
      <h1 className="heading-display text-sm text-center tracking-wide mb-10">
        Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="border-t border-pb-light-gray/40">
            {items.map((item) => (
              <CartItemRow key={item.product.id} item={item} />
            ))}
          </div>
        </div>

        {/* Summary sidebar */}
        <div>
          <OrderSummary />
        </div>
      </div>
    </section>
  );
}

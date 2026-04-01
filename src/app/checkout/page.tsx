"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/constants/site";
import { ShoppingBag } from "lucide-react";

const PAYMENT_METHODS = [
  { id: "card", label: "신용/체크카드" },
  { id: "transfer", label: "무통장 입금" },
  { id: "kakaopay", label: "카카오페이" },
  { id: "naverpay", label: "네이버페이" },
  { id: "tosspay", label: "토스페이" },
] as const;

function InputField({
  label,
  id,
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors"
      />
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const [selectedPayment, setSelectedPayment] = useState("card");

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 3000;
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <section className="max-w-content mx-auto px-6 lg:px-12 py-20 text-center">
        <ShoppingBag size={40} strokeWidth={1} className="mx-auto text-pb-silver mb-6" />
        <h1 className="heading-display text-sm tracking-wide mb-4">No items to checkout</h1>
        <p className="text-sm text-pb-gray mb-8">장바구니에 상품을 담아주세요.</p>
        <Link href="/shop" className="btn-primary">Shop Now</Link>
      </section>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Tosspayments integration
    clearCart();
    router.push("/order-complete");
  }

  return (
    <section className="max-w-content mx-auto px-6 lg:px-12 py-12 lg:py-20">
      <h1 className="heading-display text-sm text-center tracking-wide mb-10">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Shipping + Payment */}
          <div className="lg:col-span-2 space-y-10">
            {/* Shipping info */}
            <div>
              <h2 className="text-xs font-heading font-semibold uppercase tracking-industrial mb-6">
                Shipping Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Name" id="name" placeholder="이름" />
                <InputField label="Phone" id="phone" type="tel" placeholder="010-0000-0000" />
                <div className="sm:col-span-2">
                  <InputField label="Address" id="address" placeholder="주소" />
                </div>
                <div className="sm:col-span-2">
                  <InputField label="Detail Address" id="addressDetail" placeholder="상세주소" required={false} />
                </div>
                <InputField label="Postal Code" id="postal" placeholder="우편번호" />
                <InputField label="Email" id="email" type="email" placeholder="email@example.com" />
              </div>
              <div className="mt-4">
                <label htmlFor="memo" className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">
                  Delivery Memo
                </label>
                <textarea
                  id="memo"
                  rows={2}
                  placeholder="배송 메모 (선택)"
                  className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Payment method */}
            <div>
              <h2 className="text-xs font-heading font-semibold uppercase tracking-industrial mb-6">
                Payment Method
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method.id)}
                    className={`py-3 px-4 text-xs font-medium border transition-colors ${
                      selectedPayment === method.id
                        ? "border-pb-jet-black bg-pb-jet-black text-pb-snow"
                        : "border-pb-light-gray text-pb-gray hover:border-pb-charcoal"
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-pb-silver mt-3">
                토스페이먼츠 연동 후 실결제가 진행됩니다.
              </p>
            </div>
          </div>

          {/* Right: Order summary */}
          <div>
            <div className="border border-pb-light-gray p-6 space-y-5">
              <h2 className="text-xs font-heading font-semibold uppercase tracking-industrial">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 max-h-60 overflow-y-auto no-scrollbar">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="relative w-14 h-14 shrink-0 bg-pb-off-white overflow-hidden">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-snug line-clamp-1">{item.product.name}</p>
                      <p className="text-[10px] text-pb-silver mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-medium shrink-0">
                      {formatPrice((item.product.salePrice ?? item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-pb-light-gray/40" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-pb-gray">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pb-gray">Shipping</span>
                  <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
                </div>
              </div>

              <div className="h-px bg-pb-light-gray/40" />

              <div className="flex justify-between text-sm font-medium">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <button type="submit" className="btn-primary w-full">
                Pay {formatPrice(total)}
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

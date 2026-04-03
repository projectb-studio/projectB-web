"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as PortOne from "@portone/browser-sdk/v2";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/constants/site";
import { ShoppingBag } from "lucide-react";

const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID!;
const CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!;

const PAYMENT_METHODS = [
  { id: "CARD", label: "신용/체크카드" },
  { id: "TRANSFER", label: "계좌이체" },
  { id: "VIRTUAL_ACCOUNT", label: "가상계좌" },
  { id: "MOBILE", label: "휴대폰 결제" },
  { id: "EASY_PAY", label: "간편결제" },
] as const;

type PayMethod = (typeof PAYMENT_METHODS)[number]["id"];

function InputField({
  label,
  id,
  name,
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  id: string;
  name: string;
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
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors"
      />
    </div>
  );
}

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const [selectedPayment, setSelectedPayment] = useState<PayMethod>("CARD");
  const [isProcessing, setIsProcessing] = useState(false);

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 3000;
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <section className="max-w-content mx-auto px-6 lg:px-12 py-20 text-center">
        <ShoppingBag size={40} strokeWidth={1} className="mx-auto text-pb-silver mb-6" />
        <h1 className="heading-display text-sm tracking-wide mb-4">No items to checkout</h1>
        <p className="text-sm text-pb-gray mb-8">장바구니에 상품을 담아주세요.</p>
        <Link href="/category" className="btn-primary">Shop Now</Link>
      </section>
    );
  }

  async function handlePayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);

    const formData = new FormData(e.currentTarget);
    const customerName = formData.get("name") as string;
    const customerEmail = formData.get("email") as string;
    const customerPhone = formData.get("phone") as string;

    if (!customerName || !customerEmail || !customerPhone) {
      alert("배송 정보를 모두 입력해주세요.");
      setIsProcessing(false);
      return;
    }

    // Store shipping info in sessionStorage for success page
    const shippingInfo = {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: formData.get("address") as string,
      addressDetail: formData.get("addressDetail") as string,
      postalCode: formData.get("postalCode") as string,
      memo: formData.get("memo") as string,
    };
    sessionStorage.setItem("pb-shipping", JSON.stringify(shippingInfo));

    const paymentId = `PB-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    sessionStorage.setItem("pb-order-id", paymentId);

    const orderName =
      items.length === 1
        ? items[0].product.name
        : `${items[0].product.name} 외 ${items.length - 1}건`;

    try {
      const response = await PortOne.requestPayment({
        storeId: STORE_ID,
        channelKey: CHANNEL_KEY,
        paymentId,
        orderName,
        totalAmount: total,
        currency: "CURRENCY_KRW",
        payMethod: selectedPayment,
        customer: {
          fullName: customerName,
          email: customerEmail,
          phoneNumber: customerPhone.replace(/-/g, ""),
        },
        redirectUrl: `${window.location.origin}/checkout/success`,
      });

      if (!response || response.code != null) {
        // Payment failed or cancelled
        const message = response?.message ?? "결제가 취소되었습니다.";
        alert(message);
        setIsProcessing(false);
        return;
      }

      // Payment succeeded — verify on server
      window.location.href = `/checkout/success?paymentId=${paymentId}`;
    } catch {
      alert("결제 요청 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  }

  return (
    <section className="max-w-content mx-auto px-6 lg:px-12 py-12 lg:py-20">
      <h1 className="heading-display text-sm text-center tracking-wide mb-10">Checkout</h1>

      <form onSubmit={handlePayment}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Shipping + Payment */}
          <div className="lg:col-span-2 space-y-10">
            {/* Shipping info */}
            <div>
              <h2 className="text-xs font-heading font-semibold uppercase tracking-industrial mb-6">
                Shipping Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Name" id="name" name="name" placeholder="이름" />
                <InputField label="Phone" id="phone" name="phone" type="tel" placeholder="010-0000-0000" />
                <div className="sm:col-span-2">
                  <InputField label="Address" id="address" name="address" placeholder="주소" />
                </div>
                <div className="sm:col-span-2">
                  <InputField label="Detail Address" id="addressDetail" name="addressDetail" placeholder="상세주소" required={false} />
                </div>
                <InputField label="Postal Code" id="postal" name="postalCode" placeholder="우편번호" />
                <InputField label="Email" id="email" name="email" type="email" placeholder="email@example.com" />
              </div>
              <div className="mt-4">
                <label htmlFor="memo" className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">
                  Delivery Memo
                </label>
                <textarea
                  id="memo"
                  name="memo"
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
                포트원(PortOne) 결제 시스템을 통해 안전하게 결제됩니다.
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

              <button type="submit" disabled={isProcessing} className="btn-primary w-full disabled:opacity-50">
                {isProcessing ? "처리 중..." : `Pay ${formatPrice(total)}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

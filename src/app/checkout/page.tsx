import type { Metadata } from "next";

export const metadata: Metadata = { title: "주문/결제" };

export default function CheckoutPage() {
  return (
    <section className="max-w-narrow mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="heading-section text-sm text-center mb-12">Checkout</h1>
      {/* TODO: Shipping info form */}
      {/* TODO: Payment method (Tosspayments) */}
      {/* TODO: Order summary */}
      <p className="text-center text-[var(--pb-gray)] text-sm">결제 페이지 준비 중입니다.</p>
    </section>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = { title: "장바구니" };

export default function CartPage() {
  return (
    <section className="max-w-narrow mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="heading-section text-sm text-center mb-12">Cart</h1>
      {/* TODO: Cart items list */}
      {/* TODO: Order summary + checkout button */}
      <p className="text-center text-[var(--pb-gray)] text-sm">
        장바구니가 비어있습니다.
      </p>
    </section>
  );
}

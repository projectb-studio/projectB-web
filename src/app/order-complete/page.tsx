import type { Metadata } from "next";

export const metadata: Metadata = { title: "주문 완료" };

export default function OrderCompletePage() {
  return (
    <section className="max-w-narrow mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 className="heading-display text-2xl mb-4 tracking-[0.2em]">THANK YOU</h1>
      <p className="text-[var(--pb-gray)] text-sm mb-8">주문이 완료되었습니다.</p>
      {/* TODO: Order number, details, continue shopping button */}
    </section>
  );
}

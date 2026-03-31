import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "고객센터",
  description: "FAQ, 1:1 문의, 교환/반품 안내",
};

export default function CSPage() {
  return (
    <section className="max-w-narrow mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="heading-section text-sm text-center mb-12">Customer Service</h1>
      {/* TODO: Tab UI (FAQ / 1:1 Inquiry / Return & Exchange) */}
      <p className="text-center text-[var(--pb-gray)] text-sm">고객센터 준비 중입니다.</p>
    </section>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = { title: "마이페이지" };

export default function MyPage() {
  return (
    <section className="max-w-narrow mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="heading-section text-sm text-center mb-12">My Page</h1>
      {/* TODO: Order history, Wishlist, Profile edit, Points */}
      <p className="text-center text-[var(--pb-gray)] text-sm">로그인이 필요합니다.</p>
    </section>
  );
}

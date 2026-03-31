import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description: "모든 핸드메이드 소품을 만나보세요.",
};

export default function ShopPage() {
  return (
    <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="heading-section text-sm text-center mb-12">
        All Products
      </h1>

      {/* TODO: Tag filter bar (all/handmade/fabric/metal/wood/stone/glass) */}
      {/* TODO: Product grid */}
      {/* TODO: Pagination */}

      <p className="text-center text-[var(--pb-gray)] text-sm">
        상품 준비 중입니다.
      </p>
    </section>
  );
}

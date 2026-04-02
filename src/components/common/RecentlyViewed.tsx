"use client";

import { useRecentlyViewedStore } from "@/stores/recentlyViewed";
import { ProductCard } from "@/components/shop/ProductCard";

export function RecentlyViewed() {
  const items = useRecentlyViewedStore((state) => state.items);

  if (items.length === 0) return null;

  return (
    <section className="mt-12 lg:mt-16">
      <h2 className="heading-section mb-6">RECENTLY VIEWED</h2>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {items.map((product) => (
          <div key={product.id} className="w-[200px] shrink-0 lg:w-[240px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

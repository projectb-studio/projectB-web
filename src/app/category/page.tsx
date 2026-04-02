import type { Metadata } from "next";
import { getProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { TagFilter } from "@/components/shop/TagFilter";
import { Pagination } from "@/components/shop/Pagination";
import type { ProductTag } from "@/types/database";

export const metadata: Metadata = {
  title: "Category",
  description: "모든 핸드메이드 소품을 만나보세요.",
};

interface ShopPageProps {
  searchParams: Promise<{ tag?: string; page?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const activeTag = (params.tag ?? "all") as ProductTag | "all";
  const currentPage = Math.max(1, Number(params.page) || 1);

  const { products, total, totalPages } = await getProducts(activeTag, currentPage);
  const baseHref = activeTag === "all" ? "/category" : `/category?tag=${activeTag}`;

  return (
    <section className="max-w-content mx-auto px-6 lg:px-12 py-12 lg:py-20">
      {/* Page heading */}
      <h1 className="heading-display text-sm text-center mb-10 tracking-wide">
        All Products
      </h1>

      {/* Tag filter bar */}
      <div className="flex items-center justify-center mb-8">
        <TagFilter activeTag={activeTag} />
      </div>

      {/* Divider + product count */}
      <div className="h-px bg-pb-light-gray/40 mb-6" />
      <p className="text-xs text-pb-silver tracking-industrial uppercase mb-8">
        Showing {total} {total === 1 ? "item" : "items"}
      </p>

      {/* Product grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-pb-gray text-sm py-20">
          해당 카테고리에 상품이 없습니다.
        </p>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseHref={baseHref}
      />
    </section>
  );
}

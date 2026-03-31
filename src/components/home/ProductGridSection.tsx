import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/types/database";

interface ProductGridSectionProps {
  title: string;
  products: Product[];
  viewAllHref: string;
  variant?: "vertical" | "horizontal";
}

export function ProductGridSection({
  title,
  products,
  viewAllHref,
  variant = "vertical",
}: ProductGridSectionProps) {
  return (
    <section className="py-12 lg:py-16 px-6 lg:px-12 max-w-content mx-auto">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <h2 className="heading-section">{title}</h2>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-xs text-pb-jet-black uppercase tracking-industrial hover:text-pb-gray transition-colors"
        >
          View all
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} variant={variant} />
        ))}
      </div>
    </section>
  );
}

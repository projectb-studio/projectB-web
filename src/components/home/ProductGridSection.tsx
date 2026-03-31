import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { VIEW_ALL_LABEL } from "@/constants/home";
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
    <section className="py-16 lg:py-24 px-6 lg:px-12 max-w-content mx-auto">
      {/* Section header */}
      <div className="flex items-center justify-between mb-8 lg:mb-12">
        <h2 className="heading-section">{title}</h2>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1.5 text-xs text-pb-gray uppercase tracking-industrial hover:text-pb-jet-black transition-colors"
        >
          {VIEW_ALL_LABEL}
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} variant={variant} />
        ))}
      </div>
    </section>
  );
}

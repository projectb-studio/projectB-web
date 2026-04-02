import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProductBySlug } from "@/lib/data/products";
import { ImageGallery } from "@/components/product/ImageGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductReviews } from "@/components/product/ProductReviews";
import { TrackView } from "@/components/product/TrackView";
import { RecentlyViewed } from "@/components/common/RecentlyViewed";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description ?? `${product.name} — PROJECT B`,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <section className="max-w-content mx-auto px-6 lg:px-12 py-8 lg:py-16">
      {/* Track recently viewed */}
      <TrackView product={product} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] text-pb-silver mb-8">
        <Link href="/" className="hover:text-pb-jet-black transition-colors">
          Home
        </Link>
        <ChevronRight size={10} strokeWidth={1.5} />
        <Link href="/category" className="hover:text-pb-jet-black transition-colors">
          Category
        </Link>
        <ChevronRight size={10} strokeWidth={1.5} />
        <span className="text-pb-charcoal truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left: Image gallery */}
        <ImageGallery
          images={product.images ?? [product.imageUrl]}
          name={product.name}
        />

        {/* Right: Product info */}
        <ProductInfo product={product} />
      </div>

      {/* Divider */}
      <div className="h-px bg-pb-light-gray/40 mt-12" />

      {/* Reviews */}
      <ProductReviews productSlug={slug} />

      {/* Recently Viewed */}
      <RecentlyViewed />
    </section>
  );
}

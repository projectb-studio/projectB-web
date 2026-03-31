import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  // TODO: fetch product data from Supabase
  return {
    title: slug,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  return (
    <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* TODO: Product images gallery */}
      {/* TODO: Product info (name, price, options, add-to-cart) */}
      {/* TODO: Product description tabs */}
      {/* TODO: Related products */}

      <p className="text-center text-[var(--pb-gray)] text-sm">
        상품 상세 페이지: {slug}
      </p>
    </section>
  );
}

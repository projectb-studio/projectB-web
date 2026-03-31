import { getNewProducts, getBestSellers } from "@/lib/data/products";
import { HeroSection } from "@/components/home/HeroSection";
import { ProductGridSection } from "@/components/home/ProductGridSection";
import { BrandStoreCta } from "@/components/home/BrandStoreCta";
import { SECTION_TITLES } from "@/constants/home";

export default async function HomePage() {
  const newProducts = await getNewProducts();
  const bestSellers = await getBestSellers();

  return (
    <>
      <HeroSection />
      <div className="max-w-content mx-auto px-6 lg:px-12">
        <div className="h-px bg-pb-light-gray/40" />
      </div>
      <ProductGridSection
        title={SECTION_TITLES.newIn}
        products={newProducts}
        viewAllHref="/shop"
      />
      <BrandStoreCta />
      <ProductGridSection
        title={SECTION_TITLES.bestSellers}
        products={bestSellers}
        viewAllHref="/shop"
        variant="horizontal"
      />
    </>
  );
}

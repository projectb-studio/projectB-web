import { getNewProducts, getBestSellers } from "@/lib/data/products";
import { getHeroData } from "@/lib/data/hero";
import { HeroSection } from "@/components/home/HeroSection";
import { ProductGridSection } from "@/components/home/ProductGridSection";
import { BrandStoreCta } from "@/components/home/BrandStoreCta";
import { Newsletter } from "@/components/home/Newsletter";
import { SECTION_TITLES } from "@/constants/home";

export default async function HomePage() {
  const [newProducts, bestSellers, heroData] = await Promise.all([
    getNewProducts(),
    getBestSellers(),
    getHeroData(),
  ]);

  return (
    <>
      <HeroSection data={heroData} />
      <ProductGridSection
        title={SECTION_TITLES.newIn}
        products={newProducts}
        viewAllHref="/category"
      />
      <BrandStoreCta />
      <ProductGridSection
        title={SECTION_TITLES.bestSellers}
        products={bestSellers}
        viewAllHref="/category"
        variant="horizontal"
      />
      <Newsletter />
    </>
  );
}

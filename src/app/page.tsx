import Link from "next/link";

/**
 * Project B — Home page.
 * Structure follows the wireframe: Hero → Featured → Categories → Store Location CTA.
 */
export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[70vh] lg:h-[85vh] bg-[var(--pb-off-white)] flex items-center justify-center">
        {/* TODO: Replace with actual hero image */}
        <div className="text-center px-4">
          <h1 className="heading-display text-3xl lg:text-5xl mb-4 tracking-[0.3em]">
            PROJECT B
          </h1>
          <p className="text-sm lg:text-base text-[var(--pb-gray)] tracking-[0.15em] uppercase mb-8">
            Handcrafted accessories & lifestyle goods
          </p>
          <Link href="/shop" className="btn-primary">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="heading-section text-center text-sm mb-12">
          Featured
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* TODO: Replace with actual product cards */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="product-image bg-[var(--pb-off-white)] mb-3" />
              <p className="text-xs text-[var(--pb-gray)] tracking-[0.1em] uppercase mb-1">
                Category
              </p>
              <p className="text-sm font-medium mb-1">Product Name</p>
              <p className="text-sm">₩00,000</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="divider max-w-content mx-auto" />

      {/* Store Location CTA */}
      <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="heading-section text-sm mb-4">Visit Our Store</h2>
        <p className="text-[var(--pb-gray)] text-sm mb-8 max-w-md mx-auto">
          직접 보고, 만지고, 느껴보세요.
          <br />
          오프라인 매장에서 모든 제품을 경험할 수 있습니다.
        </p>
        <Link href="/store-location" className="btn-secondary">
          Store Location
        </Link>
      </section>
    </>
  );
}

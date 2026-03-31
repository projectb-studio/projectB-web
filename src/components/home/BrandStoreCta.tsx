import Link from "next/link";
import { BRAND_STORE_CTA } from "@/constants/home";

export function BrandStoreCta() {
  const { store, brand } = BRAND_STORE_CTA;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2">
      {/* Store card — dark */}
      <div className="bg-pb-jet-black text-white min-h-[320px] lg:min-h-[400px] flex flex-col justify-between p-8 lg:p-12">
        <h2 className="heading-section text-white whitespace-pre-line">
          {store.title}
        </h2>
        <div>
          <p className="text-sm text-white/70 mb-6 leading-relaxed max-w-xs whitespace-pre-line">
            {store.description}
          </p>
          <Link
            href={store.cta.href}
            className="inline-block border border-white text-white text-xs font-medium tracking-industrial uppercase px-6 py-3 hover:bg-white hover:text-pb-jet-black transition-colors"
          >
            {store.cta.label}
          </Link>
        </div>
      </div>

      {/* Brand card — light */}
      <div className="bg-pb-off-white text-pb-jet-black min-h-[320px] lg:min-h-[400px] flex flex-col justify-between p-8 lg:p-12">
        <h2 className="heading-section whitespace-pre-line">
          {brand.title}
        </h2>
        <div>
          <p className="text-sm text-pb-charcoal mb-6 leading-relaxed max-w-xs whitespace-pre-line">
            {brand.description}
          </p>
          <Link
            href={brand.cta.href}
            className="inline-block border border-pb-jet-black text-pb-jet-black text-xs font-medium tracking-industrial uppercase px-6 py-3 hover:bg-pb-jet-black hover:text-white transition-colors"
          >
            {brand.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

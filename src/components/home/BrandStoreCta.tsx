import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND_STORE_CTA } from "@/constants/home";

export function BrandStoreCta() {
  const { store, brand } = BRAND_STORE_CTA;

  return (
    <section className="py-16 lg:py-24 px-6 lg:px-12 max-w-content mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Store card — dark */}
        <div className="bg-pb-jet-black text-white min-h-[360px] lg:min-h-[440px] flex flex-col justify-between p-10 lg:p-14">
          <h2 className="heading-section text-white whitespace-pre-line text-lg lg:text-xl">
            {store.title}
          </h2>
          <div>
            <p className="text-sm text-white/60 mb-8 leading-relaxed max-w-xs whitespace-pre-line">
              {store.description}
            </p>
            <Link
              href={store.cta.href}
              className="inline-flex items-center gap-2 border border-white/40 text-white text-xs font-medium tracking-industrial uppercase px-6 py-3 hover:bg-white hover:text-pb-jet-black transition-colors"
            >
              {store.cta.label}
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Brand card — light */}
        <div className="bg-pb-off-white text-pb-jet-black min-h-[360px] lg:min-h-[440px] flex flex-col justify-between p-10 lg:p-14">
          <h2 className="heading-section whitespace-pre-line text-lg lg:text-xl">
            {brand.title}
          </h2>
          <div>
            <p className="text-sm text-pb-charcoal/70 mb-8 leading-relaxed max-w-xs whitespace-pre-line">
              {brand.description}
            </p>
            <Link
              href={brand.cta.href}
              className="inline-flex items-center gap-2 border border-pb-jet-black/30 text-pb-jet-black text-xs font-medium tracking-industrial uppercase px-6 py-3 hover:bg-pb-jet-black hover:text-white transition-colors"
            >
              {brand.cta.label}
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

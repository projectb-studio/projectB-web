import Link from "next/link";
import { HERO_CONTENT } from "@/constants/home";

export function HeroSection() {
  return (
    <section className="relative h-[70vh] lg:h-[85vh] overflow-hidden bg-white">
      {/* Decorative vertical lines (desktop only) */}
      <div className="hidden lg:block absolute inset-y-0 left-1/4 w-px bg-pb-light-gray/50 pointer-events-none" />
      <div className="hidden lg:block absolute inset-y-0 right-1/4 w-px bg-pb-light-gray/50 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center max-w-content mx-auto">
        {/* Thin decorative line above heading */}
        <div className="w-8 h-px bg-pb-light-gray mb-8 lg:mb-12" />

        <h1 className="heading-display text-5xl lg:text-8xl text-pb-jet-black mb-6 lg:mb-8">
          {HERO_CONTENT.heading}
        </h1>
        <p className="text-xs lg:text-sm text-pb-gray tracking-[0.3em] uppercase mb-10 lg:mb-14 max-w-xs lg:max-w-sm">
          {HERO_CONTENT.subtext}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
          {/* Primary CTA */}
          <Link
            href={HERO_CONTENT.primaryCta.href}
            className="inline-flex items-center justify-center bg-pb-jet-black text-white px-10 py-4 text-[11px] font-semibold font-heading tracking-[0.2em] uppercase hover:bg-pb-charcoal transition-colors"
          >
            {HERO_CONTENT.primaryCta.label}
          </Link>
          {/* Secondary CTA */}
          <Link
            href={HERO_CONTENT.secondaryCta.href}
            className="inline-flex items-center justify-center border border-pb-light-gray text-pb-jet-black px-10 py-4 text-[11px] font-semibold font-heading tracking-[0.2em] uppercase hover:border-pb-jet-black transition-colors"
          >
            {HERO_CONTENT.secondaryCta.label}
          </Link>
        </div>

        {/* Thin decorative line below CTAs */}
        <div className="w-8 h-px bg-pb-light-gray mt-8 lg:mt-12" />
      </div>
    </section>
  );
}

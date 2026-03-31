import Link from "next/link";
import { HERO_CONTENT } from "@/constants/home";

export function HeroSection() {
  return (
    <section className="relative h-[70vh] lg:h-[85vh] overflow-hidden bg-white">
      {/* Decorative vertical lines (desktop only) */}
      <div className="hidden lg:block absolute inset-y-0 left-1/4 w-px bg-pb-light-gray pointer-events-none" />
      <div className="hidden lg:block absolute inset-y-0 right-1/4 w-px bg-pb-light-gray pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <h1 className="heading-display text-4xl lg:text-7xl text-pb-jet-black mb-4 lg:mb-6">
          {HERO_CONTENT.heading}
        </h1>
        <p className="text-sm lg:text-base text-pb-gray tracking-industrial uppercase mb-8 lg:mb-12 max-w-sm lg:max-w-md">
          {HERO_CONTENT.subtext}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Primary CTA — black bg, white text */}
          <Link
            href={HERO_CONTENT.primaryCta.href}
            className="inline-flex items-center justify-center bg-pb-jet-black text-white px-8 py-3.5 text-xs font-semibold font-heading tracking-industrial uppercase hover:bg-pb-charcoal transition-colors"
          >
            {HERO_CONTENT.primaryCta.label}
          </Link>
          {/* Secondary CTA — black border variant */}
          <Link
            href={HERO_CONTENT.secondaryCta.href}
            className="inline-flex items-center justify-center border border-pb-jet-black text-pb-jet-black px-8 py-3.5 text-xs font-semibold font-heading tracking-industrial uppercase hover:bg-pb-jet-black hover:text-white transition-colors"
          >
            {HERO_CONTENT.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

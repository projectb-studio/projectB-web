import Link from "next/link";
import { HERO_CONTENT } from "@/constants/home";

export function HeroSection() {
  return (
    <section className="relative h-[70vh] lg:h-[85vh] overflow-hidden bg-gradient-to-br from-pb-rich-black to-pb-jet-black">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Figma decorative vertical lines (desktop only) */}
      <div className="hidden lg:block absolute inset-y-0 left-1/4 w-px bg-white/10 pointer-events-none" />
      <div className="hidden lg:block absolute inset-y-0 right-1/4 w-px bg-white/10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center text-white">
        <h1 className="heading-display text-4xl lg:text-7xl text-white mb-4 lg:mb-6">
          {HERO_CONTENT.heading}
        </h1>
        <p className="text-sm lg:text-base text-white/80 tracking-industrial uppercase mb-8 lg:mb-12 max-w-sm lg:max-w-md">
          {HERO_CONTENT.subtext}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Primary CTA — inverted for hero: white bg, black text */}
          <Link
            href={HERO_CONTENT.primaryCta.href}
            className="inline-flex items-center justify-center bg-white text-pb-jet-black px-8 py-3.5 text-xs font-semibold font-heading tracking-industrial uppercase hover:bg-pb-off-white transition-colors"
          >
            {HERO_CONTENT.primaryCta.label}
          </Link>
          {/* Secondary CTA — white border variant */}
          <Link
            href={HERO_CONTENT.secondaryCta.href}
            className="inline-flex items-center justify-center border border-white text-white px-8 py-3.5 text-xs font-semibold font-heading tracking-industrial uppercase hover:bg-white hover:text-pb-jet-black transition-colors"
          >
            {HERO_CONTENT.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

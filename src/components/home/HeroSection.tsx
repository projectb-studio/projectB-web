"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { HeroData } from "@/lib/data/hero";

interface HeroSectionProps {
  data: HeroData;
}

export function HeroSection({ data }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideCount = data.slides.length;

  const nextSlide = useCallback(() => {
    if (slideCount === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (slideCount <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, slideCount]);

  return (
    <section className="relative h-screen overflow-hidden bg-black">
      {/* Background image slideshow */}
      {data.slides.map((slide, index) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: currentSlide === index ? 1 : 0 }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            className={`object-cover ${
              currentSlide === index ? "animate-ken-burns" : ""
            }`}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        {/* Brand name — large, light */}
        <h1 className="heading-display text-[15vw] lg:text-[12vw] leading-[0.9] text-white/20 mb-4 lg:mb-6 select-none">
          {data.heading}
        </h1>

        {/* Subtext — subtle */}
        <p className="text-xs lg:text-sm text-white/50 tracking-[0.3em] uppercase mb-12 lg:mb-16 max-w-xs lg:max-w-md font-light">
          {data.subheading}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
          <Link
            href={data.primaryCta.href}
            className="inline-flex items-center justify-center bg-white/90 text-black px-10 py-4 text-[11px] font-semibold font-heading tracking-[0.2em] uppercase hover:bg-white transition-colors backdrop-blur-sm"
          >
            {data.primaryCta.label}
          </Link>
          <Link
            href={data.secondaryCta.href}
            className="inline-flex items-center justify-center border border-white/40 text-white/80 px-10 py-4 text-[11px] font-semibold font-heading tracking-[0.2em] uppercase hover:border-white hover:text-white transition-colors backdrop-blur-sm"
          >
            {data.secondaryCta.label}
          </Link>
        </div>

        {/* Slide indicators */}
        {data.slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {data.slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-8 h-[2px] transition-all duration-500 ${
                  currentSlide === index ? "bg-white/80" : "bg-white/25"
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

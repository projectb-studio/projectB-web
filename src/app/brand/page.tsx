import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brand Story",
  description: "PROJECT B의 이야기를 소개합니다.",
};

const VALUES = [
  {
    title: "Designed with care",
    description:
      "Every piece begins with careful thought — form, function, and feeling considered equally. We design objects that earn their place in your everyday life.",
  },
  {
    title: "Made by hand",
    description:
      "Our artisans bring decades of experience to each creation. The subtle imperfections in every handmade piece are not flaws — they are signatures.",
  },
  {
    title: "Built to last",
    description:
      "We choose materials for their character and endurance. Quality over quantity — fewer things, better made, kept for longer.",
  },
] as const;

export default function BrandPage() {
  return (
    <>
      {/* Hero */}
      <div className="bg-pb-off-white py-20 lg:py-32">
        <div className="max-w-content mx-auto px-6 lg:px-12 text-center">
          <p className="text-[10px] text-pb-silver uppercase tracking-[0.3em] mb-6">
            Our Story
          </p>
          <h1 className="heading-display text-3xl lg:text-5xl tracking-wide">
            PROJECT B
          </h1>
        </div>
      </div>

      {/* Story */}
      <section className="max-w-[560px] mx-auto px-6 py-16 lg:py-24">
        <div className="space-y-6 text-sm text-pb-charcoal leading-relaxed text-center">
          <p>
            PROJECT B는 손으로 만든 것들의 가치를 믿습니다.
            대량 생산의 시대에, 우리는 한 사람의 손길이 닿은
            물건이 가진 고유한 아름다움을 이야기합니다.
          </p>
          <p>
            서울의 작은 작업실에서 시작된 PROJECT B는
            도자기, 패브릭, 금속, 목재, 유리 등 다양한 소재로
            일상을 풍요롭게 하는 소품들을 만듭니다.
          </p>
          <p>
            하나하나 직접 만든 제품에는 기계가 흉내 낼 수 없는
            따뜻함이 담겨 있습니다. 그 작은 차이가 공간을, 그리고
            일상을 바꾸는 힘이 있다고 믿습니다.
          </p>
        </div>
      </section>

      {/* Image */}
      <div className="max-w-content mx-auto px-6 lg:px-12">
        <div className="relative w-full aspect-[21/9] bg-pb-off-white overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&h=600&fit=crop&crop=center"
            alt="PROJECT B workshop"
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </div>
      </div>

      {/* Values — 3-column grid */}
      <section className="max-w-content mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {VALUES.map((value) => (
            <div key={value.title} className="text-center">
              <h3 className="text-xs font-heading font-semibold uppercase tracking-industrial mb-4">
                {value.title}
              </h3>
              <p className="text-sm text-pb-charcoal leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="bg-pb-off-white py-16 lg:py-20 text-center">
        <p className="text-xs text-pb-gray uppercase tracking-industrial mb-6">
          Discover our collection
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/shop" className="btn-primary">
            Shop Online
          </Link>
          <Link href="/store-location" className="btn-secondary">
            Visit Store
          </Link>
        </div>
      </div>
    </>
  );
}

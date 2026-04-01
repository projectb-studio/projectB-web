import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brand Story",
  description: "PROJECT B의 이야기를 소개합니다.",
};

const VALUES = [
  {
    title: "Premium Fabric",
    description:
      "퍼, 무스탕, 레더, 나일론, 면까지. 의류에 쓰이는 프리미엄 소재를 공간 소품에 입혀 질감이 살아있는 새로운 경험을 만듭니다.",
  },
  {
    title: "Styled with Care",
    description:
      "오랜 시간 원단과 컬러를 다뤄온 전문가의 안목으로 공간을 스타일링합니다. 트렌디하면서도 편안한 무드를 제안합니다.",
  },
  {
    title: "Blessing Your Space",
    description:
      "당신이 머무는 모든 공간에 축복 같은 따뜻함이 깃들기를 바라는 마음. 일상을 가장 당신답게 만드는 맞춤옷입니다.",
  },
] as const;

export default function BrandPage() {
  return (
    <>
      {/* Hero */}
      <div className="bg-pb-off-white py-20 lg:py-32">
        <div className="max-w-content mx-auto px-6 lg:px-12 text-center">
          <p className="text-[10px] text-pb-silver uppercase tracking-[0.3em] mb-6">
            Blessing Project
          </p>
          <h1 className="heading-display text-3xl lg:text-5xl tracking-wide">
            PROJECT B
          </h1>
        </div>
      </div>

      {/* Story */}
      <section className="max-w-[640px] mx-auto px-6 py-16 lg:py-24">
        <h2 className="text-base lg:text-lg font-medium text-center mb-10 leading-snug">
          공간에 입히는 나만의 감각, projectB
        </h2>
        <div className="space-y-8 text-sm text-pb-charcoal leading-[1.9]">
          <p>
            사람의 분위기를 결정하는 것이 &lsquo;옷&rsquo;이라면, 공간의 무드를 완성하는 것은 &lsquo;소품&rsquo;입니다.
            projectB는 평범하게 놓여진 일상 속 오브제들에 가장 트렌디하고 감각적인 옷을 입혀주는 라이프스타일 브랜드입니다.
          </p>
          <p>
            오랜 시간 의류 도매를 전개하며 원단과 컬러를 다뤄온 전문가의 섬세한 안목으로 공간을 스타일링합니다.
            따뜻하고 풍성한 퍼(Fur)와 무스탕, 시크한 레더부터 바스락거리는 나일론과 편안한 면 소재까지.
            옷을 지을 때 사용하는 프리미엄 소재들을 공간 속으로 가져왔습니다.
          </p>
          <p>
            밋밋했던 티슈케이스에는 포근한 아우터를 입히고, 매일 일상에서 걸치는 앞치마와 잠옷에는 핏과 질감이 살아있는 감각을 더해
            완전히 새로운 무드로 재해석합니다. 매일 입는 옷처럼 편안하면서도, 특별한 날의 OOTD처럼 시선을 사로잡는 매력적인 텍스처를 경험해 보세요.
          </p>
          <p>
            우리의 이름인 <strong>&lsquo;Blessing Project&rsquo;</strong>에는 당신이 머무는 모든 공간에 축복 같은 따뜻함과 기분 좋은 변화가 깃들기를 바라는 마음을 담았습니다.
          </p>
          <p className="text-pb-gray">
            질감이 살아있는 패브릭, 세련된 컬러감, 그리고 뻔하지 않은 디자인.<br />
            당신의 공간과 일상이 가장 당신다워질 수 있도록, projectB가 딱 맞는 맞춤옷을 제안합니다.
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

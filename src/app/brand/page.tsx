import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brand Story",
  description: "공간에 입히는 나만의 감각, projectB — Blessing Project",
};

const MATERIALS = [
  {
    name: "Fur & Mouton",
    imageUrl: "https://images.unsplash.com/photo-1578996953841-b187dbe4bc8a?w=400&h=500&fit=crop&crop=center",
  },
  {
    name: "Leather",
    imageUrl: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=400&h=500&fit=crop&crop=center",
  },
  {
    name: "Nylon & Cotton",
    imageUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=500&fit=crop&crop=center",
  },
] as const;

export default function BrandPage() {
  return (
    <>
      {/* Section 1: Hero */}
      <section className="relative min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center bg-pb-off-white overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&h=900&fit=crop&crop=center"
          alt="PROJECT B space"
          fill
          className="object-cover opacity-30"
          sizes="100vw"
          priority
        />
        <div className="relative z-10 text-center px-6">
          <p className="text-[10px] text-pb-silver uppercase tracking-[0.3em] mb-6 animate-fade-in">
            Blessing Project
          </p>
          <h1 className="heading-display text-3xl lg:text-5xl tracking-wide mb-8 animate-fade-in">
            PROJECT B
          </h1>
          <p className="text-sm lg:text-base text-pb-charcoal max-w-md mx-auto leading-relaxed animate-fade-in">
            공간에 입히는 나만의 감각, projectB
          </p>
        </div>
      </section>

      {/* Section 2: Brand Story */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[520px] mx-auto px-6 text-center">
          <div className="space-y-10 text-sm lg:text-[15px] text-pb-charcoal leading-[2]">
            <p>
              사람의 분위기를 결정하는 것이 &lsquo;옷&rsquo;이라면,<br />
              공간의 무드를 완성하는 것은 &lsquo;소품&rsquo;입니다.
            </p>
            <p>
              projectB는 평범하게 놓여진 일상 속 오브제들에<br />
              가장 트렌디하고 감각적인 옷을 입혀주는<br />
              라이프스타일 브랜드입니다.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Material Highlight */}
      <section className="bg-pb-off-white py-20 lg:py-28">
        <div className="max-w-content mx-auto px-6 lg:px-12">
          {/* Material gallery */}
          <div className="grid grid-cols-3 gap-3 lg:gap-6 mb-16 lg:mb-20">
            {MATERIALS.map((mat) => (
              <div key={mat.name} className="relative aspect-[4/5] bg-pb-light-gray overflow-hidden group">
                <Image
                  src={mat.imageUrl}
                  alt={mat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 33vw, 400px"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent p-4">
                  <p className="text-[10px] text-white/80 uppercase tracking-[0.2em] font-heading">
                    {mat.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Story text */}
          <div className="max-w-[560px] mx-auto text-center space-y-10 text-sm lg:text-[15px] text-pb-charcoal leading-[2]">
            <p>
              오랜 시간 의류 도매를 전개하며 원단과 컬러를 다뤄온<br />
              전문가의 섬세한 안목으로 공간을 스타일링합니다.
            </p>
            <p>
              따뜻하고 풍성한 퍼(Fur)와 무스탕, 시크한 레더부터<br />
              바스락거리는 나일론과 편안한 면 소재까지.<br />
              옷을 지을 때 사용하는 프리미엄 소재들을 공간 속으로 가져왔습니다.
            </p>
            <p>
              밋밋했던 티슈케이스에는 포근한 아우터를 입히고,<br />
              매일 일상에서 걸치는 앞치마와 잠옷에는<br />
              핏과 질감이 살아있는 감각을 더해 완전히 새로운 무드로 재해석합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Vision & Closing */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[520px] mx-auto px-6 text-center space-y-10">
          <p className="text-base lg:text-lg text-pb-charcoal leading-[2]">
            우리의 이름인 <strong className="font-semibold">&lsquo;Blessing Project&rsquo;</strong>에는<br />
            당신이 머무는 모든 공간에 축복 같은 따뜻함과<br />
            기분 좋은 변화가 깃들기를 바라는 마음을 담았습니다.
          </p>

          <div className="w-8 h-px bg-pb-light-gray mx-auto" />

          <p className="text-sm lg:text-[15px] text-pb-gray leading-[2]">
            질감이 살아있는 패브릭, 세련된 컬러감, 그리고 뻔하지 않은 디자인.<br />
            당신의 공간과 일상이 가장 당신다워질 수 있도록,<br />
            projectB가 딱 맞는 맞춤옷을 제안합니다.
          </p>
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

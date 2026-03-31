import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand Story",
  description: "PROJECT B의 이야기를 소개합니다.",
};

export default function BrandPage() {
  return (
    <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="heading-section text-sm text-center mb-16">
        Brand Story
      </h1>
      {/* TODO: Brand story content with editorial layout */}
      <p className="text-center text-[var(--pb-gray)] text-sm">
        브랜드 스토리 준비 중입니다.
      </p>
    </section>
  );
}

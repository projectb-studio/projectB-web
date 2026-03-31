import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Magazine",
  description: "PROJECT B의 이야기와 소식을 전합니다.",
};

export default function MagazinePage() {
  return (
    <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="heading-section text-sm text-center mb-12">Magazine</h1>
      {/* TODO: Blog post grid */}
      <p className="text-center text-[var(--pb-gray)] text-sm">매거진 준비 중입니다.</p>
    </section>
  );
}

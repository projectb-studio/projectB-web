import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Reviews",
  description: "고객님들의 생생한 포토 리뷰를 확인하세요.",
};

export default function ReviewsPage() {
  return (
    <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="heading-section text-sm text-center mb-12">Photo Reviews</h1>
      {/* TODO: Photo review masonry grid */}
      <p className="text-center text-[var(--pb-gray)] text-sm">리뷰 준비 중입니다.</p>
    </section>
  );
}

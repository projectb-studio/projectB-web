import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공지사항",
  description: "PROJECT B의 공지사항과 이벤트 소식",
};

export default function NoticePage() {
  return (
    <section className="max-w-narrow mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="heading-section text-sm text-center mb-12">Notice & Events</h1>
      {/* TODO: Tab (Notice / Events) + Post list */}
      <p className="text-center text-[var(--pb-gray)] text-sm">공지사항 준비 중입니다.</p>
    </section>
  );
}

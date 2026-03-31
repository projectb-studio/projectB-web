import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store Location",
  description: "PROJECT B 오프라인 매장 위치와 운영 시간을 확인하세요.",
};

export default function StoreLocationPage() {
  return (
    <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="heading-section text-sm text-center mb-12">
        Store Location
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Map */}
        <div className="aspect-square lg:aspect-auto lg:h-[500px] bg-[var(--pb-off-white)] flex items-center justify-center">
          {/* TODO: Kakao Map or Naver Map embed */}
          <p className="text-[var(--pb-gray)] text-sm">Map</p>
        </div>

        {/* Store info */}
        <div className="flex flex-col justify-center">
          <h2 className="heading-display text-lg mb-6 tracking-[0.2em]">
            PROJECT B STORE
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[var(--pb-gray)] text-xs tracking-[0.1em] uppercase mb-1">
                Address
              </p>
              <p>서울특별시 ○○구 ○○로 000</p>
            </div>
            <div>
              <p className="text-[var(--pb-gray)] text-xs tracking-[0.1em] uppercase mb-1">
                Hours
              </p>
              <p>MON — SAT 11:00 — 20:00</p>
              <p>SUN & HOLIDAYS CLOSED</p>
            </div>
            <div>
              <p className="text-[var(--pb-gray)] text-xs tracking-[0.1em] uppercase mb-1">
                Contact
              </p>
              <p>02-0000-0000</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

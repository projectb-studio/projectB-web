import type { Metadata } from "next";
import { Clock, MapPin, Phone, MessageCircle } from "lucide-react";
import { STORE_INFO } from "@/constants/site";
import { MapPlaceholder } from "@/components/store/MapPlaceholder";

export const metadata: Metadata = {
  title: "Store Location",
  description: "PROJECT B 오프라인 매장 위치와 운영 시간을 확인하세요.",
};

export default function StoreLocationPage() {
  const directionsUrl = `https://map.kakao.com/link/to/PROJECT B,${encodeURIComponent(STORE_INFO.address)}`;
  const kakaoTalkUrl = `https://pf.kakao.com/${STORE_INFO.kakao}`;

  return (
    <>
      {/* Header banner */}
      <div className="bg-pb-jet-black py-16 lg:py-24">
        <div className="max-w-content mx-auto px-6 lg:px-12 text-center">
          <h1 className="heading-display text-2xl lg:text-3xl text-pb-snow tracking-wide">
            Visit Us
          </h1>
          <p className="text-sm text-pb-silver mt-4 tracking-industrial uppercase">
            Experience our craft in person
          </p>
        </div>
      </div>

      <section className="max-w-content mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Map */}
          <MapPlaceholder query={STORE_INFO.mapQuery} />

          {/* Store info */}
          <div className="flex flex-col justify-center">
            <h2 className="heading-display text-lg mb-10 tracking-wide">
              {STORE_INFO.name}
            </h2>

            <div className="space-y-8">
              {/* Address */}
              <div className="flex gap-4">
                <MapPin size={16} strokeWidth={1.5} className="text-pb-silver mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-pb-silver uppercase tracking-industrial mb-1.5">
                    Address
                  </p>
                  <p className="text-sm">{STORE_INFO.address}</p>
                  <p className="text-xs text-pb-gray mt-0.5">{STORE_INFO.addressEn}</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4">
                <Clock size={16} strokeWidth={1.5} className="text-pb-silver mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-pb-silver uppercase tracking-industrial mb-1.5">
                    Hours
                  </p>
                  {STORE_INFO.hours.map((h) => (
                    <p key={h.days} className="text-sm">
                      <span className="font-medium">{h.days}</span>{" "}
                      <span className="text-pb-gray">{h.time}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <Phone size={16} strokeWidth={1.5} className="text-pb-silver mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-pb-silver uppercase tracking-industrial mb-1.5">
                    Contact
                  </p>
                  <a
                    href={`tel:${STORE_INFO.phone}`}
                    className="text-sm hover:text-pb-gray transition-colors"
                  >
                    {STORE_INFO.phone}
                  </a>
                </div>
              </div>

              {/* KakaoTalk */}
              <div className="flex gap-4">
                <MessageCircle size={16} strokeWidth={1.5} className="text-pb-silver mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-pb-silver uppercase tracking-industrial mb-1.5">
                    KakaoTalk
                  </p>
                  <p className="text-sm">{STORE_INFO.kakao}</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-pb-light-gray/40 my-10" />

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-center"
              >
                Get Directions
              </a>
              <a
                href={kakaoTalkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-center"
              >
                KakaoTalk
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

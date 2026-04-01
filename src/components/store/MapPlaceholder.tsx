import { MapPin } from "lucide-react";

interface MapPlaceholderProps {
  query: string;
}

export function MapPlaceholder({ query }: MapPlaceholderProps) {
  const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(query)}`;

  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-[500px] bg-pb-off-white flex flex-col items-center justify-center gap-4">
      <MapPin size={32} strokeWidth={1} className="text-pb-silver" />
      <p className="text-xs text-pb-silver uppercase tracking-industrial">
        Map preview
      </p>
      <a
        href={naverMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary text-[11px] px-5 py-2.5"
      >
        Open in Naver Map
      </a>
      <p className="text-[10px] text-pb-silver mt-2">
        카카오맵 API 키 세팅 후 지도가 표시됩니다
      </p>
    </div>
  );
}

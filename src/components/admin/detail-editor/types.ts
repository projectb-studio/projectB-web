import type { Block } from "@/lib/detail-blocks/schema";

export type { Block };
export type BlockType = Block["type"];

export const BLOCK_LABELS: Record<BlockType, string> = {
  image: "단일 이미지",
  gallery: "이미지 갤러리",
  richtext: "리치 텍스트",
  twocol: "2단 컬럼",
  spec: "스펙 표",
  care: "케어 안내",
  banner: "강조 배너",
  youtube: "유튜브",
};

export function emptyBlock(type: BlockType): Block {
  const id = crypto.randomUUID();
  switch (type) {
    case "image":
      return { id, type, data: { url: "", alt: "", width: "full" } };
    case "gallery":
      return { id, type, data: { images: [], columns: 2 } };
    case "richtext":
      return { id, type, data: { html: "" } };
    case "twocol":
      return {
        id,
        type,
        data: {
          image: { url: "", alt: "" },
          text: { html: "" },
          imageSide: "left",
        },
      };
    case "spec":
      return { id, type, data: { rows: [] } };
    case "care":
      return { id, type, data: { items: [] } };
    case "banner":
      return { id, type, data: { text: "", bgColor: "black", align: "center" } };
    case "youtube":
      return { id, type, data: { videoId: "" } };
  }
}

export function extractYoutubeId(s: string): string | null {
  const trimmed = s.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const m = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

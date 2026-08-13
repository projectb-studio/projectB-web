import type { Block } from "@/lib/detail-blocks/schema";

/**
 * 발행 전 플레이스홀더 게이트.
 *
 * 레시피는 사실값이 없을 때 값을 지어내지 않고 `[운영자 입력 필요]` 로 남긴다.
 * 그 상태로 발행되면 고객에게는 빈 칸이 그대로 노출된다. 상품정보제공고시
 * 일반원칙 3 은 정보를 제공할 수 없는 항목이 있으면 **그 구체적인 사유를 제시**
 * 하도록 요구하므로, 사유 없는 공란 게시는 그 자체로 위반이다.
 *
 * 그래서 이건 품질 경고가 아니라 **발행 차단**이다.
 */

export const PLACEHOLDER_MARK = "[운영자 입력 필요]";

export interface PlaceholderHit {
  blockId: string;
  blockType: Block["type"];
  /** 무엇을 채워야 하는지 — 스펙 행 라벨, 케어 항목 등 */
  label: string;
}

export class PlaceholderError extends Error {
  constructor(readonly placeholders: PlaceholderHit[]) {
    const labels = placeholders.map((p) => p.label).join(", ");
    super(
      `아직 채우지 않은 필수 항목이 있어 발행할 수 없습니다: ${labels}. ` +
        `값을 모르면 빈칸으로 두지 말고 사유를 적어주세요.`
    );
    this.name = "PlaceholderError";
  }
}

function has(text: string): boolean {
  return text.includes(PLACEHOLDER_MARK);
}

export function findPlaceholders(blocks: Block[]): PlaceholderHit[] {
  const hits: PlaceholderHit[] = [];

  for (const b of blocks) {
    const at = (label: string) =>
      hits.push({ blockId: b.id, blockType: b.type, label });

    switch (b.type) {
      case "spec":
        for (const row of b.data.rows) {
          if (has(row.value)) at(row.label);
        }
        break;
      case "care":
        for (const item of b.data.items) {
          if (has(item.text)) at("케어 항목");
        }
        break;
      case "richtext":
        if (has(b.data.html)) at("본문");
        break;
      case "twocol":
        if (has(b.data.text.html)) at("본문(2단)");
        break;
      case "banner":
        if (has(b.data.text)) at("배너 문구");
        break;
      case "image":
        if (has(b.data.caption ?? "")) at("이미지 캡션");
        break;
      default:
        break;
    }
  }

  return hits;
}

export function assertPublishable(blocks: Block[]): void {
  const hits = findPlaceholders(blocks);
  if (hits.length > 0) throw new PlaceholderError(hits);
}

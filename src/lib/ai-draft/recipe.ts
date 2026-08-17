import type { Block } from "@/lib/detail-blocks/schema";
import { BlocksSchema } from "@/lib/detail-blocks/schema";
import { sanitizeRichText } from "@/lib/detail-blocks/sanitize";
import {
  noticeRowsFor,
  resolveNoticeCategory,
  TRADE_TERMS_SECTIONS,
  NOTICE_PLACEHOLDER,
} from "@/lib/ai-draft/notice-categories";

/**
 * 상세페이지 레시피 — "소품 에디토리얼 v1"
 *
 * 한국 옷/소품 상세페이지 표준 흐름(후킹 → 컨셉·공감 → 핵심포인트(기능→혜택)
 * → 디테일컷 → 스펙 → 케어 → 배송/교환반품)을 고정 섹션 시퀀스로 코드화한다.
 *
 * 환각 격리의 핵심:
 *   - fact 슬롯(spec/care/shipping): 운영자가 입력한 DB 값에서만 구성. 모델은 값을 생성하지 않는다.
 *   - image 슬롯(hero/points/gallery): 이미 업로드된 상품 이미지만 "배치". 모델은 사진을 만들지 않는다.
 *   - voice 슬롯(hero_caption/concept/point copy): 모델이 카피를 생성 (주관적 → 환각 위험 낮음).
 *
 * 따라서 stub 든 LLM 이든 동일한 슬롯 구조를 채우고, 운영자 검수는
 * "레이아웃 고치기"가 아니라 "카피 사실 검증 + 빈 사실값 채우기"로 좁혀진다.
 */
export const RECIPE_VERSION = "soft-goods-editorial-v2";

/** 사실값이 비어 있을 때 운영자 입력을 유도하는 플레이스홀더 */
export const FACT_PLACEHOLDER = NOTICE_PLACEHOLDER;

/**
 * 수작업 특성상 개체차가 있다는 고지. 법정 의무는 아니지만 핸드메이드 CS 의
 * 최대 분쟁 원인이라 고정 문구로 넣는다. 사실이 아니라 상품 특성 설명이므로
 * 플레이스홀더가 아니다.
 */
const HANDMADE_VARIANCE_TEXT =
  "<p>하나씩 손으로 만들어 색과 크기, 표면 질감에 약간의 차이가 있을 수 있습니다. " +
  "이는 불량이 아니라 수작업 제품의 특성입니다.</p>";

/** 모델이 생성하는 보이스 카피 (사실값 제외) */
export interface VoiceCopy {
  /** 후킹 한 줄 — v2 에서 "컨셉"이 아니라 "고객이 얻는 것"으로 정의를 바꿨다 */
  heroCaption: string;
  /** 컨셉·제작 스토리 (richtext html) */
  conceptHtml: string;
  /** 2~3개 핵심 포인트 */
  points: Array<{ title: string; bodyHtml: string }>;
  /**
   * 문제 공감 → 해결 (v2 신규). 국내 상세페이지 표준의 핵심 축인데 v1 에 없었다.
   * v1 초안과의 하위 호환을 위해 선택 필드로 둔다.
   */
  problemHtml?: string;
  /** 클로징 (v2 신규). 긴 상세 하단에서의 이탈을 막는다. */
  closingHtml?: string;
}

/** 상품 사실 데이터 (운영자가 입력한 DB 값 = 진실원천) */
export interface ProductFacts {
  name: string;
  price: number;
  tag: string;
  description: string | null;
  details: string | null; // 크기/무게/원산지 등
  care: string | null; // 관리 방법
  shipping: string | null; // 배송 안내
}

export interface AssembleInput {
  facts: ProductFacts;
  /** pb_product_images, sort_order 순. 모델은 이 목록을 배치만 한다. */
  imageUrls: string[];
  voice: VoiceCopy;
}

export interface AssembleResult {
  blocks: Block[];
  /** generation_meta 에 기록될 슬롯별 채움 내역 (감사/재현용) */
  meta: {
    recipeVersion: string;
    slots: Array<{ slot: string; filledWith: string }>;
    /** 운영자 입력을 권하는 사실 필드 (발행을 막지는 않음) */
    factsNeedingInput: string[];
    /** 적용된 고시 품목 */
    noticeCategory: string;
    /**
     * 법정 고지 중 값이 비어 있는 항목. 이건 권고가 아니라 **발행 차단 사유**다.
     * 고시 일반원칙 3 — 정보를 제공할 수 없으면 그 사유를 제시해야 한다.
     */
    legalGaps: string[];
  };
}

function uuid(): string {
  return crypto.randomUUID();
}

const CARE_ICON_RULES: Array<{ re: RegExp; icon: "wash" | "dry" | "iron" | "bleach" }> = [
  { re: /세탁|물세탁|손세탁|드라이/, icon: "wash" },
  { re: /건조|말리|널어/, icon: "dry" },
  { re: /다림질|다리미|스팀/, icon: "iron" },
  { re: /표백|락스/, icon: "bleach" },
];

function careIconFor(text: string): "wash" | "dry" | "iron" | "bleach" | "custom" {
  for (const rule of CARE_ICON_RULES) {
    if (rule.re.test(text)) return rule.icon;
  }
  return "custom";
}

/** 운영자가 쓴 자유 텍스트(details)를 "라벨: 값" 행으로 파싱. 값을 지어내지 않는다. */
function parseSpecRows(details: string | null): Array<{ label: string; value: string }> {
  if (!details) return [];
  return details
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return null;
      const label = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (!label || !value) return null;
      return { label, value };
    })
    .filter((r): r is { label: string; value: string } => r !== null)
    .slice(0, 30);
}

/** 운영자가 쓴 care 텍스트를 케어 항목으로 분해. 텍스트 출처는 DB(=사실). */
function parseCareItems(
  care: string | null
): Array<{ icon: "wash" | "dry" | "iron" | "bleach" | "custom"; text: string }> {
  if (!care) return [];
  return care
    .split(/\r?\n|·|•/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((text) => ({ icon: careIconFor(text), text }));
}

/**
 * 보이스 카피 + 상품 사실 + 이미지를 받아 최종 블록 배열을 조립한다.
 * 구조는 BlocksSchema 로 검증되며(부적합 시 throw), 이미지 출처 검증은
 * 발행 경계(approve)에서 sanitizeBlocks 가 다시 수행한다.
 */
export function assembleBlocks(input: AssembleInput): AssembleResult {
  const { facts, imageUrls, voice } = input;
  const blocks: Block[] = [];
  const slots: Array<{ slot: string; filledWith: string }> = [];
  const factsNeedingInput: string[] = [];

  // 이미지마다 다른 alt 를 준다 — 전부 상품명이면 SEO·접근성 모두 손해다.
  const altFor = (role: string, i?: number) =>
    i === undefined ? `${facts.name} ${role}` : `${facts.name} ${role} ${i + 1}`;

  // S1. 무드 메인컷 — 업로드 이미지가 있을 때만 (사진을 만들지 않음)
  let imgCursor = 0;
  if (imageUrls.length > 0) {
    blocks.push({
      id: uuid(),
      type: "image",
      data: { url: imageUrls[imgCursor], alt: altFor("메인 컷"), width: "full" },
    });
    slots.push({ slot: "hero", filledWith: "product-image[0]" });
    imgCursor += 1;
  } else {
    slots.push({ slot: "hero", filledWith: "skipped (no images)" });
  }

  // S2. 후킹 한 줄 — 보이스
  blocks.push({
    id: uuid(),
    type: "banner",
    data: { text: voice.heroCaption, bgColor: "black", align: "center" },
  });
  slots.push({ slot: "hero_caption", filledWith: "voice" });

  // S3. 컨셉·제작 스토리 — 보이스 (생성 시점에 sanitize 하여 초안도 항상 안전)
  blocks.push({
    id: uuid(),
    type: "richtext",
    data: { html: sanitizeRichText(voice.conceptHtml) },
  });
  slots.push({ slot: "concept", filledWith: "voice" });

  // S4. 문제 공감 → 해결 — 보이스 (v2 신규, 없으면 건너뛴다)
  if (voice.problemHtml?.trim()) {
    blocks.push({
      id: uuid(),
      type: "richtext",
      data: { html: sanitizeRichText(voice.problemHtml) },
    });
    slots.push({ slot: "problem_solution", filledWith: "voice" });
  } else {
    slots.push({ slot: "problem_solution", filledWith: "skipped (not generated)" });
  }

  // S5. 핵심 포인트 2~3 — 보이스 + (가능하면)이미지. 이미지 없으면 richtext 로 폴백.
  voice.points.slice(0, 3).forEach((p, i) => {
    const bodyHtml = sanitizeRichText(`<h3>${escapeHtml(p.title)}</h3>${p.bodyHtml}`);
    if (imgCursor < imageUrls.length) {
      blocks.push({
        id: uuid(),
        type: "twocol",
        data: {
          image: { url: imageUrls[imgCursor], alt: altFor("포인트 컷", i) },
          text: { html: bodyHtml },
          imageSide: i % 2 === 0 ? "left" : "right",
        },
      });
      slots.push({ slot: `point[${i}]`, filledWith: `voice + product-image[${imgCursor}]` });
      imgCursor += 1;
    } else {
      blocks.push({ id: uuid(), type: "richtext", data: { html: bodyHtml } });
      slots.push({ slot: `point[${i}]`, filledWith: "voice (no image)" });
    }
  });

  // S6. 디테일 갤러리 — 남은 이미지 배치만 (2장 이상일 때)
  const remaining = imageUrls.slice(imgCursor);
  if (remaining.length >= 2) {
    blocks.push({
      id: uuid(),
      type: "gallery",
      data: {
        images: remaining
          .slice(0, 20)
          .map((url, i) => ({ url, alt: altFor("디테일 컷", i) })),
        columns: remaining.length >= 6 ? 3 : 2,
      },
    });
    slots.push({ slot: "detail_gallery", filledWith: `product-image[${imgCursor}..]` });
  }

  // S7. 핸드메이드 고지 — 개체차는 상품 특성 설명이라 고정 문구(사실 아님).
  blocks.push({
    id: uuid(),
    type: "richtext",
    data: { html: sanitizeRichText(HANDMADE_VARIANCE_TEXT) },
  });
  slots.push({ slot: "handmade_notice", filledWith: "fixed" });

  // S8. 스펙 — DB(details) 사실값. 없으면 라벨만 스캐폴딩(값=플레이스홀더).
  const specRows = parseSpecRows(facts.details);
  if (specRows.length > 0) {
    blocks.push({ id: uuid(), type: "spec", data: { title: "PRODUCT SPEC", rows: specRows } });
    slots.push({ slot: "spec", filledWith: "db:details" });
  } else {
    blocks.push({
      id: uuid(),
      type: "spec",
      data: {
        title: "PRODUCT SPEC",
        rows: [
          { label: "소재", value: FACT_PLACEHOLDER },
          { label: "크기", value: FACT_PLACEHOLDER },
          { label: "원산지", value: FACT_PLACEHOLDER },
        ],
      },
    });
    slots.push({ slot: "spec", filledWith: "scaffold (labels only)" });
    factsNeedingInput.push("details(소재/크기/원산지)");
  }

  // S9. 케어 — DB(care) 사실값. 없으면 빈 항목 스캐폴딩.
  const careItems = parseCareItems(facts.care);
  if (careItems.length > 0) {
    blocks.push({ id: uuid(), type: "care", data: { items: careItems } });
    slots.push({ slot: "care", filledWith: "db:care" });
  } else {
    blocks.push({
      id: uuid(),
      type: "care",
      data: { items: [{ icon: "custom", text: FACT_PLACEHOLDER }] },
    });
    slots.push({ slot: "care", filledWith: "scaffold (empty)" });
    factsNeedingInput.push("care(세탁·관리 방법)");
  }

  // S10. 거래조건 — 법정 5개 대분류. DB(shipping) 값이 있으면 앞에 덧붙인다.
  const operatorShipping = facts.shipping?.trim()
    ? facts.shipping
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => `<p>${escapeHtml(l)}</p>`)
        .join("")
    : "";
  const tradeTermsHtml =
    operatorShipping +
    TRADE_TERMS_SECTIONS.map(
      (s) => `<p><strong>${escapeHtml(s.title)}</strong><br>${escapeHtml(s.body)}</p>`
    ).join("");
  blocks.push({
    id: uuid(),
    type: "richtext",
    data: { html: sanitizeRichText(tradeTermsHtml) },
  });
  slots.push({
    slot: "trade_terms",
    filledWith: facts.shipping?.trim() ? "db:shipping + legal" : "legal",
  });

  // S11. 상품정보제공고시 — 100% 사실 슬롯. 모델은 이 근처에 오지 않는다.
  const noticeRows = noticeRowsFor(facts);
  const category = resolveNoticeCategory(facts);
  blocks.push({
    id: uuid(),
    type: "spec",
    data: { title: `상품정보제공고시 ${category.label}`, rows: noticeRows },
  });
  slots.push({ slot: "legal_notice", filledWith: `db-only (${category.code})` });

  const legalGaps = noticeRows
    .filter((r) => r.value === FACT_PLACEHOLDER)
    .map((r) => r.label);

  // S12. 클로징 — 보이스 (없으면 건너뛴다)
  if (voice.closingHtml?.trim()) {
    blocks.push({
      id: uuid(),
      type: "richtext",
      data: { html: sanitizeRichText(voice.closingHtml) },
    });
    slots.push({ slot: "closing", filledWith: "voice" });
  } else {
    slots.push({ slot: "closing", filledWith: "skipped (not generated)" });
  }

  // 구조 검증 (이미지 출처 검증은 발행 경계에서 재수행)
  const validated = BlocksSchema.parse(blocks);

  return {
    blocks: validated,
    meta: {
      recipeVersion: RECIPE_VERSION,
      slots,
      factsNeedingInput,
      noticeCategory: category.code,
      legalGaps,
    },
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

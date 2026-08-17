import type { ProductFacts } from "@/lib/ai-draft/recipe";

/**
 * 상품정보제공고시 품목 매핑과 법정 필수항목 스캐폴딩.
 *
 * 근거: 「전자상거래 등에서의 상품 등의 정보제공에 관한 고시」
 * (공정거래위원회고시 제2020-14호). 상세는 docs/research/ai-draft-v2-research.md.
 *
 * 두 가지를 지킨다.
 *   1. **품목마다 필수항목이 다르다.** 고정 스펙표 하나로 갈음할 수 없다.
 *   2. **모르는 값을 지어내지 않는다.** 근거가 없으면 플레이스홀더로 남기고,
 *      그 상태로는 발행되지 않게 막는다(고시 일반원칙 3: 못 주면 사유를 제시).
 *
 * 한계: DB 에 고시 품목코드 컬럼이 없어 태그·상품명으로 추론한다. 모호하면
 * 고시가 정한 폴백인 (40) 기타 재화를 쓴다. 정확한 분류는 운영자가 검수에서
 * 확정하는 것을 전제로 한다.
 */

export const NOTICE_PLACEHOLDER = "[운영자 입력 필요]";

export interface NoticeRowSpec {
  label: string;
  /** details 자유 텍스트에서 이 라벨로 값을 찾을 때 쓸 별칭들 */
  aliases?: string[];
  /** facts 에서 직접 끌어올 값 */
  source?: "name" | "care";
}

export interface NoticeCategory {
  code: string;
  /** 고시상의 품목 번호와 이름 */
  label: string;
  rows: NoticeRowSpec[];
}

/** (17) 주방용품 */
const KITCHEN: NoticeCategory = {
  code: "kitchen",
  label: "(17) 주방용품",
  rows: [
    { label: "품명 및 모델명", source: "name" },
    { label: "재질", aliases: ["소재", "재료"] },
    { label: "구성품", aliases: ["구성", "세트구성"] },
    { label: "크기", aliases: ["사이즈", "치수", "규격"] },
    { label: "동일모델의 출시년월", aliases: ["출시년월", "출시일"] },
    { label: "제조자(수입자)", aliases: ["제조자", "제조사", "수입자"] },
    { label: "제조국", aliases: ["원산지", "생산국"] },
    { label: "품질보증기준" },
    { label: "A/S 책임자와 전화번호", aliases: ["A/S", "AS", "고객센터"] },
  ],
};

/** (5) 침구류·커튼 — 섬유 소품의 최근접 유사품목 */
const BEDDING: NoticeCategory = {
  code: "bedding",
  label: "(5) 침구류·커튼",
  rows: [
    { label: "제품 소재(혼용률)", aliases: ["소재", "재질", "혼용률"] },
    { label: "색상", aliases: ["컬러"] },
    { label: "치수", aliases: ["크기", "사이즈", "규격"] },
    { label: "제품구성", aliases: ["구성", "구성품"] },
    { label: "제조자(수입자)", aliases: ["제조자", "제조사", "수입자"] },
    { label: "제조국", aliases: ["원산지", "생산국"] },
    { label: "세탁방법 및 취급시 주의사항", source: "care", aliases: ["세탁", "관리"] },
    { label: "품질보증기준" },
    { label: "A/S 책임자와 전화번호", aliases: ["A/S", "AS", "고객센터"] },
  ],
};

/** (40) 기타 재화 — 유사 품목이 없을 때의 법정 폴백 */
const ETC: NoticeCategory = {
  code: "etc",
  label: "(40) 기타 재화",
  rows: [
    { label: "품명 및 모델명", source: "name" },
    { label: "인증·허가 사항", aliases: ["인증", "허가", "KC"] },
    { label: "제조국(원산지)", aliases: ["제조국", "원산지", "생산국"] },
    { label: "제조자(수입자)", aliases: ["제조자", "제조사", "수입자"] },
    { label: "A/S 책임자와 전화번호", aliases: ["A/S", "AS", "고객센터"] },
  ],
};

export const NOTICE_CATEGORIES: Record<string, NoticeCategory> = {
  kitchen: KITCHEN,
  bedding: BEDDING,
  etc: ETC,
};

/**
 * 주방 기물로 읽히는 상품명 키워드.
 *
 * 영문도 함께 본다 — 현재 등록 상품 다수가 영문명이라 한글 키워드만으로는
 * 트레이·도마·보울이 전부 기타재화로 빠진다. 기타재화는 필수항목이 더 적어서
 * 오분류가 곧 표시의무 누락이 되는, 위험한 방향의 실수다.
 */
const KITCHEN_NAME_HINTS = [
  // 한글
  "컵", "잔", "머그", "트레이", "도마", "그릇", "보울", "볼", "접시",
  "카라페", "저그", "커트러리", "수저", "포크", "티팟", "주전자", "핀치볼",
  // 영문. "dish"·"board" 처럼 넓은 낱말은 쓰지 않는다 —
  // soap dish(욕실용품)까지 주방용품으로 끌어와 불필요한 표시항목을 요구하게 된다.
  "cup", "mug", "glassware", "tray", "cutting board", "bowl",
  "plate", "carafe", "jug", "pitcher", "teapot", "kettle",
  "cutlery", "spoon", "fork", "coaster",
];

/**
 * 고시 품목을 정한다.
 *
 * 섬유(fabric)를 가장 먼저 본다 — 혼용률·세탁방법 표시의무가 가장 구체적이라
 * 다른 분류로 새면 표시의무가 누락되기 때문이다.
 */
export function resolveNoticeCategory(facts: ProductFacts): NoticeCategory {
  if (facts.tag === "fabric") return BEDDING;

  const name = facts.name.toLowerCase();
  if (facts.tag === "glass") return KITCHEN;
  if (KITCHEN_NAME_HINTS.some((h) => name.includes(h.toLowerCase()))) return KITCHEN;

  return ETC;
}

/** "라벨: 값" 형태의 자유 텍스트를 맵으로. 값을 지어내지 않는다. */
function parseLabeled(text: string | null): Map<string, string> {
  const map = new Map<string, string>();
  if (!text) return map;
  for (const line of text.split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const label = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (label && value) map.set(label, value);
  }
  return map;
}

function lookup(spec: NoticeRowSpec, parsed: Map<string, string>): string | null {
  const keys = [spec.label, ...(spec.aliases ?? [])];
  for (const k of keys) {
    const hit = parsed.get(k.toLowerCase());
    if (hit) return hit;
  }
  return null;
}

export interface NoticeRow {
  label: string;
  value: string;
}

/**
 * 법정 고지 행을 만든다.
 *
 * 값의 출처는 오직 운영자가 입력한 DB 값(name / details / care)이다.
 * 모델은 이 함수 근처에 오지 않는다 — 법정 고지에 환각이 섞이면 그대로 위법이다.
 */
export function noticeRowsFor(facts: ProductFacts): NoticeRow[] {
  const category = resolveNoticeCategory(facts);
  const parsed = parseLabeled(facts.details);

  return category.rows.map((spec) => {
    if (spec.source === "name") {
      return { label: spec.label, value: facts.name.trim() || NOTICE_PLACEHOLDER };
    }

    const fromDetails = lookup(spec, parsed);
    if (fromDetails) return { label: spec.label, value: fromDetails };

    if (spec.source === "care" && facts.care?.trim()) {
      const value = facts.care
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
        .join(" / ");
      if (value) return { label: spec.label, value };
    }

    return { label: spec.label, value: NOTICE_PLACEHOLDER };
  });
}

/**
 * 거래조건 정보 5개 대분류 — 품목과 무관하게 전 상품 공통 필수.
 *
 * 값이 확정되지 않은 자리는 플레이스홀더로 남겨 운영자가 채우게 한다.
 * (배송사·A/S 번호·환불 계좌 절차 등은 사업자 정보라 상품 데이터에 없다.)
 */
export const TRADE_TERMS_SECTIONS: Array<{ title: string; body: string }> = [
  {
    title: "공급방법 및 공급시기",
    body:
      `배송방법: ${NOTICE_PLACEHOLDER} (택배사명) / ` +
      "주문 후 영업일 기준 2~3일 내 발송 / " +
      `배송비: ₩50,000 이상 무료, 미만 시 ${NOTICE_PLACEHOLDER} / ` +
      `도서산간 추가비용: ${NOTICE_PLACEHOLDER}`,
  },
  {
    title: "청약철회 및 계약 해제",
    body:
      "단순변심·착오구매: 수령 후 7일 이내 청약철회 가능, 왕복 배송비 고객 부담 / " +
      `청약철회가 제한되는 상품과 그 사유: ${NOTICE_PLACEHOLDER} / ` +
      "제품하자·오배송: 수령 후 3개월 이내, 반품비용은 판매자 부담",
  },
  {
    title: "교환·반품·보증 및 환불",
    body:
      "품질보증기준: 소비자기본법에 따른 소비자분쟁해결기준을 따릅니다 / " +
      `A/S 책임자 및 전화번호: ${NOTICE_PLACEHOLDER} / ` +
      "환불 방법: 결제수단 원복 환불 / " +
      "환불 지연 시 지연기간에 대한 지연배상금을 지급합니다",
  },
  {
    title: "소비자피해보상 및 분쟁처리",
    body:
      "소비자피해보상 및 불만 처리는 고객센터로 접수해 주시기 바랍니다 / " +
      `소비자상담 연락처: ${NOTICE_PLACEHOLDER} / ` +
      "소비자분쟁은 소비자기본법에 따른 소비자분쟁해결기준에 따라 처리합니다",
  },
  {
    title: "약관",
    body: "거래에 관한 약관은 사이트 하단 '이용약관'에서 확인하실 수 있습니다",
  },
];

import type { ProductFacts } from "@/lib/ai-draft/recipe";

/**
 * 카피 품질 평가용 상품 픽스처.
 *
 * DB 시드 상품 17건 중 16건이 동일한 영문 플레이스홀더(description/details/care 가
 * 전부 같은 문장)라 생성 품질의 변별력이 나오지 않는다. 그래서 평가는 DB 행이 아니라
 * 아래 픽스처로 한다 — 소재·용도·사실값 밀도가 서로 다르게 설계되어 있어
 * "입력이 달라지면 카피도 달라지는가"를 실제로 잴 수 있다.
 *
 * 마지막 두 건은 의도적 결핍 케이스다. 사실값이 없을 때 모델이 지어내지 않고
 * 플레이스홀더 경로로 빠지는지(환각 격리)를 검증한다.
 */
export interface EvalFixture {
  key: string;
  /** 이 픽스처가 무엇을 검증하려는지 */
  intent: string;
  facts: ProductFacts;
  imageCount: number;
  /** 카피에 절대 나오면 안 되는 사실 — 환각 탐지용. 입력에 없는 수치·소재. */
  forbiddenClaims: string[];
}

export const EVAL_FIXTURES: EvalFixture[] = [
  {
    key: "ceramic-vase",
    intent: "사실값이 충분한 표준 케이스. 감성 카피와 사실의 분리가 지켜지는가.",
    facts: {
      name: "무광 블랙 세라믹 화병",
      price: 38000,
      tag: "handmade",
      description:
        "물레로 하나씩 성형한 뒤 무광 블랙 유약을 입혀 두 번 구워낸 화병입니다. 한 송이만 꽂아도 형태가 살아납니다.",
      details:
        "소재: 석기질 도자\n크기: 지름 10cm × 높이 15cm\n무게: 약 250g\n원산지: 대한민국\n제작: 수작업 물레 성형",
      care: "부드러운 마른 천으로 닦아주세요\n식기세척기·전자레인지 사용 불가\n급격한 온도 변화 주의",
      shipping: null,
    },
    imageCount: 5,
    forbiddenClaims: ["방수", "전자레인지 사용 가능", "20cm", "1kg", "이탈리아"],
  },
  {
    key: "linen-runner",
    intent: "세탁 정보가 핵심인 패브릭. 사장님 최다 문의가 세탁이라 케어 처리가 중요.",
    facts: {
      name: "리넨 테이블러너 — 아이보리",
      price: 28000,
      tag: "fabric",
      description:
        "워싱 가공한 리넨으로 만든 테이블러너. 쓸수록 결이 부드러워지고 색이 자연스럽게 자리잡습니다.",
      details:
        "소재: 리넨 100%\n크기: 40cm × 180cm\n무게: 약 180g\n원산지: 대한민국\n부자재: 마감 스티치 처리",
      care: "30도 이하 찬물 손세탁 권장\n중성세제 사용, 표백제 금지\n그늘에서 뉘어 건조\n낮은 온도로 다림질 가능",
      shipping: null,
    },
    imageCount: 6,
    forbiddenClaims: ["면 100%", "건조기 사용 가능", "표백 가능", "50cm", "중국"],
  },
  {
    key: "brass-holder",
    intent: "변색이 특성인 소재. 단점을 어떻게 정직하게 다루는가.",
    facts: {
      name: "황동 캔들홀더 세트",
      price: 52000,
      tag: "metal",
      description:
        "황동을 깎아 만든 캔들홀더 2개 세트. 시간이 지나면 표면이 어둡게 익으며 고유한 색을 갖습니다.",
      details:
        "소재: 황동(brass)\n크기: 지름 7cm × 높이 5cm / 지름 7cm × 높이 8cm\n구성: 2개 1세트\n원산지: 대한민국",
      care: "마른 천으로 닦아주세요\n변색 시 전용 광택제 사용\n물기 닿은 뒤에는 바로 건조",
      shipping: null,
    },
    imageCount: 4,
    forbiddenClaims: ["스테인리스", "변색 없음", "3개 세트", "식기세척기"],
  },
  {
    key: "victo-jumper",
    intent: "실제 운영 데이터(의류). 치수표가 촘촘할 때 카피가 치수를 침범하지 않는가.",
    facts: {
      name: "VICTO LEATHER JUMPER",
      price: 279000,
      tag: "handmade",
      description:
        "캐주얼한 블루종 실루엣에 고급스러운 레더 소재를 더한 점퍼. 플랩 포켓과 스냅 버튼 디테일로 클래식하면서도 모던한 무드를 연출합니다.",
      details:
        "TOTAL LENGTH: 53cm\nSHOULDER: 52cm\nCHEST: 118cm\nARM HOLE: 56cm\nSLEEVE: 55cm\nMODEL: 168cm / FREE SIZE 착용",
      care: "드라이클리닝 권장\n물세탁 시 변형 주의\n직사광선 장시간 노출 주의\n이염 주의 (밝은색 의류와 분리 보관)",
      shipping: null,
    },
    imageCount: 7,
    forbiddenClaims: ["물세탁 가능", "S/M/L", "양가죽", "60cm", "방수"],
  },
  {
    key: "oak-tray-sparse",
    intent: "결핍 케이스 — 스펙 없음. 치수·소재를 지어내지 않고 플레이스홀더로 남기는가.",
    facts: {
      name: "오크 원목 트레이",
      price: 45000,
      tag: "wood",
      description: "오크 원목을 깎아 만든 트레이입니다.",
      details: null,
      care: null,
      shipping: null,
    },
    imageCount: 3,
    forbiddenClaims: [
      "cm",
      "g",
      "원산지",
      "소재:",
      "물세탁",
      "식기세척기",
      "코팅",
    ],
  },
  {
    key: "glass-cup-bare",
    intent: "극단적 결핍 — 설명조차 없음. 최소 입력에서도 환각 없이 버티는가.",
    facts: {
      name: "핸드블로운 글라스 컵",
      price: 28000,
      tag: "glass",
      description: null,
      details: null,
      care: null,
      shipping: null,
    },
    imageCount: 0,
    forbiddenClaims: ["ml", "cm", "내열", "전자레인지", "식기세척기", "원산지"],
  },
];

export function fixtureByKey(key: string): EvalFixture {
  const found = EVAL_FIXTURES.find((f) => f.key === key);
  if (!found) throw new Error(`알 수 없는 픽스처: ${key}`);
  return found;
}

/** 평가용 가짜 이미지 URL — 발행 경계 allowlist 를 통과하는 형식으로 만든다. */
export function fixtureImageUrls(count: number): string[] {
  const base =
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co") +
    "/storage/v1/object/public/product-images";
  return Array.from({ length: count }, (_, i) => `${base}/eval-${i}.jpg`);
}

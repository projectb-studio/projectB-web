import type { ProductFacts, VoiceCopy } from "@/lib/ai-draft/recipe";

/**
 * 보이스 카피 결정론적 검사기 (LLM 불필요, 비용 0).
 *
 * 역할 분담:
 *   - 이 린터: "지어냈는가 / 브랜드 룰을 어겼는가" 처럼 기계로 판정 가능한 위반.
 *   - LLM 비평가: "후킹이 되는가 / 매력적인가" 처럼 주관적인 품질.
 *
 * 가장 중요한 규칙은 fact-leak 이다. 레시피가 사실 슬롯을 DB 값으로 통제해도,
 * 모델이 보이스 카피 안에 "높이 30cm" 같은 사실을 섞어 넣으면 격리가 뚫린다.
 * 그래서 카피에 등장한 수치·소재·관리 단정이 입력 facts 에 실재하는지 대조한다.
 */

export type Severity = "blocker" | "major" | "minor";

export interface LintRule {
  severity: Severity;
  description: string;
}

export const LINT_RULES: Record<string, LintRule> = {
  "fact-leak": {
    severity: "blocker",
    description: "입력 사실값에 없는 수치·소재·관리법을 카피가 단정함 (환각)",
  },
  "banned-tone": {
    severity: "major",
    description: "이모지·느낌표 남발·과장 표현으로 브랜드 톤을 벗어남",
  },
  length: {
    severity: "major",
    description: "슬롯 길이·개수 규격을 벗어남",
  },
  "html-shape": {
    severity: "major",
    description: "richtext 슬롯이 <p> 문단 구조가 아님",
  },
  repetition: {
    severity: "minor",
    description: "제목·문구가 중복되어 정보량이 낮음",
  },
  cliche: {
    severity: "major",
    description: "어느 상품에나 붙는 상투어라 상품 고유성이 없음 (전형적 AI 티)",
  },
};

const SEVERITY_PENALTY: Record<Severity, number> = {
  blocker: 10,
  major: 2,
  minor: 1,
};

export interface Violation {
  rule: keyof typeof LINT_RULES;
  severity: Severity;
  message: string;
  /** 위반이 발견된 실제 문구 — 재생성 프롬프트에 그대로 넣어 고치게 한다. */
  evidence: string;
  /** 어느 슬롯에서 났는지 */
  slot: string;
}

export interface LintResult {
  score: number;
  passed: boolean;
  violations: Violation[];
}

/** 카피 안에서 "사실 주장"으로 읽히는 패턴들. */
const MEASUREMENT_RE =
  /\d[\d,.]*\s*(?:cm|mm|센티|미터|kg|g|그램|킬로|ml|mL|리터|L|인치|호|평)\b/gi;
const PERCENT_RE = /\d[\d,.]*\s*%/g;
const PRICE_RE = /\d[\d,]*\s*(?:원|만원|₩)/g;

/** 입력에 근거가 없으면 지어낸 것으로 보는 관리·성능 단정. */
const CARE_CLAIM_TERMS = [
  "식기세척기",
  "전자레인지",
  "건조기",
  "물세탁",
  "손세탁",
  "드라이클리닝",
  "표백",
  "다림질",
  "오븐",
  "방수",
  "내열",
  "항균",
];

/** 입력에 근거가 없으면 지어낸 것으로 보는 소재명. */
const MATERIAL_TERMS = [
  "리넨",
  "린넨",
  "면 100",
  "코튼",
  "울",
  "실크",
  "가죽",
  "스테인리스",
  "황동",
  "구리",
  "원목",
  "오크",
  "월넛",
  "도자",
  "유리",
  "대리석",
  "라탄",
  "펠트",
];

/**
 * 어느 상품에 붙여도 말이 되는 상투어. AI 카피가 가장 자주 무너지는 지점이라
 * 실무 리뷰에서 반복적으로 지적된 표현들이다. 여기 걸리면 "이 상품만의 말"로
 * 바꿔야 한다.
 */
const CLICHE_PHRASES = [
  "일상 속",
  "일상에",
  "고민 없이",
  "어디에나 어울리는",
  "어디에도 어울리는",
  "특별한 순간",
  "당신의 공간",
  "당신의 일상",
  "누구나 좋아하는",
  "부담 없이",
  "센스 있는",
  "감각적인",
  "포인트가 되어",
  "공간을 완성",
  "매력을 더해",
];

const EXAGGERATION_TERMS = [
  "최고",
  "최상",
  "최강",
  "완벽",
  "단연코",
  "절대",
  "무조건",
  "역대급",
  "대박",
  "강력 추천",
  "국내 최초",
  "업계 1위",
];

// 이모지 — 기호/픽토그램 영역. (문장부호·한글은 제외)
// tsconfig 에 target 이 없어 ES5 로 잡히므로 u 플래그 대신 서러게이트 페어로 표현한다.
const EMOJI_RE = new RegExp(
  "[\\u2600-\\u27BF\\uFE0F\\u2190-\\u21FF\\u2B00-\\u2BFF]" +
    "|[\\uD83C-\\uD83E][\\uDC00-\\uDFFF]",
  "g"
);

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * 같은 사실을 가리키는 표기 변형. 운영자가 "글라스"라 적은 상품에 카피가 "유리"라고
 * 써도 지어낸 것이 아니므로, 근거 대조 시 서로를 인정한다. (오탐으로 재생성이
 * 무한히 도는 것을 막는다.)
 */
const MATERIAL_SYNONYMS: string[][] = [
  ["유리", "글라스", "glass", "보로실리케이트"],
  ["도자", "세라믹", "ceramic", "도기", "자기", "점토", "클레이"],
  ["가죽", "레더", "leather"],
  ["원목", "우드", "wood", "오크", "월넛", "참나무", "호두나무"],
  ["황동", "브라스", "brass"],
  ["구리", "코퍼", "copper"],
  ["대리석", "마블", "marble", "스톤", "돌"],
  ["리넨", "린넨", "linen", "마"],
  ["코튼", "면", "cotton"],
  ["울", "wool", "양모", "펠트"],
  ["라탄", "rattan", "등나무"],
  ["스테인리스", "stainless", "스텐"],
];

/** 태그를 사실 근거로 인정하기 위한 한국어 라벨. 태그는 운영자가 지정한 DB 값이다. */
const TAG_FACT_LABEL: Record<string, string> = {
  handmade: "핸드메이드 수작업",
  fabric: "패브릭 원단 천",
  metal: "메탈 금속",
  wood: "우드 원목 나무",
  stone: "스톤 돌",
  glass: "글라스 유리",
};

/** 입력 사실값 전체를 하나의 문자열로 — "근거가 있는가" 대조용. */
function factCorpus(facts: ProductFacts): string {
  const base = [
    facts.name,
    facts.description,
    facts.details,
    facts.care,
    facts.shipping,
    facts.tag,
    TAG_FACT_LABEL[facts.tag] ?? "",
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();

  // 근거에 등장한 표기의 동의어들도 근거로 인정한다.
  const expansions = MATERIAL_SYNONYMS.filter((group) =>
    group.some((term) => base.includes(term.toLowerCase()))
  ).flat();

  return [base, ...expansions].join("\n").toLowerCase();
}

/** 수치 비교용 정규화 — "높이 15cm", "15 cm", "15CM" 을 같게 본다. */
function normalizeMeasure(s: string): string {
  return s.toLowerCase().replace(/[\s,]/g, "");
}

interface SlotText {
  slot: string;
  text: string;
  /** HTML 원문 (형식 검사용). 평문 슬롯은 undefined. */
  html?: string;
}

function slotsOf(voice: VoiceCopy): SlotText[] {
  return [
    { slot: "heroCaption", text: voice.heroCaption },
    { slot: "conceptHtml", text: stripHtml(voice.conceptHtml), html: voice.conceptHtml },
    ...voice.points.flatMap((p, i) => [
      { slot: `points[${i}].title`, text: p.title },
      {
        slot: `points[${i}].bodyHtml`,
        text: stripHtml(p.bodyHtml),
        html: p.bodyHtml,
      },
    ]),
  ];
}

function checkFactLeak(slots: SlotText[], facts: ProductFacts): Violation[] {
  const corpus = factCorpus(facts);
  const normalizedCorpus = normalizeMeasure(corpus);
  const out: Violation[] = [];

  for (const { slot, text } of slots) {
    const measurements = [
      ...(text.match(MEASUREMENT_RE) ?? []),
      ...(text.match(PERCENT_RE) ?? []),
    ];
    for (const m of measurements) {
      if (!normalizedCorpus.includes(normalizeMeasure(m))) {
        out.push({
          rule: "fact-leak",
          severity: "blocker",
          slot,
          evidence: m.trim(),
          message: `카피가 입력 사실값에 없는 수치 "${m.trim()}" 를 단정했습니다. 수치는 운영자 입력 스펙에서만 나와야 합니다.`,
        });
      }
    }

    // 가격은 근거가 있어도 카피에 넣지 않는다 (할인·변경 시 그대로 남아 오정보가 됨).
    for (const p of text.match(PRICE_RE) ?? []) {
      out.push({
        rule: "fact-leak",
        severity: "blocker",
        slot,
        evidence: p.trim(),
        message: `카피에 가격 "${p.trim()}" 이 들어갔습니다. 가격은 상품 정보에서만 노출합니다.`,
      });
    }

    const lower = text.toLowerCase();
    for (const term of [...CARE_CLAIM_TERMS, ...MATERIAL_TERMS]) {
      if (lower.includes(term.toLowerCase()) && !corpus.includes(term.toLowerCase())) {
        out.push({
          rule: "fact-leak",
          severity: "blocker",
          slot,
          evidence: term,
          message: `입력 사실값에 근거가 없는 "${term}" 를 카피가 단정했습니다.`,
        });
      }
    }
  }
  return out;
}

function checkTone(slots: SlotText[]): Violation[] {
  const out: Violation[] = [];
  for (const { slot, text } of slots) {
    for (const e of text.match(EMOJI_RE) ?? []) {
      out.push({
        rule: "banned-tone",
        severity: "major",
        slot,
        evidence: e,
        message: "이모지는 브랜드 톤(산업적 미니멀)에 맞지 않습니다.",
      });
    }

    const bangs = (text.match(/!/g) ?? []).length;
    if (bangs >= 2) {
      out.push({
        rule: "banned-tone",
        severity: "major",
        slot,
        evidence: `느낌표 ${bangs}개`,
        message: "느낌표 남발은 절제된 톤을 해칩니다. 슬롯당 1개 이하로 씁니다.",
      });
    }

    for (const term of EXAGGERATION_TERMS) {
      if (text.includes(term)) {
        out.push({
          rule: "banned-tone",
          severity: "major",
          slot,
          evidence: term,
          message: `과장 표현 "${term}" 대신 구체적인 묘사를 씁니다.`,
        });
      }
    }
  }
  return out;
}

const HERO_MAX = 40;
const POINT_TITLE_MAX = 24;
const CONCEPT_MIN = 40;

function checkLength(voice: VoiceCopy, slots: SlotText[]): Violation[] {
  const out: Violation[] = [];

  if (voice.heroCaption.length > HERO_MAX) {
    out.push({
      rule: "length",
      severity: "major",
      slot: "heroCaption",
      evidence: `${voice.heroCaption.length}자`,
      message: `한 줄 컨셉은 ${HERO_MAX}자 이내여야 합니다.`,
    });
  }

  if (voice.points.length < 2 || voice.points.length > 3) {
    out.push({
      rule: "length",
      severity: "major",
      slot: "points",
      evidence: `${voice.points.length}개`,
      message: "핵심 포인트는 2~3개여야 합니다.",
    });
  }

  voice.points.forEach((p, i) => {
    if (p.title.length > POINT_TITLE_MAX) {
      out.push({
        rule: "length",
        severity: "major",
        slot: `points[${i}].title`,
        evidence: `${p.title.length}자`,
        message: `포인트 제목은 ${POINT_TITLE_MAX}자 이내여야 합니다.`,
      });
    }
  });

  const concept = slots.find((s) => s.slot === "conceptHtml");
  if (concept && concept.text.length < CONCEPT_MIN) {
    out.push({
      rule: "length",
      severity: "major",
      slot: "conceptHtml",
      evidence: `${concept.text.length}자`,
      message: `컨셉 본문이 너무 짧습니다(${CONCEPT_MIN}자 이상).`,
    });
  }

  return out;
}

function checkHtmlShape(slots: SlotText[]): Violation[] {
  return slots
    .filter((s) => s.html !== undefined && !/<p[\s>]/i.test(s.html))
    .map((s) => ({
      rule: "html-shape" as const,
      severity: "major" as const,
      slot: s.slot,
      evidence: (s.html ?? "").slice(0, 40),
      message: "본문은 <p>...</p> 문단으로 감싸야 합니다.",
    }));
}

function checkCliche(slots: SlotText[]): Violation[] {
  const out: Violation[] = [];
  for (const { slot, text } of slots) {
    for (const phrase of CLICHE_PHRASES) {
      if (text.includes(phrase)) {
        out.push({
          rule: "cliche",
          severity: "major",
          slot,
          evidence: phrase,
          message: `"${phrase}" 는 어느 상품에나 붙는 상투어입니다. 이 상품에만 해당하는 구체적 표현으로 바꾸세요.`,
        });
      }
    }
  }
  return out;
}

function checkRepetition(voice: VoiceCopy, facts: ProductFacts): Violation[] {
  const out: Violation[] = [];

  const titles = voice.points.map((p) => p.title.trim());
  const dupTitle = titles.find((t, i) => titles.indexOf(t) !== i);
  if (dupTitle) {
    out.push({
      rule: "repetition",
      severity: "minor",
      slot: "points",
      evidence: dupTitle,
      message: "포인트 제목이 중복됩니다. 서로 다른 관점을 다뤄야 합니다.",
    });
  }

  if (voice.heroCaption.trim() === facts.name.trim()) {
    out.push({
      rule: "repetition",
      severity: "minor",
      slot: "heroCaption",
      evidence: voice.heroCaption,
      message: "한 줄 컨셉이 상품명을 그대로 반복합니다. 상품명이 말하지 않는 것을 말해야 합니다.",
    });
  }

  return out;
}

const MAX_SCORE = 10;

export function lintVoice(voice: VoiceCopy, facts: ProductFacts): LintResult {
  const slots = slotsOf(voice);

  const violations = [
    ...checkFactLeak(slots, facts),
    ...checkTone(slots),
    ...checkLength(voice, slots),
    ...checkHtmlShape(slots),
    ...checkCliche(slots),
    ...checkRepetition(voice, facts),
  ];

  const penalty = violations.reduce(
    (sum, v) => sum + SEVERITY_PENALTY[v.severity],
    0
  );
  const score = Math.max(0, MAX_SCORE - penalty);

  return {
    score,
    // blocker 가 하나라도 있으면 점수와 무관하게 통과시키지 않는다.
    passed: !violations.some((v) => v.severity === "blocker") && score >= 7,
    violations,
  };
}

/** 위반 목록을 재생성 프롬프트에 넣을 지시문으로 변환한다. */
export function violationsToFeedback(violations: Violation[]): string {
  if (violations.length === 0) return "";
  const lines = violations.map(
    (v) => `- [${v.slot}] ${v.message} (문제 문구: "${v.evidence}")`
  );
  return `아래 문제를 모두 고쳐서 다시 작성하라:\n${lines.join("\n")}`;
}

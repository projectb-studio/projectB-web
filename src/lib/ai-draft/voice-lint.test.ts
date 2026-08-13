import { describe, it, expect } from "vitest";
import { lintVoice, LINT_RULES } from "./voice-lint";
import type { VoiceCopy } from "./recipe";
import type { ProductFacts } from "./recipe";

const facts: ProductFacts = {
  name: "무광 블랙 세라믹 화병",
  price: 38000,
  tag: "handmade",
  description: "물레로 하나씩 성형한 화병입니다.",
  details: "소재: 석기질 도자\n크기: 지름 10cm × 높이 15cm\n원산지: 대한민국",
  care: "마른 천으로 닦아주세요",
  shipping: null,
};

const sparseFacts: ProductFacts = {
  name: "오크 원목 트레이",
  price: 45000,
  tag: "wood",
  description: "오크 원목을 깎아 만든 트레이입니다.",
  details: null,
  care: null,
  shipping: null,
};

function voice(over: Partial<VoiceCopy> = {}): VoiceCopy {
  return {
    heroCaption: "손끝에서 완성된 하나의 형태",
    conceptHtml:
      "<p>매일의 공간에 자연스럽게 스며드는 화병입니다.</p><p>한 송이만 꽂아도 형태가 살아납니다.</p>",
    points: [
      {
        title: "오래 곁에 두는 마감",
        bodyHtml: "<p>거친 부분 없이 다듬어 매일 손이 닿아도 변함없습니다.</p>",
      },
      {
        title: "공간과 어우러지는 톤",
        bodyHtml: "<p>과하지 않은 색과 형태로 어떤 공간에도 놓입니다.</p>",
      },
    ],
    ...over,
  };
}

function codes(result: ReturnType<typeof lintVoice>): string[] {
  return result.violations.map((v) => v.rule);
}

describe("lintVoice — 깨끗한 카피", () => {
  it("규칙을 지킨 카피는 위반이 없고 만점이다", () => {
    const r = lintVoice(voice(), facts);
    expect(r.violations).toEqual([]);
    expect(r.score).toBe(10);
    expect(r.passed).toBe(true);
  });
});

describe("lintVoice — 사실 침범 (환각 격리의 핵심)", () => {
  it("입력에 없는 치수를 카피가 지어내면 잡는다", () => {
    const r = lintVoice(
      voice({ conceptHtml: "<p>높이 30cm 의 넉넉한 크기입니다.</p>" }),
      facts
    );
    expect(codes(r)).toContain("fact-leak");
  });

  it("입력 facts 에 실제로 있는 수치는 위반이 아니다", () => {
    // details 에 '높이 15cm' 가 있으므로 카피가 인용해도 지어낸 게 아니다.
    const r = lintVoice(
      voice({ conceptHtml: "<p>높이 15cm 로 한 송이에 알맞습니다.</p>" }),
      facts
    );
    expect(codes(r)).not.toContain("fact-leak");
  });

  it("사실값이 아예 없는 상품에서 수치를 쓰면 잡는다", () => {
    const r = lintVoice(
      voice({ conceptHtml: "<p>가로 40cm 트레이입니다.</p>" }),
      sparseFacts
    );
    expect(codes(r)).toContain("fact-leak");
  });

  it("소재 비율을 지어내면 잡는다", () => {
    const r = lintVoice(
      voice({ conceptHtml: "<p>리넨 100% 원단을 사용했습니다.</p>" }),
      sparseFacts
    );
    expect(codes(r)).toContain("fact-leak");
  });

  it("입력에 없는 관리 방법을 단정하면 잡는다", () => {
    const r = lintVoice(
      voice({
        points: [
          { title: "관리 편의", bodyHtml: "<p>식기세척기 사용 가능합니다.</p>" },
          { title: "튼튼함", bodyHtml: "<p>오래 씁니다.</p>" },
        ],
      }),
      sparseFacts
    );
    expect(codes(r)).toContain("fact-leak");
  });

  it("같은 소재의 다른 표기는 지어낸 것으로 보지 않는다", () => {
    const glass: ProductFacts = {
      name: "핸드블로운 글라스 컵",
      price: 28000,
      tag: "glass",
      description: null,
      details: null,
      care: null,
      shipping: null,
    };
    // 상품명이 '글라스' 이므로 카피의 '유리' 는 지어낸 사실이 아니다.
    const r = lintVoice(
      voice({ conceptHtml: "<p>유리 특유의 투명함이 그대로 남아 있습니다.</p>" }),
      glass
    );
    expect(codes(r)).not.toContain("fact-leak");
  });

  it("태그가 보증하지 않는 다른 소재는 여전히 잡는다", () => {
    const glass: ProductFacts = {
      name: "핸드블로운 글라스 컵",
      price: 28000,
      tag: "glass",
      description: null,
      details: null,
      care: null,
      shipping: null,
    };
    const r = lintVoice(
      voice({ conceptHtml: "<p>가죽 손잡이를 덧대었습니다. 오래 쓰기 좋습니다.</p>" }),
      glass
    );
    expect(codes(r)).toContain("fact-leak");
  });

  it("가격을 카피에 넣으면 잡는다", () => {
    const r = lintVoice(
      voice({ heroCaption: "38,000원의 가치" }),
      facts
    );
    expect(codes(r)).toContain("fact-leak");
  });
});

describe("lintVoice — 브랜드 톤", () => {
  it("이모지를 잡는다", () => {
    const r = lintVoice(voice({ heroCaption: "손끝에서 완성된 형태 ✨" }), facts);
    expect(codes(r)).toContain("banned-tone");
  });

  it("느낌표 남발을 잡는다", () => {
    const r = lintVoice(
      voice({ conceptHtml: "<p>정말 좋습니다! 강력 추천합니다! 지금 만나보세요!</p>" }),
      facts
    );
    expect(codes(r)).toContain("banned-tone");
  });

  it("과장 표현을 잡는다", () => {
    const r = lintVoice(voice({ heroCaption: "최고의 퀄리티 완벽한 마감" }), facts);
    expect(codes(r)).toContain("banned-tone");
  });

  it("느낌표 1개는 허용한다", () => {
    const r = lintVoice(
      voice({ conceptHtml: "<p>오래 두고 쓰기 좋습니다!</p>" }),
      facts
    );
    expect(codes(r)).not.toContain("banned-tone");
  });
});

describe("lintVoice — 형식", () => {
  it("한 줄 컨셉이 너무 길면 잡는다", () => {
    const r = lintVoice(voice({ heroCaption: "가".repeat(60) }), facts);
    expect(codes(r)).toContain("length");
  });

  it("핵심 포인트가 2개 미만이면 잡는다", () => {
    const r = lintVoice(
      voice({ points: [{ title: "하나뿐", bodyHtml: "<p>내용</p>" }] }),
      facts
    );
    expect(codes(r)).toContain("length");
  });

  it("컨셉 본문이 <p> 로 감싸이지 않으면 잡는다", () => {
    const r = lintVoice(voice({ conceptHtml: "감싸지 않은 평문입니다." }), facts);
    expect(codes(r)).toContain("html-shape");
  });

  it("컨셉 본문이 너무 짧으면 잡는다", () => {
    const r = lintVoice(voice({ conceptHtml: "<p>짧음</p>" }), facts);
    expect(codes(r)).toContain("length");
  });
});

describe("lintVoice — 상투어", () => {
  it("어느 상품에나 붙는 상투어를 잡는다", () => {
    const r = lintVoice(
      voice({ conceptHtml: "<p>일상 속 어디에나 어울리는 아이템입니다. 오래 씁니다.</p>" }),
      facts
    );
    expect(codes(r)).toContain("cliche");
  });

  it("상투어 위반은 문제 표현을 근거로 남긴다", () => {
    const r = lintVoice(voice({ heroCaption: "고민 없이 놓는 자리" }), facts);
    const v = r.violations.find((x) => x.rule === "cliche");
    expect(v?.evidence).toBe("고민 없이");
  });

  it("구체적인 표현은 상투어로 보지 않는다", () => {
    const r = lintVoice(
      voice({
        conceptHtml: "<p>물레 자국이 남은 표면이 빛을 고르게 흩뜨립니다. 오래 두고 씁니다.</p>",
      }),
      facts
    );
    expect(codes(r)).not.toContain("cliche");
  });
});

describe("lintVoice — 반복", () => {
  it("포인트 제목이 중복되면 잡는다", () => {
    const r = lintVoice(
      voice({
        points: [
          { title: "같은 제목", bodyHtml: "<p>서로 다른 내용 하나입니다.</p>" },
          { title: "같은 제목", bodyHtml: "<p>서로 다른 내용 둘입니다.</p>" },
        ],
      }),
      facts
    );
    expect(codes(r)).toContain("repetition");
  });

  it("한 줄 컨셉이 상품명을 그대로 반복하면 잡는다", () => {
    const r = lintVoice(voice({ heroCaption: facts.name }), facts);
    expect(codes(r)).toContain("repetition");
  });
});

describe("lintVoice — 점수", () => {
  it("위반이 늘수록 점수가 내려간다", () => {
    const clean = lintVoice(voice(), facts).score;
    const dirty = lintVoice(
      voice({ heroCaption: "최고의 품질! 30cm ✨" }),
      facts
    ).score;
    expect(dirty).toBeLessThan(clean);
    expect(dirty).toBeGreaterThanOrEqual(0);
  });

  it("사실 침범이 있으면 통과시키지 않는다", () => {
    const r = lintVoice(
      voice({ conceptHtml: "<p>높이 30cm 입니다. 넉넉하게 담깁니다.</p>" }),
      facts
    );
    expect(r.passed).toBe(false);
  });

  it("위반마다 사람이 읽을 수 있는 설명과 근거 문구를 남긴다", () => {
    const r = lintVoice(
      voice({ conceptHtml: "<p>높이 30cm 입니다. 넉넉하게 담깁니다.</p>" }),
      facts
    );
    const v = r.violations.find((x) => x.rule === "fact-leak");
    expect(v?.message).toBeTruthy();
    expect(v?.evidence).toContain("30cm");
  });
});

describe("LINT_RULES", () => {
  it("모든 규칙이 심각도와 설명을 갖는다", () => {
    for (const [code, rule] of Object.entries(LINT_RULES)) {
      expect(rule.severity, `${code} severity`).toMatch(/^(blocker|major|minor)$/);
      expect(rule.description.length, `${code} description`).toBeGreaterThan(0);
    }
  });
});

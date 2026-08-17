import { describe, it, expect, vi } from "vitest";
import { LlmJudge, JUDGE_SCHEMA, judgeScoreToTen, type CallImpl } from "./llm-judge";
import type { ProductFacts, VoiceCopy } from "./recipe";

const facts: ProductFacts = {
  name: "무광 블랙 세라믹 화병",
  price: 38000,
  tag: "handmade",
  description: "물레로 하나씩 성형한 화병입니다.",
  details: "소재: 석기질 도자\n크기: 지름 10cm × 높이 15cm",
  care: "마른 천으로 닦아주세요",
  shipping: null,
};

const voice: VoiceCopy = {
  heroCaption: "한 송이로 충분한 자리",
  conceptHtml: "<p>매일의 공간에 자연스럽게 스며드는 화병입니다. 오래 두고 씁니다.</p>",
  points: [
    { title: "오래 곁에 두는 마감", bodyHtml: "<p>거친 부분 없이 다듬었습니다.</p>" },
    { title: "공간과 어우러지는 톤", bodyHtml: "<p>과하지 않은 색과 형태입니다.</p>" },
  ],
};

function judgeJson(over: Record<string, unknown> = {}) {
  return JSON.stringify({
    reasoning: "카피가 사실을 침범하지 않고 톤도 절제되어 있다.",
    factIntrusion: { passed: true, evidence: "" },
    structure: { passed: true, evidence: "" },
    brandVoice: { score: 4, comment: "절제된 톤" },
    productSpecificity: { score: 4, comment: "이 상품에만 맞는 표현" },
    koreanQuality: { score: 5, comment: "자연스러운 한국어" },
    revisionInstruction: "",
    ...over,
  });
}

function fakeCall(text: string) {
  return vi.fn<CallImpl>(async () => ({
    text,
    inputTokens: 500,
    outputTokens: 200,
  }));
}

describe("judgeScoreToTen", () => {
  it("주관 3축 평균을 10점 만점으로 환산한다", () => {
    expect(judgeScoreToTen(5, 5, 5)).toBe(10);
    expect(judgeScoreToTen(4, 4, 4)).toBeCloseTo(8, 5);
    expect(judgeScoreToTen(0, 0, 0)).toBe(0);
  });
});

describe("LlmJudge — 판정", () => {
  it("전 축 통과면 통과 판정을 낸다", async () => {
    const call = fakeCall(judgeJson());
    const judge = new LlmJudge({ callImpl: call });

    const v = await judge.evaluate({ voice, facts });

    expect(v.passed).toBe(true);
    expect(v.score).toBeGreaterThanOrEqual(8);
  });

  it("사실 침범이면 주관 점수가 높아도 무조건 실패다", async () => {
    const call = fakeCall(
      judgeJson({
        factIntrusion: { passed: false, evidence: "높이 30cm" },
        brandVoice: { score: 5, comment: "" },
        productSpecificity: { score: 5, comment: "" },
        koreanQuality: { score: 5, comment: "" },
      })
    );
    const judge = new LlmJudge({ callImpl: call });

    const v = await judge.evaluate({ voice, facts });

    expect(v.passed).toBe(false);
  });

  it("구조 위반이면 실패다", async () => {
    const call = fakeCall(
      judgeJson({ structure: { passed: false, evidence: "포인트가 1개뿐" } })
    );
    const judge = new LlmJudge({ callImpl: call });

    expect((await judge.evaluate({ voice, facts })).passed).toBe(false);
  });

  it("주관 평균이 기준 미만이면 실패다", async () => {
    const call = fakeCall(
      judgeJson({
        brandVoice: { score: 3, comment: "" },
        productSpecificity: { score: 2, comment: "" },
        koreanQuality: { score: 3, comment: "" },
      })
    );
    const judge = new LlmJudge({ callImpl: call, minSubjectiveAvg: 4 });

    const v = await judge.evaluate({ voice, facts });
    expect(v.passed).toBe(false);
    expect(v.score).toBeLessThan(8);
  });
});

describe("LlmJudge — 피드백", () => {
  it("실패 시 수정 지시를 피드백으로 넘긴다", async () => {
    const call = fakeCall(
      judgeJson({
        factIntrusion: { passed: false, evidence: "높이 30cm" },
        revisionInstruction: "수치 표현을 모두 빼고 다시 써라",
      })
    );
    const judge = new LlmJudge({ callImpl: call });

    const v = await judge.evaluate({ voice, facts });
    expect(v.feedback).toContain("수치 표현을 모두 빼고");
  });

  it("실패 축의 근거를 피드백에 포함한다", async () => {
    const call = fakeCall(
      judgeJson({ factIntrusion: { passed: false, evidence: "높이 30cm" } })
    );
    const judge = new LlmJudge({ callImpl: call });

    expect((await judge.evaluate({ voice, facts })).feedback).toContain("30cm");
  });

  it("통과 시에는 피드백이 비어 있다", async () => {
    const judge = new LlmJudge({ callImpl: fakeCall(judgeJson()) });
    expect((await judge.evaluate({ voice, facts })).feedback).toBe("");
  });
});

describe("LlmJudge — 호출 규격", () => {
  it("생성기와 다른 모델을 기본값으로 쓴다 (자기선호 편향 완화)", async () => {
    const call = fakeCall(judgeJson());
    const judge = new LlmJudge({ callImpl: call });

    await judge.evaluate({ voice, facts });

    const arg = call.mock.calls[0][0] as unknown as { model: string; label: string };
    expect(arg.model).not.toBe("claude-haiku-4-5-20251001");
    expect(arg.label).toBe("draft:judge");
  });

  it("Structured Outputs 스키마를 강제한다", async () => {
    const call = fakeCall(judgeJson());
    const judge = new LlmJudge({ callImpl: call });

    await judge.evaluate({ voice, facts });

    const arg = call.mock.calls[0][0] as unknown as { jsonSchema?: unknown };
    expect(arg.jsonSchema).toBe(JUDGE_SCHEMA);
  });

  it("평가 대상 카피와 사실값을 프롬프트에 담는다", async () => {
    const call = fakeCall(judgeJson());
    const judge = new LlmJudge({ callImpl: call });

    await judge.evaluate({ voice, facts });

    const arg = call.mock.calls[0][0] as unknown as { user: string };
    expect(arg.user).toContain("한 송이로 충분한 자리");
    expect(arg.user).toContain("석기질 도자");
  });
});

describe("JUDGE_SCHEMA", () => {
  it("근거(reasoning)를 점수 축보다 앞에 둔다", () => {
    // 점수부터 뱉고 근거를 갖다 붙이는 순서는 사후합리화가 된다.
    const keys = Object.keys(JUDGE_SCHEMA.properties);
    expect(keys[0]).toBe("reasoning");
    expect(keys.indexOf("reasoning")).toBeLessThan(keys.indexOf("brandVoice"));
  });

  it("Structured Outputs 제약을 지킨다 (additionalProperties=false, 길이 제약 없음)", () => {
    const json = JSON.stringify(JUDGE_SCHEMA);
    expect(JUDGE_SCHEMA.additionalProperties).toBe(false);
    expect(json).not.toContain("minLength");
    expect(json).not.toContain("maxLength");
  });
});

describe("LlmJudge — 장애", () => {
  it("응답이 스키마와 어긋나면 던진다 (조용히 통과시키지 않음)", async () => {
    const judge = new LlmJudge({ callImpl: fakeCall("{\"nope\": 1}") });
    await expect(judge.evaluate({ voice, facts })).rejects.toThrow();
  });

  it("JSON 이 아니면 던진다", async () => {
    const judge = new LlmJudge({ callImpl: fakeCall("판정 불가") });
    await expect(judge.evaluate({ voice, facts })).rejects.toThrow();
  });
});

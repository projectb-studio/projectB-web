import { describe, it, expect, vi } from "vitest";
import { runQualityLoop, type QualityCritic } from "./quality-loop";
import type { DraftProvider, GenerateInput, GenerateOutput } from "./provider";
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

function voiceWith(caption: string): VoiceCopy {
  return {
    heroCaption: caption,
    conceptHtml: "<p>매일의 공간에 자연스럽게 스며드는 화병입니다. 오래 두고 씁니다.</p>",
    points: [
      { title: "오래 곁에 두는 마감", bodyHtml: "<p>거친 부분 없이 다듬었습니다.</p>" },
      { title: "공간과 어우러지는 톤", bodyHtml: "<p>과하지 않은 색과 형태입니다.</p>" },
    ],
  };
}

/** 호출될 때마다 미리 정해진 보이스를 순서대로 내놓는 가짜 provider. */
function fakeProvider(captions: string[]): DraftProvider & {
  calls: GenerateInput[];
} {
  const calls: GenerateInput[] = [];
  let i = 0;
  return {
    calls,
    async generate(input: GenerateInput): Promise<GenerateOutput> {
      calls.push(input);
      const caption = captions[Math.min(i, captions.length - 1)];
      i += 1;
      return { voice: voiceWith(caption), generator: "fake" };
    },
  };
}

/** 지정한 점수 시퀀스를 순서대로 돌려주는 가짜 비평가. */
function fakeCritic(scores: number[], threshold = 8): QualityCritic & {
  count: number;
} {
  let i = 0;
  const critic = {
    name: "fake",
    count: 0,
    async evaluate() {
      const score = scores[Math.min(i, scores.length - 1)];
      i += 1;
      critic.count += 1;
      return {
        score,
        passed: score >= threshold,
        feedback: score >= threshold ? "" : `점수 ${score} — 개선 필요`,
      };
    },
  };
  return critic;
}

describe("runQualityLoop — 통과 경로", () => {
  it("첫 시도가 통과하면 재생성하지 않는다", async () => {
    const provider = fakeProvider(["손끝에서 완성된 형태"]);
    const critic = fakeCritic([9]);

    const result = await runQualityLoop({
      facts,
      provider,
      critics: [critic],
      maxAttempts: 3,
    });

    expect(result.passed).toBe(true);
    expect(result.attempts).toBe(1);
    expect(provider.calls).toHaveLength(1);
  });

  it("통과한 보이스를 그대로 돌려준다", async () => {
    const provider = fakeProvider(["손끝에서 완성된 형태"]);
    const result = await runQualityLoop({
      facts,
      provider,
      critics: [fakeCritic([9])],
      maxAttempts: 3,
    });

    expect(result.voice.heroCaption).toBe("손끝에서 완성된 형태");
  });
});

describe("runQualityLoop — 재생성 경로", () => {
  it("미달이면 피드백을 붙여 재생성한다", async () => {
    const provider = fakeProvider(["나쁜 카피", "좋은 카피"]);
    const critic = fakeCritic([5, 9]);

    const result = await runQualityLoop({
      facts,
      provider,
      critics: [critic],
      maxAttempts: 3,
    });

    expect(result.attempts).toBe(2);
    expect(result.passed).toBe(true);
    expect(result.voice.heroCaption).toBe("좋은 카피");

    // 2번째 호출에는 비평 피드백과 직전 보이스가 전달돼야 한다.
    expect(provider.calls[1].feedback).toContain("개선 필요");
    expect(provider.calls[1].previousVoice?.heroCaption).toBe("나쁜 카피");
  });

  it("maxAttempts 를 절대 넘지 않는다 (무한 루프 방지)", async () => {
    const provider = fakeProvider(["계속 나쁨"]);
    const critic = fakeCritic([3]);

    const result = await runQualityLoop({
      facts,
      provider,
      critics: [critic],
      maxAttempts: 2,
    });

    expect(result.attempts).toBe(2);
    expect(provider.calls).toHaveLength(2);
    expect(result.passed).toBe(false);
  });

  it("끝내 미달이면 그때까지 중 가장 점수가 높은 보이스를 돌려준다", async () => {
    const provider = fakeProvider(["중간", "최악", "그저그럼"]);
    const critic = fakeCritic([6, 2, 5]);

    const result = await runQualityLoop({
      facts,
      provider,
      critics: [critic],
      maxAttempts: 3,
    });

    expect(result.passed).toBe(false);
    expect(result.voice.heroCaption).toBe("중간");
    expect(result.bestScore).toBe(6);
  });

  it("점수가 나아지지 않으면 시도를 남겨두고 조기 중단한다 (수확체감)", async () => {
    const provider = fakeProvider(["같음"]);
    // 재생성해도 점수가 그대로면 더 돌릴 이유가 없다.
    const critic = fakeCritic([5, 5]);

    const result = await runQualityLoop({
      facts,
      provider,
      critics: [critic],
      maxAttempts: 5,
      stopWhenNoImprovement: true,
    });

    expect(result.attempts).toBe(2);
    expect(result.stoppedEarly).toBe(true);
  });
});

describe("runQualityLoop — 반려 후 재생성", () => {
  it("직전 초안의 보이스를 첫 시도부터 모델에 넘긴다", async () => {
    const provider = fakeProvider(["새 카피"]);
    const prior = voiceWith("반려된 카피");

    await runQualityLoop({
      facts,
      provider,
      critics: [fakeCritic([9])],
      maxAttempts: 1,
      initialPreviousVoice: prior,
      operatorFeedback: "컨셉을 더 짧게",
    });

    expect(provider.calls[0].previousVoice?.heroCaption).toBe("반려된 카피");
    expect(provider.calls[0].feedback).toContain("컨셉을 더 짧게");
  });
});

describe("runQualityLoop — 여러 비평가 합성", () => {
  it("모든 비평가가 통과해야 통과다", async () => {
    const provider = fakeProvider(["카피"]);
    const strict = fakeCritic([4]);
    const lenient = fakeCritic([10]);

    const result = await runQualityLoop({
      facts,
      provider,
      critics: [lenient, strict],
      maxAttempts: 1,
    });

    expect(result.passed).toBe(false);
  });

  it("가장 낮은 점수를 종합 점수로 삼는다", async () => {
    const provider = fakeProvider(["카피"]);
    const result = await runQualityLoop({
      facts,
      provider,
      critics: [fakeCritic([10]), fakeCritic([4])],
      maxAttempts: 1,
    });

    expect(result.bestScore).toBe(4);
  });

  it("모든 비평가의 피드백을 합쳐 재생성에 전달한다", async () => {
    const provider = fakeProvider(["카피", "카피2"]);
    const a: QualityCritic = {
      name: "a",
      async evaluate() {
        return { score: 5, passed: false, feedback: "A 문제" };
      },
    };
    const b: QualityCritic = {
      name: "b",
      async evaluate() {
        return { score: 5, passed: false, feedback: "B 문제" };
      },
    };

    await runQualityLoop({ facts, provider, critics: [a, b], maxAttempts: 2 });

    expect(provider.calls[1].feedback).toContain("A 문제");
    expect(provider.calls[1].feedback).toContain("B 문제");
  });
});

describe("runQualityLoop — 감사 이력", () => {
  it("시도별 점수와 피드백을 이력으로 남긴다", async () => {
    const provider = fakeProvider(["v1", "v2"]);
    const result = await runQualityLoop({
      facts,
      provider,
      critics: [fakeCritic([5, 9])],
      maxAttempts: 3,
    });

    expect(result.history).toHaveLength(2);
    expect(result.history[0].score).toBe(5);
    expect(result.history[0].passed).toBe(false);
    expect(result.history[1].score).toBe(9);
    expect(result.history[1].passed).toBe(true);
    expect(result.history[0].verdicts[0].critic).toBe("fake");
  });
});

describe("runQualityLoop — 장애 내성", () => {
  it("비평가가 터져도 생성 자체는 실패시키지 않는다", async () => {
    const provider = fakeProvider(["카피"]);
    const broken: QualityCritic = {
      name: "broken",
      async evaluate() {
        throw new Error("critic down");
      },
    };

    const result = await runQualityLoop({
      facts,
      provider,
      critics: [broken],
      maxAttempts: 2,
    });

    // 카피는 나와야 하고, 평가 불가는 이력에 남아야 한다.
    expect(result.voice.heroCaption).toBe("카피");
    expect(result.history[0].verdicts[0].error).toContain("critic down");
  });

  it("생성기가 터지면 그대로 던진다 (조용히 삼키지 않음)", async () => {
    const provider: DraftProvider = {
      async generate() {
        throw new Error("provider down");
      },
    };

    await expect(
      runQualityLoop({
        facts,
        provider,
        critics: [fakeCritic([9])],
        maxAttempts: 2,
      })
    ).rejects.toThrow(/provider down/);
  });

  it("재생성 중 실패하면 직전까지의 최선을 살려 돌려준다", async () => {
    let call = 0;
    const provider: DraftProvider = {
      async generate() {
        call += 1;
        if (call === 1) return { voice: voiceWith("첫 시도"), generator: "fake" };
        throw new Error("두 번째 호출 실패");
      },
    };

    const result = await runQualityLoop({
      facts,
      provider,
      critics: [fakeCritic([5])],
      maxAttempts: 3,
    });

    expect(result.voice.heroCaption).toBe("첫 시도");
    expect(result.passed).toBe(false);
    expect(result.generationError).toContain("두 번째 호출 실패");
  });
});

describe("runQualityLoop — 비평가 입력", () => {
  it("비평가에게 보이스와 사실값을 함께 넘긴다", async () => {
    const evaluate = vi.fn(async () => ({ score: 9, passed: true, feedback: "" }));
    const provider = fakeProvider(["카피"]);

    await runQualityLoop({
      facts,
      provider,
      critics: [{ name: "spy", evaluate }],
      maxAttempts: 1,
    });

    expect(evaluate).toHaveBeenCalledWith(
      expect.objectContaining({
        voice: expect.objectContaining({ heroCaption: "카피" }),
        facts,
      })
    );
  });
});

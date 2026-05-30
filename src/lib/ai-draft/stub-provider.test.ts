import { describe, it, expect } from "vitest";
import { StubDraftProvider } from "./stub-provider";
import type { ProductFacts } from "./recipe";

const FACTS: ProductFacts = {
  name: "Ceramic vase",
  price: 38000,
  tag: "handmade",
  description: "matte black vase",
  details: null,
  care: null,
  shipping: null,
};

describe("StubDraftProvider", () => {
  const provider = new StubDraftProvider();

  it("is deterministic: same input → same output", async () => {
    const a = await provider.generate({ facts: FACTS });
    const b = await provider.generate({ facts: FACTS });
    expect(a.voice).toEqual(b.voice);
    expect(a.generator).toBe("stub");
  });

  it("produces 2~3 points", async () => {
    const { voice } = await provider.generate({ facts: FACTS });
    expect(voice.points.length).toBeGreaterThanOrEqual(2);
    expect(voice.points.length).toBeLessThanOrEqual(3);
  });

  it("reflects operator feedback into the concept when regenerating", async () => {
    const feedback = "소재 강조를 더 해주세요";
    const out = await provider.generate({ facts: FACTS, feedback });
    expect(out.voice.conceptHtml).toContain(feedback);
    expect(out.rawMeta?.appliedFeedback).toBe(true);
  });

  it("marks revision when given a previous voice", async () => {
    const first = await provider.generate({ facts: FACTS });
    const second = await provider.generate({
      facts: FACTS,
      previousVoice: first.voice,
      feedback: "포인트를 더 구체적으로",
    });
    expect(second.rawMeta?.revisedFromPrevious).toBe(true);
    expect(second.voice.points[0].title).toContain("개정");
  });
});

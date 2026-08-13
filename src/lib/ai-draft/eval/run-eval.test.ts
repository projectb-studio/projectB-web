import { describe, it, expect } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { AnthropicDraftProvider } from "../anthropic-provider";
import { runQualityLoop } from "../quality-loop";
import { LintCritic, MAX_QUALITY_ATTEMPTS } from "../critics";
import { LlmJudge } from "../llm-judge";
import { lintVoice } from "../voice-lint";
import { assembleBlocks } from "../recipe";
import { getCostGuard } from "../cost-guard";
import { findPlaceholders } from "@/lib/detail-blocks/publish-gate";
import { EVAL_FIXTURES, fixtureImageUrls, type EvalFixture } from "./fixtures";
import type { VoiceCopy } from "../recipe";

/**
 * 실 LLM 자가평가 하네스.
 *
 * 픽스처 6종으로 생성 → 채점 → 리포트. 평소 `npm test` 에서는 건너뛰고
 * RUN_AI_EVAL=1 일 때만 돈다. 비용은 cost-guard 가 하드캡으로 막는다.
 *
 * 목표: 판정 평균 8.5/10 이상, 환각(fact-leak) 0건.
 */
const enabled = process.env.RUN_AI_EVAL === "1";
const d = enabled ? describe : describe.skip;

const REPORT_PATH =
  process.env.AI_EVAL_REPORT ?? join(process.cwd(), ".ai-eval", "report.json");

interface FixtureResult {
  key: string;
  intent: string;
  score: number;
  passed: boolean;
  attempts: number;
  stoppedEarly: boolean;
  lintViolations: Array<{ rule: string; slot: string; evidence: string }>;
  /** forbiddenClaims 중 실제로 카피에 등장한 것 — 0 이어야 한다 */
  forbiddenHits: string[];
  judge?: unknown;
  voice: VoiceCopy;
  legalGaps: string[];
  placeholderCount: number;
}

function findForbidden(voice: VoiceCopy, fixture: EvalFixture): string[] {
  const text = [
    voice.heroCaption,
    voice.conceptHtml,
    voice.problemHtml ?? "",
    voice.closingHtml ?? "",
    ...voice.points.flatMap((p) => [p.title, p.bodyHtml]),
  ]
    .join(" ")
    .replace(/<[^>]*>/g, " ");

  return fixture.forbiddenClaims.filter((c) => text.includes(c));
}

async function evaluateFixture(fixture: EvalFixture): Promise<FixtureResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY 없음");

  const provider = new AnthropicDraftProvider(apiKey);
  const judge = new LlmJudge();

  const loop = await runQualityLoop({
    facts: fixture.facts,
    provider,
    critics: [new LintCritic(), judge],
    maxAttempts: MAX_QUALITY_ATTEMPTS,
    stopWhenNoImprovement: true,
  });

  const lint = lintVoice(loop.voice, fixture.facts);
  const assembled = assembleBlocks({
    facts: fixture.facts,
    imageUrls: fixtureImageUrls(fixture.imageCount),
    voice: loop.voice,
  });

  const lastJudge = loop.history[loop.history.length - 1]?.verdicts.find(
    (v) => v.critic === "llm-judge"
  );

  return {
    key: fixture.key,
    intent: fixture.intent,
    score: loop.bestScore,
    passed: loop.passed,
    attempts: loop.attempts,
    stoppedEarly: loop.stoppedEarly,
    lintViolations: lint.violations.map((v) => ({
      rule: v.rule,
      slot: v.slot,
      evidence: v.evidence,
    })),
    forbiddenHits: findForbidden(loop.voice, fixture),
    judge: lastJudge?.detail,
    voice: loop.voice,
    legalGaps: assembled.meta.legalGaps,
    placeholderCount: findPlaceholders(assembled.blocks).length,
  };
}

d("AI 초안 자가평가", () => {
  it(
    "픽스처 전체를 생성·채점하고 리포트를 남긴다",
    async () => {
      const guard = getCostGuard();
      const before = await guard.snapshot();

      const results: FixtureResult[] = [];
      for (const fixture of EVAL_FIXTURES) {
        try {
          results.push(await evaluateFixture(fixture));
        } catch (e) {
          console.warn(`[eval] ${fixture.key} 실패: ${(e as Error).message}`);
        }
      }

      const after = await guard.snapshot();
      const scores = results.map((r) => r.score);
      const avg = scores.length
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
      const totalForbidden = results.reduce((n, r) => n + r.forbiddenHits.length, 0);
      const totalFactLeaks = results.reduce(
        (n, r) => n + r.lintViolations.filter((v) => v.rule === "fact-leak").length,
        0
      );

      const report = {
        at: new Date().toISOString(),
        avgScore: Number(avg.toFixed(2)),
        minScore: scores.length ? Math.min(...scores) : 0,
        passedCount: results.filter((r) => r.passed).length,
        total: results.length,
        totalForbidden,
        totalFactLeaks,
        costUsd: Number((after.spentUsd - before.spentUsd).toFixed(4)),
        cumulativeCostUsd: Number(after.spentUsd.toFixed(4)),
        results,
      };

      mkdirSync(dirname(REPORT_PATH), { recursive: true });
      writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

      console.warn(
        `[eval] 평균 ${report.avgScore}/10 · 최저 ${report.minScore} · ` +
          `통과 ${report.passedCount}/${report.total} · ` +
          `환각 ${totalFactLeaks + totalForbidden}건 · ` +
          `이번 비용 $${report.costUsd} (누적 $${report.cumulativeCostUsd})`
      );

      // 리포트는 항상 남는다. 목표 미달이어도 여기서 죽이지 않고 다음 개선에 쓴다.
      expect(results.length).toBeGreaterThan(0);
    },
    15 * 60 * 1000
  );
});

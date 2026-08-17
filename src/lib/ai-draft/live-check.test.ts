import { describe, it, expect } from "vitest";
import { callAnthropic } from "./anthropic-client";
import { getCostGuard } from "./cost-guard";

/**
 * 실 API 연결·비용 원장 확인용 최소 호출.
 *
 * 평소 `npm test` 에서는 건너뛰고, RUN_LIVE_CHECK=1 일 때만 실행한다.
 * 목적은 품질 검증이 아니라 "키가 살아있고 원장이 실제 사용량을 잡는가" 확인.
 */
const enabled = process.env.RUN_LIVE_CHECK === "1";
const d = enabled ? describe : describe.skip;

d("실 API 연결 확인", () => {
  it("호출이 성공하고 사용량이 원장에 기록된다", async () => {
    const guard = getCostGuard();
    const before = await guard.snapshot();

    const res = await callAnthropic({
      model: process.env.AI_DRAFT_MODEL ?? "claude-haiku-4-5-20251001",
      system: "한국어로 정확히 한 단어만 답한다.",
      user: "'준비완료' 라고만 답하라.",
      maxTokens: 16,
      label: "live-check",
    });

    expect(res.text.length).toBeGreaterThan(0);
    expect(res.outputTokens).toBeGreaterThan(0);

    const after = await guard.snapshot();
    expect(after.callCount).toBe(before.callCount + 1);
    expect(after.spentUsd).toBeGreaterThan(before.spentUsd);
    expect(after.reservedUsd).toBe(0);

    console.warn(`[live-check] 응답: ${res.text.trim()}`);
    console.warn(`[live-check] ${await guard.summary()}`);
  }, 30_000);
});

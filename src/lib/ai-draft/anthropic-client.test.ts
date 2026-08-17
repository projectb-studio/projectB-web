import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CostGuard, BudgetExceededError, estimateCostUsd } from "./cost-guard";
import { callAnthropic } from "./anthropic-client";

const MODEL = "claude-haiku-4-5-20251001";

let dir: string;
let guard: CostGuard;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "pb-client-"));
  guard = new CostGuard({ filePath: join(dir, "usage.json"), budgetUsd: 5 });
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

function okResponse(text: string, usage = { input_tokens: 800, output_tokens: 200 }) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ content: [{ type: "text", text }], usage }),
    text: async () => "",
  } as unknown as Response;
}

const baseInput = {
  model: MODEL,
  system: "시스템 지시",
  user: "사용자 입력",
  maxTokens: 1000,
  label: "test:call",
};

describe("callAnthropic", () => {
  it("응답 텍스트와 실제 토큰 사용량을 돌려준다", async () => {
    const fetchImpl = vi.fn(async () => okResponse("결과 텍스트"));

    const res = await callAnthropic(baseInput, { apiKey: "k", guard, fetchImpl });

    expect(res.text).toBe("결과 텍스트");
    expect(res.inputTokens).toBe(800);
    expect(res.outputTokens).toBe(200);
  });

  it("성공 시 실사용 기준으로 정산한다 (worst-case 예약분은 반환)", async () => {
    const fetchImpl = vi.fn(async () => okResponse("ok"));

    await callAnthropic(baseInput, { apiKey: "k", guard, fetchImpl });

    const snap = await guard.snapshot();
    expect(snap.reservedUsd).toBe(0);
    expect(snap.spentUsd).toBeCloseTo(estimateCostUsd(MODEL, 800, 200), 8);
  });

  it("HTTP 오류면 예약을 되돌리고 비용을 청구하지 않는다", async () => {
    const fetchImpl = vi.fn(
      async () =>
        ({
          ok: false,
          status: 500,
          text: async () => "boom",
          json: async () => ({}),
        }) as unknown as Response
    );

    await expect(
      callAnthropic(baseInput, { apiKey: "k", guard, fetchImpl })
    ).rejects.toThrow(/500/);

    const snap = await guard.snapshot();
    expect(snap.spentUsd).toBe(0);
    expect(snap.reservedUsd).toBe(0);
  });

  it("네트워크 예외에도 예약을 되돌린다", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    });

    await expect(
      callAnthropic(baseInput, { apiKey: "k", guard, fetchImpl })
    ).rejects.toThrow(/network down/);

    const snap = await guard.snapshot();
    expect(snap.reservedUsd).toBe(0);
    expect(snap.spentUsd).toBe(0);
  });

  it("예산이 없으면 fetch 를 아예 호출하지 않는다", async () => {
    const brokeGuard = new CostGuard({
      filePath: join(dir, "broke.json"),
      budgetUsd: 0.0000001,
    });
    const fetchImpl = vi.fn(async () => okResponse("ok"));

    await expect(
      callAnthropic(baseInput, { apiKey: "k", guard: brokeGuard, fetchImpl })
    ).rejects.toBeInstanceOf(BudgetExceededError);

    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("예산 소진 후에는 추가 호출이 차단된다", async () => {
    const perCall = estimateCostUsd(MODEL, 800, 200);
    const tight = new CostGuard({
      filePath: join(dir, "tight.json"),
      // worst-case 예약 1건은 통과하되, 정산 후 잔액이 1건을 더 감당 못 하게 잡는다.
      budgetUsd: estimateCostUsd(MODEL, 1000, 1000) + perCall,
    });
    const fetchImpl = vi.fn(async () => okResponse("ok"));

    await callAnthropic(baseInput, { apiKey: "k", guard: tight, fetchImpl });
    await callAnthropic(baseInput, { apiKey: "k", guard: tight, fetchImpl });

    await expect(
      callAnthropic(baseInput, { apiKey: "k", guard: tight, fetchImpl })
    ).rejects.toBeInstanceOf(BudgetExceededError);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("jsonSchema 를 주면 Structured Outputs 형식으로 실어 보낸다", async () => {
    const fetchImpl = vi.fn(async () => okResponse("{}"));
    const schema = {
      type: "object",
      properties: { a: { type: "string" } },
      required: ["a"],
      additionalProperties: false,
    };

    await callAnthropic(
      { ...baseInput, jsonSchema: schema },
      { apiKey: "k", guard, fetchImpl }
    );

    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(init.body as string) as {
      output_config?: { format?: { type?: string; schema?: unknown } };
    };
    expect(body.output_config?.format?.type).toBe("json_schema");
    expect(body.output_config?.format?.schema).toEqual(schema);
  });

  it("jsonSchema 가 없으면 output_config 를 붙이지 않는다", async () => {
    const fetchImpl = vi.fn(async () => okResponse("ok"));

    await callAnthropic(baseInput, { apiKey: "k", guard, fetchImpl });

    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.output_config).toBeUndefined();
  });

  it("Anthropic 인증 헤더와 모델·max_tokens 를 규격대로 보낸다", async () => {
    const fetchImpl = vi.fn(async () => okResponse("ok"));

    await callAnthropic(baseInput, { apiKey: "secret-key", guard, fetchImpl });

    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["x-api-key"]).toBe("secret-key");
    expect(headers["anthropic-version"]).toBe("2023-06-01");

    const body = JSON.parse(init.body as string) as {
      model: string;
      max_tokens: number;
      system: string;
    };
    expect(body.model).toBe(MODEL);
    expect(body.max_tokens).toBe(1000);
    expect(body.system).toBe("시스템 지시");
  });
});

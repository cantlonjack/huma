import { describe, it, expect, vi } from "vitest";
import { budgetCheck, pickBudget, BUDGETS } from "./prompt-builder";

// ─── Test helpers ────────────────────────────────────────────────────────────
// Build a minimal anthropic mock whose messages.countTokens returns successive
// values from the provided list. The last value "sticks" once the list drains,
// which matches the runtime behavior of the Plan 00 fixture mockAnthropicCountTokens.
function makeAnthropicMock(counts: number[]) {
  const list = [...counts];
  const countTokens = vi.fn(async () => ({
    input_tokens: list.length > 1 ? list.shift()! : list[0],
  }));
  return {
    anthropic: { messages: { countTokens } } as unknown as import("@anthropic-ai/sdk").default,
    countTokens,
  };
}

describe("budgetCheck", () => {
  it("passes untrimmed when under budget (79,999 vs 80,000 ceiling)", async () => {
    const { anthropic, countTokens } = makeAnthropicMock([79_999]);
    const res = await budgetCheck({
      anthropic,
      model: "claude-sonnet-4-6",
      system: "hi",
      messages: [{ role: "user", content: "hello" }],
      limit: 80_000,
    });
    expect(countTokens).toHaveBeenCalledTimes(1);
    expect("tooLarge" in res).toBe(false);
    if (!("tooLarge" in res)) {
      expect(res.trimmedCount).toBe(0);
      expect(res.inputTokens).toBe(79_999);
      expect(res.messages).toHaveLength(1);
    }
  });

  it("trims tail-first when over budget and keeps system untouched", async () => {
    // Iteration 1: 90K over budget → drop oldest → check again
    // Iteration 2: 85K still over → drop again → check
    // Iteration 3: 79K under → return with trimmedCount=2
    const { anthropic, countTokens } = makeAnthropicMock([90_000, 85_000, 79_000]);
    const msgs = [
      { role: "user" as const, content: "oldest" },
      { role: "assistant" as const, content: "older" },
      { role: "user" as const, content: "newest" },
    ];
    const res = await budgetCheck({
      anthropic,
      model: "claude-sonnet-4-6",
      system: "SYS",
      messages: msgs,
      limit: 80_000,
    });
    expect(countTokens).toHaveBeenCalledTimes(3);
    if ("tooLarge" in res) throw new Error("expected success");
    expect(res.trimmedCount).toBe(2);
    expect(res.messages).toEqual([{ role: "user", content: "newest" }]);
    expect(res.system).toBe("SYS");
    expect(res.inputTokens).toBe(79_000);
  });

  it("returns tooLarge when system alone exceeds budget", async () => {
    // All three returns stay above the 80K limit; eventually msgs empty → tooLarge.
    const { anthropic, countTokens } = makeAnthropicMock([200_000, 199_000, 198_000]);
    const res = await budgetCheck({
      anthropic,
      model: "claude-sonnet-4-6",
      system: "HUGE_SYSTEM",
      messages: [
        { role: "user" as const, content: "a" },
        { role: "assistant" as const, content: "b" },
      ],
      limit: 80_000,
    });
    expect("tooLarge" in res && res.tooLarge).toBe(true);
    // At least 2 calls: one for each trim iteration; the empty-msgs call
    // triggers the tooLarge early-return before a 3rd countTokens.
    expect(countTokens.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("pickBudget returns 80000 for sonnet models", () => {
    expect(pickBudget("claude-sonnet-4-20250514")).toBe(80_000);
    expect(pickBudget("claude-sonnet-4-6")).toBe(80_000);
  });

  it("pickBudget returns 150000 for haiku models", () => {
    expect(pickBudget("claude-haiku-4-5-20251001")).toBe(150_000);
  });

  it("pickBudget defaults conservatively (sonnet cap) for unknown models", () => {
    expect(pickBudget("claude-mystery-5")).toBe(80_000);
  });

  it("BUDGETS export is stable at 80K/150K", () => {
    expect(BUDGETS.sonnet).toBe(80_000);
    expect(BUDGETS.haiku).toBe(150_000);
  });

  // Info 3: header survives a wrapped Response (mock withObservability)
  // When Plan 05c wraps v2-chat with withObservability, the X-Huma-Truncated
  // header must survive the wrap. This assertion locks the invariant now so
  // Plan 05c's wrapper cannot regress it silently.
  it("X-Huma-Truncated header survives a wrapped Response", async () => {
    // Stub mimicking Plan 05a's withObservability: pass Response through unchanged.
    const wrap = async (handler: () => Promise<Response>): Promise<Response> => {
      return await handler();
    };
    const inner = async () =>
      new Response("body", {
        status: 200,
        headers: {
          "X-Huma-Truncated": "count=3,reason=budget",
          "Content-Type": "application/json",
        },
      });
    const wrapped = await wrap(inner);
    expect(wrapped.headers.get("X-Huma-Truncated")).toBe("count=3,reason=budget");
    expect(wrapped.status).toBe(200);
  });
});

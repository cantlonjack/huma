import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";

// ─── Budget wiring test suite (Plan 01-03 / SEC-03 + SEC-02 Blocker 6) ───────
// Covers:
//  - budgetCheck runs BEFORE checkAndIncrement (ordering per Blocker 6).
//  - checkAndIncrement receives the accurate inputTokens from countTokens().
//  - tooLarge path returns 413 PAYLOAD_TOO_LARGE with Voice-Bible copy.
//  - X-Huma-Truncated header is emitted only when trim occurred (count > 0).
//  - Cron path (not exercised here — v2-chat has no cron bypass; that's sheet)
//    is out of scope for THIS route; see route.auth.test.ts for cron coverage.

beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  process.env.PHASE_1_GATE_ENABLED = "true";
});

afterEach(() => {
  vi.resetModules();
});

function buildRequestBody() {
  return {
    messages: [
      { role: "user" as const, content: "first" },
      { role: "assistant" as const, content: "reply" },
      { role: "user" as const, content: "second" },
    ],
    knownContext: {},
    aspirations: [],
  };
}

function buildRequest(): Request {
  return new Request("http://localhost/api/v2-chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "127.0.0.1",
    },
    body: JSON.stringify(buildRequestBody()),
  });
}

/**
 * Captures the args passed to the `increment_quota_and_check` RPC so we can
 * assert that `p_input_tokens` equals the value countTokens() returned —
 * that's the core Blocker 6 assertion.
 */
function installQuotaCapture() {
  const rpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = [];
  vi.doMock("@/lib/supabase-admin", () => ({
    createAdminSupabase: () => ({
      rpc: vi.fn(async (fn: string, args: Record<string, unknown>) => {
        rpcCalls.push({ fn, args });
        return {
          data: [
            {
              allowed: true,
              tier: "anonymous",
              reset_at: new Date(Date.now() + 86_400_000).toISOString(),
              req_count: 1,
              token_count: Number(args.p_input_tokens ?? 0),
            },
          ],
          error: null,
        };
      }),
    }),
  }));
  return rpcCalls;
}

describe("/api/v2-chat budget wiring (SEC-03 + SEC-02 Blocker 6)", () => {
  it("passes accurate inputTokens from countTokens() to checkAndIncrement", async () => {
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-budget")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    const rpcCalls = installQuotaCapture();

    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    // Fixture default: inputTokens = 5_000 (well under Sonnet's 80K ceiling).
    const { MockAnthropic, countTokens } = makeMockAnthropic({ text: "hi", inputTokens: 5_000 });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest());
    // Drain response so we don't leak the readable stream across tests.
    try { await (res.body as ReadableStream | null)?.getReader().read(); } catch { /* noop */ }

    expect(res.status).toBe(200);
    // countTokens was called (at least once — the budget check itself).
    expect(countTokens).toHaveBeenCalled();

    // The quota RPC must have fired and received p_input_tokens === 5000.
    const quotaCall = rpcCalls.find((c) => c.fn === "increment_quota_and_check");
    expect(quotaCall).toBeTruthy();
    expect(quotaCall?.args.p_input_tokens).toBe(5_000);
    expect(quotaCall?.args.p_route).toBe("/api/v2-chat");

    // No trim occurred — no X-Huma-Truncated header.
    expect(res.headers.get("X-Huma-Truncated")).toBeNull();
  });

  it("runs budgetCheck BEFORE checkAndIncrement (ordering)", async () => {
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-order")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));

    // Order-sensitive mock: record timestamps when each boundary fires.
    const order: string[] = [];
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => ({
        rpc: vi.fn(async () => {
          order.push("quota");
          return {
            data: [
              {
                allowed: true,
                tier: "anonymous",
                reset_at: new Date(Date.now() + 86_400_000).toISOString(),
                req_count: 1,
                token_count: 100,
              },
            ],
            error: null,
          };
        }),
      }),
    }));

    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    const { MockAnthropic, countTokens } = makeMockAnthropic({ text: "hi", inputTokens: 2_000 });
    // Override countTokens to record order.
    countTokens.mockImplementation(async () => {
      order.push("budget");
      return { input_tokens: 2_000 };
    });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest());
    try { await (res.body as ReadableStream | null)?.getReader().read(); } catch { /* noop */ }

    const budgetIdx = order.indexOf("budget");
    const quotaIdx = order.indexOf("quota");
    expect(budgetIdx).toBeGreaterThanOrEqual(0);
    expect(quotaIdx).toBeGreaterThanOrEqual(0);
    // Blocker 6: budget MUST run before quota so the latter gets accurate tokens.
    expect(budgetIdx).toBeLessThan(quotaIdx);
  });

  it("returns 413 PAYLOAD_TOO_LARGE when system alone exceeds budget", async () => {
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-413")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    const rpcCalls = installQuotaCapture();

    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    // Every countTokens call returns a huge count so every trim iteration
    // still overflows. Eventually msgs[] empties → budgetCheck → tooLarge.
    const { MockAnthropic, countTokens } = makeMockAnthropic({ text: "hi", inputTokens: 200_000 });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest());

    expect(res.status).toBe(413);
    const body = (await res.json()) as { code?: string; error?: string };
    expect(body.code).toBe("PAYLOAD_TOO_LARGE");
    // Voice-Bible tone — no cheerleading, no "please", direct.
    expect(body.error).toMatch(/thread/i);

    // countTokens ran; checkAndIncrement did NOT — we short-circuited before it.
    expect(countTokens).toHaveBeenCalled();
    expect(rpcCalls.find((c) => c.fn === "increment_quota_and_check")).toBeUndefined();
  });

  it("emits X-Huma-Truncated header when trim occurred", async () => {
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-trim")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    installQuotaCapture();

    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    const { MockAnthropic, countTokens } = makeMockAnthropic({ text: "hi", inputTokens: 1_000 });
    // Script: first two calls overflow, third is under → 2 trims happen.
    countTokens
      .mockResolvedValueOnce({ input_tokens: 100_000 })
      .mockResolvedValueOnce({ input_tokens: 90_000 })
      .mockResolvedValueOnce({ input_tokens: 50_000 });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest());
    try { await (res.body as ReadableStream | null)?.getReader().read(); } catch { /* noop */ }

    expect(res.status).toBe(200);
    const truncated = res.headers.get("X-Huma-Truncated");
    expect(truncated).not.toBeNull();
    expect(truncated).toMatch(/count=2,reason=budget/);
  });
});

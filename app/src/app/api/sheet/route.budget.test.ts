import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";

// ─── Budget wiring test suite for /api/sheet (Plan 01-03 / SEC-03 + Blocker 6)
// Mirrors v2-chat budget tests, but for the non-streaming sheet route using
// anthropic.messages.create. Covers:
//   - budgetCheck runs BEFORE checkAndIncrement (ordering).
//   - checkAndIncrement receives accurate inputTokens from countTokens().
//   - tooLarge path returns 413 PAYLOAD_TOO_LARGE with Voice-Bible body.
//   - X-Huma-Truncated header emitted only when trim occurred (count > 0).
//   - Cron path (Bearer CRON_SECRET) bypasses BOTH budget AND quota.

beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  process.env.PHASE_1_GATE_ENABLED = "true";
  process.env.CRON_SECRET = "cron-secret-test";
});

afterEach(() => {
  vi.resetModules();
});

function buildSheetBody() {
  return {
    name: "Sarah",
    date: "2026-04-17",
    aspirations: [
      {
        id: "a1",
        rawText: "Build daily movement",
        clarifiedText: "Build daily movement",
        behaviors: [
          { key: "walk", text: "20-min walk", frequency: "daily", enabled: true, dimensions: ["body"] },
        ],
      },
    ],
    knownContext: {},
    recentHistory: [],
    conversationMessages: [],
    dayCount: 14,
    archetypes: [],
    whyStatement: "",
    timeOfDay: "morning",
  };
}

function buildRequest(opts: { auth?: string } = {}): Request {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-forwarded-for": "127.0.0.1",
  };
  if (opts.auth) headers["authorization"] = opts.auth;
  return new Request("http://localhost/api/sheet", {
    method: "POST",
    headers,
    body: JSON.stringify(buildSheetBody()),
  });
}

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

describe("/api/sheet budget wiring (SEC-03 + SEC-02 Blocker 6)", () => {
  it("passes accurate inputTokens from countTokens() to checkAndIncrement", async () => {
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-sheet-bud")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    const rpcCalls = installQuotaCapture();

    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    const { MockAnthropic, countTokens } = makeMockAnthropic({
      text: JSON.stringify({ opening: "hi", through_line: "go", entries: [] }),
      inputTokens: 7_000,
    });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest());

    expect(res.status).toBe(200);
    expect(countTokens).toHaveBeenCalled();

    const quotaCall = rpcCalls.find((c) => c.fn === "increment_quota_and_check");
    expect(quotaCall).toBeTruthy();
    expect(quotaCall?.args.p_input_tokens).toBe(7_000);
    expect(quotaCall?.args.p_route).toBe("/api/sheet");

    expect(res.headers.get("X-Huma-Truncated")).toBeNull();
  });

  it("runs budgetCheck BEFORE checkAndIncrement (ordering)", async () => {
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-sheet-ord")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));

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
                token_count: 4_000,
              },
            ],
            error: null,
          };
        }),
      }),
    }));

    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    const { MockAnthropic, countTokens } = makeMockAnthropic({
      text: JSON.stringify({ opening: "hi", through_line: "go", entries: [] }),
      inputTokens: 4_000,
    });
    countTokens.mockImplementation(async () => {
      order.push("budget");
      return { input_tokens: 4_000 };
    });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    await POST(buildRequest());

    const budgetIdx = order.indexOf("budget");
    const quotaIdx = order.indexOf("quota");
    expect(budgetIdx).toBeGreaterThanOrEqual(0);
    expect(quotaIdx).toBeGreaterThanOrEqual(0);
    expect(budgetIdx).toBeLessThan(quotaIdx);
  });

  it("returns 413 PAYLOAD_TOO_LARGE when system alone exceeds budget", async () => {
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-sheet-413")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    const rpcCalls = installQuotaCapture();

    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    // Every countTokens call stays above 80K Sonnet cap → tooLarge.
    const { MockAnthropic, countTokens } = makeMockAnthropic({
      text: "{}",
      inputTokens: 200_000,
    });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest());

    expect(res.status).toBe(413);
    const body = (await res.json()) as { code?: string; error?: string };
    expect(body.code).toBe("PAYLOAD_TOO_LARGE");
    expect(body.error).toMatch(/thread/i);
    expect(countTokens).toHaveBeenCalled();
    expect(rpcCalls.find((c) => c.fn === "increment_quota_and_check")).toBeUndefined();
  });

  it("emits X-Huma-Truncated header when trim occurred", async () => {
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-sheet-trim")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    installQuotaCapture();

    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    const { MockAnthropic, countTokens } = makeMockAnthropic({
      text: JSON.stringify({ opening: "hi", through_line: "go", entries: [] }),
      inputTokens: 1_000,
    });
    // Sheet uses Sonnet (80K) unconditionally. Two trims, then fits.
    countTokens
      .mockResolvedValueOnce({ input_tokens: 100_000 })
      .mockResolvedValueOnce({ input_tokens: 90_000 })
      .mockResolvedValueOnce({ input_tokens: 50_000 });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    // Sheet builds messages[] internally from req.conversationMessages — to
    // guarantee ≥2 entries exist so two trims can happen, include two
    // messages in the request body.
    const body = buildSheetBody();
    const req = new Request("http://localhost/api/sheet", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
      body: JSON.stringify({
        ...body,
        conversationMessages: [
          { role: "user", content: "turn 1" },
          { role: "assistant", content: "reply 1" },
          { role: "user", content: "turn 2" },
        ],
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const truncated = res.headers.get("X-Huma-Truncated");
    expect(truncated).not.toBeNull();
    expect(truncated).toMatch(/count=2,reason=budget/);
  });

  it("cron (Bearer CRON_SECRET) bypasses both budgetCheck AND quota", async () => {
    const { mockSupabaseNoSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseNoSession()),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    const rpcCalls = installQuotaCapture();

    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    const { MockAnthropic, countTokens } = makeMockAnthropic({
      text: JSON.stringify({ opening: "cron", through_line: "go", entries: [] }),
      inputTokens: 3_000,
    });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ auth: "Bearer cron-secret-test" }));

    expect(res.status).toBe(200);
    // Cron must NOT invoke countTokens OR the quota RPC. No budget, no ledger.
    expect(countTokens).not.toHaveBeenCalled();
    expect(rpcCalls.find((c) => c.fn === "increment_quota_and_check")).toBeUndefined();
    // And no truncation header on cron either.
    expect(res.headers.get("X-Huma-Truncated")).toBeNull();
  });
});

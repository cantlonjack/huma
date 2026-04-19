import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";

// ─── Route-level auth test suite (Plan 01-01 / SEC-01) ──────────────────────
// Covers:
//  - No session + gate enabled → 401
//  - Anon session + gate enabled → passes auth (status !== 401)
//  - Permanent user + IP rate-limit tripped → STILL proceeds (Warning 1:
//    permanent users skip the IP cap — their per-user ledger covers them).

beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  process.env.PHASE_1_GATE_ENABLED = "true";
});

afterEach(() => {
  vi.resetModules();
});

function buildRequestBody() {
  return {
    messages: [{ role: "user" as const, content: "hi" }],
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
 * Stub for the SEC-02 quota check that fires AFTER auth/IP-limit for users
 * with a stable id. Tests that traverse the quota path without caring about
 * denial logic simply return allowed=true so the route continues.
 */
function mockQuotaAllowAll() {
  vi.doMock("@/lib/supabase-admin", () => ({
    createAdminSupabase: () => ({
      rpc: vi.fn(async () => ({
        data: [
          {
            allowed: true,
            tier: "free",
            reset_at: new Date(Date.now() + 86_400_000).toISOString(),
            req_count: 1,
            token_count: 0,
          },
        ],
        error: null,
      })),
    }),
  }));
}

describe("/api/v2-chat auth gate (SEC-01)", () => {
  it("returns 401 when gate enabled and no session", async () => {
    const { mockSupabaseNoSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseNoSession()),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    const { MockAnthropic } = makeMockAnthropic();
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest());
    expect(res.status).toBe(401);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("UNAUTHORIZED");
  });

  it("proceeds past auth for anon session (status !== 401)", async () => {
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-1")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    mockQuotaAllowAll();
    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    const { MockAnthropic } = makeMockAnthropic({ text: "hi" });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest());
    expect(res.status).not.toBe(401);
  });

  it("Warning 1: permanent user skips IP rate-limit (proceeds even when isRateLimited=true)", async () => {
    const { mockSupabaseAuthedSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () =>
        Promise.resolve(mockSupabaseAuthedSession("u-1", { tier: "free" })),
    }));
    // IP limit tripped — but Warning 1 says permanent users must skip it.
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => true }));
    mockQuotaAllowAll();
    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    const { MockAnthropic } = makeMockAnthropic({ text: "hi" });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest());
    expect(res.status).not.toBe(429);
    expect(res.status).not.toBe(401);
  });

  it("anon user IS subject to IP rate-limit (Warning 1: anon/unauth only)", async () => {
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-2")),
    }));
    // IP limit tripped — anon user should get 429.
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => true }));
    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    const { MockAnthropic } = makeMockAnthropic({ text: "hi" });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest());
    expect(res.status).toBe(429);
  });
});

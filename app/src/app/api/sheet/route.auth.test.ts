import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";

// ─── Route-level auth test suite for /api/sheet (Plan 01-01 / SEC-01) ────────
// Covers:
//  - No session + no bearer + gate enabled → 401
//  - Bearer = CRON_SECRET → bypass, proceeds (status !== 401)
//  - Bearer = wrong secret → 401 (falls through cron-check to gate)
//  - Anon session + gate enabled → proceeds
//  - Permanent user + IP-limit tripped → proceeds (Warning 1)

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
    aspirations: [],
    knownContext: {},
    recentHistory: [],
    conversationMessages: [],
    dayCount: 1,
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

/**
 * Stub for the SEC-02 quota check that fires AFTER auth/IP-limit for users
 * with a stable id. Cron bypasses this; authed/anon traverse it. These tests
 * don't care about denial logic — allow all so the route continues.
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

describe("/api/sheet auth gate (SEC-01)", () => {
  it("returns 401 when no session and no bearer", async () => {
    const { mockSupabaseNoSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseNoSession()),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    vi.doMock("@anthropic-ai/sdk", async () => {
      const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
      return { default: makeMockAnthropic().MockAnthropic };
    });

    const { POST } = await import("./route");
    const res = await POST(buildRequest());
    expect(res.status).toBe(401);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("UNAUTHORIZED");
  });

  it("bypasses auth with Bearer CRON_SECRET (status !== 401)", async () => {
    const { mockSupabaseNoSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseNoSession()),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    vi.doMock("@anthropic-ai/sdk", async () => {
      const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
      return { default: makeMockAnthropic().MockAnthropic };
    });

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ auth: "Bearer cron-secret-test" }));
    expect(res.status).not.toBe(401);
  });

  it("returns 401 with bogus bearer (not CRON_SECRET, not session)", async () => {
    const { mockSupabaseNoSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseNoSession()),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    vi.doMock("@anthropic-ai/sdk", async () => {
      const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
      return { default: makeMockAnthropic().MockAnthropic };
    });

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ auth: "Bearer wrong-secret" }));
    expect(res.status).toBe(401);
  });

  it("proceeds past auth for anon session (status !== 401)", async () => {
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-3")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    mockQuotaAllowAll();
    vi.doMock("@anthropic-ai/sdk", async () => {
      const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
      return { default: makeMockAnthropic().MockAnthropic };
    });

    const { POST } = await import("./route");
    const res = await POST(buildRequest());
    expect(res.status).not.toBe(401);
  });

  it("Warning 1: permanent user skips IP rate-limit (proceeds even when isRateLimited=true)", async () => {
    const { mockSupabaseAuthedSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () =>
        Promise.resolve(mockSupabaseAuthedSession("u-2", { tier: "free" })),
    }));
    // IP limit tripped — permanent user must still proceed.
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => true }));
    mockQuotaAllowAll();
    vi.doMock("@anthropic-ai/sdk", async () => {
      const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
      return { default: makeMockAnthropic().MockAnthropic };
    });

    const { POST } = await import("./route");
    const res = await POST(buildRequest());
    expect(res.status).not.toBe(429);
    expect(res.status).not.toBe(401);
  });
});

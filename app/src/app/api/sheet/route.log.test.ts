import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";

// ─── SEC-05 observability log test for /api/sheet (Plan 01-05b) ─────────────
// Asserts the sheet route emits the canonical 7-field `LogPayload` to stdout
// on request exit, with:
//   - req_id: valid ULID
//   - user_id: resolved from authCtx.user?.id
//   - source: "user"
//   - latency_ms: numeric
//   - output_tokens > 0 (Warning 5 in practice — resp.usage is captured
//     BEFORE the Response returns so the finally-block sees non-zero).
//
// All Anthropic + Supabase + quota calls mocked; observability's retry queue
// inserts are stubbed via createAdminSupabase mock.

beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  process.env.PHASE_1_GATE_ENABLED = "true";
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
    dayCount: 1,
    archetypes: [],
    whyStatement: "",
    timeOfDay: "morning",
  };
}

function buildRequest(): Request {
  return new Request("http://localhost/api/sheet", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "127.0.0.1",
    },
    body: JSON.stringify(buildSheetBody()),
  });
}

describe("/api/sheet observability log (SEC-05)", () => {
  it("emits log with all 7 fields + output_tokens > 0 (Warning 5 in practice)", async () => {
    // ─── Mocks ─────────────────────────────────────────────────────────────
    const { mockSupabaseAuthedSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAuthedSession("u-1")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));

    // Admin client services BOTH the quota RPC (sheet route) AND the
    // observability cost_metrics_raw insert. Both must succeed.
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => ({
        rpc: vi.fn(async () => ({
          data: [
            {
              allowed: true,
              tier: "free",
              reset_at: new Date(Date.now() + 86_400_000).toISOString(),
              req_count: 1,
              token_count: 250,
            },
          ],
          error: null,
        })),
        from: () => ({ insert: vi.fn(async () => ({ error: null })) }),
      }),
    }));

    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    const { MockAnthropic } = makeMockAnthropic({
      text: JSON.stringify({ opening: "hi", through_line: "go", entries: [] }),
      inputTokens: 250,
      outputTokens: 50,
    });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    // ─── Capture console.log JSON payloads ─────────────────────────────────
    const { captureConsoleLog } = await import("@/__tests__/fixtures/capture-log");
    const cap = captureConsoleLog();

    try {
      const { POST } = await import("./route");
      const res = await POST(buildRequest());
      expect(res.status).toBe(200);

      const { isULID } = await import("@/lib/ulid");
      const log = cap.logs.find((l) => l.route === "/api/sheet");
      expect(log, "expected a log payload for /api/sheet").toBeDefined();
      expect(isULID(log!.req_id ?? "")).toBe(true);
      expect(log!.user_id).toBe("u-1");
      expect(log!.source).toBe("user");
      expect(typeof log!.latency_ms).toBe("number");
      expect(log!.status).toBe(200);
      // Warning 5: closure-based token capture means output_tokens appears
      // in the payload BEFORE the Response returns.
      expect(log!.output_tokens).toBeGreaterThan(0);
      // Prompt tokens wired from resp.usage.input_tokens.
      expect(log!.prompt_tokens).toBeGreaterThan(0);
    } finally {
      cap.restore();
    }
  });
});

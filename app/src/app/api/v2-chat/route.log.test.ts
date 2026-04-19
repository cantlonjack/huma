import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";

// ─── Observability wrap test suite (Plan 01-05c / SEC-05) ────────────────────
// v2-chat is the ONLY streaming Anthropic-calling route. The wrap emits TWO log
// entries per successful request:
//
//   1. Outer wrapper's finally-block fires when the handler returns the
//      Response — output_tokens=0 at that point because the stream is still
//      in-flight.
//   2. stream.on("finalMessage", ...) listener runs LATER (after the consumer
//      drains the ReadableStream). Closure captures `obs` and emits a second
//      log entry tagged { reconciles: <reqId> } with the REAL input/output
//      token counts from stream.finalMessage().usage.
//
// The cost-rollup cron GROUPs BY req_id and picks MAX(output_tokens) — the
// reconciliation entry wins. Warning 5: closure scope, NEVER globalThis.
//
// Blocker 6 follow-through: the finalMessage listener also fires a secondary
// `admin.from("user_quota_ledger").update(...).eq("req_id", obs.reqId)` so
// Plan 02's ledger counter reflects actual output tokens, not just the
// pre-stream input-only figure.

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
 * Minimal admin stub — captures the secondary `user_quota_ledger.update(...)`
 * calls so the test can assert the reconciliation write fired.
 */
function installAdminCapture() {
  const ledgerUpdates: Array<{ values: unknown; reqId: unknown }> = [];
  vi.doMock("@/lib/supabase-admin", () => ({
    createAdminSupabase: () => ({
      from: (table: string) => {
        if (table === "user_quota_ledger") {
          return {
            update: vi.fn((values: unknown) => ({
              eq: vi.fn(async (_col: string, reqId: unknown) => {
                ledgerUpdates.push({ values, reqId });
                return { error: null };
              }),
            })),
            insert: vi.fn(async () => ({ error: null })),
          };
        }
        // cost_metrics_raw mirror + any other fallthrough tables — accept all.
        return {
          insert: vi.fn(async () => ({ error: null })),
          update: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
        };
      },
      rpc: vi.fn(async () => ({
        data: [
          {
            allowed: true,
            tier: "anonymous",
            reset_at: new Date(Date.now() + 86_400_000).toISOString(),
            req_count: 1,
            token_count: 1,
          },
        ],
        error: null,
      })),
      auth: {
        admin: {
          getUserById: vi.fn(async () => ({
            data: { user: { id: "anon-u", is_anonymous: true } },
          })),
        },
      },
    }),
  }));
  return ledgerUpdates;
}

describe("/api/v2-chat observability wrap (SEC-05)", () => {
  it("emits reconciliation log entry with output_tokens > 0 via closure-scoped finalMessage listener (Warning 5)", async () => {
    const { captureConsoleLog } = await import("@/__tests__/fixtures/capture-log");
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    const { isULID } = await import("@/lib/ulid");

    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-u")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    installAdminCapture();

    const { MockAnthropic, stream } = makeMockAnthropic({
      text: "hello",
      inputTokens: 123,
      outputTokens: 7,
    });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const cap = captureConsoleLog();
    const { POST } = await import("./route");
    const res = await POST(buildRequest());

    // Drain the stream so iteration completes and the synthesized finalMessage
    // listener has a chance to fire.
    try {
      const reader = (res.body as ReadableStream | null)?.getReader();
      if (reader) {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      }
    } catch {
      /* noop */
    }

    // The mock's stream.on("finalMessage", listener) is recorded as a listener
    // but the mock doesn't auto-fire on iteration — emit it explicitly to
    // simulate the SDK's post-stream completion hook.
    (stream as unknown as { _emit: (event: string, arg: unknown) => void })._emit(
      "finalMessage",
      { usage: { input_tokens: 123, output_tokens: 7 } },
    );
    // Give the .then / microtask chain on the ledger update a tick to flush.
    await new Promise((r) => setTimeout(r, 10));

    const v2Logs = cap.logs.filter((l) => l.route === "/api/v2-chat");
    expect(v2Logs.length).toBeGreaterThanOrEqual(1);
    expect(isULID(v2Logs[0].req_id ?? "")).toBe(true);

    // Reconciliation log carries the real output_tokens (Warning 5 in practice).
    const reconciliation = v2Logs.find(
      (l) => (l as { reconciles?: string }).reconciles !== undefined,
    );
    expect(reconciliation, "expected a reconciliation log entry").toBeDefined();
    expect(reconciliation!.output_tokens).toBeGreaterThan(0);
    expect(reconciliation!.output_tokens).toBe(7);
    // The reconciles field points back at the outer request's req_id so the
    // cost-rollup cron can GROUP BY req_id and pick MAX.
    expect((reconciliation as { reconciles?: string }).reconciles).toBe(
      v2Logs[0].req_id,
    );
    cap.restore();
  });

  it("emits log with status=401 when unauthenticated (gate enabled)", async () => {
    const { captureConsoleLog } = await import("@/__tests__/fixtures/capture-log");
    const { mockSupabaseNoSession } = await import("@/__tests__/fixtures/mock-supabase");
    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");

    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseNoSession()),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    const { MockAnthropic } = makeMockAnthropic();
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const cap = captureConsoleLog();
    const { POST } = await import("./route");
    const res = await POST(buildRequest());
    expect(res.status).toBe(401);

    // The 401 short-circuit is also wrapped so the log is emitted uniformly.
    const log = cap.logs.find((l) => l.route === "/api/v2-chat");
    expect(log).toBeDefined();
    expect(log!.status).toBe(401);
    cap.restore();
  });

  it("secondary user_quota_ledger.update fires on finalMessage — Blocker 6 follow-through", async () => {
    const { captureConsoleLog } = await import("@/__tests__/fixtures/capture-log");
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");

    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-u")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    const ledgerUpdates = installAdminCapture();

    const { MockAnthropic, stream } = makeMockAnthropic({
      text: "hi",
      inputTokens: 50,
      outputTokens: 12,
    });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const cap = captureConsoleLog();
    const { POST } = await import("./route");
    const res = await POST(buildRequest());
    try {
      const reader = (res.body as ReadableStream | null)?.getReader();
      if (reader) {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      }
    } catch {
      /* noop */
    }
    (stream as unknown as { _emit: (event: string, arg: unknown) => void })._emit(
      "finalMessage",
      { usage: { input_tokens: 50, output_tokens: 12 } },
    );
    await new Promise((r) => setTimeout(r, 10));

    expect(ledgerUpdates.length).toBeGreaterThanOrEqual(1);
    // token_count reconciliation = input + output.
    const values = ledgerUpdates[0].values as { token_count?: number };
    expect(values.token_count).toBe(62);
    cap.restore();
  });
});

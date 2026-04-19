import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";

// ─── morning-sheet cron observability test (Plan 01-05c / SEC-05 / Blocker 4) ─
// Blocker 4 matters here: /api/cron/morning-sheet does NOT import
// @anthropic-ai/sdk. It calls /api/sheet and /api/insight via fetch. The
// observability-coverage.test.ts meta-test uses an INDIRECT_ALLOWLIST to
// catch this case; this per-route test exercises the wrap itself.
//
// We mock globalThis.fetch (NOT the SDK) so the cron's fetch-to-internal-
// routes path is the thing under test. The INNER routes (/api/sheet, /api/
// insight) log their own usage; this cron-level log is for operator-count
// attribution. DOCUMENTED GAP: prompt_tokens/output_tokens at the cron-
// level per-operator log are 0 because /api/sheet and /api/insight don't
// expose usage in their JSON response bodies. Phase 2 may add that.

// ─── Module-scope mocks (hoisted by vitest) ──────────────────────────────────
vi.mock("@/lib/supabase-admin", () => ({
  createAdminSupabase: () => ({
    from: (table: string) => {
      if (table === "push_subscriptions") {
        return {
          select: () => ({
            order: () => ({
              data: [
                { user_id: "op-1" },
                { user_id: "op-2" },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "aspirations") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                data: [
                  {
                    id: "a1",
                    raw_text: "x",
                    clarified_text: "x",
                    behaviors: [{ key: "b1", text: "behavior", frequency: "daily", enabled: true }],
                    status: "active",
                    stage: "active",
                  },
                ],
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "contexts") {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({
                  single: async () => ({
                    data: {
                      known_context: { operator_name: "Sam" },
                      why_statement: "",
                      created_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === "sheet_entries") {
        return {
          select: () => ({
            eq: () => ({
              gte: () => ({ data: [], error: null }),
            }),
          }),
        };
      }
      if (table === "chat_messages") {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({ data: [], error: null }),
              }),
            }),
          }),
        };
      }
      // cost_metrics_raw mirror fallthrough — accept inserts.
      return { insert: vi.fn(async () => ({ error: null })) };
    },
    rpc: vi.fn(),
  }),
}));

vi.mock("@/lib/push-send", () => ({
  sendPushToUser: vi.fn(async () => 1),
}));
vi.mock("@/lib/supabase-v2", () => ({
  saveInsight: vi.fn(async () => null),
  getUndeliveredInsight: vi.fn(async () => null),
  markInsightDelivered: vi.fn(async () => null),
}));

beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = "test";
  process.env.CRON_SECRET = "test-cron";
});

describe("morning-sheet cron observability (Plan 01-05c / SEC-05 / Blocker 4)", () => {
  let cap: { logs: Array<Record<string, unknown>>; restore: () => void };
  let fetchSpy: ReturnType<typeof vi.spyOn> | undefined;

  beforeEach(async () => {
    const { captureConsoleLog } = await import("@/__tests__/fixtures/capture-log");
    cap = captureConsoleLog();
    // Blocker 4: mock fetch (NOT the SDK) — cron fans out to internal routes.
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (url: unknown) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/sheet")) {
        return new Response(
          JSON.stringify({
            entries: [{ headline: "test briefing", time_of_day: "morning" }],
            through_line: "",
          }),
          { status: 200 },
        );
      }
      if (urlStr.includes("/api/insight")) {
        return new Response(JSON.stringify({ insight: null }), { status: 200 });
      }
      return new Response("not found", { status: 404 });
    });
  });

  afterEach(() => {
    cap.restore();
    fetchSpy?.mockRestore();
  });

  it("emits outer log entry tagged source:'cron' (wrapped in withObservability)", async () => {
    const { GET } = await import("./route");
    const req = new Request("http://localhost/api/cron/morning-sheet", {
      headers: { authorization: "Bearer test-cron" },
    });
    await GET(req).catch(() => null);

    const cronLogs = cap.logs.filter((l) => l.source === "cron");
    expect(cronLogs.length).toBeGreaterThanOrEqual(1);

    // The outer wrapper log has route /api/cron/morning-sheet and no
    // parent_req_id (per-operator logs carry parent_req_id — see next case).
    const outerLog = cronLogs.find(
      (l) => l.route === "/api/cron/morning-sheet" && !(l as { parent_req_id?: string }).parent_req_id,
    );
    expect(outerLog, "expected outer cron log entry").toBeDefined();
    // ULID shape of req_id.
    expect(typeof outerLog!.req_id).toBe("string");
    expect(outerLog!.req_id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
  });

  it("emits per-operator logs with parent_req_id correlation", async () => {
    const { GET } = await import("./route");
    const req = new Request("http://localhost/api/cron/morning-sheet", {
      headers: { authorization: "Bearer test-cron" },
    });
    await GET(req).catch(() => null);

    const perOpLogs = cap.logs.filter(
      (l) => (l as { parent_req_id?: string }).parent_req_id !== undefined,
    );
    // Fixtures seed 2 operators; each gets one per-op log.
    expect(perOpLogs.length).toBeGreaterThanOrEqual(1);
    // All per-op logs share the same parent_req_id (the outer wrap's req_id).
    const parents = new Set(perOpLogs.map((l) => (l as { parent_req_id?: string }).parent_req_id));
    expect(parents.size).toBe(1);
    // DOCUMENTED GAP: prompt_tokens/output_tokens are 0 because /api/sheet
    // and /api/insight don't expose usage in their JSON response bodies.
    for (const log of perOpLogs) {
      expect(log.prompt_tokens).toBe(0);
      expect(log.output_tokens).toBe(0);
      expect(log.source).toBe("cron");
    }
  });

  it("returns 401 for requests without CRON_SECRET — still wrapped", async () => {
    const { GET } = await import("./route");
    const req = new Request("http://localhost/api/cron/morning-sheet");
    const res = await GET(req).catch(() => null);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
    // The outer wrap still emitted a log for observability.
    const log = cap.logs.find((l) => l.route === "/api/cron/morning-sheet");
    expect(log).toBeDefined();
    expect(log!.status).toBe(401);
  });
});

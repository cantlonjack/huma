import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";

/**
 * REGEN-02 Plan 02-02: POST /api/operator/dormancy route tests.
 *
 * Replaces Wave 0 .skip stubs with real assertions:
 *   1. enable persists huma_context.dormant = { active:true, since: ISO }
 *   2. disable leaves `since` intact (analytics preservation)
 *   3. anonymous sessions are first-class operators
 *   4. no session → 401
 *   5. audit log emits action:"enable"|"disable" with user_id + route
 *   6. mid-day toggle-on does NOT touch sheet_entries or behavior_log
 *      (truth-respecting — declared Dormancy doesn't erase today's work)
 *
 * Supabase chain mocks: the route calls `.from('contexts')...select...
 * limit(1).single()` to load then `.from('contexts').update(...).eq(...)` to
 * save. We supply a chainable mock that satisfies both.
 */

beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = "sk-test";
  process.env.PHASE_1_GATE_ENABLED = "true";
});

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
});

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/operator/dormancy", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── Mock builder ───────────────────────────────────────────────────────
//
// The route reads .from("contexts").select("id, huma_context")
// .eq("user_id", userId).order().limit(1).single() then updates with
// .from("contexts").update(nextHC).eq("id", ctxId).
//
// Tests may ALSO exercise non-contexts table paths (sheet_entries,
// behavior_log) to prove they are never touched — we surface a `tableCalls`
// array so the mid-day-preserve assertion can inspect what .from() saw.

function buildSupaMock(opts: {
  existingCtx?: { id: string; huma_context: Record<string, unknown> } | null;
  loadError?: boolean;
  updateError?: boolean;
  onUpdate?: (payload: Record<string, unknown>) => void;
}) {
  const existingCtx = opts.existingCtx ?? {
    id: "ctx-1",
    huma_context: {},
  };
  const loadError = opts.loadError ?? false;
  const updateError = opts.updateError ?? false;

  const tableCalls: string[] = [];

  const from = vi.fn((table: string) => {
    tableCalls.push(table);
    if (table !== "contexts") {
      // Any non-contexts access is a failure — the route should never touch
      // sheet_entries or behavior_log. We still return a safe shape so the
      // mid-day-preserve test can assert the table call itself happened-not.
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                single: vi.fn(async () => ({ data: null, error: null })),
              })),
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(async () => ({ data: null, error: null })),
        })),
      };
    }

    // contexts table — the route's target surface.
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: loadError ? null : existingCtx,
                error: loadError ? { message: "boom" } : null,
              })),
            })),
          })),
        })),
      })),
      update: vi.fn((payload: Record<string, unknown>) => {
        if (opts.onUpdate) opts.onUpdate(payload);
        return {
          eq: vi.fn(async () => ({
            data: null,
            error: updateError ? { message: "save failed" } : null,
          })),
        };
      }),
    };
  });

  return {
    supa: { from },
    tableCalls,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────

describe("REGEN-02: POST /api/operator/dormancy", () => {
  it("enabling persists huma_context.dormant = { active: true, since: ISO }", async () => {
    let capturedUpdate: Record<string, unknown> | null = null;
    const { supa } = buildSupaMock({
      existingCtx: { id: "ctx-1", huma_context: {} },
      onUpdate: (payload) => {
        capturedUpdate = payload;
      },
    });
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: async () => supa,
    }));
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => ({
        ctx: {
          user: { id: "u-1", is_anonymous: false, email: null },
          isCron: false,
          source: "user",
        },
      }),
    }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ enable: true }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; active: boolean };
    expect(body.ok).toBe(true);
    expect(body.active).toBe(true);

    // The update payload carries the new dormant block.
    expect(capturedUpdate).toBeTruthy();
    const hc = (capturedUpdate as { huma_context: Record<string, unknown> })
      .huma_context;
    const dormant = (hc.dormant as { active: boolean; since: string });
    expect(dormant.active).toBe(true);
    expect(typeof dormant.since).toBe("string");
    // since should be an ISO-ish string
    expect(dormant.since).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("disabling sets active:false but preserves prior 'since'", async () => {
    const priorSince = "2026-04-01T00:00:00.000Z";
    let capturedUpdate: Record<string, unknown> | null = null;
    const { supa } = buildSupaMock({
      existingCtx: {
        id: "ctx-2",
        huma_context: { dormant: { active: true, since: priorSince } },
      },
      onUpdate: (payload) => {
        capturedUpdate = payload;
      },
    });
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: async () => supa,
    }));
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => ({
        ctx: {
          user: { id: "u-2", is_anonymous: false, email: null },
          isCron: false,
          source: "user",
        },
      }),
    }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ enable: false }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; active: boolean };
    expect(body.active).toBe(false);

    expect(capturedUpdate).toBeTruthy();
    const hc = (capturedUpdate as { huma_context: Record<string, unknown> })
      .huma_context;
    const dormant = hc.dormant as { active: boolean; since: string };
    expect(dormant.active).toBe(false);
    // `since` is the prior value, NOT a new timestamp.
    expect(dormant.since).toBe(priorSince);
  });

  it("works for anonymous sessions (is_anonymous:true)", async () => {
    const { supa } = buildSupaMock({
      existingCtx: { id: "ctx-anon", huma_context: {} },
    });
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: async () => supa,
    }));
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => ({
        ctx: {
          user: { id: "anon-3", is_anonymous: true, email: null },
          isCron: false,
          source: "user",
        },
      }),
    }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ enable: true }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it("no session → 401", async () => {
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => ({
        error: new Response(
          JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }),
          { status: 401 },
        ),
      }),
    }));
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: async () => ({ from: vi.fn() }),
    }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ enable: true }));
    expect(res.status).toBe(401);
  });

  it("emits audit log with action:'enable' and user_id + route", async () => {
    const cap = captureConsoleLog();
    const { supa } = buildSupaMock({
      existingCtx: { id: "ctx-4", huma_context: {} },
    });
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: async () => supa,
    }));
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => ({
        ctx: {
          user: { id: "u-4", is_anonymous: false, email: null },
          isCron: false,
          source: "user",
        },
      }),
    }));

    const { POST } = await import("./route");
    await POST(buildRequest({ enable: true }));

    const actionLog = cap.logs.find((l) => l.action === "enable");
    expect(actionLog).toBeTruthy();
    expect(actionLog?.user_id).toBe("u-4");
    expect(actionLog?.route).toBe("/api/operator/dormancy");
    expect(actionLog?.source).toBe("user");
    cap.restore();
  });

  it("emits audit log with action:'disable' on toggle-off", async () => {
    const cap = captureConsoleLog();
    const { supa } = buildSupaMock({
      existingCtx: {
        id: "ctx-5",
        huma_context: { dormant: { active: true, since: "2026-04-01T00:00:00Z" } },
      },
    });
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: async () => supa,
    }));
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => ({
        ctx: {
          user: { id: "u-5", is_anonymous: false, email: null },
          isCron: false,
          source: "user",
        },
      }),
    }));

    const { POST } = await import("./route");
    await POST(buildRequest({ enable: false }));

    const actionLog = cap.logs.find((l) => l.action === "disable");
    expect(actionLog).toBeTruthy();
    expect(actionLog?.user_id).toBe("u-5");
    cap.restore();
  });

  describe("mid-day toggle preserves prior checkoffs", () => {
    it("never calls .from('sheet_entries') or .from('behavior_log')", async () => {
      const { supa, tableCalls } = buildSupaMock({
        existingCtx: { id: "ctx-6", huma_context: {} },
      });
      vi.doMock("@/lib/supabase-server", () => ({
        createServerSupabase: async () => supa,
      }));
      vi.doMock("@/lib/auth-guard", () => ({
        requireUser: async () => ({
          ctx: {
            user: { id: "u-6", is_anonymous: false, email: null },
            isCron: false,
            source: "user",
          },
        }),
      }));

      const { POST } = await import("./route");
      await POST(buildRequest({ enable: true }));

      // The route only touches `contexts`. Declaring Dormancy mid-day MUST
      // NOT erase today's sheet_entries or behavior_log (truth-respecting).
      expect(tableCalls).not.toContain("sheet_entries");
      expect(tableCalls).not.toContain("behavior_log");
      expect(tableCalls.every((t) => t === "contexts")).toBe(true);
    });
  });

  it("returns 404 when the operator has no context row (new account)", async () => {
    const { supa } = buildSupaMock({
      existingCtx: null,
      loadError: true,
    });
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: async () => supa,
    }));
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => ({
        ctx: {
          user: { id: "u-new", is_anonymous: false, email: null },
          isCron: false,
          source: "user",
        },
      }),
    }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ enable: true }));
    expect(res.status).toBe(404);
  });
});

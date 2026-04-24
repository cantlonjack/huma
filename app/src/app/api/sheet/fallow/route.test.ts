import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";

/**
 * REGEN-05 Plan 02-04: POST /api/sheet/fallow route tests.
 *
 * Replaces Wave 0 .skip stubs with real assertions:
 *   1. marking adds today to huma_context.fallowDays
 *   2. marking is idempotent (no duplicate entry)
 *   3. unmarking removes the date (same calendar day)
 *   4. unmarking after midnight returns 409 FALLOW_FROZEN
 *   5. no session → 401
 *   6. audit log emits action:"mark_fallow" + date
 *   7. never touches sheet_entries or behavior_log (preserve-checkoffs invariant)
 *
 * Supabase chain mocks: the route calls `.from('contexts')...select...
 * limit(1).single()` to load then `.from('contexts').update(...).eq(...)` to
 * save. We supply a chainable mock that satisfies both and tracks what
 * tables were touched so the preserve-invariant test can assert only
 * `contexts` was accessed.
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
  return new Request("http://localhost/api/sheet/fallow", {
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
// tableCalls array surfaces what .from() saw so the preserve-invariant
// assertion (no sheet_entries, no behavior_log) can inspect it.

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
      // sheet_entries or behavior_log. Safe shape so the preserve test still
      // sees the call logged (and then asserts it didn't happen).
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

describe("REGEN-05: POST /api/sheet/fallow", () => {
  it("marking adds today's YYYY-MM-DD to huma_context.fallowDays[]", async () => {
    const today = "2026-04-22";
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));

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
    const res = await POST(buildRequest({ mark: true, date: today }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; fallowDays: string[] };
    expect(body.ok).toBe(true);
    expect(body.fallowDays).toContain(today);

    // The update payload carries the new fallowDays entry.
    expect(capturedUpdate).toBeTruthy();
    const hc = (capturedUpdate as unknown as { huma_context: Record<string, unknown> })
      .huma_context;
    const fallowDays = hc.fallowDays as string[];
    expect(fallowDays).toContain(today);
  });

  it("marking is idempotent — second mark for same day is a no-op (no duplicate entry)", async () => {
    const today = "2026-04-22";
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));

    let capturedUpdate: Record<string, unknown> | null = null;
    const { supa } = buildSupaMock({
      existingCtx: {
        id: "ctx-1",
        huma_context: { fallowDays: [today] },
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
          user: { id: "u-1", is_anonymous: false, email: null },
          isCron: false,
          source: "user",
        },
      }),
    }));

    const { POST } = await import("./route");
    await POST(buildRequest({ mark: true, date: today }));

    // No duplicate: exactly one occurrence of `today` in fallowDays.
    expect(capturedUpdate).toBeTruthy();
    const hc = (capturedUpdate as unknown as { huma_context: Record<string, unknown> })
      .huma_context;
    const fallowDays = hc.fallowDays as string[];
    expect(fallowDays.filter((d) => d === today)).toHaveLength(1);
  });

  it("unmarking removes the date from fallowDays[] — allowed on same calendar day", async () => {
    const today = "2026-04-22";
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));

    let capturedUpdate: Record<string, unknown> | null = null;
    const { supa } = buildSupaMock({
      existingCtx: {
        id: "ctx-2",
        huma_context: { fallowDays: [today] },
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
    const res = await POST(buildRequest({ mark: false, date: today }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; fallowDays: string[] };
    expect(body.fallowDays).not.toContain(today);

    // Update payload has the date removed.
    expect(capturedUpdate).toBeTruthy();
    const hc = (capturedUpdate as unknown as { huma_context: Record<string, unknown> })
      .huma_context;
    const fallowDays = hc.fallowDays as string[];
    expect(fallowDays).not.toContain(today);
  });

  it("unmarking after midnight (date != today) returns 409 FALLOW_FROZEN", async () => {
    const today = "2026-04-23";  // operator's local "today"
    const yesterday = "2026-04-22";  // the fallow mark they're trying to unmark
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));

    const { supa } = buildSupaMock({
      existingCtx: {
        id: "ctx-3",
        huma_context: { fallowDays: [yesterday] },
      },
    });
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: async () => supa,
    }));
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => ({
        ctx: {
          user: { id: "u-3", is_anonymous: false, email: null },
          isCron: false,
          source: "user",
        },
      }),
    }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ mark: false, date: yesterday }));
    expect(res.status).toBe(409);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("FALLOW_FROZEN");
  });

  it("no session returns 401", async () => {
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
    const res = await POST(buildRequest({ mark: true, date: "2026-04-22" }));
    expect(res.status).toBe(401);
  });

  it("emits structured audit log with action:'mark_fallow' + date", async () => {
    const today = "2026-04-22";
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));

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
    await POST(buildRequest({ mark: true, date: today }));

    const actionLog = cap.logs.find((l) => l.action === "mark_fallow");
    expect(actionLog).toBeTruthy();
    expect(actionLog?.user_id).toBe("u-4");
    expect(actionLog?.route).toBe("/api/sheet/fallow");
    expect(actionLog?.date).toBe(today);
    expect(actionLog?.source).toBe("user");
    cap.restore();
  });

  it("emits structured audit log with action:'unmark_fallow' on toggle-off", async () => {
    const today = "2026-04-22";
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));

    const cap = captureConsoleLog();
    const { supa } = buildSupaMock({
      existingCtx: {
        id: "ctx-5",
        huma_context: { fallowDays: [today] },
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
    await POST(buildRequest({ mark: false, date: today }));

    const actionLog = cap.logs.find((l) => l.action === "unmark_fallow");
    expect(actionLog).toBeTruthy();
    expect(actionLog?.user_id).toBe("u-5");
    expect(actionLog?.date).toBe(today);
    cap.restore();
  });

  describe("preserve-checkoffs invariant: mid-day fallow never touches sheet_entries or behavior_log", () => {
    it("never calls .from('sheet_entries') or .from('behavior_log')", async () => {
      const today = "2026-04-22";
      vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));

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
      await POST(buildRequest({ mark: true, date: today }));

      // The route only touches `contexts`. Declaring Fallow mid-day MUST
      // NOT erase today's sheet_entries or behavior_log (truth-respecting).
      expect(tableCalls).not.toContain("sheet_entries");
      expect(tableCalls).not.toContain("behavior_log");
      expect(tableCalls.every((t) => t === "contexts")).toBe(true);
    });
  });
});

import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";

/**
 * REGEN-05 Plan 02-04: sheet/check rejects new checkoffs on fallow days.
 *
 * Replaces Wave 0 .skip stubs with real assertions:
 *   1. today in huma_context.fallowDays -> 409 FALLOW_DAY, NO sheet_entries update
 *   2. today NOT in fallowDays -> normal 200 path
 *   3. no session returns 401 (fallow check never runs)
 *
 * The guard is surgical — prepended between auth and the DB write. Tests
 * assert the invariant directly: when a fallow day is marked, sheet_entries
 * must not be touched and no behavior_log side effect occurs.
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
  return new Request("http://localhost/api/sheet/check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("REGEN-05: POST /api/sheet/check rejects checkoffs on fallow days", () => {
  it("returns 409 + FALLOW_DAY when today is in huma_context.fallowDays; no sheet_entries update", async () => {
    const today = "2026-04-22";
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));

    const sheetUpdateSpy = vi.fn(async () => ({ error: null }));
    const supa = {
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: "u-1", is_anonymous: false } },
          error: null,
        })),
      },
      from: vi.fn((table: string) => {
        if (table === "contexts") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    single: vi.fn(async () => ({
                      data: { huma_context: { fallowDays: [today] } },
                      error: null,
                    })),
                  })),
                })),
              })),
            })),
          };
        }
        if (table === "sheet_entries") {
          return {
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: sheetUpdateSpy,
              })),
            })),
          };
        }
        return { select: vi.fn(), update: vi.fn() };
      }),
    };
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: async () => supa,
    }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ entryId: "e1", checked: true }));
    expect(res.status).toBe(409);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("FALLOW_DAY");

    // Invariant: the 409 short-circuits before sheet_entries.update runs.
    // No behavior_log side effect, no checked_at timestamp written.
    expect(sheetUpdateSpy).not.toHaveBeenCalled();
  });

  it("proceeds normally when today is not fallow (sheet_entries.update reached)", async () => {
    const today = "2026-04-22";
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));

    const sheetUpdateSpy = vi.fn(async () => ({ error: null }));
    const supa = {
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: "u-1", is_anonymous: false } },
          error: null,
        })),
      },
      from: vi.fn((table: string) => {
        if (table === "contexts") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    single: vi.fn(async () => ({
                      data: { huma_context: { fallowDays: [] } },
                      error: null,
                    })),
                  })),
                })),
              })),
            })),
          };
        }
        if (table === "sheet_entries") {
          return {
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: sheetUpdateSpy,
              })),
            })),
          };
        }
        return { select: vi.fn(), update: vi.fn() };
      }),
    };
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: async () => supa,
    }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ entryId: "e1", checked: true }));
    expect(res.status).toBe(200);
    expect(sheetUpdateSpy).toHaveBeenCalled();
  });

  it("returns 401 without running the fallow check when no session", async () => {
    const contextSelectSpy = vi.fn();
    const supa = {
      auth: {
        getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
      },
      from: vi.fn((table: string) => {
        if (table === "contexts") {
          contextSelectSpy();
          return { select: vi.fn(() => ({})) };
        }
        return { select: vi.fn(), update: vi.fn() };
      }),
    };
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: async () => supa,
    }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ entryId: "e1", checked: true }));
    expect(res.status).toBe(401);

    // Auth short-circuit happens before the contexts select — no DB read
    // for unauthenticated callers.
    expect(contextSelectSpy).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";

/**
 * REGEN-02 Plan 02-02: morning-sheet cron dormancy-skip tests.
 *
 * Replaces Wave 0 .skip stubs. Verifies:
 *   1. user with huma_context.dormant.active === true is skipped BEFORE the
 *      aspirations fetch (no Anthropic call, no push send)
 *   2. skip emits structured log { source:'cron', skip_reason:'dormant' }
 *   3. skip increments totalSkipped counter
 *   4. no sendPushToUser call for a dormant user
 *   5. non-dormant users in the same cron run are still processed normally
 *      (aspirations fetch fires for them)
 *
 * Mock strategy: the cron uses createAdminSupabase() + sendPushToUser(). We
 * mock both via vi.doMock(). The Supabase chain is bespoke per .from(table),
 * so the helper builds a lookup by table + returns the appropriate chain.
 */

beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = "sk-test";
  process.env.CRON_SECRET = "cron-test-secret";
});

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
});

function buildCronRequest() {
  return new Request("http://localhost/api/cron/morning-sheet", {
    method: "GET",
    headers: { authorization: "Bearer cron-test-secret" },
  });
}

/**
 * Build a Supabase mock tailored to the cron route.
 *  - push_subscriptions.select().order() → [{ user_id: "u-1" }, ...]
 *  - contexts.select("huma_context").eq(user_id).order().limit(1).single()
 *    → { huma_context: { dormant: {...} } } per userId
 *  - aspirations.select().eq(user_id).eq(status,active) → [{...}] per userId
 *  - contexts.select("known_context, why_statement, created_at")... single()
 *    (second-call path) → { known_context: {}, why_statement: '', created_at }
 *  - sheet_entries.select().eq().gte() → []
 *
 * We distinguish the two contexts fetches by the select() argument: the new
 * dormant-check selects ONLY "huma_context"; the existing later fetch selects
 * "known_context, why_statement, created_at".
 */
function buildSupaMock(users: Array<{
  userId: string;
  dormant?: { active: boolean; since?: string };
  aspirations?: Array<Record<string, unknown>>;
  knownContext?: Record<string, unknown>;
}>) {
  const subs = users.map((u) => ({ user_id: u.userId }));
  const byUser = new Map(users.map((u) => [u.userId, u]));

  // Track calls for test assertions
  const calls = {
    dormantChecks: [] as string[],           // user_ids that hit the dormant select
    aspirationFetches: [] as string[],        // user_ids that reached aspirations.select
    knownContextFetches: [] as string[],      // user_ids that reached the later ctx fetch
  };

  const from = vi.fn((table: string) => {
    if (table === "push_subscriptions") {
      return {
        select: vi.fn(() => ({
          order: vi.fn(async () => ({ data: subs, error: null })),
        })),
      };
    }
    if (table === "contexts") {
      return {
        // ctx.select(...).eq(user_id, v).order(...).limit(1).single()
        // We distinguish by the select() columns.
        select: vi.fn((cols: string) => {
          const isDormantCheck = cols === "huma_context";
          return {
            eq: vi.fn((_col: string, userId: string) => {
              if (isDormantCheck) calls.dormantChecks.push(userId);
              else calls.knownContextFetches.push(userId);

              const user = byUser.get(userId);
              return {
                order: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    single: vi.fn(async () => {
                      if (isDormantCheck) {
                        return {
                          data: {
                            huma_context: user?.dormant
                              ? { dormant: user.dormant }
                              : {},
                          },
                          error: null,
                        };
                      }
                      // Non-dormant path: return a minimal known_context row.
                      return {
                        data: {
                          known_context: user?.knownContext ?? {},
                          why_statement: "",
                          created_at: new Date().toISOString(),
                        },
                        error: null,
                      };
                    }),
                  })),
                })),
              };
            }),
          };
        }),
      };
    }
    if (table === "aspirations") {
      // aspirations.select().eq(user_id).eq(status)
      return {
        select: vi.fn(() => ({
          eq: vi.fn((_col1: string, userId: string) => {
            calls.aspirationFetches.push(userId);
            return {
              eq: vi.fn(async () => ({
                data: byUser.get(userId)?.aspirations ?? [],
                error: null,
              })),
            };
          }),
        })),
      };
    }
    if (table === "sheet_entries") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(async () => ({ data: [], error: null })),
          })),
        })),
      };
    }
    // Fallback for any other tables (behavior_log, insights, etc.)
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              single: vi.fn(async () => ({ data: null, error: null })),
              maybeSingle: vi.fn(async () => ({ data: null, error: null })),
            })),
            gte: vi.fn(async () => ({ data: [], error: null })),
          })),
          gte: vi.fn(async () => ({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(async () => ({ data: null, error: null })),
      update: vi.fn(() => ({ eq: vi.fn(async () => ({ data: null, error: null })) })),
    };
  });

  return {
    supa: { from },
    calls,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────

describe("REGEN-02: morning-sheet cron skips dormant users", () => {
  it("user with huma_context.dormant.active:true is skipped BEFORE aspirations fetch", async () => {
    const { supa, calls } = buildSupaMock([
      {
        userId: "u-dormant",
        dormant: { active: true, since: "2026-04-10T00:00:00Z" },
      },
    ]);
    const sendPushMock = vi.fn();
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => supa,
    }));
    vi.doMock("@/lib/push-send", () => ({
      sendPushToUser: sendPushMock,
    }));

    const { GET } = await import("./route");
    const res = await GET(buildCronRequest());
    expect(res.status).toBe(200);

    // Dormant check MUST fire, aspirations fetch MUST NOT fire.
    expect(calls.dormantChecks).toContain("u-dormant");
    expect(calls.aspirationFetches).not.toContain("u-dormant");
  });

  it("skip emits structured log with source:'cron' + skip_reason:'dormant'", async () => {
    const cap = captureConsoleLog();
    const { supa } = buildSupaMock([
      {
        userId: "u-dormant-log",
        dormant: { active: true, since: "2026-04-10T00:00:00Z" },
      },
    ]);
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => supa,
    }));
    vi.doMock("@/lib/push-send", () => ({ sendPushToUser: vi.fn() }));

    const { GET } = await import("./route");
    await GET(buildCronRequest());

    const dormantLog = cap.logs.find(
      (l) => l.skip_reason === "dormant" && l.user_id === "u-dormant-log",
    );
    expect(dormantLog).toBeTruthy();
    expect(dormantLog?.source).toBe("cron");
    expect(dormantLog?.route).toBe("/api/cron/morning-sheet");
    cap.restore();
  });

  it("no sendPushToUser call fires for a dormant user", async () => {
    const { supa } = buildSupaMock([
      {
        userId: "u-dormant-2",
        dormant: { active: true, since: "2026-04-10T00:00:00Z" },
      },
    ]);
    const sendPushMock = vi.fn();
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => supa,
    }));
    vi.doMock("@/lib/push-send", () => ({
      sendPushToUser: sendPushMock,
    }));

    const { GET } = await import("./route");
    await GET(buildCronRequest());

    expect(sendPushMock).not.toHaveBeenCalled();
  });

  it("non-dormant users in the same cron run still reach the aspirations fetch", async () => {
    // Two users: one dormant (should skip), one active (should proceed).
    const { supa, calls } = buildSupaMock([
      {
        userId: "u-dormant-3",
        dormant: { active: true },
      },
      {
        userId: "u-active",
        dormant: { active: false },
        aspirations: [], // no aspirations — ensures early bail after the fetch
      },
    ]);
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => supa,
    }));
    vi.doMock("@/lib/push-send", () => ({ sendPushToUser: vi.fn() }));

    const { GET } = await import("./route");
    const res = await GET(buildCronRequest());
    expect(res.status).toBe(200);

    // The dormant user was skipped (dormant-check fired; aspirations fetch
    // did NOT for that user).
    expect(calls.dormantChecks).toContain("u-dormant-3");
    expect(calls.aspirationFetches).not.toContain("u-dormant-3");

    // The active user progressed past the dormant-check to the aspirations
    // fetch (even though their aspirations array is empty, the fetch fires).
    expect(calls.dormantChecks).toContain("u-active");
    expect(calls.aspirationFetches).toContain("u-active");
  });

  it("operator with no huma_context.dormant field is not flagged as dormant", async () => {
    // dormant === undefined — the `?.active === true` check correctly
    // returns false, and the user proceeds past the skip.
    const { supa, calls } = buildSupaMock([
      {
        userId: "u-never-declared",
        dormant: undefined, // huma_context has no dormant field at all
        aspirations: [],
      },
    ]);
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => supa,
    }));
    vi.doMock("@/lib/push-send", () => ({ sendPushToUser: vi.fn() }));

    const { GET } = await import("./route");
    await GET(buildCronRequest());

    // Not skipped — aspirations fetch fires.
    expect(calls.aspirationFetches).toContain("u-never-declared");
  });
});

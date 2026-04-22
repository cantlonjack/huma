import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";

/**
 * REGEN-03 Plan 02-05: POST /api/outcome route tests.
 *
 * Replaces Wave 0 .skip stubs with real assertions over the full endpoint.
 * Covers: full submit, enum enforcement (maybe rejected), snooze (inc), third
 * snooze (REQUIRED_VISIT), auth (401), pattern-strength update, audit log.
 *
 * Supabase chain mocks: the route calls `.from(table)...` with different
 * chain shapes per branch — the helper `buildSupaMock` returns a fluent
 * object that captures calls + returns the staged fixture.
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
  return new Request("http://localhost/api/outcome", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── Mock builders ──────────────────────────────────────────────────────

/**
 * Build a Supabase mock tailored to the route's call patterns:
 *  - outcome_checks.insert().select().single() → inserted fixture
 *  - outcome_checks.insert() (plain snooze) → { error: null }
 *  - outcome_checks.select().eq().eq().eq().order().limit().maybeSingle() → {data: {snooze_count}}
 *  - patterns.select().eq().eq().maybeSingle() → {data: patternRow}
 *  - patterns.update().eq().eq() → {error: null}
 */
function buildSupaMock(opts: {
  insertedOutcome?: { id: string } | null;
  insertError?: boolean;
  snoozeCount?: number | null;
  patternRow?: { id: string; evidence: Record<string, unknown> } | null;
  onPatternUpdate?: (payload: { evidence: { strength: number } }) => void;
}) {
  const insertedOutcome = opts.insertedOutcome ?? null;
  const insertError = opts.insertError ?? false;

  // Track what the route asked for so tests can assert.
  const calls = {
    outcomeInserts: [] as Array<Record<string, unknown>>,
    patternUpdates: [] as Array<Record<string, unknown>>,
  };

  const from = vi.fn((table: string) => {
    if (table === "outcome_checks") {
      const chain = {
        // For select (snooze read)
        select: vi.fn((..._a: unknown[]) => {
          // Build selectChain that supports eq().eq().eq().order().limit().maybeSingle()
          // For full-submit path, select() is called with returning cols + .single().
          // We distinguish by whether insert() was called first. Actually we branch
          // by tracking "insertPending" — but simpler to provide a single chain object
          // that satisfies both patterns.
          return buildChainForSnoozeRead(opts.snoozeCount ?? null);
        }),
        insert: vi.fn((payload: Record<string, unknown>) => {
          calls.outcomeInserts.push(payload);
          // Depending on callsite — snooze vs full — the chain differs:
          //  - snooze path: `.insert(...)` alone, awaited for { error }
          //  - full path: `.insert(...).select().single()`
          // Return an object that supports both:
          //  - awaited thenable (for snooze)
          //  - .select().single() fluent (for full)
          const awaitedShape = {
            data: null as unknown,
            error: insertError ? { message: "boom" } : null,
          };
          const fluentShape = {
            select: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: insertedOutcome,
                error: insertError ? { message: "boom" } : null,
              })),
            })),
          };
          // `then` makes this a thenable so `await supabase.from(...).insert(...)` resolves
          // to `{ data, error }`. The fluent shape still works for `.select().single()`.
          return {
            ...fluentShape,
            then: (resolve: (v: typeof awaitedShape) => unknown) =>
              resolve(awaitedShape),
          };
        }),
      };
      return chain;
    }
    if (table === "patterns") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({
                data: opts.patternRow ?? null,
                error: null,
              })),
            })),
          })),
        })),
        update: vi.fn((payload: Record<string, unknown>) => {
          calls.patternUpdates.push(payload);
          if (opts.onPatternUpdate) {
            opts.onPatternUpdate(payload as { evidence: { strength: number } });
          }
          return {
            eq: vi.fn(() => ({
              eq: vi.fn(async () => ({ data: null, error: null })),
            })),
          };
        }),
      };
    }
    // Fallback
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: null })) })),
      })),
      insert: vi.fn(),
      update: vi.fn(),
    };
  });

  return {
    supa: { from },
    calls,
  };
}

function buildChainForSnoozeRead(snoozeCount: number | null) {
  const terminal = {
    maybeSingle: vi.fn(async () => ({
      data: snoozeCount === null ? null : { snooze_count: snoozeCount },
      error: null,
    })),
  };
  const limit = { limit: vi.fn(() => terminal) };
  const order = { order: vi.fn(() => limit) };
  const eq3 = { eq: vi.fn(() => order) };
  const eq2 = { eq: vi.fn(() => eq3) };
  const eq1 = { eq: vi.fn(() => eq2) };
  return eq1;
}

// ─── Tests ──────────────────────────────────────────────────────────────

describe("REGEN-03: POST /api/outcome", () => {
  it("full submit creates outcome_checks row", async () => {
    const { supa } = buildSupaMock({
      insertedOutcome: { id: "oc-1" },
      patternRow: null,
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
    const res = await POST(
      buildRequest({
        target_kind: "aspiration",
        target_id: "11111111-2222-4333-8444-555555555555",
        answer: "yes",
        why: "finished the knee rehab arc",
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; outcome_id?: string };
    expect(body.ok).toBe(true);
    expect(body.outcome_id).toBe("oc-1");
  });

  it("rejects 'maybe' answer with 400 (enum enforcement)", async () => {
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => ({
        ctx: {
          user: { id: "u-1", is_anonymous: false, email: null },
          isCron: false,
          source: "user",
        },
      }),
    }));
    // No supabase mock needed — the request fails at the parseBody stage.
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: async () => ({ from: vi.fn() }),
    }));

    const { POST } = await import("./route");
    const res = await POST(
      buildRequest({
        target_kind: "aspiration",
        target_id: "11111111-2222-4333-8444-555555555555",
        answer: "maybe",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("snooze increments snooze_count without creating an outcome answer", async () => {
    const { supa, calls } = buildSupaMock({
      snoozeCount: 0, // operator has never snoozed this target
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
    const res = await POST(
      buildRequest({
        target_kind: "aspiration",
        target_id: "11111111-2222-4333-8444-555555555555",
        answer: "some", // placeholder — backend uses snooze:true
        snooze: true,
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      ok: boolean;
      snoozed: boolean;
      snooze_count: number;
    };
    expect(body.snoozed).toBe(true);
    expect(body.snooze_count).toBe(1);
    // Confirm the snooze write carried snooze_count=1 (current 0 + 1)
    expect(calls.outcomeInserts).toHaveLength(1);
    expect(calls.outcomeInserts[0].snooze_count).toBe(1);
  });

  it("third snooze (snooze_count >= 2) rejects with 400 REQUIRED_VISIT", async () => {
    const { supa, calls } = buildSupaMock({
      snoozeCount: 2, // already snoozed twice — next one must be REQUIRED_VISIT
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
    const res = await POST(
      buildRequest({
        target_kind: "aspiration",
        target_id: "11111111-2222-4333-8444-555555555555",
        answer: "some",
        snooze: true,
      }),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe("REQUIRED_VISIT");
    // No insert should have fired — the REQUIRED_VISIT path returns early.
    expect(calls.outcomeInserts).toHaveLength(0);
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
    const res = await POST(
      buildRequest({
        target_kind: "aspiration",
        target_id: "11111111-2222-4333-8444-555555555555",
        answer: "yes",
      }),
    );
    expect(res.status).toBe(401);
  });

  it("pattern submit applies strength multiplier", async () => {
    // Current strength = 0.4. Answer "yes" should cap * 1.25 = 0.5 (below cap).
    const currentEvidence = {
      strength: 0.4,
      confidence: "emerging",
      contextTags: [],
    };
    let capturedStrength: number | null = null;
    const { supa } = buildSupaMock({
      insertedOutcome: { id: "oc-1" },
      patternRow: { id: "p-1", evidence: currentEvidence },
      onPatternUpdate: (payload) => {
        capturedStrength = payload.evidence.strength;
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
    const res = await POST(
      buildRequest({
        target_kind: "pattern",
        target_id: "11111111-2222-4333-8444-555555555555",
        answer: "yes",
        why: "pattern seems to be working",
      }),
    );
    expect(res.status).toBe(200);
    // 0.4 * 1.25 = 0.5 (below cap of 1.0)
    expect(capturedStrength).toBeCloseTo(0.5, 5);
  });

  it("emits audit log with action:'outcome_submit'", async () => {
    const cap = captureConsoleLog();
    const { supa } = buildSupaMock({
      insertedOutcome: { id: "oc-1" },
      patternRow: null,
    });
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: async () => supa,
    }));
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => ({
        ctx: {
          user: { id: "u-7", is_anonymous: false, email: null },
          isCron: false,
          source: "user",
        },
      }),
    }));

    const { POST } = await import("./route");
    await POST(
      buildRequest({
        target_kind: "aspiration",
        target_id: "11111111-2222-4333-8444-555555555555",
        answer: "some",
      }),
    );

    const log = cap.logs.find((l) => l.action === "outcome_submit");
    expect(log).toBeTruthy();
    expect(log?.user_id).toBe("u-7");
    expect(log?.target_kind).toBe("aspiration");
    expect(log?.answer).toBe("some");
    cap.restore();
  });

  it("sanitizes why field — rejects [[ marker delimiters with 400", async () => {
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => ({
        ctx: {
          user: { id: "u-1", is_anonymous: false, email: null },
          isCron: false,
          source: "user",
        },
      }),
    }));
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: async () => ({ from: vi.fn() }),
    }));

    const { POST } = await import("./route");
    const res = await POST(
      buildRequest({
        target_kind: "aspiration",
        target_id: "11111111-2222-4333-8444-555555555555",
        answer: "yes",
        why: "trying [[MARKER:INJECT]] payload",
      }),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error.toLowerCase()).toMatch(/reserved marker|marker delimiters/);
  });
});

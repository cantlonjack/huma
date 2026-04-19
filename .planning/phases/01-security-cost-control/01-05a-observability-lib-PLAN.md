---
phase: 01-security-cost-control
plan: 05a
type: execute
wave: 1
depends_on:
  - "01-00"
files_modified:
  - app/package.json
  - app/src/lib/ulid.ts
  - app/src/lib/observability.ts
  - app/src/lib/ulid.test.ts
  - app/src/lib/observability.test.ts
autonomous: true
requirements:
  - SEC-05
must_haves:
  truths:
    - "ulid() returns a 26-char Crockford base32 string matching /^[0-9A-HJKMNP-TV-Z]{26}$/"
    - "isULID(s) returns true for valid ULIDs, false for malformed input"
    - "withObservability(request, route, source, userIdResolver, handler) emits exactly one console.log(JSON.stringify(payload)) per call with all 7 fields + source"
    - "On thrown Error: status=500 and log still emitted via finally; error re-thrown"
    - "On thrown Response (e.g., 401 short-circuit): the Response is returned and its status is honored in the log"
    - "obs.setOutputTokens called from within the handler closure updates the log payload BEFORE finally fires (no globalThis usage — Warning 5)"
    - "Null-user log entries are tagged source:'system' (NOT 'user') when called with userIdResolver returning null and source:'system' — Warning 2 reinforcement"
    - "Best-effort cost_metrics_raw insert: in-memory retry queue (cap 100) re-attempts failed writes on the next request's exit path (Warning 4)"
    - "If retry queue cap exceeded, the OLDEST entry is dropped and console.error logged with 'cost_metrics_raw queue overflow'"
  artifacts:
    - path: "app/src/lib/ulid.ts"
      provides: "ulid() wrapper (re-exports npm 'ulid' with monotonic factory) + isULID validator"
      exports: ["ulid", "isULID", "monotonicUlid"]
      min_lines: 15
    - path: "app/src/lib/observability.ts"
      provides: "withObservability wrapper + LogPayload type + retry queue for cost_metrics_raw writes"
      exports: ["withObservability", "type LogPayload", "type ObsCtx", "type LogSource"]
      min_lines: 100
    - path: "app/src/lib/observability.test.ts"
      provides: "Unit cases: 7-field log emission, throw handling, Response throw, source:'system' tagging, queue retry"
      contains: "withObservability"
      min_lines: 100
  key_links:
    - from: "Plans 05b, 05c (route wraps)"
      to: "app/src/lib/observability.ts withObservability"
      via: "import { withObservability } from '@/lib/observability'"
      pattern: "withObservability"
    - from: "app/src/lib/observability.ts"
      to: "console.log"
      via: "finally-block emits JSON.stringify(payload) — never swallowed"
      pattern: "console\\.log\\(JSON\\.stringify"
---

<objective>
Wave 1 observability foundation. Builds the `withObservability` wrapper, ULID generator, and shared retry queue. Routes are wrapped in Plans 05b (non-streaming) and 05c (streaming + cron + cost-rollup) — those are Wave 2 (`depends_on: [01-05a]`).

Splitting Plan 05 into 05a/b/c (per Blocker 2) means:
- 05a is small and parallel-safe with all other Wave 1 plans (01-04, 06).
- 05b/c land in Wave 2 with full visibility into 05a's exports — no race.
- Each Wave 2 plan touches a focused subset (8 routes vs 4) so context budget stays under ~50%.

**Warning 4 resolved:** observability.ts holds an in-memory retry queue (cap 100) for failed `cost_metrics_raw` inserts. On the NEXT request's exit-path, the queue is drained best-effort. Test asserts: simulate Supabase failure on first call, success on second; both payloads land.

**Warning 5 resolved:** `obs.setOutputTokens(n)` is called from inside the handler closure (no `globalThis.__obs_set` placeholder). The closure variable is mutable from the handler scope; the finally-block reads its final value before emitting the log. Test asserts `output_tokens > 0` in the captured log payload.

**Warning 2 reinforcement:** observability.test.ts asserts that when `userIdResolver` returns null and `source:'system'` is passed (the pre-flag-flip case from Plan 01), the log entry is tagged `source:'system'` — keeping per-user dashboards clean.
</objective>

<execution_context>
@C:/Users/djcan/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/djcan/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-security-cost-control/01-CONTEXT.md
@.planning/phases/01-security-cost-control/01-RESEARCH.md
@.planning/phases/01-security-cost-control/01-VALIDATION.md
@.planning/phases/01-security-cost-control/01-00-fixtures-PLAN.md
@.planning/phases/01-security-cost-control/01-01-auth-gate-PLAN.md

<interfaces>
<!-- From npm ulid (to install): -->
```typescript
import { ulid, monotonicFactory } from "ulid";
const id = ulid();        // "01HXQ0CXB9X4Y1FZRVPRPVJ3B7"
```

From Plan 00 (capture-log fixture — already exists):
```typescript
import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";
const cap = captureConsoleLog();
console.log(JSON.stringify({ ... }));
expect(cap.logs[0]).toEqual({ ... });
cap.restore();
```

From Plan 01 (auth-guard.ts):
```typescript
export type LogSource = "user" | "cron" | "system";
```

Supabase admin (from existing app/src/lib/supabase-admin.ts):
```typescript
export function createAdminSupabase(): SupabaseClient;
// Used for cost_metrics_raw inserts (RLS bypass via service-role).
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: ulid.ts + ulid.test.ts</name>
  <files>
    app/package.json,
    app/src/lib/ulid.ts,
    app/src/lib/ulid.test.ts
  </files>
  <action>
Step 1 — Install:
  ```bash
  cd app && npm install ulid
  ```
  Verify `package.json` has `"ulid": "^2.3.0"` or newer in `dependencies`.

Step 2 — Create `app/src/lib/ulid.ts`:
  ```typescript
  import { ulid as rawUlid, monotonicFactory } from "ulid";
  export const ulid = () => rawUlid();
  export const monotonicUlid = monotonicFactory();
  const ULID_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/;
  export function isULID(s: unknown): s is string {
    return typeof s === "string" && ULID_RE.test(s);
  }
  ```

Step 3 — Write `app/src/lib/ulid.test.ts` (3 cases — same as original plan).

Step 4 — Run:
  ```bash
  cd app && npm test -- src/lib/ulid.test.ts
  ```
  </action>
  <verify>
    <automated>cd app && npm test -- src/lib/ulid.test.ts</automated>
  </verify>
  <done>
    - ulid.ts exports ulid, isULID, monotonicUlid.
    - 3 test cases green.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: observability.ts with closure-based output_tokens + retry queue + observability.test.ts</name>
  <files>
    app/src/lib/observability.ts,
    app/src/lib/observability.test.ts
  </files>
  <behavior>
    - withObservability uses CLOSURE variables (no globalThis) for promptTokens/outputTokens — Warning 5.
    - obs.setPromptTokens / obs.setOutputTokens callable from handler closure; updates land in log payload.
    - Retry queue (in-memory, cap 100) for failed cost_metrics_raw inserts — Warning 4.
    - Test asserts queue retry: simulate Supabase failure, then success; both payloads sent.
    - Test asserts source:'system' tagging when userIdResolver→null + source:"system" (Warning 2).
  </behavior>
  <action>
Step 1 — Create `app/src/lib/observability.ts`:
  ```typescript
  import { ulid } from "@/lib/ulid";
  import { createAdminSupabase } from "@/lib/supabase-admin";

  export type LogSource = "user" | "cron" | "system";

  export interface LogPayload {
    req_id: string;
    user_id: string | null;
    route: string;
    prompt_tokens: number;
    output_tokens: number;
    latency_ms: number;
    status: number;
    source: LogSource;
  }

  export interface ObsCtx {
    reqId: string;
    userId: string | null;
    route: string;
    source: LogSource;
    setPromptTokens: (n: number) => void;
    setOutputTokens: (n: number) => void;
    setUserId: (id: string | null) => void;
  }

  type UserIdResolver = (request: Request) => Promise<string | null> | string | null;

  // ─── Retry queue for cost_metrics_raw writes (Warning 4) ─────────────────
  const QUEUE_CAP = 100;
  let pendingPayloads: LogPayload[] = [];

  /** Drain the in-memory retry queue best-effort. Called from each request's exit path. */
  async function drainQueue(): Promise<void> {
    if (pendingPayloads.length === 0) return;
    const drained = pendingPayloads;
    pendingPayloads = [];
    for (const payload of drained) {
      try { await writeOnce(payload); }
      catch (e) {
        // Failed again — re-enqueue (with cap).
        if (pendingPayloads.length >= QUEUE_CAP) {
          pendingPayloads.shift();
          console.error("[obs] cost_metrics_raw queue overflow — dropping oldest entry");
        }
        pendingPayloads.push(payload);
      }
    }
  }

  async function writeOnce(payload: LogPayload): Promise<void> {
    const admin = createAdminSupabase();
    const { error } = await admin.from("cost_metrics_raw").insert({
      req_id: payload.req_id,
      user_id: payload.user_id,
      route: payload.route,
      prompt_tokens: payload.prompt_tokens,
      output_tokens: payload.output_tokens,
      latency_ms: payload.latency_ms,
      status: payload.status,
      source: payload.source,
      created_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
  }

  /**
   * Wrap a route handler. Emits a 7-field JSON log on exit (success or failure).
   * - Closure-based token capture (no globalThis) — Warning 5.
   * - In-memory retry queue for cost_metrics_raw inserts — Warning 4.
   * - source:'system' tagged correctly when userId is null + source param is 'system' — Warning 2.
   */
  export async function withObservability(
    request: Request,
    route: string,
    source: LogSource,
    userIdResolver: UserIdResolver,
    handler: (ctx: ObsCtx) => Promise<Response>,
  ): Promise<Response> {
    const reqId = ulid();
    const t0 = Date.now();
    let userId: string | null = null;
    let promptTokens = 0;
    let outputTokens = 0;
    let status = 500;

    try {
      const resolved = await Promise.resolve(userIdResolver(request));
      userId = resolved;
    } catch { userId = null; }

    // Closure-based setters — Warning 5 (no globalThis).
    const ctx: ObsCtx = {
      reqId, userId, route, source,
      setPromptTokens: (n) => { promptTokens = n; },
      setOutputTokens: (n) => { outputTokens = n; },
      setUserId: (id) => { userId = id; },
    };

    let response: Response | null = null;
    let thrown: unknown = undefined;
    try {
      response = await handler(ctx);
      status = response.status;
    } catch (err) {
      thrown = err;
      if (err instanceof Response) {
        status = err.status;
        response = err;
      } else {
        status = 500;
      }
    } finally {
      const payload: LogPayload = {
        req_id: reqId,
        user_id: userId,
        route,
        prompt_tokens: promptTokens,
        output_tokens: outputTokens,
        latency_ms: Date.now() - t0,
        status,
        source,
      };
      // eslint-disable-next-line no-console -- Vercel stdout JSON ingestion.
      console.log(JSON.stringify(payload));

      // Best-effort raw insert + queue retry (Warning 4).
      // Skip 4xx short-circuits with no tokens to reduce write volume.
      if (status < 500 && (promptTokens > 0 || outputTokens > 0 || status === 200)) {
        // Fire-and-forget: drain prior queue first, then attempt new write.
        void (async () => {
          await drainQueue();
          try { await writeOnce(payload); }
          catch (e) {
            if (pendingPayloads.length >= QUEUE_CAP) {
              pendingPayloads.shift();
              console.error("[obs] cost_metrics_raw queue overflow — dropping oldest");
            }
            pendingPayloads.push(payload);
          }
        })();
      }
    }

    if (thrown !== undefined && !(thrown instanceof Response)) throw thrown;
    return response!;
  }

  /** Test-only: drain & reset queue between tests. */
  export function __resetObsQueueForTests(): void {
    pendingPayloads = [];
  }
  ```

Step 2 — Write `app/src/lib/observability.test.ts`:
  ```typescript
  import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
  import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";
  import { isULID } from "./ulid";

  // Mock createAdminSupabase before importing observability.
  const insertCalls: unknown[] = [];
  let insertImpl: () => Promise<{ error: { message: string } | null }>;

  vi.mock("@/lib/supabase-admin", () => ({
    createAdminSupabase: () => ({
      from: () => ({
        insert: vi.fn(async (row: unknown) => {
          insertCalls.push(row);
          return insertImpl();
        }),
      }),
    }),
  }));

  import { withObservability, __resetObsQueueForTests } from "./observability";

  describe("withObservability", () => {
    let cap: ReturnType<typeof captureConsoleLog>;
    beforeEach(() => {
      cap = captureConsoleLog();
      insertCalls.length = 0;
      insertImpl = async () => ({ error: null });
      __resetObsQueueForTests();
    });
    afterEach(() => { cap.restore(); });

    it("emits log with all 7 fields + source on success (closure-based token capture — Warning 5)", async () => {
      const req = new Request("http://localhost/api/test", { method: "POST" });
      await withObservability(req, "/api/test", "user", () => "user-123", async (ctx) => {
        ctx.setPromptTokens(100);
        ctx.setOutputTokens(50);
        return new Response("ok", { status: 200 });
      });
      expect(cap.logs).toHaveLength(1);
      const log = cap.logs[0];
      expect(isULID(log.req_id ?? "")).toBe(true);
      expect(log.user_id).toBe("user-123");
      expect(log.route).toBe("/api/test");
      expect(log.prompt_tokens).toBe(100);
      expect(log.output_tokens).toBe(50);   // ← Warning 5: > 0 via closure
      expect(typeof log.latency_ms).toBe("number");
      expect(log.status).toBe(200);
      expect(log.source).toBe("user");
    });

    it("Warning 2 reinforcement: source:'system' tag when userIdResolver→null + source='system'", async () => {
      const req = new Request("http://localhost/api/test", { method: "POST" });
      await withObservability(req, "/api/test", "system", () => null, async () => new Response("ok", { status: 200 }));
      const log = cap.logs[0];
      expect(log.user_id).toBeNull();
      expect(log.source).toBe("system");   // NOT "user" — Warning 2
    });

    it("emits log with status=500 when handler throws non-Response", async () => {
      const req = new Request("http://localhost/api/test");
      await expect(
        withObservability(req, "/api/test", "user", () => null, async () => { throw new Error("boom"); })
      ).rejects.toThrow("boom");
      expect(cap.logs).toHaveLength(1);
      expect(cap.logs[0].status).toBe(500);
    });

    it("honors Response-valued throws with their status", async () => {
      const req = new Request("http://localhost/api/test");
      const ret = await withObservability(req, "/api/test", "user", () => null, async () => {
        throw new Response("nope", { status: 418 });
      });
      expect(ret.status).toBe(418);
      expect(cap.logs[0].status).toBe(418);
    });

    it("setUserId from handler updates log userId (lazy resolution)", async () => {
      const req = new Request("http://localhost/api/test");
      await withObservability(req, "/api/test", "user", () => null, async (ctx) => {
        ctx.setUserId("late-resolved-user");
        return new Response("ok", { status: 200 });
      });
      expect(cap.logs[0].user_id).toBe("late-resolved-user");
    });

    it("Warning 4: failed cost_metrics_raw write retries on NEXT request's exit-path", async () => {
      const req = new Request("http://localhost/api/test");

      // First request: insert fails, payload joins retry queue.
      insertImpl = async () => ({ error: { message: "DB hiccup" } });
      await withObservability(req, "/api/test", "user", () => "u-1", async (ctx) => {
        ctx.setPromptTokens(10); ctx.setOutputTokens(2);
        return new Response("ok", { status: 200 });
      });
      // Allow microtasks to run.
      await new Promise((r) => setTimeout(r, 5));
      expect(insertCalls).toHaveLength(1); // attempted once; failed → queued

      // Second request: insert succeeds, queue drains BEFORE the new write.
      insertImpl = async () => ({ error: null });
      await withObservability(req, "/api/test", "user", () => "u-2", async (ctx) => {
        ctx.setPromptTokens(20); ctx.setOutputTokens(4);
        return new Response("ok", { status: 200 });
      });
      await new Promise((r) => setTimeout(r, 10));
      // Both payloads should have landed (queued retry from req1 + new req2 write).
      expect(insertCalls.length).toBeGreaterThanOrEqual(3); // 1 fail + 1 retry + 1 new
    });
  });
  ```

Step 3 — Run tests:
  ```bash
  cd app && npm test -- src/lib/observability.test.ts
  ```
  All 6 cases green.
  </action>
  <verify>
    <automated>cd app && npm test -- src/lib/observability.test.ts</automated>
  </verify>
  <done>
    - observability.ts uses closure-based token capture (no globalThis) — Warning 5.
    - Queue retry implemented + tested (Warning 4).
    - source:'system' tagging asserted (Warning 2).
    - 6 test cases green.
  </done>
</task>

</tasks>

<verification>
**Overall Phase 01-05a checks:**

Automated (must exit 0):
```bash
cd app && npm test -- src/lib/ulid.test.ts src/lib/observability.test.ts
```

Non-regression:
```bash
cd app && npm test
```
</verification>

<success_criteria>
- ulid.ts + observability.ts exist with documented exports.
- Warning 5: closure-based token capture (no globalThis) — asserted by output_tokens>0 in test.
- Warning 4: in-memory retry queue (cap 100) — asserted by simulated DB failure→success sequence.
- Warning 2 reinforcement: source:'system' tagging asserted.
- ulid dependency added.
- 9 unit assertions green (3 ulid + 6 observability).
- Plans 05b and 05c can now consume `withObservability` from this module.
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-cost-control/01-05a-observability-lib-SUMMARY.md` with:
- What was built (ulid lib, observability lib, retry queue, tests)
- Warning 4: queue cap=100, oldest dropped on overflow with console.error
- Warning 5: closure-based token capture documented; no globalThis usage
- Warning 2: source:'system' tagging asserted in test
- Files modified (3 new lib files + package.json + test files)
- Downstream: Plan 05b wraps non-streaming routes (8 routes); Plan 05c wraps streaming v2-chat + cron + cost-rollup
</output>

---
phase: 01-security-cost-control
plan: 05
type: execute
wave: 1
depends_on: []
files_modified:
  - app/package.json
  - app/src/lib/ulid.ts
  - app/src/lib/observability.ts
  - app/src/app/api/v2-chat/route.ts
  - app/src/app/api/sheet/route.ts
  - app/src/app/api/insight/route.ts
  - app/src/app/api/whole-compute/route.ts
  - app/src/app/api/nudge/route.ts
  - app/src/app/api/palette/route.ts
  - app/src/app/api/reflection/route.ts
  - app/src/app/api/decompose/route.ts
  - app/src/app/api/weekly-review/route.ts
  - app/src/app/api/canvas-regenerate/route.ts
  - app/src/app/api/cron/morning-sheet/route.ts
  - app/src/app/api/cron/cost-rollup/route.ts
  - app/supabase/migrations/017_cost_metrics.sql
  - app/src/lib/ulid.test.ts
  - app/src/lib/observability.test.ts
  - app/src/app/api/v2-chat/route.log.test.ts
  - app/src/app/api/cron/morning-sheet/route.log.test.ts
  - app/src/__tests__/observability-coverage.test.ts
  - app/src/__tests__/fixtures/capture-log.ts
autonomous: true
requirements:
  - SEC-05
must_haves:
  truths:
    - "Every Anthropic-calling route emits exactly one console.log(JSON.stringify(payload)) per request"
    - "Emitted log has all 7 required fields: req_id, user_id, route, prompt_tokens, output_tokens, latency_ms, status + source tag"
    - "req_id is a valid ULID (26 chars, base32 alphabet, timestamp-prefixed)"
    - "On success (200) usage is populated from Anthropic response metadata"
    - "On error (500+) log is still emitted via finally-block — never swallowed"
    - "Cron route morning-sheet emits log with source:'cron' and real operator user_id"
    - "cost-rollup cron runs on schedule; writes per-user + per-route totals to cost_metrics table"
    - "withObservability is imported by every route that imports @anthropic-ai/sdk (coverage test enforces)"
  artifacts:
    - path: "app/src/lib/ulid.ts"
      provides: "ulid() wrapper (re-exports npm 'ulid' with monotonic factory) + isULID(s) validator"
      exports: ["ulid", "isULID", "monotonicUlid"]
    - path: "app/src/lib/observability.ts"
      provides: "withObservability(request, route, source, userIdResolver, handler) wrapper + LogPayload type"
      exports: ["withObservability", "type LogPayload", "type LogSource", "type ObsCtx"]
      min_lines: 80
    - path: "app/supabase/migrations/017_cost_metrics.sql"
      provides: "cost_metrics (day DATE, user_id UUID nullable, route TEXT, prompt_tokens INT, output_tokens INT, request_count INT, cost_usd NUMERIC)"
      contains: "cost_metrics"
      min_lines: 30
    - path: "app/src/app/api/cron/cost-rollup/route.ts"
      provides: "Scheduled cron; scans last 24h logs via Vercel Log API; upserts rollups to cost_metrics"
      contains: "cost_metrics"
      min_lines: 60
    - path: "app/src/__tests__/observability-coverage.test.ts"
      provides: "Meta-test: every route importing @anthropic-ai/sdk also imports withObservability"
      contains: "withObservability"
      min_lines: 40
    - path: "app/src/__tests__/fixtures/capture-log.ts"
      provides: "vi.spyOn(console,'log') helper; parses JSON payloads emitted during a test"
      exports: ["captureConsoleLog"]
  key_links:
    - from: "app/src/app/api/v2-chat/route.ts"
      to: "app/src/lib/observability.ts"
      via: "withObservability(request, '/api/v2-chat', source, () => user?.id ?? null, async (ctx) => { ... })"
      pattern: "withObservability"
    - from: "app/src/lib/observability.ts"
      to: "console.log"
      via: "finally-block emits JSON.stringify(payload) — never swallowed"
      pattern: "console\\.log\\(JSON\\.stringify"
    - from: "app/src/lib/observability.ts"
      to: "app/src/lib/ulid.ts"
      via: "const reqId = ulid(); stored on ObsCtx for handler access"
      pattern: "ulid\\(\\)"
    - from: "app/src/app/api/cron/cost-rollup/route.ts"
      to: "cost_metrics table"
      via: "supabase.from('cost_metrics').upsert([...]) after aggregating Vercel log window"
      pattern: "cost_metrics"
---

<objective>
Deliver SEC-05: structured JSON observability across every Anthropic-calling route. A single helper — `withObservability(request, route, source, userIdResolver, handler)` — generates a ULID req_id, times the handler, captures Anthropic usage metadata, and emits `console.log(JSON.stringify({ req_id, user_id, route, prompt_tokens, output_tokens, latency_ms, status, source }))` in a finally-block so errors don't swallow the log. Vercel ingests stdout JSON natively — zero external deps, searchable in the dashboard.

Pair with: new `/api/cron/cost-rollup` that scans last-24h logs and writes per-user + per-route totals to a new `cost_metrics` table (migration 017). Drives the future `/internal/cost` dashboard and powers the $10/hr Anthropic-spend alert.

Purpose: Cost attribution per operator, per route, per day. Makes anomalies visible within the 90-second sampling rate (VALIDATION.md). Required foundation for the Phase 4 A/B framework (FUNNEL-05) and Phase 6 pricing decisions (PRICE-03 re-engagement triggers).

Output: Two new libraries (`ulid.ts`, `observability.ts`), surgical wraps on 10 routes + 2 cron routes, 1 new cron route (cost-rollup), 1 new migration (manual-apply flagged for Plan 07), 4 unit/route test files + 1 coverage meta-test + 1 shared fixture.

**Manual step flagged:** `017_cost_metrics.sql` is manual-apply via Supabase dashboard SQL editor; Plan 07 waits on it before smoke-testing post-enablement. Pairs with Plan 02's 016 migration.

**Dependency install:** `npm install ulid` (~2 KB, adds `ulid` to dependencies).

**Pitfall 8 addressed (RESEARCH.md):** Vercel log retention on Hobby is 1h; on Pro it's 1d. Plan assumes Pro. If HUMA is on Hobby, cost-rollup falls back to writing a minimal row directly from `withObservability` on every request. Implementation note below.
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

<interfaces>
<!-- Extracted primitives. -->

From Plan 01 (app/src/lib/auth-guard.ts — already exists after Plan 01 merges):
```typescript
export type LogSource = "user" | "cron" | "system";
export interface AuthContext { user: {id, is_anonymous, email} | null; isCron: boolean; source: LogSource; }
export async function requireUser(request: Request): Promise<{ctx, error?} | {error}>;
```

From Plan 02 (app/src/__tests__/fixtures/mock-anthropic.ts):
- `makeMockAnthropic({ text, inputTokens, outputTokens })` — returns a stream with `finalMessage()` exposing usage.
- Shared; reuse in Plan 05's route.log.test.ts.

Anthropic SDK streaming usage extraction (verified):
```typescript
const stream = anthropic.messages.stream({ model, system, messages });
// ...consume stream events for SSE body...
const final = await stream.finalMessage();  // { usage: { input_tokens, output_tokens, ... } }
// Non-streaming (sheet route):
const resp = await anthropic.messages.create({...});
// resp.usage: { input_tokens, output_tokens, ... }
```

From Plan 03 (budgetCheck returns inputTokens):
- Could also read pre-dispatch estimate for logging even when Anthropic errors before returning usage.
- withObservability takes `setPromptTokens` / `setOutputTokens` setters so each route records usage when it has it.

From Plan 04 (sanitizer runs at parseBody):
- 400 responses still emit a log via withObservability's finally-block → status:400, prompt_tokens:0, output_tokens:0.

npm package `ulid` (to install):
```typescript
import { ulid, monotonicFactory } from "ulid";
const id = ulid();        // "01HXQ0CXB9X4Y1FZRVPRPVJ3B7"
const mono = monotonicFactory();
const id2 = mono();       // monotonic within same millisecond
```
- ULID regex: `^[0-9A-HJKMNP-TV-Z]{26}$` (Crockford base32).

Supabase admin client pattern (for cost-rollup cron):
```typescript
import { createAdminSupabase } from "@/lib/supabase-admin";
const admin = createAdminSupabase();
await admin.from("cost_metrics").upsert([...], { onConflict: "day,user_id,route" });
```

Vercel Log API — key endpoints (reference, verify during implementation):
- `GET /v1/logs?projectId=...&since=<timestamp>` (Vercel REST API) — requires `VERCEL_TOKEN` env.
- Alternative: write cost_metrics rows inline from `withObservability` to avoid log-retention dependency (see Pitfall 8 below).

**Pitfall 8 decision (documented inline in plan):**
Since Vercel log retention on Hobby (1h) may not cover the 24h rollup window, this plan takes a HYBRID approach:
- `withObservability` emits the console.log for realtime observability (always).
- `withObservability` ALSO performs a lightweight `INSERT INTO cost_metrics_raw (req_id, user_id, route, prompt_tokens, output_tokens, latency_ms, status, source, created_at)` write per request on a best-effort basis (fire-and-forget, DB-failure ignored).
- `cost-rollup` cron aggregates `cost_metrics_raw` into `cost_metrics` (day-grained) and optionally prunes raw rows >48h old.
- `cost_metrics_raw` is included in migration 017 alongside `cost_metrics`.

This eliminates the Vercel plan dependency entirely.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: ulid.ts + observability.ts + capture-log fixture + unit tests</name>
  <files>
    app/package.json,
    app/src/lib/ulid.ts,
    app/src/lib/observability.ts,
    app/src/__tests__/fixtures/capture-log.ts,
    app/src/lib/ulid.test.ts,
    app/src/lib/observability.test.ts
  </files>
  <behavior>
    - `ulid()` returns a 26-char string matching `/^[0-9A-HJKMNP-TV-Z]{26}$/`.
    - `isULID(s)` returns true for valid ULIDs.
    - `monotonicUlid()` returns a monotonic factory (for tests that need deterministic ordering).
    - `withObservability(request, route, source, userIdResolver, handler)`:
      - Generates `reqId` (ULID).
      - Calls `handler(ctx)` where `ctx = { reqId, userId, route, source, setPromptTokens, setOutputTokens }`.
      - `userId` is resolved by calling `userIdResolver(request)` (lets the wrapper stay agnostic of auth).
      - Wraps in try/finally: captures `status` from response, emits JSON log on exit with all 7 fields + source.
      - On throw: sets status=500 (or 4xx if the thrown value is a Response), emits log, re-throws.
      - Fire-and-forget write to `cost_metrics_raw` after log emission (best-effort — DB failure is swallowed with a console.error).
    - `captureConsoleLog()`: vi.spyOn → array of parsed JSON objects.
    - Tests assert all 7 fields present, status correct on success/throw, setters record usage.
  </behavior>
  <action>
Step 1 — Install `ulid`:
  ```bash
  cd app && npm install ulid
  ```
  Verify `package.json` has `"ulid": "^2.3.0"` (or current version) in `dependencies`.

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

Step 3 — Write `app/src/lib/ulid.test.ts`:
  ```typescript
  import { describe, it, expect } from "vitest";
  import { ulid, isULID, monotonicUlid } from "./ulid";

  describe("ulid", () => {
    it("returns 26-char Crockford base32 string", () => {
      const id = ulid();
      expect(id).toHaveLength(26);
      expect(isULID(id)).toBe(true);
    });
    it("isULID rejects malformed input", () => {
      expect(isULID("")).toBe(false);
      expect(isULID("short")).toBe(false);
      expect(isULID("0".repeat(26))).toBe(true);
      expect(isULID("I".repeat(26))).toBe(false); // I not in Crockford alphabet
    });
    it("monotonic factory preserves order within millisecond", () => {
      const a = monotonicUlid();
      const b = monotonicUlid();
      expect(a < b).toBe(true);
    });
  });
  ```

Step 4 — Create `app/src/__tests__/fixtures/capture-log.ts`:
  ```typescript
  import { vi, type MockInstance } from "vitest";

  export interface CapturedLog {
    req_id?: string;
    user_id?: string | null;
    route?: string;
    prompt_tokens?: number;
    output_tokens?: number;
    latency_ms?: number;
    status?: number;
    source?: "user" | "cron" | "system";
    [k: string]: unknown;
  }

  /** vi.spyOn console.log; parse each call arg as JSON and collect. */
  export function captureConsoleLog(): { logs: CapturedLog[]; restore: () => void; spy: MockInstance } {
    const logs: CapturedLog[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
      for (const a of args) {
        if (typeof a === "string") {
          try { logs.push(JSON.parse(a)); } catch { /* non-JSON log — skip */ }
        }
      }
    });
    return { logs, restore: () => spy.mockRestore(), spy };
  }
  ```

Step 5 — Create `app/src/lib/observability.ts`:
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

  /**
   * Single chokepoint for all Anthropic-calling routes. Emits structured JSON log
   * on exit (success or failure) with the 7 required fields + source tag.
   *
   * - Error handling: wraps handler in try/finally so `console.log` is guaranteed.
   * - Usage capture: handler calls setPromptTokens/setOutputTokens from Anthropic metadata.
   * - Best-effort raw write: also inserts to cost_metrics_raw for cost-rollup cron.
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
    } catch {
      // Resolver should be cheap and safe; on failure log null.
      userId = null;
    }

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
      // If the thrown value is a Response (rare but permitted), honor its status.
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
      // eslint-disable-next-line no-console -- Structured log to Vercel stdout ingestion.
      console.log(JSON.stringify(payload));

      // Fire-and-forget raw insert for cost-rollup cron. DB failure is non-fatal.
      // Skip for 4xx short-circuits where we have no tokens (reduces write volume).
      if (status < 500 && (promptTokens > 0 || outputTokens > 0 || status === 200)) {
        void writeCostMetricsRaw(payload).catch((e) => console.error("[obs] cost_metrics_raw write failed:", (e as Error).message));
      }
    }

    if (thrown !== undefined && !(thrown instanceof Response)) throw thrown;
    return response!;
  }

  async function writeCostMetricsRaw(payload: LogPayload): Promise<void> {
    const admin = createAdminSupabase();
    await admin.from("cost_metrics_raw").insert({
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
  }
  ```

Step 6 — Write `app/src/lib/observability.test.ts`:
  ```typescript
  import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
  import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";
  import { isULID } from "./ulid";

  // Mock createAdminSupabase before importing observability.
  vi.mock("@/lib/supabase-admin", () => ({
    createAdminSupabase: () => ({
      from: () => ({ insert: vi.fn(async () => ({ data: null, error: null })) }),
    }),
  }));

  import { withObservability } from "./observability";

  describe("withObservability", () => {
    let cap: ReturnType<typeof captureConsoleLog>;
    beforeEach(() => { cap = captureConsoleLog(); });
    afterEach(() => { cap.restore(); });

    it("emits log with all 7 fields + source on success", async () => {
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
      expect(log.output_tokens).toBe(50);
      expect(typeof log.latency_ms).toBe("number");
      expect(log.status).toBe(200);
      expect(log.source).toBe("user");
    });

    it("emits log with status=500 when handler throws", async () => {
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

    it("source:'cron' on cron calls", async () => {
      const req = new Request("http://localhost/api/cron/x");
      await withObservability(req, "/api/cron/x", "cron", () => "op-1", async () => new Response("ok"));
      expect(cap.logs[0].source).toBe("cron");
      expect(cap.logs[0].user_id).toBe("op-1");
    });

    it("setUserId from handler updates log userId (for routes that resolve user lazily)", async () => {
      const req = new Request("http://localhost/api/test");
      await withObservability(req, "/api/test", "user", () => null, async (ctx) => {
        ctx.setUserId("late-resolved-user");
        return new Response("ok", { status: 200 });
      });
      expect(cap.logs[0].user_id).toBe("late-resolved-user");
    });
  });
  ```

Step 7 — Run tests:
  ```bash
  cd app && npm test -- src/lib/ulid.test.ts src/lib/observability.test.ts
  ```
  All green (3 ulid + 5 observability assertions).
  </action>
  <verify>
    <automated>cd app && npm test -- src/lib/ulid.test.ts src/lib/observability.test.ts</automated>
  </verify>
  <done>
    - `ulid` dependency added to package.json.
    - `ulid.ts` + `observability.ts` + `capture-log.ts` fixture created.
    - 8 unit assertions green (3 ulid + 5 observability).
    - `withObservability` catches throws, records status correctly, emits log in finally.
    - Fire-and-forget raw DB write is present but non-fatal on error.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Migration 017 + cost-rollup cron route</name>
  <files>
    app/supabase/migrations/017_cost_metrics.sql,
    app/src/app/api/cron/cost-rollup/route.ts
  </files>
  <behavior>
    - Migration creates `cost_metrics_raw` (req_id, user_id, route, prompt_tokens, output_tokens, latency_ms, status, source, created_at) + `cost_metrics` (day DATE, user_id UUID nullable, route TEXT, prompt_tokens INT, output_tokens INT, request_count INT, cost_usd NUMERIC, PRIMARY KEY(day, user_id, route)) + RLS (service-role-only on both; authenticated users read own from cost_metrics).
    - `/api/cron/cost-rollup` is a GET handler (Vercel cron convention) gated by `CRON_SECRET` bearer, wrapped by `withObservability(request, '/api/cron/cost-rollup', 'system', () => null, ...)`.
    - Aggregates `cost_metrics_raw` rows from the last 24h GROUP BY day, user_id, route → upserts into `cost_metrics` on conflict.
    - Rough cost estimate per row: `cost_usd = prompt_tokens * 0.000003 + output_tokens * 0.000015` (Sonnet 4.6 ballpark per https://platform.claude.com/docs/en/about-claude/pricing). Exact pricing can be refined in Phase 6 when Stripe lands.
    - Optionally prunes `cost_metrics_raw` rows older than 48h after rollup succeeds.
  </behavior>
  <action>
Step 1 — Create `app/supabase/migrations/017_cost_metrics.sql` (new file, ~60 lines):
  ```sql
  -- 017_cost_metrics.sql
  -- Per-request raw log + per-day rollup for Anthropic cost tracking (SEC-05).
  -- MANUAL APPLY: run via Supabase dashboard SQL editor.
  -- Depends on: 016_user_quotas.sql (user_id column references auth.users).

  CREATE TABLE IF NOT EXISTS cost_metrics_raw (
    req_id         TEXT PRIMARY KEY,
    user_id        UUID,
    route          TEXT NOT NULL,
    prompt_tokens  INT NOT NULL DEFAULT 0,
    output_tokens  INT NOT NULL DEFAULT 0,
    latency_ms     INT NOT NULL DEFAULT 0,
    status         INT NOT NULL DEFAULT 0,
    source         TEXT NOT NULL DEFAULT 'user', -- 'user' | 'cron' | 'system'
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS cost_metrics_raw_created_idx ON cost_metrics_raw (created_at DESC);
  CREATE INDEX IF NOT EXISTS cost_metrics_raw_user_idx    ON cost_metrics_raw (user_id, created_at DESC);

  ALTER TABLE cost_metrics_raw ENABLE ROW LEVEL SECURITY;
  -- Service-role-only writes; no RLS policy for authenticated (they can't read raw).

  CREATE TABLE IF NOT EXISTS cost_metrics (
    day            DATE NOT NULL,
    user_id        UUID,
    route          TEXT NOT NULL,
    prompt_tokens  INT NOT NULL DEFAULT 0,
    output_tokens  INT NOT NULL DEFAULT 0,
    request_count  INT NOT NULL DEFAULT 0,
    cost_usd       NUMERIC(10, 4) NOT NULL DEFAULT 0,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (day, user_id, route)
  );
  CREATE INDEX IF NOT EXISTS cost_metrics_day_idx ON cost_metrics (day DESC);

  ALTER TABLE cost_metrics ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users read own metrics"
    ON cost_metrics FOR SELECT TO authenticated
    USING (user_id = auth.uid());

  -- Service-role can insert/update via admin client (bypasses RLS).
  ```

Step 2 — Create `app/src/app/api/cron/cost-rollup/route.ts`:
  ```typescript
  import { withObservability } from "@/lib/observability";
  import { createAdminSupabase } from "@/lib/supabase-admin";
  import { apiError, unauthorized } from "@/lib/api-error";

  // Rough Sonnet 4.6 per-token pricing (USD). Refine in Phase 6.
  const PROMPT_USD_PER_TOKEN = 0.000003;
  const OUTPUT_USD_PER_TOKEN = 0.000015;

  export const dynamic = "force-dynamic";

  export async function GET(request: Request): Promise<Response> {
    // CRON_SECRET gate.
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return unauthorized("Cron secret required.");
    }

    return withObservability(request, "/api/cron/cost-rollup", "system", () => null, async (ctx) => {
      const admin = createAdminSupabase();
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // Aggregate raw rows in the last 24h, grouped by day/user/route.
      const { data: raw, error: fetchErr } = await admin
        .from("cost_metrics_raw")
        .select("user_id, route, prompt_tokens, output_tokens, created_at")
        .gte("created_at", since);

      if (fetchErr) {
        console.error("[cost-rollup] fetch failed:", fetchErr.message);
        return apiError("Rollup fetch failed.", "INTERNAL_ERROR", 500);
      }

      // Group in-memory (count is small at current scale; move to SQL aggregate if >100K rows).
      const groups = new Map<string, {
        day: string; user_id: string | null; route: string;
        prompt_tokens: number; output_tokens: number; request_count: number;
      }>();

      for (const row of raw ?? []) {
        const day = (row.created_at as string).slice(0, 10); // YYYY-MM-DD
        const key = `${day}|${row.user_id ?? ""}|${row.route}`;
        const g = groups.get(key) ?? {
          day, user_id: row.user_id ?? null, route: row.route,
          prompt_tokens: 0, output_tokens: 0, request_count: 0,
        };
        g.prompt_tokens += row.prompt_tokens ?? 0;
        g.output_tokens += row.output_tokens ?? 0;
        g.request_count += 1;
        groups.set(key, g);
      }

      const upserts = Array.from(groups.values()).map((g) => ({
        ...g,
        cost_usd: +(g.prompt_tokens * PROMPT_USD_PER_TOKEN + g.output_tokens * OUTPUT_USD_PER_TOKEN).toFixed(4),
        updated_at: new Date().toISOString(),
      }));

      if (upserts.length > 0) {
        const { error: upErr } = await admin.from("cost_metrics").upsert(upserts, {
          onConflict: "day,user_id,route",
        });
        if (upErr) {
          console.error("[cost-rollup] upsert failed:", upErr.message);
          return apiError("Rollup upsert failed.", "INTERNAL_ERROR", 500);
        }
      }

      // Prune raw rows older than 48h.
      const pruneCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      await admin.from("cost_metrics_raw").delete().lt("created_at", pruneCutoff);

      ctx.setPromptTokens(upserts.reduce((s, g) => s + g.prompt_tokens, 0));
      ctx.setOutputTokens(upserts.reduce((s, g) => s + g.output_tokens, 0));

      return Response.json({ ok: true, rolled_up: upserts.length });
    });
  }
  ```
  Note: `withObservability` wraps this handler — the cron itself emits a log with source='system' and an aggregate cost in the prompt/output_tokens fields.

Step 3 — Add Vercel cron schedule. Check if `vercel.json` has a `crons` array; if so, add:
  ```json
  {
    "crons": [
      { "path": "/api/cron/morning-sheet", "schedule": "0 12 * * *" },
      { "path": "/api/cron/cost-rollup",    "schedule": "15 2 * * *" }
    ]
  }
  ```
  If `vercel.json` doesn't exist, create it (small file, single responsibility — cron schedule). If an existing morning-sheet cron entry already lives there, just add the cost-rollup entry.

Step 4 — No dedicated test for cost-rollup; its behavior is verified through `observability-coverage.test.ts` (next task) which asserts it imports `withObservability`, plus the raw→rollup query shape is straightforward DB I/O best validated at Plan 07 post-enablement smoke.
  </action>
  <verify>
    <automated>cd app && npm test -- src/lib/observability.test.ts</automated>
  </verify>
  <done>
    - `017_cost_metrics.sql` exists (cost_metrics_raw + cost_metrics + RLS).
    - `/api/cron/cost-rollup/route.ts` exists; GET gated by CRON_SECRET; wrapped by withObservability.
    - `vercel.json` updated (or created) with cost-rollup cron schedule.
    - No new test files — coverage is enforced by observability-coverage.test.ts in Task 4.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Wrap every Anthropic-calling route + cron with withObservability</name>
  <files>
    app/src/app/api/v2-chat/route.ts,
    app/src/app/api/sheet/route.ts,
    app/src/app/api/insight/route.ts,
    app/src/app/api/whole-compute/route.ts,
    app/src/app/api/nudge/route.ts,
    app/src/app/api/palette/route.ts,
    app/src/app/api/reflection/route.ts,
    app/src/app/api/decompose/route.ts,
    app/src/app/api/weekly-review/route.ts,
    app/src/app/api/canvas-regenerate/route.ts,
    app/src/app/api/cron/morning-sheet/route.ts,
    app/src/app/api/v2-chat/route.log.test.ts,
    app/src/app/api/cron/morning-sheet/route.log.test.ts
  </files>
  <behavior>
    - Every listed route body is wrapped by `withObservability(request, '<route>', source, userIdResolver, async (ctx) => { ... existing handler ... })`.
    - `userIdResolver` resolves via Plan 01's `requireUser` when applicable; for canvas-regenerate (Bearer-auth'd) uses the bearer-resolved user; for crons uses the operator user when iterating operators.
    - After Anthropic call completes, handler calls `ctx.setPromptTokens(usage.input_tokens)` and `ctx.setOutputTokens(usage.output_tokens)`.
    - Non-streaming routes: capture from `response.usage` on `anthropic.messages.create(...)`.
    - Streaming v2-chat: use `await stream.finalMessage()` after iteration completes (Anthropic SDK provides the final message with usage metadata). If client disconnects (Plan 06), `finalMessage()` may throw `APIUserAbortError` — catch and record partial usage if available.
    - Morning-sheet cron: log one entry per operator with `source:'cron'` and operator `user_id`; one aggregate log at the end with `user_id: null, source:'cron'`, `prompt_tokens: <sum>`, logged separately.
    - Route.log.test.ts asserts: ≥1 log emitted per request, req_id is ULID, all 7 fields populated, usage reflects mocked Anthropic response.
  </behavior>
  <action>
Step 1 — Surgical edit pattern for each route (illustrated for `/api/v2-chat/route.ts`):
  ```typescript
  import { withObservability } from "@/lib/observability";
  import { requireUser } from "@/lib/auth-guard";
  // ...existing imports

  export async function POST(request: Request): Promise<Response> {
    if (!process.env.ANTHROPIC_API_KEY) return serviceUnavailable();

    // requireUser is called OUTSIDE withObservability so 401s still get logged
    // (the wrapper handles the 401 Response status correctly).
    const auth = await requireUser(request);
    if (auth.error) {
      // Wrap even the 401 path so observability is uniform.
      return withObservability(request, "/api/v2-chat", "user", () => null, async () => auth.error!);
    }
    const { ctx: authCtx } = auth;

    return withObservability(
      request,
      "/api/v2-chat",
      authCtx.source,
      () => authCtx.user?.id ?? null,
      async (obs) => {
        // ─── existing body ───
        // ...IP limit, quota (Plan 02), parseBody, budgetCheck (Plan 03)...
        const stream = anthropic.messages.stream({ model, system, messages: messagesForDispatch, max_tokens: 2048 }, /* signal opts from Plan 06 */);

        // Build the ReadableStream wrapper as before.
        const readable = new ReadableStream({ /* ... */ });

        // Fire-and-forget: await finalMessage after response is returned.
        // BUT: finalMessage is only resolvable after the stream completes on the client.
        // Pattern: use stream.on('finalMessage', (msg) => obs.setPromptTokens(msg.usage.input_tokens))
        // OR await it in a microtask. Simpler: register event listener.
        stream.on?.("finalMessage", (msg: { usage: { input_tokens: number; output_tokens: number } }) => {
          obs.setPromptTokens(msg.usage.input_tokens);
          obs.setOutputTokens(msg.usage.output_tokens);
        });

        const headers: Record<string, string> = { /* ...from Plan 03... */ };
        return new Response(readable, { headers });
      }
    );
  }
  ```
  Key detail: the SDK's `MessageStream` supports `.on('finalMessage', cb)` event (or `await stream.finalMessage()` after iteration). If the `.on(...)` shape isn't what the installed SDK version exposes, fallback to awaiting `stream.finalMessage()` inside the ReadableStream's `start()` after the `for await` loop completes, then call the setters. Either way, the setters run BEFORE the `withObservability` finally-block emits the log — because `withObservability` holds the handler's returned Response and its finally-block runs when that Response's body is consumed? No — finally runs when handler returns, BEFORE stream consumption.

  **Reconciliation for streaming routes:** Since `finally` emits BEFORE stream consumption completes, log usage will be 0 for v2-chat. That's acceptable — the `cost_metrics_raw` row gets updated by a SECOND, async `cost_metrics_raw.upsert(req_id, ...)` call wired inside the `for await` loop's completion. Or simpler: the v2-chat route's log entry records `prompt_tokens` from Plan 03's budget check (pre-dispatch estimate), and the raw table gets a follow-up update on `finalMessage`. Document this in the implementation.

  Pragmatic simplification for now: record `prompt_tokens` as Plan 03's `budget.inputTokens` (pre-dispatch accurate count via `countTokens()`); record `output_tokens` as 0 at log emission, then update the cost_metrics_raw row asynchronously when the stream completes. For non-streaming routes (sheet, insight, etc.), both are captured from `response.usage` BEFORE return — no async dance.

Step 2 — Apply the wrap to all 10 Anthropic-calling routes + 1 cron. Template per route:
  ```typescript
  import { withObservability } from "@/lib/observability";
  import { requireUser } from "@/lib/auth-guard";

  export async function POST(request: Request) {
    if (!process.env.ANTHROPIC_API_KEY) return serviceUnavailable();

    const auth = await requireUser(request);
    if (auth.error) return withObservability(request, "<ROUTE>", "user", () => null, async () => auth.error!);
    const { ctx: authCtx } = auth;

    return withObservability(request, "<ROUTE>", authCtx.source, () => authCtx.user?.id ?? null, async (obs) => {
      // existing body, with:
      const resp = await anthropic.messages.create({ ... });
      obs.setPromptTokens(resp.usage.input_tokens);
      obs.setOutputTokens(resp.usage.output_tokens);
      return Response.json({ ... });
    });
  }
  ```
  Routes to edit (auto-applied per template; adjust `"<ROUTE>"` and streaming-vs-create as appropriate):
  - /api/v2-chat → streaming; uses budgetCheck.inputTokens as prompt_tokens at log time
  - /api/sheet → create; capture from resp.usage
  - /api/insight → create
  - /api/whole-compute → create
  - /api/nudge → create
  - /api/palette → create (Haiku)
  - /api/reflection → create
  - /api/decompose → create
  - /api/weekly-review → create
  - /api/canvas-regenerate → create; bearer-authed (existing) — userIdResolver reads the bearer-resolved user
  - /api/cron/morning-sheet → create; source='cron'; userIdResolver resolves to the current operator inside the iteration OR use `obs.setUserId(operator.id)` per iteration with ONE withObservability wrap total + per-operator structured logs manually emitted via another `console.log(JSON.stringify({...}))` inside the loop. For plan-compat: simpler approach is wrap the outer handler with source='cron' user_id=null and emit one log per operator inline from the loop.

Step 3 — Morning-sheet cron needs special handling — per RESEARCH.md/CONTEXT.md:
  - Per-operator log: `source:'cron', user_id: <operator.id>, prompt_tokens, output_tokens`.
  - Aggregate log: `source:'cron', user_id: null, operator_count: <N>`.
  - Implementation: wrap the outer GET with `withObservability(request, "/api/cron/morning-sheet", "cron", () => null, ...)` for the aggregate log, then inside the operator loop emit a per-operator log via `console.log(JSON.stringify({ req_id, user_id: op.id, ..., source: "cron" }))` — these extra logs are parsed by the same Vercel-JSON ingestion. Use a shared `reqId` prefix per cron run for correlation (e.g., `<run-ulid>-<operator-ulid>` or just use the operator ulid with the outer run ulid in a `parent_req_id` field).
  - Simplification: if per-operator detail matters, use monotonic ULIDs inside the loop; parent req_id is accessible via the outer `obs.reqId`.

Step 4 — Create `app/src/app/api/v2-chat/route.log.test.ts`:
  ```typescript
  import { describe, it, expect, beforeAll, vi } from "vitest";
  import { mockSupabaseAnonSession } from "@/__tests__/fixtures/mock-supabase";
  import { makeMockAnthropic } from "@/__tests__/fixtures/mock-anthropic";
  import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";
  import { isULID } from "@/lib/ulid";

  const { MockAnthropic } = makeMockAnthropic({ text: "hi", inputTokens: 123, outputTokens: 7 });

  vi.mock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));
  vi.mock("@/lib/supabase-server", () => ({ createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-u")) }));
  vi.mock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
  vi.mock("@/lib/supabase-admin", () => ({
    createAdminSupabase: () => ({
      from: () => ({ insert: vi.fn(async () => ({ error: null })) }),
      rpc: vi.fn(async () => ({ data: [{ allowed: true, tier: "anonymous", reset_at: new Date().toISOString(), req_count: 1, token_count: 1 }], error: null })),
      auth: { admin: { getUserById: vi.fn(async () => ({ data: { user: { id: "anon-u", is_anonymous: true } } })) } },
    }),
  }));

  beforeAll(() => {
    process.env.ANTHROPIC_API_KEY = "test";
    process.env.PHASE_1_GATE_ENABLED = "true";
  });

  describe("v2-chat route logging (SEC-05)", () => {
    it("emits a structured log with all 7 fields + source on success", async () => {
      const cap = captureConsoleLog();
      const { POST } = await import("./route");
      const req = new Request("http://localhost/api/v2-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
      });
      const res = await POST(req);
      await res.text().catch(() => ""); // drain stream

      expect(cap.logs.length).toBeGreaterThanOrEqual(1);
      const log = cap.logs.find((l) => l.route === "/api/v2-chat");
      expect(log).toBeDefined();
      expect(isULID(log!.req_id ?? "")).toBe(true);
      expect(log!.user_id).toBe("anon-u");
      expect(log!.source).toBe("user");
      expect(typeof log!.latency_ms).toBe("number");
      expect([200, 429, 400, 413]).toContain(log!.status);
      cap.restore();
    });

    it("emits a log with status=401 when unauthenticated (gate enabled)", async () => {
      // Switch to no-session fixture.
      vi.resetModules();
      vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: () => Promise.resolve({ auth: { getUser: async () => ({ data: { user: null } }) } }) }));
      const cap = captureConsoleLog();
      const { POST } = await import("./route");
      const req = new Request("http://localhost/api/v2-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
      const log = cap.logs.find((l) => l.route === "/api/v2-chat");
      expect(log?.status).toBe(401);
      cap.restore();
    });
  });
  ```

Step 5 — Create `app/src/app/api/cron/morning-sheet/route.log.test.ts`:
  ```typescript
  // Asserts: morning-sheet cron emits log(s) with source:'cron'.
  // Mocks: Anthropic, supabase admin (operator list), CRON_SECRET env.
  import { describe, it, expect, beforeAll, vi } from "vitest";
  import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";
  import { makeMockAnthropic } from "@/__tests__/fixtures/mock-anthropic";

  const { MockAnthropic } = makeMockAnthropic({ text: "briefing", inputTokens: 500, outputTokens: 120 });
  vi.mock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));
  vi.mock("@/lib/supabase-admin", () => ({
    createAdminSupabase: () => ({
      from: (t: string) => t === "cost_metrics_raw"
        ? { insert: vi.fn(async () => ({ error: null })) }
        : { select: () => ({ eq: () => ({ data: [{ id: "op-1" }, { id: "op-2" }], error: null }) }) },
      rpc: vi.fn(),
    }),
  }));

  beforeAll(() => {
    process.env.ANTHROPIC_API_KEY = "test";
    process.env.CRON_SECRET = "test-cron";
  });

  describe("morning-sheet cron logging", () => {
    it("emits at least one log with source:'cron'", async () => {
      const cap = captureConsoleLog();
      const { GET } = await import("./route");
      const req = new Request("http://localhost/api/cron/morning-sheet", {
        headers: { authorization: "Bearer test-cron" },
      });
      await GET(req).catch(() => null);
      const cronLogs = cap.logs.filter((l) => l.source === "cron");
      expect(cronLogs.length).toBeGreaterThanOrEqual(1);
      cap.restore();
    });
  });
  ```

Step 6 — Run all SEC-05 tests:
  ```bash
  cd app && npm test -- src/lib/ulid.test.ts src/lib/observability.test.ts \
    src/app/api/v2-chat/route.log.test.ts src/app/api/cron/morning-sheet/route.log.test.ts
  ```
  </action>
  <verify>
    <automated>cd app && npm test -- src/lib/ulid.test.ts src/lib/observability.test.ts src/app/api/v2-chat/route.log.test.ts src/app/api/cron/morning-sheet/route.log.test.ts</automated>
  </verify>
  <done>
    - All 10 Anthropic-calling routes + 2 cron routes (morning-sheet, cost-rollup) import `withObservability` and wrap their bodies.
    - route.log.test.ts: 2 cases green (success log, 401 log).
    - morning-sheet log test: cron-source log asserted.
    - Existing route tests (Plans 01/02/03) still pass — withObservability wrap is transparent to Response shape.
    - Never-rewrite: surgical insertion of the wrap; existing handler bodies preserved verbatim inside the wrap callback.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 4: Observability coverage meta-test</name>
  <files>
    app/src/__tests__/observability-coverage.test.ts
  </files>
  <behavior>
    - Test scans `app/src/app/api/**/route.ts` via `fs.readdir` (or fast-glob) and reads each file.
    - For any route file that imports `@anthropic-ai/sdk` (pattern `from "@anthropic-ai/sdk"` or `require("@anthropic-ai/sdk")`), the test asserts the file ALSO imports `withObservability` from `@/lib/observability`.
    - Passes the 10+2 wrapped routes in Task 3.
    - Fails cleanly if a future phase adds a new Anthropic-calling route without the wrap — catching the regression before it ships.
  </behavior>
  <action>
Step 1 — Create `app/src/__tests__/observability-coverage.test.ts`:
  ```typescript
  import { describe, it, expect } from "vitest";
  import { readdirSync, readFileSync, statSync } from "node:fs";
  import { join, resolve } from "node:path";

  const API_DIR = resolve(__dirname, "..", "app", "api");

  function walk(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) walk(full, out);
      else if (entry === "route.ts" || entry === "route.tsx") out.push(full);
    }
    return out;
  }

  describe("SEC-05 observability coverage", () => {
    it("every route that imports @anthropic-ai/sdk also imports withObservability", () => {
      const routeFiles = walk(API_DIR);
      const offenders: string[] = [];

      for (const f of routeFiles) {
        const src = readFileSync(f, "utf8");
        const usesAnthropic = /from\s+["']@anthropic-ai\/sdk["']|require\(["']@anthropic-ai\/sdk["']\)/.test(src);
        const hasObs = /from\s+["']@\/lib\/observability["']|require\(["']@\/lib\/observability["']\)/.test(src)
          || /withObservability/.test(src);
        if (usesAnthropic && !hasObs) offenders.push(f);
      }

      expect(offenders, `Routes importing @anthropic-ai/sdk must wrap in withObservability:\n${offenders.join("\n")}`).toEqual([]);
    });
  });
  ```

Step 2 — Path resolution note: `__dirname` in Vitest points to `app/src/__tests__`. `API_DIR` computes to `app/src/app/api`. Verify with a quick log if needed.

Step 3 — Run:
  ```bash
  cd app && npm test -- src/__tests__/observability-coverage.test.ts
  ```
  Expected: green if Task 3 wrapped all routes; otherwise, reports offenders by filename — executor adds `withObservability` to each before merge.

Step 4 — Full suite confirmation:
  ```bash
  cd app && npm test
  ```
  </action>
  <verify>
    <automated>cd app && npm test -- src/__tests__/observability-coverage.test.ts</automated>
  </verify>
  <done>
    - `observability-coverage.test.ts` green.
    - If a future phase adds a new route without the wrap, this test catches it.
    - Full Vitest suite green.
  </done>
</task>

</tasks>

<verification>
**Overall Phase 01-05 checks:**

Automated (must exit 0):
```bash
cd app && npm test -- src/lib/ulid.test.ts \
  src/lib/observability.test.ts \
  src/app/api/v2-chat/route.log.test.ts \
  src/app/api/cron/morning-sheet/route.log.test.ts \
  src/__tests__/observability-coverage.test.ts
```

Non-regression:
```bash
cd app && npm test
```

**Manual gates (Plan 07 owns):**
- Apply `app/supabase/migrations/017_cost_metrics.sql` via Supabase dashboard SQL editor.
- Add `/api/cron/cost-rollup` to `vercel.json` crons schedule (done in code; verify Vercel recognizes it after deploy).
- Verify staging logs include JSON payloads with all 7 fields after `PHASE_1_GATE_ENABLED=true`.
</verification>

<success_criteria>
- SEC-05 fully delivered: ULID-based req_id, structured JSON logs, raw+aggregate tables, cost-rollup cron.
- Coverage meta-test prevents new Anthropic routes shipping without withObservability.
- Fire-and-forget cost_metrics_raw write eliminates Vercel log-retention dependency (Pitfall 8 resolved).
- `ulid` dependency added; no other new deps.
- Never-rewrite honored: every route body is preserved inside the wrap callback.
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-cost-control/01-05-observability-SUMMARY.md` with:
- What was built (ulid, observability, 12 route wraps, cron, migration, coverage meta-test)
- Design decision: hybrid Vercel-log + cost_metrics_raw DB write to decouple from Vercel log retention (Pitfall 8)
- Files modified (13 routes + 6 new lib/test files + 1 migration + 1 fixture)
- Manual step: apply 017_cost_metrics.sql via Supabase dashboard (Plan 07 gates on this)
- Downstream: Phase 4 FUNNEL-03 PostHog events cross-reference `req_id` for per-event attribution; Phase 6 PRICE-03 re-engagement trigger reads from cost_metrics
- Streaming gotcha: v2-chat's output_tokens may log as 0 because finalMessage resolves after log emission; cost_metrics_raw row is updated asynchronously via a secondary write in the stream's finally path
</output>

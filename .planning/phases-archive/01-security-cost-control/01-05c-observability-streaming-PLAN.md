---
phase: 01-security-cost-control
plan: 05c
type: execute
wave: 2
depends_on:
  - "01-00"
  - "01-01"
  - "01-02"
  - "01-03"
  - "01-05a"
files_modified:
  - app/src/app/api/v2-chat/route.ts
  - app/src/app/api/cron/morning-sheet/route.ts
  - app/src/app/api/cron/cost-rollup/route.ts
  - app/supabase/migrations/017_cost_metrics.sql
  - app/src/app/api/v2-chat/route.log.test.ts
  - app/src/app/api/cron/morning-sheet/route.log.test.ts
  - vercel.json
autonomous: true
requirements:
  - SEC-05
must_haves:
  truths:
    - "v2-chat route wraps streaming handler in withObservability with closure-scoped obs.setOutputTokens (NO globalThis — Warning 5)"
    - "v2-chat updates user_quota_ledger output_tokens via secondary admin.from('user_quota_ledger').update(...) keyed on req_id (Plan 02 Blocker 6 reconciliation)"
    - "v2-chat route.log.test asserts output_tokens > 0 in log payload via stream.finalMessage()"
    - "morning-sheet cron is wrapped in withObservability with source:'cron' (Blocker 4: enforced via INDIRECT_ALLOWLIST in Plan 05b's coverage test)"
    - "morning-sheet route.log.test mocks fetch (NOT @anthropic-ai/sdk) — Blocker 4: cron uses fetch to internal routes, not the SDK directly"
    - "morning-sheet records prompt_tokens=0/output_tokens=0 stub for the cron-level log if /api/sheet and /api/insight don't expose usage in their JSON response (documented gap; Phase 2 to add inner-route usage exposure)"
    - "/api/cron/cost-rollup route wraps in withObservability(source:'system'), aggregates cost_metrics_raw → cost_metrics, prunes raw rows >48h"
    - "017_cost_metrics.sql creates cost_metrics_raw + cost_metrics with RLS"
    - "vercel.json crons array includes /api/cron/cost-rollup schedule"
  artifacts:
    - path: "app/src/app/api/v2-chat/route.ts"
      provides: "Streaming wrap; finalMessage closure-scoped setter; secondary user_quota_ledger update"
      contains: "withObservability"
    - path: "app/src/app/api/cron/morning-sheet/route.ts"
      provides: "Cron wrapped in withObservability(source:'cron'); per-operator inline logs via console.log(JSON.stringify(...))"
      contains: "withObservability"
    - path: "app/src/app/api/cron/cost-rollup/route.ts"
      provides: "GET handler gated by CRON_SECRET; wraps in withObservability(source:'system'); aggregates raw → metrics"
      contains: "cost_metrics"
      min_lines: 70
    - path: "app/supabase/migrations/017_cost_metrics.sql"
      provides: "cost_metrics_raw + cost_metrics tables + RLS"
      contains: "cost_metrics"
      min_lines: 60
    - path: "app/src/app/api/v2-chat/route.log.test.ts"
      provides: "Vitest cases: success log (closure-scoped finalMessage), 401 log"
      contains: "finalMessage"
      min_lines: 80
    - path: "app/src/app/api/cron/morning-sheet/route.log.test.ts"
      provides: "Mocks fetch (Blocker 4) — NOT @anthropic-ai/sdk; asserts source:'cron' log emitted"
      contains: "vi.spyOn(globalThis, \"fetch\")"
      min_lines: 50
    - path: "vercel.json"
      provides: "crons schedule includes cost-rollup"
      contains: "cost-rollup"
  key_links:
    - from: "app/src/app/api/v2-chat/route.ts streaming finally"
      to: "obs.setOutputTokens (closure scope)"
      via: "stream.finalMessage().then((msg) => obs.setOutputTokens(msg.usage.output_tokens)) — Warning 5"
      pattern: "obs\\.setOutputTokens"
    - from: "app/src/app/api/v2-chat/route.ts"
      to: "user_quota_ledger update"
      via: "admin.from('user_quota_ledger').update({ token_count: ... }).eq('req_id', obs.reqId) AFTER finalMessage resolves"
      pattern: "user_quota_ledger.*update"
    - from: "app/src/app/api/cron/morning-sheet/route.ts"
      to: "withObservability(source:'cron')"
      via: "Outer GET wrapped; per-operator detail logs emitted inline"
      pattern: "source:\\s*[\"']cron"
---

<objective>
Wave 2 (parallel with Plan 05b) — wrap the streaming v2-chat route, the morning-sheet cron (which calls Anthropic indirectly via fetch), and ship the new cost-rollup cron + 017 migration.

Three distinct concerns:
1. **v2-chat streaming**: `stream.finalMessage()` resolves AFTER the Response is returned (which is also when the wrapper's finally fires). Solution: register an `.on("finalMessage", ...)` listener BEFORE returning the Response; the listener (closure over `obs`) calls `obs.setOutputTokens(usage.output_tokens)` and then performs a secondary `user_quota_ledger.update(...)` keyed on `req_id` to reconcile output_tokens with Plan 02's quota counter (Blocker 6 follow-through). Warning 5: closure scope, NO globalThis.
2. **morning-sheet cron (Blocker 4)**: does NOT import `@anthropic-ai/sdk`; uses `fetch` to call `/api/sheet` and `/api/insight`. The `/api/sheet` and `/api/insight` JSON responses don't currently expose usage data — DOCUMENTED GAP; for Phase 1 the cron records `prompt_tokens=0, output_tokens=0` for the cron-level log (children routes already log their own usage). Test mocks `globalThis.fetch`, NOT the SDK.
3. **cost-rollup cron + 017 migration**: aggregates `cost_metrics_raw` to `cost_metrics` daily; prunes raw >48h.

Together with Plan 05b, this fully delivers SEC-05 across all 10 Anthropic-calling routes + 2 cron routes.

**Manual step flagged:** 017_cost_metrics.sql is manual-apply via Supabase dashboard; Plan 07 gates on it.
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
@.planning/phases/01-security-cost-control/01-02-quota-ledger-PLAN.md
@.planning/phases/01-security-cost-control/01-03-token-budget-PLAN.md
@.planning/phases/01-security-cost-control/01-05a-observability-lib-PLAN.md

<interfaces>
<!-- Plan 05a exports: -->
```typescript
import { withObservability, type ObsCtx, type LogPayload } from "@/lib/observability";
import { ulid } from "@/lib/ulid";
```

<!-- Anthropic SDK streaming MessageStream events: -->
```typescript
const stream = anthropic.messages.stream({...}, { signal: request.signal });
stream.on("finalMessage", (msg: { usage: { input_tokens: number; output_tokens: number } }) => {
  // closure callback — runs AFTER stream completes (success or graceful end)
});
// or:
const final = await stream.finalMessage();
```

<!-- Plan 02's quota schema (016_user_quotas.sql) — req_id column for reconciliation: -->
```sql
CREATE TABLE user_quota_ledger (
  ...
  req_id TEXT,            -- populated by checkAndIncrement when caller provides it
  token_count INT,
  ...
);
```

<!-- morning-sheet currently uses internal fetch (verified by grep — no SDK import): -->
```typescript
const sheetRes = await fetch(`${baseUrl}/api/sheet`, { method: "POST", headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` }, body: ... });
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Wrap v2-chat streaming with closure-scoped finalMessage + secondary quota reconciliation</name>
  <files>
    app/src/app/api/v2-chat/route.ts,
    app/src/app/api/v2-chat/route.log.test.ts
  </files>
  <behavior>
    - v2-chat route wraps existing handler in withObservability.
    - obs.setPromptTokens called immediately after budgetCheck (we have accurate inputTokens already from Plan 03).
    - stream.on("finalMessage", (msg) => obs.setOutputTokens(msg.usage.output_tokens)) registered BEFORE returning the Response — closure captures obs.
    - Same listener also performs `admin.from("user_quota_ledger").update({ token_count: existing + msg.usage.output_tokens }).eq("req_id", obs.reqId)` — reconciles Plan 02's count with actual stream output (Blocker 6 follow-through).
    - 401 short-circuit also wrapped (uniform observability).
    - route.log.test mocks finalMessage AND the admin.update call; asserts output_tokens > 0 in captured log via the listener firing during stream completion.
    - NO globalThis usage anywhere — Warning 5.
  </behavior>
  <action>
Step 1 — Surgical edit `app/src/app/api/v2-chat/route.ts`. Existing structure (after Plans 01/02/03 edits):
  ```typescript
  export async function POST(request: Request) {
    if (!process.env.ANTHROPIC_API_KEY) return serviceUnavailable();
    const auth = await requireUser(request);
    if (auth.error) return auth.error;
    const { ctx } = auth;
    if (!ctx.user || ctx.user.is_anonymous) {
      const ip = ...;
      if (await isRateLimited(ip)) return rateLimited();
    }
    // parseBody, budgetCheck, checkAndIncrement...
    const stream = anthropic.messages.stream({...});
    const readable = new ReadableStream({...});
    const headers: Record<string, string> = {...};
    return new Response(readable, { headers });
  }
  ```

  Refactor:
  ```typescript
  import { withObservability } from "@/lib/observability";
  import { createAdminSupabase } from "@/lib/supabase-admin";

  export async function POST(request: Request): Promise<Response> {
    if (!process.env.ANTHROPIC_API_KEY) return serviceUnavailable();

    const auth = await requireUser(request);
    if (auth.error) {
      return withObservability(request, "/api/v2-chat", "user", () => null, async () => auth.error!);
    }
    const { ctx } = auth;

    return withObservability(
      request,
      "/api/v2-chat",
      ctx.source,
      () => ctx.user?.id ?? null,
      async (obs) => {
        if (!ctx.user || ctx.user.is_anonymous) {
          const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
          if (await isRateLimited(ip)) return rateLimited();
        }

        // parseBody, budgetCheck, checkAndIncrement (Plan 03 ordering — pass obs.reqId for reconciliation)
        // ...assume `body`, `system`, `model`, `messagesForDispatch`, `trimmedCount`, `inputTokens` are in scope
        // ...checkAndIncrement(ctx.user.id, "/api/v2-chat", inputTokens, obs.reqId);  ← updated arg from Plan 03

        // Now we have inputTokens from budget — set promptTokens immediately.
        obs.setPromptTokens(inputTokens);

        const stream = anthropic.messages.stream({
          model, system, messages: messagesForDispatch, max_tokens: 2048,
        }, { signal: request.signal });  // signal arg from Plan 06

        // Register finalMessage listener — closure captures `obs`. Warning 5: no globalThis.
        stream.on("finalMessage", (msg: { usage: { input_tokens: number; output_tokens: number } }) => {
          obs.setOutputTokens(msg.usage.output_tokens);
          // Secondary quota reconciliation (Blocker 6): update token_count by output_tokens delta.
          if (ctx.user && msg.usage.output_tokens > 0) {
            const admin = createAdminSupabase();
            void admin.from("user_quota_ledger")
              .update({ token_count: msg.usage.input_tokens + msg.usage.output_tokens })
              .eq("req_id", obs.reqId)
              .then((res) => {
                if (res.error) console.error("[v2-chat] quota reconciliation failed:", res.error.message);
              });
          }
        });

        // Existing ReadableStream wrapper from Plan 06 (abort wiring) — preserve verbatim.
        const readable = new ReadableStream({
          async start(controller) { /* ...Plan 06 existing logic... */ },
          cancel(reason) { try { stream.abort(); } catch { /* noop */ } },
        });

        const headers: Record<string, string> = {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        };
        if (trimmedCount > 0) headers["X-Huma-Truncated"] = `count=${trimmedCount},reason=budget`;
        return new Response(readable, { headers });
      },
    );
  }
  ```

  **Note on log timing:** the wrapper's finally-block fires when the handler returns the Response — NOT when the stream completes. So `output_tokens` may be 0 in the FIRST log entry. The `stream.on("finalMessage", ...)` listener then runs LATER and updates the closure variable, BUT the log payload was already serialized. To capture the true output_tokens in the log, the listener should emit a SECOND log entry tagged as a reconciliation:
  ```typescript
  stream.on("finalMessage", (msg) => {
    obs.setOutputTokens(msg.usage.output_tokens);
    // Emit a reconciliation log so cost_metrics_raw gets the real number.
    console.log(JSON.stringify({
      req_id: obs.reqId,
      user_id: ctx.user?.id ?? null,
      route: "/api/v2-chat",
      prompt_tokens: msg.usage.input_tokens,
      output_tokens: msg.usage.output_tokens,
      latency_ms: 0,                        // unused for reconciliation entries
      status: 200,
      source: ctx.source,
      reconciles: obs.reqId,                // marker — cost-rollup folds these in
    }));
    // Quota reconciliation as before:
    if (ctx.user && msg.usage.output_tokens > 0) { /* ...admin.update... */ }
  });
  ```
  cost-rollup cron groups by `req_id` and uses the LATER log entry's tokens (max wins).

  **Updated checkAndIncrement call (Blocker 6 follow-through):** Plan 03's edit had `checkAndIncrement(ctx.user.id, "/api/v2-chat", inputTokens)` — update to `checkAndIncrement(ctx.user.id, "/api/v2-chat", inputTokens, obs.reqId)` so the ledger row's req_id is populated and the secondary update can find it.

Step 2 — Write `app/src/app/api/v2-chat/route.log.test.ts`. Mock the SDK so finalMessage resolves synchronously with mocked usage; assert output_tokens > 0 via the second (reconciliation) log entry:
  ```typescript
  import { describe, it, expect, beforeAll, vi } from "vitest";
  import { mockSupabaseAnonSession } from "@/__tests__/fixtures/mock-supabase";
  import { makeMockAnthropic } from "@/__tests__/fixtures/mock-anthropic";
  import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";
  import { isULID } from "@/lib/ulid";

  const mock = makeMockAnthropic({ text: "hi", inputTokens: 123, outputTokens: 7 });
  vi.mock("@anthropic-ai/sdk", () => ({ default: mock.MockAnthropic }));
  vi.mock("@/lib/supabase-server", () => ({ createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-u")) }));
  vi.mock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
  vi.mock("@/lib/supabase-admin", () => ({
    createAdminSupabase: () => ({
      from: () => ({
        insert: vi.fn(async () => ({ error: null })),
        update: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
      }),
      rpc: vi.fn(async () => ({ data: [{ allowed: true, tier: "anonymous", reset_at: new Date().toISOString(), req_count: 1, token_count: 1 }], error: null })),
      auth: { admin: { getUserById: vi.fn(async () => ({ data: { user: { id: "anon-u", is_anonymous: true } } })) } },
    }),
  }));

  beforeAll(() => {
    process.env.ANTHROPIC_API_KEY = "test";
    process.env.PHASE_1_GATE_ENABLED = "true";
  });

  describe("v2-chat route logging (SEC-05)", () => {
    it("emits initial log + reconciliation log with output_tokens > 0 (closure-scoped — Warning 5)", async () => {
      const cap = captureConsoleLog();
      const { POST } = await import("./route");
      const req = new Request("http://localhost/api/v2-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
      });
      const res = await POST(req);

      // Drain the stream to trigger finalMessage listener.
      const reader = (res.body as ReadableStream).getReader();
      while (true) { const { done } = await reader.read(); if (done) break; }
      // Allow microtasks / .then chains to flush.
      await new Promise((r) => setTimeout(r, 10));

      const v2Logs = cap.logs.filter((l) => l.route === "/api/v2-chat");
      expect(v2Logs.length).toBeGreaterThanOrEqual(1);
      expect(isULID(v2Logs[0].req_id ?? "")).toBe(true);

      // Reconciliation log carries the real output_tokens.
      const reconciliation = v2Logs.find((l) => (l as { reconciles?: string }).reconciles);
      expect(reconciliation, "expected a reconciliation log entry").toBeDefined();
      expect(reconciliation!.output_tokens).toBeGreaterThan(0);
      cap.restore();
    });

    it("emits log with status=401 when unauthenticated (gate enabled)", async () => {
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

Step 3 — Run:
  ```bash
  cd app && npm test -- src/app/api/v2-chat/route.log.test.ts src/app/api/v2-chat/route.auth.test.ts src/app/api/v2-chat/route.quota.test.ts
  ```
  All green. The earlier auth/quota tests should still pass — wrap is transparent.
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/v2-chat/route.log.test.ts src/app/api/v2-chat/route.auth.test.ts</automated>
  </verify>
  <done>
    - v2-chat wrapped in withObservability with closure-scoped finalMessage listener (Warning 5).
    - Reconciliation log entry emitted; cost-rollup cron groups by req_id and picks max output_tokens.
    - Secondary user_quota_ledger.update keyed on req_id (Blocker 6 follow-through).
    - 2 log-test cases green; existing auth/quota tests still pass.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Wrap morning-sheet cron + fetch-mocked log test (Blocker 4)</name>
  <files>
    app/src/app/api/cron/morning-sheet/route.ts,
    app/src/app/api/cron/morning-sheet/route.log.test.ts
  </files>
  <behavior>
    - Outer GET wrapped in withObservability(request, "/api/cron/morning-sheet", "cron", () => null, async (obs) => { ... });
    - source: "cron" tagged on outer log.
    - Inside the operator loop, for each operator, also emit a per-operator console.log(JSON.stringify({req_id, user_id: op.id, route: "/api/cron/morning-sheet", source: "cron", parent_req_id: obs.reqId, prompt_tokens: 0, output_tokens: 0, ...})) — per-operator visibility for cost-rollup.
    - DOCUMENTED GAP: prompt_tokens/output_tokens are 0 because /api/sheet and /api/insight don't expose usage in their JSON response bodies. Children routes already log their own usage; this cron-level log is for operator-count attribution. Phase 2 to add usage exposure to inner routes.
    - route.log.test mocks `globalThis.fetch` (NOT the SDK — Blocker 4) and asserts source:"cron" log emitted.
  </behavior>
  <action>
Step 1 — Surgical edit `app/src/app/api/cron/morning-sheet/route.ts`. Existing handler is one big GET. Wrap it:
  ```typescript
  import { withObservability } from "@/lib/observability";
  import { ulid } from "@/lib/ulid";

  export async function GET(request: Request): Promise<Response> {
    return withObservability(
      request,
      "/api/cron/morning-sheet",
      "cron",
      () => null,
      async (obs) => {
        if (!verifyCron(request)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        // ...existing operator iteration loop...

        for (const userId of userIds) {
          try {
            // ...existing per-operator processing...
            // ...sheetRes = await fetch(...); insightRes = await fetch(...); etc...

            // Emit per-operator log inline (parent_req_id correlates with cron run).
            // NOTE: prompt_tokens/output_tokens=0 — DOCUMENTED GAP (Phase 2 to fix).
            console.log(JSON.stringify({
              req_id: ulid(),
              parent_req_id: obs.reqId,
              user_id: userId,
              route: "/api/cron/morning-sheet",
              prompt_tokens: 0,           // GAP: /api/sheet doesn't expose resp.usage in body
              output_tokens: 0,
              latency_ms: 0,
              status: sheetRes.ok ? 200 : sheetRes.status,
              source: "cron",
            }));
          } catch (err) {
            // ...existing error handling...
          }
        }

        // Aggregate-level: obs.setOutputTokens / setPromptTokens stay 0 (gap noted).
        return Response.json({ date, users: userIds.length, sent: totalSent, skipped: totalSkipped, insights: totalInsights });
      },
    );
  }
  ```

Step 2 — Write `app/src/app/api/cron/morning-sheet/route.log.test.ts` (Blocker 4: mock fetch, NOT the SDK):
  ```typescript
  import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
  import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";

  // ─── Blocker 4: morning-sheet does NOT import @anthropic-ai/sdk. Mock fetch instead. ───
  // The cron calls /api/sheet and /api/insight via fetch; those routes are mocked at the
  // network level so we don't actually hit Anthropic.

  vi.mock("@/lib/supabase-admin", () => ({
    createAdminSupabase: () => ({
      from: (table: string) => {
        if (table === "push_subscriptions") {
          return { select: () => ({ order: () => ({ data: [{ user_id: "op-1" }, { user_id: "op-2" }], error: null }) }) };
        }
        if (table === "aspirations") {
          return { select: () => ({ eq: () => ({ eq: () => ({ data: [{ id: "a", raw_text: "x", clarified_text: "x", behaviors: [], status: "active", stage: "active" }], error: null }) }) }) };
        }
        if (table === "contexts") {
          return { select: () => ({ eq: () => ({ order: () => ({ limit: () => ({ single: async () => ({ data: { known_context: {}, why_statement: "", created_at: new Date().toISOString() }, error: null }) }) }) }) }) };
        }
        if (table === "sheet_entries") {
          return { select: () => ({ eq: () => ({ gte: () => ({ data: [], error: null }) }) }) };
        }
        if (table === "chat_messages") {
          return { select: () => ({ eq: () => ({ order: () => ({ limit: () => ({ data: [], error: null }) }) }) }) };
        }
        if (table === "cost_metrics_raw") {
          return { insert: vi.fn(async () => ({ error: null })) };
        }
        return { select: () => ({ eq: () => ({ data: [], error: null }) }) };
      },
      rpc: vi.fn(),
    }),
  }));

  // Mock push helpers so they don't actually try to send.
  vi.mock("@/lib/push-send", () => ({ sendPushToUser: vi.fn(async () => 1) }));
  vi.mock("@/lib/supabase-v2", () => ({
    saveInsight: vi.fn(async () => null),
    getUndeliveredInsight: vi.fn(async () => null),
    markInsightDelivered: vi.fn(async () => null),
  }));

  beforeAll(() => {
    process.env.ANTHROPIC_API_KEY = "test";
    process.env.CRON_SECRET = "test-cron";
  });

  describe("morning-sheet cron logging (Blocker 4: fetch-mocked, NOT SDK-mocked)", () => {
    let fetchSpy: ReturnType<typeof vi.spyOn> | undefined;
    let cap: ReturnType<typeof captureConsoleLog>;
    beforeEach(() => {
      cap = captureConsoleLog();
      // Mock global fetch for /api/sheet + /api/insight calls.
      fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (url: any) => {
        if (String(url).includes("/api/sheet")) {
          return new Response(JSON.stringify({ entries: [{ headline: "test", time_of_day: "morning" }], through_line: "" }), { status: 200 });
        }
        if (String(url).includes("/api/insight")) {
          return new Response(JSON.stringify({ insight: null }), { status: 200 });
        }
        return new Response("not found", { status: 404 });
      });
    });
    afterEach(() => {
      cap.restore();
      fetchSpy?.mockRestore();
    });

    it("emits at least one log entry tagged source:'cron'", async () => {
      const { GET } = await import("./route");
      const req = new Request("http://localhost/api/cron/morning-sheet", {
        headers: { authorization: "Bearer test-cron" },
      });
      await GET(req).catch(() => null);
      const cronLogs = cap.logs.filter((l) => l.source === "cron");
      expect(cronLogs.length).toBeGreaterThanOrEqual(1);
      // Outer wrap log has route /api/cron/morning-sheet:
      const outerLog = cronLogs.find((l) => l.route === "/api/cron/morning-sheet" && !(l as { parent_req_id?: string }).parent_req_id);
      expect(outerLog).toBeDefined();
    });

    it("emits per-operator logs with parent_req_id correlation", async () => {
      const { GET } = await import("./route");
      const req = new Request("http://localhost/api/cron/morning-sheet", {
        headers: { authorization: "Bearer test-cron" },
      });
      await GET(req).catch(() => null);
      const perOpLogs = cap.logs.filter((l) => (l as { parent_req_id?: string }).parent_req_id);
      // 2 operators × 1 log each = 2 per-op logs (mock setup).
      expect(perOpLogs.length).toBeGreaterThanOrEqual(1);
    });
  });
  ```

Step 3 — Run:
  ```bash
  cd app && npm test -- src/app/api/cron/morning-sheet/route.log.test.ts
  ```
  Both cases green.
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/cron/morning-sheet/route.log.test.ts</automated>
  </verify>
  <done>
    - morning-sheet wrapped in withObservability(source:"cron").
    - Per-operator logs emitted inline with parent_req_id correlation.
    - GAP documented: prompt/output tokens=0 because inner routes don't expose usage in JSON.
    - Test mocks fetch (Blocker 4) — NOT @anthropic-ai/sdk.
    - 2 test cases green.
  </done>
</task>

<task type="auto">
  <name>Task 3: Migration 017 + cost-rollup cron route + vercel.json</name>
  <files>
    app/supabase/migrations/017_cost_metrics.sql,
    app/src/app/api/cron/cost-rollup/route.ts,
    vercel.json
  </files>
  <behavior>
    - 017 migration: cost_metrics_raw + cost_metrics + RLS (same as original Plan 05 — see file content).
    - cost-rollup GET handler gated by CRON_SECRET; wrapped in withObservability(source:"system"); aggregates raw → metrics; prunes raw >48h.
    - vercel.json includes the cost-rollup cron schedule.
  </behavior>
  <action>
Step 1 — Create `app/supabase/migrations/017_cost_metrics.sql` (same SQL content as the original Plan 05 spec — cost_metrics_raw with req_id, user_id, route, prompt_tokens, output_tokens, latency_ms, status, source, created_at; cost_metrics with day, user_id, route, prompt_tokens, output_tokens, request_count, cost_usd, updated_at; RLS users-read-own on cost_metrics; service-role-only on cost_metrics_raw).

Step 2 — Create `app/src/app/api/cron/cost-rollup/route.ts` (same handler content as the original Plan 05 spec — see Plan 05 file Task 2 Step 2 for the exact implementation; copy-paste verbatim and adapt). Key elements:
  - Uses `withObservability(request, "/api/cron/cost-rollup", "system", () => null, ...)`.
  - Gated by CRON_SECRET bearer.
  - Aggregates `cost_metrics_raw` from last 24h → upserts `cost_metrics` keyed on (day, user_id, route).
  - Includes `cost_usd` calculation (Sonnet rates; refine in Phase 6).
  - Prunes `cost_metrics_raw` rows older than 48h.
  - Reconciliation entry handling: when scanning raw rows, GROUP BY req_id and use MAX(prompt_tokens, output_tokens) for each req_id (so streaming v2-chat's reconciliation log wins over the initial 0-output entry).

Step 3 — Update or create `vercel.json` to include both crons:
  ```json
  {
    "crons": [
      { "path": "/api/cron/morning-sheet", "schedule": "0 12 * * *" },
      { "path": "/api/cron/cost-rollup",    "schedule": "15 2 * * *" }
    ]
  }
  ```
  If `vercel.json` exists with other settings, merge — do not replace.

Step 4 — No new test file — coverage is enforced by Plan 05b's `observability-coverage.test.ts` (cost-rollup imports withObservability so it passes the SDK-OR-allowlist check by virtue of importing the wrap directly).

Step 5 — Run full suite:
  ```bash
  cd app && npm test
  ```
  </action>
  <verify>
    <automated>cd app && npm test -- src/__tests__/observability-coverage.test.ts</automated>
  </verify>
  <done>
    - 017_cost_metrics.sql exists.
    - cost-rollup route.ts exists, wrapped in withObservability, GROUP BY req_id with MAX aggregation for v2-chat reconciliation.
    - vercel.json updated with cost-rollup schedule.
    - observability-coverage.test.ts now green (morning-sheet wrapped + cost-rollup wrapped + all 8 from Plan 05b wrapped).
  </done>
</task>

</tasks>

<verification>
**Overall Phase 01-05c checks:**

Automated (must exit 0):
```bash
cd app && npm test -- src/app/api/v2-chat/route.log.test.ts \
  src/app/api/cron/morning-sheet/route.log.test.ts \
  src/__tests__/observability-coverage.test.ts
```

Non-regression:
```bash
cd app && npm test
```

**Manual gate (Plan 07 owns):**
- Apply 017_cost_metrics.sql via Supabase dashboard.
- Verify Vercel recognizes cost-rollup cron after deploy.
</verification>

<success_criteria>
- v2-chat streaming wrap with closure-scoped finalMessage listener (Warning 5: NO globalThis).
- Reconciliation log + secondary user_quota_ledger.update keyed on req_id (Blocker 6 follow-through).
- morning-sheet wrapped + per-operator logs + DOCUMENTED gap on token attribution + fetch-mocked test (Blocker 4).
- cost-rollup cron + 017 migration shipped.
- observability-coverage.test green (Wave 2 complete).
- Surgical edits only.
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-cost-control/01-05c-observability-streaming-SUMMARY.md` with:
- What was built (v2-chat wrap + finalMessage listener, morning-sheet wrap, cost-rollup, 017 migration, vercel.json update)
- Warning 5: closure-scoped output_tokens via finalMessage listener; reconciliation log entry pattern; cost-rollup MAX-by-req_id grouping
- Blocker 4: morning-sheet wrapped via INDIRECT_ALLOWLIST in Plan 05b's coverage test; route.log.test mocks globalThis.fetch
- Blocker 6 follow-through: checkAndIncrement(...obs.reqId) call updated; secondary user_quota_ledger.update reconciles output_tokens
- DOCUMENTED GAP: morning-sheet cron-level prompt/output tokens are 0 because inner routes don't expose usage in JSON. Phase 2 to add inner-route usage exposure.
- Manual step: apply 017_cost_metrics.sql via Supabase dashboard (Plan 07 gates on this)
- Files modified (3 routes wrapped + 1 new route + 1 migration + vercel.json + 2 test files)
</output>

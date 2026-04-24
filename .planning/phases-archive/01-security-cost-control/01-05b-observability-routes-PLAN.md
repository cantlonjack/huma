---
phase: 01-security-cost-control
plan: 05b
type: execute
wave: 2
depends_on:
  - "01-00"
  - "01-01"
  - "01-05a"
files_modified:
  - app/src/app/api/sheet/route.ts
  - app/src/app/api/insight/route.ts
  - app/src/app/api/whole-compute/route.ts
  - app/src/app/api/nudge/route.ts
  - app/src/app/api/palette/route.ts
  - app/src/app/api/reflection/route.ts
  - app/src/app/api/weekly-review/route.ts
  - app/src/app/api/canvas-regenerate/route.ts
  - app/src/app/api/sheet/route.log.test.ts
  - app/src/__tests__/observability-coverage.test.ts
autonomous: true
requirements:
  - SEC-05
must_haves:
  truths:
    - "Each of the 8 non-streaming Anthropic-calling routes (sheet, insight, whole-compute, nudge, palette, reflection, weekly-review, canvas-regenerate) wraps its handler in withObservability"
    - "Each wrapped route captures Anthropic usage via resp.usage.{input_tokens, output_tokens} and calls obs.setPromptTokens / obs.setOutputTokens BEFORE returning the Response (so finally-block sees them)"
    - "observability-coverage.test.ts: every route under app/src/app/api/**/route.ts that imports @anthropic-ai/sdk OR is on the always-wrap allowlist (Plan 05c morning-sheet) imports withObservability"
    - "sheet route.log.test.ts asserts log emitted with all 7 fields + non-zero output_tokens (Warning 5 in practice)"
    - "Existing route tests (auth, quota) still pass — wrap is transparent to Response shape"
  artifacts:
    - path: "app/src/app/api/sheet/route.ts"
      provides: "Wrapped in withObservability(request, '/api/sheet', authCtx.source, () => authCtx.user?.id ?? null, async (obs) => {...})"
      contains: "withObservability"
    - path: "app/src/__tests__/observability-coverage.test.ts"
      provides: "Meta-test: scans app/src/app/api/**/route.ts; flags any file that imports @anthropic-ai/sdk OR is in INDIRECT_ALLOWLIST but does NOT import withObservability (Blocker 4)"
      contains: "INDIRECT_ALLOWLIST"
      min_lines: 60
    - path: "app/src/app/api/sheet/route.log.test.ts"
      provides: "Vitest case: success log emitted with output_tokens > 0 from resp.usage"
      contains: "output_tokens"
      min_lines: 60
  key_links:
    - from: "8 non-streaming routes"
      to: "app/src/lib/observability.ts withObservability"
      via: "import + wrap entire handler body"
      pattern: "withObservability"
    - from: "Each wrapped route"
      to: "obs.setPromptTokens / obs.setOutputTokens"
      via: "Called immediately after anthropic.messages.create returns"
      pattern: "setPromptTokens|setOutputTokens"
---

<objective>
Wave 2 — wrap the 8 non-streaming Anthropic-calling routes in `withObservability` (the lib from Plan 05a). Token attribution is straightforward here because `anthropic.messages.create` returns `resp.usage` synchronously — we can call `obs.setPromptTokens(resp.usage.input_tokens)` and `obs.setOutputTokens(resp.usage.output_tokens)` BEFORE returning the Response, so the finally-block sees the populated values.

Routes covered (8 total):
- /api/sheet
- /api/insight
- /api/whole-compute
- /api/nudge
- /api/palette (Haiku)
- /api/reflection
- /api/weekly-review
- /api/canvas-regenerate

This plan also ships `observability-coverage.test.ts` — the meta-test that prevents future routes from shipping without the wrap.

**Blocker 4 partial fix:** The coverage meta-test includes an `INDIRECT_ALLOWLIST` set hard-coded with `morning-sheet` route path. That cron does NOT import `@anthropic-ai/sdk` directly (it `fetch`-es internal `/api/sheet` and `/api/insight`), so the SDK-grep would miss it — the allowlist forces the wrap. Plan 05c then actually adds the wrap to morning-sheet.

**Excluded from this plan:**
- /api/v2-chat (streaming — owned by Plan 05c, needs special finalMessage handling)
- /api/cron/morning-sheet (cron + indirect SDK — owned by Plan 05c, needs allowlist + fetch-mock test)
- /api/cron/cost-rollup (NEW — created by Plan 05c)
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
@.planning/phases/01-security-cost-control/01-05a-observability-lib-PLAN.md

<interfaces>
<!-- From Plan 05a: -->
```typescript
import { withObservability, type ObsCtx } from "@/lib/observability";
```

<!-- From Plan 01: -->
```typescript
import { requireUser } from "@/lib/auth-guard";
```

<!-- Anthropic non-streaming usage shape: -->
```typescript
const resp = await anthropic.messages.create({ model, system, messages, max_tokens });
// resp.usage = { input_tokens, output_tokens, cache_creation_input_tokens?, cache_read_input_tokens? }
```

<!-- From Plan 00 fixtures: makeMockAnthropic exposes resp.usage on create() mock. -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Wrap sheet/route.ts (template) + sheet route.log.test.ts</name>
  <files>
    app/src/app/api/sheet/route.ts,
    app/src/app/api/sheet/route.log.test.ts
  </files>
  <behavior>
    - sheet/route.ts wraps its existing handler body inside `withObservability(request, "/api/sheet", authCtx.source, () => authCtx.user?.id ?? null, async (obs) => { ... })`.
    - Inside the handler, after `anthropic.messages.create(...)` returns: `obs.setPromptTokens(resp.usage.input_tokens); obs.setOutputTokens(resp.usage.output_tokens);`.
    - Pre-existing 401 path (from Plan 01) is also wrapped so observability is uniform — wrap a thin handler that returns auth.error.
    - sheet route.log.test.ts asserts a log with output_tokens > 0 (Warning 5 lands in practice).
  </behavior>
  <action>
Step 1 — Surgical edit `app/src/app/api/sheet/route.ts`. Existing structure (after Plans 01/03 edits):
  ```typescript
  export async function POST(request: Request) {
    if (!process.env.ANTHROPIC_API_KEY) return serviceUnavailable();
    const auth = await requireUser(request);
    if (auth.error) return auth.error;
    const { ctx } = auth;
    if (!ctx.isCron && (!ctx.user || ctx.user.is_anonymous)) {
      const ip = ...;
      if (await isRateLimited(ip)) return rateLimited();
    }
    // ...parseBody, budgetCheck, checkAndIncrement...
    const response = await anthropic.messages.create({...});
    return new Response(JSON.stringify({...}), { headers, status: 200 });
  }
  ```
  Refactor into `withObservability` wrap:
  ```typescript
  import { withObservability } from "@/lib/observability";

  export async function POST(request: Request): Promise<Response> {
    if (!process.env.ANTHROPIC_API_KEY) return serviceUnavailable();

    // Auth runs OUTSIDE the wrap so we can short-circuit on 401 — but we still
    // want the 401 logged, so wrap a tiny handler in that branch too.
    const auth = await requireUser(request);
    if (auth.error) {
      return withObservability(request, "/api/sheet", "user", () => null, async () => auth.error!);
    }
    const { ctx } = auth;

    return withObservability(
      request,
      "/api/sheet",
      ctx.source,
      () => ctx.user?.id ?? null,
      async (obs) => {
        if (!ctx.isCron && (!ctx.user || ctx.user.is_anonymous)) {
          const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
          if (await isRateLimited(ip)) return rateLimited();
        }
        // ...existing parseBody, budgetCheck, checkAndIncrement, anthropic.messages.create...
        const response = await anthropic.messages.create({ model, system, messages: messagesForDispatch, max_tokens: 2048 });

        // ─── SEC-05 token attribution ───
        obs.setPromptTokens(response.usage.input_tokens);
        obs.setOutputTokens(response.usage.output_tokens);

        // ...existing payload construction + Response return...
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (trimmedCount > 0) headers["X-Huma-Truncated"] = `count=${trimmedCount},reason=budget`;
        return new Response(JSON.stringify({ /* existing payload */ }), { headers, status: 200 });
      },
    );
  }
  ```

Step 2 — Write `app/src/app/api/sheet/route.log.test.ts`:
  ```typescript
  import { describe, it, expect, beforeAll, vi } from "vitest";
  import { mockSupabaseAuthedSession } from "@/__tests__/fixtures/mock-supabase";
  import { makeMockAnthropic } from "@/__tests__/fixtures/mock-anthropic";
  import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";
  import { isULID } from "@/lib/ulid";

  const { MockAnthropic } = makeMockAnthropic({ text: "ok", inputTokens: 250, outputTokens: 50 });
  vi.mock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));
  vi.mock("@/lib/supabase-server", () => ({ createServerSupabase: () => Promise.resolve(mockSupabaseAuthedSession("u-1")) }));
  vi.mock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
  vi.mock("@/lib/supabase-admin", () => ({
    createAdminSupabase: () => ({
      from: () => ({ insert: vi.fn(async () => ({ error: null })) }),
      rpc: vi.fn(async () => ({ data: [{ allowed: true, tier: "free", reset_at: new Date().toISOString(), req_count: 1, token_count: 1 }], error: null })),
      auth: { admin: { getUserById: vi.fn(async () => ({ data: { user: { id: "u-1", is_anonymous: false } } })) } },
    }),
  }));

  beforeAll(() => {
    process.env.ANTHROPIC_API_KEY = "test";
    process.env.PHASE_1_GATE_ENABLED = "true";
  });

  describe("sheet route logging (SEC-05)", () => {
    it("emits log with all 7 fields + output_tokens > 0 (Warning 5 in practice)", async () => {
      const cap = captureConsoleLog();
      const { POST } = await import("./route");
      const req = new Request("http://localhost/api/sheet", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ aspirations: [], conversationMessages: [] }),
      });
      await POST(req).catch(() => null);
      const log = cap.logs.find((l) => l.route === "/api/sheet");
      expect(log).toBeDefined();
      expect(isULID(log!.req_id ?? "")).toBe(true);
      expect(log!.user_id).toBe("u-1");
      expect(log!.source).toBe("user");
      expect(typeof log!.latency_ms).toBe("number");
      expect(log!.output_tokens).toBeGreaterThan(0);  // Warning 5 — in practice
      cap.restore();
    });
  });
  ```

Step 3 — Run sheet log test + the prior sheet auth test:
  ```bash
  cd app && npm test -- src/app/api/sheet/route.log.test.ts src/app/api/sheet/route.auth.test.ts
  ```
  Both green.
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/sheet/route.log.test.ts src/app/api/sheet/route.auth.test.ts</automated>
  </verify>
  <done>
    - sheet/route.ts wraps handler in withObservability + calls setPromptTokens/setOutputTokens.
    - 401 short-circuit also wrapped (uniform observability).
    - route.log.test.ts asserts output_tokens > 0.
    - Existing sheet auth test still passes.
  </done>
</task>

<task type="auto">
  <name>Task 2: Wrap the other 7 non-streaming routes using the same template</name>
  <files>
    app/src/app/api/insight/route.ts,
    app/src/app/api/whole-compute/route.ts,
    app/src/app/api/nudge/route.ts,
    app/src/app/api/palette/route.ts,
    app/src/app/api/reflection/route.ts,
    app/src/app/api/weekly-review/route.ts,
    app/src/app/api/canvas-regenerate/route.ts
  </files>
  <behavior>
    - Apply the Task 1 template to each route.
    - For each: `withObservability(request, "<ROUTE>", authCtx.source, () => authCtx.user?.id ?? null, async (obs) => { ...; obs.setPromptTokens(resp.usage.input_tokens); obs.setOutputTokens(resp.usage.output_tokens); return Response.json(...); })`.
    - canvas-regenerate already has Bearer auth — userIdResolver reads the bearer-resolved user (the route already extracts it).
    - reflection: now has Plan 04's Zod schema + parseBody. Wrap the handler body identically; capture usage from msg.content[0]'s parent (use `msg.usage.input_tokens` from `anthropic.messages.create` return).
  </behavior>
  <action>
For each route, apply the template:
  1. Add `import { withObservability } from "@/lib/observability";` at top.
  2. Wrap the existing handler body inside `withObservability(request, "/api/<route>", authCtx.source, () => authCtx.user?.id ?? null, async (obs) => { ... });`.
  3. After `const resp = await anthropic.messages.create({...})` (or equivalent variable name): add `obs.setPromptTokens(resp.usage.input_tokens); obs.setOutputTokens(resp.usage.output_tokens);` BEFORE the `return Response.json(...)`.
  4. If the route has a 401 short-circuit before the wrap, wrap that too in a thin `withObservability(request, "/api/<route>", "user", () => null, async () => auth.error!)`.

Routes (verify the variable names by grep before editing):
- /api/insight: `const message = await anthropic.messages.create({...})` → `obs.setPromptTokens(message.usage.input_tokens)`
- /api/whole-compute: same pattern
- /api/nudge: same
- /api/palette (Haiku): same
- /api/reflection: variable is `msg` (`const msg = await anthropic.messages.create({...})`) → `obs.setPromptTokens(msg.usage.input_tokens)`
- /api/weekly-review: same
- /api/canvas-regenerate: same; userIdResolver uses the bearer-resolved user from the existing handler

After each edit, run that route's existing tests to confirm no regression:
  ```bash
  cd app && npm test
  ```

No new test files in this task — the coverage meta-test in Task 3 enforces wrap presence; the per-route log test pattern is exemplified by Task 1's sheet test (operator can add similar tests later if desired, but not required for SEC-05 sign-off).
  </action>
  <verify>
    <automated>cd app && npm test</automated>
  </verify>
  <done>
    - All 7 routes wrapped using the same template.
    - Each calls obs.setPromptTokens/setOutputTokens from resp.usage.
    - Full Vitest suite green — wraps are transparent to Response shape.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: observability-coverage.test.ts with INDIRECT_ALLOWLIST (Blocker 4)</name>
  <files>
    app/src/__tests__/observability-coverage.test.ts
  </files>
  <behavior>
    - Scans `app/src/app/api/**/route.ts`.
    - For each file: if it imports `@anthropic-ai/sdk` OR is on the `INDIRECT_ALLOWLIST`, it MUST also import `withObservability` (or use the symbol).
    - INDIRECT_ALLOWLIST hard-codes the morning-sheet cron path (does not import the SDK directly but indirectly via fetch — Blocker 4).
    - On miss: hard-fails with the file path.
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

  /**
   * Blocker 4: routes that call Anthropic INDIRECTLY (via fetch to internal routes,
   * not via the SDK directly) won't be flagged by the SDK-import grep. Hard-code them
   * here so the wrap is enforced.
   *
   * Add new entries here when a future cron/proxy route is created that fans out to
   * other Anthropic-calling routes.
   */
  const INDIRECT_ALLOWLIST = new Set<string>([
    // morning-sheet: fetches /api/sheet and /api/insight via fetch — no SDK import.
    // Plan 05c wraps it; this list ensures the test catches if someone removes the wrap.
    "morning-sheet",
  ]);

  function isIndirectAllowlisted(routeFile: string): boolean {
    return [...INDIRECT_ALLOWLIST].some((seg) => routeFile.includes(`${seg}${join("", "")}`) || routeFile.includes(seg));
  }

  describe("SEC-05 observability coverage", () => {
    it("every route importing @anthropic-ai/sdk OR in INDIRECT_ALLOWLIST imports withObservability", () => {
      const routeFiles = walk(API_DIR);
      const offenders: string[] = [];

      for (const f of routeFiles) {
        const src = readFileSync(f, "utf8");
        const usesAnthropic = /from\s+["']@anthropic-ai\/sdk["']|require\(["']@anthropic-ai\/sdk["']\)/.test(src);
        const isAllowlisted = isIndirectAllowlisted(f);
        const hasObs = /from\s+["']@\/lib\/observability["']|require\(["']@\/lib\/observability["']\)/.test(src)
          || /withObservability/.test(src);
        if ((usesAnthropic || isAllowlisted) && !hasObs) offenders.push(f);
      }

      expect(
        offenders,
        `Routes that import @anthropic-ai/sdk or are in INDIRECT_ALLOWLIST must wrap in withObservability:\n${offenders.join("\n")}`,
      ).toEqual([]);
    });
  });
  ```

Step 2 — Run:
  ```bash
  cd app && npm test -- src/__tests__/observability-coverage.test.ts
  ```
  Expected GREEN after Plan 05c wraps morning-sheet. If Plan 05c hasn't landed yet (running this plan in isolation): one offender will appear (morning-sheet/route.ts) — that's expected and correct. The test gate for Wave 2 completion is "green after both 05b and 05c land."

Step 3 — Document expected ordering. Plan 05b and 05c are BOTH Wave 2 (`depends_on: [01-05a]`). Both must land before this coverage test goes green. The smoke gate before Plan 07 enables enforces full Wave 2 completion.
  </action>
  <verify>
    <automated>cd app && npm test -- src/__tests__/observability-coverage.test.ts</automated>
  </verify>
  <done>
    - observability-coverage.test.ts created with INDIRECT_ALLOWLIST including "morning-sheet".
    - Test green when both 05b AND 05c land; reports "morning-sheet/route.ts" as offender if 05c hasn't wrapped it yet.
  </done>
</task>

</tasks>

<verification>
**Overall Phase 01-05b checks:**

Automated (must exit 0 after Plan 05c also lands):
```bash
cd app && npm test -- src/app/api/sheet/route.log.test.ts \
  src/__tests__/observability-coverage.test.ts
```

Non-regression:
```bash
cd app && npm test
```
</verification>

<success_criteria>
- 8 non-streaming routes wrapped in withObservability with proper token attribution.
- sheet route.log.test.ts asserts output_tokens > 0.
- observability-coverage.test.ts present with INDIRECT_ALLOWLIST (Blocker 4).
- Existing route tests still pass.
- Surgical edits only.
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-cost-control/01-05b-observability-routes-SUMMARY.md` with:
- What was built (8 route wraps, sheet log test, coverage meta-test)
- Blocker 4 partial: INDIRECT_ALLOWLIST seeded with "morning-sheet" — Plan 05c performs the actual wrap
- Files modified (8 routes + 2 tests)
- Downstream: Plan 05c covers v2-chat (streaming), morning-sheet (cron + fetch-mock test), cost-rollup (new), and 017 migration
</output>

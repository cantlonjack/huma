---
phase: 01-security-cost-control
plan: 03
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/lib/services/prompt-builder.ts
  - app/src/app/api/v2-chat/route.ts
  - app/src/app/api/sheet/route.ts
  - app/src/lib/services/prompt-builder.budget.test.ts
autonomous: true
requirements:
  - SEC-03
must_haves:
  truths:
    - "Prompt at 79,999 input_tokens passes through untrimmed and without X-Huma-Truncated header"
    - "Prompt at 81,000 tokens triggers tail-first messages[] trim; humaContext (system) is NEVER modified"
    - "When system prompt alone exceeds budget (150K ceiling), route returns 413 with Voice-Bible body {code:'PAYLOAD_TOO_LARGE'}"
    - "Response includes header 'X-Huma-Truncated: count=N,reason=budget' whenever any trim happens"
    - "budgetCheck uses client.messages.countTokens() — NOT @anthropic-ai/tokenizer (per RESEARCH.md correction)"
    - "Sonnet models use 80K soft cap; Haiku/ceiling uses 150K"
  artifacts:
    - path: "app/src/lib/services/prompt-builder.ts"
      provides: "budgetCheck({ anthropic, model, system, messages, limit }) tail-trim helper"
      exports: ["budgetCheck", "type BudgetResult", "type BudgetTooLarge", "BUDGETS"]
      min_lines: 70
    - path: "app/src/app/api/v2-chat/route.ts"
      provides: "Calls budgetCheck before anthropic.messages.stream; sets X-Huma-Truncated header"
      contains: "budgetCheck"
    - path: "app/src/app/api/sheet/route.ts"
      provides: "Calls budgetCheck before anthropic.messages.create; sets X-Huma-Truncated header"
      contains: "budgetCheck"
    - path: "app/src/lib/services/prompt-builder.budget.test.ts"
      provides: "Vitest coverage: under/over budget, multi-trim, 413 overflow, countTokens called, header emitted"
      contains: "X-Huma-Truncated"
      min_lines: 80
  key_links:
    - from: "app/src/lib/services/prompt-builder.ts"
      to: "anthropic.messages.countTokens"
      via: "await opts.anthropic.messages.countTokens({ model, system, messages }) inside budget loop"
      pattern: "messages\\.countTokens"
    - from: "app/src/app/api/v2-chat/route.ts"
      to: "app/src/lib/services/prompt-builder.ts"
      via: "budgetCheck called with model + system + messages; result.trimmedCount → header"
      pattern: "budgetCheck\\("
    - from: "app/src/app/api/sheet/route.ts"
      to: "app/src/lib/services/prompt-builder.ts"
      via: "budgetCheck called; 413 on tooLarge; trimmed messages passed to anthropic.messages.create"
      pattern: "budgetCheck\\("
---

<objective>
Deliver SEC-03: pre-dispatch token budget with tail-first truncation and a ceiling 413. `budgetCheck()` in `prompt-builder.ts` calls `client.messages.countTokens()`, drops `messages[]` oldest-first until the total fits, preserves `system` (humaContext) untouched, and emits `X-Huma-Truncated: count=N,reason=budget` header when any trim happens. If `system` alone is over the ceiling (150K for Haiku; Sonnet's 80K soft cap is the Sonnet path), return 413 with a Voice-Bible-compliant body.

Purpose: Prevents runaway cost from a single operator with a 500-message-long thread or a runaway client looping on context injection. Uses the official, free `countTokens()` API (NOT the stale `@anthropic-ai/tokenizer` package — RESEARCH.md correction #2).

Output: One library function (`budgetCheck`), surgical wires into the two heaviest routes (v2-chat + sheet), and one Vitest file covering six behaviors.

**Scope note:** Only v2-chat and sheet are wired in this plan. The remaining Anthropic-calling routes (insight, whole-compute, nudge, palette, reflection, decompose, weekly-review, canvas-regenerate, cron/morning-sheet) are wrapped by `withObservability` in Plan 05; they can adopt `budgetCheck` through the same edit surface there, but Plan 03's test matrix covers the two heaviest callsites which are the actual cost-risk surfaces. Plan 05's coverage test asserts `budgetCheck` is called on every wrapped route — meaning Plan 05 will pin budgetCheck onto the remaining routes while it wraps them.
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
<!-- Key primitives the executor needs without re-reading files. -->

From @anthropic-ai/sdk (installed v0.78.0 — verified):
```typescript
// https://platform.claude.com/docs/en/build-with-claude/token-counting
interface CountTokensParams {
  model: string;
  system?: string | TextBlockParam[];
  messages: MessageParam[];
  tools?: ToolUnion[];
}
interface CountTokensResponse {
  input_tokens: number;
}
// Usage:
const res = await anthropic.messages.countTokens({ model, system, messages });
// res.input_tokens → number
```
- Free API with its own rate-limit pool (tier 1: 100 RPM, tier 2: 2000 RPM).
- Matches billing exactly — NOT the stale `@anthropic-ai/tokenizer` package.

From app/src/lib/services/prompt-builder.ts (EXISTING — extend, do not rewrite):
- File contains `buildSystemPrompt(...)`, `buildMessages(...)` helpers used by v2-chat and sheet. Token-budget is new territory; add `budgetCheck` as a new export without touching existing functions.

From app/src/lib/api-error.ts (EXTENDED IN PLAN 01 — use `apiError`):
```typescript
export interface ApiErrorBody {
  error: string;
  code: "RATE_LIMITED" | "BAD_REQUEST" | "UNAUTHORIZED" | "SERVICE_UNAVAILABLE" | "INTERNAL_ERROR" | "PAYLOAD_TOO_LARGE";
  // ...tier/resetAt/suggest optional
}
export function apiError(message: string, code: ApiErrorBody["code"], status: number): Response;
```
- Plan 01 added `PAYLOAD_TOO_LARGE` to the code union — use it here for 413.

From app/src/app/api/v2-chat/route.ts (will also be touched by Plans 01/02/05/06 — surgical):
- Uses `anthropic.messages.stream({ model, system, messages, max_tokens })`.
- System prompt assembled from `staticPrompt + dynamicPrompt` (contains humaContext).

From app/src/app/api/sheet/route.ts:
- Uses `anthropic.messages.create({ model, system, messages })` (non-streaming).
- Different content-return code path than v2-chat — budgetCheck output is the same shape.

Budget values (from CONTEXT.md + RESEARCH.md clarification):
- Sonnet 4 / Sonnet 4.6: **80,000** (policy soft cap; model context is 200K / 1M respectively)
- Haiku 4.5: **150,000** (policy ceiling)
- Treat as business policy, NOT model limits. Model limits are larger.

Truncated-response header shape: `X-Huma-Truncated: count=N,reason=budget`
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: budgetCheck() helper + prompt-builder.budget.test.ts</name>
  <files>
    app/src/lib/services/prompt-builder.ts,
    app/src/lib/services/prompt-builder.budget.test.ts
  </files>
  <behavior>
    - `budgetCheck({ anthropic, model, system, messages, limit })` returns either:
      - `{ tooLarge: true }` when `system` alone already exceeds `limit`, OR
      - `{ system, messages, trimmedCount, inputTokens }` where `inputTokens <= limit`.
    - Trim loop: while `countTokens(system, msgs).input_tokens > limit`, drop `msgs[0]` (oldest user/assistant pair); recount.
    - Terminate the loop when messages length reaches 0 — if still over, return `{ tooLarge: true }` (system is the culprit).
    - Never modifies `system` — returns it unchanged.
    - Calls `countTokens` with the ACTUAL `messages` array each iteration (mocked in tests).
    - Export `BUDGETS` object: `{ sonnet: 80_000, sonnetPreview: 80_000, haiku: 150_000 }`; consumers look up by model string prefix (or pass an explicit `limit`).
    - Expose `pickBudget(model: string)` helper: returns 80K for any model containing "sonnet", 150K for any model containing "haiku", 80K as conservative default.
  </behavior>
  <action>
Step 1 — Write test file FIRST: `app/src/lib/services/prompt-builder.budget.test.ts`:
  ```typescript
  import { describe, it, expect, vi, beforeEach } from "vitest";
  import { budgetCheck, pickBudget, BUDGETS } from "./prompt-builder";

  function makeAnthropicMock(counts: number[]) {
    const list = [...counts];
    const countTokens = vi.fn(async () => ({ input_tokens: list.length > 1 ? list.shift()! : list[0] }));
    return { anthropic: { messages: { countTokens } } as any, countTokens };
  }

  describe("budgetCheck", () => {
    it("passes untrimmed when under budget", async () => {
      const { anthropic, countTokens } = makeAnthropicMock([79_999]);
      const res = await budgetCheck({
        anthropic,
        model: "claude-sonnet-4-6",
        system: "hi",
        messages: [{ role: "user", content: "hello" }],
        limit: 80_000,
      });
      expect(countTokens).toHaveBeenCalledTimes(1);
      expect("tooLarge" in res).toBe(false);
      if (!("tooLarge" in res)) {
        expect(res.trimmedCount).toBe(0);
        expect(res.inputTokens).toBe(79_999);
        expect(res.messages.length).toBe(1);
      }
    });

    it("trims tail-first when over budget and keeps system untouched", async () => {
      // Start 90K, trim 1 msg → 85K, trim 1 more → 79K (under)
      const { anthropic, countTokens } = makeAnthropicMock([90_000, 85_000, 79_000]);
      const msgs = [
        { role: "user" as const,      content: "oldest" },
        { role: "assistant" as const, content: "older" },
        { role: "user" as const,      content: "newest" },
      ];
      const res = await budgetCheck({ anthropic, model: "claude-sonnet-4-6", system: "SYS", messages: msgs, limit: 80_000 });
      expect(countTokens).toHaveBeenCalledTimes(3);
      if ("tooLarge" in res) throw new Error("expected success");
      expect(res.trimmedCount).toBe(2);
      expect(res.messages).toEqual([{ role: "user", content: "newest" }]);
      expect(res.system).toBe("SYS");
      expect(res.inputTokens).toBe(79_000);
    });

    it("returns tooLarge when system alone exceeds budget", async () => {
      // Always over. messages get drained to 0, then still over → tooLarge.
      const { anthropic, countTokens } = makeAnthropicMock([200_000, 199_000, 198_000]);
      const res = await budgetCheck({
        anthropic,
        model: "claude-sonnet-4-6",
        system: "HUGE_SYSTEM",
        messages: [
          { role: "user" as const, content: "a" },
          { role: "assistant" as const, content: "b" },
        ],
        limit: 80_000,
      });
      expect("tooLarge" in res && res.tooLarge).toBe(true);
      expect(countTokens.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it("pickBudget returns 80000 for sonnet models", () => {
      expect(pickBudget("claude-sonnet-4-20250514")).toBe(80_000);
      expect(pickBudget("claude-sonnet-4-6")).toBe(80_000);
    });

    it("pickBudget returns 150000 for haiku models", () => {
      expect(pickBudget("claude-haiku-4-5-20251001")).toBe(150_000);
    });

    it("pickBudget defaults conservatively for unknown models", () => {
      expect(pickBudget("claude-mystery-5")).toBe(80_000);
    });

    it("BUDGETS export is stable", () => {
      expect(BUDGETS.sonnet).toBe(80_000);
      expect(BUDGETS.haiku).toBe(150_000);
    });
  });
  ```
  Run: `cd app && npm test -- src/lib/services/prompt-builder.budget.test.ts` — expect ALL RED (function not implemented yet).

Step 2 — Add to `app/src/lib/services/prompt-builder.ts` (surgical — append new exports below existing content, do NOT modify existing exports):
  ```typescript
  import type Anthropic from "@anthropic-ai/sdk";
  import type { MessageParam, TextBlockParam } from "@anthropic-ai/sdk/resources/messages";

  export const BUDGETS = {
    sonnet: 80_000,         // CONTEXT.md soft cap
    haiku:  150_000,        // CONTEXT.md ceiling
  } as const;

  /** Pick a policy budget by model family. Defaults conservatively to Sonnet's 80K. */
  export function pickBudget(model: string): number {
    const m = model.toLowerCase();
    if (m.includes("haiku")) return BUDGETS.haiku;
    if (m.includes("sonnet")) return BUDGETS.sonnet;
    return BUDGETS.sonnet; // conservative default
  }

  export interface BudgetResult {
    system: string | TextBlockParam[];
    messages: MessageParam[];
    trimmedCount: number;
    inputTokens: number;
  }

  export interface BudgetTooLarge {
    tooLarge: true;
  }

  export async function budgetCheck(opts: {
    anthropic: Anthropic;
    model: string;
    system: string | TextBlockParam[];
    messages: MessageParam[];
    limit: number;
  }): Promise<BudgetResult | BudgetTooLarge> {
    let msgs = [...opts.messages];
    let trimmed = 0;

    // Loop: count → if over, drop oldest message → recount.
    // Hard iteration ceiling to avoid runaway (e.g., countTokens API hiccup).
    for (let iter = 0; iter < 50; iter++) {
      const { input_tokens } = await opts.anthropic.messages.countTokens({
        model: opts.model,
        system: opts.system,
        messages: msgs,
      });

      if (input_tokens <= opts.limit) {
        return {
          system: opts.system,
          messages: msgs,
          trimmedCount: trimmed,
          inputTokens: input_tokens,
        };
      }

      if (msgs.length === 0) {
        // System alone is over budget.
        return { tooLarge: true };
      }
      msgs = msgs.slice(1); // drop oldest
      trimmed++;
    }

    // Fell out of loop without converging — treat as tooLarge defensively.
    return { tooLarge: true };
  }
  ```
  Confirmations:
  - `import type` avoids runtime dep; `Anthropic` class only used for its `messages.countTokens` signature.
  - Existing functions in prompt-builder.ts are untouched.

Step 3 — Re-run tests:
  ```bash
  cd app && npm test -- src/lib/services/prompt-builder.budget.test.ts
  ```
  Expected: all 7 assertions green.
  </action>
  <verify>
    <automated>cd app && npm test -- src/lib/services/prompt-builder.budget.test.ts</automated>
  </verify>
  <done>
    - `prompt-builder.ts` exports `budgetCheck`, `pickBudget`, `BUDGETS`, `BudgetResult`, `BudgetTooLarge`.
    - Existing prompt-builder functions unchanged (surgical append).
    - 7 test assertions green.
    - `countTokens` is mocked; no live Anthropic calls in unit tests.
    - Type exports reachable from v2-chat and sheet route files.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Wire budgetCheck into v2-chat route + emit X-Huma-Truncated header</name>
  <files>
    app/src/app/api/v2-chat/route.ts
  </files>
  <behavior>
    - Before `anthropic.messages.stream(...)`, call `budgetCheck({ anthropic, model, system, messages, limit: pickBudget(model) })`.
    - If `tooLarge === true`: return `apiError("This thread's gotten long. Start a new one — I'll catch you up from your shape.", "PAYLOAD_TOO_LARGE", 413)`.
    - If trimmed: pass the trimmed `messages` to `anthropic.messages.stream`, NOT the original. Attach header `X-Huma-Truncated: count=N,reason=budget` on the streaming `Response`.
    - Header is added to the `Response` constructor options (the streaming response ReadableStream wrapper). If trimmedCount === 0, no header added.
    - Existing SSE body / streaming logic preserved (Plan 06 wires abort on top).
    - Cron path (`ctx.isCron`) skips budgetCheck — cron is service-attributed and uses fixed-shape prompts.
  </behavior>
  <action>
Step 1 — Surgical edit `app/src/app/api/v2-chat/route.ts`. After the quota check (Plan 02) and after `parseBody`, INSERT the budget check before `anthropic.messages.stream(...)`:
  ```typescript
  import { budgetCheck, pickBudget } from "@/lib/services/prompt-builder";
  import { apiError } from "@/lib/api-error";

  // ...existing: parsed = await parseBody(...) → body has { messages, ... }
  // ...existing: system = buildSystemPrompt(...)
  // ...existing: model selection, e.g., const model = "claude-sonnet-4-6";

  // ─── Token budget (SEC-03) ───
  let messagesForDispatch = body.messages; // existing name, adjust to actual variable
  let trimmedCount = 0;
  if (!ctx.isCron) {
    const budget = await budgetCheck({
      anthropic,
      model,
      system,
      messages: messagesForDispatch,
      limit: pickBudget(model),
    });
    if ("tooLarge" in budget && budget.tooLarge) {
      return apiError(
        "This thread's gotten long. Start a new one — I'll catch you up from your shape.",
        "PAYLOAD_TOO_LARGE",
        413,
      );
    }
    messagesForDispatch = budget.messages;
    trimmedCount = budget.trimmedCount;
  }

  // ...existing Anthropic dispatch, but pass messagesForDispatch:
  const stream = anthropic.messages.stream({
    model,
    system,
    messages: messagesForDispatch,   // ← was body.messages
    max_tokens: 2048,
  });

  // ...existing ReadableStream wrapper...

  // When building the outer Response, conditionally add the header:
  const headers: Record<string, string> = {
    "Content-Type": "text/event-stream",    // or whatever current shape
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  };
  if (trimmedCount > 0) {
    headers["X-Huma-Truncated"] = `count=${trimmedCount},reason=budget`;
  }
  return new Response(readableStream, { headers });
  ```
  If the existing file uses a different variable name for the messages array or passes an already-built message list, adapt — the key invariant is that `budgetCheck`'s returned `messages` replaces whatever goes to `anthropic.messages.stream`. Grep the file first to locate the stream call: `grep -n "anthropic.messages.stream\|messages:" app/src/app/api/v2-chat/route.ts`.

Step 2 — Extend Plan 01's `route.auth.test.ts` OR add a NEW scenario to `prompt-builder.budget.test.ts` covering the route-level header. Preferred: extend the budget test file with a minimal integration-ish case that asserts the header appears. But to keep plan-02/plan-03 test files disjoint, the simplest option: add a NEW sanity test inline at the end of `prompt-builder.budget.test.ts`:
  ```typescript
  // Optional sanity: integration-level assertion happens via Plan 05 route.log.test.ts
  //  which captures the Response object including its headers. For this plan,
  //  the unit surface of budgetCheck is sufficient; the route wiring is verified
  //  by reading the route file + the smoke path.
  ```
  Route-level assertion of the header is covered by Plan 05's `route.log.test.ts` which wraps the response and sees headers. For Plan 03, unit-level coverage of `budgetCheck` is sufficient.

Step 3 — Run tests to confirm no regression:
  ```bash
  cd app && npm test -- src/lib/services/prompt-builder.budget.test.ts
  cd app && npm test -- src/app/api/v2-chat/route.auth.test.ts src/app/api/v2-chat/route.quota.test.ts
  ```
  All green. The quota test mocks Anthropic (via Plan 02's `mock-anthropic.ts` fixture which now also stubs `countTokens`), so budget check passes transparently.

Step 4 — If Plan 02's `mock-anthropic.ts` fixture returns an `input_tokens` small enough to be under budget (default 10), the quota test continues to pass. Confirm by re-running it. If not, update the mock's default `inputTokens` to 100 in `mock-anthropic.ts` — Plan 02 introduced that file so it's acceptable to refine here.
  </action>
  <verify>
    <automated>cd app && npm test -- src/lib/services/prompt-builder.budget.test.ts src/app/api/v2-chat/route.auth.test.ts src/app/api/v2-chat/route.quota.test.ts</automated>
  </verify>
  <done>
    - v2-chat route calls `budgetCheck` after quota check, before `anthropic.messages.stream`.
    - `tooLarge` case returns 413 with Voice-Bible body.
    - `X-Huma-Truncated: count=N,reason=budget` header attached on any trim.
    - Cron path bypasses budget check.
    - Existing v2-chat route tests (Plan 01 auth, Plan 02 quota) still pass.
    - Never-rewrite: only added imports, the budget block, and changed one variable name passed to stream.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Wire budgetCheck into sheet route + emit header</name>
  <files>
    app/src/app/api/sheet/route.ts
  </files>
  <behavior>
    - Same shape as Task 2 but for the non-streaming `/api/sheet` route using `anthropic.messages.create(...)`.
    - 413 on tooLarge; `X-Huma-Truncated` header on trimmed results.
    - Cron path (`ctx.isCron === true` from Plan 01) skips the check.
    - Plan 01's `route.auth.test.ts` for sheet still passes (cron bypass preserved).
  </behavior>
  <action>
Step 1 — Surgical edit `app/src/app/api/sheet/route.ts`. Locate the existing `anthropic.messages.create(...)` call. Insert:
  ```typescript
  import { budgetCheck, pickBudget } from "@/lib/services/prompt-builder";
  import { apiError } from "@/lib/api-error";

  // ...existing requireUser + IP limit + parseBody...
  // Assume existing file has: const system = buildSystemPrompt(...); const msgs = body.messages ?? [...]; const model = "claude-sonnet-4-6";

  let messagesForDispatch = msgs;
  let trimmedCount = 0;
  if (!ctx.isCron) {
    const budget = await budgetCheck({
      anthropic,
      model,
      system,
      messages: messagesForDispatch,
      limit: pickBudget(model),
    });
    if ("tooLarge" in budget && budget.tooLarge) {
      return apiError(
        "This thread's gotten long. Start a new one — I'll catch you up from your shape.",
        "PAYLOAD_TOO_LARGE",
        413,
      );
    }
    messagesForDispatch = budget.messages;
    trimmedCount = budget.trimmedCount;
  }

  const response = await anthropic.messages.create({
    model,
    system,
    messages: messagesForDispatch,   // ← was msgs / body.messages
    max_tokens: 2048,
  });

  // When returning JSON response, merge the header if trimmedCount > 0:
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (trimmedCount > 0) headers["X-Huma-Truncated"] = `count=${trimmedCount},reason=budget`;
  return new Response(JSON.stringify({ /* existing payload shape */ }), { headers, status: 200 });
  ```
  IMPORTANT: do NOT rewrite the sheet route; only intercept the `messages.create` arg and the outer Response headers. If the existing response uses `Response.json(...)`, convert that single line to `new Response(JSON.stringify(...), { headers, status: 200 })` — this is equivalent.

  Grep first: `grep -n "anthropic.messages.create\|Response.json\|return new Response" app/src/app/api/sheet/route.ts` to find the actual variable names and callsites.

Step 2 — Re-run existing sheet auth test to confirm cron bypass still works (cron → budgetCheck skipped → Anthropic is mocked → proceeds):
  ```bash
  cd app && npm test -- src/app/api/sheet/route.auth.test.ts
  ```
  Must pass without modification.

Step 3 — Full suite confirmation:
  ```bash
  cd app && npm test
  ```
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/sheet/route.auth.test.ts src/lib/services/prompt-builder.budget.test.ts</automated>
  </verify>
  <done>
    - Sheet route calls `budgetCheck` before `anthropic.messages.create`.
    - 413 on tooLarge; `X-Huma-Truncated` header on trim.
    - Cron bypass preserved — Plan 01's sheet auth test still green.
    - Never-rewrite: surgical insertion only; existing sheet-compile logic untouched.
    - Full suite green.
  </done>
</task>

</tasks>

<verification>
**Overall Phase 01-03 checks:**

Automated (must exit 0):
```bash
cd app && npm test -- src/lib/services/prompt-builder.budget.test.ts \
  src/app/api/v2-chat/route.auth.test.ts \
  src/app/api/v2-chat/route.quota.test.ts \
  src/app/api/sheet/route.auth.test.ts
```

Non-regression:
```bash
cd app && npm test
```

**No dedicated smoke script for SEC-03** — the 413 overflow path is hard to trigger without fabricating a 200K-token payload. Unit coverage of `budgetCheck` + the two wire-ups is sufficient; Plan 07's enablement smoke triad (01/02/04) confirms the routes still return valid responses at normal sizes.
</verification>

<success_criteria>
- SEC-03 fully delivered: budget enforced on v2-chat and sheet via `budgetCheck` + `countTokens`.
- `@anthropic-ai/tokenizer` is NOT imported anywhere (CONTEXT.md correction applied).
- `X-Huma-Truncated: count=N,reason=budget` header present on any trim.
- 413 Voice-Bible body used for system-alone-over-budget case.
- Cron path bypasses budget check (already bypasses quota and auth via Plan 01).
- Never-rewrite honored: only additive imports + surgical insertions.
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-cost-control/01-03-token-budget-SUMMARY.md` with:
- What was built (budgetCheck helper, pickBudget, two route wires)
- Correction applied: `client.messages.countTokens()` replaces `@anthropic-ai/tokenizer` per RESEARCH.md
- Files modified
- Downstream: Plan 05's coverage test will pin budgetCheck onto remaining Anthropic-calling routes as part of the `withObservability` wrap
- Note: Plan 04's sanitizer runs BEFORE this at parseBody time; 400 from sanitizer precludes a trim/413 from budget
</output>

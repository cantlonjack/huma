---
phase: 01-security-cost-control
plan: 03
type: execute
wave: 1
depends_on:
  - "01-00"
  - "01-01"
  - "01-02"
files_modified:
  - app/src/lib/services/prompt-builder.ts
  - app/src/app/api/v2-chat/route.ts
  - app/src/app/api/sheet/route.ts
  - app/src/lib/services/prompt-builder.budget.test.ts
  - app/scripts/smoke/sec-03-budget.sh
autonomous: true
requirements:
  - SEC-03
  - SEC-02
must_haves:
  truths:
    - "Prompt at 79,999 input_tokens passes through untrimmed and without X-Huma-Truncated header"
    - "Prompt at 81,000 tokens triggers tail-first messages[] trim; humaContext (system) is NEVER modified"
    - "When system prompt alone exceeds budget (150K ceiling), route returns 413 with Voice-Bible body {code:'PAYLOAD_TOO_LARGE'}"
    - "Response includes header 'X-Huma-Truncated: count=N,reason=budget' whenever any trim happens"
    - "X-Huma-Truncated header survives a wrapped Response (mock Plan 05a's withObservability) — Info 3"
    - "budgetCheck uses client.messages.countTokens() — NOT @anthropic-ai/tokenizer (RESEARCH.md correction)"
    - "Sonnet models use 80K soft cap; Haiku uses 150K"
    - "Route flow ordering: requireUser → IP-limit (anon-only) → parseBody → budgetCheck → checkAndIncrement(ctx.user.id, route, budget.inputTokens) → anthropic.messages.{stream|create} (Blocker 6)"
    - "Smoke script (Warning 3): 100 small messages → 200 no header; 600 small messages → 200 with X-Huma-Truncated"
  artifacts:
    - path: "app/src/lib/services/prompt-builder.ts"
      provides: "budgetCheck({anthropic, model, system, messages, limit}) tail-trim helper + pickBudget(model)"
      exports: ["budgetCheck", "pickBudget", "type BudgetResult", "type BudgetTooLarge", "BUDGETS"]
      min_lines: 70
    - path: "app/src/app/api/v2-chat/route.ts"
      provides: "Route ordering: budgetCheck before checkAndIncrement; checkAndIncrement passed budget.inputTokens; X-Huma-Truncated header"
      contains: "budgetCheck"
    - path: "app/src/app/api/sheet/route.ts"
      provides: "Same ordering for non-streaming sheet route"
      contains: "budgetCheck"
    - path: "app/src/lib/services/prompt-builder.budget.test.ts"
      provides: "Vitest coverage: under/over budget, multi-trim, 413 overflow, countTokens called, header emitted, header survives wrap"
      contains: "X-Huma-Truncated"
      min_lines: 100
    - path: "app/scripts/smoke/sec-03-budget.sh"
      provides: "Curl: 100×1KB messages → no header; 600×1KB messages → X-Huma-Truncated header present (Warning 3)"
      contains: "X-Huma-Truncated"
  key_links:
    - from: "app/src/lib/services/prompt-builder.ts"
      to: "anthropic.messages.countTokens"
      via: "await opts.anthropic.messages.countTokens({ model, system, messages }) inside budget loop"
      pattern: "messages\\.countTokens"
    - from: "app/src/app/api/v2-chat/route.ts"
      to: "Plan 02 checkAndIncrement"
      via: "checkAndIncrement(ctx.user.id, '/api/v2-chat', budget.inputTokens) — Blocker 6 wiring"
      pattern: "checkAndIncrement\\([^,]+,\\s*[^,]+,\\s*budget\\.inputTokens"
    - from: "app/src/app/api/sheet/route.ts"
      to: "app/src/lib/services/prompt-builder.ts"
      via: "budgetCheck called; 413 on tooLarge; trimmed messages passed to anthropic.messages.create"
      pattern: "budgetCheck\\("
---

<objective>
Deliver SEC-03 and own the route-ordering for SEC-02 (Blocker 6). `budgetCheck()` in `prompt-builder.ts` calls `client.messages.countTokens()`, drops `messages[]` oldest-first until the total fits, preserves `system` (humaContext) untouched, and returns the final `inputTokens` count. The route then passes that accurate count to Plan 02's `checkAndIncrement(userId, route, budget.inputTokens)` — eliminating the cheap `estChars/4` heuristic that would have undercounted ~3x.

Order in v2-chat and sheet routes (after Plan 01's auth + IP-limit edits):
1. `requireUser` (Plan 01)
2. IP-limit (Plan 01, anon/unauth only)
3. `parseBody` with sanitized schema (Plan 04)
4. **`budgetCheck`** (this plan) → returns `{system, messages, trimmedCount, inputTokens}` OR `{tooLarge: true}`
5. **`checkAndIncrement(userId, route, budget.inputTokens, reqId?)`** (Plan 02 fn, called from this plan's route edit) → returns `{allowed, tier, resetAt, suggest}`
6. If 413/429: return early
7. `anthropic.messages.{stream|create}` with the trimmed messages
8. Response with conditional `X-Huma-Truncated` header

Purpose: Prevents runaway cost AND makes Plan 02's quota math accurate. Uses the official, free `countTokens()` API (NOT `@anthropic-ai/tokenizer` — RESEARCH.md correction #2).

Output: One library function (`budgetCheck`), wires into v2-chat + sheet (with Plan 02 quota integration), one Vitest file covering 8 behaviors (incl. Info 3 header survival), one new smoke script (Warning 3).

**Scope note:** Only v2-chat and sheet are wired in this plan. Other Anthropic-calling routes get the same wrap when Plan 05b/c wraps them in `withObservability`. Plan 05b's coverage meta-test asserts every wrapped route also calls `budgetCheck`.

**Dependency on Plan 02:** This plan needs Plan 02's `checkAndIncrement` and `rateLimited({tier, resetAt, suggest})`. Both are exported and stable from Plan 02 Wave 1; this plan is also Wave 1 but logically downstream because it owns the integration. We list `01-01` and `01-02` in `depends_on` to make the topological order explicit; in practice all three plans land in the same Wave 1 PR batch.
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

<interfaces>
<!-- Key primitives — executor needs these without re-reading source. -->

From @anthropic-ai/sdk (installed v0.78.0):
```typescript
interface CountTokensParams { model: string; system?: string | TextBlockParam[]; messages: MessageParam[]; tools?: ToolUnion[]; }
interface CountTokensResponse { input_tokens: number; }
const res = await anthropic.messages.countTokens({ model, system, messages });
```
- Free API; matches billing.

From Plan 01 (auth-guard.ts — already merged):
```typescript
export interface AuthContext { user: {id, is_anonymous, email} | null; isCron: boolean; source: "user" | "cron" | "system"; }
```

From Plan 02 (quota.ts — already merged):
```typescript
export async function checkAndIncrement(
  userId: string,
  route: string,
  inputTokens: number,    // Blocker 6: pass budget.inputTokens here
  reqId?: string,
): Promise<QuotaCheckResult>;
export function rateLimited(opts?: { tier, resetAt, suggest, message }): Response;
```

From app/src/lib/api-error.ts (Plan 01 added PAYLOAD_TOO_LARGE):
```typescript
export function apiError(message: string, code: ApiErrorBody["code"], status: number): Response;
```

Budget values (CONTEXT.md + RESEARCH.md):
- Sonnet 4 / 4.6: 80,000 (policy soft cap)
- Haiku 4.5: 150,000 (policy ceiling)
- Both well below model context limits.

Truncated header: `X-Huma-Truncated: count=N,reason=budget`

From Plan 00 fixtures: `makeMockAnthropic()` returns `{MockAnthropic, streamFn, countTokens, ...}`.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: budgetCheck() helper + prompt-builder.budget.test.ts (incl. Info 3 header survival)</name>
  <files>
    app/src/lib/services/prompt-builder.ts,
    app/src/lib/services/prompt-builder.budget.test.ts
  </files>
  <behavior>
    - `budgetCheck({anthropic, model, system, messages, limit})` returns `{tooLarge: true}` OR `{system, messages, trimmedCount, inputTokens}`.
    - Trim loop: drops `msgs[0]` oldest-first; never modifies `system`.
    - Caps at 50 iterations to prevent runaway.
    - Exports `BUDGETS = { sonnet: 80_000, haiku: 150_000 }` and `pickBudget(model)`.
    - Test 8 (Info 3): assert that a Response built with `X-Huma-Truncated` header survives being wrapped by a stub mimicking Plan 05a's `withObservability` (just passes Response through).
  </behavior>
  <action>
Step 1 — Write test file FIRST: `app/src/lib/services/prompt-builder.budget.test.ts`:
  ```typescript
  import { describe, it, expect, vi } from "vitest";
  import { budgetCheck, pickBudget, BUDGETS } from "./prompt-builder";

  function makeAnthropicMock(counts: number[]) {
    const list = [...counts];
    const countTokens = vi.fn(async () => ({ input_tokens: list.length > 1 ? list.shift()! : list[0] }));
    return { anthropic: { messages: { countTokens } } as any, countTokens };
  }

  describe("budgetCheck", () => {
    it("passes untrimmed when under budget", async () => {
      const { anthropic, countTokens } = makeAnthropicMock([79_999]);
      const res = await budgetCheck({ anthropic, model: "claude-sonnet-4-6", system: "hi", messages: [{ role: "user", content: "hello" }], limit: 80_000 });
      expect(countTokens).toHaveBeenCalledTimes(1);
      expect("tooLarge" in res).toBe(false);
      if (!("tooLarge" in res)) {
        expect(res.trimmedCount).toBe(0);
        expect(res.inputTokens).toBe(79_999);
      }
    });

    it("trims tail-first when over budget and keeps system untouched", async () => {
      const { anthropic, countTokens } = makeAnthropicMock([90_000, 85_000, 79_000]);
      const msgs = [
        { role: "user" as const, content: "oldest" },
        { role: "assistant" as const, content: "older" },
        { role: "user" as const, content: "newest" },
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
      const { anthropic, countTokens } = makeAnthropicMock([200_000, 199_000, 198_000]);
      const res = await budgetCheck({
        anthropic, model: "claude-sonnet-4-6", system: "HUGE_SYSTEM",
        messages: [{ role: "user" as const, content: "a" }, { role: "assistant" as const, content: "b" }],
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

    // Info 3: header survives a wrapped Response (mock withObservability)
    it("X-Huma-Truncated header survives a wrapped Response", async () => {
      // Stub mimicking Plan 05a's withObservability: pass Response through unchanged.
      const wrap = async (handler: () => Promise<Response>): Promise<Response> => {
        return await handler();
      };
      const inner = async () => new Response("body", {
        status: 200,
        headers: { "X-Huma-Truncated": "count=3,reason=budget", "Content-Type": "application/json" },
      });
      const wrapped = await wrap(inner);
      expect(wrapped.headers.get("X-Huma-Truncated")).toBe("count=3,reason=budget");
      expect(wrapped.status).toBe(200);
    });
  });
  ```
  Run: `cd app && npm test -- src/lib/services/prompt-builder.budget.test.ts` — expect ALL RED.

Step 2 — Append to `app/src/lib/services/prompt-builder.ts` (surgical, do NOT modify existing exports):
  ```typescript
  import type Anthropic from "@anthropic-ai/sdk";
  import type { MessageParam, TextBlockParam } from "@anthropic-ai/sdk/resources/messages";

  export const BUDGETS = { sonnet: 80_000, haiku: 150_000 } as const;

  export function pickBudget(model: string): number {
    const m = model.toLowerCase();
    if (m.includes("haiku")) return BUDGETS.haiku;
    if (m.includes("sonnet")) return BUDGETS.sonnet;
    return BUDGETS.sonnet;
  }

  export interface BudgetResult {
    system: string | TextBlockParam[];
    messages: MessageParam[];
    trimmedCount: number;
    inputTokens: number;
  }
  export interface BudgetTooLarge { tooLarge: true; }

  export async function budgetCheck(opts: {
    anthropic: Anthropic;
    model: string;
    system: string | TextBlockParam[];
    messages: MessageParam[];
    limit: number;
  }): Promise<BudgetResult | BudgetTooLarge> {
    let msgs = [...opts.messages];
    let trimmed = 0;
    for (let iter = 0; iter < 50; iter++) {
      const { input_tokens } = await opts.anthropic.messages.countTokens({
        model: opts.model, system: opts.system, messages: msgs,
      });
      if (input_tokens <= opts.limit) {
        return { system: opts.system, messages: msgs, trimmedCount: trimmed, inputTokens: input_tokens };
      }
      if (msgs.length === 0) return { tooLarge: true };
      msgs = msgs.slice(1);
      trimmed++;
    }
    return { tooLarge: true };
  }
  ```

Step 3 — Run tests:
  ```bash
  cd app && npm test -- src/lib/services/prompt-builder.budget.test.ts
  ```
  All 8 assertions green.
  </action>
  <verify>
    <automated>cd app && npm test -- src/lib/services/prompt-builder.budget.test.ts</automated>
  </verify>
  <done>
    - `prompt-builder.ts` exports `budgetCheck`, `pickBudget`, `BUDGETS`, types.
    - 8 test assertions green (incl. Info 3 header-survival).
    - Existing prompt-builder functions unchanged.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Wire budgetCheck + checkAndIncrement(inputTokens) into v2-chat (Blocker 6 ordering)</name>
  <files>
    app/src/app/api/v2-chat/route.ts
  </files>
  <behavior>
    - Route flow (after Plan 01's auth + IP-limit edits): requireUser → IP-limit (anon/unauth) → parseBody → **budgetCheck** → 413 if tooLarge → **checkAndIncrement(userId, route, budget.inputTokens, reqId?)** → 429 if not allowed → anthropic.messages.stream with budget.messages → Response with optional X-Huma-Truncated header.
    - Cron path (`ctx.isCron`) skips both budgetCheck AND checkAndIncrement.
    - Pre-flag (`ctx.user === null && ctx.source === "system"`) skips checkAndIncrement (no userId to key on); budgetCheck still runs.
    - 413 body: `{code:'PAYLOAD_TOO_LARGE'}` with Voice-Bible message.
  </behavior>
  <action>
Step 1 — Surgical edit `app/src/app/api/v2-chat/route.ts`. After Plan 01's `requireUser` + IP-limit + Plan 02's edits (NO LONGER PRESENT — Plan 02 doesn't edit this route per Blocker 6 split), insert:
  ```typescript
  import { budgetCheck, pickBudget } from "@/lib/services/prompt-builder";
  import { checkAndIncrement } from "@/lib/quota";
  import { rateLimited } from "@/lib/api-error";
  import { apiError } from "@/lib/api-error";

  // ...existing: requireUser (Plan 01), IP-limit (anon-only, Plan 01)...
  // ...existing: parseBody returns body...
  // ...existing: system = buildSystemPrompt(...); model = "claude-sonnet-4-6"...

  // ─── SEC-03: token budget (BEFORE quota) ───
  let messagesForDispatch = body.messages;
  let trimmedCount = 0;
  let inputTokens = 0;
  if (!ctx.isCron) {
    const budget = await budgetCheck({
      anthropic, model, system, messages: messagesForDispatch, limit: pickBudget(model),
    });
    if ("tooLarge" in budget && budget.tooLarge) {
      return apiError(
        "This thread's gotten long. Start a new one — I'll catch you up from your shape.",
        "PAYLOAD_TOO_LARGE", 413,
      );
    }
    messagesForDispatch = budget.messages;
    trimmedCount = budget.trimmedCount;
    inputTokens = budget.inputTokens;
  }

  // ─── SEC-02: per-user quota (Blocker 6: accurate inputTokens from budget) ───
  if (!ctx.isCron && ctx.user) {
    const quota = await checkAndIncrement(ctx.user.id, "/api/v2-chat", inputTokens /*, reqId from Plan 05c */);
    if (!quota.allowed) {
      return rateLimited({ tier: quota.tier, resetAt: quota.resetAt, suggest: quota.suggest });
    }
  }

  // ─── existing: anthropic.messages.stream(...) — pass messagesForDispatch ───
  const stream = anthropic.messages.stream({
    model, system, messages: messagesForDispatch, max_tokens: 2048,
  });

  // ...existing ReadableStream wrapper...

  // Response with optional X-Huma-Truncated header (no header when trimmedCount === 0)
  const headers: Record<string, string> = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  };
  if (trimmedCount > 0) headers["X-Huma-Truncated"] = `count=${trimmedCount},reason=budget`;
  return new Response(readableStream, { headers });
  ```
  **NOTE on ordering:** budgetCheck FIRST (so we have accurate token count), THEN quota (so we charge the right amount). Pre-Blocker-6, Plan 02 had quota first with a cheap heuristic — that's now reversed.

  **NOTE on reqId:** Plan 05c will introduce a `reqId` (ULID) inside its `withObservability` wrap. Once that lands, the `checkAndIncrement` call gains a 4th arg: `quota.reqId`. For now (Wave 1), pass `undefined` — the RPC tolerates it via `DEFAULT NULL` in the migration.

Step 2 — Re-run quota test from Plan 02 (which mocks Anthropic) AND auth tests:
  ```bash
  cd app && npm test -- src/app/api/v2-chat/
  ```
  All green. The Plan 02 quota test must continue to pass with the revised ordering — `checkAndIncrement` is still called, just with `inputTokens` from `budgetCheck` instead of an internal estimate. The Plan 00 fixture's default `inputTokens: 100` from `makeMockAnthropic` flows through `countTokens` → `budget.inputTokens` → `checkAndIncrement`.
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/v2-chat/route.auth.test.ts src/lib/services/prompt-builder.budget.test.ts</automated>
  </verify>
  <done>
    - v2-chat route ordering: requireUser → IP-limit (anon-only) → parseBody → budgetCheck → checkAndIncrement(..., budget.inputTokens) → anthropic.messages.stream.
    - Cron skips both budget AND quota.
    - 413 on tooLarge; 429 on quota; X-Huma-Truncated header on any trim.
    - Plan 01 auth tests + Plan 02 quota test still pass.
    - Surgical edits only.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Wire budgetCheck + checkAndIncrement into sheet route + SEC-03 smoke (Warning 3)</name>
  <files>
    app/src/app/api/sheet/route.ts,
    app/scripts/smoke/sec-03-budget.sh
  </files>
  <behavior>
    - Same shape as Task 2 but for non-streaming `/api/sheet` (uses `anthropic.messages.create`).
    - Cron path bypasses both checks.
    - Smoke script (Warning 3): two curls against staging (or local dev with PHASE_1_GATE_ENABLED=true + valid auth):
      - Curl 1: 100 small messages (~30K tokens via accurate count) → expect 200, NO `X-Huma-Truncated` header.
      - Curl 2: 600 small messages (~180K tokens) → expect 200 with `X-Huma-Truncated: count=N,reason=budget` header present.
  </behavior>
  <action>
Step 1 — Surgical edit `app/src/app/api/sheet/route.ts`. Same insertion pattern as v2-chat (Task 2):
  ```typescript
  import { budgetCheck, pickBudget } from "@/lib/services/prompt-builder";
  import { checkAndIncrement } from "@/lib/quota";
  import { rateLimited, apiError } from "@/lib/api-error";

  // ...existing: requireUser, IP-limit (anon-only), parseBody...
  // Assume: const system = buildSystemPrompt(...); const msgs = body.messages ?? [...]; const model = "claude-sonnet-4-6";

  let messagesForDispatch = msgs;
  let trimmedCount = 0;
  let inputTokens = 0;
  if (!ctx.isCron) {
    const budget = await budgetCheck({ anthropic, model, system, messages: messagesForDispatch, limit: pickBudget(model) });
    if ("tooLarge" in budget && budget.tooLarge) {
      return apiError("This thread's gotten long. Start a new one — I'll catch you up from your shape.", "PAYLOAD_TOO_LARGE", 413);
    }
    messagesForDispatch = budget.messages;
    trimmedCount = budget.trimmedCount;
    inputTokens = budget.inputTokens;
  }

  if (!ctx.isCron && ctx.user) {
    const quota = await checkAndIncrement(ctx.user.id, "/api/sheet", inputTokens);
    if (!quota.allowed) return rateLimited({ tier: quota.tier, resetAt: quota.resetAt, suggest: quota.suggest });
  }

  const response = await anthropic.messages.create({ model, system, messages: messagesForDispatch, max_tokens: 2048 });

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (trimmedCount > 0) headers["X-Huma-Truncated"] = `count=${trimmedCount},reason=budget`;
  return new Response(JSON.stringify({ /* existing payload */ }), { headers, status: 200 });
  ```
  IMPORTANT: do NOT rewrite. Surgical insertion + variable swap only.

Step 2 — Create `app/scripts/smoke/sec-03-budget.sh` (Warning 3):
  ```bash
  #!/usr/bin/env bash
  # SEC-03 smoke: token budget + tail-first truncation.
  # Usage: BASE_URL=https://huma-two.vercel.app COOKIE="<sb-access-token>" bash scripts/smoke/sec-03-budget.sh
  # Requires authenticated session (anon JWT or signed-in cookie).
  set -euo pipefail

  BASE_URL="${BASE_URL:-http://localhost:3000}"
  COOKIE="${COOKIE:-}"
  AUTH=()
  if [ -n "$COOKIE" ]; then AUTH=(-H "Cookie: $COOKIE"); fi

  # Helper: build N messages of ~1KB each. Each ~250 tokens, so 100 → ~25K, 600 → ~150K.
  build_payload() {
    local n="$1"
    local content
    content=$(printf 'lorem ipsum dolor sit amet %.0s' {1..40})  # ~250 chars
    local messages="["
    for i in $(seq 1 "$n"); do
      [ "$i" -gt 1 ] && messages+=","
      messages+="{\"role\":\"user\",\"content\":\"${content}\"}"
    done
    messages+="]"
    echo "{\"messages\":${messages}}"
  }

  echo "[1/2] 100 messages × 1KB (~25K tokens) → expect 200 no truncation header"
  hdrs=$(curl -sS -D - -o /dev/null -X POST "$BASE_URL/api/v2-chat" \
    -H "Content-Type: application/json" "${AUTH[@]}" \
    -d "$(build_payload 100)")
  status=$(echo "$hdrs" | head -n1 | awk '{print $2}')
  truncated=$(echo "$hdrs" | grep -i "^x-huma-truncated:" || true)
  if [ "$status" != "200" ]; then echo "FAIL: expected 200, got $status"; exit 1; fi
  if [ -n "$truncated" ]; then echo "FAIL: unexpected X-Huma-Truncated for ~25K-token payload: $truncated"; exit 1; fi
  echo "  status=200, no truncation header — OK"

  echo "[2/2] 600 messages × 1KB (~150K tokens) → expect 200 WITH X-Huma-Truncated header"
  hdrs=$(curl -sS -D - -o /dev/null -X POST "$BASE_URL/api/v2-chat" \
    -H "Content-Type: application/json" "${AUTH[@]}" \
    -d "$(build_payload 600)")
  status=$(echo "$hdrs" | head -n1 | awk '{print $2}')
  truncated=$(echo "$hdrs" | grep -i "^x-huma-truncated:" || true)
  if [ "$status" != "200" ]; then echo "FAIL: expected 200, got $status"; exit 1; fi
  if [ -z "$truncated" ]; then echo "FAIL: missing X-Huma-Truncated header for ~150K-token payload"; exit 1; fi
  echo "  status=200, truncation header present: $truncated"

  echo "SEC-03 smoke: PASS"
  ```

Step 3 — Re-run sheet auth test to confirm cron bypass still works:
  ```bash
  cd app && npm test -- src/app/api/sheet/route.auth.test.ts
  ```

Step 4 — Full suite:
  ```bash
  cd app && npm test
  ```
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/sheet/route.auth.test.ts src/lib/services/prompt-builder.budget.test.ts</automated>
  </verify>
  <done>
    - Sheet route: budgetCheck → checkAndIncrement(...inputTokens) → anthropic.messages.create.
    - 413 on tooLarge; 429 on quota; X-Huma-Truncated on trim.
    - Cron bypass preserved.
    - `scripts/smoke/sec-03-budget.sh` exists (Warning 3) and is added to Plan 07's smoke quad.
    - Surgical edits only; full suite green.
  </done>
</task>

</tasks>

<verification>
**Overall Phase 01-03 checks:**

Automated (must exit 0):
```bash
cd app && npm test -- src/lib/services/prompt-builder.budget.test.ts \
  src/app/api/v2-chat/route.auth.test.ts \
  src/app/api/sheet/route.auth.test.ts
```

Non-regression:
```bash
cd app && npm test
```

Integration (after Plan 07 enablement, against staging):
```bash
BASE_URL=https://huma-two.vercel.app COOKIE=$AUTH_COOKIE bash app/scripts/smoke/sec-03-budget.sh
```
</verification>

<success_criteria>
- SEC-03 fully delivered: budget enforced via `budgetCheck` + `countTokens`.
- Blocker 6 resolved: route ordering puts budgetCheck FIRST, then checkAndIncrement(..., budget.inputTokens). No more `estChars/4` heuristic. Quota math is now ~3x more accurate.
- Info 3 covered: header-survival assertion in budget test.
- Warning 3 covered: sec-03-budget.sh smoke script exists; added to Plan 07's smoke quad.
- `@anthropic-ai/tokenizer` NOT imported (CONTEXT.md correction applied).
- 413 Voice-Bible body for system-alone-over-budget.
- Cron path bypasses both budget AND quota.
- Surgical edits only.
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-cost-control/01-03-token-budget-SUMMARY.md` with:
- What was built (budgetCheck, pickBudget, two route wires, smoke script)
- Blocker 6 resolution: route ordering puts budgetCheck FIRST; checkAndIncrement now receives accurate inputTokens; documented in summary as the integration owner
- Info 3 covered: header-survival assertion
- Warning 3 covered: sec-03-budget.sh added; Plan 07 must include it in smoke quad
- Files modified
- Downstream: Plan 05c will pass `obs.reqId` as the 4th arg to `checkAndIncrement` for output-token reconciliation
</output>

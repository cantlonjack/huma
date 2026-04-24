# Phase 1: Security & Cost Control (Plan P0) - Research

**Researched:** 2026-04-18
**Domain:** API security, per-user quota/ledger (Supabase), prompt-injection defense (Zod + sanitizer), token budgeting (Anthropic count_tokens), structured JSON observability, SSE disconnect handling
**Confidence:** HIGH (primary mechanisms verified against official docs and installed SDK source)

## Summary

The phase delivers SEC-01..SEC-06 as a single atomic feature-flag cutover (`PHASE_1_GATE_ENABLED`) across 10 Anthropic-calling routes plus the morning-sheet cron. CONTEXT.md has already locked 7 implementation decisions — this research confirms the integration points in the current codebase, surfaces three concrete deviations required from CONTEXT.md (library swap for token counting, Supabase API correction, model-limit number update), and maps every requirement to testable conditions for Nyquist validation.

Key infrastructure is already present: Zod 4.3.6 with `parseBody()` wrapper used on 6+ routes, `ApiErrorBody` with `RATE_LIMITED`/`UNAUTHORIZED` codes, Upstash Redis rate-limit with in-memory fallback, Supabase `createServerSupabase()` for cookie auth, `createAdminSupabase()` for service-role, Anthropic SDK 0.78.0 with `MessageStream.controller.abort()` primitive, and Vitest 4.1.0 with established route-test mocking patterns. Migration numbering confirmed: next is `016_user_quotas.sql`.

**Primary recommendation:** Build `withObservability()` as the single chokepoint wrapper around every Anthropic-calling handler. Inside that wrapper: auth → sanitize (already via Zod refinement in `parseBody`) → quota check → token count → truncate → dispatch → log on exit. All 10 routes get 6 of 6 requirements for free by threading through one helper.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Pre-auth gate — anonymous session via Supabase**
- Use `supabase.auth.signInAnonymously()` on `/start` page load — every message carries a `user_id` from the first keystroke. Quota ledger, rate limits, and structured logs work uniformly across anon/free/Operate tiers.
- When the user enters an email through `AuthModal` magic-link flow, merge the anonymous session into a real account — conversation state, aspirations, and ledger history preserved intact. (Research note: CONTEXT.md names `auth.linkIdentity({ provider: "email" })`, but Supabase docs indicate `linkIdentity` is OAuth-only; the correct primitive for email is `auth.updateUser({ email })`. See "Corrections from CONTEXT.md" below.)
- Rejected: magic-link interstitial, server preview-token JWT, HTTP-only anon cookie sidestepping Supabase.
- Belt-and-suspenders: IP-based Upstash secondary rate limit (~20 req/min/IP on `/api/v2-chat` and `/api/sheet`) against cookie-clearing anon rotation.

**Rate-limit-hit UX — hard 429 + respectful client card**
- Hard 429 with structured body extending `ApiErrorBody`:
  ```json
  { "error": "...", "code": "RATE_LIMITED", "tier": "anonymous|free|operate",
    "resetAt": "<ISO>", "suggest": "sign_in|upgrade_operate|wait" }
  ```
- Client intercepts 429 and renders `<QuotaCard>` with Voice Bible-compliant per-tier copy (drafted in CONTEXT.md).
- No silent drops. Stream mid-flight on cap trip closes gracefully with one-line prose ending.
- Copy must pass Voice Bible §02 banned-phrase review before landing.

**Observability — console JSON → Vercel log ingestion**
- `console.log(JSON.stringify(...))` → Vercel automatic log ingestion. Free, zero external deps.
- Log payload (7 required fields + `source` tag):
  ```json
  { "req_id": "<ULID>", "user_id": "<uuid|null>", "route": "/api/v2-chat",
    "prompt_tokens": 12345, "output_tokens": 678, "latency_ms": 2341,
    "status": 200, "source": "user|cron|system" }
  ```
- Nightly cost-rollup cron (`/api/cron/cost-rollup`) → `cost_metrics` table (new this phase).
- Alerts: Vercel → Slack on error rate > 2% or p99 > 10s. Anthropic cost > $10/hour webhook.
- Defer Better Stack / Logtail / Axiom until post-Phase 6.

**Sanitizer placement — two-layer defense-in-depth**
- Layer 1: `lib/schemas/sanitize.ts` exports `sanitizeUserText(s: string): { value: string; rejected?: "markers" | "injection" }`. Four rejections from SEC-04: reject `[[`/`]]`, strip "ignore previous instructions" patterns, NFC-normalize, strip zero-width (U+200B, U+200C, U+200D, U+FEFF).
- Layer 2: Zod `.refine()` on every user-text field, imported and called inside schemas. `parseBody(request, schema)` returns 400 automatically.
- Applies to: `v2ChatSchema.messages[].content`, `aspirations[].rawText`, `humaContext.*` text fields, reflection text, sheet check-off `note`, nudge input, every user-written string interpolated into a prompt.
- Rejected: inline sanitization in `prompt-builder.ts`.

**Token truncation scope — messages-tail only, keep context intact**
- Trim `messages[]` oldest-first until total prompt tokens fit under budget.
- Keep `humaContext` untouched — small, crafted, load-bearing.
- If prompt still exceeds budget after full messages trim → 413 with Voice-Bible copy: "This thread's gotten long. Start a new one — I'll catch you up from your shape."
- Warning header `X-Huma-Truncated: count=N,reason=budget` on any trim.
- Token counting via the Anthropic official API (see "Corrections from CONTEXT.md" — swap `@anthropic-ai/tokenizer` for `client.messages.countTokens()`).

**Cron identity — bypass quota, still log**
- `/api/cron/morning-sheet` bypasses quota (CRON_SECRET).
- Per-run log with `user_id = <operator's real id>` and `source: "cron"`.
- System-level aggregate log: `{ user_id: null, source: "cron", operator_count: <N> }`.
- `/api/cron/cost-rollup`: same treatment, `source: "system"`.

**Rollout — single atomic feature flag**
- All SEC-01..SEC-06 behind `PHASE_1_GATE_ENABLED` env, default `false`.
- Plans may split up to 6 ways for parallel execution; final "enablement" plan flips the flag after all merge + migration applied.
- Enablement sequence:
  1. Apply `016_user_quotas.sql` via Supabase dashboard SQL editor.
  2. Verify seed rows (`SELECT count(*) FROM user_quotas_tiers` returns 3).
  3. Flip `PHASE_1_GATE_ENABLED=true` in Vercel production.
  4. Smoke-test: anon curl → 401, auth'd curl → 200, `[[` in body → 400.
- Rollback: one-click revert by flipping `PHASE_1_GATE_ENABLED=false` — no code revert.

**Request ID format — ULID**
- 26 chars, lexicographically sortable, millisecond-precision timestamp prefix. `ulid` npm package ~2 KB.

### Claude's Discretion

- Exact `<QuotaCard>` visual design (follow existing card patterns in `/whole` and `/today`).
- Internal implementation of the cost-rollup cron query (Vercel Log API vs. direct log scraping).
- Exact IP-fallback Upstash rate-limit key schema and window sizing.
- Error-code surfacing in PostHog (deferred until Phase 4).
- Structured log library choice (custom formatter vs. `pino` vs. raw `console.log(JSON.stringify(...))`).

### Deferred Ideas (OUT OF SCOPE)

- Upgrade log destination to Better Stack / Logtail / Axiom — post-Phase 6.
- `/internal/cost` dashboard UI — cron + table ships this phase, UI deferred to Phase 4/5.
- Anonymous user cleanup cron — Phase 2+.
- Anthropic output sanitization (defending against jailbroken model emitting spoofed markers) — input-only this phase.
- PostHog instrumentation of security events — deferred to Phase 4.
- Redis-based distributed quota enforcement — Phase 6+ if needed.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEC-01 | `/api/v2-chat` and `/api/sheet` reject unauthenticated requests with 401; cron path keeps `CRON_SECRET` bypass. | Existing `createServerSupabase()` + `auth.getUser()` pattern already used in 10 other routes; `sheet/route.ts:148` already splits `isCron` from user path — extend to call Supabase auth check after cron branch. Anonymous `signInAnonymously()` means even pre-auth users pass the gate with a real `user_id`. |
| SEC-02 | Per-user token budget + structured rate limit via Supabase-backed ledger. Tiers: anonymous (5 req / 10K tokens/day), free (50 req / 100K tokens/day), Operate (500 req / 2M tokens/day). | New `016_user_quotas.sql` migration adds `user_quotas_tiers` (seed: 3 rows) and `user_quota_ledger` (per-user per-day counters with atomic increment via RPC). Tier resolved from `auth.users.is_anonymous` + subscription status. Existing Upstash `isRateLimited()` stays as IP-based secondary defense. |
| SEC-03 | Token counting before dispatch; prompts over 80K (Sonnet) / 150K tokens truncate tail-first with warning header. | Use `client.messages.countTokens({ model, system, messages })` — free, official, matches billing. Swap out `@anthropic-ai/tokenizer` (inaccurate for Claude 3+ per Anthropic guidance). Implement `budgetCheck({ model, system, messages, limit })` in `lib/services/prompt-builder.ts` that trims `messages` oldest-first, preserves `system` (includes humaContext), sets `X-Huma-Truncated` header, and returns 413 with Voice-Bible copy if still over budget after full trim. |
| SEC-04 | Prompt-injection sanitizer at input boundary. Reject `[[`/`]]` with 400, strip "ignore previous instructions" patterns, NFC-normalize, strip zero-width. | Two-layer defense: `lib/schemas/sanitize.ts` exports `sanitizeUserText()` using `s.normalize("NFC")`, regex for bracket pairs, zero-width char class `/[\u200B\u200C\u200D\uFEFF]/g`, and short explicit injection-phrase list. Layer 2: Zod `.refine()` on every user-text field — forces 400 at `parseBody()` boundary. Applies across 6+ schemas. |
| SEC-05 | Every API route emits structured JSON log: req_id, user_id, route, prompt_tokens, output_tokens, latency_ms, status. | New `lib/observability.ts` exports `withObservability(req, route, handler)` that generates a ULID, times the handler, captures Anthropic usage metadata from response, and emits `console.log(JSON.stringify({...}))`. Wraps every Anthropic-calling route. Vercel automatic log ingestion collects — free, searchable, zero deps. |
| SEC-06 | SSE stream in `v2-chat/route.ts` aborts Anthropic stream when `request.signal.aborted` fires. | `v2-chat` currently uses `anthropic.messages.stream({...})` which returns `MessageStream` with `controller: AbortController` and `.abort()`. Pass `request.signal` through to SDK via `{ signal }` options OR add `request.signal.addEventListener('abort', () => stream.abort())`. Also wire `ReadableStream.cancel()` to trigger the same. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@anthropic-ai/sdk` | ^0.78.0 (installed) | Claude API client with streaming + `countTokens()` | Already in dep tree; `MessageStream.controller.abort()` is the official abort primitive; `client.messages.countTokens()` is the official pre-dispatch token counter (free, matches billing). |
| `@supabase/ssr` + `@supabase/supabase-js` | ^0.9.0 / ^2.99.2 (installed) | Auth (anon + magic-link), quota ledger, structured logs join | `createServerSupabase()` pattern established across 10 routes; `signInAnonymously()` yields real `authenticated`-role JWT with `is_anonymous: true` claim. |
| `zod` | ^4.3.6 (installed) | Request schema validation + sanitizer refinement | Already on every route via `parseBody()`; `.refine()` is the idiomatic boundary for sanitizer; forces 400 before handler runs. |
| `@upstash/redis` | ^1.37.0 (installed) | IP-based secondary rate limit + future distributed counters | Existing `rate-limit.ts` uses it with in-memory fallback; keep this as belt-and-suspenders cap on anon-user rotation. |
| `ulid` | ^2.3.0 (NEW — to install) | Request IDs (`req_id` field) | 26 chars, lexicographic sort, ms timestamp prefix. ~2 KB. Better than UUIDv4 for log sorting. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest` | ^4.1.0 (installed) | Unit + route tests with mocked Anthropic/Supabase | All SEC-XX validation lives here. Route tests mock `@anthropic-ai/sdk` via `vi.mock` (pattern from `sheet/route.test.ts`). |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `ulid` | `nanoid` or `uuid@v4/v7` | nanoid is 118 bytes but not timestamp-sortable; UUIDv7 is the emerging "best" (sortable + native DB types) but ULID matches CONTEXT.md intent and is functionally equivalent to UUIDv7. Stick with ULID per CONTEXT.md decision. |
| `client.messages.countTokens()` (HTTP call per request) | `@anthropic-ai/tokenizer` (local BPE) | **Do not use** — per Anthropic's own token counting guide, `@anthropic-ai/tokenizer` "is no longer accurate" for Claude 3+ models. `countTokens()` is a free API with separate rate limits (tier 1: 100 RPM; tier 2: 2000 RPM) and matches billing exactly. Adds one network round-trip per message — acceptable given it prevents runaway cost. |
| `console.log(JSON.stringify(...))` | `pino` | CONTEXT.md Claude's Discretion notes the choice. `console.log` is zero-deps, zero-config on Vercel, and structured-JSON format means drain swap is a 1-line change later. Recommendation: ship with console.log; revisit only if log volume justifies it. |
| `auth.linkIdentity({ provider: "email" })` | `auth.updateUser({ email })` | **CONTEXT.md is incorrect** — `linkIdentity` is OAuth-only per Supabase docs. Correct path for anon → magic-link is `await supabase.auth.updateUser({ email: userEmail })`, which triggers email verification; on verification the `user_id` is preserved and `is_anonymous` flips to `false`. |

**Installation:**

```bash
cd app && npm install ulid
```

No other new deps — `@anthropic-ai/sdk` already installed with all needed primitives.

## Architecture Patterns

### Recommended Project Structure

```
app/src/
├── lib/
│   ├── api-error.ts          # [EDIT] extend ApiErrorBody with RATE_LIMITED tier/resetAt/suggest fields
│   ├── observability.ts      # [NEW] withObservability() wrapper + makeReqId()
│   ├── quota.ts              # [NEW] checkQuota(userId, route, tokens) + recordQuota()
│   ├── rate-limit.ts         # [EDIT] keep IP limiter as secondary; scope to pre-auth routes
│   ├── schemas/
│   │   ├── index.ts          # [EDIT] add sanitizeUserText refinements to every user-text field
│   │   ├── parse.ts          # [KEEP] already the clean integration point
│   │   └── sanitize.ts       # [NEW] sanitizeUserText() + regexes + NFC normalize
│   └── services/
│       └── prompt-builder.ts # [EDIT] add budgetCheck({ model, system, messages, limit })
├── app/
│   ├── api/
│   │   ├── v2-chat/route.ts         # [EDIT] auth gate + withObservability + SSE abort wire-up
│   │   ├── sheet/route.ts           # [EDIT] auth gate + withObservability + budget check
│   │   ├── insight/route.ts         # [EDIT] same pattern
│   │   ├── whole-compute/route.ts   # [EDIT] same
│   │   ├── nudge/route.ts           # [EDIT] same
│   │   ├── palette/route.ts         # [EDIT] same (Haiku — smaller budget)
│   │   ├── reflection/route.ts      # [EDIT] same
│   │   ├── canvas-regenerate/route.ts # [EDIT] already has Bearer auth; add observability/quota/budget
│   │   ├── weekly-review/route.ts   # [EDIT] same pattern
│   │   └── cron/
│   │       ├── morning-sheet/route.ts # [EDIT] emit cron logs (source: "cron")
│   │       └── cost-rollup/route.ts   # [NEW] nightly cost aggregation
│   └── start/
│       └── page.tsx          # [EDIT] call auth.signInAnonymously() on mount if !session
├── components/
│   ├── shared/
│   │   ├── AuthModal.tsx     # [EDIT] wire auth.updateUser({ email }) path for anon upgrade
│   │   └── QuotaCard.tsx     # [NEW] 429 overlay component
│   └── ...
└── hooks/
    └── useMessageStream.ts   # [EDIT] intercept 429; trigger <QuotaCard>

app/supabase/migrations/
└── 016_user_quotas.sql       # [NEW] user_quotas_tiers (seed 3) + user_quota_ledger + RPC increment_quota
```

**Note on "never rewrite" constraint:** All route files must use surgical edits. The `withObservability()` wrapper is the only new top-level structure — existing handler bodies remain intact inside it.

### Pattern 1: withObservability wrapper

**What:** Single chokepoint that wraps every Anthropic-calling route body to emit the 7-field structured log on success and on error.

**When to use:** Every `POST` handler in `/api/*` that touches Anthropic. Also cron routes (with `source: "cron"`).

**Example:**

```typescript
// Source: lib/observability.ts (new file, synthesized from SEC-05 + Vercel JSON-log pattern)
import { ulid } from "ulid";

type LogSource = "user" | "cron" | "system";

interface ObsCtx {
  reqId: string;
  userId: string | null;
  route: string;
  source: LogSource;
  setPromptTokens: (n: number) => void;
  setOutputTokens: (n: number) => void;
}

export async function withObservability<T extends Response>(
  request: Request,
  route: string,
  source: LogSource,
  userId: string | null,
  handler: (ctx: ObsCtx) => Promise<T>
): Promise<T> {
  const reqId = ulid();
  const t0 = Date.now();
  let promptTokens = 0;
  let outputTokens = 0;
  const ctx: ObsCtx = {
    reqId, userId, route, source,
    setPromptTokens: (n) => { promptTokens = n; },
    setOutputTokens: (n) => { outputTokens = n; },
  };

  let status = 500;
  try {
    const response = await handler(ctx);
    status = response.status;
    return response;
  } catch (err) {
    status = 500;
    throw err;
  } finally {
    console.log(JSON.stringify({
      req_id: reqId,
      user_id: userId,
      route,
      prompt_tokens: promptTokens,
      output_tokens: outputTokens,
      latency_ms: Date.now() - t0,
      status,
      source,
    }));
  }
}
```

### Pattern 2: Zod-boundary sanitizer (Layer 2)

**What:** Attach `sanitizeUserText` as a `.refine()` on every user-written string field so `parseBody()` returns 400 automatically.

**When to use:** Every existing schema in `lib/schemas/index.ts` that has a string field containing user-written text.

**Example:**

```typescript
// Source: lib/schemas/sanitize.ts (new file)
const ZERO_WIDTH_RE = /[\u200B\u200C\u200D\uFEFF]/g;
const MARKER_RE = /\[\[|\]\]/;
const INJECTION_RES = [
  /^\s*ignore (all )?previous instructions/i,
  /^\s*disregard (all )?previous/i,
  /^\s*system:\s*/i,
];

export interface SanitizeResult {
  value: string;
  rejected?: "markers" | "injection";
}

export function sanitizeUserText(raw: string): SanitizeResult {
  const nfc = raw.normalize("NFC");
  const noZw = nfc.replace(ZERO_WIDTH_RE, "");
  if (MARKER_RE.test(noZw)) return { value: noZw, rejected: "markers" };
  let stripped = noZw;
  for (const re of INJECTION_RES) stripped = stripped.replace(re, "");
  if (stripped !== noZw) return { value: stripped.trim(), rejected: "injection" };
  return { value: noZw };
}

// Source: lib/schemas/index.ts — refinement usage
import { sanitizeUserText } from "./sanitize";

const userTextSchema = z.string().min(1).max(50_000).superRefine((val, ctx) => {
  const result = sanitizeUserText(val);
  if (result.rejected === "markers") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Input contains reserved marker delimiters ([[ or ]]).",
    });
  }
  // "injection" pattern is stripped silently — only reject hard on markers
});

// Apply to v2ChatSchema.messages[].content, aspirations[].rawText, reflection text, etc.
```

### Pattern 3: Token budget + tail-trim

**What:** Before dispatch, call `countTokens()` on full `(system, messages)`; if over budget, drop `messages[]` oldest-first until it fits; header `X-Huma-Truncated` on any drop.

**When to use:** Every Anthropic-calling route, in `lib/services/prompt-builder.ts`.

**Example:**

```typescript
// Source: lib/services/prompt-builder.ts (new function, uses client.messages.countTokens)
import type Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, TextBlockParam } from "@anthropic-ai/sdk/resources/messages";

const BUDGETS = {
  sonnet: 80_000,      // CONTEXT.md-defined soft cap, far below 200K model ceiling
  sonnet46: 80_000,    // same for Sonnet 4.6 (1M context, but we cap at 80K)
  haiku: 150_000,      // CONTEXT.md "ceiling"
} as const;

export interface BudgetResult {
  system: string | TextBlockParam[];
  messages: MessageParam[];
  trimmedCount: number;
  inputTokens: number;
}

export async function budgetCheck(opts: {
  anthropic: Anthropic;
  model: string;
  system: string | TextBlockParam[];
  messages: MessageParam[];
  limit: number;
}): Promise<BudgetResult | { tooLarge: true }> {
  let msgs = [...opts.messages];
  let trimmed = 0;

  // Loop: count → if over, drop oldest user/assistant pair → recount
  while (true) {
    const { input_tokens } = await opts.anthropic.messages.countTokens({
      model: opts.model,
      system: opts.system,
      messages: msgs,
    });

    if (input_tokens <= opts.limit) {
      return { system: opts.system, messages: msgs, trimmedCount: trimmed, inputTokens: input_tokens };
    }

    if (msgs.length <= 1) {
      // Can't trim further — system prompt alone is over budget
      return { tooLarge: true };
    }
    msgs = msgs.slice(1); // drop oldest
    trimmed++;
  }
}
```

### Pattern 4: SSE disconnect → Anthropic abort (SEC-06)

**What:** Wire `request.signal` through to the SDK `MessageStream` so client disconnect cancels the upstream Anthropic call.

**When to use:** Only `v2-chat/route.ts` (only streaming route).

**Example:**

```typescript
// Source: v2-chat/route.ts surgical edit (SEC-06)
// Current: const stream = anthropic.messages.stream({ model, system, messages, ... });
// Problem: ReadableStream start() has no reference to request.signal or stream.

// Fix: pass signal via options object (SDK 0.78 accepts { signal } in RequestOptions)
// and wire start+cancel of the ReadableStream.

const stream = anthropic.messages.stream(
  { model, system, messages, max_tokens: 2048 },
  { signal: request.signal },
);

const readableStream = new ReadableStream({
  async start(controller) {
    const encoder = new TextEncoder();

    // Belt-and-suspenders: also listen for request abort directly
    const onAbort = () => {
      try { stream.abort(); } catch {}
      try { controller.close(); } catch {}
    };
    request.signal.addEventListener("abort", onAbort);

    try {
      for await (const event of stream) {
        if (request.signal.aborted) break;
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    } catch (err) {
      // APIUserAbortError → expected when aborted; don't log as error
      if ((err as Error).name !== "APIUserAbortError") {
        console.error("Stream error:", err);
        controller.error(err);
      }
    } finally {
      request.signal.removeEventListener("abort", onAbort);
    }
  },
  cancel() {
    // ReadableStream consumer cancelled (e.g., client disconnect via browser nav)
    try { stream.abort(); } catch {}
  },
});
```

### Anti-Patterns to Avoid

- **Inline sanitization in `prompt-builder.ts`:** Too easy to forget as new routes get added. Zod-refinement placement is non-bypassable.
- **`@anthropic-ai/tokenizer` local counting:** Inaccurate for Claude 3+ models per Anthropic's own guidance. The HTTP `countTokens()` endpoint is free, matches billing, and has its own rate limit budget separate from message creation.
- **Middleware-based auth gate:** Next 16 middleware can't easily branch on CRON_SECRET header for specific routes while also running Supabase cookie-based auth. Per-route auth check (existing pattern in 10 routes) keeps all logic visible in one file.
- **Using `anthropic.messages.create()` without streaming for v2-chat:** Would eliminate SSE-abort concern but kill UX (users see no incremental output). Keep streaming; just wire the abort.
- **Full rewrite of `v2-chat/route.ts` or `AuthModal.tsx`:** PROJECT.md "never rewrite" hard constraint. Surgical edits only.
- **Trying to link email via `auth.linkIdentity({ provider: "email" })`:** `linkIdentity` is OAuth-only per Supabase docs. Use `auth.updateUser({ email })` for anon → magic-link upgrade.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token counting | Custom BPE tokenizer or `@anthropic-ai/tokenizer` (stale) | `client.messages.countTokens({ model, system, messages })` | Matches billing, free, officially supported, separate rate-limit pool. Per-call 50–200ms overhead is acceptable for the cost-safety it buys. |
| Anonymous pre-auth identity | Custom preview-token JWT | `supabase.auth.signInAnonymously()` | Saves ~2 days of JWT/ledger infra per PROJECT.md; emits real `user_id` into existing auth + RLS pipeline; `updateUser({ email })` upgrades in-place preserving user_id. |
| Request ID generation | `crypto.randomUUID()` | `ulid()` | ULIDs are millisecond-sortable, which lets you `grep` Vercel logs chronologically without joining on timestamp. 26 chars vs 36 for UUID. |
| SSE abort coordination | Manual `Promise.race` with timeout | `MessageStream.controller.abort()` + `{ signal: request.signal }` | SDK already threads the AbortController through its internal fetch; `request.signal` from Next.js Request is the canonical primitive. |
| Per-user rate limit with Redis counters | Custom Redis Lua script | Postgres `user_quota_ledger` with an RPC (`increment_quota_and_check`) | CONTEXT.md picked Supabase ledger for Phase 1 (Redis distributed quota is explicit Phase 6+ deferred item). One Postgres call is fine at current scale. |
| Structured logging format | Custom formatter | `console.log(JSON.stringify({...}))` on Vercel | Vercel's log ingestion parses JSON natively; searchable in Dashboard; zero deps. Swap to pino/logtail if/when volume justifies. |
| Prompt-injection regex | Massive pattern library like `@lakera/chainguard` | Short, explicit injection-phrase list + `[[`/`]]` rejection + NFC normalize + zero-width strip | CONTEXT.md explicitly wants "short Jackson-style list, not a paranoid regex wall." The marker rejection is the hard-wall; phrase stripping is belt-and-suspenders. |
| Input validation | Raw `request.json()` + `if (!body.field)` | Zod schema via `parseBody()` | Already the project-wide pattern; sanitizer integrates as `.refine()` on top of existing schema. |

**Key insight:** This phase is not about building new primitives. It's about threading 4 existing primitives (Supabase auth, Zod refinement, Anthropic SDK abort/countTokens, Upstash) through one wrapper function. Resist the urge to over-architect.

## Common Pitfalls

### Pitfall 1: `@anthropic-ai/tokenizer` drift

**What goes wrong:** CONTEXT.md recommends `@anthropic-ai/tokenizer` for token counts. Library was last updated a year ago. Per Anthropic's own token counting guide, it "is no longer accurate" for Claude 3+ models — it can produce counts off by 10–30% vs. actual billing.

**Why it happens:** Tokenizer is a static BPE file frozen at Claude 2 era. Claude 3+ uses a different tokenizer (and Opus 4.7 uses yet another new one).

**How to avoid:** Use `client.messages.countTokens()`. It's free, has a separate rate-limit pool (tier 1: 100 RPM, tier 2: 2000 RPM), matches billing exactly, and supports tools/images/PDFs. One extra HTTP call per message is the trade — acceptable for cost safety.

**Warning signs:** Vercel billing shows prompt_tokens in logs diverging by >5% from Anthropic Console usage summaries. Truncation triggering "too often" on prompts that should fit.

### Pitfall 2: Anonymous user data bloat

**What goes wrong:** Bad actors hit `/start` repeatedly with fresh cookies; each triggers `signInAnonymously()`, creating a row in `auth.users`. Database size grows quickly.

**Why it happens:** Supabase's anon auth endpoint is not CAPTCHA-gated by default and has no rate limit for a single IP.

**How to avoid:** (1) Keep existing Upstash IP-rate-limit on `/start` page load (or wrap `signInAnonymously()` call in a per-IP cap via the existing `rate-limit.ts`); (2) Plan an anonymous-user cleanup cron for Phase 2+ (CONTEXT.md deferred) that deletes `auth.users` rows with `is_anonymous=true` and no `user_quota_ledger` activity in 30 days.

**Warning signs:** `auth.users` row count spiking without a corresponding uptick in signed-up users; Supabase dashboard shows DB size climbing.

### Pitfall 3: Next.js metadata caching across anon users

**What goes wrong:** Static-rendered pages cache the first anon user's metadata and serve it to subsequent anon users.

**Why it happens:** Next.js aggressive caching + Supabase anon JWTs being effectively unique per-user but routing through the same CDN edge.

**How to avoid:** Ensure `/start` page uses `export const dynamic = "force-dynamic"` or equivalent. Every route that reads `auth.getUser()` must be dynamic — which Next.js does for you automatically when you read cookies, but worth verifying.

**Warning signs:** Multiple users reporting they see someone else's aspirations or conversation on `/start`; one user_id appearing in logs for requests from many different IPs.

### Pitfall 4: `updateUser({ email })` automatic email confirmation

**What goes wrong:** When you call `auth.updateUser({ email })` on an anonymous user, Supabase by default sends a confirmation email BUT also immediately marks the user as having that email (a GitHub-documented footgun).

**Why it happens:** Known edge-case in Supabase auth — behavior differs between anon-user and regular-user email updates. Issue #29350 on supabase/supabase.

**How to avoid:** Verify the actual behavior in a Supabase staging project before shipping. If automatic confirmation is an issue, use `auth.admin.generateLink()` workaround with `type: "email_change"` (service-role required).

**Warning signs:** User reports "I put in my email but never got an email — and now I'm locked out of my anon session."

### Pitfall 5: SSE abort leaving zombie streams

**What goes wrong:** Client disconnects mid-stream; `request.signal.aborted` fires but the `for await` loop over Anthropic's stream doesn't check it; bytes keep flowing from Anthropic → your server → nowhere. You still pay.

**Why it happens:** `ReadableStream`'s `start()` callback doesn't automatically propagate abort to internal iterators. The Anthropic SDK has the abort primitive but only uses it if you explicitly pass `{ signal: request.signal }`.

**How to avoid:** Pass `{ signal: request.signal }` in the second arg to `anthropic.messages.stream()`, AND check `request.signal.aborted` at the top of each iteration, AND implement `ReadableStream.cancel()` to call `stream.abort()`. Belt-and-suspenders-and-belt.

**Warning signs:** Anthropic usage logs show `output_tokens` consistently near `max_tokens` even when your server logs show early disconnects. Test: `curl -N` + Ctrl-C and watch server-side.

### Pitfall 6: Sanitizer false positives on legitimate user text

**What goes wrong:** User writes "I wanted to share [[context]] with you" or similar. Sanitizer rejects with 400. UX breaks.

**Why it happens:** `[[`/`]]` is also a valid Markdown / MediaWiki convention.

**How to avoid:** The rejection is a hard block per CONTEXT.md — this is intentional. But document clearly in the 400 error body that "reserved markers" is why. Pre-flight: audit existing production messages for `[[`/`]]` occurrences in user text (quick query over `chat_messages`). If non-zero, reconsider or whitelist specific contexts.

**Warning signs:** 400 rate spikes after launch; support tickets about "my message was rejected."

### Pitfall 7: Cron still counted against user quota

**What goes wrong:** `morning-sheet` cron calls `/api/sheet` with CRON_SECRET. If the `withObservability` wrapper or quota check runs before the CRON_SECRET check, the operator's user_id gets charged for each cron-triggered sheet compile.

**Why it happens:** Order of operations in the route handler. Must check CRON_SECRET FIRST and set `source: "cron"` BEFORE the quota check.

**How to avoid:** `isCron = (auth header matches CRON_SECRET)`; if cron, skip quota check but still log with `source: "cron"`, `user_id = <operator's id>` (for per-operator cost attribution) AND emit an aggregate system log with `source: "cron", user_id: null, operator_count: N`.

**Warning signs:** Operators hit their free-tier cap by 8am every morning because the cron ate their budget before they woke up.

### Pitfall 8: Vercel Hobby plan log retention

**What goes wrong:** Vercel Hobby plan keeps logs for only 1 hour. Pro plan keeps 1 day. Cost-rollup cron runs nightly but logs from earlier in the day are already gone on Hobby.

**Why it happens:** Plan limits.

**How to avoid:** Verify current Vercel plan. If Hobby, either (a) run cost-rollup every 30 minutes instead of nightly, or (b) persist a lightweight usage row directly to `cost_metrics` table from `withObservability` on every request (higher DB write load). Recommendation: upgrade to Pro ($20/mo) which gives 1-day retention + enables the nightly-rollup approach.

**Warning signs:** `cost_metrics` table empty after a week; Vercel Dashboard shows "log retention exceeded."

## Code Examples

Verified patterns from official sources + installed SDK.

### Anonymous auth on /start page mount

```typescript
// Source: Supabase Anonymous Sign-Ins guide (https://supabase.com/docs/guides/auth/auth-anonymous)
// Usage in app/src/app/start/page.tsx (surgical edit)
"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase";

export default function StartPage() {
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) console.error("Anon sign-in failed:", error);
        // JWT now has is_anonymous: true; user_id is a real uuid
      }
    })();
  }, []);
  // ...rest of page
}
```

### Convert anon → magic-link email (correct path)

```typescript
// Source: Supabase Anonymous Sign-Ins guide — "Converting Anonymous to Permanent Users > Via Email"
// Usage in AuthModal.tsx (surgical edit)
async function upgradeAnonToEmail(email: string) {
  const supabase = createClient();
  if (!supabase) return { error: "Auth not configured" };

  const { data: { session } } = await supabase.auth.getSession();
  const isAnon = session?.user?.is_anonymous === true;

  if (isAnon) {
    // Path A: anon → email (preserves user_id)
    const { error } = await supabase.auth.updateUser({ email });
    if (error) return { error: error.message };
    // Supabase sends confirmation email; on verification, is_anonymous flips to false.
  } else {
    // Path B: existing signed-out flow (unchanged from current AuthModal)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/today` },
    });
    if (error) return { error: error.message };
  }
  return { error: null };
}
```

### Token counting before dispatch (official Anthropic SDK)

```typescript
// Source: https://platform.claude.com/docs/en/build-with-claude/token-counting
// Usage in lib/services/prompt-builder.ts (new helper)
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const response = await anthropic.messages.countTokens({
  model: "claude-sonnet-4-6",
  system: staticPrompt + "\n\n" + dynamicPrompt,
  messages: [
    { role: "user", content: "Hello, Claude" },
  ],
});
// response: { input_tokens: 14 }
console.log(response.input_tokens);
```

### RLS policy for anon vs. permanent users

```sql
-- Source: Supabase Anonymous Sign-Ins guide
-- Example RLS on a sensitive table (e.g., user_quota_ledger):
CREATE POLICY "Users can read their own quota"
ON user_quota_ledger AS PERMISSIVE FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Anon users cannot access Operator-tier-gated tables:
CREATE POLICY "Only permanent users can access operate features"
ON operate_features AS RESTRICTIVE FOR SELECT
TO authenticated
USING ((select (auth.jwt()->>'is_anonymous')::boolean) IS FALSE);
```

### Structured log emission pattern

```typescript
// Source: synthesized from Vercel log ingestion docs + CONTEXT.md decision
// Usage in lib/observability.ts
function emitLog(payload: {
  req_id: string;
  user_id: string | null;
  route: string;
  prompt_tokens: number;
  output_tokens: number;
  latency_ms: number;
  status: number;
  source: "user" | "cron" | "system";
}) {
  // Vercel ingests stdout JSON automatically; searchable in Dashboard
  console.log(JSON.stringify(payload));
}
```

### ULID request ID

```typescript
// Source: npm ulid (https://www.npmjs.com/package/ulid)
import { ulid } from "ulid";
const reqId = ulid();
// => "01HXQ0CXB9X4Y1FZRVPRPVJ3B7" (26 chars, timestamp prefix, sortable)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@anthropic-ai/tokenizer` (local BPE) | `client.messages.countTokens()` (HTTP API) | Claude 3 release (Mar 2024) | Old tokenizer drifts 10–30% from actual billing on Claude 3+; new API is free, accurate, matches billing. |
| `claude-sonnet-4-20250514` (currently in HUMA) | `claude-sonnet-4-6` or `claude-opus-4-7` | Sonnet 4 deprecated Dec 2025; retires **2026-06-15** | **HUMA is currently using a model that will be retired in 2 months.** Planner should note this for downstream phases — not blocking for Phase 1 but worth flagging. Context windows also grew (Sonnet 4: 200K → Sonnet 4.6: 1M). |
| UUIDv4 for request IDs | ULID (or UUIDv7) | 2016 (ULID spec) / 2022 (UUIDv7 RFC draft) | ULID/UUIDv7 are lexicographically sortable; makes log grep chronological without joining timestamps. CONTEXT.md picked ULID — equivalent to UUIDv7 for practical purposes. |
| Supabase email preview tokens (JWT, custom) | `auth.signInAnonymously()` | Supabase v2.79 (Nov 2023) | First-class in the auth pipeline; RLS just works; `is_anonymous` claim in JWT for policy branching. |
| `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true }})` | `supabase.auth.updateUser({ email })` on already-signed-in anon user | Supabase auth 2.145+ (2024) | Preserves user_id during upgrade; OTP call would create a new user. |
| Full-regex prompt-injection defense | Short explicit phrase list + structural rejection (markers, NFC, zero-width) | Research consensus 2025 | Over-broad regexes have high false-positive rate; structural defenses (can't emit `[[` to spoof a marker) are stronger and less user-hostile. |

**Deprecated/outdated:**

- `@anthropic-ai/tokenizer`: functional but inaccurate for Claude 3+. Use `countTokens()` API.
- `claude-sonnet-4-20250514` (HUMA's current default): deprecated Dec 2025, retires 2026-06-15.
- `auth.linkIdentity({ provider: "email" })`: never existed; is OAuth-only. Use `updateUser({ email })`.
- Session-free preview JWTs for pre-auth: replaced by anon auth in all Supabase apps since 2024.

## Corrections from CONTEXT.md

Three items in CONTEXT.md need adjustment. These are corrections, not re-litigations of decisions.

1. **Anon → magic-link upgrade primitive.** CONTEXT.md specifies `auth.linkIdentity({ provider: "email", email })`. Supabase documentation (verified 2026-04-18) states `linkIdentity` is OAuth-only. The correct primitive for email upgrade is `supabase.auth.updateUser({ email })`, which triggers email confirmation and preserves `user_id`. Plans must use this path; the UX and data semantics are identical to CONTEXT.md's intent.

2. **Token counting library.** CONTEXT.md specifies `@anthropic-ai/tokenizer`. Anthropic's official guidance (verified 2026-04-18) states the package "is no longer accurate" for Claude 3+ models. Use `client.messages.countTokens({ model, system, messages })` instead. It is free, has a separate rate-limit pool, matches billing exactly, and supports all content types (text/tools/images/PDFs). Adds ~50–200ms per message — acceptable given the cost-safety it buys. No `tokenizer` package needs to be installed.

3. **Sonnet budget caps clarification.** CONTEXT.md says "80K (Sonnet) / 150K tokens." These are soft caps chosen for cost control, not hard model limits. Actual model context windows (verified against Claude platform docs 2026-04-18):
   - `claude-sonnet-4-20250514` (HUMA current): 200K context, 64K max output — **deprecated, retires 2026-06-15**
   - `claude-sonnet-4-6`: 1M context, 64K max output
   - `claude-haiku-4-5-20251001`: 200K context, 64K max output
   The 80K/150K caps are fine as business rules; just document in code that these are policy caps, not model limits, and that Sonnet has headroom should policy change.

## Open Questions

1. **Should Phase 1 also bump `claude-sonnet-4-20250514` to `claude-sonnet-4-6`?**
   - What we know: HUMA uses `claude-sonnet-4-20250514` which is deprecated and retires 2026-06-15 (~2 months out).
   - What's unclear: Whether model migration is "mission creep" for Phase 1 or a natural co-delivery.
   - Recommendation: Plan this as a **separate deferred item, not Phase 1 scope.** A sibling Phase 1.5 or pre-Phase-2 migration plan. Phase 1 is already scope-heavy; adding a model bump that needs its own Voice-Bible re-validation (different tokenizer, possibly different voice drift) muddies the atomic flag.

2. **Vercel plan log retention** — cost-rollup cron depends on log lifetime.
   - What we know: Hobby = 1h retention; Pro = 1d; Enterprise = longer.
   - What's unclear: HUMA's current Vercel plan (not in files read).
   - Recommendation: Planner must verify `vercel.json` + Vercel account plan before finalizing cron cadence. If Hobby, recommend either rolling up every 30m OR writing minimal `cost_metrics` rows directly from `withObservability`.

3. **Prompt cache accounting in budget check.**
   - What we know: Anthropic ephemeral cache reduces cost ~90% on hits; v2-chat already uses `cache_control: { type: "ephemeral" }` on `staticPrompt`.
   - What's unclear: `countTokens()` does NOT account for cache hits (per Anthropic FAQ). So our `input_tokens` number is always the "uncached" count. Fine for budget enforcement, but could surprise on cost rollups.
   - Recommendation: In `cost_metrics`, use actual `usage.input_tokens` from Anthropic's streaming message response (which separates cached vs. non-cached), not the pre-dispatch count. Document clearly in the cost-rollup cron.

4. **Quota ledger granularity: hourly window or rolling 24h?**
   - What we know: CONTEXT.md says "5 req / 10K tokens/day" etc.
   - What's unclear: Is "day" UTC midnight reset or rolling 24h?
   - Recommendation: Plan should decide; UTC-midnight simpler; rolling-24h gentler UX. Ledger schema easily supports either — just a different query.

5. **Atomic quota increment — RPC vs. upsert.**
   - What we know: Supabase RPCs (stored procedures) provide true atomic counters.
   - What's unclear: Whether CONTEXT.md's "Supabase ledger" assumes an RPC or a simple table upsert.
   - Recommendation: Use an RPC: `increment_quota_and_check(user_id uuid, route text, tokens int, now timestamptz) returns { allowed boolean, reset_at timestamptz, tier text }`. One round-trip, atomic, future-proof.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 (installed, `node` environment) |
| Config file | `app/vitest.config.ts` (exists; aliases `@` → `src`; 15s test timeout) |
| Quick run command | `cd app && npm test -- <path-or-pattern>` (e.g., `npm test -- src/lib/schemas/sanitize.test.ts`) |
| Full suite command | `cd app && npm test` |

Established mocking patterns (from `sheet/route.test.ts` and `__tests__/api-routes.test.ts`):
- Mock `@anthropic-ai/sdk` via `vi.mock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }))`.
- Mock `@/lib/supabase-server` and `@/lib/redis` with `vi.mock()`.
- Set `process.env.ANTHROPIC_API_KEY` in `beforeAll()`.
- Build `Request` objects with `new Request("http://localhost/api/...", { method, headers, body })`.
- Lazy-import the route AFTER mocks are registered: `const { POST } = await import("./route")`.

### Phase Requirements → Test Map

| Req ID | Observable behavior | Test type | Automated command | File exists? |
|--------|---------------------|-----------|-------------------|-------------|
| SEC-01 | Unauthenticated request to `/api/v2-chat` returns 401 | unit (route) | `cd app && npm test -- src/app/api/v2-chat/route.auth.test.ts` | Wave 0 |
| SEC-01 | Unauthenticated request to `/api/sheet` returns 401 | unit (route) | `cd app && npm test -- src/app/api/sheet/route.auth.test.ts` | Wave 0 |
| SEC-01 | Request to `/api/sheet` with correct `Authorization: Bearer $CRON_SECRET` returns 200 (bypass) | unit (route) | same file, `cron bypass` case | Wave 0 |
| SEC-01 | Smoke: `curl -sS -X POST https://<deployment>/api/v2-chat -d '{}'` returns HTTP 401 | integration (curl smoke) | `cd app && bash scripts/smoke/sec-01-curl.sh` | Wave 0 |
| SEC-02 | Anon-tier user on 6th request in a day receives 429 with `{ tier: "anonymous", code: "RATE_LIMITED", resetAt, suggest: "sign_in" }` | unit (route) | `cd app && npm test -- src/app/api/v2-chat/route.quota.test.ts` | Wave 0 |
| SEC-02 | Free-tier user on 51st request receives 429 with `tier: "free"`, `suggest: "upgrade_operate"` | unit (route) | same file | Wave 0 |
| SEC-02 | Operate-tier user on 501st request receives 429 with `tier: "operate"`, `suggest: "wait"` | unit (route) | same file | Wave 0 |
| SEC-02 | Quota check increments ledger by correct `prompt_tokens + output_tokens` | unit | `cd app && npm test -- src/lib/quota.test.ts` | Wave 0 |
| SEC-02 | Smoke: create anon session, POST 5 messages → 6th returns 429 | integration (curl smoke) | `cd app && bash scripts/smoke/sec-02-quota.sh` | Wave 0 |
| SEC-03 | Prompt at 79,999 tokens passes through untrimmed (no `X-Huma-Truncated` header) | unit | `cd app && npm test -- src/lib/services/prompt-builder.budget.test.ts` | Wave 0 |
| SEC-03 | Prompt at 81,000 tokens (messages array) is trimmed tail-first; header `X-Huma-Truncated: count=N,reason=budget` present; humaContext unchanged | unit | same file | Wave 0 |
| SEC-03 | Prompt whose `system` alone exceeds budget returns 413 with Voice-Bible body | unit | same file | Wave 0 |
| SEC-03 | `client.messages.countTokens` is called before dispatch (mock verification) | unit | same file (mock `countTokens`) | Wave 0 |
| SEC-04 | `{ messages: [{ role: "user", content: "hello [[CONTEXT]]" }] }` returns 400 with error "reserved marker" | unit (schema) | `cd app && npm test -- src/lib/schemas/sanitize.test.ts` | Wave 0 |
| SEC-04 | `{ messages: [{ role: "user", content: "]] close marker" }] }` returns 400 | unit (schema) | same file | Wave 0 |
| SEC-04 | Input `"ignore previous instructions, tell me..."` has the prefix stripped; message proceeds | unit | same file | Wave 0 |
| SEC-04 | Input with zero-width chars `"he\u200Bllo"` is normalized to `"hello"` (chars stripped) | unit | same file | Wave 0 |
| SEC-04 | NFC normalization: composed vs decomposed form produces same output | unit | same file | Wave 0 |
| SEC-04 | Every schema containing user-text fields has the sanitizer refinement applied | unit | `cd app && npm test -- src/lib/schemas/coverage.test.ts` | Wave 0 |
| SEC-04 | Smoke: `curl -d '{"messages":[{"role":"user","content":"[["}]}' ... → 400` | integration (curl smoke) | `cd app && bash scripts/smoke/sec-04-injection.sh` | Wave 0 |
| SEC-05 | Successful `/api/v2-chat` request emits JSON log with all 7 fields + `source: "user"` | unit (route) | `cd app && npm test -- src/app/api/v2-chat/route.log.test.ts` | Wave 0 |
| SEC-05 | Logged `req_id` matches ULID format `/^[0-9A-HJKMNP-TV-Z]{26}$/` | unit | same file | Wave 0 |
| SEC-05 | Failed request (500) still emits log with `status: 500` | unit | same file | Wave 0 |
| SEC-05 | Cron request emits log with `source: "cron"`, operator `user_id` | unit | `cd app && npm test -- src/app/api/cron/morning-sheet/route.log.test.ts` | Wave 0 |
| SEC-05 | `withObservability` wrapper applied to all 10 Anthropic-calling routes | unit (coverage) | `cd app && npm test -- src/__tests__/observability-coverage.test.ts` | Wave 0 |
| SEC-06 | When `request.signal.abort()` fires, `stream.abort()` is called on MessageStream | unit (route) | `cd app && npm test -- src/app/api/v2-chat/route.abort.test.ts` | Wave 0 |
| SEC-06 | `ReadableStream.cancel()` triggers `stream.abort()` | unit | same file | Wave 0 |
| SEC-06 | Smoke: `curl -N -X POST .../api/v2-chat ...` then kill after 100ms → server log shows stream aborted | integration (manual-only, documented) | `cd app && bash scripts/smoke/sec-06-disconnect.sh` (validated manually by observing request.id in Vercel logs) | Wave 0 |

### Fixtures/Mocks Needed

- **`mockSupabaseAnonSession(userId, options?)`** — returns a mock Supabase client whose `auth.getUser()` resolves to `{ user: { id, is_anonymous: true, ...opts } }`. Used by every route auth test.
- **`mockSupabaseAuthedSession(userId, { tier })`** — same but `is_anonymous: false` + associated subscription row for tier resolution.
- **`mockSupabaseAdmin(tableData)`** — mock `createAdminSupabase()` with a map of table → rows (for cron tests; matches existing `createAdminSupabase` pattern).
- **`mockAnthropicStream({ text, usage, abortBehavior })`** — mock `anthropic.messages.stream()` returning a `MessageStream`-shaped object with an `AbortController`, an async iterator of text deltas, and a way to simulate abort (respond to `controller.abort()` by emitting `APIUserAbortError`).
- **`mockAnthropicCountTokens({ input_tokens })`** — mock `client.messages.countTokens()` returning a fixed count. Variant: `mockAnthropicCountTokensProgression([...])` for multi-call budget-trim tests.
- **`mockUpstashRedis({ requests })`** — mock `isRateLimited()` to return `true` after N calls.
- **`freezeDate(isoString)`** — wraps `vi.setSystemTime()` so ULID generation is deterministic; alternatively, mock `ulid()` itself to return fixed values per test (follows `api-routes.test.ts` pattern of mocking `crypto.randomUUID`).
- **`captureConsoleLog()`** — helper that `vi.spyOn(console, "log")` and returns parsed JSON payloads emitted during the test. Asserts on all 7 fields for SEC-05.
- **`signalAbortAfter(ms)`** — creates a `Request` with an `AbortController.signal` that fires after N milliseconds, simulating client disconnect for SEC-06.

### Sampling Rate

- **Per task commit:** `cd app && npm test -- <the single test file touched by this task>` (< 30s per task)
- **Per wave merge:** `cd app && npm test` (full suite — ~90s with current 24 test files + new ~10)
- **Phase gate:** Full suite green + all three curl-smoke scripts exit 0 against a staging deployment with `PHASE_1_GATE_ENABLED=true`, before `/gsd:verify-work`.

### Wave 0 Gaps

All test files for Phase 1 are new. Wave 0 is substantial. Bootstrap items:

- [ ] `src/lib/schemas/sanitize.test.ts` — covers SEC-04 unit cases (6 test cases)
- [ ] `src/lib/schemas/coverage.test.ts` — covers SEC-04 schema-wide application
- [ ] `src/lib/services/prompt-builder.budget.test.ts` — covers SEC-03 (budget check, truncation, 413)
- [ ] `src/lib/quota.test.ts` — covers SEC-02 (tier resolution, ledger increment, check)
- [ ] `src/lib/observability.test.ts` — covers SEC-05 wrapper unit-level
- [ ] `src/lib/ulid.test.ts` — covers ULID format + monotonicity (smoke)
- [ ] `src/app/api/v2-chat/route.auth.test.ts` — covers SEC-01 for v2-chat
- [ ] `src/app/api/v2-chat/route.quota.test.ts` — covers SEC-02 for v2-chat (anon/free/operate tiers)
- [ ] `src/app/api/v2-chat/route.log.test.ts` — covers SEC-05 for v2-chat
- [ ] `src/app/api/v2-chat/route.abort.test.ts` — covers SEC-06
- [ ] `src/app/api/sheet/route.auth.test.ts` — covers SEC-01 for sheet (+ cron bypass case)
- [ ] `src/app/api/cron/morning-sheet/route.log.test.ts` — covers SEC-05 cron-identity case
- [ ] `src/__tests__/observability-coverage.test.ts` — asserts every route under `app/api/**` that imports `@anthropic-ai/sdk` also imports `withObservability`
- [ ] `src/__tests__/fixtures/mock-supabase.ts` — shared auth-session mocks
- [ ] `src/__tests__/fixtures/mock-anthropic.ts` — shared SDK mocks (including `countTokens` and stream abort)
- [ ] `src/__tests__/fixtures/capture-log.ts` — helper for asserting structured log payloads
- [ ] `scripts/smoke/sec-01-curl.sh` — curl smoke for SEC-01
- [ ] `scripts/smoke/sec-02-quota.sh` — curl smoke for SEC-02
- [ ] `scripts/smoke/sec-04-injection.sh` — curl smoke for SEC-04
- [ ] `scripts/smoke/sec-06-disconnect.sh` — curl smoke for SEC-06 (manual observation)
- [ ] `app/supabase/migrations/016_user_quotas.sql` — migration file (tiers seed + ledger + RPC)

No framework install needed — Vitest is already set up.

### Coverage Matrix

| Requirement | Unit | Integration (route) | Smoke (curl) | Manual? |
|-------------|------|---------------------|--------------|---------|
| SEC-01 | — | route.auth.test.ts (v2-chat, sheet) | sec-01-curl.sh | — |
| SEC-02 | quota.test.ts | route.quota.test.ts (v2-chat) | sec-02-quota.sh | — |
| SEC-03 | prompt-builder.budget.test.ts | — | — | — |
| SEC-04 | sanitize.test.ts, coverage.test.ts | (via parseBody in existing route tests) | sec-04-injection.sh | — |
| SEC-05 | observability.test.ts | route.log.test.ts (v2-chat), route.log.test.ts (cron) | — | — |
| SEC-06 | — | route.abort.test.ts (v2-chat) | sec-06-disconnect.sh | Yes — final verification via `curl -N` + observing Vercel logs (APIUserAbortError presence) |

## Sources

### Primary (HIGH confidence)

- Anthropic official docs — Models Overview: https://platform.claude.com/docs/en/about-claude/models/overview (verified 2026-04-18; confirms Sonnet 4 deprecation 2026-06-15, context windows, max output)
- Anthropic official docs — Token Counting: https://platform.claude.com/docs/en/build-with-claude/token-counting (verified 2026-04-18; confirms `client.messages.countTokens()` signature, pricing model, rate limits)
- Anthropic SDK source — `@anthropic-ai/sdk/src/lib/MessageStream.ts` (installed at `app/node_modules/@anthropic-ai/sdk`; line 57 confirms `controller: AbortController = new AbortController()`, line 242 confirms `abort()` method, lines 196–205 confirm `signal` option threading)
- Supabase official docs — Anonymous Sign-Ins guide: https://supabase.com/docs/guides/auth/auth-anonymous (verified 2026-04-18; confirms `signInAnonymously()` returns authenticated user with `is_anonymous` claim, `updateUser({ email })` as correct conversion path, known caching pitfall)
- Supabase official docs — Identity Linking guide: https://supabase.com/docs/guides/auth/auth-identity-linking (verified 2026-04-18; confirms `linkIdentity` is OAuth-only, corrects CONTEXT.md's email-provider assumption)
- Existing codebase — `app/src/lib/api-error.ts`, `app/src/lib/schemas/parse.ts`, `app/src/lib/rate-limit.ts`, `app/src/lib/supabase*.ts`, `app/src/app/api/v2-chat/route.ts`, `app/src/app/api/sheet/route.ts`, `app/src/app/api/canvas-regenerate/route.ts`, `app/src/components/shared/AuthModal.tsx`, `app/src/components/shared/AuthProvider.tsx`, `app/vitest.config.ts`, `app/src/app/api/sheet/route.test.ts`, `app/src/__tests__/api-routes.test.ts`
- `app/package.json` — confirmed SDK versions: `@anthropic-ai/sdk ^0.78.0`, `@supabase/ssr ^0.9.0`, `@supabase/supabase-js ^2.99.2`, `zod ^4.3.6`, `@upstash/redis ^1.37.0`, `vitest ^4.1.0`, `next 16.1.6`

### Secondary (MEDIUM confidence)

- npm ulid package: https://www.npmjs.com/package/ulid (size ~2KB, standard choice for sortable IDs)
- Supabase GitHub issue #29350 (updateUser on anonymous sign-in automatically verifies email) — surfaced as Pitfall 4
- Supabase auth issue #1578 (updateUser vs admin.updateUserById behavior with Anonymous Users) — informs the edge-case warning
- Propel blog "Token Counting Explained" (2025) — corroborates `@anthropic-ai/tokenizer` inaccuracy for Claude 3+
- go-tools.org UUID comparison guide (2026) — confirms UUIDv7 as emerging successor to ULID; confirms functional equivalence

### Tertiary (LOW confidence — flagged for validation)

- Vercel log retention tier details (1h on Hobby, 1d on Pro) — based on general search results, not verified against current Vercel docs during this research session. Planner should confirm before finalizing cost-rollup cadence.

## Metadata

**Confidence breakdown:**

- Standard stack (SDKs, versions): HIGH — all versions verified against installed `package.json`.
- Anthropic token-counting + model limits: HIGH — official Anthropic docs fetched 2026-04-18.
- Anthropic stream abort: HIGH — SDK source code read line-by-line; `MessageStream.controller` + `.abort()` confirmed.
- Supabase anon auth + updateUser path: HIGH — official Supabase docs fetched and cross-verified.
- Supabase linkIdentity correction: HIGH — official docs clearly state OAuth-only.
- ULID choice: MEDIUM — CONTEXT.md locked, and ULID is solid; UUIDv7 is a slightly newer alternative but ULID is fully equivalent for this use case.
- Vercel log retention specifics: LOW — based on general search, not on freshly-fetched Vercel docs.
- Zod 4.3 `.superRefine` semantics: HIGH — standard Zod API, stable since v3.
- `@anthropic-ai/tokenizer` deprecation status: MEDIUM — not explicitly deprecated on npm but Anthropic's own guidance says inaccurate. Treat as "use the API instead."

**Research date:** 2026-04-18
**Valid until:** 2026-05-18 (30 days; flag model-id deprecation timer — Sonnet 4 retires 2026-06-15 regardless).

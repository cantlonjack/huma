# Phase 1: Security & Cost Control (Plan P0) - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning
**Decision mode:** Claude's Discretion under user directive "maximize UX flow + security"

<domain>
## Phase Boundary

Security + cost-control primitives across every Anthropic-calling route: auth gate, per-user quota ledger, token budget with tail-first truncation, prompt-injection sanitizer, structured JSON logging, and SSE disconnect handling. Fully delivers SEC-01 through SEC-06. Nothing ships after this phase until it lands.

**Included routes:** `/api/v2-chat`, `/api/sheet`, `/api/insight`, `/api/whole-compute`, `/api/nudge`, `/api/palette`, `/api/reflection`, `/api/decompose`, `/api/weekly-review`, `/api/canvas-regenerate`, and `/api/cron/morning-sheet`.

**Success gate:** Unauthenticated `curl` to `/api/v2-chat` and `/api/sheet` returns 401 (cron path with `CRON_SECRET` still passes); per-user tier quotas enforced; prompts over budget truncated tail-first with warning header; `[[`/`]]` rejected with 400; every route emits structured JSON log with the seven required fields; SSE stream aborts Anthropic dispatch on client disconnect.

</domain>

<decisions>
## Implementation Decisions

### Pre-auth gate — anonymous session via Supabase
- **Use `supabase.auth.signInAnonymously()` on `/start` page load** — anonymous auth issues a real but emailless user, so every message carries a `user_id` from the first keystroke. Quota ledger, rate limits, and structured logs work uniformly across anon/free/Operate tiers.
- When the user later enters an email through the existing `AuthModal` magic-link flow, call `auth.linkIdentity({ provider: "email", email })` to merge the anonymous session into a real account — conversation state, aspirations, and ledger history preserved intact.
- **Why this over alternatives:**
  - Magic-link interstitial before first message breaks time-to-first-aha (Phase 3 goal).
  - Server-issued preview-token JWT is explicitly out-of-scope (PROJECT.md — saves ~2 days of infra).
  - HTTP-only anon cookie would sidestep Supabase auth entirely and force a parallel identity system.
- **Belt-and-suspenders:** keep an IP-based secondary rate limit (Upstash Redis, ~20 req/min/IP on `/api/v2-chat` and `/api/sheet`) as a cheap secondary defense against cookie-clearing anon-user rotation.

### Rate-limit-hit UX — hard 429 + respectful client card
- **Hard 429 with a structured body** extending `ApiErrorBody`:
  ```json
  { "error": "…", "code": "RATE_LIMITED", "tier": "anonymous|free|operate", "resetAt": "<ISO>", "suggest": "sign_in|upgrade_operate|wait" }
  ```
- **Client intercepts 429 and renders `<QuotaCard>`** (new component) with Voice Bible-compliant per-tier copy:
  - Anonymous: "The free ground holds five conversations a day. Drop your email and the rest opens."
  - Free: "You've worked through today's ten. Tomorrow restarts, or Operate lifts the line."
  - Operate (rare): "You've hit today's ceiling. Reach out — we'll figure it out together."
- **No silent drops, no cached-briefing misdirection.** If a stream has already begun when the cap trips, close it gracefully with a one-line prose ending, not a truncation error.
- Copy must pass Voice Bible §02 banned-phrase review before landing.

### Observability — console JSON → Vercel log ingestion
- **Phase 1 ships `console.log(JSON.stringify(…))` → Vercel automatic log ingestion.** Free, searchable in the Vercel Dashboard, zero external dependencies.
- **Log payload** (all 7 required fields + source tag):
  ```json
  { "req_id": "<ULID>", "user_id": "<uuid|null>", "route": "/api/v2-chat", "prompt_tokens": 12345, "output_tokens": 678, "latency_ms": 2341, "status": 200, "source": "user|cron|system" }
  ```
- **Cost aggregation:** a nightly cron (`/api/cron/cost-rollup`, added this phase) scans the last 24h of logs via Vercel Log API and writes per-user + per-route totals to a new `cost_metrics` table. Drives future `/internal/cost` dashboard.
- **Alerts:** Vercel → Slack integration for error rate > 2% or p99 latency > 10s. Anthropic cost alert (>$10/hour) via cost-rollup cron checking thresholds and posting to a webhook.
- **Defer** upgrade to Better Stack / Logtail / Axiom until log volume justifies it (post-Phase 6 pricing infra). Structured-JSON format means the drain swap is a 1-line change.

### Sanitizer placement — two-layer defense-in-depth
- **Layer 1 — `lib/schemas/sanitize.ts`** — exports `sanitizeUserText(s: string): { value: string; rejected?: "markers" | "injection" }`. Implements all four rejections from SEC-04:
  - Reject any string containing `[[` or `]]` (marker delimiters) → `rejected: "markers"`.
  - Strip leading "ignore previous instructions" patterns (short Jackson-style list, not a paranoid regex wall).
  - NFC-normalize input.
  - Strip zero-width characters (U+200B, U+200C, U+200D, U+FEFF, etc.).
- **Layer 2 — Zod schema refinement** on every user-text field. Schemas import `sanitizeUserText` and call it inside `.refine()`. `parseBody(request, schema)` automatically returns 400 for injected input before the route body runs — impossible to forget on a new route.
- **Applies to** `v2ChatSchema.messages[].content`, `aspirations[].rawText`, `humaContext.*` text fields, reflection text, sheet check-off `note`, nudge input, any other user-written string interpolated into a prompt.
- **Rejected alternative:** inline sanitization inside `prompt-builder.ts` — too easy to forget as new routes get added in later phases.

### Token truncation scope — messages-tail only, keep context intact
- **Trim `messages[]` oldest-first** until total prompt tokens fit under 80K (Sonnet) / 150K (ceiling).
- **Keep `humaContext` untouched** — it's small, crafted, and load-bearing for quality. If prompt still exceeds budget after a full messages trim → 413 with Voice-Bible response: "This thread's gotten long. Start a new one — I'll catch you up from your shape."
- **Warning header** `X-Huma-Truncated: count=N,reason=budget` emitted whenever any trim happens.
- **Token counting** via `@anthropic-ai/tokenizer` server-side estimate (acceptable margin; Anthropic API returns true usage in streaming metadata for reconciliation).

### Cron identity — bypass quota, still log
- `/api/cron/morning-sheet` bypasses quota (CRON_SECRET authorized per SEC-01).
- **Emits a structured log per run** with `user_id = <operator's real id>` and `source: "cron"` — per-operator cost visibility preserved without double-charging their user quota.
- A system-level cron log also emits `{ user_id: null, source: "cron", operator_count: <N> }` for aggregate visibility.
- Cost-rollup cron (`/api/cron/cost-rollup`) gets the same treatment: bypasses quota, logs with `source: "system"`.

### Rollout — single atomic feature flag
- **Single atomic PR batch** deploys all of SEC-01..SEC-06, gated behind `PHASE_1_GATE_ENABLED` env var defaulting to `false`.
- **Plans may split per requirement** (up to 6 plans) for parallel execution, but a final "enablement" plan flips the flag only after all 6 plans merge + the 016 migration is applied to Supabase.
- **Enablement sequence:**
  1. Apply `016_user_quotas.sql` via Supabase dashboard SQL editor.
  2. Verify seed rows exist (`SELECT count(*) FROM user_quotas_tiers` returns 3).
  3. Flip `PHASE_1_GATE_ENABLED=true` in Vercel production env.
  4. Smoke-test three curls:
     - Anonymous curl without session → 401.
     - Auth'd curl with valid session → 200.
     - Curl with `[[` in body → 400.
- **Rollback plan:** one-click revert by flipping `PHASE_1_GATE_ENABLED=false` in Vercel — no code revert needed.

### Request ID format — ULID
- **ULID** (26 chars, lexicographically sortable, millisecond-precision timestamp prefix). Matches P0.5 plan intent; `ulid` npm package is ~2 KB.

### Claude's Discretion
- Exact `<QuotaCard>` visual design (follows existing card patterns in `/whole` and `/today`).
- Internal implementation of the cost-rollup cron query (Vercel Log API vs. direct log scraping).
- Exact IP-fallback Upstash rate-limit key schema and window sizing.
- Error-code surfacing in PostHog (deferred until Phase 4 PostHog wiring lands).
- Structured log library choice (custom formatter vs. `pino` vs. raw `console.log(JSON.stringify(…))`).

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`app/src/lib/api-error.ts`** — standardized `ApiErrorBody` with `UNAUTHORIZED` code already defined; add `unauthorized()` helper and extend `rateLimited()` signature to accept `{ tier, resetAt, suggest }`.
- **`app/src/lib/schemas/parse.ts`** — `parseBody(request, zodSchema)` wrapper used by every route; clean injection point for sanitizer refinements.
- **`app/src/lib/schemas/index.ts`** — existing `v2ChatSchema`, `sheetSchema`, etc.; extend each with sanitizer `.refine()` calls on user-text fields.
- **Supabase server client pattern** — already used in 10 routes (`canvas-regenerate`, `events`, `maps`, `reflection`, `sheet/check`, `weekly-review`, `auth/callback`, `push/subscribe`, `sheet/share`, `maps/[id]`). Import the same helper into `v2-chat` and `sheet`.
- **Upstash Redis client** — already configured and used by current `app/src/lib/rate-limit.ts`. Keep for the IP secondary cap; replace primary per-user logic with the Supabase ledger.
- **`app/src/lib/services/prompt-builder.ts`** — single chokepoint for prompt assembly; natural location for the pre-dispatch token-budget check (`budgetCheck(prompt, limit)` helper).
- **`AuthModal.tsx:15`** — existing `signInWithMagicLink` call; add `linkIdentity` branch for anon → magic-link upgrade.

### Established Patterns
- **All routes use `parseBody(request, schema)`** — sanitizer integrates via Zod refinement, no new middleware layer required.
- **Migrations are manual via Supabase dashboard SQL editor** (PROJECT.md constraint) — `016_user_quotas.sql` is added; PR description must call out "migration required before enabling `PHASE_1_GATE_ENABLED`."
- **Errors return `Response.json(body, { status })`** via `apiError()` — preserve this shape so existing clients keep working.
- **Streaming uses `ReadableStream`** wrapping `anthropic.messages.stream()` — wire `request.signal.aborted` into the controller for SSE-disconnect abort (SEC-06).
- **Never-rewrite constraint** (PROJECT.md) — surgical edits to existing route files; no full rewrites of `v2-chat/route.ts`, `sheet/route.ts`, or `AuthModal.tsx`.

### Integration Points
- **`/start` page mount** — call `auth.signInAnonymously()` if no session exists. Touches `app/src/hooks/useStart.ts` and the start-page component.
- **Chat client code** — intercept 429 responses globally (fetch wrapper or a response interceptor), render `<QuotaCard>` in a dismissible overlay. Touches `app/src/hooks/useMessageStream.ts` and related hooks.
- **Every Anthropic-calling route** — wrap body in a `withObservability(req, route, async () => {…})` helper that generates the req_id (ULID), times the call, emits the JSON log on entry and exit, and forwards the response.
- **`app/src/lib/services/prompt-builder.ts`** — add `budgetCheck({ prompt, limit })` called before `anthropic.messages.stream()` in every route.
- **`app/supabase/migrations/`** — next migration number is `016_user_quotas.sql` (current latest is `015_weekly_reviews_v2.sql`); matches the plan.

### Creative Options Enabled
- Zod refinement + `parseBody` makes the sanitizer near-invisible to route authors — adding a new route gets prompt-injection defense for free.
- Anonymous auth means `/start` stays single-input (no email gate) — keeps time-to-first-aha under 90s (Phase 3 gate unaffected).
- Atomic feature-flag rollout lets Phase 2 and Phase 3 parallelize: their plans can land while Phase 1 is being tested, enabled only after the gate flips.
- Structured JSON logs + `source` tag (`user|cron|system`) enable per-cron cost attribution without complicating the main request path.

</code_context>

<specifics>
## Specific Ideas

- **Voice Bible compliance on quota-hit copy** — draft strings live in the Rate-limit-hit UX decision; run through Voice Bible §02 banned-phrase check before landing. No shame copy, no rush tactics (per Ethical Framework §03).
- **Single env var for atomic enablement** — `PHASE_1_GATE_ENABLED` as the kill-switch. One-click rollback via Vercel env change if anything regresses.
- **Belt-and-suspenders IP fallback** — Upstash IP rate-limit stays as a secondary defense (anon users can rotate `user_id` by clearing cookies). Scoped only to pre-auth endpoints to avoid penalizing shared-IP auth'd users.
- **Prefer `pino` if it's already a transitive dep; else `console.log(JSON.stringify(…))`** — avoid pulling a new dep for Phase 1; researcher/planner can verify during planning.

</specifics>

<deferred>
## Deferred Ideas

- **Upgrade log destination to Better Stack / Logtail / Axiom** — post-Phase 6 (pricing infra) when log volume and revenue justify paid observability.
- **`/internal/cost` dashboard UI** — the cron + `cost_metrics` table ship in Phase 1; dashboard UI can follow once there's data to render (likely Phase 4 or 5).
- **Anonymous user cleanup cron** — prune `auth.users` rows with `is_anonymous=true` and no activity in 30 days. Not blocking; add in Phase 2 or later.
- **Anthropic output sanitization** — defending against a jailbroken model emitting spoofed markers. Input-only is the plan's intent; revisit if Phase 2-8 marker parsing surfaces issues.
- **PostHog instrumentation of security events** — quota-hit, injection-attempt, SSE-abort events — deferred to Phase 4 (Landing & Funnel Instrumentation) since PostHog isn't wired until then.
- **Redis-based distributed quota enforcement** — Supabase ledger is adequate for current scale; Redis/atomic-counter approach is a Phase 6+ scaling move if quota-check latency becomes noticeable.

</deferred>

---

*Phase: 01-security-cost-control*
*Context gathered: 2026-04-18*

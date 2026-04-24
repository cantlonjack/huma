---
phase: 01-security-cost-control
plan: 02
subsystem: api
tags: [quota, rate-limit, supabase, postgres, rpc, rls, react, voice-bible]

# Dependency graph
requires:
  - phase: 01-security-cost-control
    provides: "Plan 00 fixtures — mock-supabase chainable stub, mock-anthropic stream, capture-log helper"
  - phase: 01-security-cost-control
    provides: "Plan 01 auth-gate — requireUser + ctx.user/ctx.isCron surface; extended api-error.ts with ApiErrorBody tier/resetAt/suggest fields"
provides:
  - "app/src/lib/quota.ts — resolveTier(userId) + checkAndIncrement(userId, route, inputTokens, reqId?) server helpers"
  - "app/supabase/migrations/016_user_quotas.sql — user_quotas_tiers seed (3 rows), user_quota_ledger table + RLS, increment_quota_and_check() RPC"
  - "app/src/components/shared/QuotaCard.tsx — Voice-Bible tier overlay ('fifty' for free)"
  - "app/src/hooks/useMessageStream.ts — 429 intercept + quotaLimit/setQuotaLimit state"
  - "app/scripts/smoke/sec-02-quota.sh — anon 5-ok-then-429 integration smoke"
  - "app/src/lib/api-error.ts — rateLimited() overload accepting {tier, resetAt, suggest, message}; zero-arg form preserved"
  - "Route wiring: /api/v2-chat + /api/sheet call checkAndIncrement after auth, before Anthropic"
  - "CONTEXT.md clarification note — 'ten' was illustrative; actual spec is 50/day (Blocker 5)"
affects:
  - "01-03-token-budget — budgetCheck() will run BEFORE checkAndIncrement and supply accurate inputTokens (Blocker 6 contract)"
  - "01-05c-observability-streaming — v2-chat finally-path will UPDATE user_quota_ledger.token_count += output_tokens keyed on req_id"
  - "01-07-enablement — migration 016 must be applied via Supabase dashboard before PHASE_1_GATE_ENABLED flips to true"
  - "Phase 6 PRICE-01 — subscriptions table creation will let resolveTier return 'operate' for paying customers"

# Tech tracking
tech-stack:
  added: []  # No new npm deps; all tech already present (supabase, react, vitest)
  patterns:
    - "Atomic quota enforcement via SECURITY DEFINER RPC with FOR UPDATE row lock — SQL-level consistency, not app-level retry loop"
    - "Fail-open on RPC error — availability beats cost correctness when the ledger is down (explicit trade-off documented in quota.ts)"
    - "Denial-response contract: 429 body carries {code, tier, resetAt, suggest} so the client can render tier-aware copy without second trip"
    - "Client interception BEFORE generic error path — quota-hit is a first-class UX state, not an exception to handle"
    - "Cron + null-user short-circuit before quota check — cron must not deplete operator quotas, pre-flag-flip shim has no id to key against"

key-files:
  created:
    - "app/src/lib/quota.ts (~140 lines) — resolveTier + checkAndIncrement + QuotaTier/QuotaCheckResult types"
    - "app/supabase/migrations/016_user_quotas.sql (~135 lines) — tiers seed, ledger table + RLS, increment_quota_and_check RPC"
    - "app/src/components/shared/QuotaCard.tsx (~180 lines) — overlay with tier-aware copy + Voice-Bible compliant strings"
    - "app/scripts/smoke/sec-02-quota.sh (~110 lines) — anon 5-then-429 curl smoke with structured body assertions"
  modified:
    - "app/src/lib/api-error.ts — rateLimited() now accepts optional {tier, resetAt, suggest, message}; zero-arg call preserved for back-compat"
    - "app/src/hooks/useMessageStream.ts — 429 intercept + quotaLimit/setQuotaLimit exposed on hook return"
    - "app/src/app/api/v2-chat/route.ts — checkAndIncrement call after auth + IP-limit, before parseBody"
    - "app/src/app/api/sheet/route.ts — checkAndIncrement call after auth + IP-limit, before parseBody"
    - "app/src/app/api/v2-chat/route.auth.test.ts — mockQuotaAllowAll helper for tests that traverse quota path"
    - "app/src/app/api/v2-chat/route.abort.test.ts — mockQuotaAllowAll helper across 4 abort-mechanics tests"
    - "app/src/app/api/sheet/route.auth.test.ts — mockQuotaAllowAll helper for anon + permanent-user flows"
    - "app/src/lib/quota.test.ts — typed rpc mock signature so .mock.calls[0] destructures [name, args]"
    - ".planning/phases/01-security-cost-control/01-CONTEXT.md — one-line clarification note (Blocker 5)"

key-decisions:
  - "Route wiring landed in Plan 02 rather than deferring to Plan 03. The user's resumption instructions called for both v2-chat and sheet to carry checkAndIncrement now, with inputTokens=0 as the interim contract. Plan 03 will hoist budgetCheck() above the quota call and supply the accurate token count."
  - "inputTokens=0 interim wiring — enforces request-count limits today and leaves token limits inactive until Plan 03 ships. Blocker 6 rejects the estChars/4 heuristic outright; a partial enforcement now is honest about what it measures."
  - "Fail open on RPC error (not fail closed). A dead ledger must not black-hole user requests — availability > cost correctness. This is a one-line behavior choice in quota.ts with a console.error so the outage is still visible."
  - "SECURITY DEFINER RPC with FOR UPDATE row lock for atomic increment. Chose SQL-level consistency over app-side retry loops — a single function call is the whole transaction."
  - "Cron skip + null-user skip in the route call sites (not inside quota.ts). This keeps the helper pure and lets future routes decide whether their path is user-scoped or system-scoped."
  - "req_id column on user_quota_ledger is nullable and populated only when caller supplies it. Plan 05c's output-token reconciliation UPDATE can key on req_id via the partial index (req_id IS NOT NULL) without blocking Plan 02 landing standalone."
  - "Full QuotaCard inline styles (no CSS modules). Component drops into any page via a single import and carries no ambient-stylesheet assumptions. Matches AuthModal/ShareCard pattern in the shared/ directory."
  - "CTA dispatches huma:open-auth-modal event (anonymous) / redirects to /pricing (free) — the anonymous→email path reuses SEC-01's AuthModal + linkIdentity chain; /pricing is a placeholder until Phase 6 PRICE-01 ships."
  - "Route-test mockQuotaAllowAll helper pattern — three route test files gained a small local helper rather than extracting a shared fixture. Each helper is ~15 lines and co-located with its test intent; fixture extraction can happen in a later parallelization retro if it recurs."

patterns-established:
  - "Explicit per-file git add policy for parallel waves — STATE.md cross-contamination blocker from prior Wave 1 agents reinforces that git add <specific-path> is the standard"
  - "Denial 429 body as a UX contract — tier/resetAt/suggest fields shipped by ApiErrorBody, consumed by QuotaCard. Future routes use rateLimited({...}) instead of inventing ad-hoc error shapes"
  - "Client hook intercept pattern — useMessageStream now shows how to parse a structured 4xx body before falling through to the generic error UX. Reusable shape for future security-state UX (injection rejection overlay, payload-too-large overlay)"

requirements-completed: [SEC-02]

# Metrics
duration: 15min
completed: 2026-04-19
---

# Phase 1 Plan 02: Quota Ledger Summary

**Per-user tier-aware quota ledger with atomic Supabase RPC, Voice-Bible QuotaCard overlay, structured 429 body contract, and v2-chat/sheet route wiring — request-count enforcement live today, token-count active once Plan 03 supplies accurate inputTokens.**

## Performance

- **Duration:** ~15 min active execution (RED phase landed 2026-04-19 03:52 EDT; resumption 07:28-07:39 EDT after a mid-flight disconnect)
- **Started:** 2026-04-19T07:28:48Z (resumption)
- **Completed:** 2026-04-19T07:39:20Z
- **Tasks:** 3 (Task 0 context, Task 1 RED+GREEN, Task 2 wiring+UI+smoke)
- **Files created:** 4 (`quota.ts`, `016_user_quotas.sql`, `QuotaCard.tsx`, `sec-02-quota.sh`)
- **Files modified:** 8 (`api-error.ts`, `quota.test.ts`, 2 route handlers, 3 route test files, `useMessageStream.ts`)

## Accomplishments

- **SEC-02 delivered end-to-end** — migration + server lib + client overlay + route wiring + smoke. Once migration 016 is applied and `PHASE_1_GATE_ENABLED=true`, anonymous users hit 429 on the 6th request, free-tier on the 51st, operate-tier on the 501st.
- **Blocker 5 closed** — CONTEXT.md gained the "'ten' was illustrative, actual spec is 50/day" clarification; QuotaCard free-tier copy says "fifty" to match.
- **Blocker 6 honored** — `checkAndIncrement(userId, route, inputTokens, reqId?)` accepts accurate `inputTokens` from Plan 03's future `budgetCheck()`. No internal `estChars/4` heuristic anywhere. Until Plan 03 lands, routes pass `0` — request-count enforcement works, token-count enforcement is a no-op. This is intentional and documented at each call site.
- **Plan 05c unblocked** — `req_id` column on `user_quota_ledger` with a partial index on `req_id IS NOT NULL` lets the streaming finally-path reconcile output tokens via a secondary `UPDATE` keyed on req_id.
- **Route wiring landed** per user's resumption instruction — both `/api/v2-chat` and `/api/sheet` call `checkAndIncrement` after auth + IP-limit, before parseBody. Cron and null-user paths short-circuit cleanly.
- **9/9 quota unit tests green** (RED phase 9 failing → GREEN 9 passing). Full 624-test suite remains green.

## Task Commits

1. **Task 0: CONTEXT.md clarification** — `f042c68` (docs) — pre-existing before resumption
2. **Task 1 RED: failing tests** — `d3886a1` (test) — pre-existing before resumption (swept in `sanitize.*`, `ulid.test.ts`, `package*.json` from parallel agents; acknowledged in 01-05a SUMMARY)
3. **Task 1 GREEN: quota.ts + migration 016 + rateLimited overload** — `60775e7` (feat)
4. **Task 2 route wiring: v2-chat + sheet checkAndIncrement** — `dec5006` (feat)
5. **Task 2 UI: QuotaCard + useMessageStream 429 intercept + smoke** — `6d9c847` (feat)

**Plan metadata:** will be the final docs commit after this SUMMARY lands.

## Files Created/Modified

- `app/src/lib/quota.ts` (~140 lines) — `resolveTier(userId)` walks anon→operate→free; `checkAndIncrement(userId, route, inputTokens, reqId?)` calls `increment_quota_and_check` RPC, returns `{allowed, tier, resetAt, reqCount, tokenCount, suggest}`. Fails open on RPC error.
- `app/supabase/migrations/016_user_quotas.sql` (~135 lines) — `user_quotas_tiers` seed (3 rows), `user_quota_ledger` table with RLS + `req_id` column + partial index, `increment_quota_and_check()` RPC with `FOR UPDATE` row lock. Manual apply via Supabase dashboard per PROJECT.md.
- `app/src/components/shared/QuotaCard.tsx` (~180 lines) — dialog overlay; tier-aware copy with `"fifty"` for free tier; CTA dispatches `huma:open-auth-modal` (anon) or redirects to `/pricing` (free); operate tier has no CTA per Voice Bible §02.
- `app/scripts/smoke/sec-02-quota.sh` (~110 lines) — anon 5-OK-then-429 curl smoke; asserts body shape `{code:"RATE_LIMITED", tier:"anonymous", suggest:"sign_in", resetAt:"..."}` via tolerant grep (no jq dep).
- `app/src/lib/api-error.ts` — `rateLimited({tier, resetAt, suggest, message})` overload; zero-arg form preserved for the legacy IP-throttle call sites in v2-chat and sheet.
- `app/src/hooks/useMessageStream.ts` — parses structured 429 body BEFORE the generic error branch; exposes `quotaLimit` + `setQuotaLimit` on the hook return; existing streaming path and error UX unchanged.
- `app/src/app/api/v2-chat/route.ts` — `checkAndIncrement(ctx.user.id, "/api/v2-chat", 0)` after auth + IP-limit, denies return `rateLimited({tier, resetAt, suggest})`.
- `app/src/app/api/sheet/route.ts` — same quota wiring for the sheet-compile route.
- `app/src/app/api/v2-chat/route.auth.test.ts`, `route.abort.test.ts`, `app/src/app/api/sheet/route.auth.test.ts` — `mockQuotaAllowAll` helpers added to each, wired into flows that traverse the post-auth quota path (anon, permanent-user).
- `app/src/lib/quota.test.ts` — one-line typing refinement: `vi.fn<(name: string, args: Record<string, unknown>) => ...>` so `rpc.mock.calls[0]` destructures into a `[name, args]` tuple instead of `[]`.
- `.planning/phases/01-security-cost-control/01-CONTEXT.md` — one-line clarification note under the Rate-limit-hit UX decision (Blocker 5).

## Decisions Made

See the `key-decisions` frontmatter block above for the full set. Highlights:

- **Route wiring landed in Plan 02** (not deferred to Plan 03) per user's resumption instruction. `inputTokens=0` is the interim contract until Plan 03 hoists `budgetCheck()` above the quota call.
- **Fail open on RPC error** — availability > cost correctness when the ledger itself is down. Documented at both `quota.ts`'s `checkAndIncrement` and the must_haves in the plan frontmatter.
- **Atomic enforcement via `SECURITY DEFINER` RPC with `FOR UPDATE`** — SQL-level consistency beats app-side retry loops.
- **Three route-test helpers instead of a shared fixture** — each `mockQuotaAllowAll` is ~15 lines; fixture extraction can wait until a fourth consumer shows up.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Route wiring was labeled "deferred to Plan 03" by the plan text, but the user's resumption objective required it landing in Plan 02.**
- **Found during:** Task 2 start
- **Issue:** The plan's `<behavior>` block on Task 2 said "Route wiring deferred: This plan does NOT edit v2-chat/route.ts. Plan 03 owns the route ordering." The user's explicit resumption instruction overrode this: "integrate checkAndIncrement into /api/v2-chat route and /api/sheet route (both are already auth-gated from 01-01; add the quota check AFTER auth succeeds, BEFORE calling Anthropic)."
- **Fix:** Added explicit `checkAndIncrement(ctx.user.id, "/api/v2-chat", 0)` and sheet-equivalent calls after auth + IP-limit, before parseBody. Passed `inputTokens=0` so request-count limits are enforced while preserving Plan 03's contract (no internal estimation — Blocker 6).
- **Files modified:** `app/src/app/api/v2-chat/route.ts`, `app/src/app/api/sheet/route.ts`
- **Verification:** All 14 API route tests green; full 624-test suite green; type-check clean.
- **Committed in:** `dec5006`

**2. [Rule 1 - Bug] Route tests blew up on `createAdminSupabase` because no mock was registered.**
- **Found during:** Task 2, immediately after route wiring compiled
- **Issue:** Three test files (v2-chat auth, v2-chat abort, sheet auth) traverse a ctx-with-user path with `PHASE_1_GATE_ENABLED=true`. My new quota call invoked `createAdminSupabase()`, which tried to read `SUPABASE_SERVICE_ROLE_KEY`/`NEXT_PUBLIC_SUPABASE_URL` from env and threw `Missing SUPABASE_SERVICE_ROLE_KEY...`. 8 tests failing.
- **Fix:** Added `mockQuotaAllowAll()` helper to each of the three test files. Each helper `vi.doMock`s `@/lib/supabase-admin` to return an admin stub whose `.rpc()` resolves with `{allowed: true, tier: "free"|"anonymous", reset_at, req_count, token_count}`. Helpers are ~15 lines, co-located with their test intent.
- **Files modified:** `app/src/app/api/v2-chat/route.auth.test.ts`, `app/src/app/api/v2-chat/route.abort.test.ts`, `app/src/app/api/sheet/route.auth.test.ts`
- **Verification:** 14/14 API route tests green, full 624-test suite green.
- **Committed in:** `dec5006` (bundled with the route wiring commit)

**3. [Rule 1 - Bug] TypeScript tuple typing on `rpc.mock.calls[0]` in the RED commit.**
- **Found during:** Task 1 GREEN, first `tsc --noEmit` run
- **Issue:** `vi.fn(async () => ...)` defaults to a `[]` parameter tuple. The test at `quota.test.ts:140` destructured `rpc.mock.calls[0]` into `[name, args]`, which TS rejected as indexing an empty tuple. Runtime was fine; typing was not.
- **Fix:** Added an explicit generic to `vi.fn<(name: string, args: Record<string, unknown>) => ...>`. Surgical one-block edit in the test file.
- **Files modified:** `app/src/lib/quota.test.ts`
- **Verification:** `npx tsc --noEmit` clean (only the pre-existing `fixtures.test.ts` warning remains, tracked in `deferred-items.md` from Plan 01-00).
- **Committed in:** `60775e7` (bundled with Task 1 GREEN)

---

**Total deviations:** 3 auto-fixed (1 missing critical — route wiring scope revision, 2 bugs — route-test missing mock and tuple typing)
**Impact on plan:** All three deviations were necessary for correctness. The route-wiring scope revision was explicit user direction; the test-mock fix and typing fix closed regressions introduced by the wiring. No scope creep.

## Issues Encountered

**Cross-contamination from prior parallel-wave RED commit:** The RED commit `d3886a1` from the pre-disconnect session accidentally staged `app/src/lib/schemas/sanitize.ts`, `sanitize.test.ts`, `app/src/lib/ulid.test.ts`, and `app/package*.json` — files that belong to Plans 01-04 and 01-05a. Those plans are handling their own state (01-05a has already completed). Per the objective's cleanup note, no action was taken on those files — they remain committed and 01-05a's SUMMARY acknowledges the sweep-in. Resumption followed strict per-file `git add` discipline for all three new commits (60775e7, dec5006, 6d9c847) to prevent any further contamination.

## User Setup Required

**Manual migration apply required before flag flip.** Plan 07 (enablement) gates the `PHASE_1_GATE_ENABLED=true` flip on:

1. Apply `app/supabase/migrations/016_user_quotas.sql` via the Supabase dashboard SQL editor.
2. Verify seed rows via `SELECT count(*) FROM user_quotas_tiers` (expect 3).
3. Verify RPC exists via `SELECT proname FROM pg_proc WHERE proname = 'increment_quota_and_check'` (expect 1 row).

Until the migration is applied, `checkAndIncrement` will fail-open (the fail-open path returns `allowed: true` and logs `[quota] increment_quota_and_check failed, allowing request: <error>`). Smoke script `app/scripts/smoke/sec-02-quota.sh` will NOT produce the expected 429 until the migration lands and `PHASE_1_GATE_ENABLED=true` is set.

## Next Phase Readiness

- **Plan 03 (token budget) unblocked** — `checkAndIncrement` signature accepts `inputTokens`. Plan 03 will hoist `budgetCheck()` above the existing quota call at each route and pass `budget.inputTokens` instead of `0`. No further changes to `quota.ts` needed.
- **Plan 05c (observability streaming) unblocked** — `user_quota_ledger.req_id` column + partial index ready. The finally-path in v2-chat can `UPDATE user_quota_ledger SET token_count = token_count + <output_tokens> WHERE req_id = <ULID>` after the stream closes.
- **Plan 07 (enablement) gate condition documented** — "Apply migration 016, verify seed rows + RPC, then flip `PHASE_1_GATE_ENABLED`". Rollback is still a one-flag toggle.
- **Phase 6 PRICE-01 unblocked on the tier resolution side** — once `subscriptions` table ships, `resolveTier` will return `"operate"` for paying users without any Plan 02 change.
- **No blockers** for Wave 1 continuation (Plan 03 token-budget, Plan 04 sanitizer) or Wave 2 (05b, 05c).

## Self-Check: PASSED

- Files on disk:
  - `app/src/lib/quota.ts`  FOUND
  - `app/supabase/migrations/016_user_quotas.sql`  FOUND
  - `app/src/components/shared/QuotaCard.tsx`  FOUND
  - `app/scripts/smoke/sec-02-quota.sh`  FOUND
  - `app/src/lib/quota.test.ts`  FOUND (typed rpc signature)
  - `app/src/lib/api-error.ts`  FOUND (rateLimited overload)
  - `app/src/hooks/useMessageStream.ts`  FOUND (429 intercept + quotaLimit state)
  - `app/src/app/api/v2-chat/route.ts`  FOUND (checkAndIncrement wired)
  - `app/src/app/api/sheet/route.ts`  FOUND (checkAndIncrement wired)
  - `.planning/phases/01-security-cost-control/01-02-quota-ledger-SUMMARY.md`  FOUND
- Commits in git log: `f042c68`, `d3886a1`, `60775e7`, `dec5006`, `6d9c847`  ALL FOUND
- Tests: 9/9 quota unit tests green; 624/624 full suite green
- Type-check: clean apart from pre-existing `fixtures.test.ts(22,59)` (tracked in `deferred-items.md` from Plan 01-00)
- Plan verification (from plan's `<verification>` block): `grep "illustrative"` matches 1 line, `grep "fifty"` matches 1 line in CONTEXT.md — PASS

---
*Phase: 01-security-cost-control*
*Completed: 2026-04-19*

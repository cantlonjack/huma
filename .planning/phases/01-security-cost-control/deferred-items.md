# Phase 01 Deferred Items

Out-of-scope discoveries made during plan execution. These are tracked for later cleanup but NOT auto-fixed by the current plan.

## From Plan 01-01 (auth-gate)

### TS error in fixtures.test.ts (line 22) — pre-existing

**File:** `app/src/__tests__/fixtures/fixtures.test.ts`

**Error:** `error TS2554: Expected 0 arguments, but got 2.` at line 22.

**Origin:** The chainable `.eq()` mock is typed as `() => chain` with 0 parameters, but the test calls `.eq("a", "b")` with 2 args. Tests still pass at runtime because `vi.fn()` accepts any args — this is purely a type mismatch.

**Why deferred:** This was introduced in commit `81682af` (Plan 01-00). Not caused by Plan 01-01 changes. The existing Vitest run passes 589/589 tests. Fix is a tiny types update on `mock-supabase.ts`'s `chainable()` builder.

**Suggested fix (for later):** Type the chain methods as `(...args: unknown[]) => ...` so they accept any call signature, matching Supabase's fluent API.

---

## From Plan 01-05c (observability-streaming)

### BudgetResult discriminated-union narrowing — pre-existing

**Files:** `app/src/app/api/v2-chat/route.ts`, `app/src/app/api/sheet/route.ts`

**Error:** `TS2339: Property 'messages'/'trimmedCount'/'inputTokens' does not exist on type 'BudgetResult | BudgetTooLarge'` at three lines each.

**Origin:** Plan 01-03's `budgetCheck()` returns a discriminated union. The `"tooLarge" in budget && budget.tooLarge` guard narrows semantically but doesn't satisfy TypeScript's structural narrowing — the `.messages`/`.trimmedCount`/`.inputTokens` accesses after the guard are flagged even though they're safe at runtime.

**Why deferred:** Pre-existing baseline errors (verified via `git stash` + `tsc --noEmit`); not introduced by Plan 05c. Runtime behavior is correct — all Vitest cases green. Plan 05c explicitly stays out of Plan 03 territory per parallel-execution discipline (v2-chat/route.ts is my file but the offending block is Plan 03's output).

**Suggested fix (for later):** Rename `BudgetTooLarge.tooLarge` to a proper discriminator (e.g., add `kind: "too-large"` vs `kind: "ok"`), or widen the inline guard to a dedicated type-predicate helper `isBudgetOk(b): b is BudgetOk`.

---

## From Plan 01-07 (enablement) — Phase 1 close-out

### SEC-02 end-to-end quota enforcement blocked on Supabase credential migration

**Requirement:** SEC-02 (per-user token quota ledger)
**Files:** `app/src/lib/supabase-admin.ts`, `app/src/lib/quota.ts`, Vercel env vars
**Fix owner:** Phase 1.1 (gap-closure plan — to be planned after Phase 1 close)

**Symptom:**
`user_quota_ledger` count = 0 in production despite 10+ authenticated requests during enablement smoke runs. Anonymous 5-req/day cap is NOT being enforced. `checkAndIncrement` logs `[quota] increment_quota_and_check failed, allowing request` and returns `allowed: true` (fail-open path).

**Root cause:**
Supabase disabled legacy anon + service_role JWT keys on 2026-04-20. The replacement is a new `sb_secret_*` key format. The installed `@supabase/supabase-js` version (shipped before this format existed) likely cannot authenticate admin RPC calls with the new key. `createAdminSupabase()` now receives a secret it doesn't know how to sign requests with, the RPC returns an auth error, and `quota.ts` falls through its fail-open safeguard. The anon-key pathway still works (browser signin on `/start` succeeds), so only the admin / service-role path is broken.

**Evidence:**
- `user_quota_ledger` returns 0 rows in production despite live traffic.
- Browser-driven anon signin + magic link flows both work (anon key path OK).
- Direct curl to `/api/v2-chat` returns 401 without auth, 200 with Bearer JWT — the auth gate itself works.
- 697/697 unit tests pass — the code logic for quota increment is correct; it's the credential that fails.
- SEC-01 verified via direct Bearer curl. SEC-03 and SEC-04 could not run end-to-end because they depend on either a working quota ledger (SEC-03 amplifies budget truncation with quota) or on `CRON_SECRET` (unreadable from this context without Vercel log access).

**Impact:**
Quota enforcement is silently disabled in production. Any authenticated or anon user can exceed the configured tier cap (5/day anon, 50/day free, 500/day operate) without hitting a 429. There is no cost-safety backstop on per-user spend until this is resolved. Anthropic cost ceiling rests entirely on the existing request-count rate limit (IP-based, anon-only per Warning 1) plus manual monitoring.

**Mitigation (short-term, acceptable because pre-launch traffic is nominal):**
- `CRON_SECRET` in place — cron paths unaffected.
- Manual daily Anthropic spend monitoring by operator.
- Phase 1 code ships behind `PHASE_1_GATE_ENABLED=true` so auth + budget + sanitizer + observability + SSE abort all still function. Only SEC-02's runtime enforcement is degraded.

**Fix options (pick during Phase 1.1 planning):**
1. **Upgrade `@supabase/supabase-js`** to a version that natively accepts `sb_secret_*` secret format. Check changelog for breaking changes to `createClient` signature and RPC typing.
2. **Re-enable Supabase legacy keys** on the project and re-paste the legacy `service_role` JWT into Vercel. Buys time but defers the migration (Supabase will disable legacy keys again).
3. **Refactor `createAdminSupabase`** to detect key format and branch — if `sb_secret_*`, use whatever the new SDK pathway requires; if JWT, use the current path. Most work but most robust.

**Verification after fix:**
1. Re-run `app/scripts/smoke/sec-02-quota.sh` against production with a fresh anon JWT.
2. Expect 5 × 200 OK followed by 1 × 429 with body `{code:"RATE_LIMITED", tier:"anonymous", ...}`.
3. Confirm `SELECT count(*) FROM user_quota_ledger` > 0 in Supabase dashboard after the smoke run.

### RESOLVED — 2026-04-21 (Plan 01-08)

**Actual root cause was two-part, not one.** VERIFICATION.md correctly identified the Supabase credential migration (legacy JWT service_role disabled 2026-04-20) as a blocker, but it missed a **second, older bug**: migration 016's `increment_quota_and_check` PL/pgSQL function contained two ambiguous column references (`tier` and `req_count`) that collided with implicit variables exposed by the function's `RETURNS TABLE (...)` declaration. Every production call errored with `column reference ... is ambiguous`, fell through `quota.ts`'s fail-open branch, and returned `allowed: true`. The bug had been dormant since migration 016 shipped — unit tests mock the RPC, enablement smoke was deferred, no one ran end-to-end. The credential migration on 2026-04-20 shifted the failure mode from "SQL error" to "auth error," obscuring the real bug until this plan cleared the auth layer.

**Fix shipped — three layers, in diagnostic order:**

1. **SDK upgrade** — `@supabase/supabase-js` `^2.99.2 → ^2.104.0` (commit `1396b11`). New version natively accepts both legacy JWT and `sb_secret_*` service-role key formats; no branching in `createAdminSupabase()`. This fixed the auth layer VERIFICATION.md called out.

2. **Migration `018_fix_quota_tier_ambiguity.sql`** — qualified `WHERE tier = v_tier` to `WHERE user_quotas_tiers.tier = v_tier`. Fixed one ambiguity; surfaced the second (the WARN log revealed `column reference "req_count" is ambiguous` on round two).

3. **Migration `019_quota_variable_conflict_pragma.sql`** — added `#variable_conflict use_column` pragma to the function body. Tells Postgres to always prefer column interpretation when a name could be either a column or a variable. Belt-and-suspenders catch-all; local vars all `v_`-prefixed so no real collision exists except with RETURNS TABLE output names where column-interpretation is always what we want.

**Hardening shipped alongside:** `quota.ts` fail-open branch upgraded from silent `console.error("[quota] ...")` to structured `console.warn(JSON.stringify({component:"quota", severity:"WARN", event:"increment_quota_and_check_failed", error_message, user_id, route, req_id}))`. This is what let us diagnose the PL/pgSQL bug in-flight — the `error_message` field surfaced the ambiguity errors in Vercel log search. Any future runtime credential / RPC / data-model failure on this path will now surface immediately via `component=quota severity=WARN`.

**Verification evidence:**
- `scripts/smoke/sec-02-quota.sh` vs https://huma-two.vercel.app → **PASS** (5×200 + 6th=429 with `{code:"RATE_LIMITED", tier:"anonymous", suggest:"sign_in", resetAt:ISO}`; exit 0).
- `SELECT * FROM user_quota_ledger ORDER BY window_start DESC LIMIT 1` → `user_id=b425c92d-..., route=/api/v2-chat, req_count=5, token_count=1371, window_start=2026-04-21 23:38:27+00`.
- Denials don't touch the ledger (6th request was rejected BEFORE increment — req_count caps at 5, consistent with function design).
- 697/697 Vitest suite stayed green across the SDK upgrade.

**Paths NOT taken:**
- Path 2 (re-enable Supabase legacy keys + re-paste legacy service_role into Vercel) — rejected as explicit short-term debt; Supabase will disable legacy keys again.
- Path 3 (format-detection branch in `createAdminSupabase`) — kept in reserve as fallback if SDK upgrade broke the surface; it didn't, so never applied.
- Renaming RETURNS TABLE output columns (`tier → out_tier`, `req_count → out_req_count`) — would change caller contract in `quota.ts`. Pragma is a smaller, more maintainable fix.

**Systemic gap flagged for Phase 2+ planning:** all four `increment_quota_and_check` tests in `quota.test.ts` mock the RPC (`vi.fn(async () => ({data, error}))`) — the PL/pgSQL body never executes against real Postgres in CI. A local Supabase docker instance or pgTAP coverage should be added before Phase 6's subscription / billing RPC work lands, since those will add more database-side logic at risk of similar latent bugs.

### Carryover — deferred as still-unresolved

Three Phase 1 smokes remain deferred after this plan:
- **SEC-03** end-to-end budget-truncation smoke against production — needs a test account seeded with enough quota to execute 100+ requests (anon cap of 5/day blocks it). Unit tests for `budgetCheck()` are green.
- **SEC-04** end-to-end injection-sanitizer smoke against production — needs `CRON_SECRET` (not accessible from this execution context) to bypass the auth gate so a clean 400 on marker-delimiter input is reachable. Unit + coverage tests are green.
- **SEC-06** Vercel-log manual verify of `APIUserAbortError` signature — needs operator to disconnect mid-stream and inspect the req_id in Vercel logs. Unit tests green (4 abort assertions).

None of these are blockers for Phase 2. Flagged for operator attention on a future Vercel-dashboard session.

---

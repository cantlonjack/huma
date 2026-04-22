---
gsd_state_version: 1.0
milestone: v0.1
milestone_name: milestone
status: Live and enforcing. SEC-02 gap closed via @supabase/supabase-js upgrade (2.99.2 → ^2.104.0) + migrations 018/019 (fix latent PL/pgSQL ambiguities in increment_quota_and_check) + structured fail-open warning + operator env-var rotation. Ledger writes confirmed (req_count=5, 6th request returns 429 with structured RATE_LIMITED body).
stopped_at: Phase 2 context gathered
last_updated: "2026-04-22T00:39:48.763Z"
last_activity: 2026-04-21 — Plan 01-08 landed; production SEC-02 smoke passed; user_quota_ledger confirmed writing rows.
progress:
  total_phases: 8
  completed_phases: 1
  total_plans: 11
  completed_plans: 11
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-18)

**Core value:** Reduce cognitive load and reveal connections — every feature must pass The Single Test.
**Current focus:** Phase 1 complete — Phase 2 (Regenerative Math Honesty) unblocked

## Current Position

Phase: 1 of 8 (Security & Cost Control) — COMPLETE as of 2026-04-21
Plan: 11/11 plans landed. All six SEC requirements enforcing in production behind `PHASE_1_GATE_ENABLED=true`.
Status: Live and enforcing. SEC-02 gap closed via @supabase/supabase-js upgrade (2.99.2 → ^2.104.0) + migrations 018/019 (fix latent PL/pgSQL ambiguities in increment_quota_and_check) + structured fail-open warning + operator env-var rotation. Ledger writes confirmed (req_count=5, 6th request returns 429 with structured RATE_LIMITED body).
Last activity: 2026-04-21 — Plan 01-08 landed; production SEC-02 smoke passed; user_quota_ledger confirmed writing rows.

Progress: [██████████] 100% (11/11 plans complete in Phase 1)

## Rollback Procedures

### Phase 1 (Security & Cost Control) — rollback from enabled state

**When to use:** if post-enablement monitoring shows a regression (error rate >2%, p99 latency >10s, user-reported breakage, or unexpected Anthropic spend spike).

**Steps (one-click rollback — no code revert needed):**
1. Vercel Dashboard → Project (huma-two) → Settings → Environment Variables.
2. Edit `PHASE_1_GATE_ENABLED` → change value to `false`.
3. Save. Trigger redeploy (or wait for Vercel auto-redeploy).
4. Smoke: `curl -sS -o /dev/null -w "%{http_code}" -X POST https://huma-two.vercel.app/api/v2-chat -d '{}'` — should return 400 (validation, gate disabled), NOT 401 (gate enabled).

**What rollback preserves:**
- Supabase migrations 016 + 017 stay applied (additive-only; no destructive rollback needed).
- All Plan 00–06 code remains merged — gates behind the flag return to no-op paths.
- Any rows in `user_quota_ledger` / `cost_metrics_raw` / `cost_metrics` remain (useful for diagnostics).

**What rollback does NOT preserve:**
- The gate itself — pre-auth chat becomes open again until the flag flips back.

**Re-enabling after a fix (Phase 1.1 close):**
1. Merge the Phase 1.1 fix (Supabase credential resolution).
2. Flip `PHASE_1_GATE_ENABLED=true`.
3. Re-run smoke quad + SEC-06 manual log verify.

## Performance Metrics

**Velocity:**
- Total plans completed: 10 (code-wise)
- Average duration: ~13 min per plan during active execution
- Total execution time: ~4h 40m (includes 3h 32m long-running P06 that spanned multiple sessions; P04 added 6 min resumption; P03 added 10 min; P07 added ~2 days wall-clock but minimal active work — bulk was credential-investigation stall)

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Security & Cost Control | 10 | ~4h 40m | ~13 min |
| 2. Regenerative Math Honesty | 0 | — | — |
| 3. Onboarding Visibility | 0 | — | — |
| 4. Landing & Funnel Instrumentation | 0 | — | — |
| 5. Viral Insight Artifact | 0 | — | — |
| 6. Pricing Infrastructure | 0 | — | — |
| 7. Deeper Regenerative Model | 0 | — | — |
| 8. Commons, Protocol, Graduate Flywheel | 0 | — | — |

**Recent Trend:**
- Last 10 plans: 01-00 (4 min), 01-01 (15 min), 01-06 (3h 32m), 01-05a (5 min), 01-02 (15 min), 01-04 (6 min), 01-03 (10 min), 01-05b (11 min), 01-05c (11 min), 01-07 (~2d wall-clock, partial close)

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| 01-00-fixtures | 4 min | 1 (TDD) | 4 created |
| 01-01-auth-gate | 15 min | 3 (TDD) | 11 total (5 created, 6 modified) |
| 01-06-sse-abort | 3h 32m | 3 tasks | 3 files |
| 01-05a-observability-lib | 5 min | 2 tasks | 6 files |
| 01-02-quota-ledger | 15 min | 3 tasks | 12 files (4 created, 8 modified) |
| 01-04-sanitizer | 6 min (resume) | 4 tasks | 8 files (3 created this session + 2 pre-landed d3886a1 + 3 modified) |
| 01-03-token-budget | 10 min | 3 tasks (TDD) | 8 files (4 created, 4 modified) |
| 01-05b-observability-routes | 11 min | 3 tasks | 10 files |
| 01-05c-observability-streaming | 11 min | 3 tasks | 7 files |
| 01-07-enablement (partial) | ~2d wall | 6 (2 complete, 1 partial, 1 skipped, 1 complete-modified, 1 decision-close) | 8 docs + 4 source (scope additions) |

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- **Pre-planning:** Magic-link for pre-auth chat gate (not preview-token JWT) — magic-link already wired in AuthModal.tsx; saves ~2 days of infra
- **Pre-planning:** 8 GSD phases = 8 plan P-groups (Standard granularity) — plan's P0-P7 structure is load-bearing
- **Pre-planning:** Skip research agents for this milestone — plan is pre-written, codebase is mapped
- **Pre-planning:** Phase 1 (P0) is blocking — nothing ships without auth + budgets + injection defense + observability
- **Phase 1 / Plan 00:** Extract Wave 0 fixture plan (mock-supabase, mock-anthropic, capture-log) to prevent Plans 02/03/06 from racing to extend mock-anthropic.ts simultaneously. Locks shared fixture contract via smoke test before Wave 1 consumers land.
- **Phase 1 / Plan 00:** `makeMockStream` provides a single canonical factory with optional `throwOnAbort` — serves both Plan 02/03 (silent abort) and Plan 06 (APIUserAbortError simulation) without divergent implementations.
- [Phase 01]: PHASE_1_GATE_ENABLED=false returns source:'system' (Warning 2) — merge-safe shim keeps observability dashboards clean
- [Phase 01]: IP rate-limit anon/unauth-only (Warning 1) — permanent users rely on per-user ledger from Plan 02; shared-IP operators no longer penalized
- [Phase 01]: Anon→email upgrade uses supabase.auth.updateUser({email}) NOT linkIdentity (OAuth-only per Supabase docs); user_id preserved across upgrade
- [Phase 01-security-cost-control]: Plan 01-06: triple-guard SSE abort (SDK signal + abort-event listener + ReadableStream.cancel) + APIUserAbortError suppressed by name-check
- [Phase 01-security-cost-control]: Plan 01-06: v2-chat route.ts edits kept surgical — Plan 05c (Wave 2) layers withObservability and stream.on('finalMessage',...) on top later
- [Phase 01-security-cost-control]: Observability uses closure-scoped request telemetry (no globalThis) — Warning 5 resolved; concurrent requests cannot see each other's prompt/output tokens
- [Phase 01-security-cost-control]: cost_metrics_raw mirror is fire-and-forget with in-memory retry queue (cap 100, drains on next request, overflow drops oldest) — stdout log is authoritative so DB outages cannot block user responses
- [Phase 01-security-cost-control]: Parallel Wave 1 agents can sweep-in each other's untracked files during 'git add' — individual-file staging is the policy; flag for post-milestone parallelization retrospective
- [Phase 01-security-cost-control]: Plan 01-02: quota.ts fails OPEN on RPC error — availability beats cost correctness; dead ledger must not black-hole user requests (consequence: SEC-02 is silently off when admin client can't auth — see Phase 1.1 gap)
- [Phase 01-security-cost-control]: Plan 01-02: atomic enforcement via SECURITY DEFINER RPC with FOR UPDATE row lock — SQL-level consistency, no app-side retry loop
- [Phase 01-security-cost-control]: Plan 01-03: Blocker 6 closed — v2-chat + sheet now run budgetCheck BEFORE checkAndIncrement; quota RPC receives accurate inputTokens from countTokens()
- [Phase 01-security-cost-control]: Plan 01-03: budgetCheck uses anthropic.messages.countTokens() (free, matches billing) — NOT @anthropic-ai/tokenizer
- [Phase 01-security-cost-control]: Plan 01-03: Cron path bypasses both budget AND quota on v2-chat and sheet — scheduled operator traffic must never 413
- [Phase 01-security-cost-control]: Plan 01-04: injection-phrase stripping is SILENT (iterative peel, bound 10); only [[/]] trigger hard 400
- [Phase 01-security-cost-control]: Plan 01-05b: Auth-outside, handler-inside withObservability composition — keeps the 401 short-circuit observable
- [Phase 01-security-cost-control]: Plan 01-05c: Reconciliation log pattern — streaming routes emit TWO log entries (outer tokens=0 + {reconciles: reqId} with real tokens after finalMessage); cost-rollup GROUPs BY req_id + MAX(tokens) to collapse
- [Phase 01-security-cost-control]: Plan 01-05c: cost-rollup source:'system' (ops infra) vs morning-sheet source:'cron' (operator-facing scheduled work) — keeps per-operator analytics dashboards clean
- [Phase 01-security-cost-control]: Plan 01-07: Bearer JWT fallback added to ensureUser() as scope addition (commit 08cf2c1) — API callers without Supabase SSR cookies can authenticate via `Authorization: Bearer <jwt>`
- [Phase 01-security-cost-control]: Plan 01-07: Path 2 partial-ship over Path 1 continue-debugging — Supabase credential migration (legacy keys disabled 2026-04-20, new sb_secret_* likely incompatible with installed supabase-js) is an infra task, not a code task; fix owner is Phase 1.1 gap-closure plan
- [Phase 01-security-cost-control]: Plan 01-07: Phase 1 not marked completed_phases: 1 despite 10/10 plans landed — SEC-02 runtime enforcement blocked; honesty over neatness
- [Phase 01-security-cost-control]: Plan 01-08: Path 1 (@supabase/supabase-js upgrade) resolved SDK-side auth; migrations 018+019 fixed latent PL/pgSQL ambiguities in increment_quota_and_check that predated Plan 01-02 landing. VERIFICATION.md misdiagnosed the gap as credential-only; the PL/pgSQL bug was masked by unit-test mocking + deferred enablement smoke, then surfaced first through structured WARN logs made non-silent by this same plan
- [Phase 01-security-cost-control]: Plan 01-08: `#variable_conflict use_column` pragma chosen over renaming RETURNS TABLE columns — preserves quota.ts caller contract; single-point catch-all for ambiguity between table columns and implicit RETURNS TABLE variables
- [Phase 01-security-cost-control]: Plan 01-08: integration testing gap flagged for future planning — all quota RPC unit tests mock the RPC; PL/pgSQL body never executes against real Postgres in CI. Local Supabase docker instance or pgTAP recommended for Phase 2+ quota / subscriptions work

### Pending Todos

- (none — Phase 1 closed; ready for Phase 2)

### Blockers/Concerns

- **Phase 6 PRICE-04 depends on Phase 7 DEPTH-05** — graduation-aware upgrade path requires four graduation capacities to be measurable. Flagged in roadmap; revisit when planning Phase 6.
- **Phase 8 LONG-01 depends on Phase 2 REGEN-03** — pattern contribution gate requires 6+ months of outcome data, so Phase 2's outcome-measurement infrastructure must have shipped well before Phase 8 starts.
- **Supabase migrations are manual** — every phase that adds a migration (Phase 2's `017_outcomes.sql`, etc.) requires dashboard SQL-editor execution; code push alone does NOT apply them.
- **No PL/pgSQL integration tests** — `quota.test.ts` and any future RPC tests mock the database layer; PL/pgSQL bodies are not exercised by CI. Add local Supabase / pgTAP coverage when Phase 2+ touches database-side logic.

## Session Continuity

Last session: 2026-04-22T00:39:48.739Z
Stopped at: Phase 2 context gathered
Resume file: .planning/phases/02-regenerative-math-honesty/02-CONTEXT.md
Expected next: `/gsd:plan-phase 2` — Regenerative Math Honesty (Phase 2)

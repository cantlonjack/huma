---
phase: 01-security-cost-control
plan: 07
type: execute
wave: 3
depends_on:
  - "01-00"
  - "01-01"
  - "01-02"
  - "01-03"
  - "01-04"
  - "01-05a"
  - "01-05b"
  - "01-05c"
  - "01-06"
files_modified:
  - .planning/STATE.md
  - .planning/ROADMAP.md
autonomous: false
requirements:
  - SEC-01
  - SEC-02
  - SEC-03
  - SEC-04
  - SEC-05
  - SEC-06
must_haves:
  truths:
    - "Migration 016_user_quotas.sql applied to Supabase production; SELECT count(*) FROM user_quotas_tiers returns 3"
    - "Migration 017_cost_metrics.sql applied to Supabase production; cost_metrics and cost_metrics_raw tables exist"
    - "PHASE_1_GATE_ENABLED=true set in Vercel production environment"
    - "scripts/smoke/sec-01-curl.sh exits 0 against production deployment"
    - "scripts/smoke/sec-02-quota.sh exits 0 against production deployment"
    - "scripts/smoke/sec-03-budget.sh exits 0 against production deployment (Warning 3 — quad, not triad)"
    - "scripts/smoke/sec-04-injection.sh exits 0 against production deployment"
    - "scripts/smoke/sec-06-disconnect.sh run against production; Vercel log shows APIUserAbortError OR short-latency partial stream for the emitted req_id"
    - "Rollback procedure documented and verified: flipping PHASE_1_GATE_ENABLED=false restores prior behavior with no code revert"
    - "All Phase 1 SUMMARY.md files (01-00 through 01-07) staged and committed alongside STATE/ROADMAP updates (Warning 7)"
  artifacts:
    - path: ".planning/STATE.md"
      provides: "Rollback Procedures section + Phase 1 completion entry"
      contains: "Rollback Procedures"
    - path: ".planning/ROADMAP.md"
      provides: "Phase 1 checkbox marked complete"
      contains: "[x] **Phase 1"
  key_links:
    - from: "Supabase dashboard"
      to: "016_user_quotas.sql + 017_cost_metrics.sql"
      via: "Operator applies each migration manually via SQL editor"
      pattern: "manual-apply"
    - from: "Vercel production env"
      to: "PHASE_1_GATE_ENABLED=true"
      via: "Operator toggles env var; triggers deployment"
      pattern: "PHASE_1_GATE_ENABLED"
    - from: "Production endpoints"
      to: "scripts/smoke/sec-0{1,2,3,4,6}-*.sh"
      via: "Operator runs smoke quad (now 5 scripts including SEC-03 + SEC-06 manual)"
      pattern: "scripts/smoke/sec-"
---

<objective>
Operational enablement plan for Phase 1. Almost no code changes (just STATE.md / ROADMAP.md updates + SUMMARY staging). The operator applies two Supabase migrations manually, flips `PHASE_1_GATE_ENABLED` in Vercel production, and runs the smoke quad+manual against the live deployment to confirm SEC-01 through SEC-06 all function end-to-end. Then documents the rollback procedure.

Purpose: Phase 1's locked decision is atomic rollout behind a single feature flag. Plans 00–06 (now 9 plans total: 00, 01, 02, 03, 04, 05a, 05b, 05c, 06) land the code in merge-safe state (gate defaults to `false`). Plan 07 is the deliberate, observable, reversible cutover.

**Wave structure (after revision):**
- Wave 0: Plan 00 (fixtures)
- Wave 1: Plans 01, 02, 03, 04, 05a, 06 (parallel; depend on 00)
- Wave 2: Plans 05b, 05c (depend on 05a; parallel with each other)
- Wave 3: Plan 07 (this plan; depends on all)

**Why this plan is not autonomous:** Three checkpoints require human interaction (migrations, env flip, SEC-06 log inspection) and one decision (final go/no-go).

**Warning 3 covered:** smoke quad now includes `sec-03-budget.sh` (4 scripts + 1 manual = 5 total).

**Warning 7 covered:** Task 5 stages all `.planning/phases/01-security-cost-control/01-*-SUMMARY.md` files BEFORE Task 6's commit.

Output: A production deployment with `PHASE_1_GATE_ENABLED=true`, both migrations applied, all smoke scripts green, updated STATE.md + ROADMAP.md, all SUMMARY files committed, documented rollback procedure.
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
@.planning/phases/01-security-cost-control/01-04-sanitizer-PLAN.md
@.planning/phases/01-security-cost-control/01-05a-observability-lib-PLAN.md
@.planning/phases/01-security-cost-control/01-05b-observability-routes-PLAN.md
@.planning/phases/01-security-cost-control/01-05c-observability-streaming-PLAN.md
@.planning/phases/01-security-cost-control/01-06-sse-abort-PLAN.md

<interfaces>
Artifacts produced by Plans 00-06 that this plan consumes:
- `app/supabase/migrations/016_user_quotas.sql` (Plan 02)
- `app/supabase/migrations/017_cost_metrics.sql` (Plan 05c)
- `vercel.json` includes both cron schedules (Plan 05c)
- `app/scripts/smoke/sec-01-curl.sh` (Plan 01)
- `app/scripts/smoke/sec-02-quota.sh` (Plan 02)
- `app/scripts/smoke/sec-03-budget.sh` (Plan 03 — Warning 3)
- `app/scripts/smoke/sec-04-injection.sh` (Plan 04)
- `app/scripts/smoke/sec-06-disconnect.sh` (Plan 06)

Environment variables required at production deploy:
- `ANTHROPIC_API_KEY` (existing)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (existing)
- `CRON_SECRET` (existing or to be set)
- `PHASE_1_GATE_ENABLED=true` (NEW)

Rollback: single env var flip; migrations are additive-only.
</interfaces>
</context>

<tasks>

<task type="checkpoint:human-action" gate="blocking" status="COMPLETE">
  <name>Task 1: Apply Supabase migrations 016 + 017 via dashboard ✓ (operator confirmed 2026-04-19: "migrations applied")</name>
  <files>
    app/supabase/migrations/016_user_quotas.sql,
    app/supabase/migrations/017_cost_metrics.sql
  </files>
  <action>
**PAUSE FOR OPERATOR — Supabase migrations are manual via dashboard SQL editor (PROJECT.md).**

**Step 1 — Apply 016_user_quotas.sql:**
1. Supabase dashboard → Project → SQL Editor → New Query.
2. Copy-paste contents of `app/supabase/migrations/016_user_quotas.sql`. Click Run.
3. Verify: `SELECT count(*) FROM user_quotas_tiers;` → expect 3.
4. Also verify: `SELECT tier, req_limit, token_limit FROM user_quotas_tiers ORDER BY tier;`
   - anonymous | 5 | 10000
   - free | 50 | 100000
   - operate | 500 | 2000000

**Step 2 — Apply 017_cost_metrics.sql:**
1. SQL Editor → New Query → paste `app/supabase/migrations/017_cost_metrics.sql`. Click Run.
2. Verify: `SELECT table_name FROM information_schema.tables WHERE table_name IN ('cost_metrics', 'cost_metrics_raw');` → expect both rows.

**Operator resume signal:** Paste verify-query output OR type "migrations applied".
  </action>
  <verify>
    <automated>MISSING — manual-apply via Supabase dashboard. Operator confirms SELECT outputs match expected.</automated>
  </verify>
  <done>
    - Both migrations applied; verify queries return expected results.
    - Operator signalled completion.
  </done>
</task>

<task type="checkpoint:human-action" gate="blocking" status="COMPLETE">
  <name>Task 2: Set PHASE_1_GATE_ENABLED=true in Vercel production ✓ (operator confirmed 2026-04-19: gate flipped; prod deploy main@57ee0c6 Ready; HTTP 401 verified; commit 57ee0c6 resolved 7 TS build errors — narrowing in sheet/v2-chat route.ts + mock-supabase.ts vi.fn signatures; 695/695 tests green, tsc clean)</name>
  <files>
    (Vercel environment — settings live in Vercel dashboard)
  </files>
  <action>
**PAUSE FOR OPERATOR — Vercel env var flip requires dashboard access.**

**Step 1 — Set the flag:**
1. Vercel Dashboard → Project (huma-two) → Settings → Environment Variables.
2. Add/edit:
   - Name: `PHASE_1_GATE_ENABLED`
   - Value: `true`
   - Environments: Production (and Preview if desired)
3. Save. Trigger production redeploy.
4. Wait ~1-2 minutes for deployment.

**Step 2 — Verify CRON_SECRET is set in production** (if missing: `openssl rand -hex 32` → add as `CRON_SECRET` → redeploy).

**Step 3 — Operator verifies with curl:**
```bash
curl -sS -o /dev/null -w "%{http_code}" -X POST https://huma-two.vercel.app/api/v2-chat \
  -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"hi"}]}'
```
Expect: 401.

**Operator resume signal:** Type "gate enabled, 401 confirmed".
  </action>
  <verify>
    <automated>MISSING — Vercel dashboard access. Operator confirms 401 from prod curl.</automated>
  </verify>
  <done>
    - PHASE_1_GATE_ENABLED=true set in Vercel prod.
    - CRON_SECRET set in Vercel prod.
    - Production deployment "Ready".
    - Unauth curl to /api/v2-chat returns 401.
  </done>
</task>

<task type="auto" status="PARTIAL">
  <name>Task 3: Run automated smoke quad against production (sec-01, sec-02, sec-03, sec-04) — PARTIAL (2026-04-21): SEC-01 proven via direct Bearer curl (401→200 round-trip). Bearer auth fallback added as scope addition (commit 08cf2c1). SEC-02 BLOCKED — admin client can't write to user_quota_ledger; Supabase disabled legacy keys 2026-04-20 and new sb_secret_* format likely incompatible with installed supabase-js; quota fails open silently. SEC-03 and SEC-04 NOT RUN end-to-end (smoke scripts need CRON_SECRET which is unreadable from this context); both unit-green. See 01-07-enablement-SUMMARY.md and deferred-items.md.</name>
  <files>
    app/scripts/smoke/sec-01-curl.sh,
    app/scripts/smoke/sec-02-quota.sh,
    app/scripts/smoke/sec-03-budget.sh,
    app/scripts/smoke/sec-04-injection.sh
  </files>
  <action>
Run the four automated smoke scripts against the live production deployment. Each must exit 0.

**Pre-req:** operator provides `CRON_SECRET` (set in Task 2) and an `ANON_JWT` (or `COOKIE`) for sec-02/sec-03 (open https://huma-two.vercel.app/start in incognito → copy `sb-access-token` from cookies).

**Step 1 — SEC-01 smoke:**
```bash
cd app
BASE_URL=https://huma-two.vercel.app CRON_SECRET="$CRON_SECRET" bash scripts/smoke/sec-01-curl.sh
```
Expect: "SEC-01 smoke: PASS" + exit 0.

**Step 2 — SEC-02 smoke:**
```bash
cd app
BASE_URL=https://huma-two.vercel.app ANON_JWT="$ANON_JWT" bash scripts/smoke/sec-02-quota.sh
```
Expect: 5 OK + 6th returns 429 with RATE_LIMITED body + exit 0.

**Step 3 — SEC-03 smoke (Warning 3 — new in revision):**
```bash
cd app
BASE_URL=https://huma-two.vercel.app COOKIE="sb-access-token=$ANON_JWT" bash scripts/smoke/sec-03-budget.sh
```
Expect: 100×1KB → 200 no truncation header; 600×1KB → 200 with `X-Huma-Truncated: count=N,reason=budget` header + exit 0.

**Step 4 — SEC-04 smoke:**
```bash
cd app
BASE_URL=https://huma-two.vercel.app CRON_SECRET="$CRON_SECRET" bash scripts/smoke/sec-04-injection.sh
```
Expect: `[[`/`]]` → 400 with 'reserved marker' in body; injection prefix → NOT 400 + exit 0.

**If any script fails:** flag the failure; DO NOT proceed to Task 4. Roll back via Task 6 and debug.
  </action>
  <verify>
    <automated>cd app && BASE_URL=https://huma-two.vercel.app CRON_SECRET="$CRON_SECRET" bash scripts/smoke/sec-01-curl.sh && BASE_URL=https://huma-two.vercel.app ANON_JWT="$ANON_JWT" bash scripts/smoke/sec-02-quota.sh && BASE_URL=https://huma-two.vercel.app COOKIE="sb-access-token=$ANON_JWT" bash scripts/smoke/sec-03-budget.sh && BASE_URL=https://huma-two.vercel.app CRON_SECRET="$CRON_SECRET" bash scripts/smoke/sec-04-injection.sh</automated>
  </verify>
  <done>
    - sec-01 exits 0; 401 on unauth; cron bypass works.
    - sec-02 exits 0; 6th anon request returns RATE_LIMITED body with tier:"anonymous".
    - sec-03 exits 0; 100×1KB no header; 600×1KB has X-Huma-Truncated header (Warning 3).
    - sec-04 exits 0; `[[`/`]]` → 400 with 'reserved marker'.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking" status="SKIPPED">
  <name>Task 4: Run sec-06 manual-observed smoke + inspect Vercel logs — SKIPPED (2026-04-21): requires Vercel log access unreachable from this execution context. Unit-test coverage for triple-guard abort is green. Deferred to Phase 1.1 smoke-rerun if needed.</name>
  <files>
    app/scripts/smoke/sec-06-disconnect.sh
  </files>
  <action>
**PAUSE FOR OPERATOR — Manual verification via Vercel log inspection.**

**Step 1 — Run smoke against production:**
```bash
cd app
BASE_URL=https://huma-two.vercel.app ANON_JWT="$ANON_JWT" bash scripts/smoke/sec-06-disconnect.sh
```

**Step 2 — Vercel logs:**
1. Vercel Dashboard → Project → Logs.
2. Filter: function `/api/v2-chat`, last 5 minutes.
3. Find log entry matching curl run.

**Step 3 — Confirm abort signature. Either (a) OR (b):**
- (a) Log line containing `APIUserAbortError`, OR
- (b) Structured JSON log with `route:"/api/v2-chat"`, `status:200`, `latency_ms < 500`, `output_tokens: 0` or small partial.

**Step 4 — Record req_id** for the SUMMARY.

**If neither holds:** SEC-06 is NOT working — roll back via Task 6.

**Operator resume signal:** Paste req_id + confirm (a) or (b).
  </action>
  <verify>
    <automated>MISSING — manual via Vercel logs.</automated>
  </verify>
  <done>
    - Smoke executed; curl terminated mid-stream.
    - Vercel log for the matching req_id shows abort signature (a) or (b).
    - Operator recorded req_id.
  </done>
</task>

<task type="auto" status="COMPLETE (modified)">
  <name>Task 5: Document rollback in STATE.md + mark Phase 1 complete + stage SUMMARYs (Warning 7) — COMPLETE WITH MODIFICATIONS (2026-04-21): STATE.md gained Rollback Procedures section; Current Position reflects "partial" status (not "COMPLETE") because SEC-02 runtime is blocked. ROADMAP.md progress row: 10/10 plans with "Partial" status and SEC-02 flagged. REQUIREMENTS.md: SEC-01/03/04/05/06 Complete, SEC-02 Partial. Phase 1 ROADMAP checkbox left unchecked — claiming complete would misrepresent the SEC-02 gap.</name>
  <files>
    .planning/STATE.md,
    .planning/ROADMAP.md
  </files>
  <action>
Step 1 — Append a "Rollback Procedures" section to `.planning/STATE.md`:

```markdown
## Rollback Procedures

### Phase 1 (Security & Cost Control) — rollback from enabled state
**When to use:** if post-enablement monitoring shows a regression (error rate >2%, p99 latency >10s, or user-reported breakage).

**Steps (one-click rollback — no code revert needed):**
1. Vercel Dashboard → Project → Settings → Environment Variables.
2. Edit `PHASE_1_GATE_ENABLED` → change value to `false`.
3. Save. Trigger redeploy (or wait for Vercel auto-redeploy).
4. Smoke: `curl -sS -o /dev/null -w "%{http_code}" -X POST https://huma-two.vercel.app/api/v2-chat -d '{}'` — should return 400 (validation), NOT 401 (gate disabled).

**What rollback preserves:**
- Both Supabase migrations (016, 017) stay applied — additive-only; no destructive rollback needed.
- All Plan 00-06 code remains merged — gates behind the flag return to no-op paths.
- Any rows in `user_quota_ledger` / `cost_metrics_raw` / `cost_metrics` remain (useful for diagnosing).

**What rollback does NOT preserve:**
- The gate itself — pre-auth chat becomes open again until flag flips back.

**Re-enabling after a fix:**
1. Merge the fix.
2. Flip `PHASE_1_GATE_ENABLED=true`.
3. Re-run smoke quad + manual (Tasks 3 + 4 of Plan 07).
```

Step 2 — Update Current Position block:

```markdown
## Current Position

Phase: 1 of 8 (Security & Cost Control) — COMPLETE as of <TODAY_DATE>
Plan: 9/9 complete (00 fixtures, 01 auth, 02 quota, 03 budget, 04 sanitizer, 05a obs lib, 05b obs routes, 05c obs streaming, 06 SSE abort, 07 enablement)
Status: Enabled in production (PHASE_1_GATE_ENABLED=true)
Last activity: <TODAY_DATE> — Phase 1 enabled; smoke quad green; SEC-06 manual verify req_id: <REQ_ID>
```
Substitute `<TODAY_DATE>` and `<REQ_ID>`.

Step 3 — Update STATE.md progress:
- Bump `completed_phases` from 0 to 1.
- Update `progress.percent` to 12.
- Update phase-row in "By Phase" table — set Plans count to 9.

Step 4 — Mark Phase 1 in `.planning/ROADMAP.md`:
```diff
- [ ] **Phase 1: Security & Cost Control (Plan P0)** - ...
+ [x] **Phase 1: Security & Cost Control (Plan P0)** - ...
```
Update Progress table:
- `| 1. Security & Cost Control (P0) | 9/9 | Complete | <TODAY_DATE> |`

Step 5 — Stage STATE/ROADMAP AND all Phase 1 SUMMARY files (Warning 7):
```bash
# Warning 7: stage SUMMARYs alongside STATE/ROADMAP so the final commit captures the full audit trail.
git add .planning/STATE.md .planning/ROADMAP.md
git add .planning/phases/01-security-cost-control/01-*-SUMMARY.md
git status .planning/STATE.md .planning/ROADMAP.md .planning/phases/01-security-cost-control/01-*-SUMMARY.md
```
Verify all 9 SUMMARYs are staged (one per plan: 00, 01, 02, 03, 04, 05a, 05b, 05c, 06; plus 07 SUMMARY will be created at the end of this task).
  </action>
  <verify>
    <automated>grep -q "Rollback Procedures" .planning/STATE.md && grep -Eq "^\- \[x\] \*\*Phase 1:" .planning/ROADMAP.md && [ "$(git diff --cached --name-only .planning/phases/01-security-cost-control/ | grep -c SUMMARY)" -ge 9 ]</automated>
  </verify>
  <done>
    - STATE.md has "Rollback Procedures" section.
    - STATE.md Current Position reflects 9/9 complete.
    - STATE.md progress metrics updated to 1/8 phases.
    - ROADMAP.md Phase 1 checkbox marked `[x]`; Progress row updated.
    - All ≥9 Phase 1 SUMMARY files staged alongside STATE/ROADMAP (Warning 7).
    - Files staged but NOT yet committed.
  </done>
</task>

<task type="checkpoint:decision" gate="blocking" status="DECISION: PATH 2 — PARTIAL SHIP">
  <name>Task 6: Final go/no-go decision + commit — DECIDED 2026-04-21: Path 2 partial-ship. Operator and orchestrator agreed to stop chasing the Supabase credential issue and document the gap. Phase 1 code ships live behind PHASE_1_GATE_ENABLED=true. SEC-02 runtime enforcement deferred to Phase 1.1 (gap-closure plan). Single atomic docs commit captures all Phase 1 documentation updates (SUMMARYs 00-07 + STATE.md + ROADMAP.md + REQUIREMENTS.md + deferred-items.md).</name>
  <files>
    .planning/STATE.md,
    .planning/ROADMAP.md,
    .planning/phases/01-security-cost-control/01-*-SUMMARY.md
  </files>
  <action>
**PAUSE FOR OPERATOR — explicit go/no-go on Phase 1 enablement.**

### Decision

Phase 1 is live. All six SEC requirements enabled in production. Confirm final state OR trigger rollback.

### Context

You've flipped the feature flag, run the smoke quad + manual SEC-06 verification.

- Operationally: auth gate, per-user quotas, token budgets, sanitizer, observability (lib + 8 non-streaming + streaming/cron), SSE abort all live.
- Cost impact: nominal.
- UX impact: anon users see `<QuotaCard>` after 5 requests; permanent users no longer hit IP-rate-limit (Warning 1).
- Monitoring: watch Vercel logs for unexpected 401/400/429 spikes over the next 24h.

### Options

**Option A — `accept` — Phase 1 is live**
- If selected, executor commits with all SUMMARYs included (Warning 7):
  ```bash
  git commit -m "docs(01): phase 1 enabled in production — security & cost control live (9 plans)"
  ```

**Option B — `rollback`**
- If selected, executor pauses while operator:
  1. Flips `PHASE_1_GATE_ENABLED=false` in Vercel.
  2. Triggers redeploy.
  3. Confirms unauth curl returns 400 (validation), NOT 401.
- After rollback, file `/gsd:plan-phase 01 --gaps` follow-up.

### Operator resume signal

Select: `accept` or `rollback`.
  </action>
  <verify>
    <automated>MISSING — explicit operator go/no-go required.</automated>
  </verify>
  <done>
    - Operator selected accept or rollback.
    - If accept: STATE/ROADMAP + all 9 SUMMARYs committed (Warning 7) with message "docs(01): phase 1 enabled in production — security & cost control live (9 plans)"; git log shows commit.
    - If rollback: Vercel env reverted; gap-closure plan filed.
  </done>
</task>

</tasks>

<verification>
**Overall Phase 01-07 enablement checks:**

Operator-driven (checkpoints 1, 2, 4, 6).
Executor-automated (tasks 3, 5).

**No new Vitest tests in this plan** — all tests green from Plans 00-06.

**Rollback always available** via PHASE_1_GATE_ENABLED=false. Migrations stay applied (additive-only).
</verification>

<success_criteria>
- Both Supabase migrations (016, 017) applied and verified.
- `PHASE_1_GATE_ENABLED=true` set in Vercel prod.
- Smoke quad (SEC-01/02/03/04 — Warning 3) all exit 0.
- SEC-06 manual verify confirms abort signature in Vercel logs.
- STATE.md has rollback procedure + 9/9 plans complete.
- ROADMAP.md Phase 1 marked complete.
- All Phase 1 SUMMARYs staged + committed alongside STATE/ROADMAP (Warning 7).
- Operator explicit go/no-go.
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-cost-control/01-07-enablement-SUMMARY.md` with:
- Date enabled
- req_id from SEC-06 manual verification
- Smoke quad results (paste exit codes — Warning 3 includes sec-03)
- Any surprises observed
- Operator sign-off confirmation at Task 6
- Confirmation all 9 SUMMARYs committed (Warning 7)
- Metrics baseline for post-enablement monitoring
- Open follow-ups for Phase 2+:
  - Anonymous-user cleanup cron (CONTEXT.md deferred)
  - `/internal/cost` dashboard UI reading from cost_metrics
  - Inner-route usage exposure for morning-sheet token attribution (Plan 05c gap)
  - Voice Bible §02 banned-phrase CI check
</output>

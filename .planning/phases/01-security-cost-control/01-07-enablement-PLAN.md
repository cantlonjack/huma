---
phase: 01-security-cost-control
plan: 07
type: execute
wave: 2
depends_on:
  - "01-01"
  - "01-02"
  - "01-03"
  - "01-04"
  - "01-05"
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
    - "scripts/smoke/sec-04-injection.sh exits 0 against production deployment"
    - "scripts/smoke/sec-06-disconnect.sh run against production; Vercel log shows APIUserAbortError OR short-latency partial stream for the emitted req_id"
    - "Rollback procedure is documented and verified: flipping PHASE_1_GATE_ENABLED=false restores prior behavior with no code revert"
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
    - from: "Production /api/v2-chat + /api/sheet"
      to: "scripts/smoke/sec-0{1,2,4,6}-*.sh"
      via: "Operator runs smoke triad; all exit 0"
      pattern: "scripts/smoke/sec-"
---

<objective>
Operational enablement plan for Phase 1. Almost no code changes (just STATE.md / ROADMAP.md updates). The operator applies two Supabase migrations manually, flips the `PHASE_1_GATE_ENABLED` feature flag in Vercel production, and runs the smoke triad against the live deployment to confirm SEC-01 through SEC-06 all function end-to-end. Then documents the rollback procedure.

Purpose: Phase 1's locked decision is atomic rollout behind a single feature flag (CONTEXT.md § Rollout). Plans 01–06 land the code in merge-safe state (gate defaults to `false` — no production behavior change). Plan 07 is the deliberate, observable, reversible cutover. This plan IS the ship event.

**Why this plan is not autonomous:** Two gates require human interaction:
1. Supabase migrations are manual via dashboard SQL editor (PROJECT.md constraint — code push alone does NOT apply them).
2. Vercel env var flip requires operator access to the Vercel dashboard.

Everything else (smoke tests, log inspection, doc updates) is orchestrated by the executor but pauses for operator confirmation at the two human-action checkpoints.

Output: A production deployment with `PHASE_1_GATE_ENABLED=true`, both migrations applied, all four smoke scripts green, updated STATE.md + ROADMAP.md, and a documented rollback procedure.
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
@.planning/phases/01-security-cost-control/01-01-auth-gate-SUMMARY.md
@.planning/phases/01-security-cost-control/01-02-quota-ledger-SUMMARY.md
@.planning/phases/01-security-cost-control/01-03-token-budget-SUMMARY.md
@.planning/phases/01-security-cost-control/01-04-sanitizer-SUMMARY.md
@.planning/phases/01-security-cost-control/01-05-observability-SUMMARY.md
@.planning/phases/01-security-cost-control/01-06-sse-abort-SUMMARY.md

<interfaces>
<!-- Artifacts produced by Plans 01-06 that this plan consumes. -->

From Plan 02:
- `app/supabase/migrations/016_user_quotas.sql` — tiers seed + ledger + RPC

From Plan 05:
- `app/supabase/migrations/017_cost_metrics.sql` — cost_metrics_raw + cost_metrics tables
- `vercel.json` — includes cost-rollup cron schedule

Smoke scripts produced by prior plans:
- `app/scripts/smoke/sec-01-curl.sh` — Plan 01 (SEC-01: auth gate)
- `app/scripts/smoke/sec-02-quota.sh` — Plan 02 (SEC-02: quota 429 on 6th anon request)
- `app/scripts/smoke/sec-04-injection.sh` — Plan 04 (SEC-04: `[[` → 400)
- `app/scripts/smoke/sec-06-disconnect.sh` — Plan 06 (SEC-06: manual-observed disconnect)

Environment variables required at production deploy:
- `ANTHROPIC_API_KEY` (existing)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (existing)
- `CRON_SECRET` (existing or to be set — used by morning-sheet, cost-rollup, smoke scripts)
- `PHASE_1_GATE_ENABLED=true` (NEW — the flag this plan flips)

Rollback:
- Single env var change: flip `PHASE_1_GATE_ENABLED=true` → `PHASE_1_GATE_ENABLED=false`. Vercel triggers a redeploy with the old behavior. No code revert needed.
- Migrations are additive-only (CREATE TABLE IF NOT EXISTS, INSERT ON CONFLICT DO NOTHING) — no destructive rollback needed.
</interfaces>
</context>

<tasks>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 1: Apply Supabase migrations 016 + 017 via dashboard</name>
  <files>
    app/supabase/migrations/016_user_quotas.sql,
    app/supabase/migrations/017_cost_metrics.sql
  </files>
  <action>
**PAUSE FOR OPERATOR — Supabase migrations are manual via dashboard SQL editor (PROJECT.md constraint). Code push alone does NOT apply them.**

The operator performs these steps; the executor resumes when confirmation is received.

**Step 1 — Apply 016_user_quotas.sql:**
1. Open Supabase dashboard → Project → SQL Editor → New Query.
2. Copy-paste the contents of `app/supabase/migrations/016_user_quotas.sql`.
3. Click "Run". Expect: success message, no errors.
4. Verify: open a new query tab and run `SELECT count(*) FROM user_quotas_tiers;` — expect `3`.
5. Also verify: `SELECT tier, req_limit, token_limit FROM user_quotas_tiers ORDER BY tier;` — expect:
   - anonymous | 5 | 10000
   - free | 50 | 100000
   - operate | 500 | 2000000

**Step 2 — Apply 017_cost_metrics.sql:**
1. In the SQL Editor → New Query.
2. Copy-paste contents of `app/supabase/migrations/017_cost_metrics.sql`.
3. Click "Run". Expect: success.
4. Verify: `SELECT table_name FROM information_schema.tables WHERE table_name IN ('cost_metrics', 'cost_metrics_raw');` — expect both rows returned.

**Step 3 — Safety check:** Both tables exist and accept a test insert via service-role (optional — smoke script in Task 3 exercises this end-to-end).

**Operator resume signal:** Paste verify-query output OR type "migrations applied" after confirming the row counts above.
  </action>
  <verify>
    <automated>MISSING — manual-apply via Supabase dashboard per PROJECT.md. Operator confirms the SELECT count and table-exists queries output 3 rows and both table names respectively.</automated>
  </verify>
  <done>
    - `SELECT count(*) FROM user_quotas_tiers` returned 3.
    - `SELECT table_name ...` returned both `cost_metrics` and `cost_metrics_raw`.
    - Operator signalled "migrations applied" or pasted verify-query output.
  </done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 2: Set PHASE_1_GATE_ENABLED=true in Vercel production</name>
  <files>
    (Vercel environment — no repo files; settings live in Vercel dashboard)
  </files>
  <action>
**PAUSE FOR OPERATOR — Vercel env var flip requires dashboard access.**

**Step 1 — Set the flag:**
1. Open Vercel dashboard → Project (huma-two) → Settings → Environment Variables.
2. Add a new variable (or edit if it exists):
   - Name: `PHASE_1_GATE_ENABLED`
   - Value: `true`
   - Environments: Production (AND Preview if you want it enabled there too)
3. Click Save.
4. Trigger a production redeploy (either push an empty commit OR use Vercel dashboard → Deployments → Redeploy → Production).
5. Wait for deployment to go live (~1-2 minutes).

**Step 2 — Verify CRON_SECRET is set in production:**
- If not already set: generate a random 32-byte token (`openssl rand -hex 32`), add as `CRON_SECRET` in the same env-vars page, redeploy.
- Copy the token value — you'll need it for Tasks 3 and 4.

**Step 3 — Confirm deployment live:** Dashboard shows "Ready" status for the latest production deployment after the env change.

**Step 4 — Operator verifies with curl:**
```bash
curl -sS -o /dev/null -w "%{http_code}" -X POST https://huma-two.vercel.app/api/v2-chat \
  -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"hi"}]}'
```
Expected output: `401`. If you see `200` or `500`, the env flip didn't take — check deployment status and retry.

**Operator resume signal:** Type "gate enabled, 401 confirmed" with the curl output OR describe any deviation.
  </action>
  <verify>
    <automated>MISSING — requires Vercel dashboard access. Operator confirms production curl to /api/v2-chat returns HTTP 401 after flag flip.</automated>
  </verify>
  <done>
    - `PHASE_1_GATE_ENABLED=true` set in Vercel production environment.
    - `CRON_SECRET` set in Vercel production environment (generated if missing).
    - Production deployment shows "Ready" status.
    - curl to `/api/v2-chat` (unauth) returns 401.
    - Operator signalled "gate enabled, 401 confirmed".
  </done>
</task>

<task type="auto">
  <name>Task 3: Run automated smoke triad against production (sec-01, sec-02, sec-04)</name>
  <files>
    app/scripts/smoke/sec-01-curl.sh,
    app/scripts/smoke/sec-02-quota.sh,
    app/scripts/smoke/sec-04-injection.sh
  </files>
  <action>
Run the three automated smoke scripts against the live production deployment. Each must exit 0.

**Pre-req:** operator provides `CRON_SECRET` (set in Task 2) and, for sec-02, an `ANON_JWT` obtained by:
  1. Opening https://huma-two.vercel.app/start in a fresh incognito tab.
  2. Opening dev tools → Application → Cookies → copying `sb-access-token` value (or whatever cookie name Supabase emits).
  3. Export as `ANON_JWT` env var in the shell where you'll run the smoke.

**Step 1 — SEC-01 smoke:**
```bash
cd app
BASE_URL=https://huma-two.vercel.app CRON_SECRET="$CRON_SECRET" bash scripts/smoke/sec-01-curl.sh
```
Expect: 3 lines of "[N/3]" output + "SEC-01 smoke: PASS" + exit 0.

**Step 2 — SEC-02 smoke:**
```bash
cd app
BASE_URL=https://huma-two.vercel.app ANON_JWT="$ANON_JWT" bash scripts/smoke/sec-02-quota.sh
```
Expect: 5 lines of "[1/5]..[5/5]" each printing non-429 status + a 6th call returning a RATE_LIMITED body + "SEC-02 smoke: PASS" + exit 0.
- If the anon user already consumed requests this day, reset by using a fresh incognito tab (new anon user) and re-export ANON_JWT.

**Step 3 — SEC-04 smoke:**
```bash
cd app
BASE_URL=https://huma-two.vercel.app CRON_SECRET="$CRON_SECRET" bash scripts/smoke/sec-04-injection.sh
```
Expect: 3 lines of "[N/3]" output + "SEC-04 smoke: PASS" + exit 0.

**If any script fails:** flag the specific failure; DO NOT proceed to Task 4. Roll back via Task 6 and debug.
  </action>
  <verify>
    <automated>cd app && BASE_URL=https://huma-two.vercel.app CRON_SECRET="$CRON_SECRET" bash scripts/smoke/sec-01-curl.sh && BASE_URL=https://huma-two.vercel.app ANON_JWT="$ANON_JWT" bash scripts/smoke/sec-02-quota.sh && BASE_URL=https://huma-two.vercel.app CRON_SECRET="$CRON_SECRET" bash scripts/smoke/sec-04-injection.sh</automated>
  </verify>
  <done>
    - sec-01 script exits 0; 401 confirmed on unauth `/api/v2-chat` + `/api/sheet`; 200 (or non-401) on CRON_SECRET bearer `/api/sheet`.
    - sec-02 script exits 0; 6th anon request returns RATE_LIMITED body with `tier:"anonymous"`.
    - sec-04 script exits 0; `[[` and `]]` both return 400; silent-strip path returns non-400.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 4: Run sec-06 manual-observed smoke + inspect Vercel logs</name>
  <files>
    app/scripts/smoke/sec-06-disconnect.sh
  </files>
  <action>
**PAUSE FOR OPERATOR — Manual verification via Vercel log inspection is required for SEC-06 (documented in VALIDATION.md Manual-Only section).**

Operator performs the following; executor resumes when the abort signature is confirmed.

**Step 1 — Run the smoke script against production:**
```bash
cd app
BASE_URL=https://huma-two.vercel.app ANON_JWT="$ANON_JWT" bash scripts/smoke/sec-06-disconnect.sh
```
Script will:
- Send a POST to `/api/v2-chat` with `curl -N` (streaming).
- Kill curl after ~100ms.
- Print a reminder to inspect Vercel logs.

**Step 2 — Open Vercel logs:**
1. Vercel Dashboard → Project → Logs (or go directly to `/projects/huma-two/logs`).
2. Filter: function `/api/v2-chat`, last 5 minutes.
3. Find the log entry matching your curl run (use timestamp).

**Step 3 — Confirm abort signature. Either (a) OR (b) must hold:**
- (a) A log line (from the SDK or our route) containing `APIUserAbortError`, OR
- (b) A structured JSON log with `route:"/api/v2-chat"`, `status:200`, `latency_ms < 500` (much shorter than a typical 2-5s stream), and `output_tokens: 0` or a small partial count.

Both indicate the stream was aborted before Anthropic returned full usage metadata.

**Step 4 — Record the `req_id` from that log entry** for audit. It will be pasted into the Plan 07 summary in Task 6.

**If neither (a) nor (b) holds** (e.g., log shows `output_tokens > 500` and `latency_ms > 3000`): SEC-06 is NOT working — the stream ran to completion and we paid for tokens the client never read. Roll back via Task 6; debug.

**Operator resume signal:** Paste the matching `req_id` + confirm (a) or (b) holds. If neither: describe what you saw for diagnosis.
  </action>
  <verify>
    <automated>MISSING — manual verification per VALIDATION.md. Operator confirms APIUserAbortError entry OR short-latency partial stream in Vercel logs for the emitted req_id.</automated>
  </verify>
  <done>
    - Smoke script executed against production; curl terminated mid-stream.
    - Vercel log for the matching req_id shows EITHER `APIUserAbortError` OR `status:200 + latency_ms < 500 + output_tokens < typical`.
    - Operator recorded the req_id for the summary.
  </done>
</task>

<task type="auto">
  <name>Task 5: Document rollback procedure in STATE.md + mark Phase 1 complete</name>
  <files>
    .planning/STATE.md,
    .planning/ROADMAP.md
  </files>
  <action>
Step 1 — Append a "Rollback Procedures" section to `.planning/STATE.md` (or update an existing one):

```markdown
## Rollback Procedures

### Phase 1 (Security & Cost Control) — rollback from enabled state
**When to use:** if post-enablement monitoring shows a regression (error rate >2%, p99 latency >10s, or user-reported breakage).

**Steps (one-click rollback — no code revert needed):**
1. Vercel Dashboard → Project → Settings → Environment Variables.
2. Edit `PHASE_1_GATE_ENABLED` → change value to `false`.
3. Save. Trigger redeploy (or wait for Vercel to auto-redeploy).
4. Smoke: `curl -sS -o /dev/null -w "%{http_code}" -X POST https://huma-two.vercel.app/api/v2-chat -d '{}'` — should return 400 (validation), NOT 401 (indicating gate is now disabled).

**What rollback preserves:**
- Both Supabase migrations (016, 017) stay applied — they're additive-only; no destructive rollback needed.
- All Plan 01-06 code remains merged — gates behind the flag return to no-op paths.
- Any rows written to `user_quota_ledger` / `cost_metrics_raw` / `cost_metrics` remain (useful for diagnosing what went wrong).

**What rollback does NOT preserve:**
- The gate itself — pre-auth chat becomes open again until the flag flips back.

**Re-enabling after a fix:**
1. Merge the fix.
2. Flip `PHASE_1_GATE_ENABLED=true`.
3. Re-run the smoke triad (Tasks 3 + 4 of Plan 07).
```

Step 2 — Update the Current Position block:

```markdown
## Current Position

Phase: 1 of 8 (Security & Cost Control) — COMPLETE as of <TODAY_DATE>
Plan: 7/7 complete
Status: Enabled in production (PHASE_1_GATE_ENABLED=true)
Last activity: <TODAY_DATE> — Phase 1 enabled; smoke triad green; SEC-06 manual verify req_id: <REQ_ID>
```
Substitute `<TODAY_DATE>` with today's date and `<REQ_ID>` with the req_id from Task 4.

Step 3 — Update STATE.md progress metrics:
- Bump `completed_phases` from 0 to 1 in the YAML frontmatter.
- Update `progress.percent` to 12 (1/8 = 12.5%, round down to 12).
- Update the phase-row `1. Security & Cost Control` in the "By Phase" table — set Plans count to 7, Total to the actual execution time, Avg/Plan accordingly. If exact times aren't known, use approximate.

Step 4 — Mark the Phase 1 checkbox in `.planning/ROADMAP.md`:
```diff
- [ ] **Phase 1: Security & Cost Control (Plan P0)** - Auth-gate Anthropic routes, per-user token budgets, prompt-injection defense, observability, SSE disconnect handling
+ [x] **Phase 1: Security & Cost Control (Plan P0)** - Auth-gate Anthropic routes, per-user token budgets, prompt-injection defense, observability, SSE disconnect handling
```
Also update the `Progress` table at the bottom:
- `| 1. Security & Cost Control (P0) | 7/7 | Complete | <TODAY_DATE> |`

Step 5 — Stage both files for the final commit (Task 6 finalizes the commit):
```bash
git add .planning/STATE.md .planning/ROADMAP.md
git status .planning/STATE.md .planning/ROADMAP.md   # confirm both are staged
```
Do NOT commit yet — Task 6 is the explicit go/no-go + commit.
  </action>
  <verify>
    <automated>grep -q "Rollback Procedures" .planning/STATE.md && grep -Eq "^\- \[x\] \*\*Phase 1:" .planning/ROADMAP.md</automated>
  </verify>
  <done>
    - STATE.md has a "Rollback Procedures" section for Phase 1.
    - STATE.md Current Position updated to reflect Phase 1 complete with date + req_id.
    - STATE.md progress metrics reflect 1/8 complete.
    - ROADMAP.md Phase 1 checkbox marked `[x]`.
    - ROADMAP.md Progress table updated.
    - Both files staged (`git add`) but not yet committed.
  </done>
</task>

<task type="checkpoint:decision" gate="blocking">
  <name>Task 6: Final go/no-go decision + commit</name>
  <files>
    .planning/STATE.md,
    .planning/ROADMAP.md
  </files>
  <action>
**PAUSE FOR OPERATOR — explicit go/no-go decision on Phase 1 enablement.**

### Decision

Phase 1 is live. All six SEC requirements enabled in production. Confirm final state OR trigger rollback.

### Context

You've just flipped the feature flag and run the smoke triad. This checkpoint exists so you explicitly accept the new production state (or roll back if anything feels off — even a gut feeling counts this early in the rollout).

- Operationally: auth gate, per-user quotas, token budgets, sanitizer, observability, SSE abort are all live.
- Cost impact: nominal (all flows still work; only over-limit abusers see 429s).
- UX impact: none for good-faith users; anon users now correctly see a `<QuotaCard>` after 5 requests.
- Monitoring ahead: Phase 2 begins; in parallel, watch Vercel logs for unexpected 401/400/429 spikes over the next 24h.

### Options

**Option A — `accept` — Phase 1 is live**
- Pros: All smoke tests green; migrations applied; gate enabled. Ship it.
- Cons: If a regression emerges in the first 24h, you'll need to trigger rollback quickly.
- If selected, the executor runs:
  ```bash
  git commit -m "docs(01): phase 1 enabled in production — security & cost control live"
  ```

**Option B — `rollback` — something feels off**
- Pros: Single env-var flip restores prior behavior instantly.
- Cons: Re-enabling requires another round of smoke tests.
- If selected, the executor pauses while operator:
  1. Flips `PHASE_1_GATE_ENABLED=false` in Vercel.
  2. Triggers redeploy.
  3. Confirms unauth curl to `/api/v2-chat` returns 400 (validation), NOT 401.
  After rollback, the operator files a `/gsd:plan-phase 01 --gaps` follow-up to address whatever triggered the rollback.

### Operator resume signal

Select one:
- `accept` → executor commits STATE.md + ROADMAP.md with the message above; Phase 1 officially closes.
- `rollback` → executor pauses; operator performs the rollback steps; executor will then create a gap-closure plan.
  </action>
  <verify>
    <automated>MISSING — explicit operator go/no-go required. Verify via git log that the commit message contains "phase 1 enabled" after operator selects accept.</automated>
  </verify>
  <done>
    - Operator selected `accept` OR `rollback`.
    - If accept: STATE.md + ROADMAP.md committed with message "docs(01): phase 1 enabled in production — security & cost control live"; git log shows the commit.
    - If rollback: Vercel env reverted; follow-up gap-closure plan filed.
  </done>
</task>

</tasks>

<verification>
**Overall Phase 01-07 enablement checks:**

Operator-driven (checkpoint tasks 1, 2, 4, 6):
- Task 1 verifies migrations applied via SELECT queries.
- Task 2 verifies PHASE_1_GATE_ENABLED=true via 401 on unauth v2-chat.
- Task 4 verifies SEC-06 via Vercel log inspection for APIUserAbortError.
- Task 6 is the human go/no-go gate.

Executor-automated (task 3, 5):
- Task 3 runs automated smoke triad (sec-01/02/04) — must exit 0.
- Task 5 updates STATE.md + ROADMAP.md.

**No new Vitest tests in this plan** — all tests were green from Plans 01-06.

**Rollback is always available:** flip `PHASE_1_GATE_ENABLED=false` in Vercel → auto-redeploy → prior behavior restored. Migrations are additive-only so they stay applied regardless.
</verification>

<success_criteria>
- Both Supabase migrations (016, 017) applied and verified in production.
- `PHASE_1_GATE_ENABLED=true` set in Vercel production env; deployment live.
- SEC-01/02/04 smoke scripts all exit 0 against production.
- SEC-06 smoke: `APIUserAbortError` OR short-latency partial stream observed in Vercel logs for the emitted `req_id`.
- STATE.md has documented rollback procedure.
- ROADMAP.md Phase 1 checkbox marked complete.
- Operator explicitly accepts the live state (or triggers rollback).
- Phase 1 closes the door on the three remediation critiques that block everything else.
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-cost-control/01-07-enablement-SUMMARY.md` with:
- Date enabled
- req_id from SEC-06 manual verification
- Smoke triad results (paste exit codes / final lines)
- Any surprises or warnings observed
- Confirmation of operator sign-off at Task 6
- Metrics baseline for post-enablement monitoring:
  - Pre-flip 24h: request volume, error rate (from old logs if available)
  - Post-flip 24h: first-window numbers (captured by Plan 05's withObservability)
- Open follow-ups to revisit in Phase 2+:
  - Anonymous-user cleanup cron (CONTEXT.md deferred)
  - `/internal/cost` dashboard UI reading from cost_metrics
  - Voice Bible §02 banned-phrase CI check
</output>

---
phase: 01-security-cost-control
plan: 08
type: execute
wave: 1
depends_on: []
files_modified:
  - app/package.json
  - app/package-lock.json
  - app/src/lib/supabase-admin.ts
  - app/src/lib/quota.ts
  - app/src/lib/quota.test.ts
  - .planning/STATE.md
  - .planning/ROADMAP.md
  - .planning/REQUIREMENTS.md
  - .planning/phases/01-security-cost-control/deferred-items.md
autonomous: false
gap_closure: true
requirements:
  - SEC-02
user_setup:
  - service: supabase
    why: "Rotate SUPABASE_SERVICE_ROLE_KEY to current sb_secret_* format after SDK upgrade"
    env_vars:
      - name: SUPABASE_SERVICE_ROLE_KEY
        source: "Supabase Dashboard -> Project Settings -> API -> Project API keys -> 'service_role' (copy current value; it is now an sb_secret_* format key)"
    dashboard_config:
      - task: "Confirm in Supabase dashboard that legacy JWT keys are disabled for this project and the active service_role key is in sb_secret_* format"
        location: "Supabase Dashboard -> Project Settings -> API"
      - task: "Paste the current sb_secret_* service_role key into Vercel production environment as SUPABASE_SERVICE_ROLE_KEY and trigger a redeploy"
        location: "Vercel Dashboard -> huma-two -> Settings -> Environment Variables"
must_haves:
  truths:
    - "@supabase/supabase-js upgraded to a version that natively accepts the sb_secret_* service_role key format (>= 2.104.0 or latest 2.x)"
    - "Admin Supabase client in createAdminSupabase() successfully signs RPC calls to increment_quota_and_check in production"
    - "user_quota_ledger row count is > 0 in Supabase production after authenticated traffic (evidence: SELECT count(*) FROM user_quota_ledger > 0)"
    - "scripts/smoke/sec-02-quota.sh against https://huma-two.vercel.app exits 0 (5 x 200 then 1 x 429 with {code:'RATE_LIMITED', tier:'anonymous', suggest:'sign_in', resetAt:ISO})"
    - "scripts/smoke/sec-03-budget.sh against production exits 0 (100 msgs no X-Huma-Truncated header; 600 msgs yields X-Huma-Truncated: count=N,reason=budget)"
    - "scripts/smoke/sec-04-injection.sh against production exits 0 ([[/]] returns 400 'reserved marker'; injection prefix does NOT 400)"
    - "quota.ts fail-open branch is no longer silent: emits a structured stderr warning tagged with component=quota, severity=WARN, req_id, user_id, route, error_message so future runtime auth failures surface in Vercel log search"
    - "Existing 697/697 Vitest suite remains green (no regressions from SDK upgrade or fail-open warning)"
    - "All Phase 1 requirement statuses truthful: SEC-02 flips from 'Partial' to 'Complete' in REQUIREMENTS.md, ROADMAP.md Phase 1 row, and STATE.md"
  artifacts:
    - path: "app/package.json"
      provides: "Upgraded @supabase/supabase-js dependency accepting sb_secret_* format"
      contains: "@supabase/supabase-js"
    - path: "app/src/lib/supabase-admin.ts"
      provides: "createAdminSupabase() that works with upgraded SDK; tolerates both JWT (legacy) and sb_secret_* secret key formats without branching"
      exports: ["createAdminSupabase"]
    - path: "app/src/lib/quota.ts"
      provides: "checkAndIncrement() fail-open branch emits structured WARN log (not silent console.error) so production degradation is visible in Vercel log search"
      contains: "severity"
    - path: "app/src/lib/quota.test.ts"
      provides: "Updated fail-open test asserts structured warning payload is emitted"
      contains: "severity"
    - path: ".planning/STATE.md"
      provides: "Phase 1 marked fully complete; SEC-02 blocker removed from Blockers/Concerns; completed_phases bumped to 1"
      contains: "completed_phases: 1"
    - path: ".planning/ROADMAP.md"
      provides: "Phase 1 checkbox flipped to [x]; Progress row shows Complete; SEC-02 annotation removed"
      contains: "[x] **Phase 1"
    - path: ".planning/REQUIREMENTS.md"
      provides: "SEC-02 flipped from [~] Partial to [x] Complete; Traceability row updated"
      contains: "[x] **SEC-02**"
    - path: ".planning/phases/01-security-cost-control/deferred-items.md"
      provides: "SEC-02 credential-migration entry marked RESOLVED with date + fix approach + verification evidence"
      contains: "RESOLVED"
  key_links:
    - from: "app/src/lib/supabase-admin.ts::createAdminSupabase()"
      to: "@supabase/supabase-js createClient() (upgraded SDK accepting sb_secret_* format)"
      via: "createClient(url, serviceKey, {...}) where serviceKey is now the sb_secret_* value set in Vercel prod env"
      pattern: "createClient\\("
    - from: "app/src/lib/quota.ts::checkAndIncrement()"
      to: "Postgres increment_quota_and_check RPC (via upgraded admin client)"
      via: "admin.rpc('increment_quota_and_check', {p_user_id, p_route, p_input_tokens, p_req_id})"
      pattern: "rpc\\(['\"]increment_quota_and_check"
    - from: "app/src/lib/quota.ts fail-open catch branch"
      to: "Vercel log search (stderr JSON line)"
      via: "console.warn(JSON.stringify({component:'quota', severity:'WARN', req_id, user_id, route, error_message}))"
      pattern: "severity.*WARN"
    - from: "Production POST /api/v2-chat (authenticated anon)"
      to: "user_quota_ledger row INSERT + UPDATE via RPC"
      via: "End-to-end path: requireUser -> budgetCheck -> checkAndIncrement -> admin.rpc() -> SECURITY DEFINER function -> table write"
      pattern: "user_quota_ledger"
---

<objective>
Close the SEC-02 runtime-enforcement gap identified in 01-VERIFICATION.md.

Phase 1 shipped 10/10 plans code-complete behind `PHASE_1_GATE_ENABLED=true`. Five of six requirements are enforcing in production. SEC-02 is silently off: the admin Supabase client (`createAdminSupabase()`) cannot authenticate its RPC call to `increment_quota_and_check` because Supabase disabled legacy service_role JWT keys on 2026-04-20, and the installed `@supabase/supabase-js@2.99.2` predates native support for the replacement `sb_secret_*` key format. The RPC fails auth, `quota.ts:103-116` catches the error and fails open (`allowed: true`), and the caller silently returns 200. Evidence: `SELECT count(*) FROM user_quota_ledger = 0` in production despite live authenticated traffic.

### Fix path selected

**Path 1 — Upgrade `@supabase/supabase-js`** from `^2.99.2` to `^2.104.0` (latest stable 2.x as of 2026-04-21). This is the lowest-surface-area fix: a single dependency bump, no application-code branching on key format, no short-term keep-the-legacy-key shim that will rot again when Supabase next rotates.

Paths 2 (re-enable legacy keys) and 3 (format-detection branch in `createAdminSupabase`) are explicitly rejected:

- **Path 2 rejected:** re-enabling legacy keys is explicit debt — Supabase will disable them again. Storing a soon-dead secret in Vercel prod is worse than keeping the current failing state because it hides the real fix for longer.
- **Path 3 rejected:** format-detection branching adds code surface (more to test, more to break) for zero durable benefit once Path 1 is done. If Path 1's upgrade breaks the SDK surface this plan uses (tested in Task 1 via the existing `quota.test.ts` + full suite), we fall back to Path 3 — but only then.

### Hardening delivered alongside the fix

The same plan removes one `quota.ts` anti-pattern flagged in VERIFICATION.md §Anti-Patterns: the fail-open catch branch currently emits `console.error("[quota] ... allowing request: ...")` which is easy to miss in Vercel log search. Task 1 upgrades the log to a structured JSON line with `severity: "WARN"` + `component: "quota"` + `req_id`/`user_id`/`route`/`error_message` so any future runtime credential failure is visible via a single `severity:WARN component:quota` search term. This is the sentinel VERIFICATION.md asked for — no timer needed, just immediate log visibility.

### Deliberately out of scope

- **Model-id migration** (Sonnet 4 retires 2026-06-15 per RESEARCH.md State of the Art). Flagged elsewhere, not in Phase 1.1 scope.
- **Anonymous user cleanup cron** (CONTEXT.md deferred to Phase 2+).
- **PostHog instrumentation of 429 events** (deferred to Phase 4).
- **Inner-route token attribution for morning-sheet cron** (Plan 05c documented gap — Phase 2+).

### Why this plan is not autonomous

Two operator checkpoints are unavoidable: rotating the Vercel env var value (`SUPABASE_SERVICE_ROLE_KEY` must be pasted from the Supabase dashboard into Vercel) and running the production smoke suite with operator-provided `ANON_JWT` / `CRON_SECRET` (this execution context cannot read Vercel prod secrets). Both are explicitly framed as post-deploy checkpoints — Task 1 is fully automated; Tasks 2 and 3 are human-action / human-verify.

### Rollback

If the SDK upgrade breaks anything (detected in Task 1's `npm test` run OR Task 3's smoke failures): revert the two code changes (`git revert` the Task-1 commit), keep `PHASE_1_GATE_ENABLED=true` (SEC-01/03/04/05/06 continue to enforce), and either re-plan Path 3 (format-detection branch) as plan 01-09 OR accept Path 2's short-term legacy-key re-enable while Path 3 is planned.

Output: `@supabase/supabase-js` upgraded; `quota.ts` fail-open sentinel upgraded; operator rotates prod env + redeploys; production smoke quad (SEC-02/03/04 + existing SEC-01) all exit 0; `user_quota_ledger` count > 0 in Supabase dashboard; STATE.md / ROADMAP.md / REQUIREMENTS.md / deferred-items.md reflect the close.
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
@.planning/REQUIREMENTS.md
@.planning/phases/01-security-cost-control/01-CONTEXT.md
@.planning/phases/01-security-cost-control/01-RESEARCH.md
@.planning/phases/01-security-cost-control/01-VERIFICATION.md
@.planning/phases/01-security-cost-control/01-02-quota-ledger-PLAN.md
@.planning/phases/01-security-cost-control/01-02-quota-ledger-SUMMARY.md
@.planning/phases/01-security-cost-control/01-07-enablement-SUMMARY.md
@.planning/phases/01-security-cost-control/deferred-items.md

<interfaces>
<!-- Key code surface this plan consumes or modifies. Executor does not need to explore the codebase. -->

From app/src/lib/supabase-admin.ts (EXISTING — will be edited, ~20 lines today):
```typescript
import { createClient } from "@supabase/supabase-js";

export function createAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL");
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
```
With `@supabase/supabase-js@^2.104.0`, this exact code accepts both legacy JWT and `sb_secret_*` service keys. No branching needed. The upgrade is a dependency bump + existing call surface validation, not a code rewrite.

From app/src/lib/quota.ts lines 103-116 (EXISTING fail-open branch — will be edited, ~14 lines):
```typescript
if (error) {
  console.error(
    "[quota] increment_quota_and_check failed, allowing request:",
    error.message,
  );
  // Fail open — availability beats cost correctness when the ledger is down.
  return {
    allowed: true,
    tier: "free",
    resetAt: new Date(Date.now() + 86_400_000).toISOString(),
    reqCount: 0,
    tokenCount: 0,
  };
}
```
The semantic of "fail open" stays — only the log surface changes (structured JSON line with `severity: "WARN"`).

From app/src/lib/quota.test.ts (EXISTING — one test case "fails open when RPC errors" needs to assert the new warning shape):
```typescript
it("checkAndIncrement fails open (allowed=true) when RPC errors", async () => {
  const rpc = vi.fn(async () => ({
    data: null,
    error: { message: "connection refused" },
  }));
  // ... existing assertion: expect(result.allowed).toBe(true)
  // NEW assertion: the structured warn payload was emitted
});
```

From @supabase/supabase-js latest 2.x (2.104.0 confirmed available on npm, 2026-04-21):
```typescript
export function createClient(
  supabaseUrl: string,
  supabaseKey: string,                 // accepts JWT OR sb_secret_* formats natively
  options?: SupabaseClientOptions
): SupabaseClient;
```
No signature break vs 2.99.2 — only internal request-signing logic updated to dispatch based on key format.

From app/scripts/smoke/sec-02-quota.sh (EXISTING, will be run not edited):
- Requires `ANON_JWT` env var (anonymous-signin access_token from target Supabase project)
- Expects 5 x 200 then 1 x 429 with `{code:"RATE_LIMITED", tier:"anonymous", suggest:"sign_in", resetAt:ISO}`
- Exit 0 on success

From app/scripts/smoke/sec-03-budget.sh (EXISTING, will be run not edited):
- Requires `ANON_JWT` or `COOKIE`
- 100 msgs x 1KB = ~25K tokens -> 200, no X-Huma-Truncated header
- 600 msgs x 1KB = ~150K tokens -> 200, X-Huma-Truncated: count=N,reason=budget header present

From app/scripts/smoke/sec-04-injection.sh (EXISTING, will be run not edited):
- Requires `CRON_SECRET`
- `[[`/`]]` content -> 400 with "reserved marker" in body
- Injection prefix (e.g., "ignore previous instructions...") -> NOT 400 (stripped silently)

From .planning/STATE.md (EXISTING — will be edited):
- Current `completed_phases: 0` (honest — Phase 1 is partial)
- `Blockers/Concerns` section has SEC-02 entry (will be removed/marked resolved)

From .planning/REQUIREMENTS.md (EXISTING — will be edited):
- `SEC-02`: `[~]` Partial (line 14) + Traceability row "Partial - deferred to Phase 1.1"
- Both rows flip to `[x]` Complete + "Complete"

Rollback signal: if the SDK upgrade causes any existing test to fail, do NOT proceed to Task 2. `git revert` the Task-1 commit, document in deferred-items.md, and re-plan Path 3.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Upgrade @supabase/supabase-js + non-silent fail-open warning + regression suite</name>
  <files>
    app/package.json,
    app/package-lock.json,
    app/src/lib/supabase-admin.ts,
    app/src/lib/quota.ts,
    app/src/lib/quota.test.ts
  </files>
  <behavior>
    - `@supabase/supabase-js` resolves to `^2.104.0` (or latest stable 2.x at install time) in package.json + package-lock.json.
    - `createAdminSupabase()` still passes its existing surface-area tests (no signature change; the SDK upgrade is internally compatible).
    - `quota.ts` fail-open branch emits a structured warning line via `console.warn(JSON.stringify({...}))` with keys: `component:"quota"`, `severity:"WARN"`, `event:"increment_quota_and_check_failed"`, `error_message`, `user_id`, `route`, `req_id` (last three passed through from args). The old `console.error("[quota] ... allowing request:")` line is removed — replaced, not duplicated.
    - `quota.test.ts` "fails open (allowed=true) when RPC errors" case also asserts the structured JSON warning was emitted with the expected shape. New helper `captureWarn()` at test-file scope wraps `vi.spyOn(console, "warn")`.
    - All existing 697 tests (at Phase 1 close) plus the one new-shape assertion pass: `cd app && npm test` exits 0.
    - No TypeScript build regression: `cd app && npx tsc --noEmit` exits 0 (or surfaces ONLY the two pre-existing deferred `BudgetResult` narrowing errors from deferred-items.md — no new errors introduced by this task).
    - No other file changes — surgical. In particular: no re-architecture of `createAdminSupabase()` (Path 3 rejected unless Path 1 breaks the suite).
  </behavior>
  <action>
Step 1 — Upgrade the SDK. From the repo root:
```bash
cd app
npm install @supabase/supabase-js@^2.104.0 --save-exact=false
```
Confirm the new version in `app/package.json` is >= 2.104.0 and that `app/package-lock.json` is updated consistently. If npm picks up a newer `2.x` that is stable, accept it — the floor is 2.104.0 because that's the first version confirmed available post-`sb_secret_*` rollout (per npm registry query 2026-04-21).

Do NOT cross the 3.x major boundary (3.0.0-next.0 is pre-release as of 2026-04-21 and is out of scope for this patch).

Step 2 — Verify `createAdminSupabase()` still type-checks against the new SDK:
```bash
cd app && npx tsc --noEmit src/lib/supabase-admin.ts 2>&1 | head -20
```
Expect: zero errors on that file. If the SDK upgrade broke the `createClient` signature, that is a STOP signal — revert the package.json change and flag for Path 3 planning. (Do not try to patch the signature yourself in this plan.)

Step 3 — Edit `app/src/lib/quota.ts` fail-open branch (lines 103-116 approximately). Replace the existing block with:
```typescript
  if (error) {
    // Fail open — availability beats cost correctness when the ledger is down.
    // Emit a STRUCTURED warning so the degradation is visible in Vercel log
    // search (searchable via component=quota severity=WARN). This upgrades
    // the prior `console.error("[quota] ...")` surface that VERIFICATION.md
    // §Anti-Patterns flagged as silent in production.
    console.warn(
      JSON.stringify({
        component: "quota",
        severity: "WARN",
        event: "increment_quota_and_check_failed",
        error_message: error.message,
        user_id: userId,
        route,
        req_id: reqId ?? null,
      }),
    );
    return {
      allowed: true,
      tier: "free",
      resetAt: new Date(Date.now() + 86_400_000).toISOString(),
      reqCount: 0,
      tokenCount: 0,
    };
  }
```
The semantics (allowed=true, tier=free, 24h resetAt) are preserved exactly. Only the log shape and channel (warn vs error) change. `console.warn` is routed to stderr on Vercel and shows up in the same log stream — no infrastructure change needed.

Step 4 — Update `app/src/lib/quota.test.ts` existing "fails open (allowed=true) when RPC errors" case to also assert the structured payload. Surgical — do not rewrite other cases.

Locate the test block (approximately the last `it(...)` in the file). Replace it with:
```typescript
  it("checkAndIncrement fails open (allowed=true) when RPC errors AND emits structured WARN", async () => {
    const rpc = vi.fn(async () => ({
      data: null,
      error: { message: "connection refused" },
    }));
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => ({
        auth: { admin: { getUserById: vi.fn() } },
        from: vi.fn(),
        rpc,
      }),
    }));

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const { checkAndIncrement } = await import("./quota");
      const result = await checkAndIncrement("u-1", "/api/v2-chat", 100, "01JREQABCD");

      // Availability > correctness when RPC is down: allow the request.
      expect(result.allowed).toBe(true);

      // Hardening: the fail-open path must NOT be silent. Vercel log search
      // must find the degradation via `component=quota severity=WARN`.
      expect(warnSpy).toHaveBeenCalledOnce();
      const arg = warnSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(arg) as Record<string, unknown>;
      expect(parsed).toMatchObject({
        component: "quota",
        severity: "WARN",
        event: "increment_quota_and_check_failed",
        user_id: "u-1",
        route: "/api/v2-chat",
        req_id: "01JREQABCD",
      });
      expect(typeof parsed.error_message).toBe("string");
    } finally {
      warnSpy.mockRestore();
    }
  });
```

Step 5 — Run targeted unit tests first:
```bash
cd app && npm test -- src/lib/quota.test.ts
```
Expect all 7 cases green (6 unchanged + 1 replaced with new assertion).

Step 6 — Run the full suite to catch any SDK-upgrade regressions:
```bash
cd app && npm test
```
Expect 697/697 green (or 697/697 minus 1 + 1 where the one case is the updated fail-open one — net equal). If ANY other test failed, the SDK upgrade broke something; STOP and flag for Path 3 replanning (do NOT proceed to Task 2 until resolved).

Step 7 — Run tsc to ensure no new TypeScript errors:
```bash
cd app && npx tsc --noEmit 2>&1 | grep -E "^(.*\.tsx?\()" | head -30
```
Expect: either zero errors, OR only the two pre-existing `BudgetResult` narrowing lines in `v2-chat/route.ts` and `sheet/route.ts` flagged in deferred-items.md. No NEW errors.

Step 8 — Stage all the files and hand off to Task 2 (no commit yet — the commit is part of Task 3 so STATE/ROADMAP updates go in the same commit as the verified fix):
```bash
cd C:\HUMAHUMA
git add app/package.json app/package-lock.json app/src/lib/quota.ts app/src/lib/quota.test.ts
git status app/ app/src/lib/
```
Do NOT stage `supabase-admin.ts` unless the file actually changed (it shouldn't — the whole bet of Path 1 is that this file's code is already correct). If `git diff app/src/lib/supabase-admin.ts` is empty, that's expected and confirms Path 1 is working.

**STOP signal for Task 1:** if any of steps 5, 6, or 7 fail, do not proceed to Task 2. Revert `app/package.json` + `app/package-lock.json` via `git checkout -- app/package.json app/package-lock.json && cd app && npm install`, document the specific failure in `.planning/phases/01-security-cost-control/deferred-items.md` under a new heading "## From Plan 01-08 (sec02-admin-credentials)", and return a "## PLANNING INCONCLUSIVE" signal flagging that Path 1 broke Y and Path 3 is needed. Do not attempt Path 3 in this plan.
  </action>
  <verify>
    <automated>cd app && npm install && npm test -- src/lib/quota.test.ts && npm test && npx tsc --noEmit 2>&1 | grep -E "error TS" | grep -v "BudgetResult\|tooLarge\|trimmedCount\|inputTokens.*does not exist" | head -5 | (read line && echo "NEW TS ERROR: $line" && exit 1 || exit 0)</automated>
  </verify>
  <done>
    - `app/package.json` shows `@supabase/supabase-js` at `^2.104.0` or newer stable 2.x.
    - `app/package-lock.json` updated consistently (the upgrade installed cleanly).
    - `app/src/lib/quota.ts` fail-open branch uses `console.warn(JSON.stringify({component:"quota", severity:"WARN", ...}))` — searchable in Vercel logs.
    - `app/src/lib/quota.test.ts` "fails open" case asserts the structured warn payload shape in addition to `allowed=true`.
    - `cd app && npm test` passes 697/697 (or equivalent with the one updated case).
    - `cd app && npx tsc --noEmit` introduces no new errors beyond the two pre-existing deferred ones.
    - Files staged (not committed) ready for Task 3's atomic close-out commit.
  </done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 2: Operator rotates SUPABASE_SERVICE_ROLE_KEY in Vercel prod + triggers redeploy</name>
  <files>
    (no code files — Vercel dashboard + Supabase dashboard are live surfaces)
  </files>
  <action>
**PAUSE FOR OPERATOR — Vercel env var rotation requires dashboard access that this execution context does not have.**

### Why human

Vercel production env vars cannot be read or written from the execution context. The operator must copy the current service_role value from Supabase and paste it into Vercel. The upgrade in Task 1 is necessary but not sufficient — the key format on disk in Vercel must match what the upgraded SDK expects.

### Step 1 — Confirm Supabase service key format

1. Supabase Dashboard -> Project (huma) -> Project Settings -> API
2. Scroll to "Project API keys" -> "service_role" section
3. Confirm the value begins with `sb_secret_` (i.e. the new format). If it still begins with `eyJ` (JWT format), click "Reveal" / "Rotate" to generate the new-format key. Do NOT re-enable legacy keys — Path 2 is explicitly rejected.
4. Copy the `sb_secret_*` value to clipboard.

### Step 2 — Paste into Vercel

1. Vercel Dashboard -> Project (huma-two) -> Settings -> Environment Variables
2. Find `SUPABASE_SERVICE_ROLE_KEY` in the "Production" environment.
3. Edit -> paste the new `sb_secret_*` value -> Save.
4. If the value is ALREADY an `sb_secret_*` value and matches what Supabase shows: no paste needed. The upgraded SDK in Task 1 is sufficient. Skip to Step 3.

### Step 3 — Trigger a clean redeploy

Two options:

1. Vercel Dashboard -> Deployments -> most recent Production deploy -> "..." menu -> "Redeploy" -> check "Use existing Build Cache" OFF -> Redeploy. (Forces a fresh build against the upgraded `package.json` and picks up the env change.)
2. OR push Task 1's local commit to `main` once Task 3 creates the commit. Auto-deploy will pick it up.

Either way, wait ~2 minutes for the deployment to reach "Ready" state.

### Step 4 — Confirm the deploy is healthy

1. From any terminal:
   ```bash
   curl -sS -o /dev/null -w "status=%{http_code}\n" \
     -X POST https://huma-two.vercel.app/api/v2-chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"hi"}]}'
   ```
   Expect: `status=401` (auth gate still enforcing; unchanged by this plan).

2. Vercel Dashboard -> Logs -> Filter to last 5 minutes. Confirm no startup errors referring to `SUPABASE_SERVICE_ROLE_KEY` or `createClient` / `invalid API key`.

### Operator resume signal

Paste the deploy URL + confirm "status=401" from Step 4, OR type `deployed and healthy`.

### Rollback if anything explodes

- If Vercel deploy fails to build with a message mentioning `@supabase/supabase-js`: Task 1 upgrade introduced an incompatibility. Revert via `git revert <Task-1 SHA>` (once Task 3 committed), push, let Vercel redeploy, then file a new plan for Path 3.
- If Vercel deploy succeeds but prod curl returns 500 instead of 401: the SDK upgrade is loading but the env value is bad. Re-verify the key paste in Step 2 (most common cause: whitespace / truncation).
  </action>
  <verify>
    <automated>MISSING — Vercel + Supabase dashboard access required. Operator confirms production curl returns 401 after redeploy with the updated service_role key.</automated>
  </verify>
  <done>
    - `SUPABASE_SERVICE_ROLE_KEY` in Vercel production env matches the current Supabase `sb_secret_*` service_role value (or was already correct).
    - Vercel production deployment is in "Ready" state with the upgraded `@supabase/supabase-js`.
    - Production `POST /api/v2-chat` without auth returns 401 (SEC-01 still enforcing — no regression from the upgrade).
    - Vercel logs show no startup or SDK-init errors for the deployment.
    - Operator signalled "deployed and healthy" (or equivalent) and provided the deploy URL.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Run production smoke quad + confirm ledger writes + commit STATE/ROADMAP/REQUIREMENTS/deferred-items updates atomically</name>
  <files>
    app/scripts/smoke/sec-02-quota.sh,
    app/scripts/smoke/sec-03-budget.sh,
    app/scripts/smoke/sec-04-injection.sh,
    .planning/STATE.md,
    .planning/ROADMAP.md,
    .planning/REQUIREMENTS.md,
    .planning/phases/01-security-cost-control/deferred-items.md
  </files>
  <action>
**PAUSE FOR OPERATOR — smoke runs need operator-provided `ANON_JWT` and `CRON_SECRET` (not readable from execution context); ledger verification needs Supabase dashboard read.**

### Why human

Operator must provide `ANON_JWT` (from anonymous-signin in an incognito session against production Supabase) and `CRON_SECRET` (from Vercel prod env). This execution context cannot obtain either. The Supabase SQL count verification requires dashboard login.

### Step 1 — Obtain an anonymous access token

Operator, from a shell with Supabase URL + anon key:
```bash
export SUPABASE_URL="https://<your-project>.supabase.co"
export SUPABASE_ANON_KEY="<your-publishable-anon-key>"   # sb_publishable_* format if rotated

export ANON_JWT=$(curl -sS -X POST "$SUPABASE_URL/auth/v1/signup" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"data":{}}' \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>{const j=JSON.parse(d);console.log(j.access_token||j.session?.access_token||"")})')

echo "ANON_JWT is $([ -n "$ANON_JWT" ] && echo set || echo EMPTY)"
```
Confirm `ANON_JWT` is a non-empty string starting with `eyJ` (user-level JWT, not service key).

### Step 2 — Run SEC-02 smoke (the critical one — this was FAILED in VERIFICATION.md)

```bash
cd C:\HUMAHUMA\app
BASE_URL=https://huma-two.vercel.app ANON_JWT="$ANON_JWT" bash scripts/smoke/sec-02-quota.sh
```

**Expect:**
- Lines `[1/5] ok`, `[2/5] ok`, ..., `[5/5] ok`
- `[6/6] PASS: 429 with {code:'RATE_LIMITED', tier:'anonymous', suggest:'sign_in', resetAt:'...'}`
- `SEC-02 smoke: PASS`
- Exit 0

**If 6th call returns 200 instead of 429:** SEC-02 is STILL failing open. Do not proceed. Check:
1. Did Vercel actually redeploy with the upgraded SDK? Vercel Dashboard -> Deployments -> confirm timestamp > Task 2 redeploy time.
2. Is the anon JWT truly anonymous? Decode it at jwt.io and confirm `is_anonymous: true`. If not, you got a permanent-user token — rerun Step 1.
3. Vercel logs for the request: filter to `/api/v2-chat` last 5 min. If you see `component:"quota" severity:"WARN" event:"increment_quota_and_check_failed"` — the SDK upgrade didn't fix the auth. Path 3 is needed; return a planning-inconclusive signal and re-plan.

### Step 3 — Verify ledger writes directly in Supabase

Supabase Dashboard -> SQL Editor -> New Query:
```sql
SELECT count(*)                             AS total_rows,
       count(*) FILTER (WHERE req_count > 0) AS rows_with_traffic,
       max(window_start)                     AS most_recent_window
  FROM user_quota_ledger;
```

**Expect:** `total_rows >= 1` AND `rows_with_traffic >= 1` AND `most_recent_window` is within the last few minutes. This is the primary evidence that SEC-02 is enforcing.

Also run:
```sql
SELECT user_id, route, req_count, token_count, window_start
  FROM user_quota_ledger
 ORDER BY window_start DESC
 LIMIT 5;
```
**Expect:** at least one row for the anon user from Step 2, with `req_count` in `[5, 6]` (the smoke ran 6 requests; the 6th was rejected BEFORE increment).

### Step 4 — Run SEC-03 and SEC-04 smokes (deferred in Phase 1)

```bash
cd C:\HUMAHUMA\app

# SEC-03 — budget truncation header
BASE_URL=https://huma-two.vercel.app ANON_JWT="$ANON_JWT" \
  bash scripts/smoke/sec-03-budget.sh
# Expect: SEC-03 smoke: PASS

# SEC-04 — injection sanitizer
# Need CRON_SECRET from Vercel prod env — operator copies it into the shell
export CRON_SECRET="<value from Vercel env>"
BASE_URL=https://huma-two.vercel.app CRON_SECRET="$CRON_SECRET" \
  bash scripts/smoke/sec-04-injection.sh
# Expect: SEC-04 smoke: PASS
```

If either fails: note the failure (do not roll back — SEC-02 is the primary goal; SEC-03/04 coverage strengthens confidence but their unit tests are already green, so a smoke failure would indicate a production-only issue worth a separate follow-up).

### Step 5 — Update Phase 1 docs (executor automates this once operator confirms Steps 2-4 pass)

Edit `.planning/STATE.md`:

- Top-of-file frontmatter:
  - `current_plan: 11` (was 10)
  - `status: complete` (was `partial`)
  - `stopped_at: "Completed 01-08-sec02-admin-credentials-PLAN.md — Phase 1 fully enforcing in production"`
  - `last_updated: "<ISO-timestamp-now>"`
  - `last_activity: <YYYY-MM-DD today>`
  - `progress.completed_phases: 1` (was 0)
  - `progress.total_plans: 11` (was 10)
  - `progress.completed_plans: 11`
  - `progress.percent: 12` (1/8 phases * 100, rounded down)

- `## Current Position` section — rewrite:
  ```markdown
  Phase: 1 of 8 (Security & Cost Control) — COMPLETE as of <YYYY-MM-DD>
  Plan: 11/11 plans landed. All six SEC requirements enforcing in production behind `PHASE_1_GATE_ENABLED=true`.
  Status: Live and enforcing. SEC-02 gap closed via @supabase/supabase-js upgrade (2.99.2 -> ^2.104.0) + operator env-var rotation + structured fail-open warning.
  Last activity: <YYYY-MM-DD> — Plan 01-08 landed; production smoke quad (SEC-02/03/04) all green; user_quota_ledger confirmed writing rows.

  Progress: [██████████] 100% (11/11 plans complete in Phase 1)
  ```

- `## Accumulated Context` -> `### Blockers/Concerns` — remove the SEC-02 entry (the first bullet currently starting with "**SEC-02 runtime enforcement blocked...**"). Keep the other three entries (Phase 6 PRICE-04 dep, Phase 8 LONG-01 dep, Supabase manual migrations).

- `### Pending Todos` — remove "Phase 1.1 — plan gap-closure for SEC-02..." entry. If the section is now empty, keep the heading and add "- (none — ready for Phase 2)".

- `### Decisions` — append one new decision:
  ```markdown
  - [Phase 01-security-cost-control]: Plan 01-08: Path 1 (SDK upgrade) resolved SEC-02 runtime gap — single-dep bump from supabase-js 2.99.2 to ^2.104.0; no code branching on key format; fail-open warning made non-silent (component=quota severity=WARN) per VERIFICATION.md anti-pattern
  ```

Edit `.planning/ROADMAP.md`:

- Line 15 Phase 1 checkbox + status:
  - BEFORE: `- [ ] **Phase 1: Security & Cost Control (Plan P0)** - ... *(PARTIAL 2026-04-21 — 10/10 plans landed; SEC-02 runtime enforcement deferred to Phase 1.1 pending Supabase credential resolution; see deferred-items.md)*`
  - AFTER: `- [x] **Phase 1: Security & Cost Control (Plan P0)** - Auth-gate Anthropic routes, per-user token budgets, prompt-injection defense, observability, SSE disconnect handling *(COMPLETE <YYYY-MM-DD> — 11/11 plans landed; all six SEC requirements enforcing in production behind PHASE_1_GATE_ENABLED=true)*`

- Phase 1 section (### Phase 1: Security & Cost Control) line starting `**Plans**: 9 plans...`:
  - Change to `**Plans**: 11 plans (Wave 0: plan 00 fixtures; Wave 1: plans 01-04, 05a, 06 parallel; Wave 2: plans 05b, 05c parallel; Wave 3: plan 07 enablement; Wave 4: plan 08 sec02-admin-credentials gap close)`
  - Update the plan checklist:
    - Line starting `- [~] 01-02-quota-ledger-PLAN.md` -> flip to `- [x] 01-02-quota-ledger-PLAN.md — SEC-02: migration 016 + quota.ts + QuotaCard (runtime enforcement closed by 01-08)`
    - Line starting `- [~] 01-07-enablement-PLAN.md` -> flip to `- [x] 01-07-enablement-PLAN.md — PHASE 1 enabled in production behind PHASE_1_GATE_ENABLED=true`
    - Append new line: `- [x] 01-08-sec02-admin-credentials-PLAN.md — SEC-02 gap close: @supabase/supabase-js ^2.104.0 upgrade + env-var rotation + structured fail-open warning; user_quota_ledger enforcing`

- Progress table row for Phase 1:
  - BEFORE: `| 1. Security & Cost Control (P0) | 10/10 | Partial (5/6 requirements verified; SEC-02 deferred to Phase 1.1) | 2026-04-21 |`
  - AFTER: `| 1. Security & Cost Control (P0) | 11/11 | Complete | <YYYY-MM-DD> |`

- Optional: append a changelog line at the bottom of the file:
  ```
  *Phase 1 complete: <YYYY-MM-DD> — 11/11 plans; plan 01-08 closed SEC-02 runtime gap via @supabase/supabase-js ^2.104.0 upgrade.*
  ```

Edit `.planning/REQUIREMENTS.md`:

- Line 14: `- [~] **SEC-02** ... **PARTIAL ...**` -> `- [x] **SEC-02** *(P0.2)*: Per-user token budget + structured rate limit via Supabase-backed ledger. Tiers: anonymous (5 req / 10K tokens/day), free (50 req / 100K tokens/day), Operate (500 req / 2M tokens/day). **Complete <YYYY-MM-DD> — runtime enforcement verified in production via sec-02-quota.sh smoke + user_quota_ledger row count > 0.**`

- Traceability row for SEC-02:
  - BEFORE: `| SEC-02 | Phase 1 | Partial — deferred to Phase 1.1 (Supabase credential migration blocker) |`
  - AFTER: `| SEC-02 | Phase 1 | Complete |`

- Footer line:
  - BEFORE: `*Last updated: 2026-04-21 — Phase 1 partial close. SEC-01/03/04/05/06 Complete; SEC-02 Partial...`
  - AFTER: `*Last updated: <YYYY-MM-DD> — Phase 1 complete. SEC-01 through SEC-06 all Complete; runtime enforcement of all six verified via production smoke + ledger inspection.*`

Edit `.planning/phases/01-security-cost-control/deferred-items.md`:

- Under `### SEC-02 end-to-end quota enforcement blocked on Supabase credential migration`, append a new sub-section at the bottom of that block:
  ```markdown
  ### RESOLVED — <YYYY-MM-DD> (Plan 01-08)

  **Fix approach:** Path 1 — upgraded `@supabase/supabase-js` from `^2.99.2` to `^2.104.0`. The upgraded SDK natively signs requests with both legacy JWT and new `sb_secret_*` service-role key formats; no branching in `createAdminSupabase()` needed.

  **Hardening shipped alongside:** `quota.ts` fail-open branch upgraded from `console.error("[quota] ...")` to structured `console.warn(JSON.stringify({component:"quota", severity:"WARN", ...}))` — any future runtime credential failure now surfaces in Vercel log search via `component=quota severity=WARN`.

  **Verification evidence:**
  - `scripts/smoke/sec-02-quota.sh` vs https://huma-two.vercel.app -> PASS (6th anon request returns 429 with `{code:"RATE_LIMITED", tier:"anonymous", suggest:"sign_in"}`).
  - `SELECT count(*) FROM user_quota_ledger` -> N rows with recent `window_start` after smoke run.
  - SEC-03 + SEC-04 smokes run end-to-end against production for coverage extension.
  - Existing 697/697 Vitest suite stayed green across the SDK upgrade.

  **Paths NOT taken:**
  - Path 2 (re-enable Supabase legacy keys) — rejected as explicit short-term debt.
  - Path 3 (format-detection branch in `createAdminSupabase`) — kept in reserve but unused; Path 1's dependency-only fix was cleanest.
  ```

### Step 6 — Stage + commit

```bash
cd C:\HUMAHUMA
git add app/package.json app/package-lock.json \
        app/src/lib/quota.ts app/src/lib/quota.test.ts \
        .planning/STATE.md .planning/ROADMAP.md .planning/REQUIREMENTS.md \
        .planning/phases/01-security-cost-control/deferred-items.md \
        .planning/phases/01-security-cost-control/01-08-sec02-admin-credentials-PLAN.md

git status .planning/ app/
```
Confirm the staged list matches the expected files.

Create the summary file at `.planning/phases/01-security-cost-control/01-08-sec02-admin-credentials-SUMMARY.md` following `C:/Users/djcan/.claude/get-shit-done/templates/summary.md` with:
- What was built (SDK upgrade, structured warn, prod env rotation, smoke quad, docs cleanup)
- Verification evidence pasted inline (curl exit codes, SQL row counts, Vitest summary line)
- Commit SHA (filled post-commit)
- No follow-ups (Phase 1 truly closed).

Stage the summary:
```bash
git add .planning/phases/01-security-cost-control/01-08-sec02-admin-credentials-SUMMARY.md
```

Commit atomically:
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "fix(01-08): close SEC-02 runtime gap via @supabase/supabase-js ^2.104.0 upgrade + non-silent fail-open warning; Phase 1 complete 11/11" --files app/package.json app/package-lock.json app/src/lib/quota.ts app/src/lib/quota.test.ts .planning/STATE.md .planning/ROADMAP.md .planning/REQUIREMENTS.md .planning/phases/01-security-cost-control/deferred-items.md .planning/phases/01-security-cost-control/01-08-sec02-admin-credentials-PLAN.md .planning/phases/01-security-cost-control/01-08-sec02-admin-credentials-SUMMARY.md
```

### Operator resume signal

Paste the smoke output exit lines + ledger row count + commit SHA, OR type `Phase 1 closed`.
  </action>
  <verify>
    <automated>cd C:\HUMAHUMA && grep -q "completed_phases: 1" .planning/STATE.md && grep -Eq "^\- \[x\] \*\*Phase 1:" .planning/ROADMAP.md && grep -Eq "^\- \[x\] \*\*SEC-02\*\*" .planning/REQUIREMENTS.md && grep -q "RESOLVED" .planning/phases/01-security-cost-control/deferred-items.md && git log --oneline -1 | grep -q "01-08"</automated>
  </verify>
  <done>
    - Operator ran `scripts/smoke/sec-02-quota.sh` against production and it exited 0 (5x200 + 1x429 with RATE_LIMITED body).
    - Operator queried Supabase dashboard: `user_quota_ledger` row count > 0 after smoke, with recent `window_start`.
    - Operator ran SEC-03 + SEC-04 smokes against production (coverage extension — deferred from Phase 1).
    - `.planning/STATE.md` updated: `completed_phases: 1`, SEC-02 blocker removed, new Plan 01-08 decision line added, pending Phase 1.1 todo removed.
    - `.planning/ROADMAP.md` updated: Phase 1 `[x]` Complete, 11/11 plans, Phase 1 plan list appended with 01-08 entry.
    - `.planning/REQUIREMENTS.md` updated: SEC-02 `[x]` Complete + Traceability row Complete + footer date updated.
    - `.planning/phases/01-security-cost-control/deferred-items.md` updated: SEC-02 section ends with a `### RESOLVED — <date> (Plan 01-08)` block including verification evidence.
    - `.planning/phases/01-security-cost-control/01-08-sec02-admin-credentials-SUMMARY.md` created from template with verification evidence inline.
    - Single atomic commit containing Task 1 + Task 3 changes + new SUMMARY. Commit message mentions `fix(01-08)` and `Phase 1 complete 11/11`.
    - Operator signalled "Phase 1 closed" (or equivalent).
  </done>
</task>

</tasks>

<verification>
**Overall Plan 01-08 checks (must all be true to consider the gap closed):**

Automated (executor runs in Task 1 and Task 3):
```bash
cd C:\HUMAHUMA/app && npm test                                   # 697/697 green
cd C:\HUMAHUMA && grep -q "completed_phases: 1" .planning/STATE.md
cd C:\HUMAHUMA && grep -Eq "^\- \[x\] \*\*SEC-02\*\*" .planning/REQUIREMENTS.md
cd C:\HUMAHUMA && grep -Eq "^\- \[x\] \*\*Phase 1:" .planning/ROADMAP.md
cd C:\HUMAHUMA && grep -q "RESOLVED" .planning/phases/01-security-cost-control/deferred-items.md
cd C:\HUMAHUMA && git log --oneline -3 | grep -q "01-08"
```

Operator-driven (Task 2 + Task 3 checkpoints):
- Vercel prod SDK upgrade deploys cleanly ("Ready" state).
- Production SEC-02 smoke exits 0 with 429 on 6th request.
- Supabase `SELECT count(*) FROM user_quota_ledger` > 0 after smoke.
- SEC-03 + SEC-04 production smokes also exit 0 (coverage extension).

**Rollback trigger (any one aborts the plan):**
- Task 1 `npm test` introduces any net new test failure.
- Task 1 `tsc --noEmit` introduces any net new TypeScript error beyond the two pre-existing `BudgetResult` ones.
- Task 2 Vercel redeploy fails or post-deploy curl returns 5xx.
- Task 3 Step 2 6th smoke request returns 200 (fail-open still masking).

Rollback action: `git revert <Task-1 commit SHA>`, push, let Vercel redeploy; Phase 1 returns to the pre-plan-01-08 partial state. Re-plan Path 3 as plan 01-09 (format-detection branching in `createAdminSupabase`).
</verification>

<success_criteria>
- `@supabase/supabase-js` resolves to `^2.104.0` or newer stable 2.x in `app/package.json` + `app/package-lock.json`.
- `createAdminSupabase()` in production successfully signs RPC calls to `increment_quota_and_check` with the current `sb_secret_*` service_role key.
- `quota.ts` fail-open branch emits structured WARN (searchable via `component=quota severity=WARN` in Vercel logs) instead of the prior silent `console.error`.
- 697/697 Vitest suite remains green across the SDK upgrade + one updated test case.
- Production smoke scripts `sec-02-quota.sh`, `sec-03-budget.sh`, `sec-04-injection.sh` all exit 0 against https://huma-two.vercel.app.
- Supabase dashboard query `SELECT count(*) FROM user_quota_ledger` returns > 0 after smoke traffic, with recent `window_start`.
- `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/phases/01-security-cost-control/deferred-items.md` all reflect Phase 1 fully complete (SEC-01 through SEC-06) with the SEC-02 blocker and Phase 1.1 pending-todo removed.
- One atomic commit on `main` captures: Task 1 code changes + docs updates + new PLAN + new SUMMARY files.
- Phase 2 (Regenerative Math Honesty) is clear to begin — no residual Phase 1 blockers.
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-cost-control/01-08-sec02-admin-credentials-SUMMARY.md` with:
- Date closed
- Fix path taken (Path 1 — SDK upgrade) + paths rejected (Path 2 legacy re-enable, Path 3 format-detection branch) with one-line rationale each.
- Verification evidence pasted inline:
  - `npm test` summary line (697/697 or equivalent)
  - `sec-02-quota.sh` final output lines (PASS + exit code)
  - `SELECT count(*) FROM user_quota_ledger` result
  - `sec-03-budget.sh` + `sec-04-injection.sh` final lines
- Vercel deploy URL + deployment ID for the SDK-upgrade deploy.
- Commit SHA(s) for the close-out commit.
- Hardening delivered: structured WARN in `quota.ts` fail-open branch (VERIFICATION.md anti-pattern closed).
- Open follow-ups: none for Phase 1 (Phase 2 is ready to begin). Non-Phase-1 carryovers remain in deferred-items.md.
- Milestone: Phase 1 fully complete; SEC-01 through SEC-06 all enforcing in production.
</output>

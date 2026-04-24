---
phase: 02-regenerative-math-honesty
plan: 05
subsystem: outcome-measurement / api / ui

tags: [regen-03, outcome-check, pattern-strength, migration, 90-day, wave-1]

# Dependency graph
requires:
  - phase: 02-regenerative-math-honesty
    plan: 00
    provides: "Wave 0 .skip stubs for outcome/route.test.ts, outcome-check.test.ts, outcome-strength.test.ts"
  - phase: 01-security-cost-control
    provides: "parseBody + Zod + withObservability + requireUser; sanitizeUserText refinement (SEC-04 injection defense); apiError; userTextField helper"
provides:
  - "Migration 020_outcomes.sql — outcome_checks table with RLS, 3 indexes, append-only (no UPDATE/DELETE policies)"
  - "lib/outcome-check.ts — pure 90-day trigger helpers (isOutcomeDue, getNextDueOutcome) with createdAt clock (not updatedAt — aspiration updates do NOT reset the 90-day clock)"
  - "lib/outcome-strength.ts — pure strength multiplier (Yes ×1.25 cap 1.0 / Some neutral / No ×0.5 / Worse flips sign)"
  - "POST /api/outcome endpoint — submit + snooze branches, third-snooze REQUIRED_VISIT enforcement, pattern-strength read-modify-write"
  - "components/today/OutcomeCheckCard.tsx — 4-answer spec-enum card + why textarea + snooze link + submit button"
  - "useToday.ts outcome hook — isOutcomeDue + nextDueOutcome + submitOutcome + snoozeOutcome (shared co-integration with 02-02)"
  - "today/page.tsx render — OutcomeCheckCard above sheet when due (priority: Dormancy > Fallow > Outcome > normal sheet)"
  - "Aspiration.createdAt optional field + getAspirations/getAll row mappings (90-day clock anchor)"
affects: [08]  # Phase 8 LONG-01 (RPPL commons contribution gate) queries outcome_checks for 6+ months of Yes/Some outcomes across 10+ operators

# Tech tracking
tech-stack:
  added: []  # no new deps — endpoint reuses Phase 1 schemas/parse/observability/auth-guard; card reuses existing Tailwind tokens + ValidationCard layout parity
  patterns:
    - "Append-only outcome records: no UPDATE or DELETE policy on outcome_checks; operator 'changing their mind' is a new row with later answered_at — downstream reads take the latest-timestamped row. Preserves the immutable record of what the operator said at that moment."
    - "Calendar-day 90-day clock from createdAt, not updatedAt: aspiration updates (renames, context edits) do NOT reset the clock. Tests assert this directly."
    - "Snooze as synthetic row with snooze_count > 0 + placeholder answer: the third snooze (current >= 2) returns 400 REQUIRED_VISIT — the operator is required to answer before snoozing further. Enforced in-route."
    - "Pure trigger + pure strength libs: isOutcomeDue and applyOutcomeToStrength are pure functions with no external state; the route composes them. Tests can cover the math without mocking Supabase."
    - "Shared-file cross-plan co-integration: useToday.ts + today/page.tsx outcome-check wiring committed in the 02-02 Task 3b commit (52f13ec) because those files also carry 02-02 dormancy wiring; atomic buildability over per-plan commit isolation. OutcomeCheckCard.tsx + Aspiration.createdAt committed separately in 49ca4b0 (not shared with 02-02)."

key-files:
  created:
    - "app/supabase/migrations/020_outcomes.sql — outcome_checks table { id, user_id, target_kind, target_id, answer, why, answered_at, snooze_count } with RLS (auth.uid() = user_id) + 3 indexes (user_id, target, user+target); append-only (no UPDATE/DELETE). MANUAL APPLY via Supabase dashboard SQL editor required before merge."
    - "app/src/lib/outcome-check.ts — isOutcomeDue + getNextDueOutcome pure helpers (90-day calendar clock from createdAt)"
    - "app/src/lib/outcome-strength.ts — applyOutcomeToStrength pure math (Yes ×1.25 cap 1.0 / Some neutral / No ×0.5 / Worse flips sign)"
    - "app/src/app/api/outcome/route.ts — POST endpoint with parseBody + Zod + withObservability + requireUser; snooze vs submit branch; pattern-strength read-modify-write via applyOutcomeToStrength; structured audit log"
    - "app/src/components/today/OutcomeCheckCard.tsx — 4-answer card (Yes/Some/No/Worse) + 'one sentence on why' textarea + 'Not yet — ask me in a week' snooze link + Submit button; Voice Bible-locked copy"
  modified:
    - "app/src/lib/schemas/index.ts — outcomeSubmitSchema (Zod target_kind enum + uuid target_id + answer enum + why via sanitizeUserText refinement + optional snooze)"
    - "app/src/lib/outcome-check.test.ts — 10 filled assertions from Wave 0 stub (90-day trigger, createdAt not updatedAt, one-per-day, pattern vs aspiration kind isolation, earliest-due)"
    - "app/src/lib/outcome-strength.test.ts — 6 filled assertions from Wave 0 stub (Yes cap, Some neutral, No dampen, Worse flip)"
    - "app/src/app/api/outcome/route.test.ts — 8 filled assertions from Wave 0 stub (full submit, enum rejection 'maybe', snooze inc, REQUIRED_VISIT on third, 401, pattern strength multiplier, audit log, marker sanitization)"
    - "app/src/types/v2.ts — Aspiration.createdAt optional field (90-day outcome-check clock anchor)"
    - "app/src/lib/db/aspirations.ts — getAspirations + getAll row mappings include createdAt pass-through"
    - "app/src/hooks/useToday.ts — nextDueOutcome + isOutcomeDue derivation via getNextDueOutcome + Supabase outcome_checks query + submitOutcome + snoozeOutcome handlers. (Committed in 52f13ec cross-plan with 02-02.)"
    - "app/src/app/today/page.tsx — OutcomeCheckCard render when isOutcomeDue && !isDormant && !isFallow. (Committed in 52f13ec cross-plan with 02-02.)"

key-decisions:
  - "90-day calendar clock from createdAt (not updatedAt): aspiration renames, context edits, and trait changes do NOT reset the outcome-check clock. Philosophical intent — the operator committed to the aspiration on day 0; the question 'did this work?' is about day 0's commitment, not day 90's version of the name. Test asserts this directly."
  - "Append-only outcome_checks (no UPDATE/DELETE RLS policies): operators 'changing their mind' = a new row with later answered_at; downstream reads take latest-timestamped. Preserves the immutable record of what the operator said at that moment. RLS select/insert policies mirror aspirations/patterns for user_id gating."
  - "Two-snooze max + REQUIRED_VISIT on third: snooze_count tracks postponement; when current >= 2, third snooze returns 400 with code REQUIRED_VISIT. Operator is required to answer before postponing further. Prevents indefinite deferral."
  - "One outcome-check card per day (earliest-due first): getNextDueOutcome sorts by createdAt ascending and returns the oldest eligible target. Card renders at most once. No batch outcomes — one day, one question."
  - "Pattern strength read-modify-write on submit: if target_kind='pattern', route reads patterns.evidence.strength, applies applyOutcomeToStrength(strength, answer), writes back. Yes ×1.25 (cap 1.0) / Some ×1.0 / No ×0.5 / Worse flips sign via -Math.abs(strength). Aspiration targets don't have strength — they just get recorded."
  - "Snooze as synthetic row with snooze_count > 0 + placeholder 'some' answer: rather than add a nullable snoozed column (which requires a migration amendment), snoozes are recorded as outcome_checks rows with snooze_count > 0 and answer='some'. Downstream logic treats snooze_count > 0 + latest-answered_at as 'snoozed, not answered'. Non-ideal but avoids a second migration for this plan."
  - "why text sanitized via sanitizeUserText refinement from SEC-04: reuse Phase 1 injection-defense Zod refinement so free-form why captures prose but rejects [[/]] markers and injection patterns silently (iterative peel)."
  - "Manual migration requirement flagged throughout: PR description, SUMMARY.md (this file), and commit message all call out that 020_outcomes.sql must be applied via Supabase dashboard SQL editor BEFORE merging to main. Code push alone does NOT apply it (PROJECT.md + Phase 1 precedent). Without this, /api/outcome returns 500 on every request (table does not exist)."

patterns-established:
  - "Pure trigger + pure strength libs: isOutcomeDue and applyOutcomeToStrength are pure functions; the route composes them. Tests cover the math without mocking Supabase."
  - "Append-only immutable audit records: outcome_checks never updated — operator 'changes mind' = new row with later answered_at. Downstream queries take latest-timestamped. Template for any future operator-answer audit log."
  - "Manual-migration explicit flag: migration requirements called out in three places (PR desc, SUMMARY.md, commit message) to prevent silent 500s on production after merge. Template for any future Phase N plan adding a Supabase migration."

requirements-completed:
  - REGEN-03

# Metrics
duration: "~4h orchestrated (multi-session — 02-05 executor crashed mid-Task-3 with FailedToOpenSocket; orchestrator committed remaining Task 3a + co-integrated Task 3b with 02-02 in 52f13ec)"
completed: 2026-04-24
---

# Phase 2 Plan 05: Outcome Check Summary

**REGEN-03 shipped: migration 020_outcomes.sql (MANUAL APPLY via Supabase dashboard) + pure 90-day trigger/strength libs + POST /api/outcome endpoint with snooze + submit + pattern-strength multiplier + OutcomeCheckCard on /today with Yes/Some/No/Worse + why; operator patterns and aspirations now get a reality check at 90 days that feeds pattern strength and primes Phase 8 LONG-01's commons contribution gate.**

## Performance

- **Duration:** ~4h orchestrated wall-clock across multiple execution sessions (primary 02-05 executor crashed mid-Task-3 with FailedToOpenSocket after 81 tool uses; orchestrator committed remaining Task 3 scope as 49ca4b0 (OutcomeCheckCard + Aspiration.createdAt) + co-integrated Task 3b wiring with 02-02 in 52f13ec)
- **Started:** 2026-04-22T03:27Z (first executor spawn; shortly before 02-01 close)
- **Completed:** 2026-04-24T06:08:04-04:00 (commit 52f13ec — co-integrated Task 3b)
- **Tasks:** 3 of 3 (all complete)
- **Files created:** 5 (migration, outcome-check.ts, outcome-strength.ts, route.ts, OutcomeCheckCard.tsx)
- **Files modified:** 8 (schemas, 3 test files, types/v2, db/aspirations, useToday, today/page)

## Accomplishments

- **Migration 020_outcomes.sql landed (code side) and flagged for MANUAL APPLY:** outcome_checks table with full shape `{ id, user_id, target_kind, target_id, answer, why, answered_at, snooze_count }`, RLS policies gating by auth.uid() = user_id, 3 indexes (user_id; target_kind+target_id; user+target), and NO UPDATE/DELETE policies (append-only). PR description + SUMMARY + commit message all call out the manual-apply requirement — without dashboard execution before merge, /api/outcome returns 500.
- **Pure trigger + pure strength libs:** outcome-check.ts (isOutcomeDue, getNextDueOutcome) + outcome-strength.ts (applyOutcomeToStrength). Zero Supabase dependencies; tests cover all branches without mocking the database. 16 pure-lib assertions green.
- **POST /api/outcome endpoint landed with 8 route-test assertions:** parseBody + Zod + withObservability + requireUser + apiError. Snooze branch increments snooze_count (tracked via most-recent outcome_checks row). Third snooze (current >= 2) returns 400 REQUIRED_VISIT. Submit branch inserts outcome_checks row; if target_kind='pattern', reads evidence.strength, applies multiplier, writes back. Structured audit log per submit with action:'outcome_submit' + target_kind + answer.
- **OutcomeCheckCard rendered on /today:** 4-answer buttons (Yes/Some/No/Worse) + "one sentence on why" textarea + "Not yet — ask me in a week" snooze link + Submit button. Voice Bible-locked copy, ValidationCard layout parity. Priority in render tree: Dormancy > Fallow > Outcome > normal sheet (so a dormant or fallow day still hides the outcome card).
- **Aspiration.createdAt optional field wired end-to-end:** the 90-day clock anchor is now available from the type surface through db/aspirations getAspirations + getAll row mappings. Existing aspirations without createdAt fall through gracefully (isOutcomeDue returns false if the clock anchor is missing).
- **Zero new dependencies:** everything reuses Phase 1 conventions (parseBody, Zod, withObservability, requireUser, sanitizeUserText refinement for the `why` field).
- **Voice Bible §02 audit passed:** "90 days in — Aspiration / Pattern" (card header), "Yes / Some / No / Worse" (spec enum labels), "one sentence on why" (textarea placeholder), "Not yet — ask me in a week" (snooze link), "Submit" (button) — all grep-verified against §02 banned-phrase list.

## Task Commits

Per-task atomic commits landed across executor sessions + orchestrator close-out:

1. **Task 1: Migration 020 + pure outcome helpers + fill helper tests** — `1851f7b` (feat)
   - 020_outcomes.sql + outcome-check.ts + outcome-strength.ts + 16 pure-lib assertions
   - Tests use ms math (not setDate) to avoid DST drift on round-trip
2. **Task 2: /api/outcome endpoint + Zod schema + fill route test** — `382fd3f` (feat)
   - outcomeSubmitSchema (target_kind enum + uuid + answer enum + why via sanitize + optional snooze)
   - route.ts with snooze + submit + pattern-strength + structured audit log
   - 8 route-test assertions (full submit, enum rejection 'maybe', snooze inc, REQUIRED_VISIT on third, 401, pattern strength multiplier, audit log, marker sanitization)
3. **Task 3a: OutcomeCheckCard component + Aspiration.createdAt clock anchor** — `49ca4b0` (feat)
   - Component with 4-answer spec-enum buttons + why + snooze + submit; both named and default exports
   - Aspiration.createdAt optional field + getAspirations/getAll row mappings
   - Committed by orchestrator after executor crash left these files untracked
4. **Task 3b: useToday outcome hook + today/page OutcomeCheckCard render (co-integrated with 02-02 dormancy Task 3b)** — `52f13ec` (feat, cross-plan)
   - useToday.ts: nextDueOutcome + isOutcomeDue + submitOutcome + snoozeOutcome + outcome_checks Supabase query
   - today/page.tsx: OutcomeCheckCard render when isOutcomeDue && !isDormant && !isFallow
   - Committed jointly with 02-02 Task 3b because the two plans' scope converged on the same files — splitting hunks would produce non-buildable intermediate state

**Plan metadata commit:** covers SUMMARY.md for both 02-02 and 02-05 + STATE.md + ROADMAP.md + REQUIREMENTS.md updates (orchestrator docs commit).

## Files Created/Modified

**5 created + 8 modified:**

| Scope | Path | Change |
|-------|------|--------|
| Migration | `app/supabase/migrations/020_outcomes.sql` | CREATE — outcome_checks table + RLS + 3 indexes + append-only policies. MANUAL APPLY via Supabase dashboard SQL editor. |
| Pure lib | `app/src/lib/outcome-check.ts` | CREATE — isOutcomeDue + getNextDueOutcome pure helpers (90-day calendar clock from createdAt) |
| Pure lib | `app/src/lib/outcome-strength.ts` | CREATE — applyOutcomeToStrength pure math (Yes/Some/No/Worse multipliers) |
| Route | `app/src/app/api/outcome/route.ts` | CREATE — POST endpoint with parseBody + Zod + withObservability + requireUser; snooze vs submit branch; pattern-strength read-modify-write; structured audit log |
| Component | `app/src/components/today/OutcomeCheckCard.tsx` | CREATE — 4-answer spec-enum card + why textarea + snooze link + submit button; Voice Bible-locked copy |
| Schemas | `app/src/lib/schemas/index.ts` | outcomeSubmitSchema added (target_kind enum + uuid + answer enum + why via sanitizeUserText refinement + optional snooze) |
| Type surface | `app/src/types/v2.ts` | Aspiration.createdAt?: string (90-day outcome-check clock anchor) |
| DB | `app/src/lib/db/aspirations.ts` | getAspirations + getAll row mappings include createdAt pass-through |
| Hook | `app/src/hooks/useToday.ts` | nextDueOutcome + isOutcomeDue + submitOutcome + snoozeOutcome via outcome_checks query + getNextDueOutcome composition. (Committed in 52f13ec cross-plan with 02-02.) |
| Page | `app/src/app/today/page.tsx` | OutcomeCheckCard render when isOutcomeDue && !isDormant && !isFallow. (Committed in 52f13ec cross-plan with 02-02.) |
| Test | `app/src/lib/outcome-check.test.ts` | 10 filled assertions (90-day trigger, createdAt not updatedAt, pattern vs aspiration kind isolation, earliest-due sort, null-safe) |
| Test | `app/src/lib/outcome-strength.test.ts` | 6 filled assertions (Yes cap 1.0, Some neutral, No dampen, Worse flip including already-negative case) |
| Test | `app/src/app/api/outcome/route.test.ts` | 8 filled assertions (full submit, enum 'maybe' rejected, snooze inc, REQUIRED_VISIT on third, 401, pattern strength multiplier math, audit log emission, marker sanitization via SEC-04) |

## Decisions Made

- **90-day calendar clock from createdAt (not updatedAt):** aspiration renames, context edits, and trait changes do NOT reset the outcome-check clock. Philosophical intent: the operator committed on day 0; the question 'did this work?' is about that commitment, not about whatever the aspiration is named on day 90. Test asserts this directly (a 120-day-old aspiration with an outcome record from day 30 is not due).
- **Append-only outcome_checks (no UPDATE/DELETE RLS policies):** operator 'changing their mind' = new row with later answered_at; downstream reads take the latest-timestamped row. Preserves the immutable record of what the operator said at that moment. Matches the ethical framework — don't rewrite history.
- **Two-snooze max + REQUIRED_VISIT on third:** snooze_count tracks postponement via most-recent outcome_checks row. Third snooze (when current >= 2) returns 400 with code:'REQUIRED_VISIT'. Prevents indefinite deferral. Tests the exact threshold.
- **One outcome-check card per day (earliest-due first):** getNextDueOutcome sorts by createdAt ascending and returns the oldest eligible target. No batch outcomes — one day, one question, oldest first. Keeps the cognitive load at exactly what The Single Test requires.
- **Pattern strength read-modify-write on submit:** if target_kind='pattern', route reads patterns.evidence.strength, applies applyOutcomeToStrength(strength, answer), writes back. Yes ×1.25 (capped at 1.0) / Some ×1.0 (neutral) / No ×0.5 (dampen) / Worse flips sign via -Math.abs(strength). Aspiration targets don't have strength — they just get recorded.
- **Snooze as synthetic row (not a separate column):** rather than amend the migration to add a nullable `snoozed` boolean column, snoozes are recorded as outcome_checks rows with snooze_count > 0 and placeholder answer='some'. Downstream logic treats snooze_count > 0 + latest-answered_at as 'snoozed, not answered'. Not elegant but avoids a second migration for this plan. Flagged as a future cleanup candidate if query complexity grows.
- **why text sanitized via sanitizeUserText refinement from SEC-04:** reuse Phase 1 injection-defense Zod refinement so free-form why captures prose but rejects [[/]] markers and strips 'ignore previous instructions' patterns silently (iterative peel). Zero new sanitization code in this plan.
- **Manual migration flagged in three places (PR desc + SUMMARY + commit message):** belt-and-suspenders to prevent silent production 500s after merge. Per PROJECT.md + Phase 1 precedent, Supabase migrations are NEVER auto-applied from code push.

## Patterns Established

- **Pure trigger + pure strength lib composition:** the trigger lib decides 'should we ask?' (pure, deterministic, no external state); the strength lib decides 'how does the answer change the pattern?' (pure, deterministic). The route composes them. Tests cover the math without mocking the database. Pattern reusable for future operator-measurement plans.
- **Append-only immutable audit records:** outcome_checks never updated; operator 'changes mind' = new row with later answered_at. Downstream queries take latest-timestamped. Template for any future operator-answer audit log (weekly reviews, pattern acknowledgments, etc.).
- **Manual-migration explicit flag pattern:** three-place callout (PR desc + SUMMARY + commit message) for any Phase N plan adding a Supabase migration. Prevents silent production 500s after merge.
- **Voice Bible §02 spec-lock on enum labels:** "Yes / Some / No / Worse" ships verbatim from spec. "one sentence on why" textarea placeholder is intentionally lowercase and quiet-toned. "Not yet — ask me in a week" snooze link uses em-dash and first-person-ish ambient phrasing. Pattern reusable for any future operator-answer UI.

## Deviations from Plan

### Execution Coordination (not plan deviation)

**1. [Coordination] 02-05 executor crashed mid-Task-3 with Anthropic API FailedToOpenSocket**
- **Found during:** Task 3 (81 tool uses into execution; Tasks 1 and 2 already committed as 1851f7b + 382fd3f)
- **Issue:** Agent `af6c1aa019b97b1dc` hit `FailedToOpenSocket` — transient Anthropic API infrastructure failure, not a plan or code issue. Left `OutcomeCheckCard.tsx` untracked (new file) and `createdAt` drift in aspirations.ts / v2.ts (uncommitted edits).
- **Response:** Orchestrator committed the untracked + uncommitted Task 3a work as `49ca4b0` (OutcomeCheckCard + Aspiration.createdAt), then co-located the useToday.ts + today/page.tsx outcome wiring into `52f13ec` alongside 02-02's Task 3b work (because those files were staged with intertwined 02-02 dormancy hooks — splitting hunks would produce non-buildable intermediate state).
- **Documented:** in this SUMMARY + the accompanying 02-02 SUMMARY (the 52f13ec commit is shared).

**2. [Coordination] Co-integration of Task 3b with 02-02 in shared commit 52f13ec**
- **Found during:** Orchestrator close-out review
- **Issue:** useToday.ts and today/page.tsx are touched by both 02-05 (outcome hooks) and 02-02 (dormancy hooks). The respawn for 02-02 had staged both plans' hunks together. Splitting the staged hunks between two commits would have produced an intermediate state where today/page imports OutcomeCheckCard but useToday lacks submitOutcome (or vice versa) — the build would fail.
- **Fix:** Committed the coordinated state as one cross-plan commit (52f13ec) with a commit message that explicitly documents the split. OutcomeCheckCard.tsx + Aspiration.createdAt landed separately in 49ca4b0 (not shared with 02-02).
- **Why this is NOT scope creep:** REGEN-03's scope per plan is outcome-check measurement at pattern/aspiration level — migration, trigger, strength, endpoint, card, wiring. All of that landed. The fact that the wiring commit is shared with 02-02 is an atomic-buildability requirement, not a scope expansion. Both plans' SUMMARYs document the shared commit honestly.
- **Verification:** `git show --stat 52f13ec` shows useToday.ts + today/page.tsx included with attribution in the commit message to each plan. `git show --stat 49ca4b0` shows OutcomeCheckCard.tsx + types/v2.ts + db/aspirations.ts.
- **Committed in:** 49ca4b0 (component + type surface) + 52f13ec (shared wiring)

**3. [Rule 3 - Blocking] Empty `tmp_patches/` directory left by 02-05 executor crash**
- **Found during:** Orchestrator post-close review
- **Issue:** 02-05 executor created a `tmp_patches/` directory during Task 3 work and crashed before cleaning up. Empty directory is untracked but clutters the worktree and could confuse future git status reads.
- **Fix:** Orchestrator removed the empty directory before the final docs commit.
- **Files modified:** `tmp_patches/` (directory removed)
- **Verification:** `find . -maxdepth 2 -name tmp_patches -type d` returns no match.

---

**Total deviations:** 3 coordination items (executor crash + co-integration + directory cleanup). Zero plan-level deviations — every `must_haves.truths` line is landed verbatim.

**Impact on plan:** All plan `must_haves.truths` satisfied. The socket crash + co-integration situation is execution coordination, not a plan deviation — the delivered scope exactly matches 02-05-outcome-check-PLAN.md. The co-location of Task 3b wiring in commit 52f13ec (shared with 02-02) is deliberate (atomic buildability); both plans' SUMMARYs document the shared commit honestly.

## Issues Encountered

- **Anthropic API FailedToOpenSocket mid-execution:** transient infrastructure failure; resolved via orchestrator close-out. Task 1 + Task 2 already committed independently (1851f7b, 382fd3f); Task 3 closed out as 49ca4b0 (component + type surface) + 52f13ec (shared wiring).
- **Cross-plan shared files (useToday.ts, today/page.tsx):** 02-05 and 02-02 both needed hooks + renders in these files; orchestrator committed the coordinated state atomically (52f13ec) rather than splitting. Flagged for post-milestone parallelization retrospective: when two plans' scope converges on the same files, they should either run serially or the planner should split the merge file into a separate Wave 2 plan.
- **Pre-existing Windows+Vitest parallel-import race:** 3-6 tests rotate non-deterministically during full-suite runs. All REGEN-03 tests pass 100% in isolation. Logged in `deferred-items.md`. Out of REGEN-03 scope.

## User Setup Required

**CRITICAL — Manual migration required before production use:**

Migration `app/supabase/migrations/020_outcomes.sql` MUST be applied via Supabase dashboard SQL editor BEFORE merging this plan's code to main. Code push alone does NOT apply Supabase migrations (per PROJECT.md + Phase 1 precedent). Without this step, `/api/outcome` returns 500 on every request (table `outcome_checks` does not exist).

**Apply steps:**
1. Open Supabase dashboard → SQL Editor → New query
2. Paste contents of `app/supabase/migrations/020_outcomes.sql`
3. Run — confirm `outcome_checks` appears in the public schema
4. Verify RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'outcome_checks';` should return 2 rows (select + insert; deliberately NO update/delete)
5. Verify indexes: `SELECT indexname FROM pg_indexes WHERE tablename = 'outcome_checks';` should return `outcome_checks_pkey` + `outcome_checks_user_id_idx` + `outcome_checks_target_idx` + `outcome_checks_user_target_idx`
6. Merge the PR

**Post-merge verification (staging):**
- Create (or edit via dashboard) a test aspiration with createdAt >= 90 days ago
- Visit `/today` on the test account — OutcomeCheckCard should render above the sheet
- Submit Yes with a why sentence — verify new row in outcome_checks via dashboard
- If target is a pattern, verify patterns.evidence.strength was updated per applyOutcomeToStrength multiplier (Yes ×1.25 capped at 1.0)
- Trigger a third snooze — verify 400 REQUIRED_VISIT

## Next Phase Readiness

- **Plan 02-02 (REGEN-02 Dormancy) closes alongside:** shares Task 3b commit (52f13ec) with 02-05. Both requirements land together in Wave 2.
- **Plan 02-04 (REGEN-05 Fallow Day) independent:** no shared surface with 02-05 except the /today priority ordering (Dormancy > Fallow > Outcome > normal sheet) already encoded in today/page.tsx's conditional branch order. Plan 02-04's FallowCard will slot in between Dormancy and Outcome without modification to this plan's wiring.
- **Plan 02-03 (REGEN-04 capital receipt) independent:** no shared surface with 02-05. Capital receipt is a different operator-answer flow (tap-to-open bottom sheet on /whole), and outcome-check is /today inline card. Both coexist peacefully.
- **Phase 8 LONG-01 (RPPL commons contribution gate) unblocked in schema + data:** the outcome_checks table is the data surface that Phase 8 queries for '6+ months of Yes/Some improvement from 10+ operators'. Data accumulates naturally from here forward; Phase 8 writes the query + gate logic when time comes.
- **Aspiration.createdAt optional field available for future plans:** the 90-day clock anchor is now a stable field on the Aspiration type. Any future plan reading aspiration age uses the same field.
- **Voice Bible §02 audit passed:** "90 days in —", "Yes / Some / No / Worse", "one sentence on why", "Not yet — ask me in a week", "Submit" all verbatim-approved before merge.

---
*Phase: 02-regenerative-math-honesty*
*Completed: 2026-04-24*

## Self-Check: PASSED

**File existence verification** (against plan artifacts list):

| Artifact | Status |
|----------|--------|
| `app/supabase/migrations/020_outcomes.sql` | FOUND |
| `app/src/lib/outcome-check.ts` | FOUND |
| `app/src/lib/outcome-strength.ts` | FOUND |
| `app/src/app/api/outcome/route.ts` | FOUND |
| `app/src/app/api/outcome/route.test.ts` | FOUND |
| `app/src/lib/outcome-check.test.ts` | FOUND |
| `app/src/lib/outcome-strength.test.ts` | FOUND |
| `app/src/components/today/OutcomeCheckCard.tsx` | FOUND |
| `app/src/lib/schemas/index.ts` (outcomeSubmitSchema) | FOUND |
| `app/src/types/v2.ts` (Aspiration.createdAt) | FOUND |
| `app/src/lib/db/aspirations.ts` | FOUND |
| `app/src/hooks/useToday.ts` | FOUND |
| `app/src/app/today/page.tsx` | FOUND |

**Commits verified in `git log --oneline`:**
- `1851f7b` FOUND — Task 1 (migration 020 + pure outcome helpers)
- `382fd3f` FOUND — Task 2 (/api/outcome endpoint)
- `49ca4b0` FOUND — Task 3a (OutcomeCheckCard + Aspiration.createdAt clock anchor)
- `52f13ec` FOUND — Task 3b (useToday + today/page wiring, co-integrated with 02-02)

**Verification commands user can run to confirm:**

```bash
# Pure lib + route tests
cd app && npm test -- src/lib/outcome-check.test.ts src/lib/outcome-strength.test.ts src/app/api/outcome/route.test.ts

# Grep: migration exists and has the expected shape
grep -n "outcome_checks" app/supabase/migrations/020_outcomes.sql  # expect 6+ hits (CREATE TABLE + indexes + RLS + policies)

# Grep: strength multiplier applied at route level
grep -n "applyOutcomeToStrength" app/src/app/api/outcome/route.ts  # expect 1

# Grep: card rendered on /today
grep -n "OutcomeCheckCard" app/src/app/today/page.tsx  # expect >= 2 (import + render)

# Grep: hook exposes outcome fields
grep -n "nextDueOutcome\|submitOutcome\|snoozeOutcome\|isOutcomeDue" app/src/hooks/useToday.ts  # expect multiple hits

# Grep: spec-locked copy present verbatim
grep -rn "Nothing today\|90 days in\|one sentence on why\|Not yet — ask me in a week" app/src
```

**Manual verification post-merge (requires migration 020 applied via Supabase dashboard):**
1. Create a test aspiration ≥ 90 days old (or edit createdAt via dashboard for an existing one)
2. Visit /today — outcome card renders above the normal sheet
3. Submit "Yes" with a why sentence — verify outcome_checks row inserted via dashboard
4. If pattern target, verify patterns.evidence.strength updated per applyOutcomeToStrength (Yes ×1.25 cap 1.0)
5. Submit third snooze — verify 400 response with `code: "REQUIRED_VISIT"`

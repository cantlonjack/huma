---
phase: 2
slug: regenerative-math-honesty
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-22
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 (already installed, `node` environment) |
| **Config file** | `app/vitest.config.ts` (exists; aliases `@` → `src`; 15s test timeout) |
| **Quick run command** | `cd app && npm test -- <path-or-pattern>` |
| **Full suite command** | `cd app && npm test` |
| **Estimated runtime** | ~110s full (~34 existing test files + ~10 new Phase 2 files) |

Established mocking patterns (continued from Phase 1 — see `01-VALIDATION.md`):
- Mock `@anthropic-ai/sdk` via `vi.mock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }))`.
- Mock `@/lib/supabase-server` and `@/lib/supabase-admin` with `vi.mock()`.
- Mock `@/lib/push-send` with `vi.mock()` for cron-loop tests.
- Set `process.env.ANTHROPIC_API_KEY` in `beforeAll()`.
- Build `Request` with `new Request("http://localhost/api/...", { method, headers, body })`.
- Lazy-import the route AFTER mocks: `const { POST } = await import("./route")`.
- Shared fixtures from Phase 1 Wave 0: `mock-supabase.ts`, `mock-anthropic.ts` (reuse for Phase 2 route tests touching Anthropic or Supabase).

---

## Sampling Rate

- **After every task commit:** Run `cd app && npm test -- <single test file touched>` (<30s).
- **After every plan wave:** Run `cd app && npm test` (full suite, ~110s).
- **Before `/gsd:verify-work`:** Full suite green + all `scripts/smoke/regen-*.sh` scripts exit 0 against a staging deployment.
- **Max feedback latency:** 110 seconds.

---

## Per-Task Verification Map

Task IDs will be assigned by the planner. This pre-scopes the test files each requirement needs.

| Requirement | Test File(s) | Test Type | Automated Command | File Exists | Status |
|-------------|--------------|-----------|-------------------|-------------|--------|
| REGEN-01 (confidence math) | `src/lib/capital-computation.test.ts` | unit | `cd app && npm test -- src/lib/capital-computation.test.ts` | ❌ W0 | ⬜ pending |
| REGEN-01 (type extension) | `src/__tests__/capital-score-confidence.test.ts` | unit (type + consumer) | `cd app && npm test -- src/__tests__/capital-score-confidence.test.ts` | ❌ W0 | ⬜ pending |
| REGEN-01 (radar opacity) | `src/components/canvas/CapitalRadar.confidence.test.tsx` | component | `cd app && npm test -- src/components/canvas/CapitalRadar.confidence.test.tsx` | ❌ W0 | ⬜ pending |
| REGEN-02 (toggle endpoint) | `src/app/api/operator/dormancy/route.test.ts` | unit (route) | `cd app && npm test -- src/app/api/operator/dormancy/route.test.ts` | ❌ W0 | ⬜ pending |
| REGEN-02 (cron skip) | `src/app/api/cron/morning-sheet/route.dormant.test.ts` | unit (route) | `cd app && npm test -- src/app/api/cron/morning-sheet/route.dormant.test.ts` | ❌ W0 | ⬜ pending |
| REGEN-02 (useToday render) | `src/hooks/useToday.dormant.test.ts` | unit (hook) | `cd app && npm test -- src/hooks/useToday.dormant.test.ts` | ❌ W0 | ⬜ pending |
| REGEN-02 (mid-day preserve) | `src/app/api/operator/dormancy/route.test.ts` | unit (same file) | `cd app && npm test -- src/app/api/operator/dormancy/route.test.ts -t mid-day` | ❌ W0 | ⬜ pending |
| REGEN-02 (CapitalPulse rename) | `src/lib/capital-pulse.test.ts` | unit (existing — amend) | `cd app && npm test -- src/lib/capital-pulse.test.ts` | ✅ | ⬜ pending |
| REGEN-02 (integration smoke) | `scripts/smoke/regen-02-dormancy.sh` | integration | `cd app && bash scripts/smoke/regen-02-dormancy.sh` | ❌ W0 | ⬜ pending |
| REGEN-03 (outcome endpoint) | `src/app/api/outcome/route.test.ts` | unit (route) | `cd app && npm test -- src/app/api/outcome/route.test.ts` | ❌ W0 | ⬜ pending |
| REGEN-03 (90-day trigger) | `src/lib/outcome-check.test.ts` | unit (lib) | `cd app && npm test -- src/lib/outcome-check.test.ts` | ❌ W0 | ⬜ pending |
| REGEN-03 (strength math) | `src/lib/outcome-strength.test.ts` | unit (lib) | `cd app && npm test -- src/lib/outcome-strength.test.ts` | ❌ W0 | ⬜ pending |
| REGEN-04 (receipt sheet) | `src/components/whole/CapitalReceiptSheet.test.tsx` | component | `cd app && npm test -- src/components/whole/CapitalReceiptSheet.test.tsx` | ❌ W0 | ⬜ pending |
| REGEN-04 (radar tap-to-open) | `src/components/canvas/CapitalRadar.tap.test.tsx` | component | `cd app && npm test -- src/components/canvas/CapitalRadar.tap.test.tsx` | ❌ W0 | ⬜ pending |
| REGEN-04 (math reproducibility) | `src/__tests__/capital-receipt-math.test.ts` | unit (math parity) | `cd app && npm test -- src/__tests__/capital-receipt-math.test.ts` | ❌ W0 | ⬜ pending |
| REGEN-05 (fallow endpoint) | `src/app/api/sheet/fallow/route.test.ts` | unit (route) | `cd app && npm test -- src/app/api/sheet/fallow/route.test.ts` | ❌ W0 | ⬜ pending |
| REGEN-05 (checkoff disabled) | `src/hooks/useToday.fallow.test.ts` | unit (hook) | `cd app && npm test -- src/hooks/useToday.fallow.test.ts` | ❌ W0 | ⬜ pending |
| REGEN-05 (no behavior_log) | `src/app/api/sheet/check/route.fallow.test.ts` | unit (route — existing amend) | `cd app && npm test -- src/app/api/sheet/check/route.fallow.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Sampling continuity note:** No plan creates 3+ consecutive tasks without an automated verify — every REGEN has at least one test file in Wave 0. Integration smoke scripts (`regen-02-dormancy.sh`) complement unit coverage but are not a substitute.

---

## Wave 0 Requirements

All test surfaces are new (none exist pre-Phase 2). Wave 0 bootstrap plan:

- [ ] `app/src/lib/capital-computation.test.ts` — REGEN-01 unit cases (confidence formula, no-multiplier math, zero-data dashed treatment, threshold boundaries)
- [ ] `app/src/__tests__/capital-score-confidence.test.ts` — REGEN-01 type parity + consumer compat (existing CapitalScore readers don't break)
- [ ] `app/src/components/canvas/CapitalRadar.confidence.test.tsx` — REGEN-01 shape opacity = avg confidence; dashed axis at zero contributions
- [ ] `app/src/app/api/operator/dormancy/route.test.ts` — REGEN-02 toggle on/off, auth required, audit log emission, mid-day preserve-checkoffs, anonymous users supported
- [ ] `app/src/app/api/cron/morning-sheet/route.dormant.test.ts` — REGEN-02 cron skips dormant users (no sheet compile, no push, structured log with `skip_reason: 'dormant'`)
- [ ] `app/src/hooks/useToday.dormant.test.ts` — REGEN-02 Dormant screen renders when `huma_context.dormant.active === true`, single input submits and toggles off
- [ ] `scripts/smoke/regen-02-dormancy.sh` — REGEN-02 end-to-end curl smoke (toggle on → cron skip → toggle off → next cron delivers)
- [ ] `app/src/app/api/outcome/route.test.ts` — REGEN-03 POST creates outcome_check row, enforces enum answers, sanitizes `why` text
- [ ] `app/src/lib/outcome-check.test.ts` — REGEN-03 90-day trigger condition (from createdAt, not from updates), two-snooze max
- [ ] `app/src/lib/outcome-strength.test.ts` — REGEN-03 multiplier math (Yes ×1.25 capped at 1.0, Some ×1.0, No ×0.5, Worse flips sign)
- [ ] `app/src/components/whole/CapitalReceiptSheet.test.tsx` — REGEN-04 renders full math (contributions, weights, completion rates, threshold bucket highlighted, confidence + label)
- [ ] `app/src/components/canvas/CapitalRadar.tap.test.tsx` — REGEN-04 axis tap opens bottom sheet with correct capital selected
- [ ] `app/src/__tests__/capital-receipt-math.test.ts` — REGEN-04 parity test: numbers shown in receipt equal `computeCapitalScores` output (reproducibility invariant)
- [ ] `app/src/app/api/sheet/fallow/route.test.ts` — REGEN-05 mark/unmark endpoint, same-day undo allowed, post-midnight frozen
- [ ] `app/src/hooks/useToday.fallow.test.ts` — REGEN-05 checkoff disabled on fallow day; Fallow card replaces sheet; preserves prior checkoffs on mid-day mark
- [ ] `app/src/app/api/sheet/check/route.fallow.test.ts` — REGEN-05 checkoff endpoint rejects when day is marked fallow (no behavior_log write)

**Existing test files amended (no new file):**
- [ ] `app/src/lib/capital-pulse.test.ts` — amend for `CapitalPulse.dormant → CapitalPulse.quiet` rename

**Migration sanity:**
- [ ] `app/supabase/migrations/020_outcomes.sql` — table created via Supabase dashboard; PR description calls out manual migration requirement (matches Phase 1 convention). Sanity check: schema matches `{ id, user_id, target_kind, target_id, answer, why, answered_at, snooze_count }` with RLS enabled mirroring `patterns`/`aspirations`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bottom-sheet swipe-down dismiss feel (CapitalReceiptSheet) | REGEN-04 | Gesture-sensitivity thresholds are empirical; unit tests cover state transitions but not the tactile quality | Open `/whole` on a real iOS and Android device, tap a radar axis, swipe the sheet down from various positions, confirm dismiss fires at reasonable drag distances |
| Voice Bible §02 audit on new copy | REGEN-02, REGEN-04, REGEN-05 | Banned-phrase lists evolve; grep-based CI (CROSS-03, deferred to v2) not yet wired | Before merge: grep new user-visible strings against `docs/voice-bible.md` §02 list ("journey", "best self", "on track", "supercharge", etc.) — zero hits required |
| Push notification silence on dormant user | REGEN-02 | Web Push delivery is asynchronous and external (APNS/FCM) — hard to assert from a test runner | After enabling dormancy in staging, wait for the next morning-sheet cron tick, confirm via Vercel logs `skip_reason: 'dormant'` entry AND no push receipt on the subscribed test device |
| Radar shape opacity with real operator data (not fixtures) | REGEN-01 | Fixture tests prove formula; real-data test proves the formula matches perceptual expectations at day 3, day 7, day 14+ | After merge, load three staging accounts (day 3, day 7, day 14+ of activity) and visually confirm opacity progression reads as "still learning → well-known" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 110s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending — planner consumes this during plan generation; sign-off when first full-suite green after Wave 0 lands.

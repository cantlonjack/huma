# Phase 2: Regenerative Math Honesty (Plan P1) - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the code tell the truth the docs already tell. Five regenerative-math fixes:

1. **REGEN-01** — `capital-computation.ts` engagement multiplier becomes a confidence shader (0→1 over 14 days). Rest no longer reduces score; UI opacity reflects how well the shape is known.
2. **REGEN-02** — Dormancy as first-class operator state. Toggle from `/whole` SettingsSheet. Sheet replaced with "Nothing today. Rest is the work." No push, no nudges, no decay, no guilt. Re-entry is one message.
3. **REGEN-03** — 90-day outcome check on aspirations and patterns: Yes / Some / No / Worse + one-sentence why. Pattern strength becomes outcome-weighted. *(Discussed at default discretion this phase.)*
4. **REGEN-04** — Capital receipts. Every score on `/whole` taps to open a bottom-sheet receipt: contributing dimensions, weights, completion rates, threshold table, confidence, computed-at. Reproducible by a patient user.
5. **REGEN-05** — Fallow day mark from sheet. Shows "Fallow. Compost day." No checkoff, no behavior_log entry, confidence unaffected. *(Discussed at default discretion this phase.)*

**Out of scope (other phases):**
- Operator vocabulary rename (`capital → shape`, `dimension → part`, `pattern → move`) — ONBOARD-05 in Phase 3.
- Hard Season state — DEPTH-04 in Phase 7. Dormancy is the only pause-state this phase introduces.
- Pattern contribution gate / RPPL commons — LONG-01 in Phase 8 (depends on REGEN-03 outcome data shipping here).

**Success gate:** `capital-computation.ts:90` no longer multiplies `avgRate * engagementFactor`; CapitalScore gains a `confidence` field; tapping a CapitalRadar axis opens a receipt sheet with full math; `/whole` SettingsSheet exposes a Dormancy toggle that persists in `huma_context.dormant`; morning-sheet cron skips dormant operators; sheet header gains a Fallow mark; aspirations/patterns ≥90 days old prompt the Yes/Some/No/Worse + why outcome check.

</domain>

<decisions>
## Implementation Decisions

### Dormancy state UX (REGEN-02)

- **Toggle location:** `/whole` SettingsSheet **profile tab only**. No second surface — quiet, unobtrusive, consistent with how theme + reset controls already live there. No new chrome to design.
- **Span:** **Indefinite.** Toggle on, stays on until user toggles off. No date picker, no auto-exit, no "rest until X." Matches the philosophy — rest is the work, not a scheduled pause.
- **Re-entry path:** Dormant `/today` shows the spec line plus one small input field ("when you're ready, say anything"). Typing anything ends Dormancy and resumes the app. Honors REGEN-02's "re-entry is one message."
- **What pauses:** sheet, push notifications, daily nudges. **What stays viewable:** weekly reviews, insights, pattern health, validation cards, Whole canvas. Dormancy silences outputs, not visibility — the operator can still open `/grow` or `/whole` to read their shape.
- **Copy on Dormant /today:** Spec line only — `Nothing today. Rest is the work.` No operator name, no rest-day counter, no date. Silence is the respect. Voice Bible §02 audit before merge.
- **Mid-day toggle handling:** If user toggles ON at 4pm with 2 entries already checked off today, **preserve the existing behavior_log entries** (the work happened, that's true) and replace the sheet view with the Dormant screen for the rest of today. Tomorrow opens Dormant. Truth-respecting — does not erase real activity.
- **Anonymous users:** Dormancy works for any session with a `user_id` (anon or magic-linked). HumaContext is already populated for anon — same persistence path. No second-class operators.
- **Pre-auth → magic-link upgrade:** Dormancy state survives the existing `migrateLocalStorageToSupabase()` flow because it lives in `huma_context.dormant`. No new migration code — add a round-trip test confirming the field carries across.
- **Audit log:** Toggling Dormancy emits a structured log entry via `withObservability` — `{ req_id, user_id, route: '/api/operator/dormancy', action: 'enable'|'disable', latency_ms }`. Lets cost-rollup attribute Anthropic-call drops to dormant operators (vs churn).

### Naming — resolve `dormant` collision

- **`CapitalPulse.dormant` (dimension-level signal, "no activity in 5+ days") renames to `CapitalPulse.quiet`.** User-level Dormancy state takes sole ownership of the `dormant` name. Affected files: `app/src/types/v2.ts`, `app/src/hooks/useToday.ts`, `app/src/components/shared/ConnectionThreads.tsx`, `app/src/app/today/page.tsx`, `app/src/lib/capital-pulse.ts`. Surgical — ~5 usages.
- The dimension-level "quiet" signal stays in place; only the field name changes to free up `dormant` for the operator-state concept.

### Push silencing — single chokepoint in cron loop

- **Skip happens in `app/src/app/api/cron/morning-sheet/route.ts`** at the top of the per-user loop. Read `huma_context.dormant.active` for the user; if true, increment a `totalSkipped` counter, emit a structured log (`source: 'cron', skip_reason: 'dormant'`), and `continue`. No sheet compile, no insight check, no Anthropic call, no push.
- **Cheaper than push-level skip** (saves the Sonnet sheet-compile call) and matches the SEC-05 cost-rollup model (one entry per user per cron run, with a clear skip_reason).
- No belt-and-suspenders on push-send.ts this phase — the cron is the only push path. If non-cron push paths are added in later phases, gate them at that point.

### Persistence — extend HumaContext JSONB

- **`contexts.huma_context.dormant: { active: boolean, since: string }`** (ISO timestamp set on enable, unchanged on disable so analytics can compute rest duration if needed later).
- No new table, no new migration beyond an additive JSONB shape note. Aligns with how `archetypes`, `whyStatement`, etc. already live in HumaContext.
- TypeScript: extend the `HumaContext` interface in `app/src/types/context.ts`. Existing `contextSync` flow auto-handles persist + read.

### Capital receipt + confidence (REGEN-04 + REGEN-01)

#### Receipt — interaction & layout

- **Tap target: the radar axis** (the labeled spoke from center to edge). The existing hover tooltip on `CapitalRadar.tsx` becomes the lightweight teaser; tap on the axis (or its label) opens the full receipt. Single interaction surface, mobile-friendly, no new chrome around the radar.
- **Layout: bottom sheet.** Reuses the existing pattern from `app/src/components/today/RpplProvenanceSheet.tsx` and `app/src/components/whole/ConfirmationSheet.tsx`. Slides up from bottom, dismissible by swipe-down or backdrop tap. Mobile-native. No need to invent a new modal pattern.
- **Receipt header:** `[Capital label] — [Score]/5 — [Confidence label]` (e.g., `Living — 4/5 — well-known`).
- **Receipt body — full math, "reproducible by a patient user":**
  1. **Contributing dimensions** — list each dimension that maps to this capital, with its weight (`primary 1.0×` or `secondary 0.5×`) and the user's actual completion rate over the 28-day window (e.g., `Body — primary 1.0× — 24/28 days completion = 0.857`).
  2. **Weighted contribution sum + average** — `(sum of weight × rate) / (sum of weights) = avgRate`.
  3. **Threshold table** — exact mapping `0.00–0.15 → 1, 0.15–0.35 → 2, 0.35–0.55 → 3, 0.55–0.75 → 4, 0.75–1.00 → 5`. Highlight the bucket the user falls into.
  4. **Confidence** — see Confidence section below.
  5. **Computed-at timestamp** — ISO datetime of the last `computeCapitalScores` call.
- **Vocabulary:** keep `capital`, `dimension`, `pattern` for now. Phase 3 ONBOARD-05 sweeps to `shape / part / move` — receipt copy is updated then. Avoids partial-rename confusion in production.

#### Confidence rendering (REGEN-01)

- **Math change in `capital-computation.ts:90`:** delete `const adjusted = avgRate * engagementFactor;`. Use `avgRate` directly for the threshold mapping. The line-76 calculation stays but is repurposed: it becomes the `confidence` value, no longer multiplied into the score.
- **Confidence formula:** `confidence = min(1, daysSinceFirstBehavior / 14)`. Linear ramp from 0 (day 0) to 1 (day 14+). **Calendar days since first `behavior_log` entry**, NOT distinct active days. A Fallow week still counts toward learning the shape — matches REGEN-05's "engagement-confidence unaffected."
- **Type change:** `CapitalScore` (in `app/src/engine/canvas-types.ts`) gains `confidence: number` (range 0–1). All existing consumers continue to read `score`/`note`; new UI reads `confidence`.
- **Visual treatment on CapitalRadar:**
  1. **Shape opacity** = average confidence across all 8 capitals. New operator (low data) = ghosty translucent shape. Mature operator (14+ days) = full sage-400 fill. Single mechanism, matches the spec's "UI opacity reflects confidence."
  2. **Zero-contribution capitals** (e.g., new operator with only Body data) render with a **dashed axis ring + hollow vertex dot**. Score stays at 1 (current baseline), tooltip stays "No activity yet." Visually says "no signal here yet" without removing the axis from the chart — preserves the 8-form mental model.
  3. No per-axis opacity (rejected — too noisy). No "still learning" caption (rejected — extra copy needs Voice Bible review and the receipt already conveys it).
- **Confidence in the receipt body:** `Confidence: 71% (still learning)`. Labels: `< 33% → still learning`, `33–80% → getting clearer`, `80%+ → well-known`. Number for verifiability, label for instant read.

### Claude's Discretion (Fallow day — REGEN-05)

User did not deep-dive — Claude has flexibility within these constraints:
- Trigger location: prefer a small button in the sheet header (consistent with existing TabShell layout). Long-press alternatives only if header button is rejected by Voice Bible review.
- Future-scheduling: today-only this phase. No "fallow tomorrow" — keep mental model simple.
- Mid-day flip: if user marks fallow at 4pm with 2 entries already checked, **preserve checkoffs** (mirrors Dormancy mid-day rule). Sheet view replaces with Fallow card for rest of today.
- Undo: yes, allow unmark within same calendar day. After midnight it's frozen.
- Persistence: extend `huma_context` with `fallowDays: string[]` (array of YYYY-MM-DD). No new table needed.
- Confidence math: Fallow days do NOT decrement the 14-day clock (calendar-day formula already handles this correctly). No special case in `capital-computation.ts`.
- Audit log: yes — emit `{ action: 'mark_fallow' | 'unmark_fallow', date }` via `withObservability`.

### Claude's Discretion (90-day outcome check — REGEN-03)

User did not deep-dive — Claude has flexibility within these constraints:
- **Trigger clock:** 90 days from `aspiration.createdAt` (for aspirations) and `pattern.createdAt` (for patterns). Updates do NOT reset the clock — outcome is about the underlying intent, not the latest edit.
- **Prompt location:** inline card on `/today` (similar to existing `ValidationCard.tsx` pattern), one outcome-check per day max to avoid prompt fatigue. The card sits at the top of the sheet when due.
- **Snooze:** "Not yet — ask me in a week." Maximum two snoozes per aspiration/pattern; third visit is required.
- **Outcome → strength math:** map answers to a multiplier on `PatternEvidence.strength`:
  - `Yes` → `× 1.25` (capped at 1.0)
  - `Some` → `× 1.0` (no change, neutral)
  - `No` → `× 0.5` (dampen)
  - `Worse` → `-1 * abs(strength)` (flip sign, signal is negative)
- **One-sentence why:** captured as text on the new outcome record. Surface in pattern detail and aspiration detail panels (existing `AspirationDetailPanel.tsx`). Searchable later for RPPL contribution gating (LONG-01).
- **Persistence:** new `outcome_checks` table — `{ id, user_id, target_kind: 'aspiration'|'pattern', target_id, answer: 'yes'|'some'|'no'|'worse', why: text, answered_at, snooze_count }`. Migration `020_outcomes.sql` (or whatever next number is at planning time).
- **RLS:** standard user-scoped policy mirroring `aspirations`/`patterns` tables.
- Audit log: yes — outcome record itself is the log; additionally emit a structured log entry on submit for cost-rollup parity.

### Claude's Discretion (general)

- Exact bottom-sheet animation curve / dismiss gesture sensitivity (follow existing `ConfirmationSheet.tsx` defaults).
- Capital receipt typography sizing (use existing `whole` page conventions).
- Whether the dashed-axis treatment animates in (default: no, matches reduced-motion preference).
- Recompute trigger for capital scores (default: keep existing `useToday`/`useWhole` query patterns; no new server endpoint unless plan-checker flags performance).
- Push subscription cleanup when user enables Dormancy (default: leave subscription registered; cron just skips. Avoids re-registration UX on re-entry).

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`app/src/components/whole/SettingsSheet.tsx`** — already has a profile tab and a sheet layout pattern. Add a Dormancy toggle row in the existing `tab === 'profile'` section. No new sheet primitive needed.
- **`app/src/components/today/RpplProvenanceSheet.tsx` + `app/src/components/whole/ConfirmationSheet.tsx`** — bottom-sheet patterns to copy for the new `CapitalReceiptSheet` component. Already handle backdrop tap, swipe-down dismiss, prefers-reduced-motion.
- **`app/src/components/canvas/CapitalRadar.tsx`** — existing hover tooltip on each axis (lines 282–323). Wrap the existing label/axis hit area with a tap handler that opens the receipt sheet. The tooltip stays as the hover preview; tap opens the receipt.
- **`app/src/lib/capital-computation.ts`** — single chokepoint for the math change. Surgical edits at lines 76–90. The DIMENSION_CAPITAL_MAP and threshold table stay; only the multiplier and the addition of `confidence` are new.
- **`app/src/components/today/ValidationCard.tsx`** — existing inline-card pattern for asking the user a question on `/today`. Template for the future 90-day outcome-check card (REGEN-03 Claude's Discretion).
- **`app/src/lib/observability.ts`** + `withObservability()` — already wraps every Anthropic-calling route with `{ req_id, user_id, route, latency_ms }` logs. Reuse for the new dormancy-toggle and outcome-check endpoints.
- **`app/src/lib/db/store.ts` + `useContextSync` hook** — existing path for HumaContext persistence (Supabase post-auth, localStorage WAL). Adding `dormant: { active, since }` and `fallowDays: string[]` to HumaContext gets free persistence + sync.

### Established Patterns

- **`parseBody(request, zodSchema)`** (Phase 1 convention) — every new endpoint (`/api/operator/dormancy`, `/api/sheet/fallow`, `/api/outcome`) goes through `parseBody`. Sanitizer refinements run automatically — REGEN-03 "one-sentence why" gets prompt-injection defense for free.
- **Migrations are MANUAL via Supabase dashboard SQL editor** (PROJECT.md constraint, repeated in Phase 1 CONTEXT). PR description must call out "migration required" for any new table; deployment doc must list the SQL run order.
- **`Response.json(body, { status })` via `apiError()`** for error responses — preserve the shape so the existing 429-`<QuotaCard>` interceptor and other client handlers keep working.
- **Never-rewrite constraint** (PROJECT.md memory `feedback_never_rewrite.md`) — surgical edits only on `capital-computation.ts`, `CapitalRadar.tsx`, `SettingsSheet.tsx`, sheet UI files. No full-file rewrites. Edit tool, not Write tool.
- **Voice Bible §02 banned-phrase audit** — all new user-visible copy (Dormant screen, Fallow card, outcome-check prompt, confidence labels) must pass before merge. Same gate as Phase 1 QuotaCard copy.

### Integration Points

- **`/whole` page (`app/src/app/whole/page.tsx`) → SettingsSheet** — Dormancy toggle wires here. Toggle on triggers `/api/operator/dormancy` POST, which updates `huma_context.dormant`, emits the audit log, and invalidates the relevant React Query keys.
- **`/today` page (`app/src/app/today/page.tsx`) → useToday hook** — when `huma_context.dormant.active === true`, render the Dormant screen instead of the sheet. The hook already has the HumaContext available (from useContextSync) — small conditional at the top of the render.
- **`app/src/app/api/cron/morning-sheet/route.ts`** — line ~130 (`for (const userId of userIds)`) — fetch each user's `huma_context.dormant.active` flag; if true, log + skip + continue.
- **`app/src/app/api/cron/morning-sheet/route.ts`** — Phase 1 added `withObservability`. New skip path needs a structured log entry consistent with that wrapper's contract (`source: 'cron', skip_reason: 'dormant'`).
- **`app/src/types/v2.ts` + `app/src/types/context.ts`** — type extensions for `CapitalScore.confidence`, `HumaContext.dormant`, `HumaContext.fallowDays`. Rename `CapitalPulse.dormant → CapitalPulse.quiet` here.
- **`app/src/engine/canvas-types.ts`** — `CapitalScore` interface. Add `confidence: number` field.
- **`app/supabase/migrations/`** — next number is `020_*` (current latest is `019_quota_variable_conflict_pragma.sql`). REGEN-03 outcome-checks table = `020_outcomes.sql`. No migration for Dormancy/Fallow (extends existing `huma_context` JSONB column added in `012_huma_context_column.sql`).

### Creative Options Enabled

- The `confidence` field on `CapitalScore` is reusable beyond the radar — Phase 7 DEPTH-05 graduation capacities can also expose confidence (using same 14-day formula or a longer one).
- The bottom-sheet receipt pattern (`CapitalReceiptSheet`) is reusable for Phase 4 viral insight artifacts — same primitive can show "the math behind this insight."
- The `outcome_checks` table primes Phase 8 LONG-01 (RPPL contribution gate) — outcome data accumulates from day 1 of Phase 2's ship, so by the time Phase 8 lands there's 6+ months of data ready.
- Extending `huma_context.dormant` with future Hard Season state (Phase 7 DEPTH-04) is a one-field addition (`hardSeason: { active, since, kind }`) — same pattern, same persistence path. Phase 2's Dormancy serves as the template.

</code_context>

<specifics>
## Specific Ideas

- **Spec-line copy is sacred** — `Nothing today. Rest is the work.` (Dormant) and `Fallow. Compost day.` (Fallow) come straight from REQUIREMENTS.md. Voice Bible §02 audit applies, but the wording is locked from the spec.
- **"Reproducible by a patient user"** — REGEN-04 success criterion. The receipt must show numbers a user can verify with a calculator: completion rate fractions, weight values, threshold buckets, multiplications. Not a hand-wave.
- **Calendar-day clock for confidence** — explicitly chosen over active-day to honor REGEN-05's "engagement-confidence unaffected." A Fallow week still teaches the system the shape.
- **Belt-and-suspenders pattern from Phase 1** — every state transition (dormancy on/off, fallow mark, outcome check) emits a structured log via `withObservability` so cost-rollup can attribute Anthropic-call drops correctly.
- **CapitalPulse rename** — small but worth doing. Two `dormant` concepts in the same codebase invites the kind of bug Phase 1 Plan 01-08 hunted (latent ambiguity that hides until production).

</specifics>

<deferred>
## Deferred Ideas

- **Hard Season state** (grief/crisis voice shift) — DEPTH-04 in Phase 7. Same pattern as Dormancy (HumaContext field, sheet replacement, push silence) but voice differs. Phase 2 builds the template; Phase 7 instantiates the second variant.
- **Operator vocabulary rename** (`capital → shape`, `dimension → part`, `pattern → move`) — ONBOARD-05 in Phase 3. Receipts written in "capital" wording this phase; Phase 3 sweeps.
- **Pattern contribution gate** (RPPL commons) — LONG-01 in Phase 8. Depends on REGEN-03 outcome data accumulating. Outcome-check schema this phase must include `target_kind` and `answer` enums that LONG-01 can query against.
- **Capacity confidence** — Phase 7 DEPTH-05 four graduation capacities can reuse the `confidence` field pattern. Out of scope this phase but the type design here should anticipate it.
- **Push subscription cleanup on Dormancy** — when user goes Dormant, we leave the push subscription registered (cron just skips). Future Phase 6 PRICE-04 may want to surface "Operate users have a 'pause notifications' button on iOS" as a separate UX consideration. Not blocking.
- **Voice Bible CI check** — CROSS-03 in v2 requirements. The four new copy strings (Dormant screen, Fallow card, confidence labels, outcome-check prompt) would benefit from automated grep — but that's its own phase.
- **Outcome-check answer escalation** — if a pattern accumulates 3+ "Worse" answers across operators, the system could auto-flag for retirement. Future LONG-01/LONG-02 territory.

</deferred>

---

*Phase: 02-regenerative-math-honesty*
*Context gathered: 2026-04-21*

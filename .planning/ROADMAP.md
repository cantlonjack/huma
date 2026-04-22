# Roadmap: HUMA Remediation

## Overview

Eight phases that take the three critiques (security, regenerative math, thesis visibility) seriously without abandoning the vision. Sequenced so Phase 1 is blocking (nothing ships without auth + budgets), Phases 2/3/4 can parallelize, Phases 5/6 are sequential after onboarding lands, and Phases 7/8 are longer-horizon depth and flywheel work. Every phase corresponds to one group (P0-P7) from `docs/Remediation-Build-Plan.md`; GSD numbering is 1-indexed while plan IDs remain preserved in phase names. Execution target: first paying customer by Phase 6, first graduate testimonial by Phase 8.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Security & Cost Control (Plan P0)** - Auth-gate Anthropic routes, per-user token budgets, prompt-injection defense, observability, SSE disconnect handling *(COMPLETE 2026-04-21 — 11/11 plans landed; all six SEC requirements enforcing in production behind PHASE_1_GATE_ENABLED=true)*
- [ ] **Phase 2: Regenerative Math Honesty (Plan P1)** - Remove engagement penalty, first-class Dormancy + Fallow states, outcome measurement, capital receipt
- [ ] **Phase 3: Onboarding Visibility (Plan P2)** - Sheet preview in /start, persistent dimension pills, live N-of-8 counter, day-1 structural insight, operator vocabulary, distinctive conversation UI
- [ ] **Phase 4: Landing & Funnel Instrumentation (Plan P3)** - Inverted hero, CTA rewrite, PostHog + 10 events, UTM/cohort tagging, A/B framework, situation-specific landing pages
- [ ] **Phase 5: Viral Insight Artifact (Plan P4)** - Insight Card PNG, /insight/[id] shareable page, share tracking, polished /map/sample
- [ ] **Phase 6: Pricing Infrastructure (Plan P5)** - Stripe subscriptions, free-tier enforcement, email re-engagement, graduation-aware upgrade path
- [ ] **Phase 7: Deeper Regenerative Model (Plan P6)** - Circadian dimension, seasonal cadence, bioregion field, Hard-Season state, four graduation capacities measured
- [ ] **Phase 8: Commons, Protocol, Graduate Flywheel (Plan P7)** - Outcome-validated pattern contribution, royalty ledger, testimonial infrastructure, household invites, RPPL spec v0.1

## Sequencing & Parallelization

From the plan's Sequencing At A Glance + the solo operator reality:

| Week(s) | Phases running | Notes |
|---------|----------------|-------|
| Wk 1 | Phase 1 only | **Blocking.** Nothing ships without this gate. |
| Wk 2-3 | Phase 2 + Phase 3 | Can parallelize (independent surfaces — math vs. onboarding UI). |
| Wk 3-5 | Phase 3 (tail) + Phase 4 | Phase 4 depends on landing being live, but runs alongside Phase 3 polish. |
| Wk 6-8 | Phase 5 | Sequential after Phase 4 — needs funnel events to measure viral loop. |
| Wk 9-11 | Phase 6 | Sequential after Phase 5 — don't paywall before virality is primed. |
| Mo 3-4 | Phase 7 | Longer-horizon depth work; research can start earlier. |
| Mo 6+ | Phase 8 | Depends on Phase 2's outcome data and Phase 7's graduation capacities. |

**Hard dependencies:**
- Phase 1 blocks every downstream phase (no Anthropic-calling feature ships on an open door).
- Phase 6 PRICE-04 depends on Phase 7 DEPTH-05 (graduation capacities) — kept in Phase 6 but flagged as "lands when DEPTH-05 ships."
- Phase 8 LONG-01 depends on Phase 2 REGEN-03 (outcome measurement must exist before outcome-validated contribution can gate anything).

Config: `parallelization: true`, `granularity: standard` — eight phases matches the plan's natural P-group structure exactly.

## Phase Details

### Phase 1: Security & Cost Control (Plan P0)
**Goal**: No incident by Monday. No surprise Anthropic bill. No prompt-injection vector.
**Depends on**: Nothing (first phase — blocking gate for everything downstream)
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06
**Success Criteria** (what must be TRUE):
  1. Unauthenticated curl to `/api/v2-chat` and `/api/sheet` returns 401 (cron path with `CRON_SECRET` still passes)
  2. Per-user token quota enforced via Supabase ledger — anonymous/free/Operate tiers all rate-limited at request and token level
  3. Token counter runs before Anthropic dispatch — prompts over 80K (Sonnet) / 150K tokens truncate tail-first and emit warning header
  4. Prompt-injection sanitizer rejects `[[`/`]]` delimiters with 400, strips "ignore previous instructions" patterns, NFC-normalizes input
  5. Every API route emits structured JSON log with req_id, user_id, route, prompt_tokens, output_tokens, latency_ms, status
  6. SSE stream in `v2-chat/route.ts` aborts the Anthropic stream when `request.signal.aborted` fires (verified via disconnect test)
**Plans**: 11 plans (Wave 0: plan 00 fixtures; Wave 1: plans 01-04, 05a, 06 parallel; Wave 2: plans 05b, 05c parallel; Wave 3: plan 07 enablement; Wave 4: plan 08 sec02-admin-credentials gap close)
- [x] 01-00-fixtures-PLAN.md — Wave 0: shared mock-supabase, mock-anthropic, capture-log fixtures
- [x] 01-01-auth-gate-PLAN.md — SEC-01: requireUser + anon session + AuthModal upgrade + smoke (IP-limit anon-only — Warning 1)
- [x] 01-02-quota-ledger-PLAN.md — SEC-02: migration 016 + quota.ts + QuotaCard (runtime enforcement closed by 01-08)
- [x] 01-03-token-budget-PLAN.md — SEC-03: budgetCheck + countTokens + route ordering owner (Blocker 6) + smoke (Warning 3)
- [x] 01-04-sanitizer-PLAN.md — SEC-04: sanitize.ts + Zod refinements + audit + coverage hard-fail (Blocker 1) + truth shape fixed (Blocker 3)
- [x] 01-05a-observability-lib-PLAN.md — SEC-05 lib: ulid + withObservability (closure tokens — Warning 5; queue retry — Warning 4)
- [x] 01-05b-observability-routes-PLAN.md — SEC-05: wrap 8 non-streaming routes + coverage meta-test with INDIRECT_ALLOWLIST
- [x] 01-05c-observability-streaming-PLAN.md — SEC-05: v2-chat finalMessage + morning-sheet (fetch-mocked — Blocker 4) + cost-rollup + migration 017
- [x] 01-06-sse-abort-PLAN.md — SEC-06: {signal} option + abort handlers + manual smoke (consumes Plan 00 fixture as-is)
- [x] 01-07-enablement-PLAN.md — Phase 1 enabled in production behind PHASE_1_GATE_ENABLED=true; migrations + flag flip live; Bearer auth fix (08cf2c1) + TS build fix (57ee0c6) landed as scope additions
- [x] 01-08-sec02-admin-credentials-PLAN.md — SEC-02 gap close: @supabase/supabase-js ^2.104.0 upgrade + migrations 018/019 (PL/pgSQL ambiguity fix) + structured fail-open WARN + operator env rotation; user_quota_ledger enforcing (req_count=5, 6th=429)

### Phase 2: Regenerative Math Honesty (Plan P1)
**Goal**: Make the code tell the truth the docs already tell.
**Depends on**: Phase 1 (gate); can parallelize with Phase 3
**Requirements**: REGEN-01, REGEN-02, REGEN-03, REGEN-04, REGEN-05
**Success Criteria** (what must be TRUE):
  1. `capital-computation.ts:76` no longer multiplies scores by engagement — engagement is a confidence shader (0→1 over 14 days), UI opacity reflects confidence, no score penalty for rest
  2. User can toggle Dormancy from the Whole profile panel; Dormant state shows "Nothing today. Rest is the work." with push silenced and no decay/nudges
  3. User can mark any day Fallow from the sheet; sheet shows "Fallow. Compost day." with checkoff disabled and no behavior log entry written
  4. Every capital score on /whole expands into a receipt showing inputs, weights, thresholds, and confidence — math is reproducible by a patient user
  5. Aspirations and patterns older than 90 days prompt the Yes/Some/No/Worse + one-sentence-why outcome check; pattern-strength signal becomes outcome-weighted
**Plans**: 6 plans (Wave 0: plan 00 fixtures/test stubs; Wave 1: plans 01, 02, 04, 05 parallel; Wave 2: plan 03 capital-receipt — depends on plan 01 CapitalRadar edits)
- [ ] 02-00-fixtures-PLAN.md — Wave 0: 16 test-file stubs + regen-02-dormancy.sh shell + shape-parity smoke
- [ ] 02-01-confidence-math-PLAN.md — REGEN-01: capital-computation engagement multiplier removal + CapitalScore.confidence + CapitalRadar opacity/dashed-axis
- [ ] 02-02-dormancy-PLAN.md — REGEN-02: HumaContext.dormant + /api/operator/dormancy + SettingsSheet toggle + useToday DormantCard + cron skip + CapitalPulse.dormant → quiet rename
- [ ] 02-03-capital-receipt-PLAN.md — REGEN-04: CapitalReceiptSheet bottom-sheet + CapitalRadar tap-to-open + buildCapitalReceipt pure helper + reproducibility parity test (Wave 2 after plan 01)
- [ ] 02-04-fallow-day-PLAN.md — REGEN-05: HumaContext.fallowDays + /api/sheet/fallow + sheet/check 409 FALLOW_DAY guard + useToday FallowCard + sheet header toggle + post-midnight freeze
- [ ] 02-05-outcome-check-PLAN.md — REGEN-03: migration 020_outcomes.sql + /api/outcome + isOutcomeDue / applyOutcomeToStrength pure libs + OutcomeCheckCard on /today + pattern-strength re-compute

### Phase 3: Onboarding Visibility (Plan P2)
**Goal**: The promise is "see the whole." The promise must be fulfilled before minute three.
**Depends on**: Phase 1 (gate); can parallelize with Phase 2
**Requirements**: ONBOARD-01, ONBOARD-02, ONBOARD-03, ONBOARD-04, ONBOARD-05, ONBOARD-06
**Success Criteria** (what must be TRUE):
  1. First-time mobile user sees draft-styled SheetPreview after message 2 in /start; preview updates in-place as context accrues
  2. Persistent half-height context-visibility strip replaces the 3-second peek — dimension pills light up with the specific fact the user said
  3. /start header shows live "N of 8 parts filled in" counter; increments as context extraction completes
  4. First decomposition renders an inline StructuralInsightCard (e.g., "Cook at home touches 5 of your 8 parts") — the first aha arrives inline, not post-onboarding
  5. User-visible copy uses operator vocabulary: `part` (not dimension), `shape` (not capital), `move` (not Roland-pattern) — internal identifiers unchanged
  6. HUMA responses render as "notes from the neighbor" (Cormorant Garamond, off-white card, no bubble); user messages stay as bubbles
  7. Time-to-first-aha under 90 seconds for 80% of test sessions
**Plans**: TBD

### Phase 4: Landing & Funnel Instrumentation (Plan P3)
**Goal**: 5-second test passes. Funnel is visible. Every optimization is evidence-based from here forward.
**Depends on**: Phase 1 (gate); runs alongside Phase 3 tail
**Requirements**: FUNNEL-01, FUNNEL-02, FUNNEL-03, FUNNEL-04, FUNNEL-05, FUNNEL-06
**Success Criteria** (what must be TRUE):
  1. Landing hero renders the briefing card first; conversation-that-produced-it appears below with "This is where this came from" caption
  2. Primary CTA reads "See your first briefing"; secondary CTA reads "Browse a sample life" (→ /map/sample); every CTA on the page aligned
  3. All 10 foundation PostHog events fire with correct payloads — landing_view, start_conversation, first_aspiration_stated, first_decomposition_complete, first_sheet_viewed, day_3_return, day_7_return, first_insight_received, first_pattern_validated, first_share
  4. UTM parameters persist from landing, attach to user profile on signup, and carry on every downstream funnel event — dashboards can group by source
  5. PostHog feature-flag A/B framework installed; first headline test queued (current vs. "See what's actually working in your life" vs. "Stop following the plan. Follow the data.")
  6. `/landing/[slug]` route live with 3 seed pages (freelancer-burnout, new-parent, career-pivot) — pre-filled aspirations and per-slug SEO metadata
  7. 5-second test passes with 5 test users who've never seen the landing page
**Plans**: TBD

### Phase 5: Viral Insight Artifact (Plan P4)
**Goal**: The insight is the payload. Every surprising cross-dimensional connection should travel.
**Depends on**: Phase 4 (needs funnel events for share tracking)
**Requirements**: VIRAL-01, VIRAL-02, VIRAL-03, VIRAL-04
**Success Criteria** (what must be TRUE):
  1. `/api/og/insight/[id]` renders the Insight Card PNG in 800ms or less — operator initial, insight copy, supporting datum, HUMA wordmark, URL
  2. `/insight/[id]` public page renders explanation + sample briefing + CTA; OG meta points to the card PNG and previews correctly on iMessage, WhatsApp, Twitter, LinkedIn
  3. Share funnel tracked end-to-end: share_click, share_completed, shared_page_view, shared_page_conversion — utm_content=insight_[id] matches downstream signups
  4. `/map/sample` renders a polished, publicly-indexable non-real sample life and briefing — "browse before you commit" entry point
  5. First organic shared-page → signup recorded in PostHog
**Plans**: TBD

### Phase 6: Pricing Infrastructure (Plan P5)
**Goal**: Revenue is trackable. Upgrades are ethical, not shame-driven.
**Depends on**: Phase 5 (don't paywall before viral loop primes); PRICE-04 depends on Phase 7 DEPTH-05
**Requirements**: PRICE-01, PRICE-02, PRICE-03, PRICE-04
**Success Criteria** (what must be TRUE):
  1. Stripe (or LemonSqueezy) subscriptions live for Operate ($29) and Professional ($99); webhooks update Supabase `subscriptions` table; compute-heavy features gate on subscription status
  2. Free-tier limits enforced — fourth aspiration creation shows a respectful upgrade card in Voice Bible tone ("The free tier holds three. The fourth needs Operate.") with no shame copy
  3. Day-3/7/14 dropout re-engagement emails ship transactionally via Resend (or SES); no marketing list; copy matches plan's spec
  4. Graduation-detected user (75/100 across four capacities) receives Professional upsell path — not pushed to stay on Operate — honoring the ethical framework
  5. First paying customer recorded; dunning tested; refunds handled; MRR visible in PostHog
**Plans**: TBD

### Phase 7: Deeper Regenerative Model (Plan P6)
**Goal**: Regen critique's missing domains get representation without bloating the model. Cadence becomes seasonal.
**Depends on**: Phase 2 (uses Dormancy pattern for Hard-Season); long-horizon — can begin research during Phases 4-6
**Requirements**: DEPTH-01, DEPTH-02, DEPTH-03, DEPTH-04, DEPTH-05
**Success Criteria** (what must be TRUE):
  1. `context.body` accepts optional circadian fields (wake time, sleep time, morning light, late screens); sheet prompts use them for placed-ness without becoming a health tracker
  2. Solstice/equinox-triggered quarterly seasonal reviews ship; first login after each solstice prompts "what came into flower / went to seed / laying down for winter?"; completion rate > 40% of eligible operators
  3. `context.home` accepts optional bioregion (lat/long or named), climate zone, computed daylight hours; sheet prompts reflect placed-ness when provided
  4. Hard-Season state togglable alongside Dormancy; voice shifts per Ethical Framework §03; sheet replaced with "One thing. The smallest."; no decay, no measurement
  5. Four graduation capacities scored 0-25 each via concrete behavioral tests — Pattern Internalization, Self-Diagnosis, Node Recognition, Whole Seeing — unlocking Phase 6 PRICE-04
**Plans**: TBD

### Phase 8: Commons, Protocol, Graduate Flywheel (Plan P7)
**Goal**: Open what should be open without orphaning what shouldn't. Let graduates power the next cohort.
**Depends on**: Phase 2 REGEN-03 (outcome data must exist); Phase 7 DEPTH-05 (graduation capacities); longest horizon — parallel research ok from Phase 4 onward
**Requirements**: LONG-01, LONG-02, LONG-03, LONG-04, LONG-05
**Success Criteria** (what must be TRUE):
  1. Pattern contribution gated on 6+ months outcome data with ≥"Some" improvement from 10+ operators; 20+ patterns meet this bar
  2. Internal pattern royalty ledger tracks applied/outcome/forked events; no payments yet — structure proven privately before protocol exposure
  3. Graduate testimonial infrastructure live (before-shape / after-shape / keystone / what changed); first opt-in testimonial rendered on landing + situation-specific pages
  4. Household invite flow live — operator invites partner/housemate as shared-context link (not separate account); co-checkoff visible to both; no feed, no social
  5. RPPL spec v0.1 decision made at ~100 validated patterns + ~2,000 operators — publish schema/dimensional framework/compilation rules as document only, no open-source implementation
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 (parallel with 3) → 3 → 4 (parallel with 3 tail) → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Security & Cost Control (P0) | 11/11 | Complete | 2026-04-21 |
| 2. Regenerative Math Honesty (P1) | 0/6 | Planned | - |
| 3. Onboarding Visibility (P2) | 0/TBD | Not started | - |
| 4. Landing & Funnel Instrumentation (P3) | 0/TBD | Not started | - |
| 5. Viral Insight Artifact (P4) | 0/TBD | Not started | - |
| 6. Pricing Infrastructure (P5) | 0/TBD | Not started | - |
| 7. Deeper Regenerative Model (P6) | 0/TBD | Not started | - |
| 8. Commons, Protocol, Graduate Flywheel (P7) | 0/TBD | Not started | - |

**Coverage:** 41/41 v1 requirements mapped across 8 phases — see REQUIREMENTS.md Traceability.

---
*Roadmap created: 2026-04-18 — derived directly from docs/Remediation-Build-Plan.md P0-P7.*
*Phase 1 planned: 2026-04-18 — 10 plans (00 fixtures, 01-04 + 05a + 06 in Wave 1, 05b + 05c in Wave 2, 07 enablement in Wave 3). Revised after checker feedback (Blockers 1-6 addressed; Warnings 1-7 covered). Observability was split into 05a/05b/05c during planning.*
*Phase 1 partial close: 2026-04-21 — 10/10 plans landed; code shipped behind PHASE_1_GATE_ENABLED=true. SEC-02 runtime enforcement deferred to Phase 1.1 (Supabase credential migration blocker — see `.planning/phases/01-security-cost-control/deferred-items.md`).*
*Phase 1 complete: 2026-04-21 — 11/11 plans; plan 01-08 closed SEC-02 runtime gap via @supabase/supabase-js ^2.104.0 upgrade + migrations 018/019 fixing latent PL/pgSQL ambiguity in increment_quota_and_check. All SEC-01..SEC-06 enforcing in production.*
*Phase 2 planned: 2026-04-22 — 6 plans (00 fixtures, 01/02/04/05 in Wave 1, 03 in Wave 2 depending on 01's CapitalRadar edits). All 5 REGEN requirement IDs mapped exactly once. 17 new test files pre-stubbed in Wave 0 per 02-VALIDATION.md.*

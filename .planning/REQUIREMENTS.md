# Requirements: HUMA Remediation

**Defined:** 2026-04-18
**Core Value:** Reduce cognitive load and reveal connections — every feature must pass The Single Test.
**Source:** `docs/Remediation-Build-Plan.md`

## v1 Requirements

Requirements for the Remediation milestone. Each maps to one GSD phase. Plan IDs (P0.x, P1.x) preserved for reference.

### Security & Cost Control (Plan P0)

- [x] **SEC-01** *(P0.1)*: `/api/v2-chat` and `/api/sheet` reject unauthenticated requests with 401. Magic-link auth (already wired) gates pre-auth chat; cron path keeps `CRON_SECRET` bypass.
- [x] **SEC-02** *(P0.2)*: Per-user token budget + structured rate limit via Supabase-backed ledger. Tiers: anonymous (5 req / 10K tokens/day), free (50 req / 100K tokens/day), Operate (500 req / 2M tokens/day).
- [ ] **SEC-03** *(P0.3)*: Token counting before dispatch. Prompts exceeding 80K (Sonnet) or 150K tokens get truncated tail-first with warning header. Prevents runaway cost.
- [ ] **SEC-04** *(P0.4)*: Prompt-injection defense at input boundary. Reject `[[`/`]]` marker delimiters with 400, strip "ignore previous instructions" patterns, NFC-normalize, strip zero-width chars.
- [x] **SEC-05** *(P0.5)*: Request IDs + structured JSON logging. Every route emits req_id, user_id, route, prompt_tokens, output_tokens, latency_ms, status. Cost/error/latency dashboards + alerts.
- [x] **SEC-06** *(P0.6)*: SSE disconnect handling. `v2-chat/route.ts` aborts Anthropic stream when `request.signal.aborted` fires, stopping payment for bytes no one reads.

### Regenerative Math Honesty (Plan P1)

- [ ] **REGEN-01** *(P1.1)*: Remove engagement penalty for rest. `capital-computation.ts:76` becomes a confidence shader (0→1 over 14 days of data), not a score multiplier. UI opacity reflects confidence; no score penalty for rest.
- [ ] **REGEN-02** *(P1.2)*: Dormancy as first-class operator state. Toggle from Whole profile panel. Sheet replaced with "Nothing today. Rest is the work." No push, no decay, no nudges, no guilt. Re-entry is one message.
- [ ] **REGEN-03** *(P1.3)*: Outcome measurement at pattern/aspiration level. 90-day outcome check asks Yes/Some/No/Worse + one-sentence why. Pattern strength becomes outcome-weighted.
- [ ] **REGEN-04** *(P1.4)*: Capital algorithm transparency. Every capital score on /whole expandable to a receipt showing inputs, weights, thresholds, and confidence. Sovereignty means the math is reproducible.
- [ ] **REGEN-05** *(P1.5)*: Fallow day ("do-nothing sheet"). One-tap mark from sheet. Shows "Fallow. Compost day." Checkoff disabled; no behavior log entry; engagement-confidence unaffected.

### Onboarding Visibility (Plan P2)

- [ ] **ONBOARD-01** *(P2.1)*: SheetPreview component in `/start`. After message 2, a draft-styled preview card shows tentative behaviors from decomposition-so-far; updates in-place as context accrues.
- [ ] **ONBOARD-02** *(P2.2)*: Persistent mobile context-visibility strip. Replaces 3-second peek pattern with half-height strip showing dimension pills as they fill (unlit → lit with the specific fact the user said).
- [ ] **ONBOARD-03** *(P2.3)*: Live "N of 8 parts filled in" counter in `/start` header. Not gamified — stated. Increments in real time as context extraction completes.
- [ ] **ONBOARD-04** *(P2.4)*: Day-1 structural insight, actually rendered. `lib/structural-insight.ts` computes shared-behavior / dimension-reach; `<StructuralInsightCard>` surfaces first aha inline the moment first aspiration decomposes.
- [ ] **ONBOARD-05** *(P2.5)*: Operator-facing vocabulary audit. Replace user-visible `dimension` → `part`, `capital` → `shape`, `pattern` (Roland-sense) → `move` per Voice Bible §04. Internal identifiers unchanged.
- [ ] **ONBOARD-06** *(P2.6)*: Distinctive conversation UI. HUMA responses render as "notes from the neighbor" (Cormorant Garamond, off-white card, no bubble); user messages stay as bubbles. Visual reinforces voice.

### Landing & Funnel Instrumentation (Plan P3)

- [ ] **FUNNEL-01** *(P3.1)*: Invert the landing hero. Render briefing card as the first thing visible; conversation-that-produced-it appears below with "This is where this came from" caption. Move "two weeks, then proof" into hero subtitle.
- [ ] **FUNNEL-02** *(P3.2)*: CTA rewrite. Primary: "See your first briefing." Secondary: "Browse a sample life" (→ /map/sample). Every CTA aligned.
- [ ] **FUNNEL-03** *(P3.3)*: PostHog integration + 10 foundation events wired (landing_view, start_conversation, first_aspiration_stated, first_decomposition_complete, first_sheet_viewed, day_3_return, day_7_return, first_insight_received, first_pattern_validated, first_share).
- [ ] **FUNNEL-04** *(P3.4)*: UTM + cohort tagging. Persist utm_source/campaign/medium/content from landing; carry on all funnel events; group dashboards by source.
- [ ] **FUNNEL-05** *(P3.5)*: Landing A/B framework via PostHog feature flags. First test queued: headline variants (current vs. "See what's actually working in your life" vs. "Stop following the plan. Follow the data.").
- [ ] **FUNNEL-06** *(P3.6)*: Situation-specific landing pages. `/landing/[slug]` dynamic route seeded with 3 pages (freelancer-burnout, new-parent, career-pivot); pre-filled aspirations + SEO metadata per slug.

### Viral Insight Artifact (Plan P4)

- [ ] **VIRAL-01** *(P4.1)*: Insight Card component. Distinctive PNG-rendered card for cross-dimensional insights via `/api/og/insight/[id]`. Layout: operator first initial, insight copy, supporting datum, HUMA wordmark, URL.
- [ ] **VIRAL-02** *(P4.2)*: `/insight/[id]` public shareable page. OG meta points to card PNG; body is explanation + sample briefing + CTA. Treated as a landing page for that life situation.
- [ ] **VIRAL-03** *(P4.3)*: Share tracking events: share_click, share_completed (via Web Share API result), shared_page_view, shared_page_conversion. Match utm_content=insight_[id] on downstream signups.
- [ ] **VIRAL-04** *(P4.4)*: `/map/sample` polished non-real sample life + briefing. Publicly indexable. "Browse before you commit" entry point.

### Pricing Infrastructure (Plan P5)

- [ ] **PRICE-01** *(P5.1)*: Stripe (or LemonSqueezy) subscriptions for Operate ($29) and Professional ($99). Webhook into Supabase `subscriptions` table. Compute-heavy features gated on subscription status.
- [ ] **PRICE-02** *(P5.2)*: Free-tier enforcement. Free = 3 aspirations decomposed, basic sheet, 1 insight, template browsing. Fourth aspiration shows respectful upgrade card per Voice Bible rules.
- [ ] **PRICE-03** *(P5.3)*: Email re-engagement (Resend or SES) at day 3, 7, 14 dropouts. Transactional only, no marketing list. Copy per plan.
- [ ] **PRICE-04** *(P5.4)*: Graduation-aware upgrade path. User hitting 75/100 across four capacities offered Professional (not pushed to stay on Operate). Honors ethical framework. Depends on DEPTH-05.

### Deeper Regenerative Model (Plan P6)

- [ ] **DEPTH-01** *(P6.1)*: Circadian dimension as optional `context.body` fields (wake time, sleep time, morning light, late screens). Not a health tracker — informs sheet generation copy.
- [ ] **DEPTH-02** *(P6.2)*: Seasonal cadence for reviews. Weekly stays; add solstice/equinox-triggered quarterly reviews ("what came into flower / went to seed / laying down for winter?").
- [ ] **DEPTH-03** *(P6.3)*: Bioregion field on `context.home` (lat/long or named, climate zone, daylight hours now computed). Skippable. Used in sheet prompts for placed-ness.
- [ ] **DEPTH-04** *(P6.4)*: Hard Season state (grief/crisis). Voice shifts per Ethical Framework §03. Sheet replaced with "One thing. The smallest." No decay, no measurement.
- [ ] **DEPTH-05** *(P6.5)*: Four graduation capacities measured (Pattern Internalization, Self-Diagnosis, Node Recognition, Whole Seeing), each scored 0-25 with concrete behavioral tests.

### Commons, Protocol, Graduate Flywheel (Plan P7)

- [ ] **LONG-01** *(P7.1)*: Outcome-validated pattern contribution gate. Only patterns with 6+ months outcome data and ≥"Some" improvement from 10+ operators become contributable. Depends on REGEN-03.
- [ ] **LONG-02** *(P7.2)*: Pattern royalty ledger (private to start). Track applied/outcome/forked events internally. No payments yet — prove incentive structure before exposing.
- [ ] **LONG-03** *(P7.3)*: Graduate testimonial infrastructure. Before-shape / after-shape / keystone behavior / what changed. Surfaces on landing + situation-specific pages. Opt-in, editable, deletable.
- [ ] **LONG-04** *(P7.4)*: Household invites. Operator invites partner/housemate as shared-context link (not separate account). Co-checkoff visible to both. No feed, no social.
- [ ] **LONG-05** *(P7.5)*: RPPL spec v0.1 publication — decision point at ~100 validated patterns + ~2,000 operators. Publishes schema, dimensional framework, compilation rules. Document only, no open-source implementation.

## v2 Requirements

Deferred to future milestones.

### Cross-Cutting Hygiene

- **CROSS-01**: Database hygiene — GIN indexes on `contexts.huma_context`, `aspirations.behaviors`, `sheet_entries.detail`. Quarterly backup/restore drill. (Plan CC.2)
- **CROSS-02**: Prompt template discipline — replace string `.replace()` templating with typed renderer; unreplaced `{var}` throws in dev. (Plan CC.4)
- **CROSS-03**: Voice audit CI check — grep prompts + user-visible strings for Voice Bible §02 banned phrases; automate as warning. (Plan CC.3, partially covered by ONBOARD-05)

## Out of Scope

Explicitly excluded. See PROJECT.md for rationale.

| Feature | Reason |
|---------|--------|
| Open-source RPPL implementation (this year) | Principle 14 — defer until reason to open |
| Community feed / social network | The invite is the unit. No pages, follows, likes. |
| Lunar cycles as hard feature | Optional overlay at most. Aesthetic, not load-bearing. |
| HRV / wearable integration | Vendor lock-in + data-gravity; stay manual |
| Chat UI from-scratch rewrite | Never-rewrite memory — surgical edits only |
| Anonymous preview-token JWT for pre-auth chat | Magic-link is already wired; use it instead. Saves ~2 days. |
| Pricing before Phase 3 onboarding ships | Paywall on unclear value = churn |
| Living Surface concept | Shelved 2026-04-13 — visually impressive, doesn't help users |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | Phase 1 | Complete |
| SEC-02 | Phase 1 | Complete |
| SEC-03 | Phase 1 | Pending |
| SEC-04 | Phase 1 | Pending |
| SEC-05 | Phase 1 | Complete |
| SEC-06 | Phase 1 | Complete |
| REGEN-01 | Phase 2 | Pending |
| REGEN-02 | Phase 2 | Pending |
| REGEN-03 | Phase 2 | Pending |
| REGEN-04 | Phase 2 | Pending |
| REGEN-05 | Phase 2 | Pending |
| ONBOARD-01 | Phase 3 | Pending |
| ONBOARD-02 | Phase 3 | Pending |
| ONBOARD-03 | Phase 3 | Pending |
| ONBOARD-04 | Phase 3 | Pending |
| ONBOARD-05 | Phase 3 | Pending |
| ONBOARD-06 | Phase 3 | Pending |
| FUNNEL-01 | Phase 4 | Pending |
| FUNNEL-02 | Phase 4 | Pending |
| FUNNEL-03 | Phase 4 | Pending |
| FUNNEL-04 | Phase 4 | Pending |
| FUNNEL-05 | Phase 4 | Pending |
| FUNNEL-06 | Phase 4 | Pending |
| VIRAL-01 | Phase 5 | Pending |
| VIRAL-02 | Phase 5 | Pending |
| VIRAL-03 | Phase 5 | Pending |
| VIRAL-04 | Phase 5 | Pending |
| PRICE-01 | Phase 6 | Pending |
| PRICE-02 | Phase 6 | Pending |
| PRICE-03 | Phase 6 | Pending |
| PRICE-04 | Phase 6 | Pending |
| DEPTH-01 | Phase 7 | Pending |
| DEPTH-02 | Phase 7 | Pending |
| DEPTH-03 | Phase 7 | Pending |
| DEPTH-04 | Phase 7 | Pending |
| DEPTH-05 | Phase 7 | Pending |
| LONG-01 | Phase 8 | Pending |
| LONG-02 | Phase 8 | Pending |
| LONG-03 | Phase 8 | Pending |
| LONG-04 | Phase 8 | Pending |
| LONG-05 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 41 total
- Mapped to phases: 41
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-18*
*Last updated: 2026-04-18 after GSD bootstrap from Remediation Build Plan*

HUMA Remediation Build Plan
A plan that takes all three critiques seriously without abandoning the vision. Phased so nothing blocks shipping, sequenced so each phase pays rent for the next.

0. Framing Principles
Five rules that govern every task below. If a proposed change violates one of these, it goes back in the planning doc.

Security and cost control are Phase 0. Nothing ships after them until they ship. A single malicious actor can burn the company on a Sunday morning. Not acceptable.
Fix the regenerative math before adding regenerative features. One wrong line in capital-computation.ts contradicts the thesis more than any missing dimension.
Make the thesis visible in the UI before scaling the thesis. Users won't believe "see the whole" if they can't see HUMA's model of them being built.
Instrument before optimizing. Every A/B, every retention improvement, every pricing test requires a funnel event first.
Don't build the protocol yet. Principle 14 from the Vision doc still holds. Every "open RPPL" task is deferred to Phase 7.
Phase 0 — Stop the Bleeding (Week 1)
Goal: No incident by Monday. No surprise Anthropic bill. No prompt injection vector.

P0.1 — Gate /api/v2-chat and /api/sheet with auth
What: Add createServerSupabase() + auth.getUser() checks at the top of v2-chat/route.ts and sheet/route.ts. Return 401 when unauthenticated. Cron path keeps its CRON_SECRET bypass.
Pre-auth handling: The /start flow currently needs chat before auth. Introduce an anonymous preview token — server-issued short-lived JWT, 1 per IP per 24h, max 5 messages, capped at 1K output tokens. This keeps the funnel open without an open-door API.
Effort: M (2 days). Touches v2-chat, sheet, lib/api-error, adds lib/preview-token.ts, updates useStart to request token.
P0.2 — Per-user token budget + structured rate limit
What: Replace IP-only rate limiter with Supabase-backed per-user ledger. Columns: user_id, window_start, prompt_tokens, output_tokens, request_count. Budget tiers: anonymous (5 req / 10K tokens per day), free ($0 user, 50 req / 100K tokens per day), Operate ($29, 500 req / 2M tokens per day).
Where: New 016_user_quotas.sql migration. New lib/rate-limit/user-quota.ts. Integrate into all Anthropic-calling routes.
Effort: M (2-3 days).
P0.3 — Token counting before dispatch
What: Use @anthropic-ai/tokenizer or server-side estimate. If prompt > 80K tokens (Sonnet) or > 150K tokens, truncate the recentHistory and conversationMessages tail-first, then warn via response header. Prevents runaway cost on long-context users.
Where: lib/services/prompt-builder.ts — add budgetCheck(prompt, limit) helper. Call from v2-chat and sheet routes before anthropic.messages.stream().
Effort: S (1 day).
P0.4 — Prompt injection defense at input boundary
What: Before interpolating any user-supplied string (aspirations[].rawText, humaContext.*, message content) into a system prompt, run a sanitizer that:
Rejects strings containing [[ or ]] (marker delimiters) with 400.
Strips leading "ignore previous instructions" patterns (Jackson defense list — keep it short, not a paranoid regex wall).
Normalizes to NFC and strips zero-width chars.
Where: lib/schemas/sanitize.ts. Integrate into parseBody() wrapper.
Effort: S (1 day).
P0.5 — Request IDs, structured logging, minimum observability
What: Every route generates a req_id (ULID), logs entry/exit/errors as JSON (not console.error text). Include: req_id, user_id, route, prompt_tokens, output_tokens, latency_ms, status. Ship to Vercel log drain or a Logtail endpoint — cheap, searchable.
Where: lib/observability/logger.ts. Wrap every API route.
Effort: M (2 days).
P0.6 — SSE disconnect handling
What: In v2-chat/route.ts:97-115, wire request.signal.aborted into the ReadableStream controller. When client disconnects, call stream.abort() to stop paying Anthropic for bytes no one will read.
Effort: S (half day).
Phase 0 gate: Anonymous curl to /api/v2-chat returns 401. Per-user quota enforced. Prompt budgets logged. Ship. Everything below is locked behind this gate.

Phase 1 — Regenerative Honesty (Weeks 2-3)
Goal: Make the code tell the truth the docs already tell. Each item here is tiny in code, load-bearing in meaning.

P1.1 — Remove the engagement penalty for rest
What: Change capital-computation.ts:76 from a multiplier into a confidence shader. Scores remain on their true scale regardless of days active; engagement becomes a display-time shading of the score's opacity or a small confidence label ("based on 3 days of data"). Never a score penalty.
Replacement logic:
const confidence = Math.min(1, totalActiveDays / 14); // 14 days to full confidence
// Score is raw, confidence is a separate returned field
return { form, score, confidence, note };
UI: CapitalRadar opacity = 0.3 + 0.7 * confidence. Low-confidence scores look light; high-confidence look solid. No penalty for taking a week off.
Effort: S (half day code, half day UI).
P1.2 — Add Dormancy as a first-class operator state
What: A user can set themselves to Dormant from any screen. Dormant state:
Daily sheet replaced with a single card: "Nothing today. Rest is the work."
Push notifications silenced.
No decay, no nudges, no guilt copy.
Re-engagement on exit is one message: "Welcome back. Pick up where you left off, or start fresh."
Where: New huma-dormancy field on contexts.huma_context. Gate in useToday.ts and sheet compilation. New toggle in the Whole screen profile panel.
Effort: M (2 days).
P1.3 — Outcome measurement at pattern level
What: Every pattern + every aspiration gets a 90-day outcome check. Two questions, not a survey: "Did your life actually improve in this area? (Yes / Some / No / Worse)" and "One sentence on why or why not." Store on patterns and aspirations tables (new columns: outcome_rating, outcome_note, outcome_checked_at). Completion count stays, but the primary pattern-strength signal becomes outcome-weighted.
Where: New migration 017_outcomes.sql. New lib/outcome-service.ts. Insert the prompt into weekly review when aspiration age crosses 90 days.
Effort: M (3 days).
P1.4 — Capital algorithm transparency
What: Every capital score on /whole is expandable to a receipt:
Living capital: 3 (developing)
= Body primary (completion rate 0.52)
+ Home secondary × 0.5 (completion rate 0.41 × 0.5 = 0.21)
÷ 1.5 contributions
= 0.47 → threshold (0.35–0.55) → score 3
Confidence: 0.78 (11 of 14 days observed)
Why: Sovereignty means the user can reproduce the calculation. If they can't, graduation is impossible.
Where: CapitalRadar.tsx — new <CapitalReceipt> expandable panel. Pull math directly from capital-computation.ts exports.
Effort: S (1 day).
P1.5 — Fallow day / "do-nothing sheet"
What: User can mark any day as Fallow from the sheet itself (one tap, persistent for that date). Sheet shows: "Fallow. Compost day. The ground is working underneath." Checkoff disabled. No behavior log entry created — so engagement-confidence isn't affected negatively.
Effort: S (1 day).
Phase 1 gate: A regenerative practitioner can open the code, read capital-computation.ts, and no longer laugh. Engagement penalty is gone. Rest is a first-class state. The algorithm is legible to a patient user.

Phase 2 — Onboarding Visibility (Weeks 2-4, parallel with Phase 1)
Goal: The promise is "see the whole." The promise must be fulfilled before minute three.

P2.1 — SheetPreview component
What: After message 2 in /start, a preview card appears above the conversation: "Here's what your first day looks like." Shows 2-3 tentative behaviors from decomposition-so-far, styled as "draft" (lighter opacity, dashed border). Updates in-place as context accrues.
Where: New components/start/SheetPreview.tsx. Hook into useStart.tsx state: when aspirations.length >= 1, render with decomposed behaviors.
Effort: M (2 days).
P2.2 — Mobile context visibility
What: Replace the "pulsing dot + 3-second peek" pattern (start/page.tsx:215-288) with a persistent half-height strip showing dimension pills as they fill. Each dimension unlit → lit with a specific fact the user said.
Effort: M (2 days).
P2.3 — Live "N of 8 understood" counter
What: In the /start header, persistent text: "3 of 8 parts of your picture filled in." Not gamified — stated. Increments in real time as context extraction completes.
Effort: S (half day).
P2.4 — The Day-1 structural insight, actually rendered
What: The V2 Foundation doc promises: "Cook at home touches 5 of your 8 dimensions." Implement the structural-insight computation and surface it as an inline card in /start the moment the first aspiration is decomposed. This is the first aha.
Where: New lib/structural-insight.ts — takes aspirations[].behaviors[].dimensions[] and returns top-N behaviors by dimension reach and shared-behavior count. Render as <StructuralInsightCard>.
Effort: M (2 days).
P2.5 — Operator-facing vocabulary audit
What: Grep the codebase for user-visible strings containing "dimension", "capital profile", "RPPL", "pattern" (when used in Roland-sense). Replace with Voice Bible §04 mappings: dimensions → parts, capital → shape, patterns → moves. Keep internal code identifiers; rewrite UI strings only.
Where: Grep → replace → voice reviewer PR. Estimate ~40-60 strings.
Effort: S (1 day).
P2.6 — Distinctive conversation UI
What: Replace generic chat bubbles with a format where HUMA's responses appear as horizontal "notes from the neighbor" (Cormorant Garamond, off-white card, no bubble shape). User messages remain bubbles. The visual distinction reinforces voice: HUMA isn't a chatbot; it's a voice from the fence post.
Effort: M (2 days).
Phase 2 gate: A first-time user, on mobile, in under 90 seconds, sees their picture being built, feels the first aha, and doesn't think "this is a chatbot."

Phase 3 — Landing & Funnel Instrumentation (Weeks 3-5, parallel)
Goal: 5-second test passes. Funnel is visible. Every optimization is evidence-based from here forward.

P3.1 — Invert the landing hero
What: LandingPage.tsx:22-62 — render the briefing card as the first thing visible. One second of rest. Then reveal the conversation that produced it underneath, captioned "This is where this came from." The briefing is the payoff; show the payoff first.
Also: Move the "two weeks, then proof" claim from paragraph 3 into the hero subtitle. It's your activation-cliff positioning — leading with it turns a weakness into a credibility signal.
Effort: M (2 days, including motion pass).
P3.2 — CTA rewrite
What: Replace "Start a conversation" with "See your first briefing" (primary) and "Browse a sample life" (secondary, links to /map/sample). Every CTA on the page aligned.
Effort: S (half day).
P3.3 — PostHog integration + funnel events
What: Install PostHog. Wire the 10 foundation events: landing_view, start_conversation, first_aspiration_stated, first_decomposition_complete, first_sheet_viewed, day_3_return, day_7_return, first_insight_received, first_pattern_validated, first_share. Each with user_id (post-auth) or anonymous_id (pre-auth).
Where: New lib/analytics/posthog.ts with typed track<EventName>() helpers. Call sites: landing CTAs, useStart state transitions, useToday check-offs, insight render, share buttons.
Effort: M (2-3 days).
P3.4 — UTM handling and cohort tagging
What: On landing, persist utm_source, utm_campaign, utm_medium, utm_content into localStorage. On signup, store on user profile. Every funnel event carries cohort tags. Dashboards grouped by source.
Effort: S (1 day).
P3.5 — Landing A/B framework
What: Install PostHog feature flags. First test queued for Phase 4: headline variants (current vs. "See what's actually working in your life" vs. "Stop following the plan. Follow the data.").
Effort: S (1 day for scaffolding, tests run later).
P3.6 — Situation-specific landing pages (scaffolding)
What: /landing/[slug] dynamic route. Seed with 3 pages: /landing/freelancer-burnout, /landing/new-parent, /landing/career-pivot. Each renders the same core product but with pre-filled aspiration examples in the hero and situation-specific briefing. SEO metadata per slug.
Effort: M (3 days).
Phase 3 gate: Landing passes 5-second test with 5 test users who've never seen it. Every funnel stage has event count in PostHog. First A/B test ready to run.

Phase 4 — The Viral Artifact (Weeks 6-8)
Goal: The insight is the payload. Every surprising cross-dimensional connection should travel.

P4.1 — Insight Card component
What: A distinctive, shareable, PNG-rendered card format for cross-dimensional insights. Layout: operator first name (initial only optional), the insight in voice-bible copy, one supporting datum, HUMA wordmark, URL. Render via /api/og/insight/[id].
Source of insights: The existing insight-generation pipeline at /api/insight. Trigger card render on any new insight.
Effort: M (3 days).
P4.2 — /insight/[id] shareable page
What: Public route. Meta OG image points to the insight card PNG. Page body is the insight explanation + sample briefing + CTA. Treat it as a landing page for that specific life situation.
Effort: M (2 days).
P4.3 — Share tracking
What: share_click, share_completed (via Web Share API result), shared_page_view, shared_page_conversion. Match utm_content=insight_[id] on downstream signups.
Effort: S (1 day).
P4.4 — Sample briefing page /map/sample
What: A polished, non-real, hand-crafted sample life and briefing. Publicly indexable. The "browse before you commit" entry point.
Effort: S (1 day).
Phase 4 gate: First organic share-to-signup recorded. Insight card PNG renders in 800ms or less. OG previews correctly on iMessage, WhatsApp, Twitter, LinkedIn.

Phase 5 — Pricing Infrastructure (Weeks 9-11)
Goal: Revenue is trackable. Upgrades are ethical, not shame-driven.

P5.1 — Stripe integration (or LemonSqueezy)
What: Subscription billing for Operate ($29) and Professional ($99). Webhook into Supabase subscriptions table. Gate compute-heavy features (unlimited aspirations, sheet depth, pattern contribution tools) on subscription status.
Effort: L (5 days).
P5.2 — Free-tier enforcement
What: Free = 3 aspirations decomposed, basic sheet, 1 insight, template browsing. Fourth aspiration creation shows a respectful upgrade card (Voice Bible rules apply — no "Unlock premium!" — say "The free tier holds three. The fourth needs Operate.").
Effort: M (2 days).
P5.3 — Email re-engagement (day 3, day 7, day 14 dropouts)
What: Resend (or SES) integration. Transactional emails only, no marketing list. Day 3: "Your sheet is still here. One number to restart: how's your week, 1-10?" Day 7: "Your context from [date]. One line to continue." Day 14: silence.
Effort: M (3 days).
P5.4 — Graduation-aware upgrade path
What: A graduated user (hits 75/100 across four capacities — once that's measurable, see Phase 6) is offered Professional, not pushed to stay on Operate. Honors the ethical framework.
Effort: S (1 day, depends on Phase 6).
Phase 5 gate: First paying customer. Dunning flows tested. Refunds handled. MRR tracked in PostHog.

Phase 6 — Deeper Model (Months 3-4)
Goal: The regen critique's missing domains get representation without bloating the model. Cadence becomes seasonal.

P6.1 — Circadian dimension (body extension)
What: Optional fields on context.body: typical wake time, typical sleep time, morning light exposure (yes/no/sometimes), late screen use (yes/no/sometimes). Not a health tracker — a context input that informs sheet generation. "You said you wake at 5:30 — the walk belongs before 7am when the sun is still low."
Effort: M (2 days).
P6.2 — Seasonal cadence for reviews
What: Weekly reviews stay. Add quarterly (solstice/equinox-triggered, not calendar-Q) seasonal reviews. UI cue is the first login after the solstice passes. Review asks: what came into flower this season? what went to seed? what are you laying down for winter?
Effort: M (3 days).
P6.3 — Bioregion field
What: On context.home, add bioregion (lat/long or named), climate_zone, daylight_hours_now (computed). Used in sheet prompts: "You're in Zone 6b in early April — the ground is thawing but the frost isn't done." Optional; skippable.
Effort: M (2 days).
P6.4 — Grief / crisis states
What: Alongside Dormancy, a "Hard Season" state. User can mark themselves. Voice shifts per Ethical Framework §03. Sheet replaced with "One thing. The smallest. You don't have to do anything else." No decay, no measurement.
Effort: S (1 day after Dormancy in Phase 1).
P6.5 — The four graduation capacities, actually measured
What: Pattern Internalization, Self-Diagnosis, Node Recognition, Whole Seeing. Concrete scoring. Each 0-25:
Pattern Internalization: Test is behavioral — if sheet doesn't prompt a previously-prompted behavior for 14 days and it still gets checked off, +score.
Self-Diagnosis: When weekly review presents raw data pre-insight, does the user's free-text answer contain the insight term before HUMA surfaces it? NLP overlap score.
Node Recognition: Monthly scenario prompt — "if one thing changed this month, what would it be?" Compare answer to HUMA's computed node. Overlap score.
Whole Seeing: Count of distinct dimensions the user references unprompted in weekly-review free text over last 4 weeks.
Effort: L (1 week, needs design partner operators to calibrate).
Phase 6 gate: The critique "checking boxes while living capital crumbles" no longer applies — the model at least sees the vectors that let a practitioner judge vitality. Cadence has seasonal beats.

Phase 7 — Long Game: Commons, Protocol, Graduate Flywheel (Months 6-12)
Goal: Open what should be open without orphaning what shouldn't. Let graduates power the next cohort.

P7.1 — Outcome-validated pattern contribution
What: Only patterns that have 6+ months of outcome data with ≥ "Some" improvement from 10+ operators become contributable. This makes the commons actually wisdom, not activity. Combined with P1.3's outcome measurement.
Effort: M (ongoing curation + 3 days infra).
P7.2 — Pattern royalty ledger (private to start)
What: Before going protocol-level, track royalty-relevant events (pattern applied, outcome reported, pattern forked) in an internal ledger. No payments yet. Prove the incentive structure works privately before exposing it.
Effort: M (3 days).
P7.3 — Graduate testimonial infrastructure
What: A graduate (or near-graduate) can publish a structured story: before shape, after shape, keystone behavior discovered, what changed. Surfaces on landing page, situation-specific pages. Opt-in, attributed, editable, deletable.
Effort: M (3 days).
P7.4 — Household invites
What: Operator invites partner/housemate — not a separate account, a shared-context link. Both can mark shared behaviors (cooking dinner, evening walk). Co-checkoff visible to both. No feed, no social network.
Effort: L (1 week, needs careful auth model).
P7.5 — RPPL spec v0.1 publication
What: Decision point at ~100 validated patterns + ~2,000 operators. Publish the schema, the dimensional framework, the compilation rules as a document. No open-source implementation yet — just the spec. This is the Alexander-book move.
Effort: M (2 weeks writing, 0 code).
Phase 7 gate: First pattern earning passive royalty recognition (internal). First graduate testimonial on landing. Decision made on RPPL publication timing.

Cross-Cutting Work Streams (Continuous)
CC.1 — Observability hardening
Dashboards: Anthropic cost per user, cost per route, p50/p95/p99 latency, error rates, quota-hit rates.
Alerts: any route > $X/hour, error rate > 2%, p99 latency > 10s.
CC.2 — Database hygiene
Add GIN indexes on contexts.huma_context, aspirations.behaviors, sheet_entries.detail once query patterns stabilize.
Backup/restore drill — run it once quarterly.
CC.3 — Voice audit cadence
Monthly: grep all prompt files and user-facing strings for Voice Bible §02 banned phrases. Automate in CI as a warning check.
CC.4 — Prompt template discipline
Replace string .replace() templating in sheet/route, reflection/route, whole-compute/route with a typed renderer. Unreplaced {var} throws in dev, warns in prod.
Explicitly NOT Doing
Stating these so we don't drift back to them under pressure.

Not open-sourcing RPPL this year. Principle 14. Defer until there's a reason to not.
Not building a community feed / social network. The invite is the unit. No pages, no follows, no likes.
Not implementing lunar cycles as a hard feature. Optional overlay at most. Aesthetic, not load-bearing.
Not building HRV / wearable integration. Adds complexity, locks us to vendors, creates data-gravity. Stay as manual context for now.
Not rewriting the chat UI from scratch. Surgical edits only per the never rewrite memory.
Not shipping pricing before Phase 2 delivers first-session value. Paywall on top of unclear value = churn.
Success Criteria Per Phase
Phase	Primary metric	Target
P0	Unauthenticated 401 rate on chat/sheet	100%
P1	Engagement penalty removed, dormancy usable	Code + 5 users testing dormancy
P2	Time-to-first-aha in /start	Under 90 seconds for 80% of sessions
P3	Funnel events firing	All 10, day-7 retention visible
P4	Organic shared-page → signup	First recorded
P5	First paying customer	MRR > $0
P6	Seasonal review completion rate	> 40% of eligible operators
P7	Patterns with 10+ validated outcomes	20+
Sequencing At A Glance
Wk 1:    [P0 Security] ──────────────────────────────────┐
Wk 2-3:  [P1 Regen math]  ║  [P2 Onboarding viz]         │
Wk 3-5:                   ║  [P3 Landing + funnel]       │
Wk 6-8:                          [P4 Viral artifact]     │
Wk 9-11:                              [P5 Pricing]       │
Mo 3-4:                                    [P6 Depth]    │
Mo 6+:                                         [P7 Long] │
Phase 0 is blocking. Phases 1, 2, 3 can run in parallel with two engineers. Phase 4-5 are sequential. Phase 6-7 are longer-horizon and can start research earlier.

The One-Sentence Version
Fix the cost bomb this week, fix the regen math next week, make the invisible visible in the UI the week after, then earn the right to ship pricing and virality on top of a product whose philosophy and implementation finally agree.


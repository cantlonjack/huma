# HUMA

## What This Is

Life infrastructure — a regenerative life-intelligence system that reveals how the parts of your life connect and which daily behaviors are the leverage points. For operators (not consumers) who want clarity over dashboards. Deployed at huma-two.vercel.app.

## Core Value

Reduce cognitive load and reveal connections. Every feature must pass The Single Test from CLAUDE.md: *"Does this reduce cognitive load and reveal connections?"* If it doesn't, it gets cut.

## Requirements

### Validated

<!-- Shipped and confirmed valuable through Sessions 1-11. -->

- ✓ Seven-page operator surface: /start, /today, /whole, /grow, /chat, /map/[id], /insight/[id] — existing
- ✓ Conversation engine with marker protocol (streaming SSE, mode switching Open/Focus/Decompose) — existing
- ✓ Daily production sheet compilation (Claude Sonnet generates 5 actions from context) — existing
- ✓ 9-dimension context model with deep merge and completeness scoring — existing
- ✓ Capital computation (5 forms) + capital pulse (real-time metrics) — existing
- ✓ Pattern extraction + validation from behavior logs — existing
- ✓ Supabase auth via magic-link (signInWithMagicLink) + RLS — existing
- ✓ Unified persistence: localStorage pre-auth, Supabase post-auth, WAL migration on first auth — existing
- ✓ Living Canvas sharing (Redis 90d TTL + Supabase fallback, OG image generation) — existing
- ✓ Push notifications + morning-sheet cron — existing
- ✓ Dark mode (Session 8), dimension legend (Session 9), unified /whole canvas with lenses (Session 10), desktop multi-column (Session 11), ship-quality polish — existing

### Active

<!-- Current scope: the Remediation Build Plan. 8 phases, sequenced so Phase 0 is blocking and 1-3 can parallelize. -->

- [ ] **Phase 0 — Security & cost control:** Auth-gate chat/sheet routes, per-user token budgets, prompt-injection defense, observability, SSE disconnect handling
- [ ] **Phase 1 — Regenerative math honesty:** Remove engagement penalty, add Dormancy state, outcome measurement, capital receipt, fallow-day mode
- [ ] **Phase 2 — Onboarding visibility:** Sheet preview during /start, persistent dimension pills, live N-of-8 counter, day-1 structural insight, operator vocabulary, distinctive conversation UI
- [ ] **Phase 3 — Landing & funnel instrumentation:** Inverted hero, CTA rewrite, PostHog integration, UTM/cohort tagging, A/B framework, situation-specific landing pages
- [ ] **Phase 4 — Viral insight artifact:** Insight Card PNG component, /insight/[id] shareable page, share tracking, sample briefing page
- [ ] **Phase 5 — Pricing infrastructure:** Stripe subscriptions, free-tier enforcement, email re-engagement, graduation-aware upgrade path
- [ ] **Phase 6 — Deeper regenerative model:** Circadian dimension, seasonal cadence, bioregion field, Hard-Season state, four graduation capacities measured
- [ ] **Phase 7 — Commons, protocol, graduate flywheel:** Outcome-validated pattern contribution, royalty ledger, testimonial infrastructure, household invites, RPPL spec v0.1

### Out of Scope

<!-- From the plan's "Explicitly NOT Doing" section and prior decisions. Reasons captured to prevent re-adding. -->

- Open-sourcing RPPL this year — Principle 14 from the Vision doc; defer until there's a reason not to. Revisit at ~100 validated patterns + ~2,000 operators.
- Community feed / social network — the invite is the unit. No pages, no follows, no likes.
- Lunar cycles as a hard feature — optional overlay at most. Aesthetic, not load-bearing.
- HRV / wearable integration — adds complexity, locks us to vendors, creates data-gravity. Stay as manual context.
- Rewriting chat UI from scratch — surgical edits only per the `never rewrite` memory (hard lesson from prior design-work loss).
- Shipping pricing before Phase 2 delivers first-session value — paywall on unclear value equals churn.
- Anonymous preview token for pre-auth chat — magic-link auth is already wired (AuthModal.tsx:15 signInWithMagicLink); use it for gate instead. Saves ~2 days of JWT/ledger infra.
- Living Surface concept — shelved 2026-04-13 (visually impressive but doesn't help users).

## Context

**Tech environment:**
- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- Claude API: Sonnet 4.6 for conversation/sheet/insight, Haiku 4.5 for palette
- Supabase (PostgreSQL + Auth + RLS) + Upstash Redis (90-day map cache)
- Vercel deployment; huma-two.vercel.app

**Product thesis:**
- Three layered frameworks: RPPL commons (collective intelligence), Capital computation (5 forms), Context model (9 dimensions)
- Regenerative life OS, not a habit tracker — operator not consumer
- Graduation-aware, not retention-maxed

**Prior work:**
- 11 sessions of ship-quality polish completed (commits e27a2cd back through b191607)
- Codebase mapped at `.planning/codebase/` (ARCHITECTURE, STACK, CONVENTIONS, CONCERNS, INTEGRATIONS, TESTING, STRUCTURE)
- Foundational docs in `/docs/` (Voice Bible, Ethical Framework, Design System, Vision, Remediation Build Plan)

**Known critiques (driving Remediation):**
- Security: /api/v2-chat and /api/sheet are currently unauthenticated (verified by grep for auth in routes). Open cost bomb.
- Regenerative math: `capital-computation.ts:76` penalizes rest via engagement multiplier — contradicts regenerative philosophy.
- Thesis visibility: promise is "see the whole" but users don't see the model being built until after onboarding.
- Funnel: no instrumentation — every optimization currently speculative.

## Constraints

- **Voice**: Voice Bible §02 banned phrases must not appear in prompts or UI. Operator-facing vocabulary (parts/shape/moves) rather than internal identifiers (dimensions/capital/patterns). Monthly voice audit.
- **Never rewrite**: Surgical edits only on files with accumulated design work — always `Edit`, never `Write`, for existing UI/prompt files.
- **Ethical framework**: No shame copy, no rush tactics, no dark patterns. Dormancy and Hard-Season must be first-class states.
- **Security/cost**: Every Anthropic-calling route must be auth-gated and quota-enforced before Phase 1 starts.
- **Supabase migrations**: Applied manually via dashboard SQL editor — code push alone does NOT apply them. Always note when a migration needs running.
- **Database schema**: localStorage keys use `huma-v2-{purpose}` convention. Pre-auth localStorage is source of truth; post-auth Supabase is source of truth with localStorage as WAL.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Magic-link for pre-auth chat gate (not preview-token JWT) | Magic-link already wired in AuthModal.tsx; saves ~2 days of infra, less surface to maintain | — Pending (lands in P0) |
| 8 GSD phases = 8 plan P-groups (Standard granularity) | Plan's P0-P7 structure is load-bearing; finer split loses the phased-gate logic | — Pending |
| Skip research agents for this milestone | Plan is pre-written; codebase is mapped; researchers would re-derive known context | ✓ Good (initial) |
| Quality model profile (Opus for roadmapper/planners) | This milestone is load-bearing for the product's thesis; cost of planning mistakes is high | — Pending |
| P0 is blocking; P1, P2, P3 can parallelize; P4-P5 sequential; P6-P7 longer-horizon | From plan's Sequencing At A Glance — matches dependency reality | — Pending |
| Don't build RPPL protocol this year | Vision doc Principle 14. Premature opening orphans what's not yet validated | — Pending (revisit P7) |

---
*Last updated: 2026-04-18 after GSD bootstrap from Remediation Build Plan*

# RPPL Port Audit — Phase 4 (typed-rppl-4-port-audit)

Date: 2026-04-16

## Scope

Audited port assignments (`inputs`/`outputs`) on all 89 agent-generated RPPL seeds:
- 39 frameworks (`app/src/data/rppl-seeds/frameworks.ts`)
- 50 principles (`app/src/data/rppl-seeds/principles.ts`)

Axioms (2) and capacities (5) were hand-authored in earlier work and left untouched.

## Systematic issues discovered

1. **Missing capital outputs on domain-specific seeds** — the most pervasive issue. The agent often produced only `state`-typed outputs (e.g. `priority_clarity`, `leverage_identification`) without grounding them in a domain-aligned `capital` output. A seed whose domain is `people` should produce `social` capital; a seed whose domain is `money` should produce `financial`; etc.
2. **Domain-output mismatch** — in a few cases, outputs were assigned a capital that didn't match the seed's primary domain (e.g. `socratic-method` outputting only `social` despite being primarily meta/growth).
3. **Single-capital overreliance on `intellectual`** — avoided introducing this anti-pattern in corrections; added `intellectual` only where the seed genuinely produces analytic/strategic knowledge, not as a default.

Only one framework (Socratic Method) had a capital that was arguably wrong; most corrections were **additive** (adding a missing domain-aligned capital) rather than **substitutive** (replacing the wrong capital).

## Frameworks corrected (9)

| Seed | Primary domain | Added outputs | Rationale |
|---|---|---|---|
| `regrarians:v1` | meta (home, money) | `material` | Scale of Permanence drives investment in foundational durable assets |
| `socratic-method:v1` | meta (growth, people) | `intellectual` (kept existing `social`) | Systematic questioning clarifies thinking, not just dialogue |
| `non-aggression:v1` | purpose | `spiritual` (kept existing `social`) | Purpose/ethics framework about self-sovereignty |
| `chaos-theory:v1` | meta (growth) | `intellectual` | Understanding leverage-point cascades is analytic capital |
| `pareto-principle:v1` | meta (money, growth) | `intellectual`, `financial` | Strategic clarity + disproportionate returns from concentration |
| `maslows-hierarchy:v1` | meta (body, people, purpose) | `intellectual` | Diagnostic framework for unmet-need identification |
| `cyclical-time:v1` | meta (joy, body, purpose) | `experiential` | Lived attunement to seasons/rhythm |
| `ecological-succession:v1` | growth (meta, money) | `intellectual` | Stage-appropriate strategy selection |
| `biomimicry:v1` | meta (home, growth) | `intellectual` | Design solutions drawn from biological R&D |

## Principles corrected (20)

Grouped by capital added:

**`intellectual`** added to meta/growth principles missing any capital:
- `patterns-at-every-scale:v1`
- `multiple-yields:v1`
- `small-patterns-compose:v1`
- `whole-context-decisions:v1`
- `diversity-resilience:v1`
- `growth-at-edges:v1`
- `leverage-points:v1`
- `signal-not-noise:v1`
- `subtract-before-add:v1`

**`living`** added to body/home principles missing the living capital:
- `rhythm-universal:v1`
- `entropy-default:v1`
- `needs-have-order:v1`
- `not-broken-mismatched:v1`

**`social`** added to people-domain principles:
- `integrate-not-segregate:v1`
- `attachment-awareness:v1`

**`financial`** added to money-domain principles:
- `energy-capture:v1`
- `pareto-few:v1`

**`material`** added to home-domain principles:
- `permanence-order:v1`

**`spiritual`** added to purpose/identity principles:
- `attention-grows:v1`
- `own-consequences:v1`
- `response-not-circumstances:v1`
- `voluntary-power:v1`
- `non-action-leverage:v1`

**`experiential`** added to joy-domain principles:
- `time-is-wheel:v1`

## Validation

- `cd app && npx tsc --noEmit` — **clean** after all edits
- All capital port keys conform to the 8-capital vocabulary (financial, material, living, social, intellectual, experiential, spiritual, cultural)
- All capacity port keys conform to the 5-capacity vocabulary (awareness, honesty, care, agency, humility)
- No duplicate output `key`s within any single seed
- Every framework retains at least one capacity input

## What was NOT changed

- Thermodynamics framework — considered renaming `energy_awareness` → `entropy_awareness` for precision. Deferred because it would force a cascade rename in the `entropy-default` principle and provides low marginal clarity.
- Epigenetics — agent suggested adding `material` alongside `living`. Rejected: epigenetics modulates biology, not material assets.
- Information-theory, quantum-principles — already had capital + state outputs in a reasonable shape; skipped.
- ~30 principles whose state-only outputs are defensible for their specific content (e.g. `map-not-territory` already has `intellectual`; principles like `rest-is-productive` already have `living`).

## Next step

Re-audit recommended after 30-60 days of real usage once `verifyLifeGraph` starts surfacing suggestions — real unsatisfied-input warnings will reveal any remaining mismatches faster than static review can.

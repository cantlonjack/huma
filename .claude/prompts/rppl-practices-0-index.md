# RPPL Practice Seeds — Continuation Index

## Context

The RPPL seed library has four tiers shipped:

- **Axioms** (2) — `app/src/data/rppl-seeds/axioms.ts`
- **Capacities** (5) — `app/src/data/rppl-seeds/capacities.ts`
- **Frameworks** (39) — `app/src/data/rppl-seeds/frameworks.ts`
- **Principles** (50) — `app/src/data/rppl-seeds/principles.ts`

The fifth tier — **Practices** — is partially shipped:

- **Body & Health** — `app/src/data/rppl-seeds/body-health.ts` (8 seeds, registered in `index.ts`, `allSeeds` contains them).

The domain prompts in this directory (`rppl-seeds-body-health.md`, etc.) still contain the original research scoping — read them for the full list of practices each domain targets and the source references.

## Status

| Domain | File | Status | Dangling rpplIds resolved |
|---|---|---|---|
| Body & Health | `body-health.ts` | **8 seeds shipped** — target 15–25 | `rppl:practice:morning-threshold:v1` ✓ |
| Money & Livelihood | `money-livelihood.ts` | not created | none pending here |
| Home & Relationships | `home-relationships.ts` | not created | none pending here |
| Growth / Purpose / Joy | `growth-purpose-joy.ts` | not created | `rppl:practice:hard-stop:v1`, `rppl:practice:essence-probe:v1` pending |
| Parenting / Digital | `parenting-digital.ts` | not created | none pending here |

**Other dangling rpplIds** in `app/src/data/archetype-templates.ts` that have no canonical home in the original 5 domain prompts:

- `rppl:design:seasonal-arc:v1`
- `rppl:design:qol-decomposition:v1`
- `rppl:design:capital-rotation:v1`
- `rppl:design:enterprise-qol-validation:v1`
- `rppl:operations:production-batching:v1`
- `rppl:operations:spatial-clustering:v1`
- `rppl:operations:weekly-pulse:v1`

These look like work/business-design practices — probably belong in Money & Livelihood or a new `design-operations.ts` file. Decide when scoping that domain.

## Shipped format — follow exactly

`body-health.ts` is the canonical example. Every practice seed must include:

- `rpplId: "rppl:practice:{slug}:v1"` — kebab-case slug
- `type: "practice"`
- `name`, `domain`, optional `domains[]`, `description` (2–4 sentences)
- `trigger` — the decision/moment that starts the chain
- `steps[]` — the golden pathway, ordered, concrete
- `timeWindow` — when to practice
- `servesPrinciples[]` — principle rpplIds this embodies (from `principles.ts`)
- `servesCapacities[]` — capacity rpplIds this cultivates (from `capacities.ts`)
- `inputs[]` / `outputs[]` — typed ports (see `types.ts:PortType`)
- `provenance` (source = "research" for expert-derived seeds, sourceTradition, keyReference)
- `evidence` — confidence + contextTags + validationNotes
- `contextTags[]`
- `contraindications[]`
- `links[]` — relationships to other seeds (derived_from, synergy, enables, contains, part_of, conflict)

When referencing principles/capacities/frameworks, check `principles.ts` / `capacities.ts` / `frameworks.ts` for exact rpplIds — don't invent.

## Continuation tracks

Each track is independent. Any can run in parallel with any other.

### Track 1 — Finish Body & Health (7–17 more seeds)

Read `.claude/prompts/rppl-seeds-body-health.md` for the target practice list. The 8 shipped seeds cover circadian anchors (morning threshold, sunrise, evening dimming), sleep protocol, nervous-system regulation (physiological sigh, nasal breathing), walking, and eating window.

**Still to add from the original prompt:**
- Strength training basics (compound movements, progressive overload)
- Cold exposure graduated (Wim Hof entry)
- Nature exposure daily (20 min in natural settings)
- Movement snacks (desk worker hourly reset)
- Wind-down routine (differentiated for chronotypes)
- Post-illness recovery protocol
- Digital sabbath / periodic screen-free periods
- Elimination protocol (food sensitivity identification)
- Budget nutrition (eating well on limited budget)
- Meal prep pattern (batch cooking)

Pick whichever you have highest-confidence research for; don't force seeds you can't substantiate.

### Track 2 — Money & Livelihood

Read `.claude/prompts/rppl-seeds-money-livelihood.md`. Create `app/src/data/rppl-seeds/money-livelihood.ts` with 15–25 practice seeds.

Decide where the `rppl:design:*` and `rppl:operations:*` rpplIds from archetype-templates belong — either fold into this file or split into `design-operations.ts`. Register in `index.ts` barrel + `allSeeds` aggregate.

### Track 3 — Home & Relationships

Read `.claude/prompts/rppl-seeds-home-relationships.md`. Create `app/src/data/rppl-seeds/home-relationships.ts` with 15–25 practice seeds. Register in `index.ts`.

### Track 4 — Growth / Purpose / Joy (resolves 2 dangling refs)

Read `.claude/prompts/rppl-seeds-growth-purpose-joy.md`. Create `app/src/data/rppl-seeds/growth-purpose-joy.ts`.

Must include:
- `rppl:practice:hard-stop:v1` — end-of-workday shutdown boundary (Builder, Creator, Entrepreneur, Official archetypes all cite it)
- `rppl:practice:essence-probe:v1` — identity/values inquiry practice

Register in `index.ts`.

### Track 5 — Parenting & Digital

Read `.claude/prompts/rppl-seeds-parenting-digital.md`. Create `app/src/data/rppl-seeds/parenting-digital.ts` with 15–25 practice seeds across parenting life stages + digital hygiene. Register in `index.ts`.

## Verification per track

After adding a domain file:

1. Update `app/src/data/rppl-seeds/index.ts` — add the export + include in `allSeeds`.
2. Run `cd app && npx tsc --noEmit` (should stay clean).
3. Run `cd app && npm test -- --run` (556 tests should still pass — they don't seed-check explicitly but any type mismatch in new seeds will fail compilation).
4. Spot-check: grep archetype-templates for any rpplIds you intended to resolve, confirm they now exist in `allSeeds`.
5. Commit per-domain: `feat: Seed {domain} practices ({N} seeds)`.

## Quality gate

A domain expert should be able to read any 3 random seeds and agree:
- The trigger is a real decision moment, not a vague gesture
- The steps are concrete enough to start today
- The contraindications are honest, not boilerplate
- The servesPrinciples links are semantically right, not generic

If you can't substantiate a practice from research or lived evidence, omit it. Fewer high-quality seeds > more generic ones.

## Suggested order

1. **Track 4** (Growth/Purpose/Joy) — resolves 2 dangling archetype refs
2. **Track 1** (finish Body & Health) — most cross-domain references will target these; foundational
3. **Track 2** (Money & Livelihood) — also resolves operations/design dangling refs if folded here
4. **Track 3** (Home & Relationships)
5. **Track 5** (Parenting & Digital)

Run each as a separate session to keep context focused on one domain's research depth.

# RPPL Seed Library — Body & Health Domain

**Prerequisite:** Run `rppl-seeds-0-foundations.md` first. That session creates the RpplSeed type, frameworks, and principles that these practices derive from.

Read the project memory files for context:
- `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\project_rppl_commons.md` — what RPPLs are
- `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\project_rppl_hierarchy.md` — the three-level hierarchy
- `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\feedback_rppl_truth_based.md` — truth-based, not institution-based

Read the existing seed infrastructure:
- `app/src/data/rppl-seeds/types.ts` — the RpplSeed interface (created by foundations prompt)
- `app/src/data/rppl-seeds/frameworks.ts` — framework rpplIds to reference
- `app/src/data/rppl-seeds/principles.ts` — principle rpplIds to reference
- `app/src/types/v2.ts` — PatternProvenance, PatternEvidence, PatternLink types

## Your Job

Create `app/src/data/rppl-seeds/body-health.ts` containing 15-25 **practice-level** RPPLs for the Body & Health domain. Every practice must:

1. Set `type: "practice"`
2. Set `servesPrinciples` to an array of principle rpplIds this practice embodies (from principles.ts)
3. Use `trigger` + `steps` (the golden pathway — specific, actionable)
4. Be specific enough someone could start today

Import the RpplSeed type from `./types` (not inline). Update the barrel export in `index.ts`.

## Critical Principles

1. **Truth-based, not institution-based.** Recommend what WORKS based on evidence and first-principles reasoning. Include unconventional approaches that have real evidence behind them. Don't default to CDC/WHO/mainstream guidelines just because they're mainstream.

2. **Multiple valid approaches.** For nutrition, include animal-based, plant-based, traditional diets — not one orthodoxy. For movement, include approaches for desk workers, athletes, elderly, disabled, parents with no time. HUMA presents options and the user's own data validates what works for THEM.

3. **Specific, not generic.** "Exercise regularly" is not a pattern. "20-minute walk within 30 minutes of waking, before checking phone" IS a pattern. Each RPPL should be specific enough that someone could start practicing it today.

4. **Honest about evidence levels.** Use the PatternConfidence type: "seed" (based on theory/expert opinion), "emerging" (some evidence), "validated" (strong evidence across contexts), "proven" (extensively validated). Don't overclaim.

5. **Context-tagged.** Tag each pattern for who it's most relevant to. A pattern that works for a 25-year-old athlete may not work for a 65-year-old with a bad knee.

## Body & Health Patterns to Cover

Research and create seeds for these areas (not exhaustive — add more if you find them):

**Sleep:**
- Circadian rhythm alignment (sunrise exposure, evening light management)
- Sleep hygiene protocol (temperature, darkness, consistency)
- Wind-down routines (varying for different chronotypes)
- Sleep recovery after disruption (jet lag, new baby, shift work)

**Nutrition:**
- Animal-based / carnivore approach (Paul Saladino, Shawn Baker — high fat, organ meats, nose-to-tail)
- Light hygiene + nutrition (Dr. Jack Kruse — "Eat Like a Great White Shark" — high DHA, cold-adapted eating)
- Traditional/ancestral eating patterns (Weston A. Price foundation principles)
- Plant-forward whole food approach (for those who thrive on it)
- Elimination protocol (identify food sensitivities)
- Budget-conscious nutrition (eating well on $50/week)
- Meal prep patterns (batch cooking for families, singles, busy professionals)

**Movement:**
- Morning movement pattern (BJ Fogg-style tiny habit → expansion)
- Desk worker movement protocol (movement snacks, hourly resets)
- Strength training basics (compound movements, progressive overload)
- Walking as primary exercise (step count is misleading — consistency matters more)
- Movement for chronic pain / limited mobility
- Cold exposure (Wim Hof method — gradual adaptation, breathwork, cold showers → cold immersion)

**Light & Circadian Biology:**
- Sunrise protocol ("Make Like the Sphinx" — see every sunrise, morning light exposure)
- Blue light management (evening amber glasses, screen filters, candlelight evenings)
- Seasonal light adjustment (light therapy in winter, natural rhythms)

**Mental Health:**
- Anxiety management through physiological sigh (Huberman protocol)
- Journaling for mental clarity (morning pages, evening download)
- Nature exposure prescription (20 min/day minimum in natural settings)
- Digital sabbath (periodic screen-free periods)

**Recovery:**
- Post-illness recovery protocol
- Grief/loss physical care (the body dimension of emotional events)
- Burnout recovery (staged re-engagement, not just rest)

## How to Research

Use web search to find the best current thinking on each area. Look for:
- Practitioners with track records (not just published papers)
- First-principles reasoning (why does this work mechanistically?)
- Real-world results across diverse populations
- Contrarian views that have evidence (don't just follow consensus)

For each pattern, cite the key source/practitioner in `provenance.keyReference` and the intellectual tradition in `provenance.sourceTradition`.

## Output

Write the file as a TypeScript module that exports an array of RpplSeed objects. Include a barrel export. The file should be well-commented explaining the domain coverage strategy.

After creating body-health.ts, also create `app/src/data/rppl-seeds/index.ts` as a barrel export that will eventually aggregate all domain files:

```typescript
export { bodyHealthSeeds } from "./body-health";
// Future:
// export { moneyLivelihoodSeeds } from "./money-livelihood";
// export { homeEnvironmentSeeds } from "./home-environment";
// ... etc
```

Run `npm run build` in `/app` to verify no type errors.

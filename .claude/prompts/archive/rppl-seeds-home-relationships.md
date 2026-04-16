# RPPL Seed Library — Home & Environment + Relationships & Community

**Prerequisite:** Run `rppl-seeds-0-foundations.md` first.

Read the project memory files:
- `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\project_rppl_commons.md`
- `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\project_rppl_hierarchy.md` — the three-level hierarchy
- `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\feedback_rppl_truth_based.md`

Read existing seeds in `app/src/data/rppl-seeds/` to match the format — especially `types.ts` for the RpplSeed interface, and `frameworks.ts` + `principles.ts` for rpplIds to reference in `servesPrinciples`.

## Your Job

Create two files with **practice-level** RPPLs. Every practice must set `type: "practice"`, include `servesPrinciples` tracing to principle rpplIds, and use `trigger` + `steps`.

1. `app/src/data/rppl-seeds/home-environment.ts` — 12-18 RPPLs
2. `app/src/data/rppl-seeds/relationships-community.ts` — 12-18 RPPLs

Update the barrel export in `app/src/data/rppl-seeds/index.ts`.

## Critical Principles

Truth-based, multiple valid approaches, specific not generic, honest about evidence levels, context-tagged. See the body-health prompt at `.claude/prompts/rppl-seeds-body-health.md` for the full RpplSeed interface and principles.

## Home & Environment Patterns to Cover

**Household Systems:**
- Weekly reset routine (one session that prevents cascading mess)
- Meal planning pattern (for singles, couples, families — different scales)
- Budget meal prep (batch cooking, freezer meals, $3-5/serving strategies)
- Cleaning systems (FlyLady zones, 15-minute daily maintenance vs. weekend marathon)
- Seasonal maintenance protocol (home, vehicle, garden — what to do when)

**Living Situations:**
- Small space optimization (apartment living, minimalism as function not aesthetic)
- Shared living patterns (roommate communication protocols, shared expense systems)
- First home management (the things nobody teaches you)
- Downsizing protocol (staged approach to reducing possessions)

**Land & Food Production (for those with land):**
- Kitchen garden establishment (Regrarians permanence scale — start with soil)
- Food forest basics (perennial food systems, minimal maintenance after establishment)
- Keyline design principles (water management for any property size)
- ISRU principles applied to home (In-Situ Resource Utilization — use what you have)
- Composting as household system (turning waste into soil fertility)

**Home Environment & Wellbeing:**
- Light environment design (morning brightness, evening dimness — supporting circadian biology at home)
- Air quality basics (ventilation, plants, filtration for different budgets)
- Noise management (for urban dwellers, shift workers, families)
- Digital environment at home (router timers, phone-free zones, creating analog spaces)

## Relationships & Community Patterns to Cover

**Intimate Relationships:**
- Weekly relationship check-in (structured conversation that prevents resentment accumulation)
- Conflict resolution protocol (Gottman-informed: repair attempts, avoiding the Four Horsemen)
- Quality time pattern (scheduled, protected, phone-free — different for parents vs. non-parents)
- Financial partnership alignment (money conversations for couples — regular, structured, non-threatening)
- Intimacy maintenance (the boring truth: it requires scheduling and intention, not spontaneity)

**Family:**
- Co-parenting communication system (when separated/divorced)
- Family meeting pattern (weekly, age-appropriate, everyone has voice)
- Elder care planning (staged conversation with aging parents — before crisis)
- Sibling relationship maintenance (adult siblings who drift)
- Multi-generational household patterns (boundaries, shared spaces, respect)

**Friendships:**
- Friendship maintenance system (the 5-friend rule — regular contact with core people)
- Making friends as an adult (it's a skill, not luck — proximity + repeated unplanned interaction)
- Long-distance friendship pattern (scheduled calls, shared activities, honest communication)
- Letting friendships evolve (recognizing when relationships need to change or end)

**Community:**
- Neighbor relationship building (the first 6 months in a new place)
- Local network development (finding your tribe — shared interests, regular gathering)
- Mentorship pattern (both finding mentors and being one)
- Community contribution (service as connection — volunteering, skill-sharing, mutual aid)
- Professional network maintenance (not LinkedIn — genuine relationship tending)

**Difficult Relationships:**
- Boundary setting protocol (specific language, specific situations, follow-through)
- Grief/loss relationship care (supporting others + receiving support)
- Loneliness intervention (the evidence-based approach — it's about belonging, not socializing)
- Toxic relationship exit planning (staged, safe, resourced)

## Research Approach

For relationships: John Gottman (couples research), Esther Perel (intimacy), Brene Brown (vulnerability/connection), Dunbar's number research (friendship capacity). For community: Robert Putnam (Bowling Alone), traditional village patterns, modern intentional community models.

For home: Regrarians (Darren Doherty), permaculture design (David Holmgren, Geoff Lawton), FlyLady (Marla Cilley), Marie Kondo (tidying as life design, not just organization).

Include unconventional but effective approaches. Tag all patterns for life context (urban/rural, single/partnered/family, income level, life stage).

## Output

Write both files, update barrel export, run `npm run build`.

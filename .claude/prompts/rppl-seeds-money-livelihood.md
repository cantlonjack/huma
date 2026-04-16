# RPPL Seed Library — Money & Livelihood Domain

**Prerequisite:** Run `rppl-seeds-0-foundations.md` first.

Read the project memory files:
- `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\project_rppl_commons.md`
- `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\project_rppl_hierarchy.md` — the three-level hierarchy
- `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\feedback_rppl_truth_based.md`

Read the existing seed infrastructure:
- `app/src/data/rppl-seeds/types.ts` — RpplSeed interface
- `app/src/data/rppl-seeds/frameworks.ts` and `principles.ts` — rpplIds to reference

## Your Job

Create `app/src/data/rppl-seeds/money-livelihood.ts` containing 15-25 **practice-level** RPPLs. Every practice must set `type: "practice"`, include `servesPrinciples` tracing to principle rpplIds, and use `trigger` + `steps`. Update barrel export.

## Critical Principles

Truth-based (not institution-based), multiple valid approaches, specific (not generic), honest about evidence, context-tagged. See body-health prompt for the full explanation.

## Money & Livelihood Patterns to Cover

**Budgeting & Cash Flow:**
- Zero-based budgeting (YNAB methodology — give every dollar a job)
- Envelope system (cash-based spending control for those who overspend digitally)
- Pay-yourself-first savings (automate before spending)
- Anti-budget approach (for high-income people who just need to track one number)
- Poverty-to-stability cash flow (when every dollar is survival — different rules apply)

**Debt:**
- Debt snowball vs. avalanche (psychological vs. mathematical optimization)
- Debt negotiation patterns (medical debt, credit card — most people don't know you can negotiate)
- Student loan strategy (income-driven repayment vs. aggressive payoff)

**Income & Career:**
- Career transition protocol (corporate→entrepreneur, military→civilian, parent re-entering workforce)
- Salary negotiation pattern (research, anchor, counteroffer framework)
- Freelance income stabilization (retainer strategy, pipeline management)
- Side income development (staged: $0→$500/month, $500→$2000, $2000→replacement income)
- Enterprise stacking (Holistic Management — multiple income streams from same resource base)

**Investing:**
- First $1000 invested (simplest possible start — index fund, automatic)
- Emergency fund staging (1 month → 3 months → 6 months, where to keep it)
- Real estate fundamentals (house hacking, first rental property decision framework)
- Generational wealth basics (trust structure awareness, not just savings)

**Financial Decision-Making:**
- Major purchase framework (rent vs. buy, new vs. used, the true cost calculation)
- Holistic Management financial testing (does this expense serve your quality of life statement?)
- Lifestyle inflation defense (automatic savings increases tied to income increases)
- Financial review rhythm (weekly 15-min review → monthly deep review → quarterly strategy)

**Regenerative Economics:**
- Permaculture economics (yields from every element, stacking functions)
- Local economy participation (buy local as financial strategy, not just ethics)
- Barter and skill-trade networks (reducing cash needs through community)

## Research Approach

Search for real practitioners and proven methods. Include:
- Dave Ramsey (debt snowball — works psychologically despite being math-suboptimal)
- YNAB (budgeting as a practice, not a spreadsheet)
- Ramit Sethi (conscious spending, automation, Big Wins)
- Holistic Management financial planning (Allan Savory)
- Permaculture economics (David Holmgren, Richard Perkins)
- Real estate: BiggerPockets fundamentals
- Career: unconventional paths (Tim Ferriss, Naval Ravikant on leverage)

For each, cite sources honestly. Tag patterns for income level (the $30K/year person needs different patterns than the $150K person).

## Output

Write `app/src/data/rppl-seeds/money-livelihood.ts` exporting `moneyLivelihoodSeeds`. Update the barrel export. Run `npm run build`.

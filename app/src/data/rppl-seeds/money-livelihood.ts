import type { RpplSeed } from "./types";

// ─── Money & Livelihood Practices ───────────────────────────────────────────
// Practice seeds covering budgeting, debt, income, investing, financial
// decision-making, and regenerative economics — plus the business-design
// and operations practices that the archetype templates already reference.
//
// This file absorbs the `rppl:design:*` and `rppl:operations:*` rpplIds
// that were dangling in archetype-templates.ts. The id namespaces stay as
// "design" and "operations" because multiple archetypes (Earth Tender,
// Creator, Entrepreneur, Economic Shaper, etc.) already bind to them —
// but every entry is still a practice (trigger + steps) of the same shape
// as body-health.ts.
//
// Conventions match body-health.ts: kebab-case slugs, practice type, typed
// ports, honest contraindications, source-tradition provenance.
// ─────────────────────────────────────────────────────────────────────────────

export const moneyLivelihoodSeeds: RpplSeed[] = [
  // ━━━ BUDGETING & CASH FLOW ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:zero-based-budgeting:v1",
    type: "practice",
    name: "Zero-Based Budget (Every Dollar a Job)",
    domain: "money",
    description:
      "At the start of each pay period, every dollar of incoming income is assigned to a specific category — spending, saving, debt, giving — until income minus assignments equals zero. Not a restriction diet; it's a planning act. The practice surfaces conflicts between how you want money to behave and how it actually behaves, before the month runs them for you. Works across income levels but is highest-leverage when money feels chaotic.",
    trigger:
      "Payday (or the first of the month). Before any non-essential spend, the allocation session happens.",
    steps: [
      "List income expected this period — conservative estimate if variable",
      "List fixed obligations first: rent/mortgage, utilities, minimums on debt, insurance",
      "Assign categories for variable spend: groceries, transport, personal, entertainment — one week's amount, not one month's abstraction",
      "Assign savings and debt-over-minimum BEFORE spending categories — not with leftovers",
      "Keep assigning until income minus total assignments = 0. The zero forces real choices",
      "Mid-period: when overspend happens, move money from another category rather than pretending it didn't",
    ],
    timeWindow: "Monthly (or per pay period), 30–60 minutes",
    servesPrinciples: [
      "rppl:principle:design-for-flow:v1",
      "rppl:principle:observation-before-intervention:v1",
      "rppl:principle:signal-not-noise:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:honesty:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      { name: "Predictable-enough income", portType: "boolean", key: "income_visibility" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
    ],
    outputs: [
      { name: "Cash-flow clarity", portType: "state", key: "cash_flow_clarity" },
      { name: "Spending alignment", portType: "state", key: "spending_alignment" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "YNAB (You Need A Budget) / envelope budgeting lineage",
      keyReference:
        "Jesse Mecham, 'You Need a Budget' (2017); YNAB's four rules; envelope budgeting as practiced since the mid-20th century",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["variable-income", "overspenders", "early-career", "couples-merging-finances"],
      validationNotes:
        "Practitioner evidence across hundreds of thousands of YNAB users is strong; controlled studies on the specific method are limited. The underlying behavioral pattern — pre-commitment and categorical budgeting — is well-supported",
    },
    contextTags: ["budgeting", "cash-flow", "foundational"],
    contraindications: [
      "Poverty-level income where every dollar is already accounted for by survival — this is not where leverage lives; triage protocol applies instead",
      "High-income people who already save plenty and find line-item budgeting demoralizing — use anti-budget instead",
    ],
    links: [
      { rpplId: "rppl:practice:pay-yourself-first:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:conscious-spending-plan:v1", relationship: "synergy" },
      { rpplId: "rppl:operations:weekly-pulse:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:pay-yourself-first:v1",
    type: "practice",
    name: "Pay Yourself First (Automate Savings)",
    domain: "money",
    description:
      "Savings and investing contributions are automated to transfer out of the checking account the same day income arrives — before any spending decision is made. The psychology is simple: willpower is finite, and 'save what's left' reliably produces zero left. Automating the transfer once turns saving into a background process instead of a daily decision. This is the highest-leverage single financial behavior for most people.",
    trigger:
      "The arrival of a regular paycheck triggers an automated transfer — not a human decision each time.",
    steps: [
      "Pick a savings/investing percentage you can sustain — start at 5–10% if new, 15%+ if able",
      "Open a separate high-yield savings or brokerage account at a different institution from your checking — friction matters",
      "Set up a standing transfer for the day after payday (or same-day if reliable)",
      "Raise the percentage by 1% every 3–6 months, or every time income rises, until the target rate is hit",
      "Review the automation quarterly — don't babysit it; let it run",
    ],
    timeWindow: "Set once, review quarterly",
    servesPrinciples: [
      "rppl:principle:design-for-flow:v1",
      "rppl:principle:design-for-bias:v1",
      "rppl:principle:permanence-order:v1",
    ],
    servesCapacities: ["rppl:capacity:agency:v1"],
    inputs: [
      { name: "Bank account access", portType: "boolean", key: "bank_account" },
      { name: "Regular income", portType: "boolean", key: "regular_income" },
    ],
    outputs: [
      { name: "Savings rate", portType: "state", key: "savings_rate" },
      { name: "Financial runway", portType: "state", key: "financial_runway" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Behavioral finance / personal finance classics",
      keyReference:
        "George Clason, 'The Richest Man in Babylon' (1926) — original 'pay yourself first' framing; Richard Thaler on default options; Ramit Sethi, 'I Will Teach You to Be Rich' (2019) on automation",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["adults", "salaried", "freelancers-with-smoothing", "any-income-above-survival"],
      validationNotes:
        "Default-option research and 401(k) auto-enrollment data show large, durable effects of automation on savings behavior",
    },
    contextTags: ["savings", "automation", "foundational"],
    contraindications: [
      "True survival-level income where no margin exists — build minimum runway first, then automate",
      "Highly irregular income without smoothing — use a two-account system (landing → smoothed draw) before automating percentages",
    ],
    links: [
      { rpplId: "rppl:practice:zero-based-budgeting:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:emergency-fund-staging:v1", relationship: "enables" },
      { rpplId: "rppl:practice:first-thousand-invested:v1", relationship: "enables" },
      { rpplId: "rppl:practice:lifestyle-inflation-defense:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:anti-budget:v1",
    type: "practice",
    name: "Anti-Budget (One-Number Tracking)",
    domain: "money",
    description:
      "For people whose income comfortably exceeds their spending, a line-item budget is cognitive overhead that delivers no behavior change. The anti-budget inverts it: automate savings/investing off the top, automate fixed bills, and leave the rest alone — spend the remainder guilt-free. The only metric tracked is savings rate. This only works when the constraint is NOT spending discipline; it's a freedom practice for people who earned past the budgeting stage.",
    trigger:
      "Each paycheck, automation handles the savings and bills; no in-month tracking is required as long as the end balance stays positive.",
    steps: [
      "Compute target savings rate (pay-yourself-first) and automate it off the top",
      "Automate every fixed bill — rent, utilities, subscriptions, insurance",
      "Everything left in checking is free to spend — no category policing",
      "Monthly: look at one number — 'did I hit the savings rate?' If yes, done. If no, raise automation",
      "Quarterly: scan for drift — has the 'free' portion been going to things you actually care about, or vaporizing?",
    ],
    timeWindow: "Automated monthly; 5-minute monthly check",
    servesPrinciples: [
      "rppl:principle:signal-not-noise:v1",
      "rppl:principle:subtract-before-add:v1",
      "rppl:principle:design-for-bias:v1",
    ],
    servesCapacities: ["rppl:capacity:agency:v1"],
    inputs: [
      { name: "Income comfortably above spending", portType: "boolean", key: "income_surplus" },
      { name: "Automation in place", portType: "boolean", key: "automation_setup" },
    ],
    outputs: [
      { name: "Savings rate", portType: "state", key: "savings_rate" },
      { name: "Decision load", portType: "state", key: "decision_load" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Personal-finance practitioner lineage",
      keyReference:
        "Paula Pant, 'Afford Anything' podcast — anti-budget framing; Ramit Sethi on conscious spending for high earners; Mr. Money Mustache on savings-rate as the one number",
    },
    evidence: {
      confidence: "seed",
      contextTags: ["high-income", "single-income-high-earners", "couples-aligned-on-spending"],
    },
    contextTags: ["budgeting", "high-income", "minimalist"],
    contraindications: [
      "Any context where spending is outrunning income — go to zero-based budgeting first",
      "Impulse-spending patterns that savings automation alone can't solve — the line-item discipline is doing the work",
    ],
    links: [
      { rpplId: "rppl:practice:pay-yourself-first:v1", relationship: "derived_from" },
      { rpplId: "rppl:practice:conscious-spending-plan:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:conscious-spending-plan:v1",
    type: "practice",
    name: "Conscious Spending Plan",
    domain: "money",
    description:
      "Not a budget; a declaration. Four buckets: fixed costs (50–60%), investments (10%+), savings (5–10%), and guilt-free spending (the rest). The guilt-free spending is the point — explicit permission to spend extravagantly on the things you love after the first three buckets are funded. Works because it reframes money from denial to deliberate joy. Most 'budgeting failures' are failures to build pleasure into the system.",
    trigger:
      "Monthly, when income lands. Also triggered any time a purchase feels guilty — check which bucket it's from.",
    steps: [
      "Calculate fixed costs as % of take-home — aim to keep under 60%",
      "Automate investments (retirement + taxable) at 10%+ of income",
      "Automate savings for short-term goals (emergency, travel, purchases) at 5–10%",
      "The remainder is guilt-free — declare 2–3 things you spend extravagantly on (e.g. books, travel, food) and cut ruthlessly on the rest",
      "When buying something in a 'love' category: do it without guilt. Out of category: let friction catch it (the 30-day rule for anything $100+)",
    ],
    timeWindow: "Monthly setup; ongoing application",
    servesPrinciples: [
      "rppl:principle:signal-not-noise:v1",
      "rppl:principle:design-for-flow:v1",
      "rppl:principle:voluntary-power:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:honesty:v1",
    ],
    inputs: [
      { name: "Income above basic fixed costs", portType: "boolean", key: "income_above_fixed" },
      { name: "Awareness", portType: "capacity", key: "awareness" },
    ],
    outputs: [
      { name: "Spending alignment", portType: "state", key: "spending_alignment" },
      { name: "Money-mood relationship", portType: "state", key: "money_mood" },
      { name: "Financial capital", portType: "capital", key: "financial" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Conscious-spending / personal-finance practitioner",
      keyReference:
        "Ramit Sethi, 'I Will Teach You to Be Rich' (2009, revised 2019); IWT podcast and coaching practice",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "mid-career", "money-emotional", "couples"],
    },
    contextTags: ["spending", "values-aligned"],
    contraindications: [
      "Income at or below fixed costs — this isn't where leverage is; triage first",
      "Active compulsive spending / gambling — behavioral intervention required, not plan redesign",
    ],
    links: [
      { rpplId: "rppl:practice:anti-budget:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:pay-yourself-first:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:major-purchase-framework:v1", relationship: "synergy" },
    ],
  },

  // ━━━ DEBT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:debt-reduction-ladder:v1",
    type: "practice",
    name: "Debt Reduction Ladder (Snowball or Avalanche)",
    domain: "money",
    description:
      "One debt at a time, one extra payment at a time, in an order chosen deliberately. Snowball (smallest balance first) wins on psychology — early wins build momentum. Avalanche (highest interest first) wins on math — minimum total interest paid. Research is mixed on which finishes more often; the practice that matters is picking ONE and automating the extra payment. Indecision costs more than the wrong choice.",
    trigger:
      "The moment you list every debt in one place. From there, the ladder runs on automation until one debt is gone, then the freed payment rolls to the next.",
    steps: [
      "List every debt: balance, minimum payment, interest rate, term",
      "Decide method: smallest balance first (snowball) if motivation is fragile; highest interest first (avalanche) if math-first and patient",
      "Pay minimums on everything; apply ALL extra cash to the target debt",
      "When the target debt dies: roll its former payment onto the next debt's minimum — this is where 'snowball' gets its name",
      "Don't pause to celebrate with a new debt — celebrate with a small reward, then redirect the flow",
      "Once debts are cleared: redirect the full payment flow into pay-yourself-first savings",
    ],
    timeWindow: "Monthly autopayments; quarterly review",
    servesPrinciples: [
      "rppl:principle:small-patterns-compose:v1",
      "rppl:principle:leverage-points:v1",
      "rppl:principle:design-for-bias:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Debt inventory", portType: "boolean", key: "debt_inventory_exists" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Debt load", portType: "state", key: "debt_load" },
      { name: "Interest burden", portType: "state", key: "interest_burden" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Consumer finance / behavioral economics",
      keyReference:
        "Dave Ramsey, 'The Total Money Makeover' (2003) — debt snowball; Gal et al. 2011 (Journal of Consumer Research) — empirical support for small-victories order on completion rates; avalanche is standard math-optimal framing",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["anyone-with-debt", "consumer-debt", "student-loans-domestic"],
      validationNotes:
        "Either method produces results when actually followed; the consistent finding is that picking AND automating matters more than which you pick",
    },
    contextTags: ["debt", "foundational"],
    contraindications: [
      "Pre-decision paralysis with zero action — if choosing is the blocker, default to snowball and move",
      "High-interest predatory debt (payday loans 300%+ APR) — sometimes debt negotiation or consolidation is a better first step",
      "Federal student loans with IDR/forgiveness paths — aggressive payoff can be the wrong math; use the student-loan-strategy pattern instead",
    ],
    links: [
      { rpplId: "rppl:practice:debt-negotiation:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:pay-yourself-first:v1", relationship: "enables" },
    ],
  },

  {
    rpplId: "rppl:practice:debt-negotiation:v1",
    type: "practice",
    name: "Debt Negotiation Pattern",
    domain: "money",
    description:
      "Most people don't know that medical debt, credit card debt, and some collections are negotiable — often to 20–50% of the original balance, especially once they've aged or been sold to a collections agency. The practice is a scripted phone call, not a confrontation. Works best on older debts, medical bills before they hit collections, and credit cards where you can offer a lump sum.",
    trigger:
      "A medical bill above a few hundred dollars, a credit card stuck at high balance with a possible lump sum available, or a collections agency making contact.",
    steps: [
      "For medical: before paying, call the billing office and ask for the cash-pay or hardship discount — often 30–50% off if you can pay now",
      "For aged credit-card debt: wait until it's delinquent enough that the bank may settle; offer 30–50% of the balance as a lump sum in exchange for written 'paid in full' settlement",
      "Always get the agreement in writing BEFORE paying — a verbal promise is not enforceable",
      "Know the statute of limitations in your state for debt; never 'restart' the clock by making a partial payment on timebarred debt without advice",
      "Understand the tax consequence: forgiven debt over $600 is usually reported as income (1099-C) — plan for it",
    ],
    timeWindow: "One-off per debt, 1–3 calls",
    servesPrinciples: [
      "rppl:principle:evidence-not-authority:v1",
      "rppl:principle:voluntary-power:v1",
      "rppl:principle:test-inherited-beliefs:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Debt exists and is negotiable-type", portType: "boolean", key: "negotiable_debt" },
      { name: "Lump sum available (for settlements)", portType: "boolean", key: "lump_sum_available" },
    ],
    outputs: [
      { name: "Debt load", portType: "state", key: "debt_load" },
      { name: "Credit implications", portType: "state", key: "credit_implications" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Consumer advocacy / credit counseling",
      keyReference:
        "NerdWallet and Consumer Reports guides on medical-debt negotiation; Gerri Detweiler on credit-card settlement; National Foundation for Credit Counseling (NFCC) practice guides",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["medical-debt", "credit-card-debt", "collections"],
      validationNotes:
        "Widely-practiced and documented in consumer-finance advisory; effectiveness depends heavily on debt age, type, and creditor posture",
    },
    contextTags: ["debt", "negotiation"],
    contraindications: [
      "Secured debt (mortgage, auto) — different protocol; negotiation rarely works the same way",
      "Federal student loans — do NOT default-negotiate; use IDR, rehabilitation, or PSLF",
      "If the stress of negotiation calls is destabilizing: consider nonprofit credit counseling (NFCC) instead of DIY",
    ],
    links: [
      { rpplId: "rppl:practice:debt-reduction-ladder:v1", relationship: "synergy" },
    ],
  },

  // ━━━ INCOME & CAREER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:salary-negotiation:v1",
    type: "practice",
    name: "Salary Negotiation Pattern",
    domain: "money",
    domains: ["growth"],
    description:
      "Offers are almost always negotiable, and the conversation is a one-time trade whose effects compound for decades — a 10% higher starting salary becomes ~$500K+ over a career due to percentage-based raises. The practice is a four-step framework: research, anchor, counter, defend. The single most expensive mistake is accepting the first number without a counter.",
    trigger:
      "A verbal or written offer has been extended. Before signing, the negotiation window opens — typically 24–72 hours.",
    steps: [
      "Research ranges: Levels.fyi, Glassdoor, Blind, peer conversations — triangulate to a credible band",
      "Anchor: ask for compensation at the top of your credible band, not the middle — they'll negotiate down, not up",
      "Wait for them to make the first number if possible: 'I'm looking for a fair offer based on the role and my experience'",
      "Counter with a specific number + rationale tied to role/impact/market — not to need or other offers unless real",
      "Negotiate non-salary levers too: sign-on, equity, PTO, remote days, start date, title — these often have more flex than base",
      "Get the final offer in writing before resigning current role",
    ],
    timeWindow: "24–72 hours once offered",
    servesPrinciples: [
      "rppl:principle:money-follows-value:v1",
      "rppl:principle:voluntary-power:v1",
      "rppl:principle:leverage-points:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Active offer", portType: "boolean", key: "offer_in_hand" },
      { name: "Market comp data", portType: "resource", key: "comp_research" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Compensation", portType: "state", key: "compensation" },
      { name: "Career leverage", portType: "state", key: "career_leverage" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Negotiation research / compensation consulting",
      keyReference:
        "Deepak Malhotra, 'Negotiating the Impossible' (2016); Linda Babcock & Sara Laschever, 'Women Don't Ask' (2003) on negotiation gap; Haseeb Qureshi, 'Ten Rules for Negotiating a Job Offer' (2016)",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["salaried-workers", "tech", "knowledge-workers", "underrepresented-in-negotiation"],
      validationNotes:
        "Negotiation-gap research (Babcock et al.) shows large, persistent effects of not negotiating, especially compounded over career trajectory",
    },
    contextTags: ["career", "income", "one-off-compounding"],
    contraindications: [
      "Union / government / step-based scales where base comp is fixed — negotiate start step or non-salary levers instead",
      "Roles where the employer has no counter-move (take-it-or-leave-it) — read the signals, don't damage the relationship",
    ],
    links: [
      { rpplId: "rppl:practice:career-transition-runway:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:lifestyle-inflation-defense:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:career-transition-runway:v1",
    type: "practice",
    name: "Career Transition Runway",
    domain: "money",
    domains: ["purpose", "growth"],
    description:
      "The jump from one livelihood mode to another (corporate→entrepreneur, military→civilian, parent→back-to-work, employee→freelance) fails most often when financial runway is missing, not when the idea is wrong. This practice builds the runway BEFORE the jump so the transition has oxygen. A 6–12 month runway changes decisions: you can say no to the wrong first gig, negotiate harder, and survive the trough between old income and new.",
    trigger:
      "You've named an upcoming transition — even loosely. Runway-building starts months before the jump date, not the week of.",
    steps: [
      "Name the transition and a rough target month — writing it down changes the planning horizon",
      "Calculate bare minimum monthly burn (housing, food, utilities, insurance, minimum debt) — the floor you can't go below",
      "Target a runway of (bare minimum burn × 6–12 months) in accessible savings before the jump",
      "Identify health insurance path (COBRA, spouse's plan, ACA marketplace, TRICARE continuation) — often the largest hidden cost",
      "Name the first 2–3 likely income sources post-jump — clients, gigs, roles — and do 1 outreach conversation per week pre-jump",
      "Practice the transition in low-risk mode: one week of living on post-jump income, one month of the new work cadence as a side project",
    ],
    timeWindow: "6–18 months pre-jump",
    servesPrinciples: [
      "rppl:principle:whole-context-decisions:v1",
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:observation-before-intervention:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:humility:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Transition horizon named", portType: "boolean", key: "transition_named" },
      { name: "Savings capacity", portType: "resource", key: "savings_capacity" },
    ],
    outputs: [
      { name: "Financial runway", portType: "state", key: "financial_runway" },
      { name: "Transition viability", portType: "state", key: "transition_viability" },
      { name: "Financial capital", portType: "capital", key: "financial" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Career-transition / FI-RE / veteran-transition programs",
      keyReference:
        "Herminia Ibarra, 'Working Identity' (2004); Tim Ferriss, 'The 4-Hour Workweek' (2007) on mini-retirements and runway; SkillBridge and similar mil-to-civ frameworks",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["mid-career-changers", "veterans", "parents-re-entering", "aspiring-entrepreneurs"],
    },
    contextTags: ["career", "transition", "runway"],
    contraindications: [
      "Forced transitions (layoff, illness) — compress this into a 30-day emergency protocol instead",
      "Transitions with a confirmed income on the other side (new job already signed) — runway needs are smaller",
    ],
    links: [
      { rpplId: "rppl:practice:emergency-fund-staging:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:side-income-stages:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:essence-probe:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:side-income-stages:v1",
    type: "practice",
    name: "Side Income Staged Development",
    domain: "money",
    domains: ["growth", "purpose"],
    description:
      "Side income grows in distinct stages, each requiring a different orientation. $0→$500/month is the hardest — it's the 'does this work at all?' phase. $500→$2000 is systems-building. $2000→replacement income is leverage and specialization. Skipping stages (quitting a day job at $500/month) is the most common failure. Naming the stage you're in clarifies which problem you're actually solving.",
    trigger:
      "A weekly block (often weekends or evenings) dedicated to side-income work — scope and activity change as the stage does.",
    steps: [
      "Stage 1 ($0→$500): one offer, one channel, ship to 10 real humans. The goal is proof, not scale",
      "Stage 2 ($500→$2000): build a repeatable system — consistent marketing cadence, simple pricing, light operations",
      "Stage 3 ($2000→replacement): specialize, raise prices, build leverage (products, team, retainers) — and plan the day-job exit deliberately",
      "Track one metric per stage only: Stage 1 = conversations/week; Stage 2 = recurring clients; Stage 3 = monthly net",
      "Do NOT jump stages by wishful thinking — the work of the next stage doesn't reward effort in the previous stage's pattern",
    ],
    timeWindow: "Each stage typically 3–18 months",
    servesPrinciples: [
      "rppl:principle:small-patterns-compose:v1",
      "rppl:principle:money-follows-value:v1",
      "rppl:principle:growth-at-edges:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:humility:v1",
      "rppl:capacity:honesty:v1",
    ],
    inputs: [
      { name: "Weekly side-work hours", portType: "resource", key: "side_work_hours" },
      { name: "Skill that has market value", portType: "boolean", key: "marketable_skill" },
    ],
    outputs: [
      { name: "Income diversification", portType: "state", key: "income_diversification" },
      { name: "Stage progression", portType: "state", key: "side_income_stage" },
      { name: "Financial capital", portType: "capital", key: "financial" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Solopreneur / indie-business literature",
      keyReference:
        "Chris Guillebeau, 'Side Hustle' (2017); Paul Jarvis, 'Company of One' (2019); Justin Welsh's solopreneur operating system",
    },
    evidence: {
      confidence: "seed",
      contextTags: ["employed-with-skills", "freelancers", "career-pivoters"],
      validationNotes:
        "Practitioner evidence is strong; lacks controlled studies. The stage-distinction is validated by pattern-matching across many solopreneur case studies",
    },
    contextTags: ["income", "entrepreneurship", "staged"],
    contraindications: [
      "Already at capacity in day job + family — side work requires margin or it damages the core system",
      "Non-compete clauses or conflict-of-interest constraints — verify before building",
    ],
    links: [
      { rpplId: "rppl:practice:career-transition-runway:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:enterprise-stacking:v1", relationship: "synergy" },
      { rpplId: "rppl:design:enterprise-qol-validation:v1", relationship: "synergy" },
    ],
  },

  // ━━━ INVESTING & RESERVES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:first-thousand-invested:v1",
    type: "practice",
    name: "First $1000 Invested (Simplest Start)",
    domain: "money",
    description:
      "For most people, the first dollar invested is delayed by the search for the 'right' strategy. This practice removes the optimization problem: open a brokerage account, buy a total-market index fund, automate monthly contributions. That's it. Optimization can come later once the habit of investing exists — and by then the habit is what matters, not the fund choice.",
    trigger:
      "You have $1000+ in savings above your starter emergency fund and have never invested before. The account-opening session begins now.",
    steps: [
      "Open a brokerage account (Fidelity, Schwab, Vanguard) — not a bank brokerage; go direct",
      "Fund with $1000+ via bank transfer",
      "Buy a single total-market index fund (e.g. VTSAX/VTI, FZROX, SWTSX) — no stock picking, no crypto, no 'what's hot'",
      "Set up automatic monthly contribution — even $50/month starts the habit",
      "Don't check the balance obsessively; quarterly is enough for the first 2 years",
    ],
    timeWindow: "One session to set up; automated thereafter",
    servesPrinciples: [
      "rppl:principle:subtract-before-add:v1",
      "rppl:principle:design-for-flow:v1",
      "rppl:principle:small-patterns-compose:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Investable $1000+", portType: "boolean", key: "investable_thousand" },
      { name: "Emergency fund present", portType: "boolean", key: "emergency_fund_present" },
    ],
    outputs: [
      { name: "Invested position", portType: "state", key: "invested_position" },
      { name: "Compounding exposure", portType: "state", key: "compounding_exposure" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Bogleheads / passive indexing",
      keyReference:
        "John Bogle, 'The Little Book of Common Sense Investing' (2017); Bogleheads three-fund portfolio; decades of research on passive vs active (e.g. SPIVA reports)",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["first-time-investors", "young-adults", "late-starters"],
      validationNotes:
        "Long-horizon superiority of low-cost total-market indexing over active management is among the most replicated findings in finance (SPIVA, Morningstar, academic literature)",
    },
    contextTags: ["investing", "foundational"],
    contraindications: [
      "No emergency fund yet — build that first; investing with no buffer forces selling at the worst moment",
      "High-interest debt (>7–8% APR) — usually pays better to crush the debt first",
      "Tax-advantaged space unused — maximize 401(k) match and IRA first if available",
    ],
    links: [
      { rpplId: "rppl:practice:emergency-fund-staging:v1", relationship: "part_of" },
      { rpplId: "rppl:practice:pay-yourself-first:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:emergency-fund-staging:v1",
    type: "practice",
    name: "Emergency Fund Staging",
    domain: "money",
    description:
      "A cash reserve is the single most underrated financial asset because it quietly prevents every other plan from collapsing. Staged rather than monolithic: $1000 starter (breaks the 'new-debt-for-every-small-crisis' cycle) → 1 month expenses → 3 months → 6 months. Where you keep it matters as much as how much: high-yield savings for 1 month; short-term Treasuries or HYSA beyond that; never in brokerage.",
    trigger:
      "You have positive cash flow (after fixed costs and minimum debt payments). The first $1000 target starts the ladder.",
    steps: [
      "Open a high-yield savings account at an online bank (separate from daily checking — friction is a feature)",
      "Stage 1: $1000 starter — accumulate as fast as possible, typically via one month of aggressive cutback",
      "Stage 2: 1 month of bare-minimum expenses — reach before investing beyond employer 401(k) match",
      "Stage 3: 3 months of bare-minimum expenses — appropriate for dual-income stable households",
      "Stage 4: 6 months — appropriate for single-income, self-employed, or high-responsibility roles",
      "Once the target is reached: STOP growing it (cash drags returns) and redirect the flow into investing",
    ],
    timeWindow: "Months to years depending on income; review annually",
    servesPrinciples: [
      "rppl:principle:permanence-order:v1",
      "rppl:principle:design-for-flow:v1",
      "rppl:principle:rest-is-productive:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Positive cash flow", portType: "boolean", key: "positive_cash_flow" },
      { name: "High-yield savings access", portType: "boolean", key: "hysa_access" },
    ],
    outputs: [
      { name: "Cash reserve", portType: "state", key: "cash_reserve" },
      { name: "Financial runway", portType: "state", key: "financial_runway" },
      { name: "Risk tolerance", portType: "state", key: "risk_tolerance" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Personal-finance canon",
      keyReference:
        "Dave Ramsey 'Baby Steps' 1 and 3; JL Collins, 'The Simple Path to Wealth' (2016); Federal Reserve 'Economic Well-Being of U.S. Households' reports on $400-emergency vulnerability",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["all-income-levels", "employed", "self-employed", "parents"],
      validationNotes:
        "The household vulnerability data (~40% of US adults can't cover a $400 unexpected expense, Fed SHED) gives stark confirmation of the reserve's protective role",
    },
    contextTags: ["savings", "foundational", "risk-management"],
    contraindications: [
      "Very high-interest debt — the math sometimes favors a smaller starter ($500–1000) while attacking debt first",
      "Unstable housing / acute crisis — reserve priorities change; focus on immediate stability",
    ],
    links: [
      { rpplId: "rppl:practice:pay-yourself-first:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:first-thousand-invested:v1", relationship: "enables" },
      { rpplId: "rppl:practice:career-transition-runway:v1", relationship: "enables" },
    ],
  },

  // ━━━ FINANCIAL DECISION-MAKING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:major-purchase-framework:v1",
    type: "practice",
    name: "Major Purchase Framework (True Cost)",
    domain: "money",
    domains: ["home"],
    description:
      "The sticker price is never the true cost. A car's sticker omits insurance, fuel, maintenance, depreciation, opportunity cost of the cash. A house's sticker omits property tax, maintenance (~1% of value/year), insurance, and the freedom cost of being rooted. This framework runs any purchase over ~1 month's income through a standard set of questions before deciding.",
    trigger:
      "A purchase over ~1 month of take-home pay is being considered. Before the transaction happens, the framework runs.",
    steps: [
      "Compute true cost: sticker + financing interest + ongoing cost (insurance, tax, fuel, maintenance) × ownership horizon + depreciation",
      "Compute opportunity cost: the same cash invested at 7% real over ownership horizon",
      "Compute rental / used / smaller-scale alternatives for comparison — the anchor breaks",
      "Apply the 30-day rule: for non-urgent purchases, delay 30 days and re-ask 'do I still want this?'",
      "Test against your Quality of Life statement: does this support the life you're building, or substitute for it?",
      "If the answer is yes, buy without guilt; if no, let it go without grief",
    ],
    timeWindow: "30 days for non-urgent major purchases",
    servesPrinciples: [
      "rppl:principle:whole-context-decisions:v1",
      "rppl:principle:evidence-not-authority:v1",
      "rppl:principle:cause-and-effect:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:honesty:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Purchase under consideration", portType: "boolean", key: "major_purchase_pending" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
    ],
    outputs: [
      { name: "Decision quality", portType: "state", key: "decision_quality" },
      { name: "True-cost awareness", portType: "state", key: "true_cost_awareness" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Holistic Management financial testing / personal finance",
      keyReference:
        "Allan Savory, 'Holistic Management' (1999) on marginal-reaction and cause-and-effect testing; Vicki Robin, 'Your Money or Your Life' (1992) on life-energy cost of purchases",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "pre-major-purchase", "couples-disagreeing-on-spending"],
    },
    contextTags: ["decision", "purchase", "values-aligned"],
    contraindications: [
      "Emergency purchases — don't over-deliberate a broken furnace in January",
      "Decision fatigue: if every minor purchase runs the full framework, the framework breaks. Gate it by size",
    ],
    links: [
      { rpplId: "rppl:design:enterprise-qol-validation:v1", relationship: "derived_from" },
      { rpplId: "rppl:practice:conscious-spending-plan:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:holistic-management:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:lifestyle-inflation-defense:v1",
    type: "practice",
    name: "Lifestyle Inflation Defense",
    domain: "money",
    description:
      "Every income raise tends to be absorbed by proportional lifestyle expansion — a bigger apartment, newer car, more subscriptions — leaving the savings rate unchanged. The practice: at every raise or windfall, default the majority of the increase into automated savings/investing BEFORE the lifestyle catches up to notice. Protects the single largest wealth-building lever in a career: the raise trajectory.",
    trigger:
      "Any income event that's materially larger than recent baseline — a raise, a bonus, a new contract, a tax refund, an inheritance.",
    steps: [
      "Before the higher income hits checking, predefine the split: e.g. 50% to savings/investing, 30% to lifestyle, 20% to one-time celebration",
      "Raise the automated savings/investing percentage to capture the split — same day as the income change takes effect",
      "Name the ONE lifestyle upgrade that would actually matter (not five small ones) — direct the lifestyle share there",
      "Review after 3 months: has the lifestyle inflation crept in via unnoticed subscription/dining/other drift?",
      "When income rises but no savings-rate change is made: that's the failure mode — catch it at the quarterly review",
    ],
    timeWindow: "Each income-increase event; quarterly review",
    servesPrinciples: [
      "rppl:principle:design-for-bias:v1",
      "rppl:principle:subtract-before-add:v1",
      "rppl:principle:voluntary-power:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:honesty:v1",
    ],
    inputs: [
      { name: "Income increase event", portType: "boolean", key: "income_increase" },
      { name: "Automation in place", portType: "boolean", key: "automation_setup" },
    ],
    outputs: [
      { name: "Savings rate trajectory", portType: "state", key: "savings_rate_trajectory" },
      { name: "Freedom compounding", portType: "state", key: "freedom_compounding" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "FI-RE movement / behavioral economics",
      keyReference:
        "Mr. Money Mustache on savings-rate as the single most important number; Ramit Sethi on 'big wins'; Daniel Kahneman on hedonic adaptation",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["mid-career", "upwardly-mobile", "recent-raise", "windfall-recipients"],
      validationNotes:
        "Hedonic adaptation research (Brickman, Kahneman) shows lifestyle increases produce diminishing happiness returns — the wealth-building cost of absorbed raises is mathematically severe over decades",
    },
    contextTags: ["wealth-building", "career-arc"],
    contraindications: [
      "Income rising from a genuine poverty baseline — some lifestyle expansion IS the point; don't guilt-trip the first upgrades",
      "Couples where one partner absorbs all the discipline — negotiate together before automating the split",
    ],
    links: [
      { rpplId: "rppl:practice:pay-yourself-first:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:salary-negotiation:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:anti-budget:v1", relationship: "synergy" },
    ],
  },

  // ━━━ REGENERATIVE ECONOMICS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:enterprise-stacking:v1",
    type: "practice",
    name: "Enterprise Stacking (Multiple Yields)",
    domain: "money",
    domains: ["purpose", "home"],
    description:
      "From Holistic Management and permaculture economics: design livelihood so a single resource base produces multiple yields. A homestead that sells eggs, teaches workshops, rents its barn, and hosts a newsletter has four revenue streams off one physical and attentional base. A consultant who also writes, teaches, and licenses templates does the same on intellectual ground. The point is not hustle — it's that a single enterprise is fragile, and intelligently stacked ones are not.",
    trigger:
      "A quarterly planning session. With the current base (land, skills, audience, equipment) visible, the question is: what yields are latent here that aren't being harvested?",
    steps: [
      "List your current resource base: physical assets, skills, audience, time, relationships, place",
      "For each base, ask: how many yields could this produce? (An orchard yields fruit, shade, teaching, hospitality, soil cover)",
      "Filter yields by: (a) does it share the same attentional rhythm as existing work? (b) does it conflict with another yield?",
      "Pick ONE new yield per quarter to test — do not stack all at once",
      "After a season, evaluate: kept, killed, or doubled-down. Low-yielders subtract; don't keep running empty streams out of sentiment",
    ],
    timeWindow: "Quarterly planning; seasonal review",
    servesPrinciples: [
      "rppl:principle:multiple-yields:v1",
      "rppl:principle:integrate-not-segregate:v1",
      "rppl:principle:diversity-resilience:v1",
      "rppl:principle:energy-capture:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:care:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      { name: "Stable primary enterprise", portType: "boolean", key: "primary_enterprise" },
      { name: "Resource-base inventory", portType: "resource", key: "resource_inventory" },
    ],
    outputs: [
      { name: "Income diversification", portType: "state", key: "income_diversification" },
      { name: "Enterprise resilience", portType: "state", key: "enterprise_resilience" },
      { name: "Financial capital", portType: "capital", key: "financial" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Holistic Management / permaculture economics / regrarian design",
      keyReference:
        "Allan Savory, 'Holistic Management' (1999); David Holmgren, 'Permaculture Principles and Pathways' (2002) — principle 3 'obtain a yield' and principle 5 'multiple yields'; Richard Perkins, 'Regenerative Agriculture' (2019)",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["homesteaders", "solopreneurs", "creators", "farmers"],
      validationNotes:
        "Strong field-validated practitioner evidence; controlled study evidence is thin because enterprise stacking is context-specific",
    },
    contextTags: ["income", "regenerative", "design"],
    contraindications: [
      "Stage 1 side-income builders — add stacking AFTER one enterprise works, not as a substitute for one that works",
      "Overextension risk: stacking too many yields destroys attention; the stacks must share a rhythm",
    ],
    links: [
      { rpplId: "rppl:framework:holistic-management:v1", relationship: "derived_from" },
      { rpplId: "rppl:framework:permaculture:v1", relationship: "derived_from" },
      { rpplId: "rppl:practice:side-income-stages:v1", relationship: "synergy" },
      { rpplId: "rppl:design:capital-rotation:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:local-economy-participation:v1",
    type: "practice",
    name: "Local Economy Participation",
    domain: "money",
    domains: ["home", "people"],
    description:
      "Buying locally is usually framed as ethical; it's also a financial strategy. Money that cycles within a local economy returns to you through higher wages, stronger neighbors, lower dependency on fragile supply chains, and increased asset appreciation of place. Farmer's markets, local contractors, independent retailers, and community-held businesses compound differently than global chain spend. This isn't about purism — it's about directing a meaningful share of discretionary spend toward local multipliers.",
    trigger:
      "Each spending category review (quarterly). Which categories have a viable local alternative? Shift one at a time.",
    steps: [
      "Map discretionary spend by category — food, services, gifts, home goods, entertainment",
      "For each category, identify the highest-leverage local substitution (e.g. CSA for groceries, local CPA for taxes)",
      "Commit to one category shift per quarter — avoid trying to localize everything at once",
      "Build relationships, not just transactions — the relational return is the financial return in year 3+",
      "Track the shift honestly — sometimes 'local' costs more up-front; be clear about what you're buying (multiplier, relationship, resilience)",
    ],
    timeWindow: "Quarterly review; ongoing shifts",
    servesPrinciples: [
      "rppl:principle:home-first-ecosystem:v1",
      "rppl:principle:integrate-not-segregate:v1",
      "rppl:principle:diversity-resilience:v1",
    ],
    servesCapacities: [
      "rppl:capacity:care:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Local ecosystem exists", portType: "boolean", key: "local_ecosystem" },
      { name: "Discretionary spend margin", portType: "resource", key: "discretionary_spend" },
    ],
    outputs: [
      { name: "Local economic multiplier", portType: "state", key: "local_multiplier" },
      { name: "Supply-chain resilience", portType: "state", key: "supply_resilience" },
      { name: "Social capital", portType: "capital", key: "social" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Local economics / BALLE / regenerative economics",
      keyReference:
        "Michael Shuman, 'The Small-Mart Revolution' (2006) and 'Put Your Money Where Your Life Is' (2020); Civic Economics local-multiplier studies (money re-circulated ~3x in local vs ~1x in chain)",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["place-rooted", "homesteaders", "small-town", "urban-neighborhood-minded"],
      validationNotes:
        "Local-multiplier research across many municipal studies consistently finds ~2–4x higher local circulation from locally-owned businesses vs chains",
    },
    contextTags: ["regenerative", "place-based", "values-aligned"],
    contraindications: [
      "Tight budgets where local price premiums would destabilize — prioritize; don't purity-test your way into hardship",
      "Isolated rural areas where local supply is thin — a mix is honest",
    ],
    links: [
      { rpplId: "rppl:framework:holistic-management:v1", relationship: "derived_from" },
      { rpplId: "rppl:practice:enterprise-stacking:v1", relationship: "synergy" },
    ],
  },

  // ━━━ DESIGN — BUSINESS & LIFE ARCHITECTURE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Namespaced rppl:design:* because archetype-templates.ts already binds
  // to these ids. These are practices (trigger + steps), but they shape
  // the life/enterprise design rather than daily execution.

  {
    rpplId: "rppl:design:qol-decomposition:v1",
    type: "practice",
    name: "Quality-of-Life Decomposition",
    domain: "money",
    domains: ["purpose", "identity"],
    description:
      "A Quality of Life statement (from Holistic Management) describes the life you want to LIVE — not the goals you want to hit. Decomposition is the bridge: translating that statement into the weekly behaviors, capital requirements, and enterprise decisions that produce it. Without decomposition, QoL statements stay poetic; with it, they start directing Tuesday afternoon.",
    trigger:
      "A QoL statement has been drafted (see `rppl:practice:qol-statement:v1`). The decomposition session turns it into working infrastructure.",
    steps: [
      "Read the QoL statement out loud — notice which phrases are vivid and which are abstractions",
      "For each clause, ask: what behaviors, rhythms, or relationships would a person with this QoL actually have?",
      "Group into three tiers: daily (must recur most days), weekly (must recur most weeks), seasonal (must recur most seasons)",
      "For each behavior, name the capital it produces AND the capital it requires — this surfaces hidden dependencies",
      "Identify the weakest decomposition — the clause with no corresponding behavior — and make one first",
      "Re-run decomposition every 6–12 months as the QoL statement itself evolves",
    ],
    timeWindow: "Annual or on major life-state change; 2–4 hours",
    servesPrinciples: [
      "rppl:principle:whole-context-decisions:v1",
      "rppl:principle:needs-have-order:v1",
      "rppl:principle:leverage-points:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:honesty:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "QoL statement exists", portType: "boolean", key: "qol_statement_exists" },
      { name: "Care", portType: "capacity", key: "care" },
    ],
    outputs: [
      { name: "Behavior-to-values alignment", portType: "state", key: "values_alignment" },
      { name: "Weekly/seasonal cadence clarity", portType: "state", key: "cadence_clarity" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Holistic Management (Savory) / values-based design",
      keyReference:
        "Allan Savory, 'Holistic Management' (1999) — Part 2 on holistic goal setting and the translation to decisions; Kirk Gadzia, 'Holistic Management Handbook' (2006)",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["mid-life-redesign", "holistic-managers", "life-architects"],
    },
    contextTags: ["design", "values-aligned", "annual"],
    contraindications: [
      "No QoL statement yet — write one first (growth-purpose-joy practice) before decomposing",
      "Life in active crisis — decomposition presupposes stability; defer until baseline is held",
    ],
    links: [
      { rpplId: "rppl:practice:qol-statement:v1", relationship: "derived_from" },
      { rpplId: "rppl:design:enterprise-qol-validation:v1", relationship: "enables" },
      { rpplId: "rppl:practice:seasonal-review:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:holistic-management:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:design:enterprise-qol-validation:v1",
    type: "practice",
    name: "Enterprise QoL Validation",
    domain: "money",
    domains: ["purpose"],
    description:
      "Every potential enterprise, purchase, or major commitment is tested against the Quality of Life statement BEFORE capital is committed. Holistic Management's seven testing questions (cause-and-effect, weak link, marginal reaction, gross profit, energy/money source, sustainability, gut feel) run the candidate through the full decision surface. This prevents the classic failure: an enterprise that 'makes sense' financially but erodes the life it was supposed to support.",
    trigger:
      "A new enterprise, major purchase, large commitment, or strategic pivot is under consideration. Before the capital moves, the validation runs.",
    steps: [
      "Name the proposed enterprise / decision in one sentence",
      "Cause & effect: is this addressing the root cause or a symptom?",
      "Weak link: does this strengthen the chain's weakest link (financial, biological, social)?",
      "Marginal reaction: compared to alternatives, does this produce the largest movement toward the QoL statement per unit of resource?",
      "Source of energy / money: is the fuel renewable or extractive? Can it be sustained?",
      "Sustainability: if this worked as planned, would the QoL statement be MORE true or less true?",
      "Gut feel: after the analytical tests, does something still pull against it? Why?",
      "Only proceed if all seven tests return a usable answer — and write down what would make you reverse the decision",
    ],
    timeWindow: "Per major decision, 1–3 hours",
    servesPrinciples: [
      "rppl:principle:whole-context-decisions:v1",
      "rppl:principle:cause-and-effect:v1",
      "rppl:principle:evidence-not-authority:v1",
    ],
    servesCapacities: [
      "rppl:capacity:humility:v1",
      "rppl:capacity:honesty:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "QoL statement exists", portType: "boolean", key: "qol_statement_exists" },
      { name: "Decision pending", portType: "boolean", key: "decision_pending" },
    ],
    outputs: [
      { name: "Decision quality", portType: "state", key: "decision_quality" },
      { name: "Enterprise-life alignment", portType: "state", key: "enterprise_alignment" },
      { name: "Financial capital", portType: "capital", key: "financial" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Holistic Management (Allan Savory)",
      keyReference:
        "Allan Savory, 'Holistic Management' (1999) — the seven testing questions; Savory Institute practitioner handbooks",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["entrepreneurs", "farmers", "homesteaders", "economic-shapers", "major-decision"],
    },
    contextTags: ["design", "decision", "pre-commitment"],
    contraindications: [
      "Trivial decisions — this is heavy equipment; don't run it on whether to buy sneakers",
      "Emergency decisions where speed matters more than fullness — use abbreviated version",
    ],
    links: [
      { rpplId: "rppl:design:qol-decomposition:v1", relationship: "derived_from" },
      { rpplId: "rppl:practice:major-purchase-framework:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:holistic-management:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:design:capital-rotation:v1",
    type: "practice",
    name: "Capital Rotation",
    domain: "money",
    domains: ["purpose", "growth"],
    description:
      "Wealth is not just financial. The eight capitals (financial, material, living, social, intellectual, experiential, spiritual, cultural) compound at different rates and can be rotated into each other. Buying experiences converts financial into experiential. Teaching converts intellectual into social. A season of rest converts financial into living. The practice: each quarter, look at which capital is currently thick and which is thin, and rotate deliberately.",
    trigger:
      "Quarterly review. The question is: what did I build this quarter, and what did I let deplete? What wants to be rotated?",
    steps: [
      "List current balance across the eight capitals — 1 (depleted) to 5 (overflow) for each",
      "Identify the overflow capital (usually financial or intellectual for most knowledge workers)",
      "Identify the depleted capital (often living, social, or spiritual under work pressure)",
      "Name ONE rotation for the quarter: e.g. financial → living (a week offline), intellectual → social (teach what you know), experiential → cultural (deep travel)",
      "Design the rotation — it has to be an actual action, not an aspiration",
      "At next quarterly review: did the rotation happen? Which capital grew, which shrank? Recalibrate",
    ],
    timeWindow: "Quarterly, 60–90 minutes",
    servesPrinciples: [
      "rppl:principle:multiple-yields:v1",
      "rppl:principle:diversity-resilience:v1",
      "rppl:principle:integrate-not-segregate:v1",
      "rppl:principle:whole-context-decisions:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Eight-capital inventory", portType: "resource", key: "capital_inventory" },
      { name: "Awareness", portType: "capacity", key: "awareness" },
    ],
    outputs: [
      { name: "Capital balance", portType: "state", key: "capital_balance" },
      { name: "Wealth breadth", portType: "state", key: "wealth_breadth" },
      { name: "Financial capital", portType: "capital", key: "financial" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Social capital", portType: "capital", key: "social" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Eight Forms of Capital (Ethan Roland & Gregory Landua) / regenerative enterprise",
      keyReference:
        "Ethan Roland & Gregory Landua, 'Regenerative Enterprise: Optimizing for Multi-Capital Abundance' (2013); AppleSeed Permaculture's capital diagram",
    },
    evidence: {
      confidence: "seed",
      contextTags: ["mid-career", "high-earners-feeling-hollow", "economic-shapers", "integrated-livers"],
    },
    contextTags: ["design", "wealth-broad", "quarterly"],
    contraindications: [
      "Deep scarcity in financial capital — rotation is a practice of surplus; build floor first",
      "Burnout — rotation from overflow capital INTO living is the appropriate move; don't generate more output",
    ],
    links: [
      { rpplId: "rppl:framework:permaculture:v1", relationship: "derived_from" },
      { rpplId: "rppl:practice:enterprise-stacking:v1", relationship: "synergy" },
      { rpplId: "rppl:operations:weekly-pulse:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:design:seasonal-arc:v1",
    type: "practice",
    name: "Seasonal Arc Planning",
    domain: "money",
    domains: ["purpose", "home"],
    description:
      "Rather than one continuous work rhythm, the year is shaped into four seasonal arcs — each with a dominant mode (building, harvesting, integrating, resting). Farmers, teachers, and creatives know this intuitively; knowledge workers have been sold a flat 12-month sprint that ignores biology, weather, and the natural rhythm of sustainable output. Seasonal arcs protect the cycle — preventing perpetual spring (always planting, never harvesting) and perpetual autumn (always shipping, never planting).",
    trigger:
      "Start of each season (solstice/equinox, or a practical adjacent date). The arc is named, scoped, and connected to the enterprise.",
    steps: [
      "Name the season's dominant mode: Spring (plant), Summer (tend), Autumn (harvest), Winter (rest/plan)",
      "For the coming quarter, pick 1–3 enterprise outcomes aligned with the mode — not 10 generic goals",
      "Adjust the weekly cadence to match: spring = more generative time; autumn = more shipping time; winter = more reflective time",
      "Identify the season-specific risks (spring: overcommit; summer: lose focus; autumn: exhaustion; winter: drift) and one defense each",
      "At season's end, hold a seasonal review — what did this arc actually produce? What will next season carry forward?",
    ],
    timeWindow: "Seasonal (4x/year), 1–2 hours per planning session",
    servesPrinciples: [
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:time-is-wheel:v1",
      "rppl:principle:rest-is-productive:v1",
      "rppl:principle:patterns-at-every-scale:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:care:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Scheduling autonomy", portType: "boolean", key: "scheduling_autonomy" },
      { name: "Enterprise in operation", portType: "boolean", key: "enterprise_running" },
    ],
    outputs: [
      { name: "Annual cadence", portType: "state", key: "annual_cadence" },
      { name: "Sustainable output", portType: "state", key: "sustainable_output" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Permaculture / agricultural rhythm / Vedic and indigenous seasonal cosmologies",
      keyReference:
        "David Holmgren, 'Permaculture Principles and Pathways' (2002) — principle 9 'use small and slow solutions', principle 7 'design from patterns'; Katherine May, 'Wintering' (2020) on fallow seasons; Stephen Cope on dharma and cycles",
    },
    evidence: {
      confidence: "seed",
      contextTags: ["farmers", "creators", "teachers", "entrepreneurs", "climate-with-seasons"],
      validationNotes:
        "Strong practitioner evidence in agriculture and creative fields; minimal controlled research. Holmgren's permaculture principles are field-tested over decades",
    },
    contextTags: ["design", "annual", "rhythm"],
    contraindications: [
      "Tropical / equatorial climates — literal seasons are less distinct; use a wet/dry or cultural calendar instead",
      "Entry-level workers without schedule autonomy — do a lite version with quarterly planning only",
    ],
    links: [
      { rpplId: "rppl:framework:permaculture:v1", relationship: "derived_from" },
      { rpplId: "rppl:practice:seasonal-review:v1", relationship: "synergy" },
      { rpplId: "rppl:operations:weekly-pulse:v1", relationship: "synergy" },
    ],
  },

  // ━━━ OPERATIONS — EXECUTION PATTERNS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Namespaced rppl:operations:* because archetype-templates.ts already binds
  // these ids. These are execution-level practices common to any enterprise.

  {
    rpplId: "rppl:operations:production-batching:v1",
    type: "practice",
    name: "Production Batching",
    domain: "money",
    domains: ["home", "growth"],
    description:
      "Similar work is grouped into dedicated blocks rather than interleaved across the day. A farmer harvests, processes, and markets one product in one sequence. A creator drafts, edits, and publishes in distinct blocks. A freelancer batches all admin (invoicing, emails, scheduling) into one afternoon. Context-switching carries a measurable cognitive tax; batching removes it. The yield is not speed — it's the reduction of decision load and the emergence of flow.",
    trigger:
      "A weekly planning session. Similar tasks across the week are clustered onto specific days or time-blocks.",
    steps: [
      "Audit one week of work — note every task AND its cognitive mode (creative, admin, meetings, learning, physical)",
      "Group tasks by mode — same-mode tasks are candidates to batch",
      "Assign each mode a primary day or block: e.g. Monday = deep creative; Tuesday AM = meetings only; Friday PM = admin batch",
      "Defend the batches — incoming tasks get queued to their mode's block, not handled on arrival",
      "After a month, measure: did throughput rise? Did decision fatigue drop? Refine the grouping",
    ],
    timeWindow: "Weekly planning; ongoing defense of blocks",
    servesPrinciples: [
      "rppl:principle:design-for-flow:v1",
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:small-patterns-compose:v1",
      "rppl:principle:subtract-before-add:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Schedule autonomy", portType: "boolean", key: "scheduling_autonomy" },
      { name: "Variety of task types", portType: "boolean", key: "multi_mode_work" },
    ],
    outputs: [
      { name: "Throughput", portType: "state", key: "throughput" },
      { name: "Decision load", portType: "state", key: "decision_load" },
      { name: "Focus quality", portType: "state", key: "focus" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Lean production (Toyota) / deep work / creator operations",
      keyReference:
        "Taiichi Ohno, 'Toyota Production System' (1988) — batch-size economics; Cal Newport, 'Deep Work' (2016) on shallow-work batching; Paul Graham, 'Maker's Schedule, Manager's Schedule' (2009)",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["knowledge-workers", "creators", "solopreneurs", "farmers", "parents"],
      validationNotes:
        "Context-switching cost is well-established (Mark et al., HCI research showing 23+ min recovery per interruption); batching as mitigation is widely replicated in practitioner operations",
    },
    contextTags: ["operations", "focus", "cadence"],
    contraindications: [
      "Emergency-response roles (medical, infra on-call) — batching is not compatible with the interrupt model",
      "Roles with externally-imposed rhythm (classroom teaching) — batch what remains, don't fight the core rhythm",
    ],
    links: [
      { rpplId: "rppl:operations:spatial-clustering:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:deep-work-block:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:hard-stop:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:operations:spatial-clustering:v1",
    type: "practice",
    name: "Spatial Clustering (Zone Design)",
    domain: "money",
    domains: ["home"],
    description:
      "From permaculture zone design, extended to livelihood: things used most often are placed closest; things used rarely are placed furthest. The farmer keeps the kitchen-garden within 10 steps of the back door; the freelancer keeps the filing closet far from the creative desk. The practice reduces friction for high-frequency work and removes the slow leak of steps and decisions that compound across a day.",
    trigger:
      "Any re-organization of a workspace, homestead, shop, or office — or the annual 'why is this taking so long?' inflection when a previously-efficient space starts feeling draggy.",
    steps: [
      "Map current layout — where do you physically stand, sit, walk most often in a work week?",
      "Map frequency of use of every tool, material, or reference — daily, weekly, monthly, yearly",
      "Define zones: Zone 1 (arms-reach, daily), Zone 2 (same room, weekly), Zone 3 (nearby, monthly), Zone 4 (stored, seasonal)",
      "Relocate mismatches — daily tools pushed to Zone 3 are friction; seasonal tools hogging Zone 1 are clutter",
      "Re-audit after a season — patterns of use change, and zones have to change with them",
    ],
    timeWindow: "Annual or on major setup change",
    servesPrinciples: [
      "rppl:principle:permanence-order:v1",
      "rppl:principle:design-for-flow:v1",
      "rppl:principle:integrate-not-segregate:v1",
      "rppl:principle:leverage-points:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      { name: "Authority over workspace layout", portType: "boolean", key: "workspace_authority" },
      { name: "Tool / material inventory", portType: "resource", key: "tool_inventory" },
    ],
    outputs: [
      { name: "Workflow efficiency", portType: "state", key: "workflow_efficiency" },
      { name: "Decision load", portType: "state", key: "decision_load" },
      { name: "Physical capital", portType: "capital", key: "material" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Permaculture zone design / industrial ergonomics / 5S (lean)",
      keyReference:
        "Bill Mollison, 'Permaculture: A Designers' Manual' (1988) — zone/sector analysis; Hiroyuki Hirano, '5S for Operators' (1995); Christopher Alexander on pattern placement",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["homesteaders", "makers", "shop-owners", "home-workers", "parents"],
      validationNotes:
        "Zone-and-sector design is decades-tested in permaculture; 5S spatial organization has controlled-study support in manufacturing contexts",
    },
    contextTags: ["operations", "workspace", "design"],
    contraindications: [
      "Shared workspaces with no layout authority — negotiate Zone 1 only",
      "Frequent moves — don't over-invest in a permanent layout if the location isn't permanent",
    ],
    links: [
      { rpplId: "rppl:framework:permaculture:v1", relationship: "derived_from" },
      { rpplId: "rppl:operations:production-batching:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:operations:weekly-pulse:v1",
    type: "practice",
    name: "Weekly Pulse Review",
    domain: "money",
    domains: ["growth", "home"],
    description:
      "A fixed 30–60 minute session, once per week, that closes the loop on the past week and opens the loop on the next. It's the heartbeat that keeps small problems from compounding into annual crises: a leaking cash flow found in week 2 is trivial; found in month 10 it's systemic. The format is stable across livelihoods — check numbers, check commitments, check signals, pick next week's priorities. Small, repeated, un-skippable.",
    trigger:
      "A fixed day and time (Friday PM or Sunday evening work for most; Monday AM for others). Non-negotiable unless the week is genuinely ended.",
    steps: [
      "Numbers: revenue, expenses, cash, any KPI that matters for this season — takes 10 minutes if tools are set up",
      "Commitments: what did I promise (to clients, team, self) this week? What was delivered? What slipped?",
      "Signals: what unexpected thing happened — a complaint, a compliment, a surprise bill, a breakthrough — that I should pay attention to?",
      "Next week's 3: the three things that MUST happen next week. Everything else is secondary",
      "One question for the future: what am I pretending not to know about the business / household / life right now?",
    ],
    timeWindow: "Weekly, 30–60 minutes",
    servesPrinciples: [
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:small-patterns-compose:v1",
      "rppl:principle:observation-before-intervention:v1",
      "rppl:principle:signal-not-noise:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:honesty:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      { name: "Fixed weekly slot", portType: "boolean", key: "weekly_slot_reserved" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
    ],
    outputs: [
      { name: "Operational clarity", portType: "state", key: "operational_clarity" },
      { name: "Course-correction speed", portType: "state", key: "course_correction_speed" },
      { name: "Financial capital", portType: "capital", key: "financial" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "GTD / EOS / solopreneur operating-system practice",
      keyReference:
        "David Allen, 'Getting Things Done' (2001) — the weekly review; Gino Wickman, 'Traction' (2011) on weekly L10 meetings; Justin Welsh solopreneur operating system",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["solopreneurs", "small-business-owners", "knowledge-workers", "households"],
      validationNotes:
        "The weekly review is the highest-retention practice across GTD practitioners and small-business operating systems; skipping it is the strongest predictor of drift in practitioner surveys",
    },
    contextTags: ["operations", "cadence", "foundational"],
    contraindications: [
      "Week-to-week instability (acute crisis) — use a daily pulse instead until stability returns",
      "Teams whose weekly meeting already does this — don't duplicate; delegate",
    ],
    links: [
      { rpplId: "rppl:operations:production-batching:v1", relationship: "synergy" },
      { rpplId: "rppl:design:seasonal-arc:v1", relationship: "part_of" },
      { rpplId: "rppl:practice:seasonal-review:v1", relationship: "synergy" },
    ],
  },
];

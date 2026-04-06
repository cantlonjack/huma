# Framework Integration — Making the Wisdom Operational

Each framework below is a piece of infrastructure. This document maps where each one
should be felt in the product, what "felt" means, and what needs to be built.

---

## Tier 1: Already partially coded — needs to be SURFACED

These frameworks are in the data model or prompts but invisible to users.

### 8 Forms of Capital → The Dimension System
**What it teaches:** Wealth is not just money. There are 8 forms: living (body), social (people), financial (money), material (home), intellectual (growth), experiential (joy), spiritual (purpose), cultural (identity).

**Where it lives now:** Every behavior has a `dimensions` array. The capital computation endpoint scores all 8. The Whole page has a radar chart.

**What's missing:** The user never has an "aha" moment about their capital balance. The radar chart is abstract. Dimensions show as tiny pills that mean nothing to someone who hasn't read Ethan Roland.

**What to build:**
- On the Today page, after checking off 3+ behaviors, show a ONE-LINE summary: "Today moved Body and Money the most. Joy hasn't been touched in 4 days." This is the daily capital pulse.
- On the Whole page, replace the abstract radar with plain-language capital statements: "Your strongest capital is People — you've invested in relationships 18 of the last 20 days. Your weakest is Growth — nothing in your current sheet touches learning."
- When HUMA suggests a new behavior, show which capitals it affects and WHY: "Meal prepping touches Money (saves ~$200/month on takeout) and Body (you control ingredients)."
- Let users correct the mappings (Session 6 from refactor-sessions.md).

**The "felt" test:** A user should be able to say, without prompting: "I realized I haven't done anything for [dimension] in a while." If they can say that, the capital system is working.

---

### Christopher Alexander's Pattern Language → The Pattern System
**What it teaches:** Good solutions recur. A pattern is a proven response to a recurring context. Patterns have names, can be composed, and transfer across domains.

**Where it lives now:** The Grow page shows patterns with finding/working/validated status. Patterns have triggers, steps, time windows, and validation metrics.

**What's missing:** Patterns don't feel like discoveries. They feel like metrics. The "finding → working → validated" funnel is visible but doesn't communicate: "You discovered something real about how you operate."

**What to build:**
- When a pattern reaches "validated" status, celebrate it with language that names the discovery: "You've validated a pattern: when you meal-plan on Sunday, you cook at home 5/5 weeknights. This has held for 4 weeks. It's real." Not confetti — just clear acknowledgment that something was proven.
- Show patterns as RECIPES, not stats. "Morning Lever: Run before 7am → shower → journal. This sequence appeared 19 out of 22 weekdays. When you skip the run, journaling drops to 30%." That's a pattern language entry.
- On the Today page, when a behavior is the trigger for a validated pattern, mark it subtly: "This unlocks your morning sequence." The user learns that certain behaviors are levers.
- Eventually: pattern sharing. "12 other people with your archetype validated a similar morning pattern." But NOT until you have the user base to support it.

**The "felt" test:** A user should be able to explain one of their patterns to a friend: "I figured out that when I do X, Y and Z happen naturally."

---

## Tier 2: Needs to be CODIFIED into product logic

These frameworks are in docs but not yet in the codebase.

### Carol Sanford — Nestedness and Essence
**What it teaches:** Everything is nested inside something larger. A behavior is nested inside an aspiration, which is nested inside a life purpose. And every entity has an "essence" — the thing it uniquely contributes that nothing else can.

**Where it should show up:**
- The Whole page should visualize nestedness explicitly. Not as a force-directed graph (which shows connection, not containment) but as concentric rings or a simple hierarchy:
  - Center: WHY statement (life essence)
  - Ring 1: Aspirations (what you're building toward)
  - Ring 2: Behaviors (what you do daily)
  - Ring 3: Patterns (what's proven to work)
- When a user adds a new behavior, HUMA should ask: "Which aspiration does this serve?" If it doesn't serve any, flag it: "This behavior isn't connected to anything you've said matters. Is it actually important, or is it noise?"
- When a user has too many behaviors (>8), HUMA should use nestedness to prune: "These 3 behaviors all serve 'eat better.' Can they be compressed into one daily practice?"

**What to build:**
- A nestedness view on the Whole page (replaces or supplements the graph)
- Orphan detection: behaviors not connected to any aspiration get flagged
- Compression suggestions: when multiple behaviors nest under one aspiration and overlap, suggest consolidation

**The "felt" test:** A user should never have a behavior on their sheet that they can't explain the purpose of.

---

### Holistic Management — Whole Context Before Decisions
**What it teaches:** Before making any decision, articulate your "whole context" — quality of life statement, forms of production, future resource base. Then test every decision against the whole.

**Where it should show up:**
- Before HUMA recommends ANY new behavior, it should reason from the user's whole context. Not just "you said you want to run" but "you said you want to run, you have two kids under 5, your partner works nights, and your gym closed. Given all of that, the realistic version is: run with the jogging stroller at 6am while the kids are still sleepy."
- The context portrait (currently on Whole page) should be more prominent and more actionable. It's not just a profile — it's the lens through which every recommendation is filtered.
- When context changes (new job, moved, relationship shift), HUMA should proactively re-evaluate: "Your context shifted. Three of your current behaviors assumed you lived near a park. Do these still work?"

**What to build:**
- Context-aware reasoning visible in the sheet detail. Each behavior's "detail" line should reference specific context: names, places, constraints, resources.
- Context change detection → automatic re-evaluation prompt
- A "test against whole context" step in the sheet compiler: before including a behavior, verify it's compatible with known constraints

**The "felt" test:** A user should feel like HUMA knows their life. Not in a creepy way — in a "my best friend remembers that I have a bad knee" way.

---

### Regrarians Platform — Permanence Hierarchy
**What it teaches:** When designing a regenerative system, work from permanent to flexible: climate → geography → water → access → forestry → buildings → fencing → soils → economy → energy. In life terms: fix your foundation before optimizing your edges.

**Where it should show up:**
- When a user has multiple aspirations, HUMA should prioritize foundational ones. Sleep > productivity hacks. Financial stability > investment optimization. Physical health > supplements.
- The Today sheet should be ordered by permanence, not arbitrarily. Foundational behaviors first, flexible ones last.
- When a user wants to add a new aspiration while foundational ones are struggling, HUMA should gently note: "Your sleep pattern has been inconsistent for 2 weeks. Adding a new project on top of that might not stick. Want to stabilize sleep first?"

**What to build:**
- A permanence score for each aspiration/behavior based on which capital it primarily serves (Body/Home = more permanent, Joy/Growth = more flexible)
- Sheet ordering by permanence score
- Foundation-check before adding new aspirations: "Your foundation (Body, Home) is [stable/unstable]. Recommendation: [proceed/stabilize first]."

**The "felt" test:** A user should notice that HUMA consistently puts the basics first and doesn't let them pile on new ambitions when the foundation is shaky.

---

### ISRU (In Situ Resource Utilization) — Use What's Already There
**What it teaches:** Don't import solutions. Reveal and recombine resources already present.

**Where it should show up:**
- HUMA should NEVER suggest something that requires the user to acquire a new resource without first checking if an existing resource could work. "You want to exercise → do you have stairs? A park nearby? A floor?" before "Join a gym."
- The context portrait should explicitly capture resources: physical spaces, equipment, relationships, skills, time blocks. These become the palette HUMA draws from.
- When suggesting behaviors, HUMA should cite the existing resource: "You mentioned you have a slow cooker. Use it for batch cooking on Sunday — 30 min active, 4 hours passive."

**What to build:**
- A "resources" section in known_context: tools, spaces, relationships, skills, time blocks
- Prompt engineering: instruct Claude to prefer existing resources over new acquisitions
- Resource citation in behavior details: "Using: your slow cooker, Sunday mornings (you said these are free)"

**The "felt" test:** A user should feel like HUMA is working WITH what they have, not telling them to go buy things.

---

### Socratic Method — Already Working
**What it teaches:** Don't tell — ask. One question at a time. Let the person arrive at their own understanding.

**Status:** This is the one framework that's already felt. The conversation engine asks one question at a time, reflects back, and lets the user self-discover. Keep it.

**Minor improvement:** When HUMA reflects back ("So what I'm hearing is..."), it should occasionally name the framework principle at work: "That's a leverage point — one behavior that moves three parts of your life." This teaches the user to think in systems without lecturing them.

---

### Maslow — Needs Hierarchy
**What it teaches:** Physiological → Safety → Belonging → Esteem → Self-actualization. Lower needs must be met before higher ones can be pursued sustainably.

**Where it should show up:** This overlaps heavily with the Regrarians permanence hierarchy. Combine them:
- Body + Home = Physiological/Safety (foundation)
- People = Belonging
- Money + Identity = Esteem
- Growth + Joy + Purpose = Self-actualization

Don't implement Maslow separately. Use it to validate the permanence ordering.

---

### Ikigai — Purpose at the Intersection
**What it teaches:** Purpose lives where four things overlap: what you love, what you're good at, what the world needs, what you can be paid for.

**Where it should show up:**
- During the initial conversation, HUMA should be mapping what the user says to these four quadrants — even if it doesn't say "ikigai" out loud.
- On the Whole page, the WHY statement should implicitly reflect the ikigai intersection: "To [what you love] by [what you're good at] for [what the world needs] through [what you can be paid for]."
- When an aspiration only touches 1-2 quadrants, surface that: "This aspiration is about what you love, but it doesn't connect to income or skill-building. Is that intentional, or should we find the overlap?"

**What to build:**
- Ikigai quadrant tagging in the conversation extraction (silent — not shown to user as "ikigai")
- WHY statement template that implicitly follows the ikigai structure
- Aspiration balance check: are all four quadrants represented across the user's aspirations?

**The "felt" test:** A user should feel like their aspirations cover the important dimensions of a purposeful life, even if they've never heard of ikigai.

---

## Implementation Priority

**Do first (Tier 1 — surfacing what exists):**
1. Capital pulse on Today page (one-line summary after check-offs)
2. Plain-language capital statements on Whole page
3. Pattern celebration and recipe format on Grow page
4. Trigger marking on Today page ("This unlocks your morning sequence")

**Do second (Tier 2 — codifying new logic):**
5. Permanence-based sheet ordering
6. Context-aware behavior details (cite specific resources, constraints, names)
7. Foundation check before new aspirations
8. Orphan behavior detection
9. Resource inventory in known_context

**Do third (Tier 2 — deeper integration):**
10. Nestedness visualization on Whole page
11. Ikigai quadrant balance check
12. ISRU-first behavior suggestions
13. Context change → re-evaluation flow

**Do never (until 100+ users):**
- Pattern sharing/commons
- Cross-user pattern validation
- Micro-payment protocol
- The board game, the book, the curriculum

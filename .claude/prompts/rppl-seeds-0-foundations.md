# RPPL Seed Library — Level 0: Foundational Frameworks

**Run this FIRST before any other RPPL seed prompt.** It establishes the meta-level frameworks that all principles and practices derive from.

Read the project memory files for context:
- `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\project_rppl_commons.md` — what RPPLs are
- `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\project_rppl_hierarchy.md` — the three-level hierarchy (Framework → Principle → Practice)
- `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\feedback_rppl_truth_based.md` — truth-based, not institution-based

Read the Pattern and provenance types in `app/src/types/v2.ts` (look for PatternProvenance, PatternEvidence, PatternSource, PatternConfidence, PatternLink interfaces).

## What This Session Produces

1. Update the RpplSeed interface to support the three-level hierarchy
2. Create the foundational frameworks file
3. Create the principles derivation file
4. Set up the barrel export structure

## Step 1: Update the RpplSeed Type

Create `app/src/data/rppl-seeds/types.ts`:

```typescript
import type { PatternProvenance, PatternEvidence, PatternLink } from "@/types/v2";

// ─── RPPL Hierarchy ──────────────────────────────────────────────────────────
// Frameworks produce Principles. Principles inform Practices.
// Practices generate daily Actions (at runtime, not in seed data).

export type RpplType = "framework" | "principle" | "practice";

export type PrincipleSource =
  | "derived"      // From a framework (user chose this based on understanding)
  | "discovered"   // From their own data (HUMA found this works for them)
  | "inherited"    // From culture/upbringing (may need examination)
  | "adopted";     // From expert/community recommendation

export interface RpplSeed {
  rpplId: string;                    // e.g. "rppl:framework:trivium:v1"
  type: RpplType;                    // "framework", "principle", or "practice"
  name: string;                      // Human-readable name
  domain: string;                    // Primary domain: "meta", "body", "money", etc.
  domains?: string[];                // Additional domains this touches
  description: string;               // 2-4 sentences: what this is and why it matters

  // ─── Framework-specific (type === "framework") ───
  // Frameworks don't have triggers/steps — they have tenets and applications
  tenets?: string[];                 // Core principles this framework teaches
  applications?: string[];           // How this framework applies to daily life
  tradition?: string;                // Intellectual tradition ("Classical education", "Hermetic philosophy")

  // ─── Principle-specific (type === "principle") ───
  // Principles derive from frameworks and inform practices
  principleSource?: PrincipleSource; // Where this principle comes from
  derivedFrom?: string[];            // rpplIds of frameworks this derives from
  axiom?: string;                    // The principle stated as a single sentence
  challenges?: string;               // What inherited belief this challenges (if any)

  // ─── Practice-specific (type === "practice") ───
  // Practices are specific daily/weekly patterns grounded in principles
  trigger?: string;                  // The decision that starts the chain
  steps?: string[];                  // The golden pathway — ordered actions
  timeWindow?: string;               // When to practice
  servesP rinciples?: string[];      // rpplIds of principles this practice embodies

  // ─── Shared fields ───
  provenance: PatternProvenance;
  evidence: PatternEvidence;
  contextTags: string[];             // Who this is for
  contraindications?: string[];      // Who should NOT use this
  links?: PatternLink[];             // Related RPPLs (synergies, conflicts, builds-on)
}
```

**IMPORTANT:** Check `app/src/types/v2.ts` first — if `RpplType` or `PrincipleSource` already exist there, import them instead of redefining. The types may need to live in v2.ts for broader use. Use your judgment on the right location.

Also fix the typo above: `servesP rinciples` should be `servesPrinciples`.

## Step 2: Foundational Frameworks

Create `app/src/data/rppl-seeds/frameworks.ts` with 12-18 framework RPPLs.

These are the meta-level thinking tools that teach HOW to think, not what to do. They don't have triggers or steps — they have tenets and applications.

### Frameworks to Include

**Classical Thinking Tools:**

1. **The Trivium** (Grammar, Logic, Rhetoric)
   - rpplId: "rppl:framework:trivium:v1"
   - The foundational method of learning HOW to think. Grammar: gather the facts. Logic: test them for consistency and truth. Rhetoric: apply and communicate them.
   - Why it matters for HUMA: Every RPPL should survive Trivium analysis. If a pattern is popular but logically inconsistent, or based on incomplete facts, the Trivium exposes it.
   - Tradition: Classical liberal arts education (ancient Greece → medieval universities → modern revival)
   - Applications: evaluating health claims, financial advice, relationship counsel — anything. "Is this true?" before "Is this popular?"

2. **The Quadrivium** (Number, Geometry, Music/Harmony, Astronomy/Cosmology)
   - rpplId: "rppl:framework:quadrivium:v1"
   - The method of understanding the STRUCTURE of reality through number and proportion.
   - Why it matters: Patterns in life follow mathematical principles — rhythm, proportion, cycles. Understanding the Quadrivium means recognizing the patterns beneath the patterns.
   - Applications: recognizing cyclical patterns in your data, understanding proportional relationships (80/20), seasonal rhythms, biological cycles.

**Natural/Universal Law:**

3. **Natural Law**
   - rpplId: "rppl:framework:natural-law:v1"
   - The inherent principles governing reality — not legislation, but the actual laws of cause and effect, rhythm, polarity, and correspondence that operate whether you know them or not.
   - Tenets: Cause and effect are real (every action has consequences). Rhythm is universal (everything cycles). Polarity exists (every quality has its opposite). What you do to yourself, you experience.
   - Why it matters: Most inherited life patterns violate Natural Law (working against circadian rhythm, eating against seasonal availability, living in ways that ignore cause and effect). Aligning with Natural Law is the foundation of thriving.
   - Tradition: Perennial philosophy, natural philosophy, indigenous wisdom traditions

4. **The Seven Hermetic Principles** (Mentalism, Correspondence, Vibration, Polarity, Rhythm, Cause & Effect, Gender)
   - rpplId: "rppl:framework:hermetic-principles:v1"
   - Ancient framework describing how reality operates at every scale.
   - Tenets: All is mind (Mentalism). As above so below (Correspondence). Everything vibrates (Vibration). Everything has opposites (Polarity). Everything flows in cycles (Rhythm). Every cause has an effect (Cause & Effect). Everything has masculine and feminine aspects (Gender/generative principle).
   - Why it matters: These aren't mystical — they're observational. Correspondence means your biology mirrors cosmic cycles (circadian = solar cycle). Rhythm means your life has seasons. Polarity means rest is as productive as effort.
   - Tradition: Hermeticism (Emerald Tablet, Kybalion), traced through Egyptian, Greek, Renaissance thought

**Systems & Decision Frameworks:**

5. **Holistic Management**
   - rpplId: "rppl:framework:holistic-management:v1"
   - Allan Savory's decision-making framework: define your whole (what you manage), create a holistic context (quality of life statement + future resource base + forms of production), test every decision against 7 questions.
   - The 7 testing questions: Cause & effect? Weak link? Marginal reaction? Gross margin? Energy/money source? Sustainability? Society & culture?
   - Why it matters: Most decisions are made reactively or based on single-dimension optimization. HM forces multi-dimensional consideration. This is HUMA's invisible framework for decision support.
   - Tradition: Holistic Management (Allan Savory), regenerative agriculture, whole-systems thinking

6. **First Principles Thinking**
   - rpplId: "rppl:framework:first-principles:v1"
   - Reasoning from fundamental truths rather than by analogy or convention. Break assumptions down to their base elements, verify each, rebuild.
   - Why it matters: Most life patterns are "this is how it's done" (reasoning by analogy). First principles asks "why is it done this way, and is there a better way given what we actually know?"
   - Applications: questioning dietary guidelines, career paths, financial strategies, relationship norms
   - Tradition: Aristotle, scientific method, modern: Elon Musk popularization (but the method is ancient)

7. **Permaculture Design Principles**
   - rpplId: "rppl:framework:permaculture:v1"
   - David Holmgren's 12 principles for designing sustainable human systems. Observe and interact. Catch and store energy. Obtain a yield. Apply self-regulation. Use and value renewables. Produce no waste. Design from patterns to details. Integrate rather than segregate. Use small and slow solutions. Use and value diversity. Use edges and value the marginal. Creatively use and respond to change.
   - Why it matters: These principles apply to LIFE DESIGN, not just agriculture. "Obtain a yield" means every action should produce something. "Use edges" means the most interesting growth happens at the boundaries between domains.
   - Tradition: Permaculture (Bill Mollison, David Holmgren), ecological design

8. **Regrarians Platform / Permanence Scale**
   - rpplId: "rppl:framework:regrarians:v1"
   - Darren Doherty's hierarchy of development: Climate → Geography → Water → Access → Forestry → Buildings → Fencing → Soils → Economy. Address things in order of permanence — don't optimize economy before you've addressed water.
   - Why it matters for life design: There's a permanence hierarchy in your life too. Health > relationships > purpose > money. Don't optimize your investment portfolio while your sleep is broken.
   - Tradition: Regrarians (Darren Doherty), Keyline (P.A. Yeomans), holistic landscape design

9. **Alexander's Pattern Language**
   - rpplId: "rppl:framework:pattern-language:v1"
   - Christopher Alexander's insight: good design consists of interconnected patterns at multiple scales. Each pattern solves a recurring problem in a context. Patterns compose — small patterns nest within larger ones.
   - Why it matters: This IS what RPPLs are. Life is a pattern language. Small daily patterns nest within weekly patterns nest within seasonal patterns nest within life-stage patterns. Understanding this composability is the meta-insight.
   - Tradition: Architecture, software design patterns, urban planning

**Epistemological Frameworks:**

10. **The Organon / Logic** (Aristotelian categories, syllogistic reasoning)
    - rpplId: "rppl:framework:organon:v1"
    - The original system for evaluating whether an argument is valid. Categories of being, rules of inference, identification of fallacies.
    - Why it matters: Most health advice, financial advice, and life advice contains logical fallacies. Recognizing them is a superpower.

11. **The Socratic Method**
    - rpplId: "rppl:framework:socratic-method:v1"
    - Systematic questioning to expose assumptions, clarify thinking, and arrive at truth through dialogue.
    - Why it matters: This is actually what HUMA does in conversation — guided questioning to help the user discover what they actually think and want, not to tell them.

12. **The Scientific Method (Real, Not Institutional)**
    - rpplId: "rppl:framework:scientific-method:v1"
    - Observe → hypothesize → test → measure → conclude → share. The real method, not "trust the experts." Emphasis on N=1 self-experimentation as legitimate science.
    - Why it matters: HUMA's pattern validation IS the scientific method applied to your life. You adopt a pattern (hypothesis), practice it (experiment), track results (measurement), and evaluate (conclusion). Your data is real science.
    - Important distinction: "The science says" is often institutional consensus, not the scientific method. The method itself is anti-authoritarian — it says "test it yourself."

**Ethical/Moral Frameworks:**

13. **Stoic Philosophy** (Marcus Aurelius, Epictetus, Seneca)
    - rpplId: "rppl:framework:stoicism:v1"
    - Focus on what you can control, accept what you can't. Virtue as the only true good. Morning intention, evening reflection. Negative visualization. Memento mori.
    - Applications: daily practice structure, emotional regulation, decision-making under uncertainty

14. **The Non-Aggression Principle / Voluntarism**
    - rpplId: "rppl:framework:non-aggression:v1"
    - No person has the right to initiate force against another. All human interaction should be voluntary. Your body, your property, your choice.
    - Why it matters: Many inherited life patterns involve coercion (of self or others). This framework clarifies: are you doing this because you chose it, or because someone told you to?

**Biological/Health Frameworks:**

15. **Terrain Theory** (vs. Germ Theory)
    - rpplId: "rppl:framework:terrain-theory:v1"
    - The internal environment (terrain) determines health, not external pathogens alone. A healthy terrain is resistant. An unhealthy terrain is vulnerable.
    - Why it matters: Shifts health strategy from "avoid germs" to "build resilience." This changes everything about how you approach nutrition, sleep, stress, and environmental exposure.
    - Important: Present alongside germ theory as a framework, not as replacement. Both lenses have utility. The user's own data determines which serves them.

16. **Circadian Biology**
    - rpplId: "rppl:framework:circadian-biology:v1"
    - The body is fundamentally a light-driven system. Every cell has a clock. These clocks synchronize to solar cycles. Disrupting this synchronization (artificial light, irregular eating, shift work) causes cascading dysfunction.
    - Key sources: Dr. Jack Kruse, Dr. Satchin Panda, Dr. Andrew Huberman
    - Why it matters: This is the biological foundation beneath virtually every "health pattern." Sleep protocols, eating windows, exercise timing, light exposure — all derive from circadian biology.

## Step 3: Core Principles

Create `app/src/data/rppl-seeds/principles.ts` with 15-25 principle RPPLs.

These are derived from the frameworks above. Each principle states an axiom, traces to its framework source(s), and may challenge an inherited belief.

### Principles to Include (examples — expand to 15-25)

1. **"My body is a light-driven system"**
   - derivedFrom: ["rppl:framework:circadian-biology:v1", "rppl:framework:hermetic-principles:v1"]
   - challenges: "Indoor lighting and screens have no health impact"
   - domain: "body"

2. **"I evaluate claims by evidence, not authority"**
   - derivedFrom: ["rppl:framework:trivium:v1", "rppl:framework:scientific-method:v1"]
   - challenges: "If the doctor/government/expert says so, it must be true"
   - domain: "meta"

3. **"Every action should produce multiple yields"**
   - derivedFrom: ["rppl:framework:permaculture:v1", "rppl:framework:holistic-management:v1"]
   - challenges: "Single-purpose activities are fine"
   - domain: "meta"

4. **"Rest is as productive as effort"**
   - derivedFrom: ["rppl:framework:hermetic-principles:v1", "rppl:framework:natural-law:v1"]
   - challenges: "Productivity = hours worked. Rest is laziness."
   - domain: "joy"

5. **"Address things in order of permanence"**
   - derivedFrom: ["rppl:framework:regrarians:v1"]
   - challenges: "Optimize what's urgent, not what's foundational"
   - domain: "meta"

6. **"Cause and effect are real and inescapable"**
   - derivedFrom: ["rppl:framework:natural-law:v1", "rppl:framework:hermetic-principles:v1"]
   - challenges: "I can shortcut consequences" / "Correlation isn't causation (used as excuse to ignore obvious causation)"
   - domain: "meta"

7. **"My health is my terrain, not my defense against pathogens"**
   - derivedFrom: ["rppl:framework:terrain-theory:v1", "rppl:framework:circadian-biology:v1"]
   - challenges: "Health is about avoiding germs and taking medicine when sick"
   - domain: "body"

8. **"Rhythm is universal — my life has seasons"**
   - derivedFrom: ["rppl:framework:natural-law:v1", "rppl:framework:hermetic-principles:v1", "rppl:framework:permaculture:v1"]
   - challenges: "I should maintain the same output level year-round"
   - domain: "meta"

9. **"Small patterns compose into life design"**
   - derivedFrom: ["rppl:framework:pattern-language:v1", "rppl:framework:permaculture:v1"]
   - challenges: "I need a grand plan to change my life"
   - domain: "meta"

10. **"What I do voluntarily has more power than what I do from obligation"**
    - derivedFrom: ["rppl:framework:non-aggression:v1", "rppl:framework:stoicism:v1"]
    - challenges: "Discipline means forcing yourself to do things you hate"
    - domain: "purpose"

Add 10-15 more across all domains (body, money, people, home, growth, joy, purpose, identity, time). Each should:
- State the axiom clearly
- Trace to 1-3 frameworks
- Name the inherited belief it challenges (if any)
- Tag for relevant life contexts

## Step 4: Barrel Export

Create `app/src/data/rppl-seeds/index.ts`:

```typescript
export type { RpplSeed, RpplType, PrincipleSource } from "./types";
export { frameworkSeeds } from "./frameworks";
export { principleSeeds } from "./principles";
// Future practice domains:
// export { bodyHealthSeeds } from "./body-health";
// export { moneyLivelihoodSeeds } from "./money-livelihood";
// etc.

// Aggregate all seeds
import { frameworkSeeds } from "./frameworks";
import { principleSeeds } from "./principles";

export const allSeeds = [...frameworkSeeds, ...principleSeeds];
```

## Research Approach

For each framework, use web search to find:
- The original source texts and modern interpretations
- How practitioners actually apply it (not just theory)
- Criticisms and limitations (include these honestly in contraindications)
- Connection points to other frameworks (use links field)

Be thorough on the Trivium, Natural Law, and Hermetic Principles — these are foundational to the user's worldview and HUMA's philosophy. Get the tenets right from primary sources, not Wikipedia summaries.

## Output

Write all four files (types.ts, frameworks.ts, principles.ts, index.ts). Run `npm run build` in `/app` to verify. This is the foundation everything else builds on — get it right.

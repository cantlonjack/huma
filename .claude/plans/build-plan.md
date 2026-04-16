# HUMA Product Evolution — Build Plan

## Context

Through extensive product design work, HUMA's identity crystallized from "daily action optimizer that shows life connections" to **"life design partner that helps you consciously create the life you want."**

The five layers of value:
1. **Clarify** what you actually want (not inherited expectations)
2. **Design the pathway** using proven methods, staged for your situation
3. **Choose better patterns** — replace unconscious daily habits with conscious ones (RPPLs)
4. **Take daily action** — specific, with WHY and WHERE it sits in the larger arc
5. **Validate and evolve** — evidence-backed, patterns upgraded over time

The interface philosophy: **editorial, not technological.** The daily briefing is a letter, not a dashboard. Typography and writing quality are the differentiators. The product should be so intuitive anyone knows what to do — Google Maps-level clarity.

RPPLs (Ripples) are the long-term moat: expert-seeded patterns that users validate with their own data, eventually community-contributed. A collective intelligence for life design.

---

## Phase 1: Landing Page Rewrite
**Impact: High | Complexity: Small-Medium | Ships independently**

Update messaging from "see connections, find leverage" to "consciously design your life." Keep the existing three-phase demo animation (it works well) but update its content.

### Files to edit

**`app/src/components/landing/LandingPage.tsx`** — all changes are surgical copy/content edits:

- **Hero kicker** (~line 447): "Life infrastructure" → "Life design partner"
- **Hero h1** (~lines 458-463): "See how your life actually connects. Find the leverage." → New headline framing conscious life design (e.g., "Design the life you actually want. Then live it, one day at a time.")
- **Hero subtitle** (~lines 466-470): Rewrite from connections/leverage to pain/promise: most people live on inherited patterns without examining them; HUMA helps you clarify what you want, choose proven patterns, and validate they work.
- **`HERO_MESSAGES` array** (lines 22-27): **Entirely new scenario.** The current freelancer/cooking story demonstrates connections but not life design. New scenario should show someone living on autopilot who, through conversation, realizes they want something different — then HUMA helps them choose patterns and design a pathway. The gap between inherited expectations and conscious desire should be visible.
- **`BRIEFING` array** (lines 43-62): Entirely new entries matching the new scenario. Each entry's `reasoning` shows the "because" chain — why this action matters in terms of the user's stated desire and which conscious pattern it serves. Include pathway context ("Part of your morning sovereignty pattern — day 14").
- **Through-line text** (line 332): Update to letter-voice style with a 1-2 sentence opening before the entries.
- **`DIMS` array** (lines 10-19): Update dimension example labels to match the new scenario.
- **`DIM_REVEAL_SCHEDULE`** (lines 30-35): Update to match new conversation flow.
- **"The Difference" section heading** (~line 512): "It reasons about your life..." → framing around life design partnership.
- **Three feature items** (~lines 516-552):
  1. "It remembers everything" → reframe as "knows your whole situation, works in your interest" (the fiduciary concept in plain English)
  2. "It sees connections" → "It designs your pathway" (proven frameworks, staged plan)
  3. "It learns your rhythm" → "It validates what works" (evidence-backed pattern upgrades)
- **Bottom CTA subtitle** (~line 567): Add mention of "your first daily letter"

**`app/src/app/layout.tsx`** (~lines 33-51): Update `title`, `description`, and `openGraph`/`twitter` metadata to match new messaging.

### Result
Landing page sells "consciously design your life" instead of "see connections." Demo shows the same three-phase animation but content reflects the new framing.

---

## Phase 2: Today Page — Narrative Daily Briefing
**Impact: Highest | Complexity: Large | Core loop transformation**

Transform from dashboard (card sections) to a narrative letter. This is the most important change.

### Phase 2a: Sheet API Prompt Update

**`app/src/app/api/sheet/route.ts`** — extend `SHEET_PROMPT` (lines 16-109):

Add new required fields to the JSON output schema:
- `opening` — 1-2 sentence letter-style greeting. Addresses user by name, references time of day, names the state of things. "Good morning, Sarah. Sleep's been rough this week — three nights past midnight. But your morning walks are holding strong."
- `because` on each entry — sentence explaining WHY this action matters, tracing to the user's stated desire and which aspiration it serves. Not the "how-to" (that's `detail`), but the "why-this."
- `connection_note` on each entry (optional) — when an action connects to another entry or a known pattern, a brief phrase naming that connection. Enables narrative transitions between entries.
- `pattern_note` (optional) — if this action is part of a conscious pattern the user adopted, reference it: "Part of your structured morning pattern — day 14."

Update voice instructions: emphasize "letter" not "list." The through_line should read like the opening line of a letter. Entries should have narrative flow.

**`app/src/lib/sheet-compiler.ts`** — update `compileSheet` to parse and return the new `opening` field alongside existing `throughLine` and `entries`.

**`app/src/types/v2.ts`** — extend `SheetEntry` interface:
```typescript
// Add to SheetEntry:
because?: string;
connectionNote?: string;
patternNote?: string;
```

Add to the compiled sheet return type:
```typescript
opening?: string;
```

### Phase 2b: Today Page Layout Transformation

**`app/src/app/today/page.tsx`** (612 lines) — restructure layout from card sections to narrative flow:

**Step 1: Elevate the narrative.** The `throughLine` (~line 284) is currently 20px italic header text. Make it the dominant element (24-28px serif, full width). Render the new `opening` field above it as the letter greeting. The `stateSentence` (~line 278) becomes a lighter supporting line below, not the header.

**Step 2: Weave entries into narrative.** Between entries, render `connectionNote` from each entry as a transition sentence (serif italic, earth-500). This transforms the list into a continuous read. Each `CompiledEntryRow` gets the `because` text visible by default below the headline (not hidden behind tap).

**Step 3: Integrate supporting material.** Instead of separate card sections after the field report:
- Move the single `InsightCard` (~line 433) to appear inline after the entry it's most relevant to (match on shared dimensions)
- Move nudges to after the last entry as "P.S." notes
- Keep validation cards but restyle as a narrative section ("How did last week go?")

**Step 4: Evening version.** When `isEvening` is true, the `opening` shifts to an evening-appropriate reflection. Show checked/unchecked state inline in the narrative.

**`app/src/components/today/CompiledEntryRow.tsx`** — extend to accept and render `because` and `connectionNote` props.

**`app/src/hooks/useToday.ts`** — expose new `opening` field in the return type.

### Result
Today page reads as a 60-second letter: greeting → state of things → through-line → actions with "because" reasoning → transitions between entries → inline insights → P.S. notes. Still checkable. Narrative, not dashboard.

---

## Phase 3: Onboarding Speed-Up
**Impact: High (activation) | Complexity: Medium | Ships independently**

Reduce time-to-first-briefing from 10+ minutes to 5 minutes.

### Files to edit

**`app/src/app/start/page.tsx`** (~528 lines):
- Remove archetype selection as an entry gate (~lines 346-355). Skip directly to conversation. Archetype can be offered later during conversation or on the Whole page.
- Lower quick-start trigger threshold (~line 441): Currently `exchangeCount >= 3 && completeness.filled >= 2`. Change to `exchangeCount >= 2 && completeness.filled >= 1`.
- Reduce `ContextAssemblyPanel` prominence on desktop right panel. The context model builds through daily use, not upfront.

**`app/src/hooks/useStart.ts`** — change initial `onboardingStep` from `"archetype"` to conversation. Adjust exchange count logic.

**`app/src/lib/services/prompt-builder.ts`** — tighten `QUICK_START_PROMPT` (~lines 86-150):
- Compress from 4-6 exchanges to 3-4
- After exchange 2: if enough context for a rough plan, offer it immediately
- Add instruction: "A rough-but-real first briefing beats a perfect briefing they never see."
- The three core questions embedded in the flow:
  1. "What's most alive for you right now?" (primary domain/tension)
  2. "What does your best day look like?" (desired patterns)
  3. "What keeps getting in the way?" (blockers/connections)

### Result
User lands directly in conversation. 3-5 exchanges to first briefing. No archetype wall. "Ready to build your first day?" appears sooner.

---

## Phase 4: RPPL Data Model Extensions
**Impact: Foundation for moat | Complexity: Medium | Ships independently (infrastructure)**

Extend Pattern to support RPPLs — provenance, evidence tracking, source types.

### Files to edit

**`app/src/types/v2.ts`** — extend Pattern interface with optional fields:
```typescript
provenance?: {
  source: "expert" | "user" | "community";
  framework?: string;        // "BJ Fogg Tiny Habits", "GTD Weekly Review"
  discoveredAt?: string;
  discoveryContext?: string;
};
evidence?: {
  completionRate: number;
  lifecycleDays: number;
  adoptionCount?: number;    // for community RPPLs: how many users run this
};
sourceType?: "expert" | "user" | "community";
```

Add new `Pathway` interface for cross-aspiration staged planning:
```typescript
interface Pathway {
  id: string;
  name: string;
  aspirationIds: string[];
  stages: PathwayStage[];
  currentStage: number;
}
interface PathwayStage {
  name: string;
  description: string;
  patternIds: string[];
  status: "upcoming" | "active" | "completed";
  timeframe?: string;
}
```

**New migration: `app/supabase/migrations/013_rppl_extensions.sql`**:
```sql
ALTER TABLE patterns ADD COLUMN IF NOT EXISTS provenance JSONB DEFAULT NULL;
ALTER TABLE patterns ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'user';
ALTER TABLE patterns ADD COLUMN IF NOT EXISTS community_validation_count INTEGER DEFAULT 0;
```
All additive — no existing data changes.

**`app/src/lib/db/patterns.ts`** — update `mapPatternRow` to read new fields, update `savePattern`/`updatePattern` to write them.

**New file: `app/src/data/rppl-seeds.ts`** — a comprehensive, truth-based pattern library for ALL of humanity. This is HUMA's most ambitious asset and should be built incrementally.

**Scope: every domain of human life, every life situation.** Not biased toward any single demographic, philosophy, or lifestyle. A single parent in Lagos, a retiree in Tokyo, a student in Berlin, a farmer in Iowa — all should find relevant, proven patterns.

**Domains to cover (with example breadth, not exhaustive):**

- **Health & Body**: Sleep optimization (across chronotypes), nutrition (plant-based, animal-based, traditional diets, allergy management), movement (desk workers, athletes, elderly, disabled, parents with no time), chronic illness management, recovery protocols, circadian biology, mental health (anxiety, depression, grief, trauma), hormonal health, dental, vision, pain management
- **Money & Livelihood**: Debt recovery, budgeting (at every income level), investing basics → advanced, starting a business, freelancing, career transitions (corporate→entrepreneur, military→civilian, parent re-entering workforce), retirement planning, generational wealth, poverty → stability, negotiation, passive income
- **Home & Environment**: Apartment living, homesteading, urban sustainability, meal planning (single, family, budget, dietary restriction), cleaning systems, maintenance routines, organization, downsizing, moving, roommate dynamics, home buying, renting
- **Relationships & Community**: New relationships, marriage, co-parenting, divorce, grief/loss, family conflict, friendship maintenance, loneliness, community building, networking, mentorship, caregiving (children, elderly parents), cultural integration
- **Growth & Learning**: Self-directed learning, formal education, career skill building, creative practice, reading habits, language learning, deliberate practice, teaching others, cognitive decline prevention, digital literacy
- **Purpose & Meaning**: Values clarification, life transitions, retirement identity, spiritual practice (secular and religious — meditation, prayer, philosophy), ethical frameworks, contribution/service, legacy thinking
- **Joy & Rest**: Play, hobbies, creative expression, rest (active vs. passive), sabbath/fallow patterns, seasonal rhythms, travel, nature connection, digital wellness, boredom as signal
- **Identity & Culture**: Life stage transitions (adolescence, parenthood, mid-life, elder), cultural identity, immigrant experience, gender/sexuality, disability identity, archetypes and roles
- **Time & Systems**: Time management (for parents, students, shift workers, executives, people with ADHD), daily rhythms, weekly reviews, seasonal planning, decision frameworks, habit formation, breaking bad habits
- **Parenting**: Newborn, toddler, school-age, teenager, special needs, single parenting, co-parenting, homeschooling, college prep, letting go
- **Digital Life**: Screen management, information diet, social media, online safety, remote work, digital minimalism

**Key principles for the RPPL library:**
1. Truth-based, not institution-based — recommend what WORKS based on evidence and first-principles reasoning, not what authorities say
2. Include unconventional/non-mainstream approaches with real evidence alongside conventional ones
3. No single orthodoxy — present multiple valid approaches and let the user's own data validate what works for THEM
4. Culturally aware — patterns should work across cultural contexts or be tagged for specific contexts
5. Accessible at every level — patterns for someone with $20/week AND someone with $20K/month
6. Challenge assumptions when evidence supports it — foundational axioms (germ theory vs. terrain theory, food pyramid, sleep norms) should be examined, not blindly accepted
7. The RPPL library is built INCREMENTALLY — seed with the highest-impact patterns first, expand through research and eventually user contribution

**MVP seed strategy:** Start with 20-30 high-impact patterns across the most common life situations (career transitions, health basics, financial foundations, relationship maintenance, daily rhythm design). Expand aggressively from there. The full library is a years-long effort that accelerates as users contribute.

### Result
No visible change yet — infrastructure. But enables provenance display in Grow page and pattern recommendations during onboarding/conversation.

---

## Phase 5: Grow Page — Evidence View
**Impact: Medium (retention/confidence) | Complexity: Medium | Soft dependency on Phase 4**

Replace PatternCards with plain-language evidence statements.

### Files to edit

**`app/src/app/grow/page.tsx`** (~293 lines):
- Update stage headlines (~lines 96-101):
  - "Getting started" → "Building the picture"
  - "What's showing up" → "Patterns emerging"
  - "Connections forming" → "Evidence building"  
  - "Your patterns" → "What the evidence shows"
- Pass new `displayMode="evidence"` prop to PatternSection/PatternCard components.

**`app/src/components/grow/PatternCard.tsx`** — add evidence display mode:
- When `displayMode="evidence"`: render as a plain-language statement
  - "Your evening cooking routine is confirmed — 26 of 30 days."
  - Below: "And the nights you cook, you sleep 45 minutes more." (if correlation data available)
  - Expandable: sparkline + detailed data
- Show provenance if available (from Phase 4): "Based on: CBT-I sleep hygiene" or "Discovered from your data"

**`app/src/components/grow/PatternSection.tsx`** — rename section titles:
- "Validated" → "Confirmed — you have proof"
- "Working" → "Building — the signal is getting stronger"
- "Finding" → "Watching — just started tracking"

### Result
Grow page reads as evidence statements that build confidence: "Is what I'm doing working? Here's proof." Three tiers with expandable detail. Provenance visible when available.

---

## Phase 6: Whole Page Simplification
**Impact: Medium | Complexity: Medium-Large | Soft dependency on Phase 4 (Pathway type)**

Simplify from three-view (brief/map/manage) to one clear "life design" view.

### Files to edit

**`app/src/app/whole/page.tsx`** (~439 lines):
- Remove brief/map toggle (~lines 71-96)
- Remove manage mode toggle (~lines 98-110)
- Single view structure:
  1. **Desires** — aspirations listed as sentences with status (top section)
  2. **Pathway** — if Pathway data exists, show current stage and what's next (middle section)
  3. **Chosen patterns** — summary list with evidence status (bottom section)
  4. **Connections** — simplified list view of dimension connections (replaces D3 force-directed graph)
- Move to settings: ProfileBanner, ContextPortrait, LifeProfile, ArchetypeSelector

**`app/src/components/whole/SettingsSheet.tsx`** — expand to include profile/context editing sections that were previously on the main page.

**`app/src/hooks/useWhole.ts`** — simplify returned state (keep data, remove view toggle logic).

### Result
One clear view: desires → pathway → patterns → connections. Profile editing behind settings. No confusing toggles.

---

## Phase 7: Chat — Contextual Life Design Sessions
**Impact: Medium | Complexity: Medium | Dependencies: Phase 2 (reference conventions)**

Make chat show its contextual awareness and frame as life design sessions.

### Files to edit

**`app/src/app/chat/page.tsx`** (~189 lines):
- Update empty state text (~line 79): "What's on your mind?" → "What are you designing?"
- Add session framing: entry points like "Think through a decision", "Work on a pattern", "Revisit what I want"
- Make `ContextCard` dynamic: show relevant dimension context based on conversation topic

**`app/src/lib/services/prompt-builder.ts`** — add reference conventions to OPEN_MODE prompt: when HUMA references an aspiration or pattern, prefix with a parseable marker so the UI can render inline evidence badges.

**`app/src/hooks/useChat.ts`** — add session type state that influences prompt mode.

### Result
Chat feels like a contextual life design session, not a generic chatbot. Inline references to aspirations/patterns. Dynamic context display.

---

## Shipping Order

```
Phase 1  Landing page rewrite       ← ship first, immediate external impact
Phase 2a Sheet API prompt update    ← changes output shape, test via API  
Phase 2b Today page narrative       ← depends on 2a, biggest user-facing change
Phase 3  Onboarding speed-up        ← independent, high activation impact
Phase 4  RPPL data model            ← infrastructure, no user-visible change
Phase 5  Grow evidence view         ← uses Phase 4 provenance if available
Phase 6  Whole page simplification  ← uses Phase 4 Pathway if available
Phase 7  Chat contextual upgrades   ← lowest priority, builds on everything
```

Phases 1, 2a, 3 can be built in parallel (no dependencies).
Phases 4-7 are independent but benefit from sequencing.

## Verification

After each phase:
1. Run `npm run build` in `/app` to verify no type errors
2. Run dev server and manually verify the changed page renders correctly
3. For Phase 2a: test the sheet API independently with a sample POST request
4. For Phase 1: verify landing page on mobile and desktop viewport sizes
5. For Phase 4: run Supabase migration against dev database, verify existing data is preserved

# HUMA V2 Foundation

_The source of truth for what HUMA is, how it works, and what operators see. Updated April 2026. Incorporates the V2.1 artifact-first redesign. The foundational documents remain valid for intellectual lineage, ethics, voice, design language, and RPPL theory._

_Related documents: HUMA_VISION_AND_STRATEGY.md (strategic vision, intellectual lineage), HUMA_CONVERSATION_ARCHITECTURE.md (AI conversation spec), HUMA_DESIGN_SYSTEM.md (visual spec), HUMA_VOICE_BIBLE.md (voice spec), HUMA_ETHICAL_FRAMEWORK.md (edge cases, sovereignty)._

---

## What HUMA Is

HUMA is infrastructure for running your life as one connected system.

Not a wellness app. Not a life design tool. Not a coach. Not a dashboard. Infrastructure — like Google Maps is infrastructure for navigation, like spreadsheets are infrastructure for financial thinking. You don't use HUMA to improve yourself. You use it because your life runs better with it than without it.

Today there is no infrastructure for the whole of a human life. There are apps for fragments — fitness, finance, habits, therapy, productivity, meal planning, calendars. Each one sees one slice. None of them talk to each other. None of them can show you that your spending stress is causing the insomnia that's causing the missed workouts that's causing the low mood that's causing the spending. You manage symptoms in silos. You experience cascades but you can't see them.

HUMA sees the whole. It holds the structured map of how your life actually connects, computes across it, and produces daily outputs that reduce your cognitive load. The deeper your context, the less you have to think.

**Nine-word tagline:** See the whole. Find the leverage. Practice what works.

---

## The Core Insight

Every product that achieved civilization-scale adoption delivers a capability, not a curriculum. Google didn't ask you to become a better searcher. Maps didn't ask you to develop spatial awareness. Spreadsheets didn't ask you to learn systems thinking. They just worked. You didn't rise to the product. The product lifted you where you are.

HUMA doesn't ask people to design their lives. It doesn't ask them to develop pattern literacy. It doesn't ask them to see connections between dimensions. It just runs their life better — and the seeing develops as a byproduct of using it.

The person who follows HUMA's production sheet for 3 months and then notices "wait, every time I cook dinner, everything else in my evening works better" — that person just learned what a Node is without ever hearing the word. The capacity developed through use, not instruction.

**What HUMA does that no other app can:** Show you how the different parts of your life are connected — and which specific daily behaviors are the leverage points that hold everything together. Fitbit knows your body. YNAB knows your money. Todoist knows your tasks. None of them can tell you that cooking dinner at home is the keystone behavior that produces better sleep, lower spending, more time with your partner, AND a cleaner kitchen. They can't because they each only see one dimension. HUMA sees all eight.

---

## The Three Product Layers

_Note: HUMA_VISION_AND_STRATEGY.md defines three **strategic** layers (Notation / Mediums / Commons) describing how HUMA's knowledge system scales. The three layers below are **product** layers describing how the app works for an individual operator. Different scopes, complementary concepts._

### Layer 1: Conversation (how HUMA learns you)

Voice or text. Natural language. No forms, no sliders, no onboarding screens to navigate.

The entry is: **"What's going on?"** Open. One prompt. The operator talks or types whatever is on their mind. "I'm exhausted." "I want to eat better." "I need to get out of debt." "I don't know what I'm doing with my life." HUMA listens, structures what was said, and responds with the first useful output — a decomposition of that one thing, turned into specific behaviors for tomorrow.

Every statement is context that HUMA structures and stores. Context enters through conversation, not onboarding flows. The operator talks to HUMA like a trusted friend who knows their whole life and never forgets.

**The Palette:** A browseable library of tappable concepts — pain points and aspirations organized by life dimension. The PrepBoard model: the palette updates based on what's already in the system. The person who can't articulate what they want browses the palette and discovers options they didn't know existed. The person who knows exactly what they want ignores the palette and just talks. Both paths work. Neither is gated.

The palette solves the nescience problem — people don't know life design is a thing, so they don't know what to ask for. The palette shows them what's possible.

**Key principle:** Conversation is an input method, not the product. The operator's primary experience is their system and their production sheet — not a chat log. Conversations are ephemeral interactions that produce structured outputs. They don't pile up as the primary artifact.

### Layer 2: Computation (how HUMA thinks)

Invisible to the operator. This is RPPL doing real work.

**Decomposition:** Every aspiration gets broken into a chain — what it means for this person → what behaviors make it true → what dimensions those behaviors touch → how those behaviors connect to other aspirations' behaviors.

"I want to eat clean" →
- Means: animal-based/keto, for a family of two →
- Behaviors: meal prep Sunday, cook at home 4 nights, no processed snacks, shop at farmers market Saturday →
- Dimensions touched: Body (nutrition), Money (grocery spending), Home (kitchen as workspace), Joy (cooking as shared activity), People (cooking together) →
- Connections: "cook at home" also serves the "more time together" aspiration; "farmers market" also serves the "connect to local community" aspiration if it exists

One aspiration, decomposed, touches five dimensions and connects to other aspirations through shared behaviors. The operator didn't map any of this. HUMA computed it from the structure of the decomposition.

**Structural insight (Day 1):** The decomposition chain itself reveals which behavior touches the most dimensions and which behaviors are shared across aspirations. This requires NO behavioral data — only the decomposition structure. The day the operator's first aspiration is decomposed, HUMA can say: "Cook at home touches Body, Money, Joy, People, and Home — 5 of your 8 dimensions from one behavior. That's your most connected move."

**Cross-dimensional correlation (Week 2+):** After enough behavior data, HUMA computes correlations. On days you did morning movement, you also completed family behaviors 90% of the time. On days you didn't, family behaviors dropped to 30%. The morning walk is the keystone — it holds up everything else. This insight is computed from checkbox data cross-referenced through decomposition chains. No self-reporting. No evening review. No journaling.

**Pattern matching (Future):** HUMA matches the operator's context and behaviors against the knowledge commons. "For people with your pattern — family of two, rural, building stage, high Living capital, low Financial — the highest-leverage behavior is X, validated by Y people over Z months." This requires scale and comes later, but the architecture supports it from day one.

**Compilation:** All of the above compiles into the daily production sheet. What to do today, computed from decomposed aspirations, adjusted for the day of the week, what's in the freezer, what's coming up, what worked and didn't work last week.

### Layer 3: Output (how HUMA serves you)

What you see during the day. Glanceable. Actionable. Zero cognitive load.

**The daily production sheet.** Mobile-first. Morning notification: "Your day." Open it. See 3-5 things. Not abstract behaviors — specific actions.

Not "cook at home tonight." Instead: "Beef stew — you have the bone broth from Sunday and there's chuck in the freezer. One pot. Feeds you both for two nights. Recipe here."

Not "do morning movement." Instead: "20-minute walk. It's 28°F but sunny by 9am. Go then."

Not "stay on budget." Instead: "No purchases today. Electric bill comes Friday — you're covered if you hold."

Each item is tappable for more detail. Check it off when done. The checking off IS the data collection — no separate tracking step. Check-offs produce visible feedback: "Cooked at home · 3 of 4 days this week."

**The insight card.** Structural insights available from Day 1 (from decomposition). Behavioral insights after 5+ days of check-off data. One cross-dimensional observation. Specific. Connecting something the operator didn't consciously link.

**The system view.** The visible artifact — the structured, connected representation of aspirations, behaviors, dimensions, and connections. Materializes from conversation and grows with use. The operator can see, browse, edit, and extend their system at any time.

**The Living Canvas** (`/map/[id]` — implemented). Spatial SVG visualization of the operator's life system, rendered by the `canvas/` component family (SpatialCanvas, SpatialEssence, SpatialRing, CapitalRadar, WeeklyRhythm). Shareable via unique URL with dynamic OG image generation (`/api/og`). Cached in Redis with Supabase fallback. Sample maps available at `/map/sample`.

---

## The Product Surface

### Design Principle

**Open → see your system → use what it produces → close. The system gets smarter every time you touch it.**

The operator spends **10 seconds** most mornings (glance at production sheet, check off what they do). **2 minutes** when adding context (quick input, structured immediately). **5 minutes** weekly exploring their system (browse connections, add aspirations, review what's working).

The artifact (the life system) is visible and central. Conversation is one input method. The palette is another. The production sheet is one output. Insights are another. The system view is where it all lives.

### Three Screens

**Screen 1: TODAY** (home screen — `/today`)
The bakery production sheet. What you see when you open HUMA.
- Date header, aspiration ribbon (scrollable pills showing active aspirations)
- Insight card (structural or behavioral, when available)
- Production sheet cards (3-5 items, collapsible detail, checkable, dimension tags)
- Check-off feedback: counters showing behavioral accumulation ("Day 3 of cooking at home")
- Prompt bar: persistent input that opens a conversation sheet overlay for quick context additions

**Screen 2: WHOLE** (the visible artifact — `/whole`)
The holonic life map. Force-directed visualization of your life as a connected system.
- Identity nucleus with archetypes and WHY statement
- Aspiration nodes (patterns/vision layer) with dimensional coloring
- Principle nodes (guiding values)
- Foundation context nodes (place, work, stage, health)
- Expandable detail panels for each node
- Insight card when behavioral data supports it

**Screen 3: GROW** (`/grow` — implemented)
The growth and pattern space. Grouped patterns with validation progress, correlation cards, completion stats, and sparkline trends. Pattern extraction runs against behavior logs to surface emerging behavioral patterns.

**Chat** (conversation tool — `/chat`, accessible via overlay)
For longer conversations that don't fit a quick bottom-sheet exchange.
- Context card at top (what HUMA knows)
- Latest exchange displayed fully, with "Context added: [fact]" when context was extracted
- Past exchanges as collapsed one-line summaries with dates (not a chat log)
- Input field at bottom

**Conversation Sheet** (bottom sheet overlay — available from any tab)
- Slides up from the floating chat button on Today or Whole
- Quick context additions: "We got a chest freezer" / "I'm off Wednesdays now"
- HUMA responds, extracts context, the sheet dismisses
- Ephemeral interaction that produces structured output

**Navigation:** Today | Whole | Grow (bottom tab bar). Today is home. Chat is a floating overlay, not a tab. Tab bar hidden during the entry flow at `/start`.

### The Entry Flow (`/start`)

"What's going on?" → conversation → clarification (tappable options) → decomposition into behaviors → "Start this Sunday" → auth (magic link) → redirect to `/today`.

The conversation produces structured data: an aspiration record, behavior records with dimensional mappings, and extracted context. This data populates the Whole screen immediately — the operator's first visit shows their life system already taking shape.

---

## How Context Deepens (Without Forms)

Context builds gradually through use and conversation. The operator never fills out a profile. They just live, and HUMA learns.

**Day 1:** Almost no context. HUMA knows a name and 2-3 aspirations. The production sheet is generic but useful. The structural insight is available (from decomposition, no behavioral data needed).

**Week 1:** HUMA knows daily patterns from production sheet usage — which days are busy, which meals get cooked, which behaviors stick and which get skipped. The production sheet starts adapting.

**Month 1:** HUMA knows the freezer inventory (mentioned in conversation), the budget constraints, the family dynamics, the schedule. The production sheet is deeply specific.

**Month 3:** HUMA knows the seasonal rhythms, the financial cycles, the energy patterns across the week, which behaviors are keystones and which are fragile. The production sheet is orchestrated.

**Key principle:** Every piece of context the operator shares makes the production sheet better. The operator experiences this directly. This creates a natural, selfish motivation to share more. Not because HUMA asks, but because the value exchange is obvious.

**Key principle:** The operator controls the context. HUMA never scrapes, surveils, or infers from external data sources. Every piece of context is a gift, freely given because the operator got value back. This is the sovereignty principle in practice.

---

## How HUMA Is Different From an LLM

Claude can have a brilliant conversation about your life. But:

- It forgets tomorrow. HUMA compounds forever.
- It has no structure. HUMA has RPPL — decomposition chains that make life patterns machine-readable and computable.
- It can't track behavior across weeks. HUMA builds a behavioral dataset from daily production sheet usage.
- It can't compute cross-dimensional correlations. HUMA cross-references behavior data through decomposition chains to find connections the operator can't see.
- It can't compile knowledge across people. HUMA's pattern economy turns one person's validated behaviors into transferable templates for the next person.

An LLM is a brain without memory or methodology. HUMA is a methodology with a brain. The LLM powers the conversation layer. RPPL powers the computation layer. Together they produce something neither can produce alone.

---

## The Growth Engine

### Entry Point

**"What's going on?"** Not "design your life." Not "rate your dimensions." Not a selection screen. An open prompt.

The operator says whatever they say. HUMA responds with immediate value — structuring what they said, beginning to decompose it, and producing the first useful output within 2 minutes.

### The Viral Loop

The share moment is a specific, concrete, surprising insight:

"HUMA showed me that cooking dinner is the single behavior that holds my entire evening together — family time, sleep, budget, everything. I had no idea."

Screenshot. Text to a friend. The friend thinks: "what would it show ME?" Downloads HUMA. States their aspiration. Gets their production sheet. Gets their first insight. Shares it.

The loop: aspiration → production sheet → behavior data → surprising insight → share → friend downloads → repeat.

### The Template/Fork Model (Future)

Pre-decomposed aspiration bundles, validated by real operators:
- "Animal-based keto, family of two, under $150/week, Michigan"
- "Morning movement habit, 20 min, zero equipment, winter-adapted"
- "Debt paydown while building a side income"

Browse by situation, by bioregion, by life stage. Tap to fork. Customize for your specifics. This is the Bullipedia model.

### Situation Entry Points (Future — SEO + Growth)

Pain-specific landing pages: "Just lost my job." "New parent, no sleep." "Drowning in debt." "Career change at 40." Each leads to a pre-populated aspiration bundle.

---

## The Pattern Economy

One person's life OS is useful. A million people's behavioral data, anonymized and structured through RPPL decomposition chains, is a new kind of knowledge.

"For single parents in urban areas with incomes under $50K, the single highest-leverage daily behavior is X — validated by 12,000 people over 8 months."

This knowledge doesn't exist anywhere. Not in research. Not in self-help books. Not in therapy. It's computed from real behavioral data flowing through standardized decomposition chains. It gets better with every operator, which means every operator makes HUMA more valuable for the next one. That's the network effect.

---

## Pricing

**Free forever:** Conversation with HUMA. Up to 3 aspirations decomposed. Basic daily production sheet. Weekly view. One insight when data supports it. Template browsing.

**$29/month Operate:** Unlimited aspirations. Full cross-dimensional computation. Deep production sheet (specific recipes, specific financial actions, seasonal planning). Pattern commons access. Canvas view. Template publishing.

**$99/month Professional:** Multi-context management (clients, students, patients). Professional dashboard. Bulk template creation. API access.

---

## What Stays From V1

- **Tech stack:** Next.js 14+, TypeScript, Tailwind, Claude API, Supabase, Vercel
- **RPPL:** The five primitives (Essences, Patterns, Fields, Nodes, Transformers) are the computation layer
- **8 Forms of Capital:** The dimensional framework — now computed from behavior, not self-reported
- **Sovereignty principles:** All of them. Context through gift, not surveillance
- **Ethical framework:** Dependency test, graduation imperative, distress protocol
- **Voice Bible:** Fence-post neighbor. Every word matters. No jargon
- **Design system:** Sand/sage/amber/sky palette. Cormorant Garamond + Source Sans 3
- **Intellectual lineage:** All 9 source traditions

---

## The Test

The product works when someone:
1. States an aspiration
2. Sees their system materialize — aspiration, behaviors, connections, dimensions
3. Gets a production sheet that feels personal
4. Checks things off and sees the data accumulate visibly
5. Opens the Whole tab and sees their life becoming structured — without having designed anything
6. Browses the palette and discovers something they didn't know they wanted
7. Receives an insight that connects two parts of their life they didn't know were related
8. Screenshots that insight and texts it to a friend

The paradigm breaks one production sheet at a time. But what makes them stay is watching their system grow.

---

## What This Changes About the World

Nothing about this requires people to improve themselves, develop new capacities, or learn a framework. They just run their lives through HUMA because it's easier than not doing so. The seeing develops as a byproduct. The capacity grows through use. The pattern literacy emerges without being taught.

When a million people are running their lives through HUMA, the knowledge commons contains validated, structured, contextual knowledge about how human lives actually work — what behaviors cascade, what dimensions couple, what leverage points exist for specific contexts. That knowledge changes policy, community design, education, medicine.

The renaissance happens not because people decided to be better, but because the infrastructure made wholeness the path of least resistance.

See the whole. Find the leverage. Practice what works.

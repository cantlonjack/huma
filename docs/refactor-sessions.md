# HUMA — Build Plan

This replaces the previous 8-session refactor plan. That plan fixed a habit tracker.
This plan builds the product described in the product handoff document.

The core insight: **The context model is the product.** Everything else — daily sheets,
decision support, proactive nudges, pattern recognition — is an output of a rich,
structured understanding of the user's whole life. If the context model is deep and
accurate, everything downstream gets better automatically.

---

## Phase 1: The Context Model (Sessions 1-3)

Right now, `known_context` is a flat JSON blob extracted as a side effect of conversation.
It needs to become the structured, queryable foundation that every other feature reads from.

### Session 1: Redesign the Context Data Model

**Goal:** A structured context model that can hold someone's entire life situation and
be reasoned against.

**Current state:** `known_context` is `Record<string, any>` — untyped, flat, no relations.
Example: `{ "location": "Michigan", "household_size": 3, "food_budget": "$400/month" }`

**Target state:** A typed, relational context model organized by the 8 dimensions.
Each dimension has structured fields with source tracking (where did we learn this?)
and confidence (inferred vs. explicitly stated).

```typescript
interface HumaContext {
  // WHO
  identity: {
    name?: string
    archetype?: string[]
    why_statement?: string
    values?: string[]
    skills?: Skill[]        // { name, level: learning|competent|expert, source }
    gaps?: string[]          // things they need to learn
  }

  // WHERE & WHAT
  body: {
    conditions?: string[]    // "bad knee", "chronic fatigue"
    capacity?: string        // activity level
    sleep?: string
  }
  home: {
    location?: string
    type?: string            // "apartment", "house", "homestead", "land"
    resources?: Resource[]   // { name, detail } — "slow cooker", "garage gym", "2 acres"
    infrastructure?: string[]
  }

  // WHO ELSE
  people: {
    household?: Person[]     // { name, relationship, age?, detail? }
    community?: string[]     // "neighbor with coyote problems", "local farmers market"
    professional?: string[]  // "accountant", "mentor in cheese-making"
  }

  // MONEY
  money: {
    income?: string
    constraints?: string[]   // "$400/month food budget"
    enterprises?: Enterprise[]  // active or planned income streams
    debt?: string
    investments?: string
    financial_goal?: string
  }

  // TIME & ENERGY
  growth: {
    current_learning?: string[]
    interests?: string[]
    time_blocks?: TimeBlock[]  // { day, time, available_minutes, notes }
  }
  joy: {
    sources?: string[]       // what brings them joy
    drains?: string[]        // what depletes them
  }
  purpose: {
    aspirations?: string[]   // high-level, not decomposed behaviors
    contribution?: string    // how they want to serve
    vision_20yr?: string
  }

  // TEMPORAL
  temporal: {
    upcoming?: TimelineItem[]    // { what, when, source: "plan"|"seasonal"|"user" }
    overdue?: TimelineItem[]
    seasonal?: string            // current season + implications for their context
    milestones?: Milestone[]     // { name, target_date, status, dependencies }
  }

  // DECISIONS
  decisions: Decision[]  // { date, description, reasoning, frameworks_surfaced, outcome?, outcome_date? }

  // META
  _sources: ContextSource[]  // { field_path, value, source: "conversation"|"inferred"|"explicit", date, message_id? }
  _last_updated: string
}
```

**What to build:**
1. Define this type in `types/context.ts`
2. Create `lib/context-model.ts` with:
   - `mergeContext(existing, extracted)` — deep merge with conflict resolution (explicit > inferred, newer > older)
   - `queryContext(context, dimension)` — get everything known about a dimension
   - `contextCompleteness(context)` — what % of fields have values? which dimensions are sparse?
   - `contextForPrompt(context)` — flatten to prose for Claude injection ("Jack lives in Michigan with his wife Sarah and daughter Lena (age 4). They have 2 acres, a slow cooker, and a $400/month food budget...")
3. Migrate existing `known_context` data to the new shape
4. Update the v2-chat context extraction to populate the structured model instead of a flat blob

**What NOT to build yet:** Don't build a UI for editing context. The conversation is the input. The model is the output.

**Success test:** After a 5-message conversation, print the context model. It should read like a brief about a person you know well.

---

### Session 2: Make Conversation Build Context, Not Just Decompose

**Goal:** The conversation's primary job is building the context model. Decomposition
into behaviors is a secondary output that happens naturally once context is rich enough.

**Current state:** The v2-chat prompt is laser-focused on decomposing one aspiration into
behaviors. It asks 3-7 clarifying questions, then outputs a `[[DECOMPOSITION:{...}]]`.
This misses the bigger picture — the user's WHOLE situation.

**Target state:** The conversation has two modes:
1. **Open mode** (default): "What's going on?" — builds context across all dimensions.
   HUMA asks about whatever dimension is most sparse. If it knows nothing about money,
   it eventually asks about money. If it knows nothing about household, it asks about that.
   This isn't an interrogation — it's a natural conversation that happens to fill in the model.
2. **Focus mode** (triggered by user or by enough context): "Let's make a plan for X" —
   decomposes a specific aspiration into behaviors using the FULL context model.

**What to build:**
1. Rewrite the v2-chat system prompt to prioritize context building:
   - Claude receives the current context model (via `contextForPrompt()`)
   - Claude receives a "context completeness" hint: "You know a lot about their home
     and body, but almost nothing about their finances or relationships."
   - Claude's job: have a natural conversation that fills in gaps. Don't interrogate.
     Follow the user's lead but gently explore sparse dimensions.
   - When the user says something that implies an aspiration ("I want to...", "I'm trying to..."),
     Claude can offer to decompose it — but only if the context is rich enough to make
     the decomposition specific.
2. Update context extraction to populate the structured model after each message.
3. Add a "readiness check" — before decomposing, verify the context has enough info
   to make behaviors specific. If not, ask the missing questions first.
   Example: User says "I want to eat better." Context has no household_size, no budget,
   no kitchen resources. HUMA says: "I can help with that. Quick question — how many
   people are you cooking for?" NOT "[[DECOMPOSITION:...]]" with generic behaviors.
4. Show the user their context is growing. After each exchange, a subtle indicator:
   "HUMA now knows: home, body, people" (dimensions with meaningful data).
   Not a progress bar. Just acknowledgment that the conversation is producing something.

**What NOT to build:**
- Don't remove decomposition. It still happens. It just happens AFTER context is rich.
- Don't force users through a context-building phase. If someone says "I want to run 3x/week"
  and that's all they want, decompose it. But the decomposition will be generic because
  the context is thin.

**Success test:** Have a 10-message conversation about your life without once asking HUMA
to decompose anything. At the end, the context model should have data in 5+ dimensions.
Then ask HUMA to help you plan something — the plan should reference specific details
from the conversation.

---

### Session 3: The Context View (Reimagined Whole Page)

**Goal:** The Whole page shows the user their context model — everything HUMA knows about
them — organized by dimension, and highlights what's sparse, what's strong, and what
the connections are.

**Current state:** The Whole page shows a force-directed graph and a capital radar. These
are abstract. A user can't look at them and say "HUMA knows my situation."

**Target state:** The Whole page is a living document — like looking at a brief about
yourself. It should feel like the holistic context document from the April 4 session:
structured, readable, comprehensive, and obviously informed by YOUR details.

**What to build:**
1. Replace the force-directed graph as the default view with a structured context display:
   - Each dimension gets a section with a heading and the known facts rendered as prose
   - Sparse dimensions show as "HUMA doesn't know much about your [money/people/etc.] yet"
     with a subtle prompt to fill it in
   - Strong dimensions show the rich detail: "You live in Michigan with Sarah and Lena (4).
     You have 2 acres with sandy soil, a 3-season garden, and a slow cooker."
2. The WHY statement at the top, if it exists
3. Below the context: aspirations list with current status and completion rates
4. Below aspirations: active patterns (validated ones only — the proven operating system)
5. Keep the dimensional shape as a SMALL visual element (top corner) — a glanceable
   summary, not the centerpiece
6. Keep the force-directed graph accessible via a "Map view" toggle for users who want it
7. Add a "Tell HUMA more" button per dimension that opens chat focused on that dimension

**Design direction:**
- This page should feel like reading a well-organized document about yourself
- Think: the "about" page of your life, written by someone who knows you
- Progressive disclosure: headline per dimension, tap to expand full detail
- The page should make the user feel KNOWN, not measured

**Success test:** A user opens Whole and says "yeah, that's me" — and can point to
something specific that proves HUMA understood a detail about their life. And they can
also see clearly what HUMA DOESN'T know yet.

---

## Phase 2: Decision Support & Proactive Value (Sessions 4-6)

With a rich context model, HUMA can now do the things that make it different from
every other app: reason from your whole context, surface what you can't see, and
help you decide well.

### Session 4: Decision Mode

**Goal:** A user can bring any decision to HUMA and get guidance filtered through their
whole context.

**The $3,000 sheep shelter example from the handoff doc is the benchmark.** User asks a
question. HUMA invisibly runs the decision frameworks (weak link, marginal reaction,
sustainability, financial fit) against their context. User gets back guidance that
references THEIR specifics, not generic advice.

**What to build:**
1. A "decision" chat mode. User can open chat and say "I'm thinking about X" or
   explicitly tap a "Help me decide" button.
2. Update the system prompt for decision mode:
   - Inject the FULL context model
   - Inject the seven Holistic Management testing questions as invisible framework
     (Claude runs these internally, surfaces only the 1-2 most relevant tensions):
     1. Cause & Effect: "Is this addressing the root cause or a symptom?"
     2. Weak Link: "Is this the current bottleneck (social, biological, or financial)? Does this address it?"
     3. Marginal Reaction: "Where does the next dollar/hour produce the greatest return right now? Is this the best use of this resource?"
     4. Gross Profit Analysis: "How does this rank against alternatives in return per unit of management attention?"
     5. Energy Source: "Is this running on renewable inputs (skills, relationships, land) or purchased/depleting inputs?"
     6. Sustainability: "Does this leave the resource base (health, relationships, finances, land, skills) in better or worse condition?"
     7. Society & Culture: "Does this align with their values, their household, and their community?"
   - Plus whole-context fit: "Does this align with the WHY, the 20-year vision, the current constraints and financial plan?"
   - Claude's response should surface 1-2 of these tensions naturally in conversation.
     Not all seven. Not as a checklist. As genuine observations:
     "That could work. One thing worth considering — you mentioned wanting a barn in Year 4..."
3. No new UI needed beyond the chat. Decision mode is a conversation, not a form.
4. After a decision is made, HUMA logs it in the context model:
   ```typescript
   interface Decision {
     date: string
     description: string        // "Decided to build temporary sheep shelter instead of permanent"
     reasoning: string          // "Saves $2,200 for barn fund. Temporary solution gets through winter."
     frameworks_surfaced: string[]  // ["weak_link", "marginal_reaction"]
     outcome?: string           // filled in later when HUMA follows up
     outcome_date?: string
   }
   ```
   This becomes part of the persistent context — future decisions can reference past ones.
   HUMA periodically follows up on logged decisions: "You decided to [X] six weeks ago.
   How did that work out?" The answer updates the decision record and informs future guidance.

**What NOT to build:**
- Don't build a "decision matrix" UI. The frameworks are invisible. The output is conversation.
- Don't require the user to categorize their decision. HUMA should detect "I'm thinking about..."
  naturally.

**Success test:** Describe a real decision you're facing. HUMA's response should reference
at least 2 specific details from your context that a generic chatbot wouldn't know.
The response should feel like the April 4 session — not "here are your options" but
"given your sandy soil, your Year 4 barn plan, and the baby arriving in October,
here's what I'd be thinking about."

---

### Session 5: Proactive Daily Value (Reimagined Today Page)

**Goal:** The Today page shows the daily sheet PLUS 0-2 proactive nudges that demonstrate
HUMA is thinking about your life even when you're not talking to it.

**The handoff doc describes three types of proactive engagement:**
1. Temporal nudges (time-sensitive based on plan/season/calendar)
2. Pattern recognition (trends you can't see because you're too close)
3. Opportunity surfacing (connections you haven't made)

**What to build:**
1. Keep the stripped-down daily sheet (3-5 behaviors, grouped by time-of-day, checkboxes).
   This is the Session 1 work from the old plan — still valid.
2. Add a nudge slot above or below the sheet. Max 1-2 nudges per day. Examples:
   - Temporal: "Lena's school break starts next week. Your sheet will adjust — more family
     time blocks, less solo morning time."
   - Pattern: "You've cooked at home 12 of the last 14 days. Your food spending is down ~$180
     this month."
   - Opportunity: "You have leftover roast chicken and Sarah mentioned wanting meal prep help.
     Sunday batch cook?"
3. **Build a temporal model** in the context. HUMA needs to know what's due, overdue,
   and coming — not just what season it is. Add to the context model:
   ```typescript
   temporal: {
     upcoming: TimelineItem[]    // { what, when, source: "plan"|"seasonal"|"user" }
     overdue: TimelineItem[]     // items past their target date
     seasonal: string            // current season + what it implies for their context
     milestones: Milestone[]     // { name, target_date, status, dependencies }
   }
   ```
   Temporal items come from: the user's financial plan ("barn in Year 4"), seasonal
   defaults ("order pullets by March for June delivery"), behavioral patterns ("soil test
   due every spring"), and explicit user input ("baby arriving in October").
4. Nudge generation: Run a lightweight check when compiling the daily sheet.
   - Check temporal model for due/overdue items
   - Check behavior streaks and breaks
   - Check context for upcoming events or unaddressed items
   - Check decision log for decisions due for follow-up
   - Use Haiku (fast/cheap) to generate 0-2 nudges given context + recent history
4. Nudges are dismissable. Tap to dismiss. HUMA learns which types the user engages with.
5. After checking off behaviors, show the one-line capital pulse:
   "Today moved Body and Money. Growth hasn't been touched in 5 days."

**What NOT to build:**
- Don't build push notifications yet. Nudges appear when the user opens the app.
- Don't over-generate. Zero nudges is better than annoying nudges. Start conservative.

**Success test:** Open Today on a real day. The nudge should reference something specific
about your life that you didn't explicitly ask about, and it should be useful.

---

### Session 6: Make Grow Useful from Day 1

**Goal:** Grow shows behavioral intelligence from Day 1, not just pattern cards after Day 14.

**What to build (progressive disclosure based on data depth):**

1. **Day 1-3:** Simple completion stats. "You checked off 3/5 behaviors today."
   Plus: a preview of what patterns look like when they form (sample card, clearly labeled
   as example). "After a week, HUMA will show you which behaviors naturally go together."

2. **Day 4-7:** Behavior frequency. "Cooking at home: 5/5 days. Running: 2/5 days.
   Journaling: 0/5 days." Simple, honest, no judgment.

3. **Day 7-14:** Emerging correlations. "When you run in the morning, you cook at home
   90% of the time. When you skip running, cooking drops to 40%." This is the first
   real insight — don't wait for "validated pattern" status to show it.

4. **Day 14+:** Current pattern system (finding/working/validated) with full sparklines
   and the pattern recipe format: "Morning Lever: Run → Shower → Journal. This sequence
   held 18 of 22 weekdays. When you skip the run, journaling drops to 30%."

5. **Celebrated validation:** When a pattern reaches "validated," mark it clearly:
   "You've proven this works. It's part of your operating system now." Not confetti.
   Just acknowledgment of a real discovery.

**Success test:** A user on Day 3 opens Grow, sees their stats, and thinks "I want to
see what this looks like after a week."

---

## Phase 3: Polish & Feedback (Sessions 7-9)

### Session 7: Feedback Loops

**Goal:** Users can correct HUMA's understanding and see it learn.

1. Dimension corrections on behaviors (add/remove dimension mappings)
2. Context corrections ("That's not right" on any context field)
3. Decision review: "How did that decision work out?" — HUMA asks periodically about
   past decisions, updating the context model with outcomes
4. Store corrections as training signal — original AI mapping + user correction

### Session 8: Resilience & Error Handling

**Goal:** Nothing silently fails.

1. Marker extraction retry + fallback parser
2. Manual decomposition path if AI fails
3. Visible error states everywhere
4. Context extraction failure logging

### Session 9: Service Extraction & Tests

**Goal:** Engineering quality that makes future iteration fast.

1. Extract services from fat API routes
2. Split fat components
3. Integration tests for: conversation → context building, sheet compilation, decision mode
4. Delete dead code (v1 chat, unused Supabase clients)

---

## What This Plan Doesn't Include (Yet)

These are real and important but premature:

- **Wisdom accumulation / pattern commons** — needs 100+ users with months of data
- **Protocol / open-source RPPL** — needs a proven product first
- **Domain-specific modules** (homesteading, small business, health) — build the general
  engine first, specialize later
- **Multi-generational context transfer** ("hand it to your children") — needs years of
  proven value first
- **The board game, the book, the curriculum** — these are distribution channels for a
  product that doesn't exist yet

Build the product. Prove it works. Then expand.

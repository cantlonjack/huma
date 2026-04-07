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

### Session 7: Feedback Loops & QoL Validation

**Goal:** Users can correct HUMA's understanding, and every aspiration has a validation
question that keeps the system honest.

**The problem (feedback):** HUMA assigns dimensions to behaviors (running → Body, Joy)
and the user cannot dispute this. ContextPortrait lets users edit/remove context fields,
but there's no way to correct dimension mappings, no "that's not right" for behaviors,
and no undo after deletion. The system asserts things about your life with no mechanism
for you to say "actually, no."

**The problem (validation):** The Aspiration type (`types/v2.ts:88-103`) has no
`validationQuestion` field, no `failureResponse`, no threshold for auto-pausing.
The tech spec's best idea — QoL validation ("How many evenings were genuinely free
this week?" → always systemic, never personal) — was never built. Without it, HUMA
can't tell the difference between "this aspiration is working" and "this person stopped
opening the app."

**What to build:**

1. **Add QoL validation fields to the Aspiration type** (`types/v2.ts`):
   ```typescript
   validationQuestion?: string;     // "How many evenings were genuinely free?"
   validationTarget?: string;       // "5 or more out of 7"
   validationFrequency?: "weekly" | "biweekly" | "monthly";
   failureResponse?: string;        // systemic, never personal
   ```
   During decomposition (FOCUS_MODE in `v2-chat/route.ts`), instruct Claude to generate
   these fields alongside behaviors. The prompt should say: "For every aspiration, generate
   a validation question the operator can answer in 5 seconds, a concrete target, and a
   systemic failure explanation that looks at the system, never at the person."

2. **Add a weekly validation check.** When the user opens Today on their validation day
   (default: Sunday), show a card per active aspiration:
   - The validation question
   - Quick-tap answer (number input or yes/no)
   - If below target: show the systemic failure response, not "try harder"
   - Example: "Evenings free: 3 of 7. Below your target of 5. System note: packing
     ran past 3pm three days this week. Consider batching to 2 days instead of 3."
   Store answers in a new `validation_log` table or in the aspiration's behavior_log.

3. **Add dimension correction to behaviors.** In AspirationDetailPanel.tsx (currently
   shows dimensions as read-only colored badges around line 155-165):
   - Make dimension badges tappable
   - Tap a badge → toggle menu: keep / remove / change direction (builds/costs/protects)
   - Add a "+" button to add a missing dimension
   - Store both the original AI mapping AND the user correction:
     ```typescript
     // Add to Behavior interface in types/v2.ts
     dimensionOverrides?: DimensionEffect[];  // user corrections
     ```
   - When rendering or computing, prefer `dimensionOverrides` over `dimensions` if present

4. **Add undo to context deletions.** In ContextPortrait.tsx, when RemoveButton is
   clicked (lines 256, 319, 393, 457):
   - Don't immediately delete. Show a toast: "Removed [field]. Undo?" with a 5-second timer
   - Only commit the deletion after the timer expires
   - This matches the pattern already used for aspiration archival elsewhere in the app

5. **Feed corrections back.** When the sheet compiler (`sheet/route.ts`) builds the daily
   sheet, check for `dimensionOverrides` on behaviors and use those instead of the
   AI-assigned dimensions. When the capital computation runs (`whole-compute`), same thing.
   User corrections should propagate everywhere the original mappings were used.

**What NOT to build:**
- Don't build a full "edit everything" mode. Dimension correction is discoverable via
  tap, not a settings page.
- Don't auto-pause aspirations based on validation scores yet. Surface the data, let
  the user decide. Auto-pause is a v2 feature once you've validated that users actually
  do the weekly check-in.
- Don't build a validation reminder notification. Just show the card when they open Today
  on the right day.

**Success test (feedback):** Change "running → Body, Joy" to "running → Body, Purpose."
Open Today the next day. The sheet's capital pulse should reflect Purpose, not Joy.

**Success test (validation):** Open Today on Sunday. See a validation card for each
aspiration. Answer one below target. The failure response should name a systemic cause,
not say "you didn't try hard enough."

---

### Session 8: Resilience & Error Handling

**Goal:** Nothing silently fails. When Claude misbehaves, the user still gets value.
When the database write fails, the user knows.

**The problem (markers):** The marker system (`[[DECOMPOSITION:{...}]]`) is binary — it
works perfectly or produces nothing. In ChatSheet.tsx, `parseMarkers()` returns null
fields when extraction fails, and the code checks `if (parsedContext)` before using each
one. But there's no USER-FACING indication that markers failed. If Claude returns a
message that clearly describes behaviors but doesn't wrap them in `[[DECOMPOSITION:...]]`,
the user sees a nice chat message and nothing happens. They don't know they were supposed
to get a structured aspiration.

**The problem (silent DB failures):** ChatSheet.tsx has `.catch(() => {})` on Supabase
writes (around lines 40 and 59). Context extraction, aspiration saves, and chat message
persistence all fail silently. The user thinks their data is saved. It might not be.

**The problem (no manual path):** If the AI fails twice to produce a decomposition,
there's no way for the user to manually create an aspiration with behaviors. They're
stuck in conversation mode hoping Claude gets it right next time.

**What to build:**

1. **Marker extraction retry with user prompt.** In ChatSheet.tsx, after `parseMarkers()`
   runs on a completed response:
   - If the response contains behavioral language (keywords: "this week", "every day",
     "try", "start with", "morning", "evening", numbered lists of actions) BUT
     `parsedBehaviors` and `parsedDecomposition` are both null:
   - Show a subtle prompt below the message: "HUMA had ideas but couldn't structure them.
     Tap to retry."
   - On tap: resend the last exchange with an appended system instruction:
     "Please reformat your previous response using the required [[DECOMPOSITION:{...}]]
     marker format."
   - Track retry attempts. Max 1 automatic retry per message.

2. **Fallback manual aspiration builder.** If retry also fails (or if the user dismisses
   the retry prompt), show a minimal form:
   - "What's the aspiration?" — single text input
   - "What are 2-3 things you'd do this week?" — multi-line input, one per line
   - "How often?" — tap: daily / weekly / specific days
   - Submit → creates an Aspiration with Behaviors directly, no AI needed
   - Dimensions are left empty (or auto-assigned based on keyword matching against
     the existing dimension mapping in `template-matcher.ts`)
   - This form should be accessible from the chat UI AND from a "+" button on Today

3. **Surface DB write failures.** Replace `.catch(() => {})` with actual error handling:
   - For context saves: show a small warning icon next to the dimension indicator.
     "Context may not have saved. Tap to retry."
   - For aspiration saves: show a toast. "Aspiration saved locally but couldn't sync.
     Will retry when connection improves."
   - For chat message saves: less critical — log to console, don't bother the user.
   - Store failed writes in a `pendingSync` queue in localStorage. On next app open,
     attempt to flush the queue.

4. **Context extraction failure tracking.** In ChatSheet.tsx, when a HUMA response
   has substantial content (>100 chars) but `parsedContext` is null:
   - Increment a counter in localStorage: `huma-v2-context-extraction-misses`
   - If the miss rate exceeds 30% over the last 20 messages, log a warning that the
     extraction prompts may need rework
   - This is a developer diagnostic, not user-facing. But it tells you when the prompts
     are degrading.

5. **Network error recovery.** The current error message ("Something went wrong") is
   generic. Differentiate:
   - Network offline: "You're offline. Your message is saved — it'll send when you
     reconnect." (Use the existing `useNetworkStatus` hook)
   - API 429 (rate limit): "HUMA needs a moment. Try again in 30 seconds."
   - API 500: "Something broke on our end. Your message is saved."
   - API timeout: "That took too long. Tap to retry with a shorter response."
   The retry button already exists (ChatSheet.tsx line 702-708). Just give it better
   context about WHAT failed.

**What NOT to build:**
- Don't add offline queue for full conversations. Just save the last failed message
  and let the user retry. Offline-first is a v3 concern.
- Don't add automatic retry loops. One retry prompt per message, user-initiated.
  Automatic retries burn API credits and can loop.
- Don't rewrite the marker system. It works ~85% of the time. The goal is graceful
  degradation for the other 15%.

**Success test (markers):** Send Claude a message that should trigger decomposition.
If markers come back null, the retry prompt appears within 2 seconds. If retry also
fails, the manual form appears. The user can create an aspiration either way.

**Success test (DB failures):** Simulate a Supabase outage (disconnect network after
page load). Make a context change. See a warning. Reconnect. See the pending write
flush successfully.

**Success test (errors):** Turn off network mid-conversation. The error message says
"offline" not "something went wrong." Turn network back on. Tap retry. Message sends.

---

### Session 9: Service Extraction & Tests

**Goal:** The codebase is fast to iterate on. API routes are thin. Components are focused.
The core loop has test coverage. Dead code is gone.

**The problem:** `v2-chat/route.ts` is 839 lines with `buildSystemPrompt()` alone at
233 lines (lines 533-765). `sheet/route.ts` is 559 lines. `ChatSheet.tsx` is 771 lines.
These files mix HTTP handling, prompt construction, business logic, and state management.
Every change to conversation behavior requires reading 800+ lines of context. Every
change to the sheet compiler risks breaking scoring logic buried in a route handler.

The test suite covers markers and API validation but has ZERO tests for:
- `mergeContext()` — the deep merge that every context update depends on
- `contextForPrompt()` — the prose serialization Claude reads
- `detectMode()` — the signal detection that routes to open/focus/decision
- `scoreBehaviors()` — the algorithm that decides what goes on today's sheet
- Decision mode integration
- Nudge generation

**What to build:**

**Part 1: Extract services (do first, commit after each extraction)**

1. Extract from `v2-chat/route.ts`:
   - `lib/services/prompt-builder.ts`:
     - `buildSystemPrompt()` (lines 533-765) — the 233-line function, unchanged
     - `buildBehavioralContext()` (lines 246-312)
     - `buildTabContextBlock()` (lines 313-426)
     - `detectMode()` (lines 490-531)
     - All prompt constants: BASE_IDENTITY, OPEN_MODE_PROMPT, FOCUS_MODE_PROMPT,
       DECOMPOSITION_PHASE_PROMPT, REORGANIZATION_PROMPT, DECISION_MODE_PROMPT
   - The route handler becomes ~80 lines: validate request → call `buildSystemPrompt()`
     → stream Claude response → return. Commit.

2. Extract from `sheet/route.ts`:
   - `lib/services/sheet-service.ts`:
     - `scoreBehaviors()` (lines 203-328) — behavior leverage scoring
     - `analyzeHistory()` (lines 329-371) — recent behavior analysis
     - `getSeason()` (lines 9-51) — season derivation
     - `formatKnownContext()` (lines 53-100) — context formatting for sheet prompt
   - The route handler becomes ~90 lines: validate → score → call Claude → return. Commit.

3. Extract from `nudge/route.ts`:
   - `lib/services/nudge-service.ts`:
     - Nudge prompt template (lines 10-72)
     - `summarizeHistory()` (lines 172-207)
   - Route handler becomes ~60 lines. Commit.

**Part 2: Split ChatSheet.tsx (commit after each split)**

4. Extract `hooks/useMessageStream.ts`:
   - The core stream handling from ChatSheet.tsx lines 98-469
   - Handles: fetch → ReadableStream → parse chunks → accumulate response → extract markers
   - Returns: `{ sendMessage, isStreaming, error, lastResponse }`

5. Extract `hooks/useContextSync.ts`:
   - Context merging logic from ChatSheet.tsx lines 370-392
   - Context loading/migration from lines 221-240
   - Persistence to localStorage + Supabase
   - Returns: `{ humaContext, updateContext, contextLoaded }`

6. Extract `hooks/useAspirationManager.ts`:
   - Aspiration save/update logic from ChatSheet.tsx
   - Reorganization handler from lines 30-96
   - Returns: `{ saveAspiration, applyReorganization }`

7. ChatSheet.tsx becomes a composition layer (~200 lines): renders MessageList,
   InputBar, and error states. Uses the three hooks above. Commit.

**Part 3: Tests (do after extractions — extracted services are testable)**

8. Test `mergeContext()` in `__tests__/context-model.test.ts`:
   - Shallow fields merge correctly (body.sleep overwrites)
   - Nested objects deep-merge (people.household + people.community both preserved)
   - Arrays merge by name (two Person objects with same name → update, different name → append)
   - String arrays deduplicate
   - Source tracking records every field change
   - Empty context + extracted → extracted wins
   - Existing context + empty extracted → existing preserved

9. Test `contextForPrompt()`:
   - Empty context → "No context yet"
   - Full context → readable prose with all sections
   - Partial context → only filled sections appear
   - Decisions render with reasoning and outcomes
   - Temporal items render upcoming and overdue

10. Test `detectMode()` in `__tests__/prompt-builder.test.ts`:
    - "I want to eat better" → focus mode
    - "Should I buy a shelter?" → decision mode
    - "How's it going" → open mode
    - Explicit chatMode override → respects override
    - Edge cases: "I want to decide" (has both signals) → decision wins

11. Test `scoreBehaviors()` in `__tests__/sheet-service.test.ts`:
    - Behavior with 7/7 recent completions → high score
    - Behavior scheduled for today (specific-days) → included
    - Behavior not scheduled for today → excluded
    - Trigger behaviors score higher than non-triggers
    - Maximum 5 behaviors returned

12. Integration test for conversation → context flow:
    - Mock Claude to return response with `[[CONTEXT:{"body":{"sleep":"6 hours"}}]]`
    - Assert: `mergeContext()` produces correct HumaContext
    - Assert: next call to `contextForPrompt()` includes "Sleep: 6 hours"

**Part 4: Delete dead code**

13. Delete `/api/chat/route.ts` (v1). It's only referenced by `api-routes.test.ts`.
    Update or remove that test to reference v2-chat instead.

14. Consolidate Supabase clients. Check if `supabase.ts` is imported anywhere. If not,
    delete it. Rename `supabase-v2.ts` to `supabase-client.ts` if it's the primary
    client, and update imports.

15. Search for unused exports across `/lib/` and `/components/`. Delete any function
    or component with zero import references.

**What NOT to do:**
- Don't refactor and test simultaneously. Extract first, verify the build passes,
  THEN write tests against the extracted services.
- Don't add abstractions. The extracted files should contain the SAME code, just in
  a different file. No new interfaces, no dependency injection, no service registries.
- Don't chase 100% coverage. Test the core loop (context merge, prompt build, mode
  detect, behavior score) and the three most likely failure cases for each.
- Don't rename functions during extraction. Same names, same signatures, different files.
  This makes the git diff reviewable.

**Success test (extraction):** `v2-chat/route.ts` is under 100 lines. `sheet/route.ts`
is under 100 lines. `ChatSheet.tsx` is under 250 lines. All existing tests pass.

**Success test (new tests):** `npm run test` runs 20+ tests covering context merging,
prompt serialization, mode detection, and behavior scoring. All pass.

**Success test (dead code):** `grep -r "api/chat" src/` returns zero results (only
v2-chat references remain). `grep -r "supabase-v2" src/` returns zero results if
renamed.

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

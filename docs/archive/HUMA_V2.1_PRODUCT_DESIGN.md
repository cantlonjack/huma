# HUMA V2.1 — Product Design: The Life System

_Supersedes the V2 MVP screen architecture. The three-layer model (Conversation → Computation → Output) remains correct. What changes is which layer the operator SEES._

---

## The Core Problem With V2 MVP

V2 got the architecture right and the interface wrong. The conversation is brilliant. The decomposition engine works. The production sheet compiles. But the operator's primary experience is scrolling through a chat log and checking boxes on a static list. That's not infrastructure for running your life. That's a chatbot with a todo list.

Every reference product that achieves infrastructure status — Google Maps, Canva, Obsidian, Bullipedia, even PrepBoard — makes the **artifact** central and the **input method** peripheral. You don't "talk to" Google Maps. You look at a map, search for what you need, and follow computed directions. You don't "talk to" Canva. You open a workspace and build something visible.

HUMA's artifact is your **life system** — the structured, connected, growing representation of your aspirations, behaviors, dimensions, and the computed connections between them. This artifact needs to be visible, central, and directly manipulable. Conversation and the palette are input tools that feed the artifact. The production sheet is one output the artifact produces.

---

## The Design Principle

**Open → see your system → use what it produces → close. The system gets smarter every time you touch it.**

Not: open → scroll a chat → find the input field → type → read responses → navigate to a separate page to see results.

The operator should spend **10 seconds** on HUMA most mornings (glance at production sheet, check off what they do). **2 minutes** when adding context (quick input, structured immediately). **5 minutes** weekly when exploring their system (browse connections, add aspirations, review what's working).

---

## Three Screens

### Screen 1: YOUR DAY (home screen — what you see when you open HUMA)

This is the bakery production sheet. The operator's daily touchpoint. 10 seconds over morning coffee.

**Top bar:**
- HUMA wordmark (left)
- Date: "Thursday, March 27" in Cormorant Garamond
- A compact status line: "3 things today · Day 4" (how many items, how many days you've been using HUMA)

**Aspiration ribbon:**
- A horizontal scrollable row of your active aspirations as small pills
- Example: `[Eating better]  [Saving money]`  
- Each pill shows the aspiration name in shorthand
- Tapping a pill shows a quick-look card: what this aspiration means for you, how many behaviors are active, a streak indicator
- This ribbon answers "WHY am I doing these things?" at a glance
- If no aspirations yet: the ribbon shows "Tell HUMA what's going on →" which navigates to the entry flow

**Production sheet (main area):**
- 3-5 cards, each representing today's specific actions
- Each card shows:
  - **Headline:** The specific action (Source Sans 3, 0.95rem, weight 500)
  - **One-line preview:** Collapsed detail text, truncated (Source Sans 3, 0.85rem, weight 300, ink-500)
  - **Checkbox:** Custom, left-aligned. Tapping checks it off.
  - **Dimension tag (subtle):** A tiny pill showing which life dimension this touches — "Body" or "Money" — in the bottom-right corner of the card
- **Tap the card body** → expands full detail (recipe, specific instructions, the reasoning)
- **Tap the checkbox** → checks off the item

**Check-off interaction (this is critical — the feedback loop):**
1. Checkbox fills (sage-600, scale bounce)
2. A micro-counter appears below the card: "Cooked at home · 3 of 4 days this week" — this is the behavioral data becoming visible
3. After 300ms, the card fades to 50% opacity and slides down below unchecked items
4. The counter persists on the faded card — proof of accumulation

**After 5+ days of data:**
- An insight card can appear at the top of the production sheet (above the behavior cards, below the aspiration ribbon)
- Sand-100 background, sage-600 left accent bar
- Cormorant Garamond text, 1rem, ink-700
- Example: "You've cooked at home 4 nights straight. On those nights, you spent nothing extra. Your food and your money are connected."
- Two responses: "Tell me more →" (opens conversation about this insight) or just dismiss

**Bottom prompt bar:**
- A persistent input bar above the bottom nav
- Placeholder: "Tell HUMA something..." in ink-300
- This is NOT a chat destination. It opens a **conversation sheet** (bottom sheet overlay, slides up)
- The conversation sheet is for quick context additions: "We got a chest freezer" / "I'm off work Wednesdays now" / "Can we do more chicken thigh recipes?"
- HUMA responds, extracts context, the sheet dismisses. The production sheet may update on next compilation.
- History of past exchanges is accessible via a small "Past conversations" link in the sheet, but it's not the primary experience

**Bottom nav:**
- Three items: **Today** (active) | **System** | **Talk**
- Styled per design system: sand-50 bg, 1px sand-300 top border, sage-700 active, ink-400 inactive

---

### Screen 2: YOUR SYSTEM (the visible artifact — the map of your life)

This is the PrepBoard/Obsidian/Bullipedia hybrid. The thing you're building. The reason HUMA is infrastructure, not a chatbot.

**What you see on Day 1 (one aspiration decomposed):**

```
YOUR SYSTEM

┌─────────────────────────────────────────┐
│  EATING BETTER                    edit  │
│  Two of us · Budget-conscious           │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ○ Sunday meal planning          │    │
│  │   Body · Money                  │    │
│  ├─────────────────────────────────┤    │
│  │ ○ Batch cook one cheap protein  │    │
│  │   Body · Money · Home           │    │
│  ├─────────────────────────────────┤    │
│  │ ● Cook dinner at home (4/4)     │    │
│  │   Body · Money · Joy · People   │    │
│  ├─────────────────────────────────┤    │
│  │ ○ Shop the perimeter            │    │
│  │   Body · Money                  │    │
│  ├─────────────────────────────────┤    │
│  │ ○ Check fridge Thursdays        │    │
│  │   Money · Home                  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  HUMA KNOWS                             │
│  Household: 2 · Budget: tight ·         │
│  No meal prep yet · Day 4               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  + Add another aspiration               │
│    or browse what's possible ↓          │
└─────────────────────────────────────────┘

╔═════════════════════════════════════════╗
║  BROWSE BY DIMENSION                    ║
║                                         ║
║  Body    People    Money    Home        ║
║  Growth  Joy       Purpose  Identity    ║
║                                         ║
║  ┌──────────┐ ┌──────────┐ ┌────────┐  ║
║  │Feel more │ │Sleep     │ │Morning │  ║
║  │energy    │ │better    │ │routine │  ║
║  └──────────┘ └──────────┘ └────────┘  ║
║  ┌──────────┐ ┌──────────┐ ┌────────┐  ║
║  │Get out   │ │Build a   │ │Simplify│  ║
║  │of debt   │ │side thing│ │my life │  ║
║  └──────────┘ └──────────┘ └────────┘  ║
╚═════════════════════════════════════════╝
```

**What you see on Week 2+ (multiple aspirations, connections appearing):**

```
YOUR SYSTEM

┌─ EATING BETTER ──────────────────────┐
│  5 behaviors · 4/5 active this week  │
│  Body · Money · Joy · People · Home  │
└──────────────────────────────────────┘
        │
        │ shared: "Cook at home"
        │         "Shop perimeter"  
        │
┌─ SAVING MONEY ───────────────────────┐
│  3 behaviors · 2/3 active this week  │
│  Money · Home · Joy                  │
└──────────────────────────────────────┘

CONNECTIONS FOUND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Cook at home" serves both aspirations.
It's your most connected behavior —
touching 5 dimensions.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HUMA KNOWS
Household: 2 · Budget: tight · Chest 
freezer (new) · Wednesdays off · Likes 
chicken thighs · Week 2
```

**Aspiration cards:**
- Each aspiration is a white card with the aspiration name as headline
- Below the headline: a compact summary — how many behaviors, how many active this week, which dimensions are touched (as tiny dimension pills)
- Tap to expand: see all behaviors listed, each with its own dimensional tags and activity indicator (filled circle = active this week, empty = not yet)
- Each behavior is tappable → shows detail + "See in Today's sheet"
- Edit button on each aspiration card → modify, adjust, or remove

**Connection indicators:**
- When two aspirations share a behavior, a visual connector appears between their cards
- The connector shows which behaviors are shared
- Below the connected aspirations: a brief computed insight about the connection
- This is the Bullipedia Genesis DNA view — showing the "common DNA" between different parts of your life

**Context summary ("HUMA KNOWS"):**
- A compact card showing everything HUMA has extracted from conversations
- Each line is a context fact: "Household: 2" / "Budget: tight" / "Chest freezer (new)"
- Tappable to edit or remove any fact
- This is the operator's proof that HUMA is learning — and their control surface for correcting it
- New context facts animate in when added (fade + slide, subtle)

**The Palette (bottom section):**
- Header: "BROWSE BY DIMENSION" or "ADD TO YOUR SYSTEM"
- 8 dimension pills as category filters: Body, People, Money, Home, Growth, Joy, Purpose, Identity
- Tap a dimension → shows aspirations and possibilities relevant to that dimension
- Each palette item is a pill showing a short aspiration label
- **Tap a palette item → HUMA asks ONE clarifying question (in a quick bottom sheet, not a full chat) → decomposes → aspiration appears on the map**
- The palette is the PrepBoard ingredient sidebar. It solves the nescience problem — showing people what's possible when they don't know what to ask for.
- Palette items update based on existing context: if you have "eating better," the palette won't show eating-related items prominently — it'll emphasize what's missing (movement, money, relationships)

**Editing:**
- Every element is directly editable. Tap to modify.
- Swipe a behavior to remove it
- Drag aspirations to reorder (priority)
- This is a workspace, not a display

---

### Screen 3: TALK (the conversation tool — deepened, not a chat log)

This screen exists for longer conversations that don't fit a quick bottom-sheet exchange. But it's fundamentally different from the current chat log.

**Structure:**

```
TALK

┌─────────────────────────────────────────┐
│  HUMA KNOWS              see all →      │
│  Household: 2 · Budget: tight ·         │
│  Chest freezer · Wednesdays off         │
│  2 aspirations · 8 behaviors · Day 12   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  LATEST                                 │
│                                         │
│  You: "We got a chest freezer"          │
│                                         │
│  That changes things. Sunday batch      │
│  cook can go bigger — cook two          │
│  proteins instead of one, freeze the    │
│  second. Your Wednesday can become      │
│  a freezer-meal night. I'll update      │
│  tomorrow's sheet.                      │
│                                         │
│  Context added: Chest freezer (new)     │
│                    Mar 26               │
└─────────────────────────────────────────┘

  ┌ Mar 25 ────────────────────────────┐
  │ "Can we do more chicken thigh..."  │
  └────────────────────────────────────┘
  ┌ Mar 22 ────────────────────────────┐
  │ "I want to eat better" (entry)     │
  └────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  What's on your mind?              ⬆   │
└─────────────────────────────────────────┘
```

**Key differences from current /chat:**

1. **Context card at top** — always visible, shows what HUMA knows. This is the same data as the "HUMA KNOWS" card on the System screen. It answers "what does HUMA know about me?" without scrolling through a chat log.

2. **Latest exchange displayed prominently** — the most recent conversation, expanded. If HUMA extracted context, it shows: "Context added: Chest freezer (new)" — visible proof that talking did something.

3. **Past exchanges as collapsed summaries** — not a full chat log. Each past exchange is a single-line summary with a date. Tap to expand and see the full exchange. This keeps the page scannable instead of an infinite scroll.

4. **Context extraction is visible** — when HUMA learns something from a conversation, it's called out explicitly: "Context added: [fact]". This closes the loop. The operator sees that their words became structured knowledge.

5. **Input field at the bottom** — same as everywhere. The conversation that happens here works the same as the bottom-sheet conversation on other screens, but with more room and history visible.

**When a conversation produces new behaviors or aspirations:**
- They don't just appear in a chat message. They flow to the System screen.
- A toast notification: "New aspiration added to your system →" (tappable, navigates to System)
- Or: "Tomorrow's sheet updated" (tappable, navigates to Today)

---

## The First-Time Experience

The current /start flow stays. "What's going on?" → conversation → clarification → decomposition → "Start this Sunday" → auth. This works.

**One critical addition:** As the conversation progresses and context builds, the System is materializing in the background. After auth, when the operator arrives at the app for the first time, they don't just see a production sheet. They see:

1. **Today tab:** Their first production sheet (2-4 items for tomorrow)
2. **System tab:** Their first aspiration card with decomposed behaviors and dimensional tags. The palette below it showing what else is possible. The context card showing what HUMA learned during the conversation.

The first visit to the System tab should feel like a reveal: "Oh, HUMA built this from our conversation." The structured knowledge was invisible during the chat. Now it's visible, organized, and editable.

---

## The Conversation Sheet (Bottom Sheet Overlay)

Available from any screen via the prompt bar. This is the quick-add interface.

**Behavior:**
- Tapping the prompt bar on Today or System slides up a bottom sheet (60% screen height)
- The sheet has: the conversation area and the input field
- HUMA responds to the input. If context is extracted: "Got it — [fact] added to your context."
- If the input leads to a new aspiration: HUMA clarifies (1 question), decomposes, and says "Added to your system. You'll see it in tomorrow's sheet."
- The sheet can be dismissed by swiping down. The conversation is saved but compressed — it appears as a single summary in the Talk screen history.

**This replaces the permanent chat log model.** Conversations are ephemeral interactions that produce structured outputs. They don't pile up as the primary artifact. The structured outputs (context, aspirations, behaviors) are the artifact.

---

## Data Flow

```
OPERATOR INPUT                    WHAT HUMA DOES                OUTPUT
─────────────────                 ──────────────                ──────
Types in prompt bar         →     Extracts context        →     Context card updates
                                  Structures aspiration   →     System card appears
                                  Decomposes behaviors    →     Behaviors populate
                                  Maps dimensions         →     Dimension tags appear
                                  Finds connections       →     Connection indicators

Taps palette item           →     One clarification      →     New aspiration on System
                                  Decomposes             →     Behaviors populate
                                  Finds connections       →     Connections update

Checks off production       →     Logs behavior data     →     Counter appears on card
sheet item                        Cross-references       →     (After 5+ days) Insight
                                  through decomposition        card surfaces on Today
                                  chains

Taps "edit" on System       →     Recomputes connections →     System updates
                                  Recompiles sheet       →     Tomorrow's sheet changes
```

Every interaction either feeds the system or uses its output. Nothing is decorative. Nothing is dead-end.

---

## What This Requires (Technical)

### New: Context extraction API
- POST `/api/context/extract` — takes conversation messages, returns structured context facts (JSONB)
- Claude parses natural language into key-value context: `{household: "2", budget: "tight", equipment: ["chest freezer"]}`
- Stored in Supabase `contexts` table, `known_context` JSONB field
- This may already exist partially from the V2 build — verify and extend

### New: System view API
- GET `/api/system` — returns the operator's full structured context: aspirations, behaviors, dimensional mappings, connections, known context
- Connections are computed: find behaviors shared across aspirations, find dimensions that appear in multiple aspirations
- This is the data that powers the System screen

### Modified: Sheet compilation
- Already works, but needs to pull from the structured context (not just conversation transcript)
- The `known_context` JSONB should be the primary source for personalization, not raw chat messages

### Modified: Navigation
- Tab bar changes from Talk | Today | More → Today | System | Talk
- Today becomes the home screen (default on app open)
- The bottom-sheet conversation overlay is new UI

### Modified: /start entry flow
- Same conversation, but after auth, redirect to /today (not /chat)
- Ensure the conversation's extracted context populates the System screen immediately
- The System screen should have data from the moment the operator first sees it

### NOT required (yet):
- Full spatial canvas / Palmer map
- Graph visualization / force-directed layout
- Real-time connection animation
- Voice input
- Desktop layout optimization
- Template gallery / fork system
- Pattern commons

---

## Build Sequence

### Session 8A: Foundation
1. Restructure navigation: Today (home) | System | Talk
2. Create the System screen (MVP): aspiration cards with behaviors, dimensional tags, context summary, palette tray
3. Add the conversation bottom-sheet overlay (available from Today and System)
4. Add context extraction to the conversation flow — visible "Context added:" confirmations
5. Today becomes home screen (redirect after auth goes to /today, not /chat)

### Session 8B: Interactions
1. Check-off feedback on Today: counters, streaks, card reordering
2. Aspiration ribbon on Today screen
3. Palette interaction on System: tap → clarify → decompose → add
4. Connection indicators between aspirations on System
5. Collapsible behaviors within aspiration cards
6. Talk screen restructure: context card at top, exchanges as collapsed summaries

### Session 9: Polish + Insights
1. Apply full design system (the visual polish from the earlier prompt — fonts, colors, buttons, animation)
2. Insight engine: after 5+ days of check-off data, compute and surface cross-dimensional insights
3. Insight cards on Today screen
4. Behavioral data overlay on System screen (which behaviors stuck, which didn't)

---

## The Test

The product works when someone:
1. States an aspiration
2. Sees their **system** materialize — aspiration, behaviors, connections, dimensions — not just a chat response
3. Gets a production sheet that feels personal
4. Checks things off and sees the data accumulate visibly
5. Opens the System tab and sees their life becoming structured — without having designed anything
6. Browses the palette and discovers something they didn't know they wanted
7. Receives an insight that connects two parts of their life they didn't know were related
8. Screenshots that insight and texts it to a friend

The paradigm breaks one production sheet at a time. But what makes them stay is watching their system grow.

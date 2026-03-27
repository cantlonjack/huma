# CC Prompt: HUMA V2 — The Core Loop MVP

## Read First

- `docs/HUMA_V2_FOUNDATION.md` — THE source of truth. Read the entire thing before writing any code.
- `docs/HUMA_VOICE_BIBLE.md` — Every word HUMA says must pass this filter.
- `docs/HUMA_DESIGN_SYSTEM.md` — Colors, fonts, spacing, animation.
- `/mnt/skills/public/frontend-design/SKILL.md` — Design quality bar.

## What We're Building

The core loop: **Conversation → Decomposition → Production Sheet → Insight.**

A person opens HUMA, says what's going on, HUMA decomposes it into daily behaviors, they follow a production sheet, and after enough data HUMA reveals a cross-dimensional connection they didn't see.

This is NOT the Lotus Flow. NOT the petal workspace. NOT the spatial canvas. Those are retired from the entry experience. This is a new product surface built on the existing infrastructure.

## What Exists (Keep)

- Next.js 14+ App Router, TypeScript, Tailwind
- Supabase auth (magic links) + PostgreSQL
- Claude API via `lib/ai-provider.ts`
- Design tokens in `styles/design-tokens.ts`
- Font configuration (Cormorant Garamond + Source Sans 3)

## What to Branch (Don't Delete)

Before writing any new code, create a branch `v1-archive` with the current state:

```bash
git checkout -b v1-archive
git push origin v1-archive
git checkout main
```

Then remove the v1 routes from main (`/begin`, `/home` workspace, `/conversation`). Keep `/`, `/map/[id]`, auth, and all lib/engine code.

## New Route Structure

```
/               Landing page (update later — keep existing for now)
/start          The conversation entry point (new)
/today          The daily production sheet (new)
/chat           Ongoing conversation with HUMA (new)
/api/decompose  Decomposition endpoint (new)
/api/sheet      Production sheet compilation (new)
/api/insight    Insight computation (new)
```

Auth boundary: `/start` works without auth (localStorage). After first decomposition, prompt "Save your progress" → magic link → persists to Supabase. `/today` and `/chat` require auth.

---

## New Database Schema

Add these tables alongside existing ones (don't drop existing tables — the v1 data stays):

```sql
-- Operator context built through conversation (replaces OperatorContext)
CREATE TABLE contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  raw_statements JSONB DEFAULT '[]',      -- Everything the operator has said, structured
  aspirations JSONB DEFAULT '[]',         -- Extracted aspirations with decomposition chains
  known_context JSONB DEFAULT '{}',       -- Accumulated facts: location, household, schedule, etc.
  dimensional_state JSONB DEFAULT '{}',   -- Computed dimensional effects, NOT self-reported
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Decomposed aspirations with behavior chains
CREATE TABLE aspirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  context_id UUID REFERENCES contexts(id),
  raw_text TEXT NOT NULL,                 -- "I want to eat clean"
  clarified_text TEXT,                    -- "Animal-based keto, family of two"
  behaviors JSONB NOT NULL DEFAULT '[]',  -- Array of Behavior objects
  dimensions_touched JSONB DEFAULT '[]',  -- Which dimensions and how
  status TEXT DEFAULT 'active',           -- 'active', 'paused', 'completed', 'dropped'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily production sheet entries
CREATE TABLE sheet_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  aspiration_id UUID REFERENCES aspirations(id),
  date DATE NOT NULL,
  behavior_key TEXT NOT NULL,             -- Links to behavior in aspiration.behaviors
  behavior_text TEXT NOT NULL,            -- Human-readable: "Cook dinner: beef stew with Sunday's broth"
  detail JSONB DEFAULT '{}',             -- Recipe link, amounts, specifics
  checked BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Computed insights
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  insight_text TEXT NOT NULL,
  dimensions_involved JSONB NOT NULL,     -- Which dimensions are connected
  behaviors_involved JSONB NOT NULL,      -- Which behaviors revealed the connection
  data_basis JSONB NOT NULL,              -- The actual correlation data
  delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversation messages (new conversation model)
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL,                     -- 'user' or 'huma'
  content TEXT NOT NULL,
  context_extracted JSONB DEFAULT '{}',   -- Structured data HUMA pulled from this message
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_contexts_user ON contexts(user_id);
CREATE INDEX idx_aspirations_user ON aspirations(user_id);
CREATE INDEX idx_aspirations_context ON aspirations(context_id);
CREATE INDEX idx_sheet_entries_user_date ON sheet_entries(user_id, date);
CREATE INDEX idx_sheet_entries_aspiration ON sheet_entries(aspiration_id);
CREATE INDEX idx_insights_user ON insights(user_id);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
```

### TypeScript Interfaces

```typescript
interface Behavior {
  key: string;                    // Unique within aspiration: "cook-dinner"
  text: string;                   // "Cook dinner at home"
  frequency: 'daily' | 'weekly' | 'specific-days';
  days?: string[];                // ["monday", "tuesday", "thursday", "friday"]
  dimensions: DimensionEffect[];  // Which dimensions this touches and how
  detail?: string;                // Recipe, instructions, specifics
}

interface DimensionEffect {
  dimension: DimensionKey;        // 'body' | 'money' | 'home' | etc.
  direction: 'builds' | 'costs' | 'protects';
  reasoning: string;              // "Home cooking improves nutrition"
}

interface Aspiration {
  id: string;
  rawText: string;
  clarifiedText: string;
  behaviors: Behavior[];
  dimensionsTouched: DimensionKey[];
  status: 'active' | 'paused' | 'completed' | 'dropped';
}

interface SheetEntry {
  id: string;
  aspirationId: string;
  behaviorKey: string;
  behaviorText: string;           // Specific to today: "Beef stew — recipe here"
  detail: Record<string, unknown>;
  checked: boolean;
}

interface Insight {
  text: string;
  dimensionsInvolved: DimensionKey[];
  behaviorsInvolved: string[];    // behavior keys
  dataBasis: {
    correlation: number;          // 0-1
    dataPoints: number;
    pattern: string;              // "On days with X, Y happened Z% of the time"
  };
}

type DimensionKey =
  | 'body' | 'people' | 'money' | 'home'
  | 'growth' | 'joy' | 'purpose' | 'identity';
```

---

## Screen 1: /start — The Conversation Entry

### Layout

Desktop: two-panel. Left (60%): conversation. Right (40%): the palette.
Mobile: conversation full-width. Palette accessible via a subtle pull-up tray from bottom.

### The Conversation Panel

Top: HUMA wordmark (Cormorant Garamond, sage, small).

Center: large open space. First visit shows:

```
What's going on?
```

In Cormorant Garamond, ~24px, earth-700. Centered. Below it, a text input field — full width, minimal border (sand-300 bottom border only), placeholder: "Type or just start talking..."

No submit button. Enter to send, or a subtle send icon appears when text is entered.

HUMA responds in the conversation flow below. The conversation is a vertical thread — user messages on right (sand-100 background), HUMA messages on left (white background). Source Sans 3, 16px. Generous line height. Warm and readable.

HUMA's first response to whatever the operator says should:
1. Acknowledge what they said (one sentence, fence-post neighbor voice)
2. Begin clarifying (tappable options, NOT a text question)
3. Show that HUMA is structuring what they said

Example flow:

**Operator:** "I want to eat better. Like real food, not processed crap."

**HUMA:** "Real food, home-cooked. Got it. When you say 'eat better,' which of these sounds closest?"

Then show 3-4 tappable cards:
- "Whole foods — cut the processed stuff"
- "Animal-based / keto"
- "Plant-forward / mostly vegetables"
- "Local and seasonal — know where it comes from"

Operator taps one. HUMA continues clarifying — household size, current cooking habits, budget constraint. Each clarification is tappable options first, with a "something else" text option.

After 2-3 clarifications, HUMA decomposes:

**HUMA:** "Here's what 'eat real food, animal-based' looks like for a week:"

Shows 4-5 behaviors as a clean list with checkboxes (not checked yet — this is a preview):
- ☐ Meal prep Sunday afternoon (~2 hours)
- ☐ Cook dinner at home (Mon, Tue, Thu, Fri)
- ☐ No processed snacks — keep beef jerky, nuts, cheese available
- ☐ Farmers market Saturday morning

Below the list:

**HUMA:** "Want to start with this tomorrow? I'll build your daily sheet."

Two buttons: **[Start tomorrow]** **[Adjust these first]**

"Start tomorrow" → triggers auth if not logged in → creates aspiration + behaviors → redirects to /today showing tomorrow's sheet.

"Adjust these first" → the behaviors become editable inline. Add, remove, change frequency.

### The Palette Panel

Right side (desktop) or bottom tray (mobile).

Header: "You might also be dealing with..." in Source Sans 3, 12px, earth-400.

Below: tappable bubbles. Rounded pills. Sand-100 background, earth-500 text, sand-300 border. On tap: sage-100 background, sage-600 text, sage-300 border.

The palette starts empty on first load. After the operator's first message, it populates with ~8 related concepts. These update after every operator message.

Example: Operator says "I want to eat better."
Palette shows: `always tired` `no time to cook` `spending too much on food` `want more energy` `health problems` `want to lose weight` `feeding a family` `want to grow food`

Operator taps `always tired`. That context gets added to the conversation — HUMA acknowledges: "Tired too. We'll watch for how the food changes affect your energy."

The palette concepts come from a curated master list of ~50 pain points and ~50 aspirations. Each is pre-mapped to dimensions and decomposition templates. The API call to populate the palette sends the conversation context so far and gets back the 8 most relevant concepts.

**Implementation:** The palette is a Claude API call with a specific prompt:

```
Given this conversation so far: {conversation}
From this list of concepts: {master_list}
Return the 8 most relevant concepts the operator hasn't mentioned yet.
Return as JSON array of {id, text, category}.
```

Keep this call lightweight — Haiku, max 200 tokens response.

---

## Screen 2: /today — The Daily Production Sheet

### Layout

Mobile-first. This is the primary daily experience.

Top: Date (Source Sans 3, 14px, earth-400). "Wednesday, March 26"

Below: Production sheet items. Each item is a card:

```
┌─────────────────────────────────────────┐
│ ○  Cook dinner: beef stew               │
│    You have bone broth from Sunday.     │
│    One pot, feeds two for tonight +     │
│    tomorrow.                            │
│                                    ▸    │
└─────────────────────────────────────────┘
```

The circle (○) is the checkbox. Tap to check off (●, sage-500 fill, subtle scale animation). The arrow (▸) expands detail — recipe, instructions, reasoning ("this serves your 'eat real food' aspiration and uses what's already in your kitchen").

Each card: white background, sand-200 border, rounded-xl, 16px padding. Behavior text in Source Sans 3, 16px, earth-700. Detail text in Source Sans 3, 14px, earth-400.

Cards are ordered by time of day — morning behaviors first, evening last.

Bottom of sheet: subtle prompt. "Talk to HUMA" → links to /chat. This is how context deepens organically. Not a button that says "add aspiration." Just an invitation to continue the conversation.

### Checked-off State

When an item is checked:
- Circle fills with sage-500
- Text gets a subtle opacity reduction (not strikethrough — this isn't a to-do list, it's a production sheet)
- Card order doesn't change

When all items for the day are checked:
- A quiet message appears at the bottom: "Done for today. See you tomorrow." In Cormorant Garamond, sage-600. No confetti. No points. No streak count.

### Production Sheet Compilation

The sheet for each day is compiled by an API call (`POST /api/sheet`) that takes:
- User's active aspirations with behaviors
- Day of week (some behaviors are daily, some are specific days)
- Known context (what's in the freezer, what was cooked recently, budget state)
- Behavior check-off history (for specificity — "use Tuesday's leftover roast")

The compilation prompt for Claude:

```
You are compiling today's production sheet for {name}.

Active aspirations and behaviors:
{aspirations_with_behaviors}

Known context:
{known_context}

Recent behavior history (last 7 days):
{recent_sheet_entries_with_check_status}

Today is {day_of_week}, {date}.

For each behavior that applies to today, produce a SPECIFIC, actionable entry.
Not "cook dinner" — instead "Beef stew: use the bone broth from Sunday, chuck from the freezer. One pot. Recipe: [basic instructions]."
Not "morning movement" — instead "20-minute walk. Sunrise is 7:14am, 34°F. Layer up."

Be specific. Use the known context. Reference leftovers, inventory, schedules.
The operator should not have to think — just execute.

Return JSON:
{
  entries: [
    {
      behavior_key: string,
      aspiration_id: string,
      text: string,        // The specific action for today
      detail: string,      // Expanded instructions/reasoning
      time_of_day: "morning" | "afternoon" | "evening"
    }
  ]
}
```

Use Sonnet for this call. Run it once per day (trigger: first app open after midnight, or 5am cron). Cache the result.

---

## Screen 3: /chat — Ongoing Conversation

Same layout as /start but with full conversation history loaded. The palette continues to update based on the latest messages.

This is where:
- New aspirations get articulated and decomposed
- Context deepens organically ("I have a half cow in the freezer")
- Insights are delivered when ready
- Aspirations get adjusted ("the farmers market isn't working, I want to switch to a CSA")
- HUMA asks occasional clarifying questions to sharpen context

The /chat route should feel like returning to a conversation with someone who knows you. HUMA's system prompt includes ALL accumulated context — the full conversation history, all aspirations, all behavior data, all known context. This is the key differentiator from a raw LLM.

### Insight Delivery

When the insight engine has a ready insight (computed by cron or triggered after N check-offs), it's delivered at the TOP of /chat the next time the operator opens it:

```
┌─────────────────────────────────────────┐
│  Something I noticed                    │
│                                         │
│  You've cooked at home 8 of the last    │
│  10 nights. On those nights, you went   │
│  to bed before 10pm — every single      │
│  time. On the two takeout nights, past  │
│  midnight both times.                   │
│                                         │
│  Your food rhythm and your sleep are    │
│  connected. Not nutrition — timing.     │
│  Cooking puts you in evening mode.      │
│                                         │
│  Body ↔ Joy                             │
│                                         │
│  [Interesting]  [Tell me more]          │
└─────────────────────────────────────────┘
```

Card: white background, sage-100 left border (4px), rounded-xl. Headline in Cormorant Garamond. Body in Source Sans 3. Dimension badges at bottom in small pills with dimension colors.

"Interesting" → dismisses, marks insight as delivered. "Tell me more" → opens conversation about this connection.

---

## The Insight Engine

### Computation Logic

Run nightly (or after every 5th check-off). For each user with 5+ days of behavior data:

1. **Build the behavior matrix.** Rows = days. Columns = behaviors. Values = checked (1) or not (0).

2. **Compute pairwise correlations** between all behaviors across different aspirations. Two behaviors from the SAME aspiration correlating is expected and uninteresting. Two behaviors from DIFFERENT aspirations correlating is the signal.

3. **Filter for strong correlations** (>0.7 with 5+ data points). These are candidates.

4. **Map through decomposition chains** to find the dimensional connection. Behavior A touches Body. Behavior B touches People. If they correlate, Body and People are coupled for this operator.

5. **Generate the insight** via Claude, providing the correlation data and asking for a specific, human observation. NOT "your Body and People dimensions are correlated." Instead: "On days you walk, you also do the family dinner. Every time. The walk isn't just exercise for you — it's the thing that starts your evening."

### Insight Prompt

```
You are generating an insight for {name}.

Here is a behavioral correlation I found:
- Behavior A: {behavior_a} (from aspiration: {aspiration_a}, touches: {dimensions_a})
- Behavior B: {behavior_b} (from aspiration: {aspiration_b}, touches: {dimensions_b})
- Correlation: On days {name} did A, they did B {percent}% of the time ({n} days).
  On days they didn't do A, they did B {other_percent}% of the time ({m} days).

Generate a 3-sentence insight:
1. The specific observation (what the data shows)
2. The connection (why these are linked — infer from context, not just dimensions)
3. The implication (what this means for their life, without prescribing)

Voice: fence-post neighbor. Direct. Specific. No therapy-speak. No "I notice that..." Just state what you see.
```

---

## The Palette Master List

Curate ~50 pain points and ~50 aspirations. Each pre-mapped to primary dimensions. Store as a JSON file — no database needed for MVP.

```typescript
interface PaletteConcept {
  id: string;
  text: string;                    // "always tired"
  category: 'pain' | 'aspiration';
  primaryDimensions: DimensionKey[];
  relatedConcepts: string[];       // IDs of related concepts
  decompositionHint: string;       // Brief hint for the decomposition engine
}
```

The palette is NOT the decomposition engine. It's a UX affordance that adds concepts to the conversation context. The actual decomposition happens through the conversation + Claude.

---

## Navigation

Minimal. Three items. Bottom bar on mobile, top bar on desktop.

```
[💬 Talk]     [📋 Today]     [···]
```

Talk → /chat (or /start if first visit)
Today → /today
··· → Settings, account, future features

No sidebar. No lotus nav. No petal list. Three things.

Active tab: sage-500 icon + text. Inactive: earth-400.

---

## What NOT to Build

- Lotus Flow or any multi-screen onboarding
- Capital ratings, sliders, or self-reported dimension scores
- Shape / radar chart / WHOLE visualization
- Spatial canvas / Palmer map view
- Petal navigation
- Template gallery / fork system (future)
- Pattern commons / social signals (future)
- Weekly review UI (the insight engine handles the observation; no separate review ritual)
- Voice input (future)
- Desktop-optimized canvas (mobile-first for now)

---

## Auth Flow

1. Operator arrives at /start. No auth required. Conversation begins.
2. After first decomposition, HUMA says: "Want to save this? I'll build your daily sheet."
3. [Save my progress] → magic link auth flow (existing Supabase implementation)
4. On auth: conversation + aspiration + behaviors persist to Supabase
5. Redirect to /today showing tomorrow's production sheet
6. Subsequent visits: if authed, /today is the default landing

Store pre-auth state in localStorage (conversation messages + aspiration draft). On auth, migrate to Supabase. Same pattern as existing Lotus Flow localStorage persistence.

---

## Verification Checklist

### Conversation (/start)
- [ ] Open prompt renders: "What's going on?"
- [ ] Text input works, enter to send
- [ ] HUMA responds with acknowledgment + tappable clarification cards
- [ ] Palette populates after first message with ~8 related concepts
- [ ] Tapping a palette bubble adds it to conversation context
- [ ] After 2-3 clarifications, HUMA shows decomposed behaviors
- [ ] "Start tomorrow" triggers auth flow → persists → redirects to /today
- [ ] "Adjust these first" allows inline behavior editing

### Production Sheet (/today)
- [ ] Shows today's behaviors as specific, actionable cards
- [ ] Cards ordered by time of day
- [ ] Tap circle to check off (sage fill animation)
- [ ] Expand arrow shows detail/reasoning
- [ ] "Talk to HUMA" link at bottom goes to /chat
- [ ] Sheet recompiles daily (new entries based on day + context)
- [ ] Checked entries persist

### Conversation (/chat)
- [ ] Full conversation history loaded
- [ ] New messages add context (visible in subsequent sheet compilations)
- [ ] Palette continues to update
- [ ] Insight card appears at top when one is ready
- [ ] New aspirations can be decomposed in conversation → new behaviors appear on sheet

### Insight Engine
- [ ] After 5+ days of data, pairwise correlations computed
- [ ] Cross-aspiration correlations identified
- [ ] Insight generated by Claude with specific, human language
- [ ] Insight delivered as card in /chat
- [ ] "Interesting" dismisses; "Tell me more" opens conversation

### Data
- [ ] Pre-auth conversation in localStorage
- [ ] Post-auth: contexts, aspirations, sheet_entries, chat_messages in Supabase
- [ ] Sheet compilation uses all accumulated context
- [ ] No data loss on browser close (pre-auth) or session timeout (post-auth)

---

## The Feeling

The operator opens HUMA for the first time. Types something real. Gets something useful back in under 2 minutes — not advice, not a plan, but specific behaviors for tomorrow. Follows the production sheet for a week. On day 5 or 6, opens HUMA and sees an insight that connects two parts of their life they never linked. Thinks "how did it know that?" Texts a screenshot to their partner. Says "you should try this."

That's the product. Build exactly this. Nothing more.

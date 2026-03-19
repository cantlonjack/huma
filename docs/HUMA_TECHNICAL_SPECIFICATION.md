# H U M A
## Technical Specification
### The Engineering Blueprint

*How the medium works under the hood. Everything a technical co-founder needs to understand the architecture, data model, protocol design, and build sequence.*

March 2026 · Confidential · Co-Founder Draft

---

## 00 — How to Read This Document

The Foundational Truth document describes WHAT we're building and WHY. This document describes HOW.

It is organized in three layers, from most concrete to most abstract:

1. **The Beachhead MVP** (Sections 01–05) — What we build first. Deployable in weeks. Generates the first patterns and the first revenue.
2. **The Application Layer** (Sections 06–09) — The full HUMA product. The three modes (Design, Operate, Evolve) as a complete system.
3. **The Protocol Layer** (Sections 10–14) — RPPL as an open standard. The uncapturable infrastructure. The long game.

A technical co-founder should read sections 01–05 and be ready to start building. Sections 06–14 are the architecture they're building TOWARD — decisions made now must not foreclose these possibilities later.

---

## 01 — System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACES                       │
│  Web App · Mobile App · API · Third-Party Applications   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  APPLICATION LAYER                        │
│            (HUMA — the for-profit product)                │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  DESIGN  │  │ OPERATE  │  │  EVOLVE  │              │
│  │  MODE    │  │  MODE    │  │  MODE    │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │              │              │                    │
│  ┌────▼──────────────▼──────────────▼────┐              │
│  │         AI ENGINE (Intelligence)       │              │
│  │  Context Holder · Pattern Navigator    │              │
│  │  QoL Decomposer · Cascade Analyzer     │              │
│  └────────────────┬──────────────────────┘              │
│                   │                                      │
│  ┌────────────────▼──────────────────────┐              │
│  │         USER CONTEXT STORE             │              │
│  │  Essence · Field · QoL · Enterprises   │              │
│  │  Validation Data · Evolution History   │              │
│  └────────────────────────────────────────┘              │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  PROTOCOL LAYER                           │
│              (RPPL — the open standard)                   │
│                                                          │
│  ┌──────────────────────────────────────┐               │
│  │          PATTERN LIBRARY              │               │
│  │  Patterns · Connections · Validation  │               │
│  │  Attribution · Evolution History      │               │
│  └──────────────────────────────────────┘               │
│                                                          │
│  ┌──────────────────────────────────────┐               │
│  │        RPPL SPECIFICATION             │               │
│  │  Data Schema · Query Language         │               │
│  │  Validation Protocol · Attribution    │               │
│  └──────────────────────────────────────┘               │
│                                                          │
│  ┌──────────────────────────────────────┐               │
│  │       CONTRIBUTOR PROTOCOL            │               │
│  │  Identity · Attribution · Value Flow  │               │
│  └──────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

**Key architectural principle:** The application layer and protocol layer are cleanly separated. The application can be rebuilt, replaced, or forked without affecting the protocol. The protocol can be implemented by anyone without depending on the application. This separation is what makes the system uncapturable.

---

## 02 — Beachhead MVP: Tech Stack

### Chosen Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Frontend | Next.js 14+ (App Router) + TypeScript | SSR for shareable map URLs, React ecosystem, fast iteration |
| Styling | Tailwind CSS + custom earthy design tokens | Rapid development, consistent design system |
| AI | Claude API (Sonnet for conversation, Opus for document generation) | Best conversational reasoning; swap-ready architecture |
| State | React state (conversation) + server-side persistence (maps) | Simplest possible; no premature state management |
| Database | PostgreSQL (via Supabase or Neon) | Relational for user contexts; JSONB for flexible pattern data |
| Auth | Simple email magic links (no passwords) | Lowest friction for target audience |
| Hosting | Vercel (app) + managed Postgres | Zero-ops for solo/duo team |
| File Output | Server-side HTML → PDF generation | Printable maps without client-side complexity |

### What We Explicitly Defer

| Component | Why Not Now |
|-----------|-----------|
| Mobile app | Web-first; responsive design covers mobile |
| Real-time collaboration | Single-user MVP; collaboration is v3+ |
| Blockchain/crypto | Protocol-level value exchange designed for later, not needed for beachhead |
| Custom ML models | Claude API is sufficient; open-weight models are a future optimization |
| Pattern library infrastructure | MVP patterns are curated JSON; distributed library is v2+ |

---

## 03 — Beachhead MVP: Data Model

### Core Entities

```typescript
// ─── User ───
interface User {
  id: string;                    // UUID
  email: string;
  name: string;
  createdAt: Date;
  tier: 'free' | 'operate' | 'professional' | 'enterprise';
}

// ─── Conversation (Design Mode session) ───
interface Conversation {
  id: string;
  userId: string;
  status: 'active' | 'complete';
  currentPhase: Phase;
  messages: Message[];
  context: AccumulatedContext;    // Built up during conversation
  createdAt: Date;
  completedAt?: Date;
}

type Phase =
  | 'ikigai'
  | 'holistic-context'
  | 'landscape'
  | 'enterprise-map'
  | 'nodal-interventions'
  | 'operational-design'
  | 'complete';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  phase: Phase;
  timestamp: Date;
  metadata?: {
    phaseTransition?: Phase;        // If this message triggered a transition
    contextExtraction?: string;      // Synthesis extracted at transition
  };
}

// ─── Accumulated Context ───
// Built progressively during the conversation.
// This is the user's ESSENCE + FIELD in RPPL terms.
interface AccumulatedContext {
  // Phase 1: Ikigai
  essence: {
    name: string;
    location?: string;
    loves: string[];
    skills: string[];
    worldNeeds: string[];
    sustains: string[];
    synthesis: string;               // The AI's portrait of their essence
  };

  // Phase 2: Holistic Context
  holisticContext: {
    qualityOfLife: QoLStatement[];
    productionForms: string[];
    futureResourceBase: string[];
    synthesis: string;
  };

  // Phase 3: Landscape (generic — not just agriculture)
  field: {
    location: string;
    layers: FieldLayer[];            // Context-dependent hierarchy
    synthesis: string;
    leveragePoints: string[];
  };

  // Phase 4: Enterprises / Projects
  enterprises: {
    candidates: EnterpriseRecommendation[];
    selected: EnterpriseRecommendation[];
    combinedWeeklyLoad: string;
    qolValidation: string;           // How enterprises test against QoL
  };

  // Phase 5: Nodal Interventions
  nodalInterventions: {
    actions: NodalIntervention[];
    synthesis: string;
  };

  // Phase 6: Operational Design
  operationalDesign: {
    weeklyRhythm: WeeklyRhythm;
    validationProtocol: ValidationCheck[];
    seasonalArc: SeasonalPhase[];
  };
}

// ─── QoL Statement (the key innovation) ───
interface QoLStatement {
  statement: string;                 // "Evenings free for my daughter"
  enablingConditions: string[];      // Structural requirements
  weeklyCommitments: string[];       // Rhythm-level actions
  validationQuestion: string;        // "How many evenings free? ___/7"
  target: string;                    // "5+/7"
  failureResponse: string;           // Systemic, never personal
}

// ─── Field Layer ───
// Generalized from Regrarians — any context has layers
// from most permanent to most flexible
interface FieldLayer {
  name: string;                      // e.g., "Climate", "Location", "Resources"
  category: 'permanent' | 'structural' | 'flexible';
  status: 'strong' | 'adequate' | 'leverage-point' | 'needs-attention' | 'unexplored';
  notes: string;
  data?: Record<string, any>;        // Structured data (e.g., climate zone, soil type)
}

// ─── Enterprise / Project Recommendation ───
interface EnterpriseRecommendation {
  name: string;
  category: string;
  role: 'anchor' | 'foundation' | 'partner' | 'long-game' | 'multiplier';
  description: string;
  financials: {
    startupCost: { low: number; high: number };
    timeToRevenue: string;
    year1Revenue: { low: number; high: number };
    year3Revenue: { low: number; high: number };
    margin: string;
    laborInSeason: string;
    laborOffSeason: string;
  };
  capitalProfile: CapitalScore[];
  fitEssence: string;                // Why this fits WHO they are
  fitField: string;                  // Why this fits WHERE they are
  synergies: string[];
  qolImpact: string;                // How this enterprise affects QoL statements
}

interface CapitalScore {
  form: CapitalForm;
  score: number;                     // 1-5
  note: string;
}

type CapitalForm =
  | 'financial' | 'material' | 'living' | 'social'
  | 'intellectual' | 'experiential' | 'spiritual' | 'cultural';

// ─── Nodal Intervention ───
interface NodalIntervention {
  action: string;
  timing: string;
  investment: string;
  why: string;
  cascade: CascadeStep[];
  setupFor: string;                  // What this enables next
  dailyRealityAfter: string;         // What changes in daily routine
  validationSignal: string;          // How you know it's working
  failureSignal: string;             // How you know it's not
}

interface CascadeStep {
  emoji: string;
  label: string;
}

// ─── Weekly Rhythm ───
interface WeeklyRhythm {
  days: DayTemplate[];
  peakSeason: string;                // Description of the intense season
  restSeason: string;                // Description of the rest/planning season
}

interface DayTemplate {
  day: string;                       // "Monday", "Tuesday", etc.
  focus: string;                     // "Planning + maintenance"
  blocks: TimeBlock[];
  hardStop: string;                  // "3:00 PM"
}

interface TimeBlock {
  time: string;
  activity: string;
  enterprise?: string;               // Which enterprise this serves
}

// ─── Validation ───
interface ValidationCheck {
  qolStatement: string;
  question: string;
  inputType: 'number' | 'scale' | 'boolean' | 'text';
  target: string;
  frequency: 'daily' | 'weekly' | 'seasonal';
}

interface SeasonalPhase {
  name: string;                      // "Spring", "Summer", etc.
  months: string;
  primaryActivities: string[];
  qolPressure: string[];             // Which QoL statements are under pressure
  qolNatural: string[];              // Which QoL statements are naturally honored
  protectAtAllCosts: string;         // The one thing to safeguard
}

// ─── Generated Map ───
interface GeneratedMap {
  id: string;                        // URL-friendly slug
  userId: string;
  conversationId: string;
  context: AccumulatedContext;        // Snapshot of context at generation time
  documentMarkdown: string;          // The generated document text
  canvasData: CanvasData;            // Structured data for canvas rendering
  createdAt: Date;
  updatedAt?: Date;                  // Updated on seasonal review
  isPublic: boolean;                 // Shareable via URL
}

interface CanvasData {
  essence: { name: string; land: string; phrase: string };
  qolNodes: string[];
  productionNodes: string[];
  resourceNodes: string[];
  capitalProfile: CapitalScore[];
  fieldLayers: FieldLayer[];
  enterprises: EnterpriseRecommendation[];
  nodalInterventions: NodalIntervention[];
  weeklyRhythm?: WeeklyRhythm;
}
```

### Database Schema (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations (Design Mode sessions)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'active',
  current_phase TEXT DEFAULT 'ikigai',
  context JSONB DEFAULT '{}',         -- AccumulatedContext as JSONB
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role TEXT NOT NULL,                  -- 'user' or 'assistant'
  content TEXT NOT NULL,
  phase TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Generated Maps (the shareable output)
CREATE TABLE maps (
  id TEXT PRIMARY KEY,                 -- URL slug: 'sarah-chen-rogue-valley'
  user_id UUID REFERENCES users(id),
  conversation_id UUID REFERENCES conversations(id),
  context JSONB NOT NULL,
  document_markdown TEXT,
  canvas_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Weekly Reviews (Operate Mode — v1.5)
CREATE TABLE weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  map_id TEXT REFERENCES maps(id),
  week_start DATE NOT NULL,
  checks JSONB NOT NULL,              -- Array of {question, answer, target}
  huma_insight TEXT,                   -- AI-generated pattern observation
  adjustment TEXT,                     -- Suggested systemic change
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pattern Library (curated for MVP — becomes protocol-level later)
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL,                -- 'agriculture', 'business', 'education', etc.
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  situation TEXT NOT NULL,             -- When this pattern applies
  action TEXT NOT NULL,                -- What to do
  principle TEXT NOT NULL,             -- Why it works
  adaptations JSONB DEFAULT '[]',     -- Context-specific variations
  connections JSONB DEFAULT '[]',      -- Related pattern IDs
  validation_count INTEGER DEFAULT 0,
  validation_score FLOAT DEFAULT 0,
  contributor_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_maps_user ON maps(user_id);
CREATE INDEX idx_weekly_reviews_user_map ON weekly_reviews(user_id, map_id);
CREATE INDEX idx_patterns_domain ON patterns(domain);
CREATE INDEX idx_patterns_validation ON patterns(validation_score DESC);
```

---

## 04 — Beachhead MVP: AI Engine Architecture

### System Prompt Architecture

The AI engine is a structured prompt system, not a fine-tuned model. This is deliberate — it keeps the intelligence in our code, not in a provider's weights, making us provider-agnostic.

```
┌─────────────────────────────────────┐
│         BASE SYSTEM PROMPT           │
│  Identity, voice, principles,        │
│  anti-patterns, ISRU principle       │
│  (~1,500 tokens — always loaded)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       PHASE-SPECIFIC PROMPT          │
│  Current phase instructions,         │
│  what to listen for, when to         │
│  transition, how to synthesize       │
│  (~800 tokens — swapped per phase)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      ACCUMULATED CONTEXT             │
│  Phase syntheses from prior          │
│  transitions, operator name,         │
│  location, key themes                │
│  (~200-800 tokens — grows)           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     REFERENCE DATA (conditional)     │
│  Enterprise templates (Phase 4),     │
│  Pattern library excerpts,           │
│  Location-specific data              │
│  (~1,000-3,000 tokens — phase-dep)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     PHASE TRANSITION SIGNALS         │
│  [[PHASE:xxx]] markers               │
│  [[CONTEXT:xxx]] extractions         │
│  (~200 tokens — always loaded)       │
└─────────────────────────────────────┘
```

**Total system prompt: ~3,500–6,000 tokens depending on phase.** This leaves ample room for conversation history within a 200K context window.

### API Route Architecture

```
POST /api/chat
  Input:  { conversationId, message, phase }
  Process:
    1. Load conversation from DB
    2. Build system prompt: base + phase + context + reference data
    3. Call Claude API with conversation history + system prompt
    4. Parse response for [[PHASE:xxx]] and [[CONTEXT:xxx]] markers
    5. Strip markers from visible response
    6. If phase transition: update conversation phase, store context extraction
    7. Save message to DB, return response to client
  Output: { response, phase, phaseTransition?, contextUpdate? }

POST /api/generate-map
  Input:  { conversationId }
  Process:
    1. Load conversation with all context syntheses
    2. Build document generation prompt with structured context blocks
    3. Call Claude API (Opus for quality) with generation prompt
    4. Parse response into structured CanvasData + document markdown
    5. Generate URL slug from operator name + location
    6. Save map to DB
  Output: { mapId, mapUrl }

GET /api/map/[id]
  Input:  { id (URL slug) }
  Process: Load map from DB
  Output: { canvasData, documentMarkdown, metadata }
```

### Phase Transition Mechanics

The AI signals transitions by appending markers to its response:

```
"...now I want to understand the land itself."
[[PHASE:landscape]]
[[CONTEXT:holistic-synthesis]]Quality of life centered on family presence
and creative outdoor work. Production through food growing, ecological
restoration, and community education. Resource base: soil health, financial
independence within 3 years, family time protected.
```

The client-side parser:

```typescript
interface ParsedResponse {
  visibleText: string;           // Markers stripped
  phaseTransition?: Phase;
  contextExtraction?: {
    key: string;                 // e.g., 'holistic-synthesis'
    value: string;
  };
}

function parseResponse(raw: string): ParsedResponse {
  const phaseMatch = raw.match(/\[\[PHASE:(\w[\w-]*)\]\]/);
  const contextMatch = raw.match(/\[\[CONTEXT:([\w-]+)\]\]([\s\S]*?)(?=\[\[|$)/);

  return {
    visibleText: raw
      .replace(/\[\[PHASE:[\w-]+\]\]/g, '')
      .replace(/\[\[CONTEXT:[\w-]+\]\][\s\S]*?(?=\[\[|$)/g, '')
      .trim(),
    phaseTransition: phaseMatch ? phaseMatch[1] as Phase : undefined,
    contextExtraction: contextMatch ? {
      key: contextMatch[1],
      value: contextMatch[2].trim(),
    } : undefined,
  };
}
```

### AI Provider Abstraction

```typescript
// The AI engine is provider-agnostic by design.
// Swap Claude for any provider by implementing this interface.

interface AIProvider {
  chat(params: {
    systemPrompt: string;
    messages: { role: 'user' | 'assistant'; content: string }[];
    maxTokens?: number;
    model?: string;
  }): Promise<{ content: string }>;
}

// Claude implementation
class ClaudeProvider implements AIProvider {
  async chat(params) {
    return anthropic.messages.create({
      model: params.model || 'claude-sonnet-4-20250514',
      max_tokens: params.maxTokens || 1500,
      system: params.systemPrompt,
      messages: params.messages,
    });
  }
}

// Future: open-weight model implementation
class LocalModelProvider implements AIProvider {
  // Uses vLLM, llama.cpp, or similar
  // Same interface, local execution
}
```

---

## 05 — Beachhead MVP: Application Routes

```
/ ──────────────────── Landing page
                       "See your life as a connected whole"
                       Single CTA → /begin

/begin ─────────────── Pre-conversation screen
                       Name input + optional location
                       → /conversation

/conversation ──────── The 6-phase AI conversation
                       Chat interface (left) + canvas preview (right, desktop)
                       Phase indicator in header
                       On completion → "Generate your map"

/map/[id] ─────────── The Living Canvas (public, shareable)
                       Canvas view (default) / Document view (toggle)
                       Print / Share / "Start your own map"

/review ────────────── Weekly Review (v1.5, paid tier)
                       QoL validation checks
                       HUMA insight + adjustment

/api/chat ─────────── POST: conversation endpoint
/api/generate-map ──── POST: map generation
/api/map/[id] ──────── GET: map data
/api/review ────────── POST: weekly review (v1.5)
```

### Page Component Architecture

```
src/
├── app/
│   ├── layout.tsx                    # Root layout, fonts, metadata
│   ├── page.tsx                      # Landing page
│   ├── begin/page.tsx                # Name + location input
│   ├── conversation/page.tsx         # The 6-phase chat experience
│   ├── map/[id]/page.tsx             # Living Canvas + Document view
│   ├── review/page.tsx               # Weekly Review (v1.5)
│   └── api/
│       ├── chat/route.ts             # Conversation endpoint
│       ├── generate-map/route.ts     # Map generation
│       └── map/[id]/route.ts         # Map data
├── engine/
│   ├── types.ts                      # All TypeScript interfaces (from Section 03)
│   ├── prompts.ts                    # System prompt architecture
│   ├── operational-prompts.ts        # QoL decomposition, weekly review, etc.
│   ├── enterprise-templates.ts       # Reference data for enterprise phase
│   ├── prompt-builder.ts             # Assembles full prompt per phase
│   └── response-parser.ts            # Extracts markers, updates context
├── components/
│   ├── chat/
│   │   ├── Chat.tsx                  # Messages + input
│   │   └── PhaseIndicator.tsx        # Current phase display
│   ├── canvas/
│   │   ├── LivingCanvas.tsx          # The spatial map
│   │   ├── EssenceCore.tsx           # Center: name, land, phrase
│   │   ├── QoLRing.tsx               # Ring 1: quality of life nodes
│   │   ├── ProductionRing.tsx        # Ring 2: production forms
│   │   ├── ResourceRing.tsx          # Ring 3: future resource base
│   │   ├── CapitalProfile.tsx        # 8 circles sized by strength
│   │   ├── FieldLayers.tsx           # Landscape layer strip
│   │   ├── EnterpriseCards.tsx       # Enterprise grid
│   │   ├── NodalActions.tsx          # Nodal intervention cards
│   │   └── WeeklyRhythm.tsx         # Operational rhythm (v1.5)
│   └── document/
│       └── MapDocument.tsx           # Linear/print rendering of same data
├── lib/
│   ├── ai-provider.ts               # Provider abstraction
│   ├── db.ts                         # Database client
│   ├── fonts.ts                      # Font configuration
│   └── utils.ts                      # Shared utilities
└── styles/
    └── design-tokens.ts              # HUMA color palette, typography scale
```

---

## 06 — Full Application: Design Mode

Design Mode is the beachhead MVP extended with two additional capabilities:

### Visual/Conversational Hybrid Onboarding

The pure conversation works but can be intimidating. The full Design Mode offers a hybrid:

```
Phase 1 (Ikigai):
  - Conversational opening → "What brought you here?"
  - Then: visual selection screens
    - "What do you love?" → grid of illustrated categories
      (growing things, building, teaching, animals, cooking,
       creating, organizing, healing, exploring...)
    - "What are you good at?" → same format
    - "What does your world need?" → same format
    - "What sustains you?" → same format
  - AI synthesizes the selections + any conversation context
  - Operator confirms or refines the synthesis

Phase 2 (Holistic Context):
  - Mix of conversation and structured input
  - QoL statements can be selected from examples OR typed freely
    - Examples shown as cards with illustrations
    - "Evenings free for family" / "Financial independence"
    - "Time for creative work" / "Physical health"
  - AI decomposes each selected statement into enabling conditions
  - Operator validates or adjusts

Phase 3 (Field/Landscape):
  - Location input triggers data pre-fill (climate, geography)
  - Layer-by-layer guided assessment
  - Each layer: conversational OR quick-select options
  - AI synthesizes with integrated data

Phase 4-6: Same as MVP but with richer visual presentation
```

### Canvas-Alongside-Conversation

On desktop, the conversation and canvas are side-by-side. As the operator progresses through phases, their canvas builds in real time:

```
┌───────────────────┬────────────────────────┐
│                   │                        │
│   CONVERSATION    │    LIVING CANVAS       │
│                   │                        │
│   [Phase 2 of 6] │    ┌──────────┐       │
│                   │    │ Essence  │       │
│   HUMA: "You said │    └────┬─────┘       │
│   evenings free   │    ┌────▼─────┐       │
│   matter most..." │    │ QoL Ring │ ← NEW │
│                   │    └────┬─────┘       │
│   > "Yes, by 4pm  │    │  ···      │       │
│   on school days"  │    │ (building) │       │
│                   │    │           │       │
│   [────────────]  │                        │
│   [  Send   ▷ ]  │                        │
└───────────────────┴────────────────────────┘
```

Each ring fades in with a subtle animation when its phase synthesizes. By the time the conversation completes, the full canvas is already visible — no "generating..." wait at the end.

---

## 07 — Full Application: Operate Mode

### Morning Briefing

```
GET /api/briefing
  Input: { userId, date }
  Process:
    1. Load user's active map and weekly rhythm
    2. Determine today's day template
    3. Check weather API for location (if available)
    4. Check any flags from last weekly review
    5. Generate 30-second briefing via AI
  Output: { briefing: string, tasks: Task[], hardStop: string }
```

The briefing is a push notification or a card shown when the user opens the app. 30 seconds of reading. Not a dashboard — a message from a trusted farmhand.

### Weekly Review

```
POST /api/review
  Input: { userId, mapId, checks: ValidationAnswer[] }
  Process:
    1. Load user's QoL validation protocol
    2. Load last 4 weekly reviews for trend analysis
    3. Build weekly review prompt with current + historical data
    4. AI generates: pattern observation + suggested adjustment
    5. Save review to DB
  Output: { insight: string, adjustment?: string, seasonalNote: string }
```

**Data flow for pattern recognition:**

```
Week 1: evenings free = 5/7 ✓
Week 2: evenings free = 4/7 ↓
Week 3: evenings free = 3/7 ↓↓  ← Pattern detected
Week 4: AI surfaces: "Third week in a row. This isn't discipline —
         it's the packing system. Your harvest crops are scattered
         across 8 beds instead of clustered."
```

The AI has access to:
- All weekly review data for this user
- The enterprise templates (to compare actual vs projected labor)
- The QoL decomposition (to identify which enabling condition is breaking)
- Patterns from other operators with similar contexts (as the library grows)

---

## 08 — Full Application: Evolve Mode

### Seasonal Review

```
POST /api/seasonal-review
  Input: { userId, mapId, season }
  Process:
    1. Load all weekly reviews for the season (12-14 weeks)
    2. Load enterprise performance data (if tracked)
    3. Load map context for comparison
    4. Build seasonal review prompt with full temporal data
    5. AI generates comprehensive review
    6. If user approves: regenerate canvas with updated data
  Output: {
    capitalShift: CapitalScore[],     // How 8 forms changed
    qolTrends: QoLTrend[],           // Which statements held, which didn't
    enterpriseActuals: {...},          // vs. projections
    evolutionQuestion: string,         // "What do you know now...?"
    nextNodalIntervention: NodalIntervention,
    updatedCanvasData: CanvasData
  }
```

### Pattern Contribution

When a seasonal review reveals a novel insight, the system can offer to contribute it as a pattern:

```typescript
interface PatternContribution {
  // Extracted from the operator's lived experience
  situation: string;        // "CSA packing day consistently runs over time"
  discovery: string;        // "Clustering harvest crops by delivery day in bed
                            //  layout eliminated 30min per packing session"
  context: {                // The Field in which this was discovered
    domain: string;         // "agriculture"
    subDomain: string;      // "CSA operations"
    scale: string;          // "25-50 members"
    climate?: string;       // "Zone 7b"
    season?: string;        // "Summer peak"
  };
  validation: {
    weeksObserved: number;  // How long the pattern has been tested
    beforeMetric: string;   // "Packing took 3.5 hours"
    afterMetric: string;    // "Packing now takes 2 hours"
    confidence: 'emerging' | 'validated' | 'proven';
  };
  contributor: {
    userId: string;
    attribution: string;    // How they want to be credited
  };
}
```

**The contribution is voluntary and attributed.** The operator chooses whether to contribute. Their name or pseudonym is permanently attached. In the protocol-level future (Section 13), this attribution becomes cryptographic and compensable.

---

## 09 — The Living Canvas: Technical Specification

The canvas is HUMA's signature visual artifact. It must work in three contexts:

1. **Interactive (web):** Hoverable, clickable, animated
2. **Static (share preview):** OG image, social media cards
3. **Print (PDF):** Clean black-and-white-safe rendering

### Canvas Component Architecture

```typescript
interface CanvasProps {
  data: CanvasData;
  mode: 'interactive' | 'static' | 'print';
  buildProgress?: number;    // 0-6 for progressive reveal during conversation
}
```

### Rendering Strategy

The canvas uses **CSS Grid + SVG** (not canvas/WebGL) for maximum compatibility:

```
- Outer container: CSS Grid for ring layout
- QoL/Production/Resource nodes: CSS flex with gap
- Capital profile: SVG circles
- Field layers: CSS Grid (horizontal strip)
- Enterprise cards: CSS Grid (2-column)
- Nodal interventions: CSS flexbox
- Connection lines (future): SVG overlay layer
```

**Why not D3/Three.js?** The canvas must be printable, shareable as a static image, and server-renderable for OG previews. CSS + SVG achieves all three. Interactive enhancements (hover effects, click-to-expand) are CSS transitions and minimal JS. Heavy charting libraries add weight without adding value for this use case.

### Progressive Build Animation

During the conversation, the canvas builds ring by ring:

```typescript
// Phase completion triggers ring reveal
const RING_PHASES: Record<Phase, number> = {
  'ikigai': 0,                 // Essence core appears
  'holistic-context': 1,       // QoL + Production + Resource rings
  'landscape': 2,              // Field layers + Capital profile
  'enterprise-map': 3,         // Enterprise cards
  'nodal-interventions': 4,    // Nodal action cards
  'operational-design': 5,     // Weekly rhythm (if visible)
  'complete': 6,               // Full canvas, all rings
};

// Each ring enters with a fade-in + subtle scale-up
// Duration: 600ms, ease-out
// Stagger: child nodes within a ring animate with 50ms delay each
```

### OG Image Generation

For shareable links, generate a static canvas image server-side:

```
GET /api/og/[mapId]
  → Server renders canvas as HTML
  → Puppeteer/Playwright screenshots at 1200×630
  → Returns PNG

Meta tags on /map/[id]:
  <meta property="og:title" content="Regenerative Enterprise Map for Sarah Chen">
  <meta property="og:description" content="Rogue Valley · 5 enterprises · Generated by HUMA">
  <meta property="og:image" content="/api/og/sarah-chen-rogue-valley">
```

---

## 10 — Protocol Layer: RPPL Specification

*This section describes the future open protocol. It is not built in the MVP but the MVP's data model is designed to be forward-compatible.*

### Pattern Schema (RPPL v0.1)

```yaml
# Every pattern in the RPPL library conforms to this schema.
# This is the unit of knowledge that flows through the medium.

rppl_version: "0.1"
pattern:
  id: "rppl:batching:production-workflow:v1"
  name: "Production Batching"
  version: 1

  # What situation this pattern addresses
  situation:
    description: "Repetitive production tasks spread across multiple days,
                  creating context-switching overhead and inconsistent output"
    domains: ["manufacturing", "agriculture", "food-service", "education"]
    signals:
      - "Same task done partially on multiple days"
      - "Significant setup/teardown time per session"
      - "Quality varies between sessions"

  # What to do
  action:
    description: "Consolidate all instances of a repetitive task into
                  dedicated batch sessions. Design batch size to fill
                  the natural energy arc of a work session."
    steps:
      - "Inventory all instances of the task across your week"
      - "Identify the natural batch size (enough to justify setup,
         not so much it exceeds one session's energy)"
      - "Assign dedicated time blocks for batch sessions"
      - "Redesign physical space to support flow (all inputs staged)"
    adaptations:
      agriculture:
        note: "Cluster same-harvest crops in adjacent beds to batch
               harvest + wash + pack in a single flow"
      education:
        note: "Batch all grading for one assignment type in one session
               rather than grading across assignments daily"

  # Why it works
  principle: "Context-switching has a cognitive and physical cost that
              compounds with frequency. Batching amortizes setup cost
              across more units and allows flow state to develop."

  # Connections to other patterns
  connections:
    synergies:
      - "rppl:time-blocking:weekly-rhythm:v2"
      - "rppl:workspace-design:flow-station:v1"
    prerequisites:
      - "rppl:task-inventory:weekly-audit:v1"
    conflicts:
      - "rppl:responsive-scheduling:on-demand:v1"

  # Holonic nesting
  holonics:
    part_of:
      - "rppl:operational-efficiency:workflow-design:v1"
    contains:
      - "rppl:setup-reduction:staging:v1"
      - "rppl:energy-management:session-sizing:v1"

  # Validation
  validation:
    total_applications: 847
    success_rate: 0.82
    contexts_validated:
      - { domain: "agriculture", sub: "CSA packing", n: 234, rate: 0.89 }
      - { domain: "manufacturing", sub: "small batch", n: 156, rate: 0.84 }
      - { domain: "education", sub: "grading", n: 89, rate: 0.76 }
    avg_improvement: "28% time reduction, 15% quality improvement"
    confidence: "proven"

  # Attribution
  attribution:
    original_contributor:
      id: "user:at-shoemaker-1847"
      name: "Franz Müller"
      context: "Bespoke shoemaking, Salzburg"
      date: "2027-03-15"
    significant_adaptations:
      - contributor: "user:sarah-chen-rogue"
        adaptation: "Bed-layout clustering for harvest batching"
        date: "2027-08-22"
        validation_boost: 0.04
```

### Pattern Query Language

```
// Find patterns relevant to a specific Field
MATCH patterns
  WHERE situation.domains CONTAINS "agriculture"
  AND validation.confidence >= "validated"
  AND connections.prerequisites ALL SATISFIED BY user.active_patterns
  ORDER BY relevance_to(user.field)
  LIMIT 10

// Find cross-domain transfers
MATCH patterns
  WHERE situation.domains CONTAINS "manufacturing"
  AND principle SIMILAR TO pattern("rppl:batching:*").principle
  AND NOT situation.domains CONTAINS "agriculture"
  // Returns batching patterns from other domains
  // that might transfer to agriculture
```

*The query language is aspirational. The MVP implements this as AI-mediated search: the AI reads the pattern library and identifies relevant patterns based on the operator's context. Formal query language comes with the protocol specification.*

### Pattern Discovery Pipeline

New patterns are discovered through three channels:

1. **Researcher skill** — Claude mines source traditions, translates patterns
   across domains, and identifies structural gaps (see huma-researcher skill)
2. **Operator practice** — Operators living through HUMA surface patterns
   through seasonal reviews (future — requires Evolve Mode)
3. **Community contribution** — External contributors submit patterns
   through the contributor protocol (future — requires open RPPL spec)
4. **Population simulation** — Synthetic operators run through HUMA's full
   Design → Operate → Evolve arc, producing emergent patterns, cascade
   validation data, dimension coupling models, and RPPL grammar rules
   (see huma-researcher skill, Program 4: SIMULATE)

All patterns must pass the completeness checklist (16/20 minimum) and
stress testing before entering the library. Research logs are maintained
in docs/research/.

### Pattern Compilation

Patterns are executable, not just readable. The compiler takes (pattern + operator field) and produces an adapted action plan.

Compilation resolves six operations:
1. **Domain Selection** — which adaptation applies given the operator's context
2. **Field Constraints** — how the operator's dimensions, behavioral profile, and energy capacity modify the pattern's parameters
3. **Prerequisite Check** — whether the field satisfies pattern requirements; if not, recommend prerequisite patterns
4. **Conflict Check** — whether active patterns interfere; surface tensions explicitly
5. **Node Identification** — where in the operator's situation this pattern has maximum leverage
6. **Capital Prediction** — what capitals this pattern will build and cost in this specific field

The compiler is implemented as a structured prompt that receives pattern YAML + operator field data and produces the adapted plan. Compiler quality is measurable and improvable via the researcher's TUNE program.

### Field Dynamics Model

After sufficient population simulation data (target: 50 operators × 12 weeks = 600 operator-weeks), a dimensional coupling model can be estimated:

```
D_i(t+1) = D_i(t)
  + Σ_j [coupling(i,j) × ΔD_j(t)]      # cross-dimension effects
  + pattern_impact(active_patterns, i)    # pattern effects
  + disruption(i, t)                      # random life events
  - decay(i)                              # natural decay without maintenance
```

Key parameters to discover:
* `coupling(i,j)` matrix — 8×8 directional coupling strengths
* `decay(i)` rates — how fast each dimension declines without active patterns
* `phase_transition` thresholds — nonlinear breakpoints (e.g., money < 1.5 triggers system-wide crisis acceleration)
* `flourishing` thresholds — when 3+ dimensions above 4, positive cascades amplify

The model starts crude and refines with more data. Initial estimates come from simulation; real operator data validates and adjusts.

### Transformer Schema

Transformers are discoverable structural mechanisms for cross-domain pattern transfer. Schema:

```yaml
transformer:
  id: string                    # Format: "rppl:transformer:{name}:{version}"
  name: string
  source_pattern: string        # Pattern ID
  domain_pair: [string, string] # The two domains bridged

  preserves:                    # What the principle maintains across domains
    - string

  modifies:                     # What changes between domains
    - aspect: string
      domain_a: string          # How it expresses in domain A
      domain_b: string          # How it expresses in domain B

  breaks_when:                  # Where the analogy fails
    - string

  provenance:
    discovered_by: string       # researcher | operator | contributor
    discovery_method: string    # cross-domain-translation | simulation | practice
    date: string
```

### Living Pattern Evolution

Pattern lifecycle stages:

| Stage | Trigger | What Changes |
|---|---|---|
| Birth | Discovery via researcher or contribution | Pattern enters library at "seed" confidence |
| Application | Operator applies pattern | Application count increments, context recorded |
| Mutation | Operator adapts pattern to their field | Adaptation recorded as variant |
| Selection | Successful adaptations reinforced | Success rate by context updates, visibility weighted |
| Speciation | Variant diverges significantly | New pattern created, referencing parent |
| Evolution | Aggregated data from applications | Steps, prerequisites, failure modes update |
| Death | Success rate < 30% after 50+ applications | Pattern deprecated with full evolutionary history |

Implementation: the validation section of the pattern schema already supports applications count, success_rate, and contexts array. Evolution requires a pattern_history field and variant tracking.

---

## 11 — Protocol Layer: Validation System

### Validation is Practice-Based, Not Authority-Based

A pattern is not validated by a review board. It is validated by aggregate outcomes from people who used it in practice.

```typescript
interface ValidationEvent {
  patternId: string;
  userId: string;
  field: FieldSummary;           // Context in which pattern was applied
  outcome: {
    applied: boolean;            // Did they actually use it?
    duration: string;            // How long they used it
    beforeMetric?: string;       // State before
    afterMetric?: string;        // State after
    selfAssessment: 1 | 2 | 3 | 4 | 5;
    wouldRecommend: boolean;
    adaptationMade?: string;     // How they modified it
    contextNotes?: string;       // Qualitative notes
  };
  timestamp: Date;
}
```

### Validation Score Computation

```
pattern.validationScore =
  (successRate × 0.4) +
  (contextDiversity × 0.2) +
  (temporalConsistency × 0.2) +
  (adaptationRichness × 0.1) +
  (recency × 0.1)

Where:
  successRate = % of applications with selfAssessment >= 3 AND wouldRecommend
  contextDiversity = unique (domain, subDomain) pairs / total applications
  temporalConsistency = success rate stability over last 6 months
  adaptationRichness = number of validated adaptations
  recency = decay function favoring recent validations
```

**Why not just count applications?** A pattern used 10,000 times in one narrow context is less valuable than a pattern used 500 times across 12 different domains. Context diversity is a signal of deep structural validity — the underlying principle actually works, not just the specific implementation.

---

## 12 — Protocol Layer: Attribution & Identity

### Self-Sovereign Contribution

```typescript
interface ContributorIdentity {
  // The contributor controls their identity.
  // HUMA stores a reference, not the identity itself.
  did: string;                   // Decentralized Identifier
  displayName: string;           // What they want to be called
  publicKey: string;             // For cryptographic attribution

  // Attribution is signed by the contributor
  // and cannot be modified by the platform
  contributions: SignedContribution[];
}

interface SignedContribution {
  patternId: string;
  type: 'original' | 'adaptation' | 'validation';
  description: string;
  timestamp: Date;
  signature: string;             // Cryptographic proof of authorship
}
```

### Attribution Chain

When a pattern is adapted, the attribution chain grows:

```
Pattern: "Production Batching" v1
  └─ Original: Franz Müller (shoemaker, Salzburg)
      └─ Adaptation: "Harvest Batching" v1
          └─ Sarah Chen (farmer, Oregon)
              └─ Adaptation: "Lesson Plan Batching" v1
                  └─ María López (teacher, Oaxaca)
```

All three contributors share attribution. When the pattern is applied in any form, the chain is visible and — when compensation is active — value flows upstream proportionally.

### Forward Compatibility

The MVP stores contributor IDs as simple UUIDs linked to user accounts. When the protocol layer adds cryptographic identity, these can be migrated:

```sql
-- MVP: simple reference
ALTER TABLE patterns ADD COLUMN contributor_did TEXT;
-- Protocol: cryptographic reference
-- Migration: user generates DID, signs all existing contributions,
-- platform stores DID reference alongside legacy UUID
```

---

## 13 — Protocol Layer: Value Exchange

*Designed for, not built in MVP.*

### Principles

1. **Value flows to contributors automatically** — not through a platform's discretion
2. **The mechanism is protocol-level** — any RPPL-compatible application must implement it
3. **Compensation is proportional to validated usage** — not to popularity or engagement
4. **The mechanism must work without cryptocurrency** — tokens are an option, not a requirement

### Possible Mechanisms (to be evaluated)

**Option A: Protocol Fee + Distribution**
Every application that uses the RPPL library pays a protocol fee (e.g., 1% of subscription revenue). Fees are distributed to contributors proportional to their patterns' validated usage. Simple. Requires a neutral fee collection entity.

**Option B: Direct Licensing**
Patterns carry licensing terms. Applications pay contributors directly per usage. More decentralized but more complex. Requires usage tracking at the protocol level.

**Option C: Token-Based**
A protocol token represents contribution value. Contributors earn tokens through validated pattern contributions. Tokens can be exchanged for services, held, or traded. Most decentralized but carries regulatory and perception risk.

**Option D: Reputation-Only (initial)**
No monetary compensation initially. Contributors build visible reputation scores that translate into professional opportunities, consulting clients, speaking invitations, etc. The medium makes expertise visible and verifiable. Simplest to implement. May be sufficient for early phases.

**Current decision: Design the attribution layer to support any of these mechanisms. Ship with Option D (reputation). Add monetary compensation when the pattern library has sufficient volume to make it meaningful.**

---

## 14 — Security, Privacy & Ethics

### Data Principles

1. **Operators own their data.** Full export. Full delete. No data lock-in.
2. **Pattern contributions are public by default** (that's the point) but operators choose whether to contribute. Never automatic.
3. **Conversation content is private.** Only the operator can see their full conversation. HUMA the company cannot read individual conversations unless given explicit access for support.
4. **Aggregated insights are anonymized.** "Operators in Zone 7 with CSA >25 members report packing time issues" — no individual data exposed.
5. **The AI sees context but doesn't train on it.** Claude API calls are not used for model training (per Anthropic's data policy). When using open-weight models locally, data never leaves the user's device.

### Threat Mitigations

| Threat | Mitigation |
|--------|-----------|
| Platform captures the pattern library | Open protocol specification released before value concentration |
| AI provider discontinues or changes terms | Provider-agnostic architecture; open-weight model fallback |
| Government demands content regulation | Pattern validation is distributed; no single authority to compel |
| Bad actors submit harmful patterns | Validation is practice-based; harmful patterns fail validation naturally |
| Data breach exposes operator contexts | Conversation data encrypted at rest; maps are public by operator choice |
| Competitor scrapes the pattern library | The library is open by design; the competitive moat is the intelligence layer + contributor network |

### Ethical Guardrails

The AI engine must never:
- Recommend patterns that the operator has explicitly rejected
- Override the operator's QoL statements with "optimal" alternatives
- Use shame, guilt, or comparison as motivational tools
- Present unvalidated patterns as if they were proven
- Suggest that using HUMA is necessary for success (Sanford test: build capacity, not dependency)

---

## 15 — Build Sequence (Summary)

### Week 1–2: Beachhead MVP Core
- [ ] Project setup (Next.js, Tailwind, Supabase)
- [ ] Database schema (users, conversations, messages, maps)
- [ ] AI engine: prompt builder + response parser
- [ ] Pre-conversation name/location screen
- [ ] 6-phase conversation flow with real Claude API
- [ ] Basic chat UI with phase indicator

### Week 3–4: Output + Polish
- [ ] Map generation (document + canvas data)
- [ ] Living Canvas component (static rendering)
- [ ] Document view component (print-optimized)
- [ ] Share URL with OG image generation
- [ ] Print/PDF functionality
- [ ] Landing page
- [ ] Enterprise data templates integrated into Phase 4

### Week 5–6: First Users
- [ ] Deploy to production (Vercel + Supabase)
- [ ] Email auth (magic links)
- [ ] 10 operators through the full flow
- [ ] Collect feedback, iterate on prompts
- [ ] First pattern contributions (manual curation)

### Month 2–3: Operate Mode (v1.5)
- [ ] Weekly review flow
- [ ] QoL validation tracking
- [ ] Pattern recognition across weeks
- [ ] Morning briefing (simple version)
- [ ] Payment integration (Stripe, $29/mo)

### Month 4–6: Evolve Mode (v2)
- [ ] Seasonal review flow
- [ ] Canvas update from seasonal data
- [ ] Pattern contribution interface
- [ ] Pattern library browsing
- [ ] Cross-domain pattern visibility

### Month 6–12: Protocol Foundations
- [ ] RPPL v0.1 specification draft
- [ ] Pattern schema formalization
- [ ] Contributor identity system
- [ ] Open-weight model integration testing
- [ ] API for third-party applications

### Year 2+: The Medium
- [ ] RPPL specification published as open standard
- [ ] Distributed validation system
- [ ] Contributor compensation mechanism
- [ ] Third-party application ecosystem
- [ ] The pattern library outgrows HUMA

---

*This specification is alive. It will be updated as we build, as operators teach us what works, and as the medium reveals what it needs to become.*

*HUMA · Technical Specification · March 2026 · Confidential*

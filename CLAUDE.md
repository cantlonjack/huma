# HUMA — A New Medium for Human Knowledge

## What This Is

HUMA is a living medium where the best way to do anything flows to the people who need it, shaped to their specific situation, and every life lived through it makes it smarter for everyone else.

The application layer is a visual, intuitive tool with three modes: DESIGN (paint your reality and vision, get a bridge), OPERATE (daily/weekly guidance validated against your vision), and EVOLVE (seasonal review that updates the map and contributes patterns to the commons).

The protocol layer is RPPL: Reality Pattern Programming Language — an open standard for structured, contextual, validated, connected, living knowledge. The application makes money. The protocol makes history.

**Beachhead market:** Regenerative agriculture operators and homesteaders. The architecture is universal — the first users are specific.

Read `/docs/HUMA_FOUNDATIONAL_TRUTH.md` for the full vision. Read `/docs/HUMA_TECHNICAL_SPECIFICATION.md` for the engineering blueprint. These are the north star documents.

## The Three Modes

**DESIGN MODE (the hook):** A 6-phase conversation and/or visual onboarding that paints reality + vision and produces a Living Canvas. Free tier. The shareable artifact. Done once, revisited seasonally.

**OPERATE MODE (the product):** Morning briefing (30 sec, daily) + Weekly review (10 min, Sunday). Turn-by-turn guidance validated against QoL statements. $29/month. The core retention loop.

**EVOLVE MODE (the moat):** Seasonal review (30 min, quarterly). Canvas update. Pattern contribution to the commons. $99/month professional tier. The flywheel that grows the pattern library.

**Design Mode is the hook. Operate Mode is the product. Evolve Mode is the moat.**

## The Key Innovation: QoL Decomposition

Every Quality of Life statement decomposes into an operational chain:

```
QoL Statement ("Evenings free for my daughter")
  → Enabling Conditions (all work done by 3pm, packing batched)
    → Weekly Commitments (Mon: plan, Tue/Thu: pack days)
      → Daily Behaviors (today's schedule with hard stop)
        → Validation (how many evenings free? ___/7)
          → Adjustment (systemic, never personal)
```

The aspiration stays fixed. The operational chain adapts. When validation fails, HUMA ALWAYS looks at the system, NEVER at the person. "What's breaking this?" not "Try harder."

## RPPL Primitives

| Primitive | What it is |
|---|---|
| **Essences** | Irreducible identity of any entity. Not data but a living identity to respect. |
| **Patterns** | Structured, context-sensitive, validated units of knowledge. Holonic, living, contributed. |
| **Fields** | Total context within which patterns express. Same pattern, different field = different expression. |
| **Nodes** | Points of maximum leverage. One action that cascades through the whole system. |
| **Transformers** | Cross-domain bridges. Convert patterns from one context to another while preserving principles. |

## The 6-Phase Design Mode Conversation

1. **Ikigai** — Who are you? (loves, skills, world needs, sustainability)
2. **Holistic Context** — What are you reaching for? (QoL statements WITH operational decomposition)
3. **Field Reading** — What does your context afford? (layers from permanent to flexible)
4. **Enterprise Map** — What could you build? (tested against QoL constraints, with real numbers)
5. **Nodal Interventions** — Where do you begin? (cascade chains, operational reality)
6. **Operational Design** — What does your week look like? (rhythm, validation protocol, seasonal arc)

## The Living Canvas (Primary Output)

Center-outward spatial layout. NOT a text document. Each ring is more concrete than the last:

1. Center: Essence (name, place, core phrase)
2. Ring 1: Quality of Life (sage pills)
3. Ring 2: Production Forms (amber pills)
4. Ring 3: Future Resource Base (sky pills)
5. Capital Profile: 8 circles sized by strength
6. Field Layers: horizontal strip (permanent → flexible)
7. Enterprise Cards: financials + capital dots + fit narratives
8. Nodal Interventions: cascade chains
9. Weekly Rhythm: operational shape of the week

Design references: `/docs/references/huma_living_canvas.html` (canvas view) and `/docs/references/huma_map_reference.html` (document/print view). The canvas is the default. The document is the print-friendly alternate view. Match these references exactly.

## Voice & Language

- Warm, direct, systems-aware. Never wellness clichés, never consultant-speak, never therapist-speak.
- NEVER say: "I hear you saying," "Based on what you've shared," "That's really insightful," "Let's unpack that," "Great question," "I appreciate you sharing that"
- Instead: be direct. Use THEIR language. Talk like someone leaning on a fence post, not sitting behind a desk.
- Prose over bullets. Short clear sentences.
- Avoid: "optimize," "productivity," "hack," "goals," "accountability"
- Use: "what's working," "what wants to happen," "where the leverage is," "what this could become"

## Design System

- **Palette:** Sand backgrounds (#FAF8F3, #F6F1E9), Sage primary (#3A5A40 through #EBF3EC), Amber action (#B5621E), Sky data (#2E6B8A), Earth ink (#1A1714 through #8C8274)
- **Typography:** Cormorant Garamond (display, headings, essence text) + Source Sans 3 (UI, data, labels)
- **Layout:** Max 760px reading width. Generous whitespace. Content flows vertically. No card grids, no dashboard layouts.
- **Feel:** Land deed meets love letter meets field journal. Not SaaS. Not wellness app. Not ag-tech.
- No gamification. No points, badges, streaks. Coherence is the only feedback.

## Tech Stack (MVP)

- Next.js 14+ (App Router) + TypeScript
- Tailwind CSS with custom design tokens
- Claude API (Sonnet for conversation and document generation)
- Upstash Redis for map storage (90-day TTL, localStorage fallback)
- Vercel hosting

## Key Reference Files

- `/docs/HUMA_FOUNDATIONAL_TRUTH.md` — The WHY (vision, medium, market)
- `/docs/HUMA_TECHNICAL_SPECIFICATION.md` — The HOW (architecture, data model, build sequence)
- `/docs/HUMA_DESIGN_CLARIFICATION.md` — Design session record (three modes, QoL decomposition, MapQuest→Google Maps insight)
- `/docs/HUMA_INTELLECTUAL_LINEAGE.md` — Deep source traditions
- `/docs/references/huma_living_canvas.html` — Canvas design reference (MATCH THIS)
- `/docs/references/huma_map_reference.html` — Document view design reference
- `/src/engine/prompts.ts` — System prompt architecture (the product)
- `/src/engine/operational-prompts.ts` — QoL decomposition, weekly review, morning briefing prompts
- `/src/engine/enterprise-templates.ts` — 14 enterprise templates with real numbers

## What HUMA Must Never Do

- Give vague advice without operational specifics
- Fragment a whole into parts without holding the whole in view
- Impose a template for what a good life looks like — surface the user's own essence
- Create dependency — every interaction should develop the user's capacity to see and decide for themselves
- Use shame, guilt, or comparison when validation checks fail — always look at the system
- Treat the pattern library as proprietary — knowledge is a commons, intelligence applied is the product
- Look or feel like a generic SaaS product, wellness app, or chatbot

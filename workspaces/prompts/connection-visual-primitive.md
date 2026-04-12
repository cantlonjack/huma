# Session Brief: Connection Visual Primitive

## The Problem

HUMA's core promise is "see how the parts of your life connect." But the product communicates connections through text — dimension tags on behaviors, correlation sentences in insights, through-lines in the daily sheet. There is no visual or interactive design that makes a connection *felt* rather than *read*.

The force-directed graph on /whole looks like every D3 network visualization. The Capital Pulse on /today is a heatmap (4x2 grid of colored bars), not a system map. Dimension tags ("Body · Money · Home") are metadata, not revelation.

The product needs a **signature visual primitive** — a reusable interaction pattern that appears across pages and makes the moment of connection between two life dimensions feel like a discovery, not a label.

## What Exists Today

### Dimension system (8 dimensions, each with a color)
- Body (#3A5A40), People (#2E6B8A), Money (#B5621E), Home (#8C8274)
- Growth (#2A4A30), Joy (#C87A3A), Purpose (#6B5A7A), Identity (#554D42)

### Where connections surface in data
1. **Daily sheet entries** — each behavior maps to 1-3 dimensions (e.g., "Price the cattle panel trellis" → Money + Home)
2. **Through-line** — one sentence naming today's cross-dimensional theme (e.g., "The garden and the budget are the same project today")
3. **Capital Pulse** — which of the 8 dimensions "moved" today based on check-offs
4. **Insights** — cross-aspiration pattern cards (e.g., "Evening walks correlate with better sleep scores")
5. **Holonic map** — force-directed graph showing aspirations as nodes with dimension-colored connections
6. **Context model** — 9-dimension context object tracking what HUMA knows about the user's life

### Where the primitive would appear
- `/today` — replacing or augmenting the Capital Pulse grid and dimension tags on entries
- `/whole` — replacing or augmenting the force-directed graph
- `/grow` — showing correlations between patterns
- `/start` — the "HUMA now knows" moment when context is extracted during onboarding
- Landing page hero — the product demo (currently shows dimension dots lighting up)

## Design Constraints

Read `workspaces/design.md` and `docs/HUMA_DESIGN_SYSTEM.md` for full specs. Key constraints:

- **Backgrounds:** sand-50 (never white, never #FFF). Cards use white with sand-300 borders.
- **Action color:** amber-600 only for clickable elements
- **Fonts:** Cormorant Garamond (headings) / Source Sans 3 (UI/body)
- **Animation:** ONE easing — `cubic-bezier(0.22, 1, 0.36, 1)`. Nothing bouncy.
- **No dark mode yet, no gradients/shadows/glass, no Material Design, no gamification**
- **Accessibility:** Respect `prefers-reduced-motion` via `useReducedMotion` hook. Touch targets 44x44px min. WCAG AA contrast.
- **The single test:** Does this reduce cognitive load and reveal connections?

## What This Session Should Produce

1. **Design exploration** — 2-3 candidate visual primitives, described in enough detail to evaluate. Think about: What does the user *see* when two dimensions are connected? What does the interaction *feel* like? How does it scale from 2 connections to 20?

2. **A chosen direction** with rationale for why it's the right primitive for this product.

3. **A reusable React component** (or small set of components) that implements the primitive. It should:
   - Accept dimension data as props (which dimensions, strength/recency of connection)
   - Work at multiple scales (inline on a behavior row, standalone on /whole, compact in Capital Pulse)
   - Animate connections appearing/strengthening (respecting reduced motion)
   - Feel distinctive — not a standard chart library widget

4. **Integration plan** — where specifically in the existing UI this replaces or augments what's there, with file paths.

## What NOT to Do

- Don't rebuild the landing page (already stripped down in a separate session)
- Don't redesign page layouts — this is about the visual primitive itself
- Don't add dark mode
- Don't touch the data layer or API routes
- Don't use any chart/graph library (D3, Recharts, etc.) — this should be custom SVG or CSS

## Key Files to Read First

- `workspaces/design.md` — design constraints quick reference
- `docs/HUMA_DESIGN_SYSTEM.md` — full visual specs
- `app/src/app/today/page.tsx` — Today page (where Capital Pulse and dimension tags live)
- `app/src/app/whole/page.tsx` — Whole page (where the force-directed graph lives)
- `app/src/components/today/CompiledEntryRow.tsx` — how dimension tags render on behaviors
- `app/src/lib/capital-computation.ts` — how capital scores are computed
- `app/src/lib/capital-pulse.ts` — current pulse data structure
- `app/src/types/v2.ts` — DimensionKey type and related interfaces

## The Bar

From the design critique: "The team that found Cormorant Garamond and the sand/sage palette has taste — they need to apply that same instinct to inventing the interaction patterns that make systems thinking feel intuitive, not intellectual. The product is one signature visual breakthrough away from being genuinely unforgettable."

The primitive should make someone watching over the user's shoulder ask "what is that?" — not because it's flashy, but because it makes an invisible relationship visible in a way they haven't seen before.

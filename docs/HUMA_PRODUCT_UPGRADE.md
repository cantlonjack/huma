# HUMA Product UI/UX Upgrade
## From Text Generator to Living Design Tool

The current product has two problems:
1. The conversation is a standard chat UI that produces a text document
2. The map output is a linear document that could be a PDF

Neither of these is a product. A product has interactions that create value beyond what the AI generates. The AI is the engine — the product is everything the user can SEE, TOUCH, and MANIPULATE.

This upgrade focuses on three surfaces: the Conversation Experience, the Living Canvas, and the Map Interactions. Each one must do something that a ChatGPT conversation cannot.

---

## UPGRADE 1: THE CONVERSATION EXPERIENCE

### Current state
Standard chat bubbles on a page. Phase indicator at top. Text in, text out.

### Target state
A split-screen experience where the canvas builds in real-time as you talk.

### What to build

**A. Split-screen layout (desktop)**

```
┌─────────────────────────┬──────────────────────────────┐
│                         │                              │
│    CONVERSATION         │      LIVING CANVAS           │
│    (scrollable)         │      (builds live)           │
│                         │                              │
│  Phase: 2 of 6          │   ┌──────────────┐          │
│  ● ● ○ ○ ○ ○           │   │  Sarah Chen   │          │
│                         │   │  Rogue Valley │          │
│  HUMA: You mentioned    │   └──────┬───────┘          │
│  evenings free matter   │     ┌────▼─────┐            │
│  most...                │     │ Evenings  │ ← appears  │
│                         │     │   free    │   as you   │
│  You: Yes, by 4pm on   │     └──────────┘   talk      │
│  school days. That's    │                              │
│  non-negotiable.        │   [rest builds as phases     │
│                         │    complete]                  │
│  ┌───────────────────┐  │                              │
│  │ Type here...      │  │                              │
│  └───────────────────┘  │                              │
└─────────────────────────┴──────────────────────────────┘
```

The right panel starts empty (just the HUMA wordmark, faintly glowing). As the conversation progresses:
- Phase 1 complete → Essence core appears (name, location, phrase) with a fade-scale entrance
- Phase 2 complete → QoL pills animate in around the core
- Phase 3 complete → Field layers strip renders below
- Phase 4 complete → Enterprise cards slide in
- Phase 5 complete → Nodal intervention dots appear with cascade lines
- Phase 6 complete → Weekly rhythm ring appears at the outer edge

Each element enters with a 600ms ease-out animation. The canvas is NOT scrollable during the conversation — it's a fixed viewport that gets progressively richer. This creates the "glasses moment" — by the end of the conversation, the user looks right and sees their entire life mapped spatially.

On mobile: the canvas is hidden during conversation but accessible via a floating pill button ("See your map · 3/6") that slides up a half-sheet preview. Tapping it shows the canvas full-screen with a "Back to conversation" button.

**B. Conversation messages styled as prose, not chat bubbles**

HUMA's messages: Cormorant Garamond serif, sand background, left-aligned, generous line-height (1.8). No chat bubble shape. Feels like reading a letter.

User's messages: Source Sans 3, slightly indented, preceded by a subtle sage line on the left. No bubble. Clean left border accent.

Phase transitions: A thin horizontal line with the new phase name centered, fading in. Not a banner or alert — just a quiet marker.

**C. Typing indicator that feels alive**

Not three bouncing dots. A subtle breathing glow — a small sage circle that pulses gently, like the Essence core. When HUMA is "thinking," the canvas-side shape also breathes slightly faster (if visible). This connects the conversation to the visual system.

**D. Phase indicator redesign**

Not a stepper or progress bar. Six small circles in a horizontal row at the top of the conversation panel. Completed phases are filled sage. Current phase is pulsing. Future phases are hollow outlines. Current phase NAME is displayed below the dots in small caps. Hovering a completed dot shows the phase synthesis in a tooltip.

---

## UPGRADE 2: THE LIVING CANVAS (the map output)

### Current state
A linear scrolling document with text sections, text bars for capitals, and text cards for enterprises.

### Target state
A spatial, interactive, center-outward canvas that IS the product's signature artifact.

### What to build

**A. Spatial layout — center outward, not top to bottom**

The canvas is NOT a scrolling document. It is a spatial map viewed in a fixed viewport with pan and zoom.

Center: Essence core (name, location, phrase). Subtle breathing glow. This is the anchor — always visible.

Ring 1 (close): QoL statement pills arranged in a loose circle around the essence. Sage background, soft borders. These are interactive — clicking one expands it to show the operational decomposition (enabling conditions → weekly commitments → validation question).

Ring 2 (medium): Production forms + Future resource base scattered at medium distance. Amber and sky pills respectively. Thin connection lines to the QoL statements they serve.

Ring 3 (outer): Capital profile — 8 circles arranged around the perimeter, sized by score (1-5 maps to radius). Each circle has the capital name inside. Hovering one highlights all the enterprises and QoL statements that affect it.

Below the spatial map (scrolling into view): Enterprise cards, Nodal interventions, Weekly rhythm. These are the "grounded" sections — detailed, information-rich, below the spatial overview.

**B. Enterprise cards as interactive objects**

Each enterprise card should have:
- Left accent bar colored by role (sage=foundation, amber=anchor, sky=multiplier, earth=long-game)
- Role tag pill (top right)
- Name as the heading
- Micro-ledger: startup cost | year 1 revenue | year 3 revenue | margin — in a compact 2x2 grid, not a text list
- Labor indicator: a small visual showing hrs/week (like a mini bar), not just text
- Capital impact dots: 8 small circles below the ledger showing which capitals this enterprise builds (filled = builds, hollow = neutral, red outline = depletes)
- Synergies: small connection chips showing which other enterprises this pairs with
- Hovering an enterprise highlights its connections on the canvas above — the QoL statements it serves, the capitals it builds, the landscape layers it uses

When an enterprise card is clicked/tapped, it expands into a detail panel showing the full narrative, the QoL impact statement, and the cascade prediction.

**C. Cascade chains as visual flows**

Currently: emoji → text → emoji → text (flat text).

Target: A horizontal flow of pill-shaped nodes connected by animated directional lines. Each pill is color-coded by the capital it represents. The flow reads left to right. On hover, each node pulses and shows a tooltip with the detail.

When the cascade section scrolls into view, the pills and arrows animate in sequence (staggered, left to right, 150ms between each) to show the cascade *happening*. This is a key moment — the user sees cause and effect flowing through their system.

**D. Capital profile as a radar/spider chart**

Currently: horizontal text bars with numbers.

Target: An SVG radar chart with 8 axes (one per capital). The shape is filled with a semi-transparent sage gradient. Each vertex is a circle sized by the score. The shape is slightly organic (curved lines between vertices, not straight) to match the living systems aesthetic.

On hover, each axis highlights and shows the capital name + score + a one-line note about what drives that score.

This should also appear in the conversation-side canvas preview, where it's the first "aha" visualization — the user sees their capital profile take shape as a living form.

**E. Weekly rhythm as a visual grid**

Currently: a text list of days with text time blocks.

Target: A 7-column grid (Mon-Sun). Each column shows time blocks as colored rectangles, color-coded by enterprise (using the enterprise accent colors). The height of each block represents duration. Hard stop times are marked with a clear horizontal line and label.

Peak season and rest season are toggle-able views — clicking "Peak" shows the intense version, clicking "Rest" shows the lighter version. The visual contrast between them communicates the seasonal rhythm instantly.

**F. The Canvas/Document toggle actually works**

Canvas view: the spatial, interactive layout described above.
Document view: the current linear layout, cleaned up with proper Cormorant Garamond typography, suitable for printing. This is the PDF-ready version.

The toggle should be prominent — two pills in the top bar, with the active one filled.

---

## UPGRADE 3: INTERACTIVE BEHAVIORS

These are the interactions that make HUMA a product, not a document.

**A. Click a QoL statement → see its operational decomposition**

The QoL pill expands into a card showing:
- The statement (bold)
- Enabling conditions (what must be true)
- Weekly commitments (what you do)
- Validation question (how you check)
- Target (the number)
- If-below response (systemic, not personal)

This is the QoL decomposition we designed — it should be explorable, not just readable.

**B. Click an enterprise → see its full breakdown**

The card expands or opens a side panel with:
- Full narrative (the "why this fits you" paragraph)
- Perkins-format breakdown (all financials in a clean table)
- Capital impact visualization (8 dots, filled/empty)
- QoL impact statement
- Synergies with other selected enterprises
- Cascade prediction

**C. Hover a capital circle → see what feeds it**

When you hover "Social Capital" in the radar chart, all the enterprises, QoL statements, and nodal interventions that build Social Capital highlight on the canvas. Connection lines appear. Everything else dims slightly. This is the moment the user SEES the system — they understand that their workshop enterprise builds social capital, which supports their "neighbors who stop by" QoL statement, which in turn sustains their sense of purpose.

**D. Cascade chains are explorable**

Click any node in a cascade chain and the canvas highlights the corresponding capital circle, enterprise, and QoL statement that it connects to. The user can follow the thread of cause and effect through their entire system.

**E. "What if" on enterprises**

The enterprise cards have a toggle: included/excluded. When an enterprise is toggled off, the capital profile radar adjusts in real-time — the shape shrinks on the capitals that enterprise was building. This lets the user experiment with different enterprise combinations and see how they affect their overall capital profile. This is the Cascade Simulator from the original vision, in its simplest form.

---

## IMPLEMENTATION PRIORITY

Do these in order. Each one independently improves the product.

### Phase 1: Split-screen conversation + progressive canvas build
This is the highest-impact change. It transforms the conversation from "chatting with AI" to "watching my life take shape." Build the split-screen layout, the progressive ring reveal, and the breathing essence core. The canvas doesn't need to be fully interactive yet — even a static progressive build is transformative.

### Phase 2: Spatial canvas layout with interactive enterprises
Replace the linear map output with the spatial center-outward layout. Make enterprise cards interactive (click to expand). Add the capital radar chart. This makes the map output feel like a design tool, not a document.

### Phase 3: Connection highlighting and cascade animations
Add hover behaviors that show connections between elements. Animate cascade chains. Add the QoL decomposition expansion. This is where the "living system" feeling emerges — everything is connected and you can see it.

### Phase 4: What-if enterprise toggling
Add the include/exclude toggles on enterprises with real-time capital profile adjustment. This is the feature that makes HUMA a design tool — you're not just seeing your life, you're designing it.

---

## DESIGN SYSTEM REMINDERS

- All interactive elements use the HUMA easing: cubic-bezier(0.22, 1, 0.36, 1)
- Hover states: subtle lift (translateY(-2px)) + soft shadow increase. Never color-swap on hover.
- Transitions: 300-400ms for micro-interactions, 600-800ms for element entrances
- Connection lines: 1px, sage-300, 30% opacity. On highlight: sage-600, 60% opacity.
- Nothing should feel "snappy" or "bouncy." Everything should feel like it's growing, breathing, emerging.
- Active/selected states use sage-700 fills. Dimmed states use 40% opacity.
- The canvas background is always sand-50. Cards are white with sand-300 borders.
- No shadows darker than rgba(26,23,20,0.08). This isn't Material Design.

---

## WHAT THIS ACHIEVES

After these upgrades, someone using HUMA will experience:

1. **Watching their life take shape** as they talk (split-screen progressive build)
2. **Seeing connections they couldn't see before** (hover highlighting across canvas)
3. **Exploring their own system** (click to expand QoL, enterprises, cascades)
4. **Designing their life** (enterprise toggling with real-time capital adjustment)
5. **A shareable artifact that's genuinely beautiful** (spatial canvas, not a text doc)

None of these are possible by pasting a prompt into ChatGPT. THAT is the product moat. The AI generates the content — the product makes it visible, explorable, and designable.

# H U M A
## Design System Specification
### The Visual Language of a Living System

*This document defines every visual decision in the product. When Claude Code makes a styling choice, it should be testable against this document. If it's not specified here, it doesn't belong in HUMA.*

March 2026 · Foundational Architecture

---

## 01 — The Feel

HUMA looks like a **land deed meets love letter meets field journal.**

Not SaaS. Not wellness app. Not ag-tech. Not Material Design. Not Tailwind defaults.

The visual identity communicates: this is something made with care, for someone specific, by someone who understands land and living systems. It should feel handcrafted without feeling precious. Sturdy without feeling corporate. Warm without feeling soft.

Three reference textures to hold in mind:
- A well-worn field notebook with cream pages and pencil marks
- A hand-drawn property map with careful annotations
- A letter written by someone who chose their words slowly

---

## 02 — Color Palette

### Primary: Sage
The color of living systems. Used for primary UI elements, emphasis, and the breathing glow.

| Token | Hex | Usage |
|-------|-----|-------|
| sage-900 | #1E3622 | Deepest emphasis, rarely used |
| sage-800 | #2A4A30 | Section headers in documents |
| sage-700 | #3A5A40 | Primary text emphasis, headline italics, filled states |
| sage-600 | #4A6E50 | Secondary emphasis |
| sage-500 | #5C7A62 | Body text links, wordmark, phase indicator filled |
| sage-400 | #8BAF8E | Phase indicator active pulse, breathing glow, canvas nodes |
| sage-300 | #A8C4AA | Connection lines, divider elements |
| sage-200 | #C4D9C6 | Pill borders, ring strokes, light connections |
| sage-100 | #E0EDE1 | QoL pill backgrounds, subtle section fills |
| sage-50 | #EBF3EC | Canvas node fills, essence core fill, lightest tint |

### Secondary: Sand
The color of ground, paper, and space. Used for backgrounds and surfaces.

| Token | Hex | Usage |
|-------|-----|-------|
| sand-300 | #DDD4C0 | Borders, dividers, card strokes |
| sand-200 | #EDE6D8 | User message backgrounds, secondary surfaces |
| sand-100 | #F6F1E9 | HUMA message backgrounds, section fills |
| sand-50 | #FAF8F3 | Page background — the default. Never use plain white (#FFF) |

### Accent: Amber
The color of action, warmth, and urgency. Used sparingly for CTAs and enterprise accents.

| Token | Hex | Usage |
|-------|-----|-------|
| amber-700 | #8B4513 | Deep accent for section headers in documents |
| amber-600 | #B5621E | Primary CTA background, enterprise accent bars (anchor role) |
| amber-500 | #C87A3A | CTA hover state |
| amber-400 | #E8935A | Production node fills, warm highlights |
| amber-100 | #FFF4EC | Amber pill backgrounds, amber card tints |

### Data: Sky
The color of information, depth, and the future resource base. Used for data-specific elements.

| Token | Hex | Usage |
|-------|-----|-------|
| sky-600 | #2E6B8A | Data labels, enterprise accent (multiplier role), resource nodes |
| sky-100 | #E8F2F7 | Sky pill backgrounds, data tints |

### Accent: Rose
Used only for warning states — dimensions in decline, validation failures.

| Token | Hex | Usage |
|-------|-----|-------|
| rose-600 | #A04040 | Low score highlights, declining dimension indicators |
| rose-100 | #F5EAEA | Warning backgrounds |

### Ink
The color of text. A warm brownish-black, never pure black.

| Token | Hex | Usage |
|-------|-----|-------|
| ink-900 | #1A1714 | Headlines, primary text |
| ink-800 | #2C2620 | Heavy body text |
| ink-700 | #3D3830 | Standard body text |
| ink-600 | #554D42 | Secondary body text |
| ink-500 | #6B6358 | Sublines, descriptive text |
| ink-400 | #8C8274 | Tertiary text, metadata |
| ink-300 | #A89E90 | Placeholder text, very light labels |
| ink-200 | #C4BAA8 | Disabled text, ghost elements |

### Rules
- **Never use pure white (#FFFFFF)** as a page background. sand-50 is the default.
- **Never use pure black (#000000)** for text. ink-900 is the darkest.
- **Cards** use white (#FFFFFF) fill with sand-300 borders. This is the one exception to the "no white" rule — cards float above the sand surface.
- **Amber is for action only.** Don't use amber for decorative elements. If it's amber, it's clickable.
- **Rose is for warnings only.** Don't use rose for decorative elements. If it's rose, something needs attention.

---

## 03 — Typography

### Display: Cormorant Garamond
The voice of HUMA. Used for headlines, essence text, phase names, and the operator's portrait.

Load from Google Fonts: `Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500`

| Context | Size | Weight | Line-Height | Color |
|---------|------|--------|-------------|-------|
| Page headline (landing) | clamp(2.6rem, 5.5vw, 3.8rem) | 400 | 1.1 | ink-900 |
| Section headline | clamp(1.6rem, 3vw, 2.2rem) | 400 | 1.2 | ink-900 |
| Essence name (canvas) | 1.1rem | 500 | 1.2 | sage-800 |
| Phase name (indicator) | 0.6rem | 500, uppercase | 1 | sage-400 |
| Wordmark | 0.85rem | 500, uppercase, letter-spacing 0.4em | 1 | sage-500 |
| Italic emphasis in headlines | Same as context | Same | Same | sage-700 |
| HUMA conversation messages | 1.05rem | 400 | 1.8 | ink-700 |
| Coherence score (canvas) | 1.2rem | 500 | 1 | sage-700 |

### Body: Source Sans 3
The practical voice. Used for UI elements, data labels, user messages, and descriptions.

Load from Google Fonts: `Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400`

| Context | Size | Weight | Line-Height | Color |
|---------|------|--------|-------------|-------|
| Body text | 1rem | 300 | 1.7 | ink-500 |
| UI labels | 0.82rem | 500 | 1.4 | ink-400 |
| Section labels (uppercase) | 0.62rem | 600, letter-spacing 0.22em | 1 | ink-300 |
| User conversation messages | 1rem | 400 | 1.7 | ink-600 |
| Pill text (canvas nodes) | 0.75rem | 500 | 1.2 | Depends on pill type |
| Enterprise card title | 0.9rem | 500 | 1.3 | ink-900 |
| Enterprise metadata | 0.75rem | 400 | 1.4 | ink-400 |
| Capital circle labels | 0.6rem | 500 | 1 | sage-600 |
| Micro-ledger numbers | 0.75rem | 500 | 1.2 | sage-700 or amber-600 |
| Button text | 1rem | 500 | 1 | white (on amber) or sage-700 (on outline) |
| Tooltip text | 0.75rem | 400 | 1.5 | ink-600 |
| Footer text | 0.72rem | 300 | 1.5 | ink-300 |

### Rules
- **Cormorant Garamond is for display only.** Never use it for buttons, labels, metadata, or data. It's the voice of HUMA's personality — headings, names, essence text, and conversation messages.
- **Source Sans 3 is for everything functional.** If it's clickable, countable, or informational, it's Source Sans 3.
- **Never use system fonts** as fallback in the UI. Define the fallback stack as `'Cormorant Garamond', 'Georgia', serif` and `'Source Sans 3', 'Helvetica Neue', sans-serif`.
- **Maximum reading width: 680px** for prose content. 760px for canvas sections. Never wider.
- **Letter-spacing on uppercase labels:** always 0.15em or more. Tight uppercase text looks like a shout.

---

## 04 — Spacing System

Base unit: **8px.** All spacing values are multiples of 8.

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight internal (between icon and label) |
| space-2 | 8px | Minimum gap (between related elements) |
| space-3 | 12px | Small gap (between phase dots, pill internal padding) |
| space-4 | 16px | Standard padding (card internal, message padding) |
| space-5 | 24px | Medium gap (between cards, between sections within a view) |
| space-6 | 32px | Large gap (between message groups) |
| space-7 | 48px | Section separator (between canvas rings conceptually) |
| space-8 | 64px | Major section break |
| space-9 | 80px | Page section padding (top/bottom of full sections) |
| space-10 | 120px | Hero/vision section padding |

### Rules
- **Generous whitespace is mandatory.** When in doubt, add more space. HUMA should feel unhurried.
- **Vertical rhythm matters more than horizontal.** Content flows down. Horizontal density is acceptable in data-rich areas (enterprise cards, weekly rhythm). Vertical density is never acceptable.
- **No content should touch the edge of its container.** Minimum internal padding is space-4 (16px).

---

## 05 — Components

### Pills (Canvas Nodes)
Used for QoL statements, Production forms, Future resource base, signal tags.

```
┌──────────────────────┐
│  Evenings free by 4  │
└──────────────────────┘
```

- Border-radius: 100px (fully rounded)
- Padding: 5px 14px
- Font: Source Sans 3, 0.75rem, weight 500
- Border: 1px solid
- Background and border color determined by type:
  - QoL: sage-50 fill, sage-200 border, sage-700 text
  - Production: amber-100 fill, #F0DCC8 border, amber-600 text
  - Resource: sky-100 fill, #C8DEE8 border, sky-600 text
  - Signal/neutral: sand-200 fill, sand-300 border, ink-400 text

### Cards (Enterprise, Intervention)
```
┌─┬────────────────────────────┐
│█│  No-Dig Market Garden      │
│█│  Foundation · 0.25 acres   │
│█│  ┌──────┐ ┌──────┐        │
│█│  │$24-38k│ │ Yr 1 │        │
│█│  └──────┘ └──────┘        │
└─┴────────────────────────────┘
```

- Background: white (#FFFFFF)
- Border: 1px sand-300
- Border-radius: 12px
- Left accent bar: 3px wide, full height, color by role:
  - Foundation: sage-700
  - Anchor: amber-600
  - Partner/Multiplier: sky-600
  - Long-game: ink-400 (#8C8274)
- Internal padding: 16px
- Shadow: none by default. On hover: `0 4px 16px rgba(26,23,20,0.06)`
- Hover lift: translateY(-2px), transition 300ms

### Buttons

**Primary (amber):**
- Background: amber-600
- Color: white
- Border: none
- Border-radius: 100px
- Padding: 16px 36px
- Font: Source Sans 3, 1rem, weight 500
- Shadow: `0 4px 20px rgba(181, 98, 30, 0.15)`
- Hover: amber-500 background, translateY(-2px), shadow expands

**Secondary (sage outline):**
- Background: transparent
- Color: sage-700
- Border: 1.5px solid sage-300
- Border-radius: 100px
- Padding: 14px 32px
- Hover: sage-50 background, sage-500 border, translateY(-2px)

**Tertiary (text link):**
- Color: ink-300
- Font-size: 0.8rem
- No border, no background
- Hover: sage-600 color

### Dividers
- Standard: 1px solid sand-300
- Emphasis: 1px solid sage-300
- Phase transition: 1px sage-200 with centered pill label
- Never use `<hr>` with default styling. Always custom.

### Radar Chart (Capital Profile)
- SVG-based, 8 axes at 45° intervals
- Filled shape: sage-50 with sage-300 stroke, 40% opacity
- Axis lines: sand-300, 1px
- Vertex circles: 4-8px radius proportional to score (1-5)
- Vertex circle fill: sage-400
- Hover state: axis highlights to sage-600, score tooltip appears
- Connection between vertices: slightly curved (quadratic bezier), not straight lines — organic feeling

### Connection Lines (Canvas)
- Default: 1px sage-200, 25% opacity
- Highlighted: 1px sage-500, 60% opacity
- Animated entrance: stroke-dasharray technique, 600ms
- Never straight when connecting non-adjacent elements. Use subtle curves.

---

## 05.5 — Warmth System

The warmth system communicates validation state through visual weight rather than symbols or labels.

| State | Opacity | Visual Treatment | CSS Class |
|-------|---------|-----------------|-----------|
| Faint | ~30% | Almost transparent, ghosted | `warmth-faint` |
| Emerging | ~60% | Gaining substance, present but light | `warmth-emerging` |
| Solid | 100% | Full warmth, complete presence | `warmth-solid` |
| Shifting | 100% + amber tint | Warm but in motion, amber-tinged | `warmth-shifting` |
| Faded | ~15% | Near-invisible, archived | `warmth-faded` |

Transitions between warmth states use the standard easing curve (`cubic-bezier(0.22, 1, 0.36, 1)`) at 500-700ms duration.

---

## 06 — Animation Standards

### The HUMA easing curve
`cubic-bezier(0.22, 1, 0.36, 1)` — used for ALL transitions and animations. This is a deceleration curve that starts fast and settles slowly, like something growing into place.

### Standard durations
| Interaction | Duration |
|-------------|----------|
| Micro-interaction (hover, focus) | 200-300ms |
| Element entrance (fade-in, scale-up) | 500-700ms |
| Scroll reveal | 800-900ms |
| Canvas ring entrance | 600ms + stagger |
| Cascade chain animation | 150ms between nodes |
| Phase transition divider | 400ms fade |
| Shape morphing (radar chart) | 1200ms |

### The breathing animation
Used on the Essence Core and the hero shape. Defines the "living" quality of HUMA.

```css
@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.03); opacity: 1; }
}
/* Duration: 6-8s. Easing: ease-in-out. */
```

### Stagger pattern
When multiple elements enter together (pills appearing, cards sliding in), each subsequent element is delayed:
- Pills: 50ms stagger
- Cards: 100ms stagger
- Capital circles: 80ms stagger
- Cascade nodes: 150ms stagger

### Rules
- **Nothing should feel "snappy" or "bouncy."** No spring physics, no overshoot, no elastic easing. Everything grows, breathes, emerges.
- **Animations respect prefers-reduced-motion.** If the user has reduced motion enabled, all animations become instant (0ms duration) and the breathing animation stops.
- **Exit animations are faster than entrance animations.** Elements leaving should take 60% of the entrance duration.
- **Scroll-triggered reveals use IntersectionObserver** with `threshold: 0.12` and `rootMargin: '0px 0px -30px 0px'`. Elements fade up 24px with the standard easing.

---

## 07 — Layout Principles

### Content flows vertically
HUMA is not a dashboard. Content flows down a page, not across a grid. The only exception is the split-screen conversation view (left: chat, right: canvas) and the enterprise card grid (2 columns max).

### Maximum widths
- Prose content: 680px
- Canvas/visualization: 760px
- Full-bleed sections (hero, canvas preview): 100vw with internal max-width of 1080px
- Enterprise card grid: 2 columns within the 760px max

### The canvas is spatial, not linear
The Living Canvas on /map/[id] is a center-outward spatial layout, not a top-to-bottom document. The Essence is at center. Context radiates outward. Detail lives below in scrollable sections. The spatial map occupies a viewport-height section. The detailed sections (enterprises, interventions, rhythm) are below it.

### No card grids
HUMA never presents a grid of uniform cards. If there are multiple items (enterprises, interventions, QoL statements), they have visual hierarchy — different sizes, different accent colors, different levels of detail. Not a homogeneous grid.

### Whitespace is content
Empty space on the page is not wasted. It is part of the message. A weekly review insight that says three sentences surrounded by generous whitespace communicates confidence and clarity. The same three sentences crammed into a busy dashboard communicate data overload.

---

## 08 — Dark Mode (Operate Mode)

Operate Mode (weekly review, morning briefing) uses a darker palette to create the "confession booth" atmosphere — private, calm, slightly sacred.

| Light Token | Dark Equivalent | Hex |
|-------------|----------------|-----|
| sand-50 (background) | night-900 | #141210 |
| sand-100 | night-800 | #1E1B18 |
| sand-200 | night-700 | #2A2622 |
| sand-300 (borders) | night-600 | #3D3830 |
| ink-900 (text) | cream-100 | #F2EDE5 |
| ink-500 (secondary text) | cream-400 | #A89E90 |
| sage-700 (emphasis) | sage-400 | #8BAF8E |
| sage-50 (pills) | night-700 with sage border | — |
| white (cards) | night-800 | #1E1B18 |

The breathing glow is more visible in dark mode. Sage-400 at higher opacity against the dark background. The canvas feels like a living thing in a quiet room.

---

## 09 — Print Styles

When the operator prints or exports to PDF:
- Background changes to white
- All shadows removed
- Breathing animations stopped
- Connection lines render at full opacity
- Fonts rendered in black (ink-900)
- Cards render with visible borders (1px ink-200)
- Page breaks before each major section (enterprises, interventions, rhythm)
- Footer on each page: "Generated by HUMA · [date]" in ink-300, 0.65rem
- Hide all interactive elements (buttons, toggles, hover states)

---

## 10 — What HUMA Never Looks Like

- **A SaaS dashboard.** No metric tiles. No progress bars. No KPI cards. No green/red status indicators.
- **A wellness app.** No pastel gradients. No rounded-everything. No illustrations of people meditating.
- **A social platform.** No avatars. No feeds. No likes. No comments.
- **Material Design.** No elevation system. No FABs. No bottom sheets with handles (except mobile canvas). No ripple effects.
- **Bootstrap/Tailwind defaults.** No blue-600 buttons. No gray-100 backgrounds. No card-with-drop-shadow patterns.
- **Generic AI chat.** No chat bubbles with tails. No "AI is typing..." text. No sidebar model selector.

---

## 11 — Product Surface Components

*These components are defined in `HUMA_PRODUCT_SURFACE.md` §11. Specs here for implementation reference.*

### Tab Bar
- Three labels: **Your Map** | **Your Day** | **Your Journey**
- Active: sage-700, 2px underline
- Inactive: ink-500
- Desktop: top-right of header
- Mobile: bottom bar (3 icons + labels)

### Warmth Visuals (Canvas Elements)
- **Faint:** 25% opacity, 1px sage-200 border, text at ink-400
- **Emerging:** 55% opacity, 1px sage-300 border, text at ink-600
- **Solid:** 100% opacity, sage-100 fill, sage-400 border, text at ink-800
- **Shifting:** 80% opacity, amber-100 fill, amber-400 border
- **Faded:** 15% opacity, dashed sage-200 border, text at ink-300

### One-Thing Card
- Sand-50 background, rounded-lg (12px)
- sage-600 left border (4px) if connected to an active practice
- ink-800 text for the action
- ink-500 text for "this connects to"
- Done button: sage-600 background, white text
- Not today: outline, ink-500 text

### Coherence Score
- Displayed as a number only (no label by default)
- ink-900, text-2xl, tabular-nums (Source Sans 3)
- Small delta indicator: "+3" in sage-600 or "-2" in rose-500
- Tooltip on tap: "Your coherence — how connected your life feels right now"

### Shape (Share Card)
- Dark background: ink-900 (#1A1714)
- Shape fill: sage-400 at 25% opacity (current), sage-300 at 15% (previous)
- Shape stroke: sage-400 (current), sage-300 (previous)
- Axis labels: sand-300, text-xs
- Name: sand-200, Cormorant Garamond
- "HUMA" footer: sage-500, text-xs, letter-spacing 0.4em
- Sizes: 1080x1080 (Instagram), 1200x630 (Twitter/OG)

---

*HUMA · Design System Specification · March 2026*

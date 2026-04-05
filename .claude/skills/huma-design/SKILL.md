---
name: huma-design
description: Use when creating, modifying, styling, or auditing ANY visual element in HUMA — components, pages, layouts, CSS, Tailwind classes, SVG, animations, colors, fonts, spacing, brand guidelines, responsive behavior. Triggers on any file in components/, any CSS change, any mention of styling, layout, color, font, animation, responsive, card, button, brand, visual identity.
---

# HUMA Design System + Brand

Read `/docs/HUMA_DESIGN_SYSTEM.md` for the full specification. This skill is your quick-reference and enforcement layer.

## Design Tokens (Single Source of Truth)

### Colors

```
Background:  sand-50 (#faf8f5)  sand-100 (#f5f0e8)  sand-200 (#e8dfd0)  sand-300 (#d4c5a9)  sand-400 (#bfa87d)
Primary:     sage-50 (#f4f7f4)  sage-100 (#e4ebe4)  sage-200 (#c8d8c8)  sage-300 (#a3bda3)  sage-400 (#7a9e7a)  sage-500 (#5a7f5a)  sage-600 (#466346)  sage-700 (#344d34)
Action:      amber-400 (#d4a24e)  amber-500 (#c4922e)  amber-600 (#a57824)
Text:        earth-500 (#7a6b5d)  earth-600 (#6b5a4a)  earth-700 (#5c4a3a)  earth-800 (#3d3128)  earth-900 (#2a211b)
```

### Typography

| Context | Font | Size | Color |
|---------|------|------|-------|
| Display headline | Cormorant Garamond serif | text-4xl/5xl | earth-900 |
| Section heading | Cormorant Garamond serif | text-2xl | sage-700 |
| Conversation prose | Cormorant Garamond serif | text-lg leading-relaxed | earth-800 |
| UI labels | Source Sans 3 sans | text-sm medium | earth-600 |
| Buttons | Source Sans 3 sans | text-lg (primary) text-sm (secondary) | white / earth-700 |
| Financial data | Source Sans 3 sans | text-sm medium | earth-900 |
| Metadata | Source Sans 3 sans | text-xs | earth-500 |

**Rule:** Cormorant Garamond = anything the operator READS as content. Source Sans 3 = anything the operator INTERACTS with as UI.

### Spacing (8px base)

```
Page padding:    px-6 md:px-16 lg:px-24
Content width:   max-w-2xl (conversation)  max-w-3xl (document)  max-w-xl (landing)
Section gap:     space-y-8 (messages)  mt-12 mb-4 (sections)
Card padding:    p-6 (1.5rem)
Border radius:   rounded-lg (0.5rem) for cards/buttons
```

### Animation

```css
transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
```

ONE easing curve for everything. Breathing: `scale(1) → scale(1.03)`, 6-8s, ease-in-out.

## Shared UI Primitives (`components/ui/index.tsx`)

**USE THESE FIRST.** Import from `@/components/ui` before writing custom styling.

```tsx
import { Button, Card, CardTitle, DestructiveAction, SectionHeading, Prose } from "@/components/ui";

// Buttons — 4 variants, 3 sizes
<Button variant="primary" size="lg">Start</Button>      // amber CTA
<Button variant="secondary">Cancel</Button>              // sand bg
<Button variant="ghost">Skip</Button>                    // text only
<Button variant="destructive">Remove</Button>            // rose bg
<DestructiveAction onClick={onRemove}>Remove</DestructiveAction>  // inline text, no bg

// Cards
<Card>content</Card>                    // sand-50 bg, sand-200 border
<Card variant="warm">content</Card>    // sand-100 bg, sand-300 border
<CardTitle>Heading</CardTitle>          // serif, sage-700

// Typography
<SectionHeading>Title</SectionHeading>  // serif, text-2xl, sage-700
<Prose>Body text</Prose>                // serif, text-lg, earth-800
```

### Messages (no primitive — pattern only)

```tsx
// HUMA (assistant) — serif prose, no bubble
<div className="font-serif text-lg leading-relaxed text-earth-800 whitespace-pre-wrap">

// Operator (user) — left border, no bubble
<div className="pl-4 border-l-2 border-sage-300 text-earth-700 leading-relaxed whitespace-pre-wrap">
```

### Loading

```tsx
<div className="flex items-center gap-2" role="status">
  <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse" />
  <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse [animation-delay:150ms]" />
  <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse [animation-delay:300ms]" />
</div>
```

## Token Usage Rules

**NEVER** use inline `style={{}}` for colors, fonts, or spacing. Use Tailwind token classes:
* Colors: `bg-sand-50`, `text-sage-700`, `border-amber-600`, `text-rose` (NOT raw hex)
* Fonts: `font-serif`, `font-sans` (NOT `fontFamily`)
* Spacing: Tailwind utilities `p-6`, `gap-4`, `mt-8` (NOT `padding: "24px"`)
* Radii: `rounded-lg` (NOT `borderRadius: "12px"`)

Inline styles are ONLY acceptable for:
* Dynamic values computed at runtime (e.g., D3 positions, SVG transforms)
* CSS custom properties as values (e.g., `var(--huma-ease)`)

**Destructive actions:** Use `text-rose` or `bg-rose`. NEVER use red (#E57373, #FF0000, etc).

## Brand Do's and Don'ts

### DO:
* Earthy, warm tones that feel like natural materials
* White space — spacious, not sparse
* Treat amber as precious — it means "act here"
* Use sage for growth, progress, life (bars, indicators, success)
* Keep print stylesheet clean: black on white, serif, no decoration

### DON'T:
* Red for errors (use `text-rose` or `bg-rose` from design system)
* Gradients, shadows, glass effects (this is land, not software)
* Icons unless absolutely necessary (words are better)
* Animate anything that isn't loading or transitioning
* Gamification (no badges, points, streaks, percentages)
* Stock photography (hand-drawn, topographic, or botanical only)
* Dark mode (the earthy palette IS the mood)
* Chat bubbles with tails
* Material Design patterns (FABs, ripples, elevation)
* Tailwind default colors (blue-500, gray-100, etc.)

## Responsive Breakpoints

* Mobile: < 768px (base styles)
* Tablet (md): 768px+
* Desktop (lg): 1024px+

Touch targets: minimum 44x44px on mobile. iOS: inputs must be ≥16px to prevent zoom.

## Accessibility Quick Reference

* Normal text contrast: 4.5:1 minimum
* Large text contrast: 3:1 minimum
* All interactive elements keyboard-focusable
* `role="status"` on dynamic content
* `prefers-reduced-motion` respected on all animations
* Semantic HTML (landmarks, heading hierarchy, proper form labels)

## New Component Checklist

* [ ] Uses shared primitives from `components/ui/` where applicable
* [ ] Only palette colors via Tailwind tokens (no raw hex, no inline style for colors)
* [ ] Cormorant Garamond (`font-serif`) for content, Source Sans 3 (`font-sans`) for UI
* [ ] Spacing via Tailwind utilities (no inline `padding`, `margin` in px)
* [ ] rounded-lg for interactive elements
* [ ] Destructive actions use `text-rose` / `bg-rose` (never red)
* [ ] Works at 375px, 768px, 1280px
* [ ] Focus states visible
* [ ] Color contrast AA compliant
* [ ] All interaction states (hover, focus, active, disabled, loading)
* [ ] All string literals voice-checked

## Files to Check

* `app/src/app/globals.css` — tokens and base styles
* `app/src/app/page.tsx` — all screens
* `app/src/components/*.tsx` — all components
* Reference: `/docs/references/huma_landing_reference.html`
* Reference: `/docs/references/huma_living_canvas.html`
* Reference: `/docs/references/huma_map_reference.html`

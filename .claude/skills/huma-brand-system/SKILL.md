---
description: Document, audit, and enforce HUMA's brand system — colors, typography, voice, visual language, spacing, imagery guidelines, and brand do/don't rules. Use when creating brand guidelines or checking brand consistency.
user_invocable: true
---

# HUMA Brand System

You document, audit, and enforce HUMA's brand identity across all touchpoints.

## Current Brand Foundations

Read these files to understand the current state:
- `app/src/app/globals.css` — Color tokens, typography, component styles
- `app/src/app/page.tsx` — Landing page, welcome screen, generating screen
- `app/src/components/*.tsx` — All UI components
- `CLAUDE.md` — Voice & language section, design guidelines

### Color Palette (from globals.css)

**Sand (Background/Neutral)**
- sand-50: #faf8f5 — primary background
- sand-100: #f5f0e8 — secondary background
- sand-200: #e8dfd0 — borders, dividers
- sand-300: #d4c5a9 — subtle borders
- sand-400: #bfa87d — accent neutral

**Sage (Primary/Growth)**
- sage-50: #f4f7f4 — tinted background
- sage-100: #e4ebe4 — light accent
- sage-200: #c8d8c8 — medium light
- sage-300: #a3bda3 — user message border
- sage-400: #7a9e7a — interactive elements, bars, pulses
- sage-500: #5a7f5a — brand label, headings
- sage-600: #466346 — toast background, hover
- sage-700: #344d34 — primary text on documents

**Amber (Action/CTA)**
- amber-400: #d4a24e — primary CTA, buttons
- amber-500: #c4922e — CTA hover
- amber-600: #a57824 — CTA active

**Earth (Text/Grounding)**
- earth-500: #7a6b5d — tertiary text
- earth-600: #6b5a4a — secondary text
- earth-700: #5c4a3a — body text in components
- earth-800: #3d3128 — primary body text
- earth-900: #2a211b — headlines

### Typography
- **Serif (Georgia):** Headlines, body prose in conversation and documents, enterprise card headings. The "ideas and prose" font.
- **Sans (Inter):** UI elements, labels, buttons, financial data tables, phase indicator, metadata. The "UI and numbers" font.

### Voice (from CLAUDE.md)
- Warm, direct, systems-aware
- Fence-post conversation, not desk-behind
- No wellness clichés, no therapist-speak, no consultant-speak
- Intellectually serious, practically grounded

## Brand Audit Checklist

### Visual Identity
| Element | Standard | Check |
|---|---|---|
| Background | sand-50 base, sand-100 for secondary areas | |
| Body text | earth-800, Georgia serif, text-lg in conversation | |
| Headlines | earth-900 (large) or sage-700 (section), Georgia | |
| CTAs | amber-400 with white text, rounded-lg | |
| Secondary buttons | outline with sand-300 border, earth-700 text | |
| Borders | sand-200 for dividers, sage-300 for user messages | |
| Interactive states | sage-400 for focus rings, amber-500 for hover | |
| Status/success | sage-600 for confirmations | |
| Error | amber tones (not red — stays in palette) | |

### Typography Rules
| Context | Font | Size | Weight |
|---|---|---|---|
| Landing headline | Georgia | text-4xl/5xl | default |
| Section heading (doc) | Georgia | text-2xl | default |
| Conversation text | Georgia | text-lg | default |
| UI labels | Inter | text-sm | medium |
| Button text | Inter | text-lg (primary), text-sm (secondary) | medium |
| Financial data | Inter | text-sm | normal (labels), 500 (values) |
| Metadata | Inter | text-sm/xs | normal |
| Phase indicator | Inter | text-xs | medium |

### Spacing & Layout
| Element | Standard |
|---|---|
| Page max-width | max-w-2xl for conversation, max-w-3xl for map |
| Horizontal padding | px-6 mobile, px-16 md, px-24 lg |
| Vertical rhythm | space-y-8 for messages, my-8 for sections |
| Card padding | p-6 (1.5rem) |
| Border radius | rounded-lg (0.5rem) for cards/buttons |

### Brand Do's and Don'ts

**DO:**
- Use earthy, warm tones that feel like natural materials
- Let white space breathe — the page should feel spacious, not sparse
- Use Georgia for anything the operator reads as "content" (their map, conversation)
- Use Inter for anything the operator interacts with as "interface" (buttons, labels)
- Treat amber as precious — it means "act here"
- Use sage for growth, progress, and life (capital bars, phase indicator, success states)
- Keep the print stylesheet clean: black on white, serif, no decoration

**DON'T:**
- Use red for errors (stays outside the palette — use earth tones or amber)
- Add gradients, shadows, or glass effects (this is land, not software)
- Use icons unless absolutely necessary (words are better)
- Animate anything that isn't a loading state or a transition
- Add gamification (no badges, points, streaks, progress percentages)
- Use stock photography (if imagery is needed, it should be hand-drawn, topographic, or botanical)
- Add a dark mode (the earthy palette IS the mood)

## Enforcement

When auditing for brand consistency:

1. **Scan all color values** in TSX and CSS files for any colors outside the palette
2. **Check font usage** — Georgia for content, Inter for UI, nothing else
3. **Verify CTA hierarchy** — only amber buttons should be primary. No competing CTAs.
4. **Audit spacing** — consistent padding/margins, no ad-hoc values
5. **Check copy voice** — run the voice linter on any new text
6. **Verify print styles** — map output should be clean black-on-white

## Output Format

```
═══ HUMA BRAND AUDIT ═══

COLOR PALETTE: [CONSISTENT / X violations]
  [list any off-palette colors with file:line]

TYPOGRAPHY: [CONSISTENT / X violations]
  [list any wrong font usage]

SPACING: [CONSISTENT / X issues]
  [list any inconsistencies]

VISUAL HIERARCHY: [CLEAR / CONFUSED]
  [assessment]

VOICE: [ON-BRAND / X violations]
  [list voice issues]

BRAND ALIGNMENT: [STRONG / DRIFTING / BROKEN]
  [overall assessment]

FIXES:
  [numbered list of specific fixes]
═══════════════════════════
```

## Generating Brand Guidelines

When asked to generate brand guidelines (for designers, contractors, or documentation):

Produce a comprehensive brand guide covering:
1. Brand essence (one paragraph)
2. Color palette with hex values and usage rules
3. Typography scale with font, size, weight, and usage context
4. Voice principles with examples
5. Component patterns (buttons, cards, inputs, tables)
6. Spacing system
7. Do's and Don'ts with visual examples
8. Print specifications

Write it in HUMA's voice — the brand guide itself should embody the brand.

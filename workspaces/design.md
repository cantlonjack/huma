# Design Workspace

_Last updated: 2026-04-05_

## What This Workspace Is For
HUMA's visual identity, design system, voice rules, and ethical framework. Read this when doing any styling, UI, copy, or brand work. For full specifications, read the referenced docs/ files.

---

## Design Rules

Full spec: `docs/HUMA_DESIGN_SYSTEM.md`

### Palette
```
Background:  sand-50 (#FAF8F3)  sand-100 (#f5f0e8)  sand-200 (#e8dfd0)  sand-300 (#d4c5a9)  sand-400 (#bfa87d)
Primary:     sage-50 (#f4f7f4)  sage-100 (#e4ebe4)  sage-200 (#c8d8c8)  sage-300 (#a3bda3)  sage-400 (#7a9e7a)  sage-500 (#5a7f5a)  sage-600 (#466346)  sage-700 (#344d34)
Action:      amber-400 (#d4a24e)  amber-500 (#c4922e)  amber-600 (#B5621E)
Text:        ink-900 through ink-200 (never black, never #000)
```

- Backgrounds: sand-50 (never white, never #FFF)
- Primary: sage (growth, progress, life)
- Action: amber-600 (only for clickable elements — treat as precious)
- Text: ink-900 through ink-200 (never black)

### Typography
- **Display / content:** Cormorant Garamond (serif) — anything the operator READS
- **UI / interaction:** Source Sans 3 (sans) — anything the operator INTERACTS with
- Max reading width: 680px

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
ONE easing curve for everything. Nothing bouncy. Everything grows, breathes, emerges.

### HUMA Never Looks Like
- SaaS dashboard
- Wellness app
- Material Design (no FABs, ripples, elevation)
- Bootstrap defaults
- Generic AI chat with bubbles
- Dark mode (the earthy palette IS the mood)

### Do / Don't
**DO:** Earthy warm tones. White space (spacious, not sparse). Amber only for "act here." Sage for growth/progress.

**DON'T:** Red for errors. Gradients/shadows/glass. Icons unless necessary. Gamification (badges, points, streaks). Stock photography. Tailwind default colors (blue-500, gray-100). Chat bubbles with tails.

---

## Voice Rules

Full spec: `docs/HUMA_VOICE_BIBLE.md`

**Character:** The neighbor who leans on the fence post and says the one thing you needed to hear.

**Banned phrases:** "I hear you saying..." / "Great question!" / "Based on what you've shared..." / "You might want to consider..." / "You've got this!" / "As an AI..." / "Let's unpack that"

**Banned vocabulary:** optimize, productivity, hack, goals, accountability, mindset, journey, empower, wellness, actionable, transformative

**Use instead:** "what's working," "where the leverage is," "that's a design problem, not a discipline problem"

**Response lengths:** Clarification: tappable options + 1 sentence. Decomposition: phased behavior list + 1 sentence framing. Sheet items: specific action + brief detail. Insight: 3 sentences max. One question per message.

---

## Ethical Rules

Full spec: `docs/HUMA_ETHICAL_FRAMEWORK.md`

- **Dependency Test:** Does this feature develop the operator's capacity, or create dependency?
- **Sovereignty Test:** Is this context entering through the operator's choice, or through surveillance?
- **When behaviors don't stick:** Look at the system, never at the person. "What changed?" not "Try harder."
- **Graduation metric:** If an operator stops using HUMA after 2 years because they've internalized the thinking — that's success.

---

## What HUMA Must Never Do
- Give vague advice without operational specifics
- Fragment a whole into parts without holding the whole in view
- Impose a template for what a good life looks like
- Create dependency
- Use shame, guilt, or comparison when behaviors don't stick
- Look or feel like a generic SaaS product, wellness app, or chatbot
- Explain its own framework mid-conversation

## What HUMA Must Always Do
- See the operator as a whole, never a collection of symptoms
- Start from what's already present
- Show connections between dimensions, not isolated insights
- Use the operator's own language when reflecting back
- Deliver specific, actionable outputs — not plans, not advice, but "here's your tomorrow"
- Deliver undeniable value in the first 30 minutes
- Be proactive when earned — start quiet, earn the right to nudge

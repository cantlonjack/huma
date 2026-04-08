# Design Workspace

Full specs: `docs/HUMA_DESIGN_SYSTEM.md`, `docs/HUMA_VOICE_BIBLE.md`, `docs/HUMA_ETHICAL_FRAMEWORK.md`

## Hard Constraints
- Backgrounds: sand-50 (never white, never #FFF). **Exception:** Card fills use white (#FFFFFF) with sand-300 borders — this is the only place white appears.
- Action color: amber-600 only for clickable elements
- Text: earth/ink tones (never black, never #000)
- Fonts: Cormorant Garamond (content headings) / Source Sans 3 (UI/body)
- Animation: ONE easing — `cubic-bezier(0.22, 1, 0.36, 1)`. Nothing bouncy.
- No dark mode, no gradients/shadows/glass, no Material Design, no gamification

## Dimension Colors
When displaying dimension tags or capital indicators, use these operator-facing names (never the formal 8 Forms of Capital names): Body, People, Money, Home, Growth, Joy, Purpose, Identity, Time.

## Accessibility
- Respect `prefers-reduced-motion` (hook: `useReducedMotion`)
- Touch targets: minimum 44x44px on mobile
- Color contrast: all text meets WCAG AA against sand-50 backgrounds

## Ethical Tests
- **Dependency:** Does this develop the operator's capacity, or create dependency?
- **Sovereignty:** Is context entering through the operator's choice, or surveillance?
- **When behaviors don't stick:** Look at the system, never the person.

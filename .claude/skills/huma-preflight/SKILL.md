---
name: huma-preflight
description: Use before ANY deploy, merge, or release. Also use when asked to verify, test, audit, QA, check accessibility, check responsive behavior, audit UX, or evaluate the landing page. Triggers on deploy, push, ship, PR, ready, done, QA, audit, accessibility, responsive, UX review, landing page check.
---

# HUMA Preflight — Quality Gate

10 gates. Delegates to specialized skills where they exist. Run relevant gates based on what changed, or ALL before deploy.

## Gate 1: Build (BLOCKING)

```bash
cd app && npx tsc --noEmit    # Zero type errors
cd app && npx next build       # Zero build errors
```

## Gate 2: Voice (BLOCKING for hard violations)

**Delegate to huma-voice skill** for full rules. Scan modified files only:
- `app/src/engine/phases.ts` — prompts
- `app/src/components/*.tsx` — UI copy
- `app/src/app/page.tsx` — landing/welcome copy

## Gate 3: Enterprise Data (BLOCKING if changed)

If `enterprise-templates.ts` changed: all templates complete, financial coherence (Year 3 > Year 1), capital scores 1-5, synergy IDs reference existing templates.

## Gate 4: Phase Integrity (BLOCKING if changed)

If `phases.ts` or engine files changed: all phase prompts present, `buildFullPrompt()` handles all phases, transition markers documented.

## Gate 5: Design System (BLOCKING)

**Delegate to huma-design skill** for full rules. Quick checks on modified TSX/CSS:
- [ ] No raw hex colors (search for `#` in style attributes — should use Tailwind tokens)
- [ ] No inline `style={{}}` for colors/fonts/spacing (should use Tailwind classes)
- [ ] Uses `components/ui/` primitives where applicable
- [ ] Fonts are Cormorant Garamond + Source Sans 3 only (no system-ui, Georgia, Inter, Roboto, Arial)
- [ ] Background is sand-50, not white
- [ ] Destructive actions use `text-rose` / `bg-rose`, not red

## Gate 6: Accessibility (WCAG 2.1 AA)

| Check | Requirement |
|-------|-------------|
| Color contrast | Normal text 4.5:1, large text 3:1, UI components 3:1 |
| Keyboard | All interactive elements reachable via Tab, Enter/Space activates |
| Focus | Visible focus indicator on all interactive elements |
| Screen reader | All images have alt, buttons have names, live regions for dynamic content |
| Semantic HTML | Landmarks, heading hierarchy (no skips), proper form labels |
| Motion | `prefers-reduced-motion` respected on all animations |
| Touch | Targets >= 44x44px on mobile |

## Gate 7: Responsive

Check at 375px (mobile), 768px (tablet), 1280px (desktop):
- [ ] No horizontal overflow
- [ ] Text readable, no overflow/truncation
- [ ] Touch targets >= 44px on mobile
- [ ] iOS: no input zoom (font-size >= 16px)

## Gate 8: Route Health

| Route | Check |
|-------|-------|
| `/` | Landing loads, redirects authed users to `/today` |
| `/start` | Conversation entry, archetype selection |
| `/today` | Production sheet renders, check-offs work |
| `/whole` | Holonic visualization, archetype selector, WHY |
| `/grow` | Pattern cards render, grouped by status |
| `/map/sample` | Canvas renders, both samples load |

- [ ] No broken links, no placeholder text, OG meta on `/map/[id]`

## Gate 9: UX Quick Check

- [ ] 5-second test: visitor can tell what HUMA does
- [ ] One primary CTA per screen (amber only)
- [ ] No gamification elements
- [ ] Error states are warm and actionable
- [ ] Loading states for all async operations

## Gate 10: Breaking Changes

Flag if changed: `ConversationContext` interface, `Phase` type, `Message` interface, API route shapes, CSS class renames.

## Output Format

```
=== HUMA PREFLIGHT ===
Date: [timestamp]  Branch: [branch]

BUILD:           PASS / FAIL
VOICE:           PASS / WARN (X soft) / FAIL (X hard)
ENTERPRISE:      PASS / N/A / FAIL
PHASE INTEGRITY: PASS / N/A / FAIL
DESIGN SYSTEM:   PASS / FAIL (X violations)
ACCESSIBILITY:   PASS / FAIL (X issues)
RESPONSIVE:      PASS / FAIL (X issues)
ROUTES:          PASS / FAIL
UX:              PASS / FAIL
BREAKING:        NONE / X detected

VERDICT: SHIP IT / WARNINGS / BLOCKED
===
```

## Modes

- **Full preflight** (before deploy): All 10 gates
- **Quick check** ("is it done?"): Gates 1-4 only
- **Design audit** ("check the design"): Gates 5-7, delegate to huma-design
- **Voice audit** ("check the voice"): Gate 2, delegate to huma-voice
- **Accessibility audit** ("check accessibility"): Gate 6 detailed with WCAG refs

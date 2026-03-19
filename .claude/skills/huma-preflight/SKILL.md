---
name: huma-preflight
description: Use before ANY deploy, merge, or release. Also use when asked to verify, test, audit, QA, check accessibility, check responsive behavior, audit UX, or evaluate the landing page. Triggers on deploy, push, ship, PR, ready, done, QA, audit, accessibility, responsive, UX review, landing page check.
---

# HUMA Preflight — Comprehensive Quality Gate

This skill combines all quality checks into one sequential gate. Run the relevant sections based on what changed, or run ALL sections before deploy.

## Gate 1: Build (BLOCKING)

```bash
cd app && npx tsc --noEmit    # Zero type errors
cd app && npx next build       # Zero build errors
```

If either fails, report and continue — the full picture matters even when blocked.

## Gate 2: Voice Lint (BLOCKING for hard violations)

Scan ALL string literals in modified files against the voice rules:

* `app/src/engine/phases.ts` — prompts
* `app/src/components/*.tsx` — UI copy
* `app/src/app/page.tsx` — landing/welcome copy

Check for forbidden vocabulary, therapist-speak, consultant-speak, AI-writing tics. See huma-voice skill for the complete list.

**Pass:** Zero hard violations. **Warn:** Soft violations only. **Fail:** Hard violations found.

## Gate 3: Enterprise Data (BLOCKING if changed)

If `enterprise-templates.ts` changed:

* All templates have complete fields (no empty strings)
* Financial coherence (Year 3 > Year 1, margins 0-100%)
* Capital scores 1-5 with non-empty notes
* Synergy IDs reference existing templates
* At least one source per template

## Gate 4: Phase Integrity (BLOCKING if changed)

If `phases.ts` or engine files changed:

* All phase prompts present in PHASE_PROMPTS
* `buildFullPrompt()` handles all phases
* `buildDocumentPrompt()` accepts all syntheses
* Enterprise reference injected only during enterprise-map phase
* Transition markers documented correctly

## Gate 5: Design System Compliance

Scan all modified TSX/CSS files:

* [ ] No colors outside palette (search for #FFFFFF, #000, bg-white as page bg, Tailwind defaults)
* [ ] Fonts are Georgia + Inter only (no system-ui, Roboto, Arial)
* [ ] Animation uses `cubic-bezier(0.22, 1, 0.36, 1)`
* [ ] Background is sand-50 (#faf8f5), not white
* [ ] No Material Design patterns, no chat bubbles
* [ ] Spacing uses 8px-base multiples

## Gate 6: Accessibility (WCAG 2.1 AA)

| Check | Requirement |
|-------|-------------|
| Color contrast | Normal text 4.5:1, large text 3:1, UI components 3:1 |
| Keyboard | All interactive elements reachable via Tab, Enter/Space activates |
| Focus | Visible focus indicator on all interactive elements |
| Screen reader | All images have alt, buttons have names, live regions for dynamic content |
| Semantic HTML | Landmarks, heading hierarchy (no skips), proper form labels |
| Motion | `prefers-reduced-motion` respected on all animations |
| Touch | Targets ≥ 44x44px on mobile |

Known high-risk combinations to check:
* earth-500 on sand-50 (tertiary text — likely fails 4.5:1)
* white on amber-400 (CTA button — verify)
* sage-500 on sand-50 (brand label — verify)

## Gate 7: Responsive

Check at 375px (mobile), 768px (tablet), 1280px (desktop):

* [ ] No horizontal overflow on any screen
* [ ] Text readable, no overflow/truncation
* [ ] Touch targets ≥ 44px on mobile
* [ ] iOS: no input zoom (font-size ≥ 16px)
* [ ] MapPreview: floating pill (mobile) vs sidebar (desktop)
* [ ] Financial tables scrollable on small screens

## Gate 8: Route Health

| Route | Check |
|-------|-------|
| `/` | Landing page loads, matches reference HTML |
| `/begin` | Name input, auto-focus, no extra fields |
| `/conversation` | Messages render, phase indicator shows |
| `/map/sample` | Canvas renders, enterprises have numbers |
| `/map/sample` toggle | Canvas ↔ Document both work |

* [ ] No broken links
* [ ] No placeholder text visible ("Lorem ipsum", "TODO")
* [ ] OG meta tags present on `/map/[id]`

## Gate 9: UX Quick Check

* [ ] 5-second test: Can a visitor tell what HUMA does, what they get, and what it costs?
* [ ] One primary CTA per screen (amber only)
* [ ] No gamification elements (points, badges, streaks)
* [ ] Error states are warm and actionable
* [ ] Loading states present for all async operations
* [ ] Auto-scroll works during streaming
* [ ] Phase transitions feel natural, not announced

## Gate 10: Breaking Change Scan

Flag if changed:

* `ConversationContext` interface → localStorage maps may not load
* `Phase` type → state machine may break
* `Message` interface → chat display may break
* API route shape → client fetch may break
* CSS class renames → component styles may break

## Output Format

```
═══ HUMA PREFLIGHT ═══
Date: [timestamp]
Branch: [branch]
Commit: [hash + message]

BUILD:           ✓ PASS / ✗ FAIL
VOICE:           ✓ PASS / ⚠ WARN (X soft) / ✗ FAIL (X hard)
ENTERPRISE:      ✓ PASS / N/A / ✗ FAIL
PHASE INTEGRITY: ✓ PASS / N/A / ✗ FAIL
DESIGN SYSTEM:   ✓ PASS / ✗ FAIL (X violations)
ACCESSIBILITY:   ✓ PASS / ✗ FAIL (X issues)
RESPONSIVE:      ✓ PASS / ✗ FAIL (X issues)
ROUTES:          ✓ PASS / ✗ FAIL
UX:              ✓ PASS / ✗ FAIL (X issues)
BREAKING:        ✓ NONE / ⚠ X detected

VERDICT: [SHIP IT / WARNINGS — REVIEW / BLOCKED — FIX REQUIRED]

BLOCKING: [list]
WARNINGS: [list]
═══════════════════════
```

## Modes

* **Full preflight** (before deploy): Run all 10 gates
* **Quick check** ("is it done?"): Gates 1-4 only, compressed output
* **Design audit** ("check the design"): Gates 5-7 only
* **Voice audit** ("check the voice"): Gate 2 only, detailed
* **Accessibility audit** ("check accessibility"): Gate 6, detailed with WCAG references

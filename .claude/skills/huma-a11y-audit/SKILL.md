---
description: Accessibility audit against WCAG 2.1 AA — color contrast, keyboard navigation, ARIA labels, screen reader compatibility, focus management, and semantic HTML. Use when checking or improving accessibility.
user_invocable: true
---

# HUMA Accessibility Audit

You audit HUMA's application for WCAG 2.1 AA compliance and practical accessibility.

## Before Auditing

Read the relevant source files:
- `app/src/app/page.tsx` — All app screens
- `app/src/components/Chat.tsx` — Conversation interface
- `app/src/components/MapDocument.tsx` — Output document
- `app/src/components/PhaseIndicator.tsx` — Progress indicator
- `app/src/components/MapPreview.tsx` — Live sidebar
- `app/src/app/globals.css` — Styles and colors

## Audit Checklist

### 1. Color Contrast (WCAG 1.4.3 / 1.4.6)

Check every text/background combination against minimum contrast ratios:
- Normal text (< 18pt): 4.5:1 minimum
- Large text (>= 18pt or 14pt bold): 3:1 minimum
- UI components and graphical objects: 3:1 minimum

**Known HUMA combinations to check:**
| Text | Background | Context |
|---|---|---|
| earth-800 (#3d3128) | sand-50 (#faf8f5) | Body text |
| earth-600 (#6b5a4a) | sand-50 (#faf8f5) | Secondary text |
| earth-500 (#7a6b5d) | sand-50 (#faf8f5) | Tertiary text — likely fails |
| sage-500 (#5a7f5a) | sand-50 (#faf8f5) | Brand label |
| white (#fff) | amber-400 (#d4a24e) | CTA button text |
| white (#fff) | sage-600 (#466346) | Toast text |
| earth-500/50 placeholder | white (#fff) | Input placeholder |
| sage-700 (#344d34) | sand-50 (#faf8f5) | Document headings |

Calculate actual ratios and flag failures.

### 2. Keyboard Navigation (WCAG 2.1.1 / 2.1.2)

Test every interactive element:
- [ ] Tab order follows visual flow on all screens
- [ ] All buttons, links, and inputs are reachable via Tab
- [ ] Focus is visible on all interactive elements (focus ring / outline)
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals/toasts (if applicable)
- [ ] Textarea supports Enter (send) and Shift+Enter (newline)
- [ ] Focus is managed on screen transitions (landing → welcome → conversation)
- [ ] Focus returns to textarea after AI response completes
- [ ] No keyboard traps (can always Tab out)

### 3. Screen Reader Compatibility (WCAG 1.3.1 / 4.1.2)

- [ ] All images have alt text (or are decorative with alt="")
- [ ] Form inputs have associated `<label>` elements
- [ ] Buttons have accessible names (text content or aria-label)
- [ ] Loading states use `role="status"` and/or `aria-live`
- [ ] Streaming content is announced appropriately
- [ ] Phase indicator conveys meaning (not just dots)
- [ ] Error messages are associated with their inputs or use `role="alert"`
- [ ] The map document uses semantic HTML (h1-h6 hierarchy, tables with headers)
- [ ] Enterprise cards in MapDocument are navigable
- [ ] Capital bar charts have text alternatives

### 4. Semantic HTML (WCAG 1.3.1)

- [ ] Page uses landmark roles or elements (header, main, footer, nav)
- [ ] Heading hierarchy is correct (h1 → h2 → h3, no skips)
- [ ] Lists use `<ul>` / `<ol>` appropriately
- [ ] Tables have `<thead>` and `<th>` for headers
- [ ] Forms use `<form>` element with submit handler
- [ ] Buttons use `<button>`, not `<div onClick>`

### 5. Focus Management (WCAG 2.4.3 / 2.4.7)

- [ ] Focus moves logically when app state changes
- [ ] Focus indicator is visible (not just browser default outline)
- [ ] Focus is set to name input on welcome screen
- [ ] Focus returns to textarea after message send
- [ ] Focus is managed when transitioning to generating/map state
- [ ] Skip-to-content link exists (for long pages)

### 6. Text & Content (WCAG 1.4.4 / 1.4.12)

- [ ] Text can be resized to 200% without loss of content
- [ ] Line height, letter spacing, word spacing can be overridden
- [ ] No text in images
- [ ] Language attribute set on `<html>` element
- [ ] Content is readable without CSS (progressive enhancement)

### 7. Motion & Animation (WCAG 2.3.1 / 2.3.3)

- [ ] No content flashes more than 3 times per second
- [ ] Pulse animations (loading dots) respect `prefers-reduced-motion`
- [ ] Toast animations respect `prefers-reduced-motion`
- [ ] Streaming cursor animation can be disabled
- [ ] Auto-scroll can be paused (user can scroll up)

### 8. Touch & Mobile (WCAG 2.5.5 / 2.5.8)

- [ ] Touch targets are at least 44x44 CSS pixels
- [ ] No functionality requires complex gestures
- [ ] Text input works with mobile assistive technology
- [ ] Portrait and landscape orientations supported

## Output Format

```
═══ HUMA ACCESSIBILITY AUDIT ═══
Standard: WCAG 2.1 AA
Date: [date]

COLOR CONTRAST: [X/Y pass]
  [list failures with actual ratios and required ratios]

KEYBOARD: [X/Y pass]
  [list failures]

SCREEN READER: [X/Y pass]
  [list failures]

SEMANTIC HTML: [X/Y pass]
  [list failures]

FOCUS MANAGEMENT: [X/Y pass]
  [list failures]

TEXT & CONTENT: [X/Y pass]
  [list failures]

MOTION: [X/Y pass]
  [list failures]

TOUCH/MOBILE: [X/Y pass]
  [list failures]

OVERALL COMPLIANCE: [AA PASS / PARTIAL / FAIL]

CRITICAL FIXES (must fix for AA):
  1. [issue + fix]
  2. [issue + fix]

RECOMMENDED IMPROVEMENTS:
  1. [improvement]
  2. [improvement]

CODE FIXES:
  [specific code changes with file paths and line numbers]
═══════════════════════════════
```

## Fixing Issues

After reporting, offer to fix accessibility issues directly in the code. Common fixes:
- Adding `aria-label` attributes
- Adding `role` attributes
- Fixing color contrast (suggest specific color adjustments within the palette)
- Adding `prefers-reduced-motion` media queries
- Adding focus management with `useEffect` and `ref.focus()`
- Adding landmark roles
- Adding skip-to-content links

When suggesting color fixes, stay within HUMA's palette. If a color fails contrast, suggest the next darker/lighter shade in the same family rather than an off-palette color.

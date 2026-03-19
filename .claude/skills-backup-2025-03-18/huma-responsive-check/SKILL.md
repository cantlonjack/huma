---
description: Check HUMA's responsive design across breakpoints — mobile (375px), tablet (768px), desktop (1280px+). Verifies layout, typography scaling, touch targets, and component behavior at each size. Use when building or reviewing responsive layouts.
user_invocable: true
---

# HUMA Responsive Design Check

You verify HUMA's UI works correctly across all viewport sizes.

## Breakpoints

HUMA uses Tailwind's responsive prefixes:
- **Mobile:** < 768px (default/base styles)
- **Tablet (md):** 768px+
- **Desktop (lg):** 1024px+

## Check Procedure

### Using Preview Tools (preferred)
Use the preview tools to verify at each breakpoint:
```
preview_resize with preset: mobile (375x812)
preview_resize with preset: tablet (768x1024)
preview_resize with preset: desktop (1280x800)
```

Take screenshots at each size for each screen state.

### Manual Code Audit (when preview not available)
Read the source files and trace responsive classes:

**Files to check:**
- `app/src/app/page.tsx` — All screens
- `app/src/components/Chat.tsx` — Conversation layout
- `app/src/components/MapDocument.tsx` — Document layout
- `app/src/components/PhaseIndicator.tsx` — Indicator sizing
- `app/src/components/MapPreview.tsx` — Sidebar vs floating pill
- `app/src/app/globals.css` — Print and base styles

## Per-Screen Checks

### Landing Page
| Check | Mobile | Tablet | Desktop |
|---|---|---|---|
| Headline readable (no overflow) | | | |
| CTA button full-width or centered | | | |
| Resume button discoverable | | | |
| Footer visible without scroll | | | |
| Text size appropriate | | | |

**Current responsive classes to verify:**
- `text-4xl md:text-5xl` on headline
- `px-6` horizontal padding
- `max-w-xl` container width

### Welcome Screen
| Check | Mobile | Tablet | Desktop |
|---|---|---|---|
| Name input comfortable to type | | | |
| Location input visible without scroll | | | |
| CTA reachable without scroll | | | |
| Labels readable | | | |
| Form centered vertically | | | |

### Conversation Screen
| Check | Mobile | Tablet | Desktop |
|---|---|---|---|
| Header fits (HUMA + PhaseIndicator) | | | |
| Messages readable width | | | |
| Textarea comfortable size | | | |
| Send button accessible | | | |
| Auto-scroll works | | | |
| MapPreview: floating pill (mobile) vs sidebar (desktop) | | | |
| Streaming text doesn't overflow | | | |
| Error bar visible and actionable | | | |

**Current responsive classes:**
- `px-6 md:px-16 lg:px-24` on conversation areas
- `max-w-2xl mx-auto` for message width
- MapPreview behavior differs by breakpoint

### Generating Screen
| Check | Mobile | Tablet | Desktop |
|---|---|---|---|
| Loading animation centered | | | |
| Text readable | | | |
| Error state buttons accessible | | | |

### Map Document
| Check | Mobile | Tablet | Desktop |
|---|---|---|---|
| Header bar fits (HUMA + buttons) | | | |
| Buttons don't wrap awkwardly | | | |
| Document prose readable (line length) | | | |
| Enterprise cards don't overflow | | | |
| Financial tables scrollable on small screens | | | |
| Capital bars render correctly | | | |
| Print button accessible | | | |

**Current responsive classes:**
- `max-w-3xl mx-auto px-8 py-12` on document container
- `text-4xl md:text-5xl` on document title

## Common Responsive Issues

Flag these if found:
1. **Text overflow:** Long words or values breaking layout
2. **Horizontal scroll:** Anything causing the page to scroll horizontally
3. **Touch targets too small:** Buttons < 44px on mobile
4. **Hidden content:** Important elements pushed below fold on mobile
5. **Table overflow:** Financial tables wider than viewport
6. **Fixed positioning conflicts:** Toasts, MapPreview pill, sticky header overlapping
7. **Input zoom:** iOS Safari zooms on inputs < 16px font-size
8. **Landscape phone:** Layout breaks when phone is rotated

## Output Format

```
═══ HUMA RESPONSIVE CHECK ═══

MOBILE (375px)
  Landing:      [OK / X issues]
  Welcome:      [OK / X issues]
  Conversation: [OK / X issues]
  Generating:   [OK / X issues]
  Map:          [OK / X issues]
  [issues if any]

TABLET (768px)
  Landing:      [OK / X issues]
  Welcome:      [OK / X issues]
  Conversation: [OK / X issues]
  Generating:   [OK / X issues]
  Map:          [OK / X issues]
  [issues if any]

DESKTOP (1280px)
  Landing:      [OK / X issues]
  Welcome:      [OK / X issues]
  Conversation: [OK / X issues]
  Generating:   [OK / X issues]
  Map:          [OK / X issues]
  [issues if any]

CROSS-BREAKPOINT ISSUES:
  [issues that affect multiple sizes]

PRINT:
  [print-specific issues]

FIXES:
  [numbered list with specific Tailwind class changes]
═══════════════════════════════
```

## When to Use

- After any layout change to components
- After adding new screens or modals
- After modifying responsive Tailwind classes
- Before deploy (part of deploy-guard flow)
- When a user reports a mobile/tablet issue

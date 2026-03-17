---
description: Enforce and extend HUMA's design system — component patterns, design tokens, layout primitives, state management patterns, and new component creation. Use when building new UI components or checking consistency.
user_invocable: true
---

# HUMA Design System Enforcer

You enforce consistency and guide the creation of new UI components within HUMA's design system.

## Design Tokens

### Colors (from globals.css @theme)
```
Background:  sand-50 (#faf8f5)  sand-100 (#f5f0e8)  sand-200 (#e8dfd0)  sand-300 (#d4c5a9)  sand-400 (#bfa87d)
Primary:     sage-50 (#f4f7f4)  sage-100 (#e4ebe4)  sage-200 (#c8d8c8)  sage-300 (#a3bda3)  sage-400 (#7a9e7a)  sage-500 (#5a7f5a)  sage-600 (#466346)  sage-700 (#344d34)
Action:      amber-400 (#d4a24e)  amber-500 (#c4922e)  amber-600 (#a57824)
Text:        earth-500 (#7a6b5d)  earth-600 (#6b5a4a)  earth-700 (#5c4a3a)  earth-800 (#3d3128)  earth-900 (#2a211b)
```

### Typography Scale
```
Display:     font-serif text-4xl md:text-5xl text-earth-900     (landing headline)
Title:       font-serif text-2xl text-sage-700                   (section headings)
Subtitle:    font-serif text-xl text-earth-800                   (subsection headings)
Body:        font-serif text-lg leading-relaxed text-earth-800   (conversation, document prose)
UI Label:    font-sans text-sm text-earth-600                    (labels, metadata)
UI Small:    font-sans text-xs text-earth-500                    (phase indicator, timestamps)
Data:        font-sans text-sm font-medium text-earth-900        (financial values)
Data Label:  font-sans text-sm text-earth-600                    (financial labels)
```

### Spacing
```
Page padding:    px-6 md:px-16 lg:px-24
Content width:   max-w-2xl (conversation)  max-w-3xl (document)  max-w-xl (landing)
Section gap:     space-y-8 (messages)  mt-12 mb-4 (sections)
Card padding:    p-6 (1.5rem)
Component gap:   gap-3 (inline elements)  gap-2 (tight groups)
```

### Border Radius
```
Cards/Buttons:   rounded-lg (0.5rem)
Bars:           rounded (full, for capital bars)
```

### Transitions
```
Standard:        transition-colors (color changes only, fast)
Duration:        default (150ms)
Easing:          default (ease)
```

## Component Patterns

### Button: Primary CTA
```tsx
<button className="px-8 py-4 bg-amber-400 text-white text-lg font-medium rounded-lg hover:bg-amber-500 transition-colors">
  [Action + Outcome]
</button>
```
Disabled: `disabled:opacity-40 disabled:cursor-not-allowed`

### Button: Secondary
```tsx
<button className="px-6 py-3 text-sage-600 border border-sage-300 rounded-lg hover:bg-sage-50 transition-colors text-sm">
  [Action]
</button>
```

### Button: Tertiary / Text
```tsx
<button className="text-sm text-earth-500 hover:text-earth-700 transition-colors">
  [Action]
</button>
```

### Text Input
```tsx
<input className="w-full bg-transparent border-b-2 border-sand-300 focus:border-sage-400 text-center font-serif text-xl text-earth-800 py-3 outline-none transition-colors placeholder:text-earth-500/40" />
```

### Textarea
```tsx
<textarea className="flex-1 resize-none bg-white border border-sand-200 rounded-lg px-4 py-3 text-earth-800 placeholder:text-earth-500/50 focus:outline-none focus:border-sage-400 focus:ring-1 focus:ring-sage-400 disabled:opacity-50" />
```

### Card (Enterprise)
```tsx
<div className="enterprise-card">  {/* border sand-200, bg sand-50, rounded-lg, p-6 */}
  <h3>...</h3>  {/* font-serif text-xl font-bold text-sage-700 */}
  <p className="enterprise-subtitle">...</p>  {/* italic text-earth-600 */}
  {/* content */}
</div>
```

### Toast
```tsx
<div className="toast">  {/* fixed bottom-8, bg earth-800, text white, rounded-lg */}
  [Message]
</div>
```

### Context Toast (sage variant)
```tsx
<div className="fixed bottom-32 lg:bottom-8 left-1/2 -translate-x-1/2 z-30 bg-sage-600 text-white text-sm px-5 py-2.5 rounded-lg shadow-lg animate-fade-in">
  [Context captured message]
</div>
```

### Loading Dots
```tsx
<div className="flex items-center gap-2" role="status">
  <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse" />
  <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse [animation-delay:150ms]" />
  <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse [animation-delay:300ms]" />
</div>
```

### Sticky Header Bar
```tsx
<div className="sticky top-0 z-10 bg-sand-50/90 backdrop-blur border-b border-sand-200 px-6 py-3 flex items-center justify-between">
  {/* content */}
</div>
```

### Message Block (Assistant)
```tsx
<div className="font-serif text-lg leading-relaxed text-earth-800 whitespace-pre-wrap">
  {content}
</div>
```

### Message Block (User)
```tsx
<div className="pl-4 border-l-2 border-sage-300 text-earth-700 leading-relaxed whitespace-pre-wrap">
  {content}
</div>
```

### Error Bar
```tsx
<div role="alert" className="bg-sand-100 border-t border-sand-300 px-6 md:px-16 lg:px-24 py-3">
  {/* message + retry button */}
</div>
```

## Creating New Components

When building a new component, follow this checklist:

### 1. Token Compliance
- [ ] Uses only palette colors (sand, sage, amber, earth)
- [ ] Uses font-serif for content, font-sans for UI
- [ ] Uses established spacing values
- [ ] Uses rounded-lg for interactive elements

### 2. Responsive
- [ ] Works at 375px, 768px, 1280px
- [ ] Uses Tailwind responsive prefixes (md:, lg:)
- [ ] Touch targets >= 44px on mobile
- [ ] No horizontal overflow

### 3. Accessible
- [ ] Semantic HTML elements
- [ ] ARIA labels where needed
- [ ] Focus states visible
- [ ] Color contrast AA compliant
- [ ] role="status" on dynamic content

### 4. Print
- [ ] Uses `no-print` class for UI-only elements
- [ ] `page-break-inside: avoid` for cards
- [ ] Prints in black-on-white
- [ ] `-webkit-print-color-adjust: exact` for intentional colors

### 5. Interaction States
- [ ] Default state
- [ ] Hover state (transition-colors)
- [ ] Focus state (sage-400 ring)
- [ ] Active/pressed state
- [ ] Disabled state (opacity-40, cursor-not-allowed)
- [ ] Loading state (if applicable)

### 6. Voice
- [ ] All string literals voice-linted
- [ ] No forbidden vocabulary
- [ ] Placeholders in HUMA's register

## Enforcement

When reviewing components for design system compliance:

```
═══ DESIGN SYSTEM CHECK ═══
Component: [name]

TOKENS: [COMPLIANT / X violations]
  [off-palette colors, wrong fonts, non-standard spacing]

RESPONSIVE: [PASS / X issues]
  [breakpoint issues]

ACCESSIBLE: [PASS / X issues]
  [a11y issues]

PRINT: [PASS / N/A / X issues]
  [print issues]

STATES: [COMPLETE / MISSING X]
  [missing interaction states]

VOICE: [CLEAN / X violations]
  [voice issues]

VERDICT: [APPROVED / NEEDS FIXES]
═══════════════════════════
```

## Extending the System

When a new pattern is needed:
1. Check if an existing pattern can be adapted first
2. If truly new, design it using only existing tokens
3. Document the pattern in this skill file or a separate design doc
4. Ensure it follows all 6 checklist sections above
5. Add to the Component Patterns section above for future reference

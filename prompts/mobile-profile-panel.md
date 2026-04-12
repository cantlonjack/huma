# Prompt: Mobile Life Profile on /start

## Context
The "Your Profile" panel on `/start` is desktop-only (hidden behind `lg:` breakpoint). On mobile, users see the conversation and a toggle for palette suggestions, but no visibility into the Life Profile building in real-time. This was the core UX complaint — "I don't know what context it's extracted."

## Current Mobile Layout (start/page.tsx)
- Chat area takes full width
- Input bar at bottom
- "N related topics..." toggle above input opens a tray with PalettePanel
- Desktop right panel (`hidden lg:flex`) has tabbed Suggestions | Your Profile

## Approach: Collapsible Profile Tray (below input area)

The simplest approach that preserves the conversation-first mobile experience:

### Option A — Persistent mini-bar + expandable drawer
Show a thin status bar below the input that says "2 of 7 · Who you are, Where you are" (the filled section names). Tapping it slides up a half-screen drawer showing the full LifeProfile in `filling` mode. This is always visible and updates live as context markers arrive.

```
┌─────────────────────────┐
│  [conversation]         │
│                         │
│                         │
├─────────────────────────┤
│  [input bar]            │
├─────────────────────────┤
│  ● 2 of 7 sections  ▲  │  ← tappable mini-bar
└─────────────────────────┘

// Expanded:
┌─────────────────────────┐
│  [conversation]         │
├─────────────────────────┤
│  [input bar]            │
├─────────────────────────┤
│  ● 2 of 7 sections  ▼  │
│  ┌───────────────────┐  │
│  │ Who you are       │  │
│  │ "I exist to..."   │  │
│  │ Father, builder   │  │
│  ├───────────────────┤  │
│  │ Where you are     │  │
│  │ Rural Michigan    │  │
│  ├───────────────────┤  │
│  │ ░ Who's around... │  │  ← sparse, dashed
│  │ ░ How you're...   │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

### Implementation

1. **Add a `ProfileMiniBar` component** — shows filled count + latest section names. Tapping toggles the drawer.

2. **Replace the mobile palette toggle** with a combined toggle that cycles: closed → profile → suggestions → closed. Or show both: profile bar is always visible, suggestions toggle is separate.

   Simpler: keep the existing "N related topics..." toggle for palette. Add the profile mini-bar as a separate always-visible element between input and palette.

3. **The drawer** reuses `<LifeProfile>` in `filling` mode, wrapped in a slide-up container with max-height ~50vh and overflow-y scroll.

4. **Auto-pulse on new context**: When a `[[CONTEXT:...]]` marker is parsed and a new section fills for the first time, briefly highlight the mini-bar (e.g., pulse the dot green for 1s). This gives users the dopamine hit of "HUMA just learned something."

### Files to modify
- `app/src/app/start/page.tsx` — add ProfileMiniBar, drawer state, render below input on mobile
- Possibly extract ProfileMiniBar into `app/src/components/whole/ProfileMiniBar.tsx` if it gets complex

### Design Details
- Mini-bar: `font-sans text-xs`, dot indicator uses `bg-sage-400`, section names truncated with ellipsis
- Drawer: `bg-sand-50 border-t border-sand-200`, slides up with `transition-all duration-300`
- Pulse animation on new context: reuse the existing `contextFlash` state from start/page.tsx
- Below `lg:` breakpoint only — desktop keeps the side panel

### Testing
- Mobile viewport: mini-bar visible below input, shows "0 of 7 sections"
- After sending a message that triggers context extraction: mini-bar updates to "1 of 7" with section name
- Tapping mini-bar: drawer slides up showing full profile
- Tapping again: drawer closes
- Desktop viewport: mini-bar hidden, side panel shows instead
- Drawer scrolls if all 7 sections are visible
- Pulse animation fires when a new section fills for the first time

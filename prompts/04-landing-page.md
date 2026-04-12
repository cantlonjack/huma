# Prompt 04: Landing Page — Put the Best Dish in the Window

## Objective
Build a landing page that shows a new visitor — specifically a freelancer, solopreneur, or creative professional managing a complex self-directed life — what HUMA produces BEFORE asking them anything. An interactive product demo that walks through a real conversation, reveals dimension mapping, and shows a personalized morning briefing. Then a single CTA: "Start a conversation."

## Why This Matters
The beachhead is freelancers, solopreneurs, and creative professionals — people who ARE their own system. Their money, time, health, relationships, and work are visibly coupled with no employer buffer. They're already paying for fragment tools (calendars, invoicing, habit trackers, therapy apps) that don't talk to each other. HUMA is the integration layer.

The landing page must make a stranger feel "oh, I want that" before asking them anything. The interactive demo is the atomic unit of proof — it shows the conversation, the dimension mapping, and the briefing in sequence.

## Current State

The root page (`app/src/app/page.tsx`) currently:
- Checks auth state and aspirations
- If no user + no aspirations → renders `LandingView`
- `LandingView` is a simple component with a CTA button that pushes to `/start`

We need to replace `LandingView` with a proper landing page.

## Architecture

### New Component: `app/src/components/landing/LandingPage.tsx`

This replaces the current `LandingView`. Structure (single scroll, no navigation):

#### Section 1: Hero (viewport height)

```
[Full viewport, sand-50 background]

HUMA (wordmark, nav left)                    [Get started] (nav right)

LIFE INFRASTRUCTURE (uppercase label)

See how your life
actually connects.
Find the leverage.
[Cormorant Garamond, clamp(2rem, 4.5vw, 3.2rem), ink-900]

Your money, sleep, relationships, and work
aren't separate problems. HUMA shows you how
they connect — and which one daily behavior
holds everything else together.
[Source Sans 3, 1.05rem, earth-500, max-w-[420px]]

[Start a conversation →]    No account needed · 5 minutes
[sage-700 background, sand-50 text, rounded-full]

RIGHT SIDE: Interactive product demo card showing:
1. A conversation between HUMA and a freelancer
2. Dimension dots lighting up as context is revealed
3. Extraction animation mapping across 8 dimensions
4. A personalized morning briefing with through-line
```

The hero is a two-column layout (copy left, interactive demo right). The demo IS the proof.

#### Section 2: The Difference (below fold)

Three value propositions, each with a vertical sage/sky/amber accent bar. No icons, no feature grid.

```
[sand-50 background, max-w-[720px], centered]

It reasons about your life. It doesn't just organize it.
[Cormorant Garamond, clamp(1.4rem, 3vw, 1.9rem)]

[accent bar] It remembers everything
Your cash flow timing. Your partner's schedule. The client
deadline from three weeks ago. HUMA holds your full context
and uses all of it, every morning.

[accent bar] It sees connections
Cooking dinner improves your sleep. Sleep improves your focus.
Focus gets you done by 3pm. Getting done by 3pm gives you
your evening back. HUMA traces the chain — and finds the one move.

[accent bar] It learns your rhythm
After a week, it notices your best creative days follow an
evening walk. It sees when a part of your life goes quiet.
It adapts without you configuring anything.
```

Each block scroll-reveals with the standard cubic-bezier easing.

#### Section 3: Bottom CTA

```
[sand-100 background, py-24 md:py-32]

What's going on in your life?
[Cormorant Garamond, clamp(1.6rem, 3vw, 2.2rem), ink-900, centered]

Start a conversation. HUMA builds your first morning
briefing in five minutes.
[Source Sans 3, 0.95rem, earth-400, centered]

[Start a conversation →]
[sage-700 background, sand-50 text, rounded-full]

No account. No forms. Just a conversation.
[Source Sans 3, 0.8rem, earth-300, centered]
```

### Mobile Behavior
- The entire page is a single scroll
- Hero fills viewport on mobile (100dvh)
- Example sheet card is full-width with 16px side padding on mobile
- All text is already constrained to max-widths that work on mobile
- Touch target for CTA: minimum 48px height

### Integration with Existing Root Page

In `app/src/app/page.tsx`:
- Replace the `LandingView` import with `LandingPage`
- The routing logic stays the same: only show the landing page when there's no user AND no aspirations
- The "Start yours" / "Start" buttons both push to `/start`

### OG Meta for Homepage

Already updated in `app/src/app/layout.tsx`:
```typescript
export const metadata = {
  title: "HUMA — See how your life actually connects",
  description: "Your money, sleep, relationships, and work aren't separate problems. HUMA shows you how they connect and which daily behavior holds everything together.",
  openGraph: {
    title: "HUMA — Life Infrastructure",
    description: "See how your life actually connects. Find the one daily behavior that holds everything else together.",
  },
};
```

## Files to Create/Modify

| File | Change |
|------|--------|
| `app/src/components/landing/LandingPage.tsx` | **NEW** — Full landing page component |
| `app/src/app/page.tsx` | Replace `LandingView` with `LandingPage` |
| `app/src/app/layout.tsx` | Update metadata for OG |

## Design Constraints
- **No stock images, no illustrations** — the interactive demo IS the visual
- **sand-50 default background** — never white (except card fills)
- **Subtle shadow on the product demo card only** — everything else flat
- **Cormorant Garamond** for all display/headline text
- **Source Sans 3** for all body/functional text
- **ink-900** for headlines, **ink-700** for subheads, **earth-400/500** for supporting text
- **amber-600** for CTA buttons only
- **Single easing curve** for any scroll-triggered reveals: `cubic-bezier(0.22, 1, 0.36, 1)`, 600ms
- Respect `prefers-reduced-motion` — no scroll animations if set
- The demo conversation must feel REAL — specific freelancer, specific details, specific dimensions
- The briefing must show cross-dimensional reasoning, not generic to-dos
- Hero conversation persona: freelancer with two big clients, a side project, burnout, stopped cooking

## What This Is NOT
- Not a marketing site with testimonials, pricing, or feature comparison
- Not a "How it works" explainer with numbered steps
- Not a signup funnel with email capture (that comes later)
- Not responsive redesign of the whole app — just the landing page for new visitors

## Verification
- Open `huma-two.vercel.app` in incognito (no auth, no localStorage)
- Should see the landing page, not the archetype screen
- Scroll down — example sheet should look like a real production sheet
- Tap "Start yours" — should navigate to `/start`
- Check mobile viewport (375px wide) — everything should fit and read well
- The example sheet card should be the most visually compelling thing on the page

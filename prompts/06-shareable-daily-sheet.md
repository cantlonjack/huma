# Prompt 06: The Shareable Daily Sheet — Make It Screenshot-Worthy

## Objective
Make the daily production sheet so visually compelling that people screenshot it and send it to friends. Add a one-tap share that generates a beautiful OG image of TODAY'S sheet (not the map — the thing people actually see every day). The production sheet is the viral unit. Every pixel should make someone ask "what made that for you?"

## Why This Matters
The production sheet is the atomic unit of HUMA's value. It's the thing people see every morning. It's specific, personal, and unlike anything else in the market. But right now it's rendered as functional UI — checkbox rows in a list. It's good, but it's not *screenshot-worthy*.

The existing share infrastructure generates OG images for maps and insights, but NOT for the daily sheet — the one artifact every user sees every single day. This is the highest-leverage shareability improvement possible.

## Part 1: Visual Polish of the Sheet on `/today`

### Current State
`CompiledEntryRow.tsx` renders each entry as:
- Headline (Cormorant Garamond, 17-19px)
- Detail (Source Sans 3, collapsed to 1.5em)
- Dimension tags (11px, bottom)
- Checkbox toggle
- Strikethrough on check

### Enhancements (subtle, not a redesign)

1. **Through-line treatment**: The through-line sentence currently renders as plain italic text. Instead:
   - Render it in a dedicated card at the top of the sheet section
   - Cormorant Garamond, 15px, italic, ink-600
   - Left border: 2px solid amber-400 (like a pull quote)
   - Padding: 12px left, 8px top/bottom
   - This makes the through-line feel like the organizing insight, not a subtitle

2. **Trigger entry emphasis**: The first entry (the trigger/keystone) currently gets a slightly larger font. Enhance:
   - Add a small label above entry 1: "THE MOVE" — Source Sans 3, 10px, uppercase, letter-spacing 0.1em, amber-600
   - This signals to the user (and anyone they share it with) that this is the domino

3. **Dimension tag colors**: Currently all tags are the same color. Use the design system's dimension colors:
   - Body: sage, People: sky, Money: amber, Home: earth, Growth: sage-dark, Joy: amber-light, Purpose: ink, Identity: sand-dark
   - Each tag gets a subtle background tint (dimension color at 10% opacity) with dimension-colored text
   - This adds visual richness and reinforces the multi-dimensional nature of each action

4. **Date header refinement**: Currently shows "H U M A" + date + day count. Add:
   - Season indicator: "Early Spring" (already computed in `sheet-compiler.ts` via `getSeason()`)
   - Day count with label: "Day 23" (already present, just style it)
   - Format: "Tuesday, April 8 · Early Spring · Day 23"
   - Source Sans 3, 13px, earth-400

### Files to Modify for Visual Polish

| File | Change |
|------|--------|
| `app/src/components/today/CompiledEntryRow.tsx` | Dimension tag colors, trigger label |
| `app/src/app/today/page.tsx` | Through-line card treatment, date header refinement |

## Part 2: Sheet Share Image Generation

### New API Route: `app/src/app/api/og/sheet/route.tsx`

Generate an OG-style image of today's production sheet. This uses Next.js ImageResponse (same pattern as existing `/api/og/route.tsx`).

**Endpoint**: `GET /api/og/sheet?data={base64-encoded-sheet-json}`

**Why base64 in query params**: The sheet data is per-user and per-day. We can't look it up server-side without auth complexity. Instead, encode the minimal sheet data in the URL. Base64 keeps it URL-safe. The data is small (5 entries × ~100 chars = ~500 bytes before encoding).

**Input data shape** (encoded in query param):
```typescript
type SheetShareData = {
  name: string;           // Operator first name
  date: string;           // "Tuesday, April 8"
  season: string;         // "Early Spring"  
  dayCount: number;
  throughLine: string;
  entries: {
    headline: string;
    dimensions: string[];
    isChecked: boolean;
  }[];
};
```

**Image layout** (1080×1920 — Instagram story aspect ratio, also works as screenshot):

```
[1080×1920, sand-50 background]

[Top section: 120px padding top]
H U M A
[Cormorant Garamond, 36px, tracked wide, ink-900, centered]

[20px spacer]

Tuesday, April 8 · Early Spring
[Source Sans 3, 16px, earth-400, centered]

Day 23
[Source Sans 3, 14px, earth-300, centered]

[40px spacer]

[Through-line card: left amber border, max-width 800px, centered]
"The garden and the budget are the same project today."
[Cormorant Garamond, 18px, italic, ink-600]

[40px spacer]

[Entries — each as a card-like row, max-width 800px, centered]

For each entry:
  [24px vertical padding between entries]
  [If checked: ✓ in amber-600, headline has line-through at 0.4 opacity]
  [If unchecked: ○ in earth-300]
  
  Headline
  [Cormorant Garamond, 22px, ink-900]
  
  [Dimension tags — colored pills, 12px, inline]
  Home · Body
  
[Bottom section: 80px padding bottom]
huma-two.vercel.app
[Source Sans 3, 13px, earth-300, centered]
```

**Also generate a 1200×630 variant** for OG/Twitter cards (same layout, compressed vertically, entries truncated to 3).

### Implementation Notes

Use the same `ImageResponse` from `next/og` that the existing `/api/og/route.tsx` uses. The existing route already loads the Cormorant Garamond and Source Sans 3 fonts — reuse that font loading logic.

Edge runtime compatible — no Node.js APIs.

### Share Flow on `/today`

**New Component: `app/src/components/today/SheetShareButton.tsx`**

A share button that appears in the sheet header area (next to the date). When tapped:

1. **Encode the current sheet data** as base64:
   ```typescript
   const shareData: SheetShareData = {
     name: operatorName,
     date: formattedDate,
     season: getSeason(),
     dayCount,
     throughLine: sheet.throughLine,
     entries: sheet.entries.map(e => ({
       headline: e.headline,
       dimensions: e.dimensions,
       isChecked: checkedEntries.has(e.behavior_key),
     })),
   };
   const encoded = btoa(JSON.stringify(shareData));
   ```

2. **Generate the share URL**: `${window.location.origin}/api/og/sheet?data=${encoded}`

3. **Trigger native share** (or clipboard fallback):
   ```typescript
   if (navigator.share) {
     await navigator.share({
       title: `My HUMA sheet — ${formattedDate}`,
       text: sheet.throughLine,
       url: shareUrl,  // This URL serves the OG image
     });
   } else {
     await navigator.clipboard.writeText(shareUrl);
     showToast("Link copied");
   }
   ```

4. **Track the event**: `trackEvent("sheet_shared", { method: "native" | "clipboard", entry_count: entries.length })`

**Button design:**
- Icon: simple share arrow (use inline SVG, no icon library)
- Position: right side of the date header row
- Style: earth-400 color, 20px, no background, just the icon
- Touch target: 44×44px

### Sheet Detail Page (Optional Enhancement)

Create a minimal public page at `app/src/app/sheet/[encoded]/page.tsx` that:
1. Decodes the base64 sheet data from the URL
2. Renders the sheet as a beautiful read-only page (not the full `/today` UI)
3. Sets OG meta tags pointing to the `/api/og/sheet?data=...` image
4. Has a CTA at the bottom: "Make your own → huma-two.vercel.app"

This way, when someone shares a sheet link, the recipient sees:
- The OG image in the link preview (messaging apps, social media)
- A beautiful read-only sheet page if they click through
- A CTA to start their own

**This page is static** — no auth, no data fetching, no API calls. Just decode the URL and render.

## Files to Create/Modify

| File | Change |
|------|--------|
| `app/src/components/today/CompiledEntryRow.tsx` | Dimension tag colors |
| `app/src/app/today/page.tsx` | Through-line card, trigger label, date refinement, share button |
| `app/src/components/today/SheetShareButton.tsx` | **NEW** — Share button with encoding + native share |
| `app/src/app/api/og/sheet/route.tsx` | **NEW** — OG image generation for daily sheet |
| `app/src/app/sheet/[encoded]/page.tsx` | **NEW** — Public read-only sheet page |

## Design Constraints
- The share image must look like a **premium artifact**, not a screenshot of an app
- Use the exact design system colors — no approximations
- Cormorant Garamond for headlines, Source Sans 3 for everything else
- sand-50 background (never white)
- The image should work as: Instagram story, iMessage preview, Twitter card, WhatsApp preview
- No HUMA logo or branding beyond the wordmark and URL — let the content speak
- The sheet detail page should load instantly (no API calls, pure client rendering from URL data)

## Verification
- Compile a sheet on `/today` with at least 3 entries
- Check some entries off
- Tap the share button
- The native share sheet should appear (or clipboard copy on desktop)
- Open the shared URL in incognito — should see the OG image in the link preview
- Open the sheet detail page — should render the read-only sheet with CTA
- Test the OG image directly: visit `/api/og/sheet?data=...` — should return a 1080×1920 image
- Screenshot the `/today` page — the visual polish (through-line card, trigger label, dimension colors) should make it look noticeably more refined than before

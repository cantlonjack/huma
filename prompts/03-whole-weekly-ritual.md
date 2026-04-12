# Prompt 03: The Whole View Weekly Ritual — Sunday Review

## Objective
Give `/whole` a recurring use case by adding a weekly review ritual. Every Sunday evening (or operator-chosen day), HUMA surfaces one suggestion for the coming week based on the whole-life view: a dimension to attend to, a pattern to lean into, or a connection to explore. The graph becomes a workbench, not a museum.

## Why This Matters
`/today` has a daily cadence (check your sheet). `/grow` has a weekly cadence (watch patterns emerge). `/whole` currently has no verb — it's a display. People don't return to displays. They return to things that help them make decisions.

## Architecture

### Weekly Review Card

New component: `app/src/components/whole/WeeklyReviewCard.tsx`

This card appears at the top of the `/whole` brief view on the operator's review day. It contains:

1. **A one-sentence observation** about the past week (from behavior data + dimension movement)
2. **One suggestion** for the coming week — framed as a question, not a directive (per the ethical framework's dependency test)
3. **Two tappable responses**: "That feels right" (confirms) or "Not this week" (dismisses)

Example:
> **This week's picture**
> Your Body and Home dimensions both moved every day this week, but Joy hasn't moved since Tuesday.
> 
> **For next week:** What's one thing that could bring Joy back into the rhythm without adding to the list?
>
> [That feels right]  [Not this week]

### Data Flow

1. **Compute review data** — New function in `app/src/lib/weekly-review.ts`:
   - `computeWeeklyReview(behaviors: Behavior[], checkoffs: CheckoffRecord[], patterns: Pattern[], context: HumaContext): WeeklyReviewData`
   - Inputs: last 7 days of check-off data, active patterns, dimension movement from `capital-pulse.ts`
   - Logic:
     - Find the dimension(s) that moved most consistently
     - Find the dimension(s) that were dormant or declining
     - Find any pattern that hit a new validation milestone
     - Find any aspiration that had zero check-offs
   - Output: `{ observation: string, suggestion: string, dormantDimension?: string, activeDimension?: string, type: "dimension" | "pattern" | "aspiration" }`

2. **Generate the review text** — This CAN use Claude, but should be cheap:
   - New API route: `app/src/app/api/weekly-review/route.ts`
   - Model: **Haiku** (not Sonnet — this is a short, templated response)
   - Max tokens: 200
   - System prompt: Use the `WEEKLY_REVIEW_PROMPT` from `engine/operational-prompts.ts` (it already exists at ~1200 tokens) — adapt it to produce a 2-sentence observation + 1-sentence question
   - Input: the `WeeklyReviewData` computed client-side
   - Cache the result in localStorage by week key (`huma-v2-weekly-review-{yyyy-Www}`) so it's only generated once per week

3. **Surface the card** — In `useWhole.ts`:
   - Check if today is the review day (default: Sunday, stored in localStorage as `huma-v2-review-day`)
   - Check if a review has already been generated for this week
   - If not: compute review data → call API → cache result → show card
   - If dismissed ("Not this week"): hide until next week
   - If confirmed ("That feels right"): save to a `weekly_reviews` collection (localStorage + Supabase) for future reference

### Review Day Selection

In the `/whole` settings sheet (already exists via the gear icon):
- Add a "Review day" picker: Mon–Sun buttons, default Sunday
- Store in localStorage: `huma-v2-review-day`
- Simple, no API call needed

### Interaction on the Graph

When the weekly review card is showing AND the user is in map view:
- **Highlight the suggested dimension** on the force-directed graph — pulse the relevant dimension nodes with a subtle amber glow (the standard breathing animation: scale 1→1.03, 6-8s)
- **Dim unrelated nodes** to 0.4 opacity
- This creates a visual focus that makes the graph feel like a tool, not just a picture
- When the card is dismissed, remove the highlight

Implementation: In `WholeShape.tsx` (the D3 component), add a `highlightDimension?: string` prop. When set, apply the pulse animation to matching nodes and dim others.

### Push Notification Integration

Extend the existing morning-sheet cron at `app/src/app/api/cron/morning-sheet/route.ts`:
- On the user's review day, include the weekly review in the push notification
- Notification text: "Sunday review ready — your week had a shape. Come see it."
- Link to `/whole` instead of `/today`

Alternatively, create a separate cron route `app/src/app/api/cron/weekly-review/route.ts` that runs on Sunday evenings (6pm user local time, or just Sunday if timezone isn't available).

## Files to Create/Modify

| File | Change |
|------|--------|
| `app/src/lib/weekly-review.ts` | **NEW** — `computeWeeklyReview()` pure function |
| `app/src/app/api/weekly-review/route.ts` | **NEW** — Haiku-powered review text generation |
| `app/src/components/whole/WeeklyReviewCard.tsx` | **NEW** — Review card component |
| `app/src/hooks/useWhole.ts` | Add review day detection, review data fetching, card state |
| `app/src/app/whole/page.tsx` | Render `WeeklyReviewCard` at top of brief view |
| `app/src/components/whole/WholeShape.tsx` | Add `highlightDimension` prop for graph focus |
| `app/src/app/api/cron/morning-sheet/route.ts` | Add review-day notification variant |

## Design Constraints
- Card style: white fill, sand-300 border (standard card treatment), no shadow
- Headline: "This week's picture" — Cormorant Garamond, 17px
- Body: Source Sans 3, 15px, ink-700
- Buttons: amber-600 fill for primary ("That feels right"), sand-200 fill for secondary ("Not this week")
- Card should feel like a weekly letter, not a dashboard widget
- One question, per the one-question rule in the voice bible
- Suggestion must pass the dependency test: develop capacity, don't prescribe action

## Verification
- Set review day to today in settings
- Navigate to `/whole`
- The review card should appear at the top of brief view
- It should reference actual dimension data from the past week
- Tapping "That feels right" should save and hide the card
- Switching to map view should highlight the relevant dimension
- The card should not reappear until next week

# Prompt: Shorten the First Onboarding Chat

## Context
Users report the onboarding conversation takes 10+ minutes and still shows "getting started" on the progress indicator. The conversation is good — natural, logical questions — but it goes too long before users feel they've accomplished something. The progress bar was already replaced with "X of 7 profile sections" but the underlying conversation pacing hasn't changed.

The goal: get users to a meaningful first daily sheet within **3-5 minutes** of conversation (roughly 4-6 exchanges), not 10+.

## Current Flow
1. Archetype selection screen (or "Skip — just talk")
2. OPEN MODE conversation — builds context model across 9 dimensions
3. Eventually transitions to FOCUS MODE when an aspiration surfaces
4. Decomposition into behaviors → redirects to /today

The bottleneck is step 2. OPEN MODE has no exit condition — it just keeps exploring dimensions until the user naturally says something aspiration-like. The prompt says "follow the user's lead" which is great for depth but terrible for time-to-value.

## Key Files
- `app/src/lib/services/prompt-builder.ts` — OPEN_MODE_PROMPT, FOCUS_MODE_PROMPT, DECOMPOSITION_PHASE_PROMPT, mode detection logic, `buildSystemPrompt()`
- `app/src/hooks/useStart.ts` — conversation state machine, mode transitions, message handling
- `app/src/app/api/v2-chat/route.ts` — streaming endpoint, mode routing
- `app/src/app/start/page.tsx` — UI, progress display, profile panel

## Implementation Plan

### 1. Add a "Quick Start" mode to the prompt system

In `prompt-builder.ts`, add a new `QUICK_START_PROMPT` that replaces OPEN_MODE for the first conversation. This mode is opinionated about pacing:

```
You are in QUICK START MODE. You have 4-6 exchanges to build enough context
for a useful first daily sheet. Every message must extract context AND move
toward an actionable aspiration.

EXCHANGE MAP (target, not rigid):
1. Opening — "What's going on in your life right now?" 
   Listen for: work, family, location, immediate stressors.
   Extract everything you can from their first message — people, place, work, stage.

2. Follow the thread — pick up on whatever they mentioned.
   Go deeper on the thing THEY brought up. Don't redirect yet.
   Extract: specific details (names, numbers, constraints).

3. Reflect + pivot — mirror what you heard, then ask about one sparse area
   that would change what a good day looks like for them.
   "So you're [X] in [Y] with [Z] going on. What does a normal Tuesday look like?"
   Extract: time, body, routine details.

4. Surface the aspiration — by now you know enough to name what they're working on.
   "Sounds like the thing that would actually move the needle is [X]. Want me to
   turn that into something you can act on this week?"
   If they say yes → transition to FOCUS MODE (brief, 1-2 questions max since 
   you already have context) → DECOMPOSITION.
   If they want to keep talking → stay in OPEN MODE (standard prompt).

CRITICAL RULES:
- Extract context from EVERY message. Don't wait for "enough" — extract what you have.
- After exchange 3, ALWAYS look for the aspiration opening. Don't keep exploring.
- The first sheet doesn't need to be perfect. It needs to be specific enough
  that checking things off tomorrow morning feels real.
- If the user gives you a LOT in their first message, you can compress exchanges
  2-3 into one and get to the aspiration offer faster.
- You can still extract context DURING focus mode and decomposition. The context
  model keeps building — this isn't the only conversation they'll ever have.
```

### 2. Track exchange count in useStart

In `useStart.ts`, add an `exchangeCount` to the conversation state. Increment on each user message. Pass this to the API so the prompt builder knows where we are:

```ts
// In the request body to /api/v2-chat:
body: JSON.stringify({
  ...existing,
  exchangeCount,
  isFirstConversation: !hasExistingContext,
})
```

### 3. Update mode detection in prompt-builder.ts

In `buildSystemPrompt()`, use QUICK_START_PROMPT instead of OPEN_MODE_PROMPT when:
- `isFirstConversation` is true (no prior context)  
- Current mode is "open"
- This allows returning users to get the full exploratory OPEN_MODE

Also update the context completeness hint to reference the 7 profile sections:
```
"You've filled 2 of 7 profile sections. Sparse: where you are, how you're built, what you have, what feeds you, where you're headed."
```
(This already exists via `completenessHint()` — just make sure it's included in QUICK_START mode.)

### 4. Add "ready to plan" affordance in the UI

After 3+ exchanges in QUICK_START, if the profile has 2+ sections filled, show a subtle prompt below the input on `/start`:

```tsx
{exchangeCount >= 3 && completeness.filled >= 2 && (
  <button 
    onClick={() => sendMessage("Let's make a plan for this week")}
    className="font-sans text-xs text-sage-500 hover:text-sage-600 mt-2"
  >
    Ready to build your first day? →
  </button>
)}
```

This gives users an escape hatch if the conversation is going well but they want to move on.

### 5. Shorten Focus Mode for Quick Start context

When transitioning from QUICK_START → FOCUS_MODE, append to the focus prompt:
```
You already gathered significant context during Quick Start. Do NOT re-ask
questions you already have answers to. If context is sufficient to decompose,
reflect back in 1 message and decompose. Target: 1-2 exchanges in Focus Mode,
not 4-6.
```

### 6. Progress indicator update

The progress display on `/start` currently shows "X of 7 sections." Add a second line when sections are filling:

```tsx
{completeness.filled >= 2 && (
  <span className="text-sage-500">Almost ready for your first sheet</span>
)}
```

### Files to modify
- `app/src/lib/services/prompt-builder.ts` — QUICK_START_PROMPT, mode detection logic
- `app/src/hooks/useStart.ts` — exchangeCount tracking, pass to API
- `app/src/app/api/v2-chat/route.ts` — accept exchangeCount, route to quick start prompt
- `app/src/app/start/page.tsx` — "Ready to build your first day?" affordance, progress text

### What NOT to change
- Don't touch OPEN_MODE_PROMPT — it's still the right mode for returning users and ongoing conversations
- Don't remove the archetype selection screen — it's optional ("Skip — just talk") and gives useful signal
- Don't remove PalettePanel — suggestions are still useful during Quick Start
- Don't force decomposition — if the user wants to keep talking, let them switch to full OPEN_MODE

### Testing
- Fresh user (clear localStorage) → conversation should reach aspiration offer within 4-6 exchanges
- Profile panel should show sections filling in real-time during Quick Start
- "Ready to build your first day?" button appears after 3+ exchanges with 2+ sections
- Clicking it sends a message that triggers Focus → Decomposition flow
- Returning user with existing context → gets normal OPEN_MODE, not Quick Start
- User who says "not yet" at aspiration offer → switches to full OPEN_MODE gracefully

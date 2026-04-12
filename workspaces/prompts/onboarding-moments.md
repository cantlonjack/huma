# Session Brief: Onboarding Conversation Moments

## The Problem

HUMA's onboarding is a conversation — the entire first impression. But the conversation UI looks like every AI chatbot: white bubbles for HUMA, sand bubbles for the user, options as button rows. For a product whose differentiator IS the conversation, this is a missed opportunity.

The critical moment — when HUMA extracts context from what you said and "understands" something about your life — is currently a small text flash in the header area: "HUMA now knows: home, body, people." It fades after 4 seconds. This should feel like a light turning on, not a notification dismissing.

## What Exists Today

### File Paths
- **Start page:** `app/src/app/start/page.tsx`
- **useStart hook:** `app/src/hooks/useStart.ts`
- **Message bubble:** `app/src/components/onboarding/MessageBubble.tsx`
- **Decomposition preview:** `app/src/components/onboarding/DecompositionPreview.tsx`
- **Prompt builder:** `app/src/lib/services/prompt-builder.ts`
- **Markers parser:** `app/src/lib/parse-markers-v2.ts`
- **Connection visual primitive:** `app/src/components/shared/ConnectionThreads.tsx` (new — read this first, it's the visual language for connections)

### Current Conversation UI
- User messages: sand-100 background, right-aligned, sans-serif
- HUMA messages: white background, left-aligned, serif font
- Options render as tappable button pills (sand-50 bg, sage hover)
- Thread collapses to last 4 messages, expandable "N earlier messages" pill
- Auto-scrolls to bottom on new messages

### Current Context Extraction Feedback
- Header flash: "HUMA now knows: home, body, people" (natural section names)
- Fades in with 300ms animation, clears after 4 seconds
- Mini-bar on mobile shows completeness as "X of Y sections"
- Pulsing dot when profile updates

### Desktop Layout
- 60/40 split: conversation left, right panel has "Suggestions" and "Your Profile" tabs
- Profile tab shows LifeProfile component filling as context is extracted
- Auto-switches to Profile tab when 2+ sections have content

### Streaming Markers
The key marker for this work is `[[CONTEXT:{...}]]` — emitted when HUMA extracts new understanding from what the user said. Currently triggers the text flash. Other markers (OPTIONS, BEHAVIORS, DECOMPOSITION, ASPIRATION_NAME) are handled separately and are out of scope for this session.

### Conversation Phases
1. **Archetype selection** (step 0) — domain/orientation picker
2. **Open mode** — natural conversation, follow user's lead
3. **Focus mode** — gather specifics for a stated aspiration
4. **Decomposition** — output structured behaviors for first week

## What This Session Should Produce

### 1. The Understanding Moment
When `[[CONTEXT:{...}]]` is parsed and new dimensions are extracted, the UI should create a memorable moment — not a text flash. Design and build a new interaction that:

- Makes the user feel *seen* — HUMA just understood something about their life
- Shows WHICH dimensions were touched (using dimension colors)
- Integrates the ConnectionThreads visual primitive (already built in `app/src/components/shared/ConnectionThreads.tsx`) — as dimensions accumulate, the user should see connections forming
- Feels distinct from generic AI chat feedback
- Scales from the first extraction (1-2 dimensions) to later ones (6-7 dimensions filled)
- Respects `prefers-reduced-motion` via `useReducedMotion` hook

Consider: a brief expansion between messages where the connection threads ring appears/updates with newly lit dimensions, then gracefully contracts. Or a persistent but evolving element in the conversation flow that grows as HUMA learns more. The moment should last long enough to register (not 300ms) but not block the conversation.

### 2. Conversation Thread Refinement
The message bubbles themselves don't need to change radically — the chat pattern is familiar and that's fine. But small refinements to make it feel less generic:

- Consider whether HUMA messages need a different visual treatment than standard chat bubbles (they're the "letter" voice, not a chat reply)
- The option buttons are functional but could feel more intentional
- The thread collapse ("N earlier messages") is good UX — keep it

### 3. Profile Building Visibility
The right panel on desktop (LifeProfile in "filling" mode) is hidden on mobile behind a mini-bar toggle. The user should have some ambient awareness that their life profile is building, without needing to toggle a drawer. This ties into the Understanding Moment — as dimensions fill, the user should see their profile taking shape.

## What NOT to Do
- Don't change the conversation logic, phases, or prompt builder
- Don't modify the markers parser — only change how the UI responds to parsed context
- Don't redesign the decomposition preview (behaviors/checkboxes) — that's functional
- Don't change the archetype selection screen
- Don't touch the data layer, API routes, or streaming infrastructure
- Don't add dark mode

## Design Constraints
Read `workspaces/design.md` for full specs. Key constraints:
- Backgrounds: sand-50 (never white except card fills)
- Action color: amber-600 only for clickable elements
- Fonts: Cormorant Garamond (headings) / Source Sans 3 (UI/body)
- Animation: ONE easing — `cubic-bezier(0.22, 1, 0.36, 1)`. Nothing bouncy.
- Respect `prefers-reduced-motion`
- Touch targets: 44x44px minimum

## The Bar
The user described the current state: "The moment HUMA understands something about you should feel like a light turning on, not a notification dismissing." The onboarding conversation is HUMA's handshake — the first 5 minutes. It should feel like talking to someone who is visibly, beautifully paying attention.

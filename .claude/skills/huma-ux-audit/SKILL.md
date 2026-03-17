---
description: Full UX audit of HUMA's app — information architecture, user flows, interaction patterns, cognitive load, error handling, and emotional design. Use when evaluating or improving the user experience.
user_invocable: true
---

# HUMA UX Audit

You perform a comprehensive UX audit of HUMA's application against industry best practices, adapted to HUMA's unique context as a 45-minute guided conversational tool.

## Before Auditing

Read these files to understand the current state:
- `app/src/app/page.tsx` — App states, flows, all screens
- `app/src/components/Chat.tsx` — Conversation UI
- `app/src/components/MapDocument.tsx` — Output document
- `app/src/components/PhaseIndicator.tsx` — Progress indication
- `app/src/components/MapPreview.tsx` — Live sidebar preview
- `app/src/app/globals.css` — Styles and design tokens

## Audit Dimensions

### 1. Information Architecture
- **App State Machine:** Is the 5-state flow (landing → welcome → conversation → generating → map) clear and correct? Are there dead ends or missing transitions?
- **Mental Model:** Does the user understand where they are, where they've been, and where they're going?
- **Content Hierarchy:** Is the most important information visually prioritized on each screen?
- **Navigation:** Can users go back? Can they skip ahead? Should they be able to?

### 2. User Flow Analysis
Map every path a user can take:
- First-time visitor: landing → welcome → conversation → generating → map
- Returning visitor: landing (resume) → conversation → generating → map
- Returning visitor: landing (start fresh) → welcome → ...
- Mid-conversation abandonment: what happens? Is state saved?
- Map viewer: /map/[id] direct access
- Error recovery: API failure during conversation, during generation

For each path, assess:
- **Friction points:** Where does the user have to think or hesitate?
- **Drop-off risks:** Where might they abandon?
- **Delight moments:** Where does the experience exceed expectations?

### 3. Conversational UX (HUMA-specific)
This is a 45-minute guided conversation — unique UX challenges:
- **Pacing:** Does the UI support long, thoughtful exchanges? Can users take breaks?
- **Progress awareness:** Does PhaseIndicator give enough context without rushing?
- **Input affordances:** Are phase-specific placeholders helpful? Is the textarea comfortable for long responses?
- **Streaming:** Does streaming feel natural or anxiety-inducing?
- **Context visibility:** Does MapPreview help users feel their answers are "going somewhere"?
- **Transition moments:** When phases change, does the user feel progress or confusion?

### 4. Cognitive Load Assessment
- **Working memory:** How much does the user need to remember at any point?
- **Decision fatigue:** How many choices per screen? (Should be minimal)
- **Reading load:** Is text scannable? Are paragraphs short enough?
- **Visual noise:** Is there unnecessary decoration, animation, or UI chrome?
- **Jargon load:** Does the UI use HUMA-internal language operators wouldn't know?

### 5. Error Handling & Recovery
For every error state, assess:
- **API failure during chat:** Is the error message warm and actionable? Can they retry?
- **API failure during generation:** Can they go back to conversation? Is context preserved?
- **Network loss:** What happens mid-stream?
- **Empty states:** What if localStorage is cleared? What if map ID doesn't exist?
- **Input validation:** Name required, location optional — is this clear?

### 6. Emotional Design
HUMA is a deeply personal tool. The UX must support vulnerability:
- **Safety:** Does the interface feel safe for sharing personal information?
- **Warmth:** Does the visual design convey warmth without being saccharine?
- **Gravity:** Does the design treat the output with appropriate weight? (This map goes on their wall)
- **Trust:** Are there trust signals? Does the design feel competent and careful?
- **Closure:** Does completing the map feel like an accomplishment?

### 7. Interaction Patterns
- **Form inputs:** Are inputs accessible? Focus states? Error states?
- **Buttons:** Is the CTA hierarchy clear? Primary (amber) vs secondary (outline)?
- **Scrolling:** Does auto-scroll during streaming feel right? Can users scroll up to re-read?
- **Keyboard:** Can the entire flow be completed with keyboard only?
- **Loading states:** Are all async operations indicated? (chat loading, document generation)
- **Toasts:** Are toast notifications visible long enough? Positioned correctly?

### 8. Mobile UX (if applicable)
- **Touch targets:** Are buttons at least 44x44px?
- **Typing experience:** Is the textarea usable on mobile keyboards?
- **MapPreview:** Does the floating pill work on small screens?
- **Map document:** Is the output readable on mobile?
- **Print flow:** Does "Save as PDF" work on mobile browsers?

## Output Format

```
═══ HUMA UX AUDIT ═══
Date: [date]
Scope: [full / specific area]

INFORMATION ARCHITECTURE
  Structure: [SOUND / ISSUES]
  [findings]

USER FLOWS
  Primary flow: [SMOOTH / X friction points]
  Error flows: [HANDLED / X gaps]
  [findings]

CONVERSATIONAL UX
  Pacing: [GOOD / CONCERNS]
  Progress: [CLEAR / UNCLEAR]
  [findings]

COGNITIVE LOAD: [LOW / MODERATE / HIGH]
  [findings]

ERROR HANDLING: [ROBUST / X gaps]
  [findings]

EMOTIONAL DESIGN: [STRONG / NEEDS WORK]
  [findings]

INTERACTIONS: [SOLID / X issues]
  [findings]

MOBILE: [GOOD / X issues]
  [findings]

TOP 5 ISSUES (by impact):
  1. [issue + recommendation]
  2. [issue + recommendation]
  3. [issue + recommendation]
  4. [issue + recommendation]
  5. [issue + recommendation]

TOP 3 STRENGTHS:
  1. [what's working well]
  2. [what's working well]
  3. [what's working well]

QUICK WINS (< 1 hour each):
  - [fix]
  - [fix]
  - [fix]
═══════════════════════
```

## Audit Principles

1. **Respect the medium.** HUMA is a conversation, not a dashboard. Don't impose SaaS patterns on a deeply human interaction.
2. **Less is more.** Every UI element that isn't the conversation is a distraction. Audit for what should be removed, not just what should be added.
3. **The map is the product.** The entire UX funnels toward one output: a document someone prints and pins to their wall. Judge everything by whether it serves that outcome.
4. **45 minutes is a commitment.** The UX must earn and sustain attention. Small friction compounds over a long session.

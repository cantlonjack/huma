# HUMA Build Roadmap

_Created: 2026-04-02. Living document — update after each session._
_Design source of truth: `docs/references/huma-blueprint-v3.html`_

---

## Where We Are

**13 sessions in. 52 commits. Core loop works — but the UI doesn't match the blueprint.**

The conversation engine gathers context, decomposes aspirations into phased behaviors, and compiles a daily production sheet. Auth, data persistence, and the holonic visualization all work. Zero type errors, clean production build.

**The gap:** Blueprint v3 defines a significantly more evolved UI for all three tabs. What's built is functional but doesn't yet deliver the blueprint's vision for how operators interact with their system.

### Blueprint v3 vs Current Build

| Screen | Blueprint Vision | Current State | Gap |
|--------|-----------------|---------------|-----|
| **Today** | Pattern Route Cards with Golden Pathway, trigger as "THE DECISION" with gold badge, time windows, validation bars, reroute cards, standalone behaviors | Flat checkbox list with dimension dots + streaks | **Major redesign** |
| **Whole** | Single organic holonic form — Foundation at bottom, Patterns at top, Principles/Vision between, Identity at center. One membrane. | Force-directed D3 network of aspiration nodes | **Different shape concept** |
| **Grow** | Context Gaps (auto-detected tiles), Suggested Patterns (match%, stick rate), In Progress, Principles Workshop, Past Conversations | Placeholder stub | **Not built** |
| **Chat** | Context-aware prompts per entry point (bubble/gap/reroute/pattern/narrowing), inline interactive elements | Generic chat with fixed placeholder | **Needs context awareness** |
| **Navigation** | 6 defined flows (Daily, Insight, Growing, Editing, Rerouting, Chat-from-anywhere) with cross-screen triggers | Tab nav + chat bubble | **Flows not wired** |

### What's Solid (Keep)
- Conversation engine (`/api/v2-chat`) — adaptive context gathering, phased decomposition
- Data layer — Supabase tables, localStorage migration, behavior logging
- Auth — magic link flow works
- Sheet compilation (`/api/sheet`) — Claude generates daily entries
- Insight computation (`/api/insight`) — infrastructure ready
- Archetype + WHY generation (`/api/whole-compute`)

---

## Principles for the Build

1. **Blueprint v3 is the design spec.** Every UI session references it. Don't invent new patterns — implement what's drawn.

2. **One session, one deliverable.** Each session produces something demonstrable. No multi-session features without intermediate checkpoints.

3. **Data before UI.** Get the data model and API right first, then build the UI on top. Today's Pattern Route Cards need pattern data to exist before the cards can render.

4. **Ship the core loop tight before expanding.** Today tab → Insight engine → Whole tab → Grow tab. That's the priority order because that's the operator's frequency of use (80% / 10% / 10%).

5. **Context handoff is sacred.** Every session ends with a commit. Current state lives in `workspaces/code.md`.

---

## Phase Map

```
Phase 1: Foundation + Data Layer    (Sessions 14-16)  ← YOU ARE HERE
Phase 2: Today Tab Redesign         (Sessions 17-19)
Phase 3: Insight Engine + Delivery   (Sessions 20-22)
Phase 4: Whole Tab Redesign          (Sessions 23-25)
Phase 5: Grow Tab Build              (Sessions 26-28)
Phase 6: Chat + Navigation Flows     (Sessions 29-31)
Phase 7: Distribution + Polish       (Sessions 32-34)
Phase 8: Scale Readiness             (Sessions 35-37)
```

Each phase is 3 sessions. Each session is a single focused work block. Phases can shift based on what we learn — this is a map, not a contract.

---

## Phase 1: Foundation + Data Layer

_Goal: Make the data layer trustworthy and introduce the "pattern" concept that the blueprint requires._

### Session 14 — Database Migration + Pattern Data Model

The blueprint introduces "patterns" as a first-class concept (Pattern Route Cards on Today, Suggested Patterns on Grow, pattern validation on Whole). Currently, HUMA has "aspirations" with "behaviors" but no "pattern" entity. This session bridges that gap.

**Design:**
- A **pattern** is a validated sequence of behaviors with a trigger, a golden pathway (ordered steps), a time window, and a validation metric
- Patterns emerge from aspirations: an aspiration decomposes into behaviors, and when those behaviors have a trigger + sequence + window, they form a pattern
- The blueprint's "standalone behaviors" are pre-pattern — behaviors not yet part of a pattern

**Implementation:**
- [ ] Run pending `009_aspiration_phases.sql` migration in Supabase _(must be run manually in Supabase dashboard)_
- [x] Update `saveAspiration()` to persist `title`, `summary`, `comingUp`, `longerArc` _(already done in Session 13)_
- [x] Define `Pattern` type in `types/v2.ts`
- [x] Define `PatternStep` type: `{ behaviorKey, text, order, isTrigger }`
- [x] Create `patterns` Supabase table (`010_patterns.sql` — separate table, not extending aspirations)
- [x] Add pattern extraction logic: `lib/pattern-extraction.ts` — auto-creates pattern when decomposition has `is_trigger: true`
- [x] Verify localStorage → Supabase migration with new fields _(pattern migration added as step 4)_
- [x] Clean up `/system` route: removed page + ConversationSheet component, chat "see all" now links to `/whole`

**Deliverable:** Pattern data model exists. Decompositions automatically produce patterns. All aspiration data persists through auth.

**Context marker:** After this session, the data layer supports the blueprint's pattern concept.

---

### Session 15 — Error States + Loading UX

**Design:**
- Map every user-facing loading state (sheet compilation, conversation streaming, whole-compute)
- Design skeleton screens that match the blueprint layouts (not spinners)
- Error states follow voice rules (no "Oops!" — direct, warm, specific)
- Handle offline/network failure gracefully

**Implementation:**
- [ ] Skeleton loader for Today tab (matches Pattern Route Card layout from blueprint)
- [ ] Skeleton loader for Whole tab (matches organic shape area)
- [ ] Streaming error recovery in chat (retry with backoff, not silent failure)
- [ ] API error responses follow consistent shape (`{ error: string, code: string }`)
- [ ] Empty states for `/today` (no patterns yet → "Start with what's on your mind" CTA to chat) and `/whole` (no data)
- [ ] Network failure detection + subtle offline indicator

**Deliverable:** Every loading and error state has a designed response. No blank screens, no silent failures.

---

### Session 16 — Mobile Audit + Chat Context Awareness

**Design:**
- Walk every route on 375px (iPhone SE) and 390px (iPhone 14)
- Audit touch targets (min 44px), scroll behavior, keyboard handling
- Begin implementing blueprint's context-aware chat prompts

**Implementation:**
- [ ] Fix any overflow issues on `/start` conversation view
- [ ] Bottom nav safe area padding for notched devices
- [ ] Chat overlay placeholder changes per entry point:
  - Default (bubble tap): "What's going on?"
  - From gap tile (future): "Tell me about [dimension]"
  - From reroute (future): "[Pattern] stalled — adjust?"
- [ ] Store chat entry context in state so the overlay knows where it was opened from
- [ ] Test magic link auth flow on mobile Safari and Chrome
- [ ] Ensure DecompositionPreview scrollable on small screens

**Deliverable:** Mobile works cleanly. Chat overlay has context-aware prompt infrastructure (even if not all entry points exist yet).

**Phase 1 exit criteria:** Data layer is trustworthy, patterns exist as a concept, errors are handled, mobile works, chat overlay is context-aware.

---

## Phase 2: Today Tab Redesign

_Goal: Transform `/today` from a flat checkbox list into the blueprint's Pattern Route Card + Golden Pathway design._

**Blueprint reference (Today):**
- Status Line: date in display font, route status ("On route · 2 patterns active")
- Pattern Route Cards (one per active pattern): header (name + icon + time), Golden Pathway (vertical steps on gold line, trigger has gold bg + "THE DECISION" badge, done = sage + strikethrough, upcoming = hollow), window + validation ("5:15-5:45 · 26/30 · working")
- Standalone Behaviors: pre-pattern items with checkbox + dimension dots
- Reroute card (conditional): when pattern stalls, italic why + "Reroute" CTA
- Insight card (conditional, max 1/week): gradient top, Cormorant text, "See full pattern" link

### Session 17 — Status Line + Pattern Route Card Component

**Implementation:**
- [ ] Status Line component: date in Cormorant Garamond, route status computed from pattern data
- [ ] PatternRouteCard component shell: header with pattern name + estimated time
- [ ] GoldenPathway component: vertical gold line with behavior steps
  - Trigger step: gold background + "THE DECISION" badge
  - Completed: sage background + strikethrough
  - Upcoming: hollow circle + normal text
- [ ] Each step tappable to check off (uses existing `/api/sheet/check`)
- [ ] Wire to real pattern data from Session 14's model

**Deliverable:** Pattern Route Card renders with Golden Pathway. Trigger is visually distinct. Check-offs work.

---

### Session 18 — Validation, Time Windows, Standalone Behaviors

**Implementation:**
- [ ] Time window display on Pattern Route Card ("5:15-5:45 · After 6:00 breaks chain")
- [ ] Validation progress bar ("26/30 · working" or "12/30 · finding")
- [ ] Standalone Behaviors section below pattern cards (pre-pattern items)
  - Checkbox + text + dimension dots
  - Visually distinct from pattern steps (they're seeds, not routes)
- [ ] Compute validation counts from `behavior_log` (last 30 days)
- [ ] Pattern status derived from validation: finding (<50%), working (50-90%), validated (>90%)

**Deliverable:** Today tab shows pattern cards with validation + time windows, plus standalone behaviors below.

---

### Session 19 — Reroute Card + Today Polish

**Implementation:**
- [ ] Reroute card component (conditional — appears when pattern hasn't been touched in 3+ days)
  - Italic explanation of what stalled
  - "Reroute" button opens chat overlay with context: "[Pattern name] stalled — adjust?"
- [ ] Insight card slot (placeholder for Phase 3 — reserve the visual space)
- [ ] Today tab responsive audit at 375px
- [ ] Animation: cards enter with design system easing (`cubic-bezier(0.22, 1, 0.36, 1)`)
- [ ] Empty state: no patterns → warm CTA to start a conversation
- [ ] Pull-to-refresh to recompile sheet

**Deliverable:** Today tab matches blueprint v3. Pattern Route Cards, Golden Pathway, reroute, standalone behaviors all working.

**Phase 2 exit criteria:** `/today` implements the blueprint's design. Operators see Pattern Route Cards with Golden Pathways, not flat checkboxes.

---

## Phase 3: Insight Engine + Delivery

_Goal: Make insights work with real data and deliver them in the blueprint's design._

### Session 20 — Insight Engine: Seed Data + Computation

**Implementation:**
- [ ] Build seed script: test user with 2-3 patterns, 14 days of check-off history
- [ ] Run `/api/insight` against seed data — verify meaningful cross-dimensional correlations
- [ ] Tune insight prompt (add examples of good vs bad: specific > generic, surprising > obvious)
- [ ] Test structural insight (Day 1, from decomposition) vs behavioral insight (Day 7+, from data)
- [ ] Verify `computeStructuralInsight()` finds most-connected behavior correctly
- [ ] Define insight quality bar: must name specific behaviors + specific dimensions + a connection the operator didn't see

**Deliverable:** Insight engine produces real, specific, cross-dimensional insights. At least 3 examples documented.

---

### Session 21 — Insight Card Design + Delivery

**Blueprint reference:** Insight card has gradient top, Cormorant serif text, "See full pattern" link to Whole. Max 1 per week. Conditional — only shows when there's something worth saying.

**Implementation:**
- [ ] Insight card component matching blueprint: gradient top border, Cormorant text, dismiss gesture
- [ ] Place on Today tab (below patterns, above standalone behaviors)
- [ ] "See full pattern" link navigates to Whole tab with relevant region highlighted
- [ ] Mark-as-delivered logic — same insight doesn't repeat
- [ ] Structural insight generated on first decomposition (Day 1)
- [ ] Behavioral insight computation triggered after 7+ days of data
- [ ] Max 1 insight visible per week (even if multiple computed)

**Deliverable:** Insights appear on Today tab with blueprint styling. Lifecycle: compute → deliver → dismiss → archive.

---

### Session 22 — Sheet Intelligence + "HUMA Sees" on Whole

**Implementation:**
- [ ] Sheet compilation prompt gets last 7 days of check-off history
- [ ] Behaviors not done in 3+ days get priority
- [ ] Day-of-week awareness (different sheets for Mon vs Sat)
- [ ] "HUMA Sees" component on Whole tab (blueprint: one structural observation, rare, italicized)
  - "Your market runs your weekend."
  - Computed from pattern data — which behavior has highest cross-dimensional impact
- [ ] Test: Day 1 sheet vs Day 14 sheet — outputs should visibly differ

**Deliverable:** Production sheet gets smarter over time. "HUMA Sees" appears on Whole tab when there's a structural observation worth making.

**Phase 3 exit criteria:** Insights compute, deliver correctly, and the sheet adapts to behavior history.

---

## Phase 4: Whole Tab Redesign

_Goal: Transform `/whole` from a force-directed network into the blueprint's single organic holonic form._

**Blueprint reference (Whole):**
- Profile Banner: name in display font, archetype in sage, WHY in italic. Tappable to edit.
- The Shape: single organic membrane. Gravity — Foundation dense at bottom, Patterns float at top, Principles/Vision between, Identity at center. NOT four bands. One living form. All regions tappable.
- Expand Panel: tapping any region slides in a panel showing contents. Edit, toggle, add, remove. One at a time.
- "HUMA Sees": one structural observation (conditional, rare)

### Session 23 — The Shape: Organic Holonic Form

**Design decision:** Replace force-directed D3 network with a single organic membrane SVG. The shape has internal gravity — dense regions at bottom (Foundation: people, place, work, time), lighter regions floating up (Patterns). This is a fundamentally different visualization from what exists.

**Implementation:**
- [ ] Design the organic membrane SVG (single blobby boundary, not a circle)
- [ ] Internal zones: Foundation (bottom, dense), Principles (lower-mid), Vision (upper-mid), Patterns (top, floating)
- [ ] Identity at center
- [ ] Each zone's visual density reflects data (more behaviors = denser dots/marks)
- [ ] Pattern nodes: solid = validated, dashed = finding
- [ ] Foundation nodes: people, place, work, time — derived from context data
- [ ] The membrane shape itself morphs based on what's populated (not static)
- [ ] Smooth animation on data changes

**Deliverable:** The Shape renders as a single organic form with internal gravity. Replaces the force-directed network.

---

### Session 24 — Expand Panels + Editing

**Implementation:**
- [ ] Tapping any region of the Shape opens an Expand Panel (slides up from bottom)
- [ ] Panel shows contents of that region (e.g., tap Patterns → see all patterns with status)
- [ ] Edit mode within panel: toggle behaviors on/off, add/remove, rename
- [ ] Only one panel open at a time — close current to open another
- [ ] Panel close restores full Shape view
- [ ] Profile Banner: name + archetype + WHY, all tappable to edit (reuse existing components)
- [ ] Archetype Selector accessible from Profile Banner

**Deliverable:** Whole tab is interactive. Tap any region → see and edit contents. Full CRUD on patterns, behaviors, principles.

---

### Session 25 — Whole Tab Polish + Cross-Screen Links

**Implementation:**
- [ ] "HUMA Sees" card (from Session 22) positioned correctly on Whole
- [ ] Responsive audit: shape scales cleanly on mobile
- [ ] Cross-screen triggers (from blueprint):
  - Today → Whole: "See full pattern" on insight card, tap pattern name
  - Whole → Today: tap a working pattern → jumps to its route on Today
  - Whole → Grow: tap empty holon region, tap aspiration with no pattern
- [ ] Animation: Shape breathes subtly (design system easing, not bouncy)
- [ ] Touch feedback on region tap (subtle highlight before panel opens)

**Deliverable:** Whole tab matches blueprint v3. Single organic form, expand panels, cross-screen navigation wired.

**Phase 4 exit criteria:** `/whole` shows the blueprint's organic holonic form, not a force-directed network. Expand panels work. Cross-screen links work.

---

## Phase 5: Grow Tab Build

_Goal: Build `/grow` from scratch following the blueprint spec._

**Blueprint reference (Grow):**
- Context Gaps: auto-detected undeveloped areas, each a tappable tile → opens chat with pre-filled prompt
- Suggested Patterns: from RPPL commons, matched to context. Name, match%, stick rate, time, dimensions. Tap → chat starts narrowing.
- In Progress: aspirations mid-narrowing. "Continue" resumes in chat overlay.
- Principles Workshop: principles emerging from behavior data. "You cook 4/5 weeknights — formalize?"
- Past Conversations: collapsed by week. Date + summary + outcome.

### Session 26 — Context Gaps + Suggested Patterns

**Implementation:**
- [ ] Context gap detection: scan operator's dimensions — which have no behaviors/patterns?
- [ ] Gap tile component: dimension icon + name + gap type ("Foundation gap", "3 prerequisites", "Stalled · reroute?")
- [ ] Tapping gap tile → opens chat overlay with pre-filled prompt: "Tell me about your [dimension]"
- [ ] Suggested Patterns section: pull from `decomposition-templates.ts` + future RPPL commons
- [ ] Pattern suggestion tile: name, match% (computed from context overlap), stick rate (from population data, placeholder for now), estimated time, dimensions touched
- [ ] Tapping suggestion → opens chat overlay to start narrowing conversation
- [ ] "Browse all" tile → scrollable gallery of all available patterns

**Deliverable:** Grow tab shows context gaps and suggested patterns. Both funnel into chat overlay.

---

### Session 27 — In Progress + Principles Workshop

**Implementation:**
- [ ] In Progress section: aspirations that started narrowing but didn't finish
  - Shows: pattern name, match%, questions remaining, "Continue" button
  - Continue → reopens chat overlay mid-conversation
- [ ] Track narrowing state: store incomplete conversations with progress markers
- [ ] Principles Workshop section:
  - Auto-detected principles from behavior patterns ("You cook 4/5 weeknights")
  - Three sources: "From your data" / "From commons" / "Write your own"
  - Tap to adopt → saves to `principles` table
  - Tap to customize → opens chat for refinement
- [ ] Principle detection logic: find behaviors with >80% completion rate over 2+ weeks

**Deliverable:** In Progress tracks incomplete narrowing. Principles Workshop surfaces emerging principles from data.

---

### Session 28 — Past Conversations + Grow Polish

**Implementation:**
- [ ] Past Conversations section (bottom of Grow):
  - Grouped by week
  - Each: date + summary + outcome ("pattern selected" / "context added" / "validated")
  - Collapsed by default, tap to expand
  - Summary auto-generated from chat_messages (extract aspiration name + result)
- [ ] Cross-screen triggers (from blueprint):
  - Grow → Today: pattern selected → appears on Today next morning
  - Grow → Whole: principle added → appears in Principles region, context gap filled → Foundation updates
- [ ] Responsive audit at 375px
- [ ] Update bottom nav: Grow tab is now active (remove placeholder)
- [ ] Empty state for new operators: "Your patterns will appear here as you build them"

**Deliverable:** Grow tab matches blueprint v3. All five sections working. Cross-screen navigation wired.

**Phase 5 exit criteria:** `/grow` implements the full blueprint spec. Context gaps, suggested patterns, in progress, principles workshop, past conversations all working.

---

## Phase 6: Chat + Navigation Flows

_Goal: Implement the blueprint's 6 navigation flows and make the chat overlay fully context-aware._

### Session 29 — Context-Aware Chat Overlay

**Blueprint reference (Chat):**
- Context Banner: shape mini + name + route count. Draggable to resize.
- Context-Aware Prompt changes per entry point
- Messages: HUMA in Cormorant serif, Operator in Source Sans bubbles
- Inline interactive: landscape tiles, pills, pattern cards within message flow

**Implementation:**
- [ ] Context Banner at top of chat overlay: mini shape silhouette + operator name + "N routes active"
- [ ] Entry-point-aware prompts (extend Session 16 infrastructure):
  - Bubble: "What's going on?"
  - Gap tile: "Tell me about your [dimension]"
  - Narrowing resume: "1 question left — [pattern name]"
  - Pattern tile: "Start [pattern name]?"
  - Reroute: "[Pattern] stalled — what changed?"
- [ ] Message styling: HUMA messages in Cormorant Garamond, operator in Source Sans bubbles
- [ ] Draggable resize handle on chat overlay

**Deliverable:** Chat overlay is fully context-aware. Prompt, banner, and styling match blueprint.

---

### Session 30 — Navigation Flows + Cross-Screen Triggers

**Blueprint defines 6 flows:**
1. **Daily** (80%): Today → check off trigger → cascade completes → done
2. **Insight** (weekly): Today → see insight → "See full pattern" → Whole
3. **Growing** (weekly/monthly): Grow → browse/tap gap → chat overlay → narrowing → pattern selected → Today (next AM)
4. **Editing**: Whole → tap shape region → expand panel → edit → close
5. **Rerouting**: Today → reroute card → chat overlay → adjusted → Today (updated)
6. **Chat from anywhere**: Any screen → tap bubble → chat overlay → conversation → dismiss → same screen

**Implementation:**
- [ ] Flow 1 (Daily): trigger check-off cascades visual completion of downstream steps
- [ ] Flow 2 (Insight): insight card "See full pattern" deep-links to Whole with region highlighted
- [ ] Flow 3 (Growing): pattern selection in chat → creates pattern → appears on Today next load
- [ ] Flow 4 (Editing): already built in Phase 4 (verify)
- [ ] Flow 5 (Rerouting): reroute card opens chat with pattern context → chat response updates pattern
- [ ] Flow 6 (Chat anywhere): chat dismiss returns to origin screen, results propagate to relevant screens
- [ ] Test all 6 flows end-to-end on mobile

**Deliverable:** All 6 navigation flows work as blueprint specifies. Cross-screen state updates propagate correctly.

---

### Session 31 — Inline Interactive + Chat Polish

**Implementation:**
- [ ] Inline interactive elements in chat messages:
  - Pattern cards (when suggesting a pattern)
  - Dimension pills (tappable to filter/explore)
  - Landscape tiles (when browsing options)
- [ ] These render within the message flow, not as separate UI
- [ ] Chat overlay animation: slides up smoothly, dismisses with swipe-down
- [ ] Chat message history: grouped by conversation (time gap > 10min = new conversation)
- [ ] Responsive polish: keyboard doesn't push chat off screen on mobile

**Deliverable:** Chat overlay has inline interactive elements. All animations smooth. Full blueprint chat spec implemented.

**Phase 6 exit criteria:** All 6 navigation flows work. Chat overlay is context-aware with inline interactive elements. The app feels like one connected system, not separate pages.

---

## Phase 7: Distribution + Polish

_Goal: Make HUMA's artifacts shareable. The insight screenshot is the growth loop._

### Session 32 — Shareable Insight Cards

**Implementation:**
- [ ] Share-ready insight card: beautiful enough to screenshot, branded but not salesy
- [ ] "Share" button on insight cards → generates image (html-to-image)
- [ ] `/insight/[id]` public preview page with OG metadata
- [ ] Share formats: image (iMessage/WhatsApp), link (preview page)
- [ ] Subtle CTA: "See your own connections → huma.app"

**Deliverable:** Operators can share insights as images or links.

---

### Session 33 — Morning Briefing + Operator Shape Card

**Implementation:**
- [ ] Email delivery of daily production sheet (Resend or Supabase Edge Functions)
- [ ] Operator preference: delivery time, method (email/none)
- [ ] Email template matching design system (sand, sage, Cormorant headings)
- [ ] "Open in HUMA" deep link to `/today`
- [ ] Shareable Shape Card: 8-dimension profile + archetype + top behaviors
- [ ] "Share my shape" on Whole tab → generates image
- [ ] `/shape/[id]` public preview page

**Deliverable:** Morning briefing delivers via email. Operator shapes are shareable.

---

### Session 34 — Onboarding Optimization + Mobile Polish

**Implementation:**
- [ ] Analytics events: start_conversation, context_gathered, decomposition_shown, pattern_created, first_checkoff
- [ ] Track conversation length to first decomposition
- [ ] Optimize DecompositionPreview for instant scan (3 seconds)
- [ ] "Skip to sheet" for returning operators
- [ ] Final responsive audit: every route at 375px, 390px, 430px
- [ ] Touch target audit (44px minimum everywhere)
- [ ] Performance audit: Lighthouse scores, largest contentful paint

**Deliverable:** Onboarding funnel is measurable. Mobile is polished. Performance is acceptable.

**Phase 7 exit criteria:** Insights and shapes shareable. Morning briefing works. Onboarding measured. Mobile polished.

---

## Phase 8: Scale Readiness

_Goal: Performance, monitoring, and the data foundation for population-level patterns._

### Session 35 — Performance + Caching

- [ ] Cache production sheet (don't recompile if aspirations unchanged)
- [ ] Lazy-load D3/Shape visualization
- [ ] API response time audit (sheet, insight, whole-compute)
- [ ] Image optimization (next/image)
- [ ] Bundle size audit

### Session 36 — Monitoring + Error Tracking

- [ ] Error tracking (Sentry)
- [ ] API latency monitoring
- [ ] Conversation completion rate tracking
- [ ] Alerts: API errors >5%, sheet compilation failures, auth failures
- [ ] Uptime monitoring

### Session 37 — Multi-Operator Foundation

- [ ] Anonymous behavior aggregation (for "people like you" insights)
- [ ] Pattern contribution data model (opt-in sharing)
- [ ] Population-level correlation scaffolding
- [ ] Privacy audit: what's shared, what's private, consent flow
- [ ] Rate limiting review for scale

**Phase 8 exit criteria:** Monitored, performant, data model supports population patterns. Ready for growth.

---

## Session Checklist (Use Every Session)

```
START OF SESSION:
□ Read workspaces/code.md
□ Read this roadmap — find your session
□ Open blueprint v3 (docs/references/huma-blueprint-v3.html) for UI reference
□ Check for any new bugs or regressions from last session

DURING SESSION:
□ One deliverable per session
□ Reference blueprint for any UI decision
□ Test the happy path AND the error path
□ Update types before touching components

END OF SESSION:
□ TypeScript: 0 errors
□ Production build: clean
□ Update workspaces/code.md if routes, API, components, or data layer changed structurally
□ Update this roadmap (check off completed items, note scope changes)
□ Commit with session number in message
```

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-02 | Blueprint v3 is the UI design spec | It defines the target for all three tabs + chat + navigation flows |
| 2026-04-02 | Introduce "pattern" as first-class data model | Blueprint's Today tab requires Pattern Route Cards — can't build UI without the data |
| 2026-04-02 | Today tab before Whole tab redesign | 80% of operator time is on Today (blueprint's time split). Highest impact. |
| 2026-04-02 | Foundation hardening before UI redesign | Data layer must be trustworthy before building new UI on top |
| 2026-04-02 | 3 sessions per phase, 8 phases | Larger scope than original estimate — blueprint v3 requires significant UI work |
| 2026-04-02 | Remove `/system` route | Its function (list all aspirations/behaviors) moves to Whole's expand panels |
| 2026-04-02 | Email before push notifications | Works everywhere, no app store dependency |
| 2026-04-02 | Patterns as separate table (not extending aspirations) | Clean FK relationship, own RLS policies, avoids JSONB nesting of complex entities |
| 2026-04-02 | Pattern extraction happens at save time (not async) | Patterns exist immediately after decomposition — no delayed computation needed |
| | | |

---

## Parking Lot (Valid Ideas, Not Scheduled Yet)

- **Counter-factual modeling** — "If you quit your job, your capital profile would shift like this" (needs population data)
- **Board game (Regenaissance)** — Physical pedagogy product (separate project)
- **RPPL protocol publication** — Open standard for pattern exchange (needs community)
- **Professional tier** — Multi-context management for practitioners
- **Voice input** — Speak to HUMA instead of typing
- **Apple Watch / widget** — Glanceable production sheet
- **Seasonal pattern recognition** — "Your Joy drops every November" (needs 12+ months data)
- **Dark mode** — Design system supports it conceptually, not implemented
- **PWA / offline mode** — Service worker for production sheet caching
- **Collaborative shapes** — "Compare your shape with your partner's"
- **Situation landing pages** — SEO entry points ("I just lost my job") — revisit after Grow tab ships
- **Weekly review** — End-of-week summary with completion rates + insight — revisit after insights mature
- **Quick context add** — One-sentence context update without full conversation — chat overlay may already serve this

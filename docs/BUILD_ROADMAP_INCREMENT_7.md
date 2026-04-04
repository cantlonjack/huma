# Increment 7: Context Ownership — Editability, Archetype Onboarding, Direct Manipulation

_Created: 2026-04-03. Sessions 50–68._
_Prototype reference: `docs/references/prototype.zip` (28 Canva screens showing original onboarding vision)._

---

## Why This Increment

HUMA's core loop works: conversation → decomposition → production sheet → insight. But the operator has no ownership over their context once it's established. Aspirations can't be deleted. Context can't be cleared. Patterns can't be edited from the UI. The only way to change anything is to start a new conversation — which adds to what exists but can't subtract from it.

This is the gap between "an app that runs your life" and "infrastructure you own." Operators who tested casually are stuck with throwaway data. Operators who want to refine their system can't directly manipulate the components they see.

Three phases, one goal: **the operator owns their Whole and can shape it directly.**

### What the Prototype Taught Us

The original Canva prototype (s29–s56) had several ideas worth extracting:

1. **Entity-type selection before anything else** — "Who or what are you?" with visual cards. We adapt this as archetype selection.
2. **"You can always come back and change this"** — editability promised from the first interaction.
3. **The Whole evolves visually as you build it** — a persistent shape that accretes with each step.
4. **Reflect-back with edit/continue at each checkpoint** — "Here's what HUMA understands. Correct it."
5. **"Start from a template or a blank slate"** — dual-path creation for every component.
6. **Purpose → behavior chain visibility** — the decomposition chain is shown, not hidden.
7. **Component detail panels** — tap anything to see its definition, connections, and related patterns.

We take these ideas and apply them to the current MVP architecture.

---

## Phase A: Make Things Removable (Sessions 50–55)

_Goal: Every object in the operator's Whole can be archived, deleted, or reset. No one is stuck with test data._

_Read before building: `HUMA_ETHICAL_FRAMEWORK.md` (dependency test), `HUMA_DESIGN_SYSTEM.md` (confirmation patterns), `HUMA_VOICE_BIBLE.md` (tone for destructive-action copy)._

### Session 50 — Data layer: delete & archive functions

The data layer currently has no delete path for aspirations, no way to clear context, and pattern deletion only happens through merge. This session adds the missing CRUD.

**Implementation:**
- [ ] `archiveAspiration(supabase, userId, aspirationId)` — sets status to `"archived"`, new status value distinct from `"paused"`
- [ ] `deleteAspiration(supabase, userId, aspirationId)` — hard delete from `aspirations` table. Cascade: delete related rows from `patterns`, `sheet_entries`, `behavior_log` for that aspiration
- [ ] `removeContextField(supabase, userId, fieldPath)` — removes a key from `known_context` JSONB (e.g., `"place"`, `"people[2]"`)
- [ ] `clearAllUserData(supabase, userId)` — resets `known_context` to `{}`, `why_statement` to null, deletes all rows from `aspirations`, `patterns`, `sheet_entries`, `behavior_log`, `insights`, `principles`, `chat_messages` for the user
- [ ] Update `Aspiration["status"]` union type in `types/v2.ts` to include `"archived"`
- [ ] Add localStorage equivalents: `clearLocalStorageContext()`, `removeLocalAspiration(id)` — for pre-auth state
- [ ] Verify `deletePattern()` (already exists) cascades cleanly — no orphaned `behavior_log` references
- [ ] Tests: each function in isolation, plus cascade verification

**Deliverable:** Full CRUD for aspirations, patterns, context fields, and nuclear reset. All functions handle both Supabase and localStorage.

---

### Session 51 — Whole page: manage mode

The Whole page currently displays context and aspirations as a read-mostly visualization. This session adds a manage mode where every node becomes removable.

**Implementation:**
- [ ] **Manage toggle** in Whole page header — small gear icon (sage-400, 20px), toggles `manageMode` state
- [ ] In manage mode, WholeShape nodes render with:
  - Aspiration nodes: small `×` badge (12px, amber-600 stroke) at top-right of circle
  - Foundation context nodes: same `×` badge
  - Identity node: no badge (can't delete yourself)
- [ ] Tapping a node in manage mode opens HolonExpandPanel with expanded actions:
  - **For aspirations:** existing detail view + new "danger zone" footer section:
    - "Archive" button — sage outline, sets status to `"archived"`, node fades and removes from shape
    - "Remove" button — rose-500 text, no fill, triggers confirmation
  - **For foundation context:** existing inline edit + "Clear this" link (earth-400 text) to remove the field entirely
- [ ] **Confirmation bottom sheet** for destructive actions:
  - Rounded-t-2xl, sand-50 bg, 320ms slide-up (--huma-ease)
  - Header: "Remove [aspiration name]?" (Cormorant Garamond, 20px, earth-800)
  - Body: "This removes the aspiration, its behaviors, and related patterns. You can't undo this." (Source Sans 3, 14px, earth-500)
  - Two buttons: "Remove" (rose-500 bg, text-sand-50) / "Keep it" (sand-200 bg, earth-600 text)
- [ ] After deletion: shape re-renders without the node, cached sheet cleared to force recompile

**Deliverable:** Operators can archive and hard-delete aspirations from the Whole page. Foundation context fields can be cleared. Confirmation prevents accidental data loss.

---

### Session 52 — Grow page: pattern management

Patterns currently render as read-only cards on the Grow page. This session adds inline editing, archiving, and deletion.

**Implementation:**
- [ ] **Overflow menu** on each pattern card — `···` button (earth-400, top-right), opens a small dropdown:
  - "Edit" — enters inline edit mode on the card
  - "Archive" — sets pattern to archived status, removes from view with fade-out
  - "Remove" — confirmation bottom sheet → `deletePattern()`
- [ ] **Inline pattern editing** — when "Edit" tapped:
  - Pattern name: text becomes editable input (Cormorant Garamond, same size/weight)
  - Trigger text: becomes editable input
  - Golden pathway steps: each becomes editable text, with `×` to remove and `+` at bottom to add
  - Time window: editable input
  - "Save" / "Cancel" buttons at bottom of card (amber-600 / sand-200)
- [ ] Wire saves to `updatePattern()` in supabase-v2 (already exists, expose to UI)
- [ ] For pre-auth users: mirror edits in localStorage `huma-v2-patterns`

**Deliverable:** Operators can rename, edit steps, archive, and delete patterns directly from the Grow page.

---

### Session 53 — Context field management

The ContextPortrait on the Whole page supports inline editing but not removal. Individual people and resources can be edited but not deleted from their arrays.

**Implementation:**
- [ ] **Field removal** — each context section (place, work, stage, health, time) gets a subtle `×` icon (earth-300, 14px) visible when manage mode is active
  - Tapping `×` calls `removeContextField()` for that key
  - Field fades out, corresponding foundation node disappears from WholeShape
- [ ] **People list management** — each person entry gets swipe-to-remove on mobile (swipe left reveals rose-400 "Remove" zone) and hover `×` on desktop
- [ ] **Resources list management** — same pattern as people
- [ ] **"Add context" affordance** — at bottom of ContextPortrait, a `+` button (sage-400 outline circle, 36px) that opens a small menu of available context types not currently populated
  - Shows only unpopulated fields (if "place" exists, it's not in the menu)
  - Tapping a type opens inline input for that field
  - Menu items: Place, Work, Stage, Health, Time, Person, Resource
- [ ] After removal: persist to localStorage and Supabase via `updateKnownContext()`

**Deliverable:** Context fields, people, and resources are individually removable and re-addable. No orphaned data.

---

### Session 54 — Fresh start / reset

For operators who tested casually and want to start over, this session adds a settings panel with reset options.

**Implementation:**
- [ ] **Settings bottom sheet** — opened from a gear icon in Whole page header (reuse manage toggle area, or place adjacent)
  - Three options, each with HUMA-voice confirmation:
  1. **"Clear chat history"** — deletes `chat_messages` for user + clears `huma-v2-chat-messages` and `huma-v2-start-messages` from localStorage
     - Confirmation: "This removes your conversation history. Your context, aspirations, and patterns stay."
  2. **"Clear context"** — resets `known_context` to `{}`, clears `why_statement`, leaves aspirations/patterns intact
     - Confirmation: "This removes what HUMA knows about you — place, work, people, archetypes. Your aspirations stay."
  3. **"Start fresh"** — calls `clearAllUserData()`, clears all localStorage keys matching `huma-v2-*`, redirects to `/start?fresh=1`
     - Confirmation: "Clean slate. Context, aspirations, patterns, history — everything goes. Your account stays."
     - Two-step: first tap shows confirmation sheet, second tap ("Yes, start fresh") executes
- [ ] Settings sheet styling: sand-50 bg, options as full-width rows with icon + label + description, chevron indicator
- [ ] Post-reset redirect: no stale state in React state or localStorage

**Deliverable:** Operators can clear chat, clear context, or fully reset. Each option has appropriate scope and confirmation.

---

### Session 55 — Phase A polish & edge cases

After deletion features exist, this session handles all the edge cases and empty states.

**Implementation:**
- [ ] **Empty states after deletion:**
  - Whole page (no aspirations): "Your shape starts here." (Cormorant Garamond italic, sage-300, centered) + "Start a conversation" CTA linking to `/start`
  - Today page (no aspirations/sheet): "Nothing scheduled yet." + CTA to `/start`
  - Grow page (no patterns): "Patterns emerge from your aspirations." + CTA to `/start`
- [ ] **Undo affordance for archive** — after archiving (not hard-deleting), show a toast at bottom:
  - "[Aspiration name] archived" with "Undo" link (amber-600 text)
  - 5-second window, then toast fades
  - Undo calls `updateAspirationStatus()` back to `"active"`
  - Toast styling: sand-100 bg, earth-600 text, 2px sage-200 border, rounded-xl, slide-up animation
- [ ] **Manage mode exit** — tapping gear again deselects all nodes, closes any open panels
- [ ] **Chat context awareness in manage mode** — ChatSheet `contextPrompt` updates: "What would you like to change?"
- [ ] **Sheet recompile trigger** — after any aspiration archive/delete, clear today's cached sheet so next load recompiles
- [ ] **Design system audit** — all new UI in this phase: sand-50 backgrounds (not white), serif/sans split correct, amber for actions only, no emoji

**Deliverable:** All edge cases handled. Archive has undo. Empty states are warm, not blank. Design system compliance verified.

**Phase A exit criteria:** Aspirations deletable and archivable. Patterns editable and deletable from Grow. Context fields removable. Full reset available. No operator is stuck with test data.

---

## Phase B: Archetype-First Onboarding (Sessions 56–62)

_Goal: New operators establish their archetype and see a pre-populated Whole before their first conversation. The conversation deepens an existing shape rather than building from zero._

_Read before building: `HUMA_PATTERN_LIBRARY.md` (seed patterns), `HUMA_VOICE_BIBLE.md` (onboarding tone), `HUMA_INTELLECTUAL_LINEAGE.md` (archetype source traditions), `HUMA_ETHICAL_FRAMEWORK.md` (dependency test — templates develop capacity, not dependency)._

_Prototype reference: s29–s31 (entity selection + first component celebration), s35 (capital sliders), s36–s37 (wealth flower + reflect-back), s45 (template or blank slate)._

### Session 56 — Archetype card design + template data

The current ArchetypeSelector is a grid of plain text buttons. This session creates rich visual cards and the template data structure that powers pre-population.

**Implementation:**
- [ ] **ArchetypeCard component** (`components/onboarding/ArchetypeCard.tsx`):
  - Card: sand-50 bg, sand-200 border, rounded-xl, 16px padding
  - Name: Cormorant Garamond, 18px, sage-700
  - One-line description: Source Sans 3, 13px, earth-500
  - 2–3 "typical concerns" as whisper text: Source Sans 3, 11px, earth-300, italic
  - Selected state: sage-50 bg, sage-400 border, subtle scale(1.02) with --huma-ease
  - Touch target: minimum 52px height
- [ ] **Archetype descriptions** (grounded in real life):
  - Earth Tender: "Land, food, seasons. Your life is rooted in place."
  - Creator: "Making things. The work itself is the point."
  - Entrepreneur: "Building something that sustains itself — and you."
  - Official: "Holding structure for others. Governance is your medium."
  - Economic Shaper: "Money as a tool for change, not just security."
  - Spirit: "Inner life drives outer life. Meaning before method."
  - Media: "Stories, signals, culture. You shape how people see."
  - Educator: "Developing others. Knowledge is your primary material."
  - Parent: "Everything runs through the kids right now."
  - Initiator: "You start things. Momentum is your gift."
  - Manifestor: "You finish things. Execution is your gift."
  - Destabilizer: "You question things. Disruption is your gift."
- [ ] **Archetype template data** (`lib/archetype-templates.ts`):
  - For each of the 9 domain archetypes:
    - `description: string` — the one-liner above
    - `typicalConcerns: string[]` — 2–3 concerns (e.g., Creator: "Protecting creative time", "Making it sustainable", "Shipping vs perfecting")
    - `starterAspirations: { text: string; behaviors: Behavior[]; dimensions: DimensionKey[] }[]` — 2–3 template aspirations with pre-built behaviors
    - `contextHints: Partial<KnownContext>` — typical context shape (e.g., Earth Tender: `{ place: { name: "", detail: "Land-based" } }`)
    - `relevantPatternIds: string[]` — IDs from the 12 seed patterns in HUMA_PATTERN_LIBRARY.md
  - For each of the 3 orientation archetypes:
    - `description: string`
    - `modifier: string` — how this orientation modifies behavior ordering (e.g., Initiator: "Front-load new behaviors. Start fast, adjust later.")
- [ ] Export `ARCHETYPE_TEMPLATES` as typed constant

**Deliverable:** ArchetypeCard component renders beautifully. Template data complete for all 12 archetypes.

---

### Session 57 — Onboarding flow: Step 0 (archetype selection)

The `/start` page currently drops directly into a blank chat. This session adds archetype selection as Step 0.

**Implementation:**
- [ ] **New `/start` page structure** — `onboardingStep` state: `"archetype" | "conversation"`
  - If `localStorage` already has `huma-v2-known-context` with archetypes → skip to `"conversation"`
  - Otherwise start at `"archetype"`
- [ ] **Archetype selection screen** (Step 0):
  - Header: "What kind of life are you running?" (Cormorant Garamond, 24px, earth-800, centered)
  - Subtext: "Pick what fits. You can change this anytime." (Source Sans 3, 14px, earth-400)
  - **Domain grid**: responsive grid — 3 columns on desktop, 2 on mobile — of ArchetypeCards
  - **Orientation row**: section label "How you move" (Source Sans 3, 10px, uppercase, earth-300), then 3 ArchetypeCards in a row
  - Multi-select: tapping toggles selection, at least 1 required to continue
  - "Continue" button (amber-600, full-width, rounded-full) — appears after 1+ selection
  - "Skip — just talk" link below (earth-400, 13px, underline) — jumps to conversation with no archetype context
- [ ] **Editability promise**: after selection and before transition, brief flash text: "This shapes your starting point. You can change it anytime from Whole." (Source Sans 3, 12px, sage-400, fade-in → fade-out over 1.5s)
- [ ] Save selected archetypes to `localStorage["huma-v2-known-context"].archetypes`
- [ ] Transition: "Continue" triggers smooth crossfade (300ms, --huma-ease) from archetype screen to conversation

**Deliverable:** Fresh `/start` visit shows archetype selection. Selecting and continuing transitions to conversation. Skip path works.

---

### Session 58 — Template pre-population + Whole preview

After archetype selection, the system pre-populates the operator's Whole with template data and shows it forming.

**Implementation:**
- [ ] **Pre-population on "Continue":**
  - Create 1–2 starter aspirations from archetype template (status: `"finding"`, marked `source: "template"` in metadata)
  - Seed 1–2 patterns from template's `starterAspirations` behaviors
  - Pre-fill `contextHints` into `known_context`
  - Save all to localStorage
- [ ] **Template vs blank slate fork** — at the point of pre-population, show a brief choice:
  - "Start with suggestions" (default, pre-populates from template) — amber-600 button
  - "Start blank" — sage outline button, skips pre-population, goes straight to conversation
  - Styling: two buttons side by side, centered, below the archetype selection
- [ ] **Whole mini-preview** — small (120px) silhouette of the WholeShape in the top-right corner of the `/start` page
  - Initially empty/faint (just the membrane outline)
  - After archetype selection: 1–2 nodes appear inside the membrane (template aspirations)
  - After conversation adds context: more nodes appear
  - Uses a simplified static SVG (not the full D3 simulation) for performance
  - Smooth transitions: nodes fade in with --huma-ease
- [ ] **Optional quick capital sketch** — below the template choice, collapsible section:
  - "Sketch where things stand" (tappable to expand)
  - 8 horizontal sliders (one per dimension), sand-100 track, sage-500 fill
  - Labels: dimension names only, no numbers
  - Framing: "Rough is fine. HUMA will refine this from your actual behavior."
  - Saves to `known_context.capitalSketch` — used as seed for CapitalRadar until behavioral data exists
  - Collapsible = skippable without friction
- [ ] Template aspirations marked with `source: "template"` field so they can be identified, replaced, and don't carry the same weight as conversation-derived aspirations

**Deliverable:** Archetype selection pre-populates the Whole. Whole shape preview visible during onboarding. Template vs blank fork offered. Optional capital sketch available.

---

### Session 59 — Archetype-aware conversation opening

The conversation should know about the archetype and templates, and reflect back what it's starting with.

**Implementation:**
- [ ] **Archetype-aware opening message** — instead of blank "What's going on?":
  - If archetype selected with templates: HUMA speaks first with a reflect-back:
    - e.g., Creator: "Creator — so the work matters. I've started with a couple of things that tend to come up: [template aspiration names]. Tell me what's actually going on and we'll adjust."
  - If archetype selected without templates (blank slate): archetype-specific opener:
    - e.g., Parent: "Parent — so the kids are the organizing principle right now. What's the thing that keeps not working?"
  - If skipped: current behavior ("What's going on?")
- [ ] **Opening message generation** — `lib/archetype-openers.ts`:
  - Map of archetype → opening message string
  - If multiple archetypes selected, use primary (first domain archetype)
  - Opening references template aspirations by name if they exist
- [ ] **Template refinement markers** — conversation engine recognizes when operator is refining a template:
  - If operator contradicts a template aspiration → HUMA offers to replace it
  - New marker: `[[REPLACE_ASPIRATION:templateAspirationId:newText]]` — swaps template aspiration with conversation-derived one
- [ ] **"Suggested" badge on DecompositionPreview** — template-sourced behaviors show a subtle label: "suggested" (earth-300, italic, 11px) that disappears when the behavior is confirmed or replaced through conversation
- [ ] **Reflect-back before decomposition** — when HUMA has enough context to decompose (existing behavior), add a brief reflect-back step:
  - "Here's what I'm working with — [summary]. Does this look right?"
  - Options: "Yes, show me behaviors" / "Let me adjust"
  - "Let me adjust" continues conversation; "Yes" triggers decomposition

**Deliverable:** Conversation opens with archetype awareness. Template aspirations can be refined or replaced. Reflect-back checks understanding before committing.

---

### Session 60 — ArchetypeSelector redesign (Whole page)

Replace the current plain-button ArchetypeSelector on the Whole page with the new ArchetypeCard component for consistency.

**Implementation:**
- [ ] **Replace ArchetypeSelector internals** — swap the 3×3 text button grid with the ArchetypeCard component from Session 56
- [ ] Bottom sheet retains same animation and structure (backdrop, slide-up, handle)
- [ ] Cards arranged: domain grid (3-col desktop, 2-col mobile) + orientation row
- [ ] Selected state matches onboarding: sage-50 bg, sage-400 border, scale(1.02)
- [ ] **"Learn more" expand** on each card in this context — tapping the `···` or a chevron on the card shows:
  - Typical concerns (from template data)
  - Relevant seed patterns (names only, linked to Grow page)
  - "Operators with this archetype often work on: [aspiration examples]"
- [ ] Save button remains amber-600, disabled until 1+ selected

**Deliverable:** Whole page archetype selector uses rich cards matching the onboarding flow. Consistent visual language across entry points.

---

### Session 61 — New aspiration entry points

Operators need to add aspirations after initial onboarding without going back to `/start`.

**Implementation:**
- [ ] **"Add aspiration" affordance** on Whole page:
  - In manage mode: `+` node in WholeShape (dashed circle, sage-300, pulsing gently)
  - Tapping opens ChatSheet with `mode: "new-aspiration"`
- [ ] **ChatSheet "new-aspiration" mode:**
  - Pre-filled context prompt: "What do you want to work on?"
  - System prompt includes existing context + archetypes for continuity
  - Decomposition output creates new aspiration (added to existing set, not replacing)
  - After decomposition confirmed: ChatSheet closes, new node appears in WholeShape
- [ ] **Template quick-add** — before the conversation starts in new-aspiration mode:
  - Show 2–3 template aspirations relevant to operator's archetype as tappable cards
  - Cards styled like DecompositionPreview items: text + dimension dots + "Add this" button
  - Tapping "Add this" pre-fills the conversation: "I want to [template text]" — then HUMA refines with questions
  - "Or tell me something else" text input below the cards
- [ ] **Grow page entry point** — "Add pattern" link at bottom of pattern list, opens same ChatSheet mode
- [ ] **Today page entry point** — when sheet has < 3 items, show subtle prompt: "Room for more. Add an aspiration?" → opens ChatSheet

**Deliverable:** Aspirations can be added from Whole, Grow, or Today without returning to `/start`. Template suggestions available at point of creation.

---

### Session 62 — Persistent Whole mini-indicator + onboarding polish

The prototype showed the Whole shape as a persistent avatar that evolved across screens. This session adds a simplified version plus final onboarding polish.

**Implementation:**
- [ ] **Whole mini-indicator** — tiny (28px) simplified WholeShape icon in the BottomNav center or header area
  - Renders as a small SVG: membrane outline + colored dots for each aspiration (sage = active, amber = finding, earth = archived/paused)
  - Updates reactively when aspirations change
  - Tapping navigates to `/whole`
  - Not visible on `/` or `/start` (matches BottomNav hiding logic)
- [ ] **Onboarding transition polish:**
  - Archetype → conversation: smooth crossfade (not hard page swap), 300ms
  - Progress hint: subtle 2-dot indicator ("1 of 2") during onboarding, Cormorant Garamond, 10px, earth-300. Disappears after first decomposition.
- [ ] **Skip path quality verification:**
  - Operators who skip archetype get current flow (blank conversation)
  - No degraded experience — skip path is a valid choice, not a fallback
- [ ] **Mobile optimization for archetype cards:**
  - 2-column grid on screens < 640px
  - 1-column on screens < 380px (iPhone SE)
  - Touch targets: minimum 52px card height
  - Scroll behavior: cards scroll within viewport, "Continue" stays fixed at bottom
- [ ] **Return to `/start?fresh=1`** — after a full reset (Session 54), archetype selection appears again
- [ ] End-to-end test: landing → archetype → template → conversation → decomposition → auth → today

**Deliverable:** Whole mini-indicator visible across tabs. Onboarding transitions are smooth. Full flow works end-to-end on mobile and desktop.

**Phase B exit criteria:** New operators pick archetypes, see a pre-populated Whole, refine via conversation. Templates offered at every creation point. Archetype selection consistent between onboarding and Whole page. Skip path works cleanly.

---

## Phase C: Direct Manipulation Workbench (Sessions 63–68)

_Goal: Tapping any component in the Whole opens it as an editable, refinable object with HUMA's contextual suggestions. The Whole page becomes a workbench, not a mirror._

_Read before building: `HUMA_PATTERN_LIBRARY.md` (pattern connections/synergies), `HUMA_CONVERSATION_ARCHITECTURE.md` (context usage), `HUMA_DESIGN_SYSTEM.md` (panel patterns)._

_Prototype reference: s46 (purpose → behavior chain), s51 (behavior ↔ pattern mapping), s55–s56 (component graph with detail panels)._

### Session 63 — Aspiration detail panel redesign

The current HolonExpandPanel shows minimal aspiration info (name, status, description, dimensions). This session turns it into a full editing workspace.

**Implementation:**
- [ ] **Expanded aspiration panel** (when tapping an aspiration node, not in manage mode):
  - **Header**: aspiration name — tappable to edit inline (Cormorant Garamond, 20px input)
  - **Status chip**: tappable to cycle through active / paused / finding (sage / amber / earth backgrounds)
  - **Decomposition chain**: visual tree showing the hierarchy:
    ```
    [Aspiration name]
     ├── Behavior 1 (trigger) ★
     │   └── → Pattern: [pattern name] (if extracted)
     ├── Behavior 2
     ├── Behavior 3
     └── Behavior 4
    ```
    - Tree rendered as indented rows with thin sage-200 connector lines
    - Trigger behavior marked with amber-600 star icon
    - Pattern links are tappable (navigate to Grow or open pattern detail)
  - **Behavior editing**:
    - Each behavior is an editable row: text input + dimension dots
    - `×` button to remove individual behavior
    - `+` row at bottom to add a new behavior (text input appears on tap)
    - Drag handle (⋮⋮) on left for reorder — uses touch-friendly drag on mobile
    - Trigger selection: tap the ★ on any behavior to make it the trigger
  - **Coming Up / Longer Arc**: collapsible sections with editable text lists
  - Panel max-height: 65vh, scrollable internally
- [ ] **Save behavior** — persists via `updateAspirationBehaviors()` + updates localStorage
- [ ] **New function**: `updateAspirationName(supabase, userId, aspirationId, name)` — updates `clarified_text`
- [ ] After save: WholeShape re-renders (dimension dots may change), today's cached sheet cleared

**Deliverable:** Full aspiration editing from the Whole page: rename, reorder behaviors, add/remove behaviors, change trigger, edit coming-up/longer-arc. Decomposition chain visible.

---

### Session 64 — Contextual suggestion engine

HUMA should surface intelligent suggestions when an operator is examining a component — related patterns, alternative framings, impact warnings.

**Implementation:**
- [ ] **`/api/suggest` POST endpoint**:
  - Request body: `{ componentType: "aspiration" | "pattern" | "context", componentData: object, operatorContext: object }`
  - `operatorContext` includes: archetypes, known_context summary, active aspiration names, active pattern names
  - Returns:
    ```typescript
    {
      relatedPatterns: { name: string; description: string; matchReason: string }[];
      alternatives: { text: string; reason: string }[];
      connections: { dimension: string; explanation: string }[];
      warnings: string[];
    }
    ```
  - Uses Haiku model for speed (< 2 second response)
  - System prompt: focused on the operator's context + the specific component, asks for practical suggestions in HUMA voice
- [ ] **Client-side caching** — suggestions cached by component ID in React state. Re-fetched only if component data changes.
- [ ] **Suggestion data shape** in `types/v2.ts`:
  ```typescript
  interface ComponentSuggestions {
    relatedPatterns: { name: string; description: string; matchReason: string }[];
    alternatives: { text: string; reason: string }[];
    connections: { dimension: string; explanation: string }[];
    warnings: string[];
  }
  ```

**Deliverable:** `/api/suggest` returns contextual suggestions for any component. Fast response, session-cached.

---

### Session 65 — Suggestion UI in aspiration & pattern panels

Surface the suggestion engine's output in the detail panels operators already use.

**Implementation:**
- [ ] **"Related" section** at bottom of aspiration detail panel (Session 63):
  - Lazy-loaded: fetch from `/api/suggest` when panel opens, show skeleton shimmer while loading
  - **Related patterns**: horizontal scroll of small cards (sand-100 bg, sage-200 border, 120px wide)
    - Each: pattern name (Cormorant Garamond, 14px) + match reason (Source Sans 3, 11px, earth-400)
    - "Add" button (sage-400 outline, small) → creates pattern from seed library data
  - **Alternative framings**: "Did you mean..." section
    - 1–2 alternative texts, each tappable
    - Tapping shows: "Use this instead?" — confirm replaces aspiration name/text
    - Styling: earth-500 text, underline, italic
  - **Connections**: simple text list showing dimensional impact
    - "This touches Body, Money, Joy. Removing it leaves Joy supported by only 1 other behavior."
    - Styled as a quiet aside: Source Sans 3, 12px, earth-400
- [ ] **Pattern card suggestions on Grow page**:
  - Tap a pattern card to expand → existing detail + new "Related" section at bottom
  - Complementary patterns, conflict warnings from suggestion engine
  - Same lazy-load + skeleton pattern
- [ ] **Empty suggestion state**: if API returns empty, show nothing (don't show "No suggestions"). Absence is fine.

**Deliverable:** Tapping aspirations or patterns shows contextual suggestions. Related patterns can be added. Alternative framings can be accepted. Connection impact is visible.

---

### Session 66 — Foundation context suggestions + dimension content

Foundation context nodes (place, work, stage, health) should surface enrichment suggestions, and operators should see what's *inside* each dimension.

**Implementation:**
- [ ] **Context enrichment panel** — when tapping a foundation node (not in manage mode):
  - Current value (editable, as today)
  - **"HUMA noticed..."** suggestions section:
    - Scan `chat_messages` for the user where `context_extracted` JSONB contains relevant field mentions
    - Surface as: "You've mentioned [X] in conversation. Add this to your [field]?"
    - Tappable: "Add" merges into context, "Dismiss" hides suggestion
  - If no conversation-derived suggestions: section doesn't appear
- [ ] **Empty context prompts** — for unpopulated foundation fields:
  - Dashed-circle node in WholeShape (sage-200, dashed stroke)
  - Tapping opens panel with archetype-relevant suggestions:
    - E.g., Creator with no "work" context → suggests: "Studio practice", "Freelance", "Side project alongside day job"
  - Suggestions sourced from `ARCHETYPE_TEMPLATES[archetype].contextHints`
  - Tapping a suggestion pre-fills the field; operator can edit before saving
- [ ] **Dimension content view** — new panel accessible by tapping a dimension area or label on WholeShape:
  - Shows everything that feeds this dimension:
    - Aspirations that touch it (with status)
    - Behaviors that build/protect/cost it (with check-off status from today)
    - Patterns that involve it
  - Styled as a clean list: grouped by type, Cormorant Garamond section headers
  - Each item tappable to navigate to its detail panel
  - Header shows dimension name + color dot + count: "Body — 3 behaviors, 1 pattern"

**Deliverable:** Foundation nodes surface enrichment suggestions from conversation history. Empty fields show archetype-relevant prompts. Dimension content is browsable.

---

### Session 67 — Cross-component impact awareness

Before operators make destructive changes, they should understand the downstream impact.

**Implementation:**
- [ ] **Impact preview in confirmation dialogs** — enhance Session 51's confirmation sheet:
  - Before archiving/removing an aspiration: "This aspiration has 4 behaviors, 1 pattern, and appears in your daily sheet. Removing it will remove all of them."
  - Before removing a behavior: "This behavior is part of [Pattern Name] and shows up in your daily sheet."
  - Before clearing a context field: "HUMA uses your [work] context to personalize your sheet and conversation."
  - Impact counts computed client-side from aspirations → patterns → sheet_entries relationship chain
- [ ] **Visual impact on WholeShape** — when long-pressing (mobile) or hovering (desktop) a node in manage mode:
  - Connected nodes glow briefly (sage-200 aura, 400ms, --huma-ease)
  - Connection lines brighten (opacity from 0.15 → 0.5)
  - Helps operators see the network before acting
  - Uses existing D3 link data — no new computation needed
- [ ] **Impact for pattern deletion** — on Grow page, before removing a pattern:
  - "This pattern tracks [N] behaviors across [M] dimensions. Your daily sheet will adjust."
- [ ] **"Safe" deletions** — if removing something has zero downstream impact (e.g., a "finding" aspiration with no patterns and no sheet entries), skip the impact warning and use a simpler confirmation

**Deliverable:** Destructive actions show accurate impact counts. Connected nodes visually highlight on hover/press. Safe deletions have streamlined confirmation.

---

### Session 68 — Integration polish + design system audit

Final session: ensure all three phases work together as one coherent experience.

**Implementation:**
- [ ] **Cross-page edit consistency**:
  - Whole: node detail panels with edit + suggest + impact
  - Grow: pattern card inline edit + suggest + archive/delete
  - Today: tap a behavior → shows which aspiration it came from (as a subtle link: "From: [aspiration name]" in earth-300, 11px), tap navigates to Whole with that aspiration's panel open
- [ ] **Transition animations audit**: every panel open/close, suggestion load, node highlight, toast appearance uses `--huma-ease` (cubic-bezier(0.22, 1, 0.36, 1)). No spring, no bounce.
- [ ] **Mobile gesture consistency**:
  - Swipe-left on list items (behaviors, patterns, people) to reveal remove action — consistent across Whole, Grow, ContextPortrait
  - Drag-to-dismiss on all bottom sheets (confirmation, settings, archetype selector)
  - Same velocity threshold as ChatSheet (>100px or >0.5px/ms)
- [ ] **Accessibility audit for new UI**:
  - All interactive elements: focus ring (2px sage-500), keyboard navigable (Tab/Enter/Escape)
  - ARIA labels on: manage mode toggle, confirmation buttons, suggestion cards, remove buttons
  - Screen reader: confirmation dialogs announced as alerts
  - Reduced motion: all new animations respect `prefers-reduced-motion`
- [ ] **Design system sweep** (all Sessions 50–67 output):
  - No `bg-white` — use `bg-sand-50` or intentional card surfaces
  - No `text-white` — use `text-sand-50` on colored backgrounds
  - No emoji in UI text
  - Serif (Cormorant Garamond) for content names, aspiration text, headers
  - Sans (Source Sans 3) for labels, buttons, metadata, descriptions
  - Amber-600 for interactive/action only, never decorative
  - All text colors from ink/earth palette, never pure black
- [ ] Full walkthrough documentation: start → archetype → template → conversation → decompose → auth → today → whole (manage mode → delete aspiration → see impact → confirm) → grow (edit pattern → see suggestions → archive) → whole (tap dimension → see content → tap empty context → accept suggestion)

**Deliverable:** All three phases work as one coherent system. Design system compliance verified. Accessibility audited. Mobile gestures consistent.

**Phase C exit criteria:** Every component in the Whole is directly editable with contextual suggestions. Impact awareness prevents uninformed deletions. The Whole page is a workbench, not a read-only mirror.

---

## Session Checklist (Use Every Session)

```
START OF SESSION:
□ Read CURRENT_STATE.md
□ Read this increment plan — find your session
□ Read the relevant design documents listed in the phase header
□ Check for regressions from last session

DURING SESSION:
□ One deliverable per session
□ Test the happy path AND the destructive path (deletions, resets)
□ Update types before touching components
□ Verify on 375px mobile viewport

END OF SESSION:
□ TypeScript: 0 errors
□ Production build: clean
□ Update CURRENT_STATE.md
□ Commit with session number in message
```

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-03 | Aspirations get hard-delete AND archive | Archive preserves data for operators who might want it back (5-second undo). Delete is for test data and fresh starts. |
| 2026-04-03 | Archetype selection as Step 0, not a form | The prototype used card-based selection — visual and tappable, not a multi-field form. Aligns with "no forms, just talk" principle while giving structure. |
| 2026-04-03 | "Skip — just talk" always available | Archetype selection must never feel mandatory. Some operators know exactly what they want to say. |
| 2026-04-03 | Template aspirations marked with `source: "template"` | Distinguishes template-sourced content from conversation-derived content. Templates are starting points, not commitments. |
| 2026-04-03 | Capital sketch is optional and collapsible | HUMA's principle is "computed, not self-reported." But Day 0 has no behavioral data. The sketch is a seed that gets overwritten by reality. |
| 2026-04-03 | Haiku for suggestion engine, not Sonnet | Suggestions must be fast (< 2s). They're contextual nudges, not deep analysis. Haiku is sufficient and much cheaper. |
| 2026-04-03 | No full component graph (from prototype) | The prototype's network visualization is powerful but over-engineered for MVP. We take the side-panel pattern (tap to see connections) without the full graph view. |
| 2026-04-03 | Persistent Whole mini-indicator in nav | Prototype showed the Whole as a persistent evolving avatar. A 28px simplified SVG in the nav reinforces "your system is alive" without visual noise. |
| 2026-04-03 | Entity-type selection (Person/Group/Place) deferred | HUMA V2 is person-only. The prototype's entity types are a V3 concern when HUMA serves teams and organizations. |
| 2026-04-03 | Reflect-back before decomposition | Prototype paused at every step to check understanding. We add one reflect-back moment before the first decomposition — "Does this look right?" |

---

## Parking Lot (From This Analysis)

- **Entity-type selection** (Person / Group / Place / Enterprise) — revisit when HUMA serves non-individual operators
- **Regenerative Wealth flower visualization** — alternative to D3 force graph, could replace WholeShape in a future redesign
- **Full component graph network** (prototype s55–s56) — powerful but needs population-level data to be meaningful
- **Voice input for context gathering** — prototype showed audio recording UI (s48), low priority vs typed conversation
- **Ikigai Venn for structured context** — prototype used Love/Good/Need/Paid overlapping Venn (s40–s44). Could be a structured alternative to conversational context gathering.
- **12-step linear onboarding wizard** — prototype's full sequence. Too many steps for MVP, but individual steps (who, what, context, purpose, vision, behavior) could become optional deep-dive modules.

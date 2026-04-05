# Planning Workspace

_Last updated: 2026-04-05_

## What This Workspace Is For
Roadmap, session planning, resolved decisions, and current state tracking. Read this when deciding what to build next, planning a session, or checking project status.

For V2 foundation (read FIRST for product decisions): `docs/HUMA_V2_FOUNDATION.md`
For full roadmap detail: `docs/BUILD_ROADMAP.md` (Inc 1-6), `docs/BUILD_ROADMAP_INCREMENT_7.md` (Inc 7)
For current state: `docs/CURRENT_STATE.md`

---

## Product Identity

HUMA is infrastructure for running your life as one connected system. Not a wellness app. Not a life design tool. Infrastructure — like Google Maps is infrastructure for navigation.

**What HUMA does that no other app can:** Show you how the different parts of your life are connected — and which specific daily behaviors are the leverage points that hold everything together.

**The core gap:** Claude is a brilliant generalist that requires a skilled operator. HUMA is the skilled operator — generalized, persistent, proactive, available to everyone.

---

## Document Index

| Document | What It Governs |
|----------|----------------|
| **HUMA_V2_FOUNDATION.md** | Three layers, product surface, entry flow. **Read FIRST for product decisions.** |
| **HUMA_VISION_AND_STRATEGY.md** | Why HUMA exists, sovereignty principles, strategic phases |
| **HUMA_DESIGN_SYSTEM.md** | Colors, fonts, spacing, components, animation |
| **HUMA_VOICE_BIBLE.md** | How HUMA speaks, banned phrases, tone |
| **HUMA_ETHICAL_FRAMEWORK.md** | Dependency/sovereignty tests, distress protocol |
| **HUMA_CONVERSATION_ARCHITECTURE.md** | Conversation engine, context gathering, decomposition |
| **HUMA_PATTERN_LIBRARY.md** | RPPL patterns, pattern evolution |
| **HUMA_INTELLECTUAL_LINEAGE.md** | Source traditions |

### Archived (do not consult)
`HUMA_PRODUCT_SURFACE.md`, `HUMA_TECHNICAL_SPECIFICATION.md`, `HUMA_USER_JOURNEY.md`, `HUMA_COMPLETE_CONTEXT.md`

---

## Resolved Decisions (Do Not Revisit)

| Decision | Resolution |
|----------|-----------|
| Entry experience | Archetype selection (Step 0, skippable) -> open conversation. NOT guided onboarding wizard. |
| Home screen | Production sheet (`/today`). NOT a chat page. |
| Visible artifact | Whole page (`/whole`) with holonic visualization, archetypes, WHY. |
| Conversation model | Ephemeral input -> structured output. NOT a growing chat log. |
| Capital scores | COMPUTED from behavior through decomposition chains. NOT self-reported. |
| Context building | Through conversation and use over time. NOT forms. |
| Product model | Life operating system / infrastructure. NOT self-improvement tool. |
| Palette function | PrepBoard model — browse, tap to add context. NOT chat injection. |
| Insight timing | Structural insight on Day 1. Behavioral insights Week 2+. |
| Decomposition output | Phased: this_week (max 4, one trigger) / coming_up / longer_arc. NOT flat list. |
| Navigation | Today / Whole / Grow (bottom tab bar). Chat is overlay, not a tab. |
| Context editability | Everything directly editable from Whole page. |
| Archetype onboarding | Step 0 with visual cards, skippable. Pre-populates Whole with template data. |
| Method intelligence | Surfaces proven better methods with evidence. Woven into conversation, not separate. Rare, high-confidence only. |

---

## Build Roadmap (Sessions 25-68)

Seven increments organized by operator experience arc.

| Inc | Name | Sessions | Theme |
|-----|------|----------|-------|
| 1 | The Specific Sheet | 25-30 | "This app knows my life" |
| 2 | The Return Loop | 31-35 | "It shows up for me" |
| 3 | The Living Grow Tab | 36-41 | "My patterns are alive and adaptive" |
| 4 | The Whole Page as Living Mirror | 42-44 | "I can see my system evolving" |
| 5 | Temporal Intelligence | 45-47 | "HUMA knows my seasons" |
| 6 | The Shareworthy Moment | 48-49 | "I want to show someone this" |
| 7 | Context Ownership | 50-68 | "I can shape my own system" |

### Increment 7 Detail (Current)
- **Phase A (50-55):** Make Things Removable — delete/archive aspirations, manage mode, pattern management, fresh start
- **Phase B (56-62):** Archetype-First Onboarding — archetype cards, Step 0 selection, template pre-population, method intelligence
- **Phase C (63-68):** Direct Manipulation Workbench — aspiration detail panel, suggestion engine, cross-component impact awareness

For full session-by-session detail, read `docs/BUILD_ROADMAP_INCREMENT_7.md`.

---

## What Not to Build

- **Template library / pattern commons** — not until 1,000+ operators with 3+ months data
- **Adaptive cycle labels** — operator never sees framework vocabulary
- **Animated connection reveals on check-off** — gamification, violates Sanford's principles
- **Voice input** — low priority
- **SEO landing pages** — premature without PMF
- **Entity-type selection** — HUMA V2 is person-only
- **Full component graph network** — needs population data
- **12-step linear onboarding wizard** — too many steps

---

## Session Protocol

At END of every session:
1. Update `docs/CURRENT_STATE.md` with current state of every route and known bugs
2. Commit it with the session's other changes

This file is the bridge between CC and the strategic Claude instance.

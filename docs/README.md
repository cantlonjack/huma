# HUMA Documentation

One-page index. Each doc has one job. When in doubt, start from the top.

## Read first (foundational, in order)

| # | Doc | What it answers |
|---|-----|-----------------|
| 1 | [HUMA_EXECUTIVE_THESIS.md](HUMA_EXECUTIVE_THESIS.md) | What HUMA is at its deepest. Commons / steward / interface. Four-level ontology (Axiom → Principle → Framework → Practice). Governance gap. *April 2026 — current authority.* |
| 2 | [HUMA_V2_FOUNDATION.md](HUMA_V2_FOUNDATION.md) | Current product spec. Three product layers (Conversation / Computation / Output). What operators see, how context deepens, pricing. |
| 3 | [HUMA_VISION_AND_STRATEGY.md](HUMA_VISION_AND_STRATEGY.md) | Strategic architecture. Five perceptual capacities, twenty principles, concentric model, multiple mediums, intellectual lineage. Extends the Thesis with content not condensed into it. |

## Positioning

| Doc | What it answers |
|-----|-----------------|
| [UVP.md](UVP.md) | How HUMA presents externally. Locked primary UVP + short forms + audience wedge + rationale. Every landing page, pitch, and email calibrates against this. |

## Read when the work demands it

| Doc | Read when |
|-----|-----------|
| [HUMA_VOICE_BIBLE.md](HUMA_VOICE_BIBLE.md) | Writing user-facing copy, prompts, or any AI response. Load-bearing for every word. |
| [HUMA_ETHICAL_FRAMEWORK.md](HUMA_ETHICAL_FRAMEWORK.md) | Handling edge cases, distress, graduation, consent, anything with operator-wellbeing stakes. |
| [HUMA_CONVERSATION_ARCHITECTURE.md](HUMA_CONVERSATION_ARCHITECTURE.md) | Building or debugging the conversation engine. Modes (Open/Focus/Decompose), marker protocol. |
| [HUMA_DESIGN_SYSTEM.md](HUMA_DESIGN_SYSTEM.md) | Styling, component design, typography, color. |

## Active scaffolding (milestone-scoped)

Live for the 8-phase remediation milestone. Will be archived when the milestone closes.

| Doc | Purpose |
|-----|---------|
| [Remediation-Build-Plan.md](Remediation-Build-Plan.md) | Master phase plan — P0-P8 framing, principles, task breakdowns, success criteria. |
| [PHASES.md](PHASES.md) | Copy-paste phase prompts for fresh sessions. Depends on Remediation-Build-Plan. |
| [ship-quality-plan.md](ship-quality-plan.md) | Polish checklist per phase — UX, accessibility, performance, types. |

## Deferred (not active yet)

| Doc | Status |
|-----|--------|
| [build-plan-typed-rppl-graph.md](build-plan-typed-rppl-graph.md) | Design blueprint for Phase 7 (Deeper Regenerative Model). Re-surface when Phase 7 begins. |

## Archive

Historical reference only. See [archive/](archive/) for:

- `HUMA_INTELLECTUAL_LINEAGE.md` — 14 thinkers HUMA draws from. Attribution record.
- `HUMA_PATTERN_LIBRARY.md` — earlier pattern library draft. Superseded by code + RPPL seeds.
- `rppl-port-audit.md` — completed audit of 89 RPPL seed ports (April 2026).
- `research/synthetic-population/` — 50 synthetic operator profiles with canvases and conversations. UAT reference data.

## Live state (outside docs/)

- `.planning/PROJECT.md` — project metadata, scope, constraints.
- `.planning/REQUIREMENTS.md` — live product spec.
- `.planning/ROADMAP.md` — 8-phase milestone breakdown.
- `.planning/STATE.md` — current position, decisions log, blockers.
- `.planning/phases/` — active phase work.
- `.planning/phases-archive/` — completed phases.
- `.planning/codebase/` — codebase map (ARCHITECTURE, STACK, CONVENTIONS, etc.). Refresh cadence: end of each phase.
- `CLAUDE.md` (repo root) — tech stack, routes, hooks, conventions. Quick reference for build context.
- `workspaces/` (repo root) — task-specific guides (code, design, prompts, planning).
- `prompts/` (repo root) — earlier design explorations for growth work. Mostly folded into phase plans.

## Conventions

- **Surgical edits only.** Do not rewrite foundational docs. Edit in place.
- **Archive, don't delete.** Completed phases and superseded plans move to `archive/` or `phases-archive/`; nothing is lost.
- **One authority per question.** If two docs disagree, the one listed earlier in this index wins. Update the other to match or add a deprecation pointer.

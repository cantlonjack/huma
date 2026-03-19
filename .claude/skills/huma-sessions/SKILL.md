---
name: huma-sessions
description: Use when starting a new work session, when a task seems too large for one session, when asked to plan work, prioritize, or break down a large task. Triggers on what should we do next, prioritize, break this down, where do we start, plan the session, too big.
---

# HUMA Session Planning

## The Problem

Claude Code sessions work best focused on one completable unit. Large tasks fail because context accumulates, changes compound, and verification becomes impossible.

## Session Unit Criteria

A good unit is:

* Completable in one session (10-30 min of CC work)
* Independently verifiable (testable without testing everything)
* Self-contained (no dependency on half-finished prior work)

## Before Any Work

Read the right documents FIRST:

* Visual work → `/docs/HUMA_DESIGN_SYSTEM.md`
* Prompt work → `/docs/HUMA_VOICE_BIBLE.md`
* Feature work → `/docs/HUMA_USER_JOURNEY.md`
* Any work → `/docs/HUMA_ETHICAL_FRAMEWORK.md` §02 (dependency test)

## Session Patterns

### Rebuild a Page

1. Structure + layout (HTML/components, no styling)
2. Design system application (colors, fonts, spacing, animation)
3. Content + copy (text, prompts, microcopy)
4. Responsive + edge cases (mobile, print, errors)

### Add a Feature

1. Data model + types (interfaces, state, hooks)
2. Core component (main visual/interactive element)
3. Integration (wire data, connect API, test flow)
4. Polish (animations, transitions, edge cases)

### Fix the AI Voice

1. Audit — search all prompts for anti-patterns, document findings
2. Rewrite — fix each prompt with Voice Bible open
3. Test — run 2-3 simulated conversations
4. Verify — full preflight voice audit

### Design System Compliance

Single session: systematic sweep, one file at a time

## Breaking Large Tasks into Milestones

Each milestone must be independently deployable and testable.

**Example:** "Split-screen conversation with progressive canvas" →

1. Split-screen layout (CSS grid, two panels, responsive)
2. Message restyling (prose not bubbles, typing indicator, phase dividers)
3. Phase indicator redesign (6 dots, pulse, phase name)
4. Progressive canvas component (empty state + Phase 1)
5. Canvas phases 2-6
6. Prompt updates for `[[CANVAS_DATA:xxx]]` markers
7. Mobile (floating pill + bottom sheet)
8. Integration testing + preflight

## After Every Session

Run the huma-preflight skill for what you just changed.

## Anti-Patterns

* "Let me do everything at once" — always breaks
* Styling before structure
* Skipping the document read (#1 cause of regressions)
* Not running build after changes
* Declaring "done" without verification

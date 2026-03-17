---
description: Generate HUMA release notes and changelogs grouped by architecture layer, written in HUMA's voice. Use when preparing a release, tagging a version, or summarizing recent work.
user_invocable: true
---

# HUMA Changelog Generator

You generate release notes and changelogs that reflect HUMA's architecture and voice.

## How to Run

The user provides a range — either:
- A tag/version: "changelog since v0.2.0"
- A date: "changelog since last week"
- A commit range: "changelog for abc123..HEAD"
- Just "changelog" — you determine the range from the last tag or meaningful milestone

## Process

### 1. Gather Commits

```bash
git log --oneline --no-merges <range>
```

Read every commit message. For commits that touch important files, read the full diff to understand the actual change (commit messages can be misleading).

### 2. Classify by Architecture Layer

Group all changes into HUMA's 4-layer architecture + supporting categories:

**Layer 1: Essence Layer** (prompt changes, conversation flow, voice)
- Changes to `phases.ts` prompts
- Voice refinements
- Phase transition logic
- Opening message changes

**Layer 2: Pattern Library** (enterprise data, RPPL patterns)
- New enterprise templates
- Enterprise template refinements
- RPPL pattern additions
- Pattern library structure

**Layer 3: Enterprise Engine** (financial logic, capital accounting)
- Enterprise reference block generation
- Capital profile calculations
- Financial data updates
- Synergy mapping

**Layer 4: Developmental Partner** (ongoing conversation, context tracking)
- Context accumulation logic
- Document generation
- Map storage/sharing
- Conversation state management

**Supporting:**
- **UI/Design** — Component changes, styling, responsive, print
- **Infrastructure** — API routes, config, dependencies, build
- **Skills/Tooling** — New skills, skill updates, dev workflow
- **Documentation** — Docs, README, CLAUDE.md

### 3. Write the Changelog

Write in HUMA's voice — warm, direct, systems-aware. Not corporate release notes.

#### Format

```markdown
# HUMA [version or date range]

[One sentence capturing the thrust of this release — what moved forward.]

## Essence Layer
- [change description — what it does for the operator, not just what code changed]
- [another change]

## Pattern Library
- [change]

## Enterprise Engine
- [change]

## Developmental Partner
- [change]

## UI & Design
- [change]

## Infrastructure
- [change]

## Skills & Tooling
- [change]

---

[Optional: one sentence about what's next or what this release sets up]
```

### Writing Rules

1. **Operator-facing changes first.** Lead with what the person using HUMA will notice.
2. **Name the WHY.** Not "updated ikigai prompt" but "ikigai phase now asks one question at a time, giving operators room to think."
3. **Skip noise.** Typo fixes, dependency bumps, and trivial refactors don't need entries unless they fixed real bugs.
4. **Group related commits.** Five commits that together add a new enterprise template = one changelog entry, not five.
5. **No jargon.** Write as if the operator might read this. They won't understand "refactored buildFullPrompt HOF" but they will understand "the conversation engine now carries your landscape reading forward more accurately."
6. **Be honest about breaking changes.** If localStorage maps from before this version won't load, say so.
7. **Credit the lineage.** If a change was inspired by a specific tradition (e.g., "added Savory-style testing decision framework"), name it.

### Examples

Bad: "Updated enterprise-templates.ts with new template"
Good: "Added cut flower enterprise template — numbers from Curtis Stone and USDA floriculture data, strong Cultural and Experiential capital profile, synergizes with market garden and farm store"

Bad: "Fixed bug in phase transitions"
Good: "Fixed a bug where the landscape-to-enterprise transition could fire before soils were discussed, breaking the Regrarians sequence"

Bad: "Various UI improvements"
Good: "Enterprise cards now show capital bar charts at a glance — no more scrolling to see which capitals each enterprise builds"

## Omit Empty Sections

If a layer has no changes, don't include it. A release might only touch the Essence Layer and UI — that's fine, just show those two sections.

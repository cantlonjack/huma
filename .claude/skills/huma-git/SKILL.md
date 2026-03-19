---
name: huma-git
description: Use for any git operation in HUMA — reviewing diffs before commit, creating architecture-aware commits, reviewing PRs. Classifies changes by HUMA's 4-layer architecture, voice-checks prompt/copy changes, validates enterprise templates, and enforces commit conventions. Triggers on commit, diff, review, PR, merge, staged, what changed.
---

# HUMA Git Workflow

Three modes, designed to be used in sequence: Review → Commit → PR Review.

## Layer Classification (used in all modes)

Every changed file maps to a HUMA architecture layer:

| Layer | Files | Prefix |
|-------|-------|--------|
| Engine | `app/src/engine/*` | `engine:` |
| Prompts | Prompt strings in `phases.ts` | `prompt:` |
| Enterprise | `enterprise-templates.ts` | `enterprise:` |
| UI | `app/src/components/*`, `page.tsx`, `globals.css` | `ui:` |
| API | `app/src/app/api/*` | `api:` |
| Docs | `docs/*`, `*.md` (non-skill) | `docs:` |
| Skills | `.claude/skills/*` | `skill:` |
| Config | `package.json`, `tsconfig.json`, `next.config.*` | `config:` |
| Patterns | `src/patterns/*` | `pattern:` |

## Mode 1: Diff Review

**Invoked by:** "review my changes", "diff review", "what am I about to commit"

### Steps

1. `git status` + `git diff --staged` (or `git diff` if nothing staged)
2. **Change Map:** List files with [M]odified/[A]dded/[D]eleted + layer
3. **Layer Summary:** One sentence per layer touched
4. **Voice Check:** If prompt/copy files changed, scan MODIFIED LINES ONLY
5. **Template Check:** If enterprise data changed, validate completeness
6. **Concerns:** Flag unfinished work, scope creep, missing files, sensitive data
7. **Commit Suggestion:** What to stage, message draft, whether to split

### Output

```
═══ HUMA DIFF REVIEW ═══
CHANGE MAP: [files + layers]
LAYERS: [summaries]
VOICE: [CLEAN / X violations]
TEMPLATES: [N/A / VALID / X issues]
CONCERNS: [NONE / X items]
SUGGESTED COMMIT: [message + staging advice]
READY: [YES / FIX FIRST]
═══════════════════════
```

## Mode 2: Commit

**Invoked by:** "commit", running huma-commit, or after diff review approval

### Steps

1. Classify changes by layer (if not already done in diff review)
2. Voice-lint modified prompt/copy files (report violations, don't silently commit them)
3. Validate enterprise templates if changed
4. Suggest `npx tsc --noEmit` if engine TS changed (don't block, just flag)
5. Draft commit message
6. Show for approval, then execute

### Commit Message Format

```
<prefix>: <imperative summary under 72 chars>

<optional body: what and why, wrapped at 72 chars>

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Prefix rules:** Use dominant layer prefix. Mixed prompt+engine → prefer `prompt:` (prompts ARE the product). Spanning 2+ layers → note others: `engine: refactor phase transitions (+ ui, api)`

**Message quality:** Imperative mood. Focus on WHY. Name which phase/enterprise/voice rule was affected. Never "various improvements."

### Good Examples

```
prompt: tighten ikigai opening to one question only

The ikigai opener was asking two questions, violating the one-question
voice rule. Simplified to a single open invitation.
```

```
enterprise: add cut-flowers template with Stone/USDA financials

Capital profile: Cultural 4/5, Experiential 4/5, Financial 3/5.
Synergizes with market-garden and farm-store.
```

```
ui: replace "optimize" with "find where the leverage is" on landing page

Voice linter caught forbidden vocabulary in the subtitle.
```

## Mode 3: PR Review

**Invoked by:** "review this PR", "PR review", before merge

### Steps

1. Get diff (`git diff main...HEAD` or `gh pr diff <number>`)
2. Read every changed file in full (not just diff — context matters)
3. Classify by layer, flag if too many layers (suggest split)
4. Voice compliance on all operator-facing text
5. Seven Principles check (Wholeness, Essence Before Action, Nodal, Developmental, Multi-Capital, Permanence-to-Flexibility, Open Knowledge)
6. Enterprise template validation if changed
7. Phase transition integrity if `phases.ts` changed
8. Type safety (any `any` introduced? type assertions?)
9. Design system compliance
10. Breaking change detection

### Output

```
═══ HUMA PR REVIEW ═══
PR: [title/branch]
Files: [count]  Layers: [list]

ARCHITECTURE:    [CLEAN / MULTI — justified / SPLIT RECOMMENDED]
VOICE:           [CLEAN / X violations]
PRINCIPLES:      [list scored UPHOLDS/NEUTRAL/UNDERMINES]
ENTERPRISE:      [N/A / VALID / X issues]
PHASES:          [N/A / INTACT / X issues]
TYPES:           [CLEAN / X concerns]
DESIGN:          [N/A / CONSISTENT / X issues]
BREAKING:        [NONE / X detected]

VERDICT: [APPROVE / REQUEST CHANGES / BLOCK]
ACTION ITEMS: [numbered, severity-ordered]
STRENGTHS: [at least one]
═══════════════════════
```

### Review tone

Direct and specific. Don't soften. But name what's good.
**Bad:** "I notice there might be a small concern..."
**Good:** "Line 47: 'optimize your workflow' — forbidden. Replace with 'find what's working.'"

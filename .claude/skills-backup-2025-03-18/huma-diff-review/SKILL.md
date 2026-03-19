---
description: Review staged or unstaged git changes through HUMA's architectural lens — classifies changes by layer, voice-checks modified copy, validates templates, and flags concerns before you commit. Use when reviewing what you're about to commit.
user_invocable: true
---

# HUMA Diff Review

You review the current working tree changes through HUMA's architectural lens. This is the "look before you commit" skill — lighter than a PR review, focused on what's about to go in.

## How to Run

When the user says "review my changes", "diff review", "what am I about to commit", or just invokes this skill:

1. Run `git status` to see the full picture
2. Run `git diff --staged` for staged changes (if any)
3. Run `git diff` for unstaged changes
4. If nothing is staged, review all unstaged changes as the likely commit candidates

## Review Steps

### 1. Change Map

List every changed file with its architecture layer classification:

```
CHANGED FILES:
  [M] app/src/engine/phases.ts          → Engine/Prompts
  [M] app/src/components/Chat.tsx        → UI
  [A] src/patterns/landscape/keyline.md  → Patterns
  [D] app/src/components/OldWidget.tsx   → UI (deleted)
```

Use git status indicators: [M]odified, [A]dded, [D]eleted, [R]enamed, [?] untracked

### 2. Layer Summary

One sentence per layer touched:
```
LAYERS:
  Prompts — Ikigai phase opening rewritten, holistic context bridge tightened
  UI — Chat placeholder text updated, deleted unused OldWidget
  Patterns — New keyline water system RPPL pattern
```

### 3. Voice Check (if applicable)

If any of these files have changes, scan the MODIFIED LINES ONLY (not the whole file) for voice violations:
- `app/src/engine/phases.ts`
- `app/src/components/*.tsx`
- `app/src/app/page.tsx`
- Any `.md` in `docs/`

Report:
```
VOICE CHECK:
  [CLEAN] — no violations in changed lines
  or
  [2 violations found]
    phases.ts:47 — "optimize" → use "what's working" or "where the leverage is"
    Chat.tsx:12 — "Great question" → remove, just ask the follow-up directly
```

### 4. Template Check (if applicable)

If `enterprise-templates.ts` was modified:
- Validate modified templates for completeness
- Check synergy ID references
- Verify capital scores are 1-5 with notes
- Flag any empty or placeholder values

### 5. Concerns

Flag anything that deserves attention before committing:

- **Unfinished work** — TODO comments, placeholder values, commented-out code in the diff
- **Scope creep** — Changes that don't seem related to each other (suggest splitting)
- **Missing files** — If a component import changed but the imported file isn't in the diff
- **Type risks** — Interface changes that could cascade
- **Untracked files** — Files that git shows as untracked that look like they should be committed (or gitignored)
- **Sensitive data** — API keys, tokens, credentials in the diff (hard block if found)

### 6. Commit Suggestion

Based on the changes, suggest:
- What to stage (if not everything should go in one commit)
- A commit message following huma-commit conventions
- Whether to split into multiple commits

## Output Format

```
═══ HUMA DIFF REVIEW ═══

CHANGE MAP:
  [file list with layer classification]

LAYERS:
  [one sentence per layer]

VOICE CHECK: [CLEAN / X violations]
  [details if any]

TEMPLATE CHECK: [N/A / VALID / X issues]
  [details if any]

CONCERNS: [NONE / X items]
  [numbered list if any]

SUGGESTED COMMIT:
  Stage: [which files]
  Message: [draft message in huma-commit format]
  Split: [yes/no — if yes, suggest how]

READY: [YES / FIX FIRST — list what]
═══════════════════════════
```

## Quick Mode

If the user says "quick diff" — just show the change map, voice check result, and commit suggestion. Skip the detailed analysis.

## Integration with huma-commit

This skill is the "review" step. After approval, the user can invoke `/huma-commit` to execute the commit with the suggested message. The two skills are designed to work in sequence:

1. `/huma-diff-review` — look at what's changing
2. Fix anything flagged
3. `/huma-commit` — commit with proper classification and message

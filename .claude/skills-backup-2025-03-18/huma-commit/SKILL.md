---
description: Create HUMA-aware git commits that categorize changes by architecture layer, voice-lint prompt/copy changes before committing, and enforce commit message conventions. Use instead of raw git commit for any HUMA changes.
user_invocable: true
---

# HUMA Commit

You create git commits that are aware of HUMA's architecture. Every commit is categorized, voice-checked (when relevant), and messaged consistently.

## Before Committing

### 1. Classify Changes by Architecture Layer

Run `git status` and `git diff --staged` (or `git diff` if nothing staged). Classify every changed file into one of HUMA's layers:

| Layer | Files | Prefix |
|---|---|---|
| **Engine** | `app/src/engine/*`, `src/engine/*` | `engine:` |
| **Prompts** | Changes to prompt strings in `phases.ts` | `prompt:` |
| **Enterprise Data** | `enterprise-templates.ts` | `enterprise:` |
| **UI** | `app/src/components/*`, `app/src/app/page.tsx`, `globals.css` | `ui:` |
| **API** | `app/src/app/api/*` | `api:` |
| **Docs** | `docs/*`, `*.md` (non-skill) | `docs:` |
| **Skills** | `.claude/skills/*` | `skill:` |
| **Config** | `package.json`, `tsconfig.json`, `next.config.*`, `tailwind.*` | `config:` |
| **Patterns** | `src/patterns/*` | `pattern:` |

If changes span multiple layers, use the most significant one as primary prefix and note others in the body.

### 2. Voice-Lint Prompt and Copy Changes

If ANY of these files changed, run the voice linter rules before committing:
- `app/src/engine/phases.ts` — scan all modified string literals
- `app/src/components/*.tsx` — scan modified string literals (placeholders, labels, UI copy)
- `app/src/app/page.tsx` — scan modified string literals
- Any `.md` file in `docs/`

**If hard voice violations are found:** Report them and ask the user whether to fix before committing or commit as-is. Do NOT silently commit voice violations in prompt files.

### 3. Validate Enterprise Templates

If `enterprise-templates.ts` changed:
- Check that all templates still have complete fields (no empty strings, no missing scores)
- Check that synergy references point to existing template IDs
- Check that capital scores are 1-5
- Report any issues before committing

### 4. Type-Check on Engine Changes

If any TypeScript file in `app/src/engine/` changed, suggest running `cd app && npx tsc --noEmit` before committing. Don't block — just flag it.

## Commit Message Format

```
<prefix>: <imperative summary under 72 chars>

<optional body: what changed and why, wrapped at 72 chars>

<optional footer: breaking changes, related issues>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### Prefix Rules
- Use the layer prefix from the classification table
- If changes span 2+ layers, use the dominant one: `engine: refactor phase transitions (+ ui, api)`
- For mixed prompt+engine changes, prefer `prompt:` since prompts ARE the product

### Message Quality
- Imperative mood: "add" not "added", "fix" not "fixes"
- Focus on WHY, not WHAT (the diff shows what)
- For prompt changes, name which phase or voice rule was affected
- For enterprise changes, name which enterprise(s)
- Never say "various improvements" or "minor changes" — be specific

### Good Examples
```
prompt: tighten ikigai phase opening to ask one question only

The ikigai phase opener was asking two questions in the first message,
violating the "ask ONE at a time" voice rule. Simplified to a single
open invitation.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

```
enterprise: add cut-flowers template with Perkins/Stone financials

New enterprise template for cut flower production. Numbers sourced from
Curtis Stone's urban farming data and USDA floriculture surveys. Capital
profile emphasizes Cultural (4/5) and Experiential (4/5) alongside
Financial (3/5).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

```
ui: warm up landing page copy, remove "optimize" from subtitle

Voice linter caught "optimize your land" on the landing page. Replaced
with "find where a single move changes everything" which aligns with
HUMA's nodal intervention language.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

## Workflow

1. Stage files (or confirm what to stage with the user)
2. Classify changes by layer
3. Run voice lint if prompt/copy files changed
4. Run template validation if enterprise data changed
5. Suggest type-check if engine TS changed
6. Draft commit message following the format
7. Show the user the full commit for approval
8. Execute the commit

If the user just says "commit" with no further context, run the full workflow above. If they provide a message, still classify and check but use their message as the basis.

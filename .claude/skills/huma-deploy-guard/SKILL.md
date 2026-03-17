---
description: Pre-deploy validation gate for HUMA — runs type-check, build, voice lint on prompts, enterprise template validation, and phase integrity checks. Use before any deploy or merge to main.
user_invocable: true
---

# HUMA Deploy Guard

You run a comprehensive pre-deploy validation checklist. Nothing ships without passing these gates.

## When to Run

- Before merging to main
- Before deploying to production
- Before tagging a release
- When the user says "deploy guard", "pre-deploy", or "ready to ship?"

## The Checklist

Run all checks and report results. Checks are ordered by severity — a failure in an earlier check is more critical.

### Gate 1: TypeScript Compilation (BLOCKING)

```bash
cd app && npx tsc --noEmit
```

**Pass:** Zero errors
**Fail:** List every error with file and line. This is a hard block — nothing else matters if types don't compile.

### Gate 2: Production Build (BLOCKING)

```bash
cd app && npx next build
```

**Pass:** Build completes without errors
**Fail:** Capture the error output. This is a hard block.

### Gate 3: Voice Lint on Prompts (BLOCKING for hard violations)

Read `app/src/engine/phases.ts` and scan ALL string literals against the voice linter rules:

- Forbidden vocabulary (hard violations)
- Therapist-speak anti-patterns (hard violations)
- Consultant-speak (hard violations)
- AI-writing tics (soft violations — warn but don't block)

Also scan:
- `app/src/app/page.tsx` — landing/welcome copy
- `app/src/components/Chat.tsx` — placeholder text, labels
- `app/src/components/MapDocument.tsx` — document rendering copy

**Pass:** Zero hard violations
**Warn:** Soft violations present (report but don't block)
**Fail:** Hard violations found — list each with location and suggested fix

### Gate 4: Enterprise Template Validation (BLOCKING)

Read `app/src/engine/enterprise-templates.ts` and validate every template:

| Check | Requirement |
|---|---|
| Complete fields | No empty strings, no undefined values |
| Financial coherence | Year 3 revenue > Year 1 revenue, margins between 0-100% |
| Capital scores | All scores 1-5, all notes non-empty |
| Synergy integrity | All synergy IDs exist in the template array |
| Source credibility | At least one source per template |
| Scale assumption | Non-empty, specifies units |

**Pass:** All templates valid
**Fail:** List invalid templates with specific issues

### Gate 5: Phase Transition Integrity (BLOCKING)

Read `app/src/engine/phases.ts` and verify:

- All 5 phase prompts present in `PHASE_PROMPTS` record
- `PHASE_TRANSITION_INSTRUCTION` documents all 5 markers
- `buildFullPrompt()` handles all phases
- `buildDocumentPrompt()` accepts all 5 syntheses
- Enterprise reference block injected only during enterprise-map phase
- All `Phase` type values have corresponding prompts

**Pass:** All structural checks pass
**Fail:** List structural issues

### Gate 6: API Route Health (WARNING)

Read `app/src/app/api/chat/route.ts` and verify:
- Uses `buildFullPrompt()` for conversation
- Uses `buildDocumentPrompt()` for document generation
- Streams responses correctly
- Error handling present

**Pass:** Route looks healthy
**Warn:** Potential issues found

### Gate 7: Shared/App Template Sync (WARNING)

Compare `src/engine/enterprise-templates.ts` with `app/src/engine/enterprise-templates.ts`:
- Same number of templates
- Same template IDs
- Same interface definition

**Pass:** Files are in sync
**Warn:** Files have diverged — list differences

### Gate 8: Breaking Change Scan (WARNING)

Check for changes since last commit/tag that could break:
- `ConversationContext` interface changes → localStorage maps may not load
- `Phase` type changes → state machine may break
- `Message` interface changes → chat display may break
- CSS class renames in `globals.css` → component styles may break
- API route shape changes → client fetch calls may break

**Pass:** No breaking changes detected
**Warn:** Potential breaking changes — list them with impact assessment

## Output Format

```
═══ HUMA DEPLOY GUARD ═══
Date: [timestamp]
Branch: [current branch]
Last commit: [hash + message]

GATE 1 — TypeScript:        [PASS / FAIL]
GATE 2 — Production Build:  [PASS / FAIL]
GATE 3 — Voice Lint:        [PASS / WARN (X soft) / FAIL (X hard)]
GATE 4 — Enterprise Data:   [PASS / FAIL]
GATE 5 — Phase Integrity:   [PASS / FAIL]
GATE 6 — API Route:         [PASS / WARN]
GATE 7 — Template Sync:     [PASS / WARN]
GATE 8 — Breaking Changes:  [PASS / WARN]

VERDICT: [CLEAR TO DEPLOY / WARNINGS — REVIEW / BLOCKED — FIX REQUIRED]

[If blocked, list all failures with fix instructions]
[If warnings, list all warnings with context]
[If clear, just say "Ship it."]
═══════════════════════════
```

## Behavior

- Run gates sequentially — if Gate 1 (TypeScript) fails, still run all other gates so the user gets the full picture in one pass
- Never skip gates. The whole point is that this is comprehensive.
- If the user says "quick check" — still run everything but compress the output to pass/fail only
- After reporting, offer to fix any issues that are within your capability (voice violations, template issues, type errors)

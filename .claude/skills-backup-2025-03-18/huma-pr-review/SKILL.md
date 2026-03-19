---
description: Review pull requests against HUMA's 7 principles, voice rules, enterprise template standards, and architectural integrity. Use when opening, reviewing, or preparing a PR.
user_invocable: true
---

# HUMA PR Review

You review pull requests through the lens of HUMA's architecture, principles, and voice contract.

## How to Run

The user provides a PR number, branch name, or says "review this PR." You then:

1. Get the diff (`git diff main...HEAD` or `gh pr diff <number>`)
2. Get the PR description if it exists (`gh pr view <number>`)
3. Read every changed file in full (not just the diff — context matters)
4. Run the review against all dimensions below
5. Produce the review report

## Review Dimensions

### 1. Architecture Layer Classification

Classify all changes using the same layer system as huma-commit:
- Engine, Prompts, Enterprise Data, UI, API, Docs, Skills, Config, Patterns
- Flag if changes span too many layers without clear cohesion (sign of a PR that should be split)

### 2. Voice Compliance (for prompt/copy changes)

If any operator-facing text changed, run the full voice linter:
- Forbidden vocabulary scan
- Therapist-speak anti-pattern scan
- Consultant-speak scan
- AI-writing tic scan
- Overall voice assessment

Report every violation with line reference and suggested fix.

### 3. Seven Principles Check

For each changed file, assess whether the change upholds or undermines HUMA's 7 principles:

1. **Wholeness First** — Does this change fragment something without holding the whole? Does a component change break coherence with the larger flow?
2. **Essence Before Action** — Does any new prompt or UI copy jump to recommendations before understanding context?
3. **Nodal Intervention** — If this adds a feature, is it a leverage point or isolated addition?
4. **Developmental** — Does the change grow operator capacity or create new dependency?
5. **Multi-Capital** — If enterprise data changed, are capital profiles honest and complete?
6. **Permanence-to-Flexibility** — Do any prompt changes violate the Regrarians sequence?
7. **Open Knowledge** — Is knowledge kept as commons, intelligence as product?

Score: UPHOLDS / NEUTRAL / UNDERMINES for each principle that's relevant.

### 4. Enterprise Template Validation (if changed)

For any modified or new enterprise templates:
- All fields complete (no empty strings, no placeholder values)
- Financial ranges are realistic and sourced
- Capital scores 1-5 with substantive notes
- Synergy IDs reference existing templates
- Fit signals are specific enough to differentiate
- Common failure modes are honest, not token
- Sources are real and verifiable

### 5. Phase Transition Integrity (if phases.ts changed)

- Are `[[PHASE:...]]` markers still correctly documented?
- Do phase prompts still follow the right behavioral requirements?
- Is the `buildFullPrompt()` logic still correct?
- Do phase prompts reference accumulated context appropriately?
- Is enterprise reference data still injected only during enterprise-map phase?

### 6. Type Safety

If TypeScript files changed:
- Are there any `any` types introduced?
- Do new interfaces extend existing types correctly?
- Are there type assertions that bypass safety?
- Suggest running `npx tsc --noEmit` if not already done

### 7. UI/UX Coherence (if components changed)

- Does the change use HUMA's design tokens (sand/sage/amber/earth palette)?
- Are fonts correct (Georgia for prose, Inter for UI)?
- No gamification elements (points, badges, streaks, scores)?
- Print styles preserved if MapDocument changed?
- Mobile/desktop parity maintained?

### 8. Breaking Change Detection

Flag any changes that could break:
- ConversationContext shape changes (affects stored maps in localStorage)
- Phase type changes (affects page.tsx state machine)
- API route changes (affects client-side fetch calls)
- Enterprise template interface changes (affects buildEnterpriseReferenceBlock)
- CSS class renames (affects component styling)

## Output Format

```
═══ HUMA PR REVIEW ═══
PR: [title / branch name]
Files changed: [count]
Layers touched: [list]

ARCHITECTURE
  Layer coherence: [CLEAN — single layer / MULTI — justified / SPLIT RECOMMENDED]
  [notes if split recommended]

VOICE COMPLIANCE
  Status: [CLEAN / X violations]
  [violation details if any]

SEVEN PRINCIPLES
  1. Wholeness:    [UPHOLDS / NEUTRAL / UNDERMINES] — [note]
  2. Essence:      [UPHOLDS / NEUTRAL / UNDERMINES] — [note]
  3. Nodal:        [UPHOLDS / NEUTRAL / UNDERMINES] — [note]
  4. Developmental: [UPHOLDS / NEUTRAL / UNDERMINES] — [note]
  5. Multi-Capital: [UPHOLDS / NEUTRAL / UNDERMINES] — [note]
  6. Permanence:   [UPHOLDS / NEUTRAL / UNDERMINES] — [note]
  7. Open Knowledge: [UPHOLDS / NEUTRAL / UNDERMINES] — [note]

ENTERPRISE DATA: [N/A / VALID / X issues]
PHASE INTEGRITY: [N/A / INTACT / X issues]
TYPE SAFETY: [CLEAN / X concerns]
UI COHERENCE: [N/A / CONSISTENT / X issues]
BREAKING CHANGES: [NONE / X detected]

OVERALL VERDICT: [APPROVE / REQUEST CHANGES / BLOCK]

ACTION ITEMS:
  [numbered list of things to fix, ordered by severity]

STRENGTHS:
  [what this PR does well — always include at least one]
═══════════════════════
```

## Review Tone

Be direct and specific. Don't soften criticism with filler. But also name what's good — every PR does something right, and the author should know what to keep doing.

Bad: "I notice that there might be a small concern with the voice here, if that's okay to mention."
Good: "Line 47: 'optimize your workflow' — forbidden vocabulary. Replace with 'find what's working.'"

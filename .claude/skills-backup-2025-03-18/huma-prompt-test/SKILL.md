---
description: Test HUMA phase prompts by simulating operator inputs and evaluating AI output for voice adherence, principle compliance, phase-appropriate behavior, and transition correctness. Use when editing phases.ts or validating prompt changes.
user_invocable: true
---

# HUMA Prompt Tester

You test HUMA's phase prompts against sample operator inputs and evaluate the output for correctness.

## How It Works

1. Read the current prompts from `app/src/engine/phases.ts`
2. Construct a full system prompt using `buildFullPrompt()` logic for the target phase
3. Simulate an operator conversation (or use the user's provided test case)
4. Evaluate the AI's response against HUMA's quality criteria
5. Report a detailed scorecard

## Test Dimensions

### 1. Voice Compliance (pass/fail per rule)
Apply the full HUMA voice linter rules:
- No forbidden vocabulary
- No therapist-speak anti-patterns
- No consultant-speak
- No AI-writing tics
- Warm, direct, systems-aware tone
- Prose over bullets
- Short paragraphs
- Asks ONE question at a time

### 2. Seven Principles Adherence (score 1-5 each)
For each of the 7 non-negotiable principles, score how well the response demonstrates it:
1. **Wholeness First** — Does the response hold the whole in view, or does it fragment?
2. **Essence Before Action** — Does it discover identity before recommending, or jump to solutions?
3. **Nodal Intervention** — Does it search for leverage points, or give isolated advice?
4. **Developmental** — Does it grow the operator's capacity, or create dependency?
5. **Multi-Capital** — Does it reference multiple capitals, or only financial?
6. **Permanence-to-Flexibility** — Does it respect the Regrarians sequence?
7. **Open Knowledge** — Does it apply knowledge to this specific situation, or give generic templates?

Score as: 5=exemplary, 4=good, 3=adequate, 2=weak, 1=violating

### 3. Phase-Appropriate Behavior (pass/fail checklist)
For each phase, check specific behavioral requirements:

**Ikigai Phase:**
- [ ] Opens with warmth, not clinical assessment
- [ ] Asks open, invitational questions
- [ ] Listens for 4 threads (love, skill, world-need, sustainability) without labeling them
- [ ] Spends adequate exchanges (not rushing)
- [ ] Synthesizes essence using operator's own language
- [ ] Bridges naturally to holistic context

**Holistic Context Phase:**
- [ ] Explores quality of life, production forms, future resource base
- [ ] Asks one dimension at a time
- [ ] Names tensions without resolving them
- [ ] References Ikigai throughout
- [ ] Synthesizes as a coherent statement

**Landscape Phase:**
- [ ] Follows Regrarians sequence (permanent → flexible)
- [ ] Conversational, not quiz-like
- [ ] Follows threads naturally when operator jumps layers
- [ ] Connects landscape to essence
- [ ] Synthesizes as a living whole

**Enterprise Map Phase:**
- [ ] Each enterprise rooted in essence + landscape
- [ ] Includes Perkins-style financials (ranges, not false precision)
- [ ] Shows 8 Forms of Capital profile
- [ ] Enterprises reinforce each other (stack synergies)
- [ ] Follows ISRU principle (recombines what's present)
- [ ] Uses reference data but personalizes for this operator

**Nodal Interventions Phase:**
- [ ] Identifies 2-3 high-leverage actions
- [ ] Each action cascades across multiple capitals
- [ ] Time-anchored (this season)
- [ ] Shows cascade chain explicitly
- [ ] Closing reflection mirrors the conversation journey

### 4. Transition Signals (pass/fail)
- [ ] `[[PHASE:...]]` marker present at end of message when transitioning
- [ ] `[[CONTEXT:...]]` synthesis present and rich (not thin summaries)
- [ ] Marker placed AFTER all visible text
- [ ] Transition feels natural, not announced ("now we're moving to Phase 2")
- [ ] Context synthesis uses operator's language

### 5. Anti-Patterns (fail if present)
- Announcing phase transitions explicitly
- Asking multiple questions in one message
- Giving advice before understanding context
- Using generic templates without personalization
- Filling information gaps with assumptions instead of asking
- Breaking Regrarians sequence (e.g., discussing enterprises before water)
- Performing empathy instead of being present

## Running a Test

### Quick Test (single phase)
User says which phase to test. You:
1. Read current `phases.ts`
2. Build the full prompt for that phase
3. Generate 2-3 sample operator messages appropriate to the phase
4. Evaluate what a good response looks like vs what could go wrong
5. Report the scorecard

### Regression Test (all phases)
User says "full test" or "regression." You:
1. Read current `phases.ts`
2. Construct a synthetic operator profile:
   - Name, location, basic situation
   - Responses that test edge cases (vague answers, jumping ahead, emotional content)
3. Walk through all 5 phases, evaluating at each transition
4. Report a full scorecard with phase-by-phase breakdown

### Custom Test
User provides specific operator messages or scenarios. You evaluate the prompt's handling of that specific case.

## Output Format

```
═══ HUMA PROMPT TEST REPORT ═══
Phase: [phase name]
Test type: [quick / regression / custom]

VOICE COMPLIANCE: [PASS / X violations found]
  [list violations if any]

PRINCIPLE SCORES:
  1. Wholeness First:         [score]/5
  2. Essence Before Action:   [score]/5
  3. Nodal Intervention:      [score]/5
  4. Developmental:           [score]/5
  5. Multi-Capital:           [score]/5
  6. Permanence-to-Flex:      [score]/5
  7. Open Knowledge:          [score]/5
  Average: [avg]/5

PHASE BEHAVIOR: [X/Y checks passed]
  [list failures if any]

TRANSITION SIGNALS: [PASS / FAIL]
  [details if failing]

ANTI-PATTERNS: [CLEAN / X found]
  [list if any]

OVERALL: [PASS / NEEDS WORK / FAILING]
PRIORITY FIXES: [ordered list of what to fix first]
═══════════════════════════════
```

## When to Use This Skill

- After editing any prompt in `phases.ts`
- After modifying `buildFullPrompt()` or `buildDocumentPrompt()`
- After changing enterprise templates (could affect enterprise phase quality)
- Before any deploy that touches the prompt engine
- When debugging reported voice or behavior issues

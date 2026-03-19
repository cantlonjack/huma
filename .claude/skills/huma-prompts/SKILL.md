---
name: huma-prompts
description: Use when creating, modifying, debugging, or testing ANY system prompt, phase prompt, transition instruction, or AI behavior. Also use to simulate full conversation flows with synthetic operator profiles. Triggers on any file in engine/prompts*, system prompt, phase prompt, AI response, transition, marker, CANVAS_DATA, CONTEXT marker, simulate, test flow, conversation test.
---

# HUMA Prompt Engineering + Conversation Testing

Read `/docs/HUMA_VOICE_BIBLE.md` and `/docs/HUMA_PATTERN_LIBRARY.md` before modifying any prompt.

## Prompt Assembly Architecture

```
BASE SYSTEM PROMPT (~1,500 tokens — always loaded)
  ↓
PHASE-SPECIFIC PROMPT (~800 tokens — swapped per phase)
  ↓
ACCUMULATED CONTEXT (~200-800 tokens — grows across phases)
  ↓
REFERENCE DATA (~1,000-3,000 tokens — conditional by phase)
  ↓
TRANSITION SIGNALS (~200 tokens — always loaded)
```

Total: 3,500–6,000 tokens. Must leave room for conversation history.

## Base System Prompt Must Include

1. HUMA's identity and posture (fence-post neighbor)
2. Ethical condensation block (from CLAUDE.md)
3. Voice constraints (banned phrases, one-question rule)
4. ISRU principle (reveal what's present, never import solutions)
5. Anti-pattern list

## Phase Prompts Must Include

For each of the 6 phases:

1. What this phase listens for (operator signals)
2. When to transition (specific criteria, not vibes)
3. How to synthesize (`[[CONTEXT:xxx]]` block to emit)
4. Canvas data to emit (`[[CANVAS_DATA:xxx]]` with JSON fields)
5. Emotional tone (from Voice Bible tone arc)
6. Phase-specific voice guidance

## Transition Markers

Three types, all stripped from visible output:

```
[[PHASE:landscape]]                              ← Phase change
[[CONTEXT:holistic-synthesis]]Prose synthesis...  ← Document generation data
[[CANVAS_DATA:holistic]]{"qolStatements":...}    ← Visualization data (JSON)
```

## Common Prompt Bugs

| Symptom | Likely Cause |
|---------|--------------|
| AI asks multiple questions | Phase prompt missing "ask ONE question" |
| AI uses banned phrases | Base prompt anti-pattern list incomplete |
| AI gives generic advice | No reference data injected, or pattern library not referenced |
| Phase transition doesn't fire | Criteria too vague — make specific |
| Canvas data malformed | Phase prompt missing `[[CANVAS_DATA:xxx]]` format spec |
| AI explains the framework | Missing "never explain — let structure teach" |
| AI sounds like therapist | Ethical condensation block missing |
| AI too verbose | No length constraint. Add "2-3 paragraphs maximum" |

## Testing: Quick Test (single phase)

1. Read current `phases.ts`
2. Build full prompt for target phase
3. Generate 2-3 sample operator messages
4. Evaluate response against:

### Voice Compliance (pass/fail per rule)

All forbidden vocabulary, therapist-speak, consultant-speak, AI tics.

### Seven Principles (score 1-5 each)

1. **Wholeness First** — holds the whole in view?
2. **Essence Before Action** — discovers before recommending?
3. **Nodal Intervention** — searches for leverage points?
4. **Developmental** — grows capacity, not dependency?
5. **Multi-Capital** — beyond just financial?
6. **Permanence-to-Flexibility** — respects Regrarians sequence?
7. **Open Knowledge** — specific, not generic?

### Phase Behavior Checklist

**Ikigai:** Warm opening, open questions, listens for 4 threads without labeling, doesn't rush, synthesizes in operator's language.
**Holistic Context:** QoL + production + future resource base, one dimension at a time, names tensions without resolving.
**Landscape:** Follows Regrarians sequence, conversational not quiz-like, connects to essence.
**Enterprise Map:** Rooted in essence + landscape, Perkins-style financials, 8 Capitals profile, enterprises reinforce each other, ISRU principle.
**Nodal Interventions:** 2-3 high-leverage actions, cascade across capitals, time-anchored, closing reflection mirrors journey.

### Anti-Patterns (fail if present)

* Announcing phase transitions ("Now let's move to...")
* Multiple questions per message
* Advice before understanding context
* Generic templates without personalization
* Breaking Regrarians sequence
* Performing empathy instead of being present

## Testing: Full Simulation (all phases)

### Pre-Built Test Profiles

**Profile A: Enthusiastic Beginner**
Maria, 34, rural Vermont, 12 acres former dairy. Left tech, no farming experience. Verbose, jumps between topics.
Tests: handling overwhelm, redirecting without dismissing, sequence enforcement.

**Profile B: Experienced Skeptic**
James, 58, central Oregon, 80 acres cattle. 20 years ranching, skeptical of "regenerative." Terse, practical.
Tests: voice under pressure, financial rigor, respecting existing knowledge.

**Profile C: Community Builder**
Aisha, 41, rural Alabama, 5 acres community land trust. Food sovereignty focus, not personal income.
Tests: multi-capital beyond financial, community-scale patterns.

**Profile D: Edge Case**
Tom, 27, suburban lot, 0.3 acres, renting. No land, dreaming phase.
Tests: pre-land operators, not forcing enterprise recommendations.

### Simulation Process

1. Select or create profile
2. Walk through all phases, generating realistic operator messages
3. Evaluate at each transition: marker present? synthesis rich? natural feeling?
4. Check context accumulation across phases
5. Evaluate document generation quality

### Transition Checks (per transition)

* [ ] `[[PHASE:...]]` marker present after visible text
* [ ] `[[CONTEXT:...]]` synthesis present, 3-5 sentences minimum
* [ ] Synthesis uses operator's own words
* [ ] Transition feels natural, not announced

### Context Accumulation Checks

* [ ] Each phase references prior syntheses
* [ ] Ikigai threads into enterprise selection
* [ ] Holistic context constrains recommendations
* [ ] Landscape requirements match enterprise needs
* [ ] Enterprise synergies reference each other
* [ ] Nodal interventions reference specific enterprises

## Output Format

```
═══ HUMA PROMPT TEST ═══
Phase: [name] | Mode: [quick/full/custom]

VOICE:      [PASS / X violations]
PRINCIPLES: [avg]/5
BEHAVIOR:   [X/Y checks passed]
TRANSITIONS:[PASS / FAIL]
ANTI-PATTERNS: [CLEAN / X found]

OVERALL: [PASS / NEEDS WORK / FAILING]
PRIORITY FIXES: [ordered list]
═══════════════════════
```

## The Golden Rule

If the AI's output doesn't produce the **coherence recognition feeling** — seeing a connection you didn't see before — the prompt is wrong. The content may be accurate. The format may be correct. But if it doesn't make the invisible visible, rewrite it.

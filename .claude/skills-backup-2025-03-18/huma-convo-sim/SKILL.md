---
description: Simulate HUMA's 5-phase conversation flow with synthetic operator profiles to validate phase transitions, context accumulation, marker correctness, and document generation quality. Use when testing the full conversation pipeline.
user_invocable: true
---

# HUMA Conversation Flow Simulator

You simulate HUMA's 5-phase conversation to validate the full pipeline — from first welcome through document generation.

## What This Tests

HUMA's conversation engine (`app/src/engine/phases.ts`) orchestrates a 5-phase flow:
1. **Ikigai** — Purpose discovery (5-8 exchanges)
2. **Holistic Context** — Whole situation (4-6 exchanges)
3. **Landscape** — Regrarians 10-layer reading (8-12 exchanges)
4. **Enterprise Map** — 3-5 enterprise recommendations (3-5 exchanges)
5. **Nodal Interventions** — 2-3 high-leverage seasonal actions (2-3 exchanges)

Each transition emits `[[PHASE:...]]` and `[[CONTEXT:...]]` markers. The 5 context syntheses become the input to `buildDocumentPrompt()` for the final Regenerative Enterprise Map.

## Simulation Modes

### Mode 1: Synthetic Profile Test
Generate a synthetic operator profile and walk through all 5 phases. The profile should include:

```yaml
name: [realistic name]
location: [specific place with known climate/geography]
situation: [why they're here — backstory in 2-3 sentences]
personality: [how they communicate — verbose/terse, emotional/analytical, etc.]
land: [acreage, current state, key features]
experience: [what they know, what they've done]
edge_cases:
  - [specific challenge to test — e.g., "jumps ahead to enterprises during ikigai"]
  - [another challenge — e.g., "gives very short answers"]
```

**Pre-built Test Profiles:**

**Profile A: The Enthusiastic Beginner**
- Maria, 34, rural Vermont, 12 acres of former dairy land
- Left tech career, bought land 6 months ago, no farming experience
- Verbose, excited, jumps between topics, wants to do everything
- Tests: handling overwhelm, redirecting without dismissing, Regrarians sequence enforcement

**Profile B: The Experienced Skeptic**
- James, 58, central Oregon, 80 acres, cattle rancher for 20 years
- Interested in diversification but skeptical of "regenerative" language
- Terse, practical, pushes back on anything that sounds idealistic
- Tests: voice under pressure, financial rigor, respect for existing knowledge

**Profile C: The Community Builder**
- Aisha, 41, rural Alabama, 5 acres, community land trust
- Focus is food sovereignty and youth education, not personal income
- Social/cultural capitals dominate; financial is secondary
- Tests: multi-capital accounting beyond financial, community-scale patterns

**Profile D: The Edge Case**
- Tom, 27, suburban lot, 0.3 acres, still renting
- No land yet, dreaming phase, limited budget
- Tests: handling pre-land operators, not forcing enterprise recommendations

### Mode 2: Specific Phase Test
Test a single phase in isolation. User specifies the phase and optionally provides:
- Accumulated context from prior phases
- Specific operator messages to test against
- Edge cases to probe

### Mode 3: Transition Stress Test
Focus specifically on phase transitions. For each transition:
- Verify `[[PHASE:...]]` marker is present and correctly placed
- Verify `[[CONTEXT:...]]` synthesis is present, rich, and uses operator language
- Verify the transition feels natural (not announced)
- Verify accumulated context carries forward correctly
- Verify `buildFullPrompt()` would construct the right prompt for the next phase

### Mode 4: Document Generation Test
Given a set of 5 context syntheses (real or synthetic), evaluate:
- Does `buildDocumentPrompt()` produce a well-formed prompt?
- Does the resulting document follow the structure in `DOCUMENT_STRUCTURE_PROMPT`?
- Is the document 2,000-3,000 words?
- Does it use the operator's language, not generic templates?
- Are enterprise cards properly formatted with Perkins-style financials?
- Is the 8 Forms of Capital profile honest and specific?
- Does the closing reflection reference the conversation?

## Evaluation Criteria

### Phase Transition Correctness
For each of the 4 transitions (ikigai→holistic, holistic→landscape, landscape→enterprise, enterprise→nodal):

| Check | Pass/Fail |
|---|---|
| `[[PHASE:...]]` marker present | |
| Marker placed after all visible text | |
| `[[CONTEXT:...]]` synthesis present | |
| Synthesis is 3-5 sentences minimum | |
| Synthesis uses operator's own words | |
| Synthesis captures phase-specific content | |
| Transition feels natural in conversation | |
| No explicit phase announcement | |

### Context Accumulation
| Check | Pass/Fail |
|---|---|
| Each phase references prior syntheses | |
| Operator name used naturally | |
| Location context threads through landscape+ | |
| Ikigai threads into enterprise selection | |
| Holistic context constrains enterprise recommendations | |
| Landscape requirements match enterprise landscape needs | |
| Enterprise synergies reference each other | |
| Nodal interventions reference specific enterprises | |

### Conversation Quality
| Check | Pass/Fail |
|---|---|
| Appropriate exchange count per phase | |
| One question per message | |
| Voice consistent throughout | |
| Handles edge cases gracefully | |
| Follows operator's energy (not rigid script) | |
| ISRU principle maintained (no imported solutions) | |

## Running a Simulation

### Quick Command
User says "simulate" or "test flow" — run Profile A through all phases, report scorecard.

### Custom Command
User specifies profile, mode, or focus area. Construct and run accordingly.

### Post-Simulation Report

```
═══ HUMA CONVERSATION FLOW SIMULATION ═══
Profile: [name and summary]
Mode: [synthetic / phase / transition / document]
Phases Tested: [list]

PHASE RESULTS:
  Ikigai:            [PASS/FAIL] — [notes]
  Holistic Context:  [PASS/FAIL] — [notes]
  Landscape:         [PASS/FAIL] — [notes]
  Enterprise Map:    [PASS/FAIL] — [notes]
  Nodal:             [PASS/FAIL] — [notes]

TRANSITIONS:
  ikigai → holistic:      [PASS/FAIL]
  holistic → landscape:   [PASS/FAIL]
  landscape → enterprise: [PASS/FAIL]
  enterprise → nodal:     [PASS/FAIL]

CONTEXT ACCUMULATION: [X/Y checks passed]
  [list failures]

CONVERSATION QUALITY: [X/Y checks passed]
  [list failures]

DOCUMENT GENERATION: [PASS/FAIL]
  Word count: [count]
  Structure compliance: [X/Y sections present]
  Voice: [clean / violations found]

OVERALL: [PASS / NEEDS WORK / FAILING]
PRIORITY FIXES: [ordered list]
═════════════════════════════════════════
```

## Key Files to Read

Before running any simulation, read these files:
- `app/src/engine/phases.ts` — All prompts and build functions
- `app/src/engine/types.ts` — Phase types and ConversationContext
- `app/src/engine/enterprise-templates.ts` — Enterprise reference data
- `app/src/app/page.tsx` — How the app manages state and phase transitions
- `app/src/app/api/chat/route.ts` — How the API constructs prompts

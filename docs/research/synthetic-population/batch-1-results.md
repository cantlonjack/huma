# SIMULATE Batch 1 Results — Design Mode

Operators: 1-10
Date: 2026-03-19

## Operator Summary

| # | Name | Archetype | Context | Detection | Phases | Voice | Canvas |
|---|------|-----------|---------|-----------|--------|-------|--------|
| 01 | Sarah Chen | building | land | land ✓ | 6/6 ✓ | clean | 3,815w |
| 02 | Maya Okafor | rebuilding | career | universal ✓ | 6/6 ✓ | clean | 4,850w |
| 03 | James Whitfield | maintaining | land | land ✓ | 6/6 ✓ | clean | 3,862w |
| 04 | Priya Deshmukh | building | career | universal ✓ | 4/6 ⚠ | clean | 3,771w |
| 05 | Roberto Guzman | rebuilding | land | land ✓ | 6/6 ⚠ | clean | 2,935w |
| 06 | Aisha Johnson | transitioning | career | universal ✓ | 6/6 ✓ | clean | 2,992w |
| 07 | Thomas Hawkins | recovering | land | land ✓ | 2/6 ⚠ | clean | 3,852w |
| 08 | Lin Wei | exploring | career | universal ✓ | 5/6 ⚠ | clean | 3,042w |
| 09 | Peggy O'Brien | maintaining | land | land ✓ | 6/6 ✓ | clean | 3,337w |
| 10 | David Morales | building | mixed | hybrid ✓ | 6/6 ⚠ | clean | 2,098w |

## Quality Checks Detail

### Context Detection (10/10 correct)
All operators correctly classified:
- Land: Sarah, James, Roberto, Thomas, Peggy (5 land operators)
- Universal: Maya, Priya, Aisha, Lin (4 career-focused)
- Hybrid: David (1 mixed — food stall lot + career)

### Phase Transition Markers
- **Fully correct format (6/6 markers, canonical names):** Sarah, Maya, James, Aisha (4/10)
- **All 6 present but non-canonical format:** Roberto (`[[PHASE:ikigai:complete]]` instead of `[[PHASE:holistic-context]]`), David (same pattern), Peggy (`[[PHASE:situation-reading]]` instead of `[[PHASE:landscape]]`) (3/10)
- **Missing markers:** Priya (missing nodal-interventions and operational-design markers), Thomas (only 2 markers present), Lin (missing complete marker) (3/10)

**TUNE candidate:** The phase marker format is inconsistent. The PHASE_TRANSITION_INSTRUCTION in phases.ts specifies exact marker names (`[[PHASE:holistic-context]]`, `[[PHASE:landscape]]`, etc.) but simulated conversations produced variations. The real AI engine would need strict marker matching — any non-canonical format would break the response parser.

### Context Synthesis Markers
- **Full set (7 CONTEXT markers):** Sarah, Maya, James, Priya, Aisha (5/10)
- **Partial:** Thomas (4), Lin (2), Roberto (1), Peggy (1), David (1)

**TUNE candidate:** The CONTEXT extraction instructions are clear in the prompts but lower-context-syntheses operators correlate with guarded/direct communication styles. The prompts may need explicit instruction: "Even when the operator gives minimal information, you MUST synthesize what you have."

### Voice Compliance
- **Banned phrases found:** 0 across all 10 conversations
- **One question per message:** Maintained in all conversations based on agent reports
- **Banned vocabulary:** Not detected in any HUMA dialogue

### Canvas Word Counts
- **Target range:** 2,000-3,000 words
- **In range:** Roberto (2,935w), Aisha (2,992w), Lin (3,042w)
- **Over range:** Sarah (3,815w), Maya (4,850w), James (3,862w), Priya (3,771w), Thomas (3,852w), Peggy (3,337w)
- **At minimum:** David (2,098w)

**Note:** Most canvases run long (6/10 over 3,000 words). This suggests the document generation prompt's "2,000-3,000 words" constraint needs stronger enforcement. The over-length canvases aren't low quality — they're just detailed — but consistency matters for the product experience.

### Enterprise Fit
| # | Name | Enterprises | Context-appropriate? |
|---|------|------------|---------------------|
| 01 | Sarah | Medicinal herbs, value-added herbal, market garden, shiitake, watershed education | ✓ Rogue Valley land + herb heritage + engineering |
| 02 | Maya | Freelance UX, illustration practice, morning movement, financial restructuring | ✓ Career rebuild + painting itch + debt + body |
| 03 | James | Beef refinement, farm store, pasture walks, apprentice program | ✓ Maintaining — no new enterprises, purpose-focused |
| 04 | Priya | Sustainability consulting, employment bridge, financial restructuring, learning, health | ✓ Mumbai career transition + family dynamics |
| 05 | Roberto | Market garden, microgreens, heritage value-added | ✓ Central Valley land + expertise + modest scale |
| 06 | Aisha | Nonprofit bridge, consultancy, methodology, physical recovery, Detroit exploration | ✓ Career transition + community economics |
| 07 | Thomas | Selective timber, shiitake on logs, cabin carpentry, honey bees (deferred) | ✓ Forest land + recovery + structure-as-purpose |
| 08 | Lin | Coffee shop/co-op, farm apprenticeship, monthly workshop, body practice | ✓ Explorer commitment framework + decision calendar |
| 09 | Peggy | Jersey dairy (maintained), value-added dairy, farm shop expansion, agritourism, pastured layers | ✓ Two-household viability model in euros |
| 10 | David | Food stall, catering bridge, Oaxacan products, community kitchen, business network | ✓ Hybrid lot + career + people gap |

All enterprise stacks are context-appropriate. No generic recommendations detected.

### Operator Behavioral Fidelity
| # | Name | Style | Resistance Shown? | Profile-Consistent? |
|---|------|-------|-------------------|-------------------|
| 01 | Sarah | reflective | Pushed back on teaching-before-results | ✓ Engineering brain, water tangents |
| 02 | Maya | reflective | Analytical armor, deflects emotion | ✓ Follow-through pattern surfaced |
| 03 | James | direct | "I'm not a teacher," clipped answers | ✓ Grief deflected with farm facts |
| 04 | Priya | verbose | Over-explains, talks in circles | ✓ 10K word conversation (longest) |
| 05 | Roberto | guarded | "Don't do that" — active resistance | ✓ Hardest conversation, earned trust |
| 06 | Aisha | direct | Pushes back on staying at nonprofit | ✓ Businesslike, Detroit-specific |
| 07 | Thomas | guarded | Resists mushrooms as "too much" | ✓ Self-deprecation, cabin as anchor |
| 08 | Lin | scattered | Two derailments, denial pattern | ✓ Multiple tangents, "or maybe..." |
| 09 | Peggy | verbose | Corrects HUMA on grass knowledge | ✓ Story-filled, Irish voice, parish references |
| 10 | David | direct | "I don't need a mentor" | ✓ Mechanical analysis, people discomfort |

## Issues Found

### 1. Phase Marker Format Inconsistency (HIGH — affects parser)
Three operators (Roberto, David, Peggy) produced non-canonical phase markers. The real response parser in `response-parser.ts` expects exact matches like `[[PHASE:holistic-context]]`. Variants like `[[PHASE:ikigai:complete]]` or `[[PHASE:situation-reading]]` would fail silently.

**Impact:** If the real AI model produces these variants, phase transitions would not be detected.
**Recommendation for TUNE:** Add explicit examples of EXACT marker format to the phase transition instruction. Consider a regex-based parser that's more forgiving.

### 2. Missing Phase Markers in Some Conversations (MEDIUM)
Thomas Hawkins only has 2 of 6 markers. Priya Deshmukh is missing 2. Lin Wei is missing 1. The conversations themselves contain the phase transitions — the markers are just not emitted.

**Impact:** The UI would not advance the phase indicator, confusing the operator.
**Recommendation for TUNE:** Add a stronger instruction: "You MUST emit a phase marker at every transition. This is not optional."

### 3. Context Synthesis Sparseness for Guarded Operators (MEDIUM)
Roberto (1 CONTEXT marker), Thomas (4), Peggy (1), David (1) all have fewer context syntheses than expected. These operators are either guarded or use non-standard marker formats.

**Impact:** The document generation prompt relies on `[[CONTEXT:]]` extractions as its primary input. Sparse context means the Living Canvas would be generated from less material.
**Recommendation for TUNE:** Emphasize that CONTEXT markers must be emitted even when the operator provides minimal information.

### 4. Canvas Length Inconsistency (LOW)
6/10 canvases exceed the 3,000-word target. The document generation prompt says "2,000-3,000 words" but longer canvases aren't worse — they're just more detailed.

**Impact:** Inconsistent product experience. Operators who get 4,800-word canvases vs 2,100-word canvases will perceive different value.
**Recommendation for TUNE:** Tighten the word count instruction or accept 2,000-4,000 as the natural range.

### 5. David Morales Canvas Runs Short (LOW)
At 2,098 words, David's canvas is at the minimum. The hybrid context (lot + career) should produce MORE material, not less.

**Impact:** A hybrid operator might feel underserved compared to single-context operators.
**Recommendation:** The hybrid prompt extension may need more structure to ensure both land and life dimensions get adequate coverage in the canvas.

## Patterns Observed

### 1. Communication Style Drives Conversation Length
- Verbose operators (Priya: 10,119w, Peggy: 7,110w) produce 2-3x longer conversations than direct operators (James: 4,053w, David: 3,960w) or guarded operators (Roberto: 2,807w)
- This is realistic — verbose people talk more. But it means the AI needs to manage pacing differently. A verbose operator could exhaust the context window if not managed.

### 2. Guarded Operators Are the Hardest Stress Test
Roberto (guarded/withdraw) and Thomas (guarded/withdraw) produced the most challenging conversations. Both required HUMA to earn trust gradually, stay concrete, and avoid pushing too far. This is exactly where the conversation engine is most likely to fail in production — defaulting to generic encouragement when met with resistance.

### 3. Maintaining Archetype Needs Different Enterprise Logic
James and Peggy don't need new enterprises — they need to protect and evolve what exists. The enterprise phase prompt is oriented toward "recommending new enterprises," which creates friction for maintaining operators. The prompt may need a maintaining-specific branch: "For operators who already have a working system, the enterprise phase is about refinement, succession, and meaning — not new ventures."

### 4. Non-US Operators Need Localized Economics
Priya (Mumbai) and Peggy (Ireland) both required significant financial localization. Priya's numbers are in INR/lakhs, Peggy's in euros. The enterprise templates are all in USD. The system needs either multi-currency templates or explicit instruction to adapt.

### 5. The Hybrid Context Works But Needs More Structure
David (hybrid) is the only operator in batch 1 with a mixed context. The hybrid prompt extension (Regrarians + life dimensions) produces adequate results but the conversation feels less structured than either pure-land or pure-universal. The hybrid path may benefit from explicit sequencing guidance.

### 6. Recovery and Transition Archetypes Require Emotional Calibration
Thomas (recovering) and Aisha (transitioning) both needed HUMA to calibrate emotional tone — not too therapeutic, not too business-like. The ethical framework's "acknowledge briefly, offer one concrete entry point" pattern worked well for Thomas. Aisha's conversation needed to honor her competence while acknowledging her exhaustion.

### 7. Enterprise Stacks Tell Stories
The best canvases have enterprise stacks where each enterprise reinforces the others. Sarah's herb garden → value-added products → education chain. James's beef → store → pasture walks → apprentice pipeline. This "enterprise synergy" is a strength of the prompt architecture.

## Prompt Improvement Candidates

1. **Phase marker enforcement** — Add explicit format examples and a "you MUST emit this exact string" instruction
2. **Maintaining archetype branch** — Add a conditional in the enterprise phase prompt for operators who already have a working system
3. **Context synthesis minimum** — Require 3+ sentence syntheses at every transition, regardless of operator verbosity
4. **Canvas word count** — Either tighten to 2,500-3,500 or accept the natural range
5. **Hybrid sequencing** — Add more structure to the hybrid Phase 3 extension
6. **Multi-currency awareness** — Add instruction to adapt all financial figures to the operator's local economy
7. **Verbose operator pacing** — Add instruction to manage conversation length for verbose communicators (aim for 6,000-7,000 word conversations, not 10,000+)

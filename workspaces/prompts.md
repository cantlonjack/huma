# Prompts Workspace

Full spec: `docs/HUMA_CONVERSATION_ARCHITECTURE.md` | Voice: `docs/HUMA_VOICE_BIBLE.md`

## Conversation Flow
1. **Receive** — Acknowledge in one sentence, ask first context question. No preamble.
2. **Context Questions** (2-6 exchanges) — One question per message. Always. Tappable options when bounded.
3. **Reflect + Confirm** — 2-3 specific sentences using operator's words. "That the right picture?"
4. **Decompose** — THIS WEEK (max 4, first is trigger) / COMING UP / LONGER ARC
5. **Present** — Checkable behaviors. Operator commits, redirect to /today.

## Marker Protocol (V2)
Parsed by `lib/parse-markers-v2.ts`. All markers are embedded in streamed Claude responses and stripped from display text.

| Marker | Payload | Purpose |
|--------|---------|---------|
| `[[OPTIONS:["a","b","c"]]]` | JSON string array | Tappable response options |
| `[[CONTEXT:{"body":{...}}]]` | JSON object (9-dimension) | Extracted context merged into operator model |
| `[[ASPIRATION_NAME:"title"]]` | Quoted string | Clarified aspiration title |
| `[[DECOMPOSITION:{...}]]` | JSON decomposition object | Full phased decomposition (this_week/coming_up/longer_arc) |
| `[[BEHAVIORS:[...]]` | JSON behavior array | This-week behaviors (also extracted from DECOMPOSITION) |
| `[[ACTIONS:[...]]]` | JSON action array | Specific daily actions |
| `[[REORGANIZATION:{...}]]` | JSON object | Aspiration reorganization data |
| `[[DECISION:{...}]]` | JSON object | Operator decision captured |

**Note:** Legacy `lib/markers.ts` uses a different format (`[[PHASE:value]]`, `[[CONTEXT:type:value]]`). New prompts should use the V2 markers above.

## Prompt Assembly
System prompts are assembled by `lib/services/prompt-builder.ts`. Key modes:
- **Open Mode** — Natural conversation, context building. One question per message. Tappable options when bounded.
- **Focus Mode** — Planning a specific aspiration. Readiness check, 2-6 focused questions, reflect-back, decompose.
- **Decomposition** — Outputs phased behavior plan with dimensional mappings.

The prompt builder takes: aspirations, known context, recent messages, completeness scores, archetypes, WHY statement, day count, and conversation stage. Context completeness scoring guides which dimensions to explore.

## Prompt Files
- `app/src/lib/services/prompt-builder.ts` — System prompt assembly (all modes)
- `app/src/engine/phases.ts` — Phase prompts and transition logic
- `app/src/app/api/v2-chat/route.ts` — Chat endpoint (streaming + markers)
- `app/src/app/api/sheet/route.ts` — Sheet compilation prompt
- `app/src/app/api/insight/route.ts` — Insight generation prompt
- `app/src/app/api/nudge/route.ts` — Nudge generation prompt
- `app/src/app/api/whole-compute/route.ts` — Archetype + WHY computation

## Voice
Fence-post neighbor. Warm, direct, specific, spare. One question per message. Never explain methodology. Say the minimum — the space around the words is part of the message.

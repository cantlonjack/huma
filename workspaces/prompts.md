# Prompts Workspace

Full spec: `docs/HUMA_CONVERSATION_ARCHITECTURE.md` | Voice: `docs/HUMA_VOICE_BIBLE.md`

## Conversation Flow
1. **Receive** — Acknowledge in one sentence, ask first context question. No preamble.
2. **Context Questions** (2-6 exchanges) — One question per message. Always. Tappable options when bounded.
3. **Reflect + Confirm** — 2-3 specific sentences using operator's words. "That the right picture?"
4. **Decompose** — THIS WEEK (max 4, first is trigger) / COMING UP / LONGER ARC
5. **Present** — Checkable behaviors. Operator commits, redirect to /today.

## Marker Protocol
Streamed responses contain `[[MARKER:marker_type:data]]` — parsed client-side, routed to handlers (context storage, aspiration creation, decomposition rendering).

## Prompt Files
- `app/src/engine/phases.ts` — Phase prompts and transition logic
- `app/src/app/api/v2-chat/route.ts` — System prompt assembly
- `app/src/app/api/sheet/route.ts` — Sheet compilation prompt
- `app/src/app/api/insight/route.ts` — Insight generation prompt

## Voice
Fence-post neighbor. Warm, direct, specific, spare. One question per message. Never explain methodology. Say the minimum — the space around the words is part of the message.

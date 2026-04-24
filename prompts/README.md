# HUMA Build Prompts — "Open the Door"

> **STATUS — earlier design exploration (2026-04).** These prompts were the first pass at growth/polish work. Most of the scope has been folded into the current 8-phase milestone: `docs/Remediation-Build-Plan.md` is the master plan, `docs/PHASES.md` has the copy-paste prompts per phase, and `.planning/phases/` holds live phase execution. Use those first. Prompts here remain readable for additional detail the phase plans don't reproduce.

Six prompts to take HUMA from brilliant-but-invisible to product-people-talk-about.

## Execution Order

These are ordered by dependency and impact. Some can run in parallel.

```
Phase 1 (Foundation) — Do first, in parallel
├── 01-instrumentation.md      ← Event tracking (no dependencies)
├── 04-landing-page.md         ← Landing page (no dependencies)
└── 05-ai-cost-sustainability.md ← API cost reduction (no dependencies)

Phase 2 (Experience) — After Phase 1
├── 02-onboarding-time-to-value.md ← Sheet preview in onboarding
│                                    (benefits from instrumentation)
└── 06-shareable-daily-sheet.md    ← Visual polish + share flow
                                    (benefits from instrumentation)

Phase 3 (Retention) — After Phase 2
└── 03-whole-weekly-ritual.md  ← Weekly review ritual
                                 (benefits from share flow patterns)
```

## Why This Order

1. **Instrumentation first** because everything else is guesswork without data.
2. **Landing page first** because it costs nothing to build and immediately unblocks top-of-funnel.
3. **Cost sustainability first** because it's infrastructure — better to have it before traffic grows.
4. **Onboarding + shareability second** because these are the conversion and virality levers.
5. **Weekly ritual last** because it's a retention feature — you need people first.

## Prompt Format

Each prompt contains:
- **Objective** — What and why, in 2 sentences
- **Architecture** — Technical approach with exact file paths, function signatures, data shapes
- **Files to Create/Modify** — Explicit table of every file touched
- **Design Constraints** — Visual rules from the HUMA design system
- **Verification** — How to confirm it works

Each prompt is self-contained — hand it to Claude Code and it has everything it needs.

# HUMA

Life infrastructure — shows how the parts of your life connect and which daily behaviors are the leverage points.

## Tech Stack
- Next.js 14+ (App Router), TypeScript, Tailwind CSS
- Claude API (Sonnet for conversation/sheet/insight, Haiku for palette)
- Supabase (PostgreSQL + Auth), Upstash Redis (KV cache)
- Deployed on Vercel at huma-two.vercel.app

## Structure
- /app/src — Application code (components, lib, app routes, API routes)
- /docs — Foundational documents (design system, voice bible, ethical framework, etc.)
- /workspaces — Context files for each workspace (Layer 2)
- /.claude/skills — Custom skills (Layer 3)
- /supabase — Database migrations

## Routing
| Task | Read | Skip | Skills |
|------|------|------|--------|
| Build feature / fix bug | workspaces/code.md | design, planning, prompts | huma-preflight, huma-git |
| Design / styling / UI | workspaces/design.md, workspaces/code.md | planning, prompts | huma-design |
| Voice / prompts / conversation | workspaces/prompts.md | code, planning | huma-prompts, huma-voice |
| Roadmap / session planning | workspaces/planning.md | code, prompts | huma-sessions, huma-changelog |
| Deploy / preflight | workspaces/code.md | design, planning, prompts | huma-preflight |
| Full build session | workspaces/code.md, workspaces/design.md | prompts | huma-sessions, huma-git |

## Naming Conventions
- Components: PascalCase (e.g., DecompositionPreview.tsx)
- Lib files: kebab-case (e.g., sheet-compiler.ts)
- API routes: kebab-case dirs (e.g., api/v2-chat/route.ts)
- localStorage keys: huma-v2-{purpose} (e.g., huma-v2-aspirations)
- Specs: feature-name_spec.md
- Decision records: YYYY-MM-DD-decision-title.md

## The Single Test
Before building anything: **Does this reduce cognitive load and reveal connections?**

## Session Protocol
At END of every session: commit session changes. Current state lives in `workspaces/code.md` — update it only if routes, API, components, or data layer changed structurally.

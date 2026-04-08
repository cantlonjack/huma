# HUMA

Life infrastructure — shows how the parts of your life connect and which daily behaviors are the leverage points.

## Tech Stack
- Next.js 14+ (App Router), TypeScript, Tailwind CSS
- Claude API (Sonnet for conversation/sheet/insight, Haiku for palette)
- Supabase (PostgreSQL + Auth), Upstash Redis (KV cache)
- Deployed on Vercel at huma-two.vercel.app

## Structure
- /app/src — Application code
- /docs — Foundational documents (design system, voice bible, ethical framework, etc.)
- /supabase — Database migrations

## Workspace Routing
| Task | Read first |
|------|-----------|
| Build feature / fix bug | workspaces/code.md |
| Design / styling / UI | workspaces/design.md |
| Voice / prompts / conversation | workspaces/prompts.md |
| Roadmap / session planning | workspaces/planning.md |

## Naming Conventions
- Components: PascalCase — Lib files: kebab-case — API routes: kebab-case dirs
- localStorage keys: huma-v2-{purpose}

## The Single Test
Before building anything: **Does this reduce cognitive load and reveal connections?**

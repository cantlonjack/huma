# Codebase Structure

**Analysis Date:** 2026-03-17

## Directory Layout

```
C:\HUMAHUMA/
├── .claude/                    # Claude Code config & custom skills
│   └── skills/                 # 29 custom Claude skills (prompt files)
├── .planning/                  # GSD planning documents
│   └── codebase/               # Architecture analysis docs
├── app/                        # Next.js application (the deployable unit)
│   ├── .next/                  # Next.js build output (generated)
│   ├── node_modules/           # Dependencies (generated)
│   ├── public/                 # Static assets (default Next.js SVGs)
│   ├── src/                    # All application source code
│   │   ├── __tests__/          # Vitest test files
│   │   ├── app/                # Next.js App Router pages & API routes
│   │   │   ├── api/            # Server-side API endpoints
│   │   │   │   ├── chat/       # Claude conversation API
│   │   │   │   └── maps/       # Map CRUD (Redis storage)
│   │   │   │       └── [id]/   # Dynamic map retrieval
│   │   │   └── map/            # Map display pages
│   │   │       ├── [id]/       # Shared map page (dynamic)
│   │   │       └── sample/     # Sample map page (static)
│   │   ├── components/         # React UI components
│   │   │   └── canvas/         # Living Canvas visualization components
│   │   ├── engine/             # Prompt architecture & type definitions
│   │   └── lib/                # Utility functions
│   ├── eslint.config.mjs       # ESLint config
│   ├── next.config.ts          # Next.js config (minimal)
│   ├── package.json            # Dependencies & scripts
│   ├── postcss.config.mjs      # PostCSS config (Tailwind)
│   ├── tsconfig.json           # TypeScript config
│   └── vitest.config.ts        # Test runner config
├── docs/                       # Product documentation (north star)
│   ├── references/             # Design reference HTML files
│   ├── HUMA_FOUNDATIONAL_TRUTH.md
│   ├── HUMA_TECHNICAL_SPECIFICATION.md
│   ├── HUMA_DESIGN_CLARIFICATION.md
│   └── HUMA_INTELLECTUAL_LINEAGE.md
├── src/                        # Canonical engine files (upstream)
│   └── engine/                 # Authoritative prompts & templates
├── CLAUDE.md                   # Project instructions for Claude
└── .gitignore                  # Git ignore rules
```

## Directory Purposes

**`app/src/app/` (Next.js App Router):**
- Purpose: Pages and API route handlers
- Contains: `page.tsx` (root SPA), `layout.tsx` (root layout with fonts), `globals.css` (design tokens + custom CSS), API routes, map pages
- Key files:
  - `app/src/app/page.tsx`: The entire main application -- landing, welcome, conversation, generating, and map states. ~750 lines.
  - `app/src/app/layout.tsx`: Root layout with Google Fonts (Cormorant Garamond + Source Sans 3) and Vercel Analytics
  - `app/src/app/globals.css`: Tailwind import, custom color tokens (@theme), animations, enterprise card styles, print styles

**`app/src/app/api/chat/` (Chat API):**
- Purpose: Server-side Claude API proxy with rate limiting
- Contains: Single `route.ts` with POST handler
- Key file: `app/src/app/api/chat/route.ts` -- handles conversation messages, document generation, and canvas data generation via different request flags

**`app/src/app/api/maps/` (Maps API):**
- Purpose: Map persistence via Upstash Redis
- Contains: `route.ts` (POST -- create map), `[id]/route.ts` (GET -- retrieve map)
- Key detail: Maps stored with 90-day TTL, ID generated as `Date.now().toString(36) + random`

**`app/src/app/map/[id]/` (Dynamic Map Page):**
- Purpose: Display shared/saved maps
- Contains: `page.tsx` (server component with OG metadata), `MapClient.tsx` (client component with localStorage/API loading)
- Pattern: Server component generates metadata from search params, delegates rendering to client component

**`app/src/app/map/sample/` (Sample Map Page):**
- Purpose: Static example map for marketing/demo
- Contains: `page.tsx` (metadata), `SampleMapClient.tsx` (renders static data from `lib/sample-map.ts`)

**`app/src/components/` (UI Components):**
- Purpose: Reusable React components for conversation and map display
- Contains: 5 top-level components + 12 canvas sub-components
- Key files:
  - `Chat.tsx`: Message list, streaming display, input form with phase-specific placeholders
  - `MapDocument.tsx`: Markdown-to-styled-HTML renderer using react-markdown with custom component overrides
  - `MapPreview.tsx`: Sidebar/floating panel showing accumulated context during conversation
  - `PhaseIndicator.tsx`: Progress indicator showing 6-phase dots
  - `ShapeChart.tsx`: SVG radar/spider chart for 8 Forms of Capital visualization

**`app/src/components/canvas/` (Living Canvas Components):**
- Purpose: Spatial visualization of the map output (the "Canvas" view vs "Document" view)
- Contains: 12 components, one per canvas section
- Key files:
  - `LivingCanvas.tsx`: Orchestrator that composes all canvas sections from `CanvasData`
  - `EssenceCore.tsx`: Center element with breathing glow animation
  - `QoLRing.tsx`, `ProductionRing.tsx`, `ResourceRing.tsx`: Pill-based ring displays (sage, amber, sky colors)
  - `CapitalConstellation.tsx`: SVG circle constellation sized by capital scores
  - `FieldLayers.tsx`: Horizontal strip showing Regrarians 10-layer stack with status badges
  - `EnterpriseCards.tsx`: Card grid with role-based color coding, financial micro-ledgers, capital dots
  - `NodalActions.tsx`: Intervention cards with cascade chain visualization
  - `WeeklyRhythm.tsx`: 7-day grid with time blocks color-coded by enterprise
  - `ValidationProtocol.tsx`: QoL validation check cards
  - `CanvasClosing.tsx`: Closing message and HUMA attribution
  - `RingLabel.tsx`: Section divider with centered label

**`app/src/engine/` (Prompt Architecture):**
- Purpose: The core product -- system prompts, phase instructions, enterprise data, type definitions
- Contains: 6 TypeScript files
- Key files:
  - `phases.ts`: Base system prompt, phase-specific prompts, phase transition marker instructions, document generation prompt, opening message variants. **This file IS the product.**
  - `operational-prompts.ts`: QoL decomposition instructions, enterprise-QoL validation, nodal operational chains, Phase 6 operational design prompt, document section for operational content
  - `enterprise-templates.ts`: 14 enterprise templates with Perkins-style financials, capital profiles, landscape requirements, fit signals. ~79K characters.
  - `canvas-prompt.ts`: Prompt that instructs Claude to generate structured `CanvasData` JSON
  - `canvas-types.ts`: TypeScript interfaces for the canvas data structure (`CanvasData`, `EnterpriseCard`, `NodalIntervention`, etc.)
  - `types.ts`: Core types -- `Phase`, `PhaseInfo`, `PHASES` array, `Message`, `ConversationContext`

**`app/src/lib/` (Utilities):**
- Purpose: Shared helper functions
- Contains: 5 utility modules
- Key files:
  - `markers.ts`: `cleanForDisplay()` and `parseMarkers()` -- strip/extract `[[PHASE:...]]` and `[[CONTEXT:...]]` markers from AI responses
  - `persistence.ts`: `saveConversation()`, `loadConversation()`, `clearConversation()` -- localStorage wrapper
  - `analytics.ts`: `trackEvent()` -- thin wrapper around Vercel Analytics `track()`
  - `clipboard.ts`: `copyCurrentUrl()` -- Clipboard API with legacy fallback
  - `sample-map.ts`: Static `SAMPLE_MAP_MARKDOWN` string and `SAMPLE_CANVAS_DATA` object for the sample map page

**`src/engine/` (Canonical Engine):**
- Purpose: Authoritative/upstream versions of prompt files
- Contains: `prompts.ts`, `operational-prompts.ts`, `enterprise-templates.ts`
- Note: These are duplicated into `app/src/engine/`. The app imports from `app/src/engine/`. See CONCERNS.md for duplication risk.

**`docs/` (Product Documentation):**
- Purpose: North star vision, technical spec, design records
- Contains: 4 markdown docs + 2 HTML design references
- Key files:
  - `HUMA_FOUNDATIONAL_TRUTH.md`: The WHY -- vision, medium definition, market
  - `HUMA_TECHNICAL_SPECIFICATION.md`: The HOW -- architecture, data model, build sequence
  - `references/huma_living_canvas.html`: Canvas design reference (match this)
  - `references/huma_map_reference.html`: Document/print view design reference

## Key File Locations

**Entry Points:**
- `app/src/app/page.tsx`: Main application (landing + conversation + map)
- `app/src/app/layout.tsx`: Root layout (fonts, analytics, global CSS)
- `app/src/app/api/chat/route.ts`: Chat API endpoint
- `app/src/app/api/maps/route.ts`: Map storage endpoint

**Configuration:**
- `app/package.json`: Dependencies and scripts
- `app/tsconfig.json`: TypeScript config with `@/*` -> `./src/*` path alias
- `app/vitest.config.ts`: Test config with same `@` alias
- `app/next.config.ts`: Next.js config (currently empty/default)
- `app/postcss.config.mjs`: PostCSS with Tailwind
- `app/eslint.config.mjs`: ESLint with next config
- `app/.env.local`: Environment variables (exists, not read)
- `CLAUDE.md`: Project instructions for AI development

**Core Logic:**
- `app/src/engine/phases.ts`: System prompt construction (the product)
- `app/src/engine/operational-prompts.ts`: QoL decomposition + Phase 6 prompts
- `app/src/engine/enterprise-templates.ts`: 14 enterprise reference templates
- `app/src/engine/canvas-prompt.ts`: Canvas JSON generation prompt
- `app/src/engine/types.ts`: Phase, Message, ConversationContext types
- `app/src/engine/canvas-types.ts`: CanvasData structured type
- `app/src/lib/markers.ts`: AI response marker parsing

**Testing:**
- `app/src/__tests__/enterprise-templates.test.ts`: Enterprise template validation
- `app/src/__tests__/markers.test.ts`: Marker parsing tests
- `app/src/__tests__/persistence.test.ts`: localStorage persistence tests
- `app/src/__tests__/phases.test.ts`: Phase prompt building tests

## Naming Conventions

**Files:**
- React components: PascalCase (`Chat.tsx`, `MapDocument.tsx`, `LivingCanvas.tsx`)
- Engine/lib modules: kebab-case (`canvas-prompt.ts`, `enterprise-templates.ts`, `sample-map.ts`)
- API routes: `route.ts` (Next.js App Router convention)
- Tests: `{name}.test.ts` in `__tests__/` directory
- Next.js pages: `page.tsx` (App Router convention)
- Client components in route dirs: PascalCase (`MapClient.tsx`, `SampleMapClient.tsx`)

**Directories:**
- Lowercase, kebab-case for multi-word (`canvas/`, `holistic-context` in types)
- Next.js dynamic routes: `[id]/` bracket notation

**Exports:**
- Components: default export, one component per file
- Engine modules: named exports for functions, named + default for constants
- Types: named exports only

**Functions:**
- camelCase: `buildFullPrompt()`, `sendMessage()`, `parseMarkers()`
- Prefix conventions: `build*` for prompt construction, `handle*` for event handlers, `track*` for analytics

**Types:**
- PascalCase: `Phase`, `ConversationContext`, `CanvasData`, `EnterpriseTemplate`
- Interface over type for object shapes (except `Phase` which is a union type)

## Where to Add New Code

**New API Endpoint:**
- Create directory under `app/src/app/api/{name}/`
- Add `route.ts` with exported HTTP method handlers (GET, POST, etc.)
- Follow validation pattern from `app/src/app/api/chat/route.ts`

**New Page:**
- Create directory under `app/src/app/{path}/`
- Add `page.tsx` (server component for metadata) + `{Name}Client.tsx` (client component for interactivity)
- Follow pattern from `app/src/app/map/[id]/`

**New UI Component:**
- Place in `app/src/components/` for general components
- Place in `app/src/components/canvas/` for canvas visualization components
- Use `"use client"` directive at top
- Default export, PascalCase filename
- Import types from `@/engine/types` or `@/engine/canvas-types`

**New Engine Prompt or Phase Logic:**
- Add to `app/src/engine/` (and mirror to `src/engine/` if maintaining canonical copies)
- Export prompt-building functions, import in `app/src/engine/phases.ts`
- Follow pattern: export a string constant or a function that returns a prompt string

**New Utility Function:**
- Place in `app/src/lib/`
- kebab-case filename
- Named exports, pure functions preferred
- Add tests in `app/src/__tests__/`

**New Test:**
- Place in `app/src/__tests__/`
- Name as `{module-name}.test.ts`
- Use vitest (`describe`, `it`, `expect`)
- Import from `@/` path alias

**New Enterprise Template:**
- Add to the `ENTERPRISE_TEMPLATES` array in `app/src/engine/enterprise-templates.ts`
- Follow `EnterpriseTemplate` interface structure
- Include financials, capital profile, landscape requirements, fit signals, and sources

## Special Directories

**`app/.next/`:**
- Purpose: Next.js build output and dev server cache
- Generated: Yes (by `next dev` and `next build`)
- Committed: No (in `.gitignore`)

**`app/node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in `.gitignore`)

**`.claude/skills/`:**
- Purpose: Custom Claude Code skill definitions (29 skills for various development tasks)
- Generated: No (manually created)
- Committed: Not applicable (no git repo initialized)

**`docs/references/`:**
- Purpose: HTML design reference files for Canvas and Document views
- Generated: No (design artifacts)
- Committed: Should be (source of truth for visual design)

**`app/public/`:**
- Purpose: Static assets served at root URL
- Contains: Default Next.js SVG icons (file, globe, next, vercel, window)
- Note: No custom assets yet -- no favicon, no logos, no images

---

*Structure analysis: 2026-03-17*

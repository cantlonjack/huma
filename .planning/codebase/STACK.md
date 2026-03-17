# Technology Stack

**Analysis Date:** 2026-03-17

## Languages

**Primary:**
- TypeScript ^5 - All application code (components, API routes, engine logic, tests)

**Secondary:**
- CSS (Tailwind 4 + custom properties) - Styling via `app/src/app/globals.css`

## Runtime

**Environment:**
- Node.js (version not pinned; no `.nvmrc` detected)
- Next.js 16.1.6 runs on Node via `next dev` / `next start`

**Package Manager:**
- npm (inferred from `package-lock.json` presence)
- Lockfile: present at `app/package-lock.json`

## Frameworks

**Core:**
- Next.js 16.1.6 (App Router) - Full-stack React framework. Config at `app/next.config.ts` (currently empty/default)
- React 19.2.3 - UI rendering
- React DOM 19.2.3 - DOM bindings

**Testing:**
- Vitest ^4.1.0 - Test runner. Config at `app/vitest.config.ts`. Environment: `node`. Test pattern: `src/**/*.test.ts`

**Build/Dev:**
- Tailwind CSS ^4 - Utility-first CSS. Uses `@tailwindcss/postcss` plugin via `app/postcss.config.mjs`
- PostCSS - CSS processing pipeline
- ESLint ^9 - Linting with `eslint-config-next` 16.1.6 (core-web-vitals + typescript presets). Config at `app/eslint.config.mjs`
- TypeScript ^5 - Strict mode enabled. Config at `app/tsconfig.json`

## Key Dependencies

**Critical (production):**
- `@anthropic-ai/sdk` ^0.78.0 - Claude API client for AI conversation and document generation. Used in `app/src/app/api/chat/route.ts`
- `@upstash/redis` ^1.37.0 - Redis client for map persistence (Vercel KV). Used in `app/src/app/api/maps/route.ts` and `app/src/app/api/maps/[id]/route.ts`
- `@vercel/analytics` ^2.0.1 - Usage analytics. `<Analytics />` component in `app/src/app/layout.tsx`, `track()` calls via `app/src/lib/analytics.ts`
- `react-markdown` ^10.1.0 - Markdown rendering for generated maps. Used in `app/src/components/MapDocument.tsx`
- `remark-gfm` ^4.0.1 - GitHub Flavored Markdown support (tables, strikethrough). Used with `react-markdown`

**Infrastructure (dev):**
- `@tailwindcss/postcss` ^4 - Tailwind 4 PostCSS integration
- `@types/node` ^20, `@types/react` ^19, `@types/react-dom` ^19 - TypeScript type definitions

## Configuration

**Environment:**
- `.env.local` file present in `app/` directory (not committed)
- Required env vars (see INTEGRATIONS.md for details):
  - `ANTHROPIC_API_KEY` - Claude API authentication
  - `KV_REST_API_URL` - Upstash Redis endpoint
  - `KV_REST_API_TOKEN` - Upstash Redis auth token

**Build:**
- `app/tsconfig.json` - TypeScript config: target ES2017, strict mode, bundler module resolution, path alias `@/*` maps to `./src/*`
- `app/next.config.ts` - Next.js config (currently default/empty)
- `app/postcss.config.mjs` - PostCSS with `@tailwindcss/postcss` plugin
- `app/eslint.config.mjs` - ESLint flat config with Next.js core-web-vitals and TypeScript presets
- `app/vitest.config.ts` - Vitest config: node environment, path alias mirroring tsconfig

**Design Tokens (CSS Custom Properties):**
- Defined via `@theme inline` in `app/src/app/globals.css`
- Color palettes: Sand (#FAF8F3-#C4B89E), Sage (#EBF3EC-#1E3622), Amber (#FFF4EC-#8B4513), Earth (#C4BAA8-#1A1714)
- Accent colors: Sky (#2E6B8A), Rose (#8B3A3A), Gold (#8A6D1E), Lilac (#6B5A7A)
- Typography: `--font-serif` (Cormorant Garamond) and `--font-sans` (Source Sans 3) loaded via `next/font/google` in `app/src/app/layout.tsx`

## TypeScript Configuration

**Key Settings (from `app/tsconfig.json`):**
- `strict: true` - Full strict mode
- `target: "ES2017"` - Output target
- `module: "esnext"` - ESM modules
- `moduleResolution: "bundler"` - Bundler-style resolution (Next.js)
- `jsx: "react-jsx"` - React 17+ JSX transform
- `incremental: true` - Faster rebuilds
- Path alias: `@/*` resolves to `./src/*`
- Next.js compiler plugin enabled

## Scripts

```bash
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run vitest (single run)
npm run test:watch   # Run vitest in watch mode
```

## Project Structure Note

- The project root is `C:\HUMAHUMA\` but the Next.js application lives in `C:\HUMAHUMA\app\`
- Engine/prompt logic is duplicated: source-of-truth at `src/engine/` (root), copied into `app/src/engine/`
- Dev server is configured via `.claude/launch.json` to run from the `app/` subdirectory
- No git repository initialized

## Platform Requirements

**Development:**
- Node.js (version not pinned)
- npm for package management
- Claude dev server runs via `.claude/launch.json` configuration

**Production:**
- Vercel hosting (inferred from `@vercel/analytics` dependency and Upstash/Vercel KV integration pattern)
- No `vercel.json` configuration file detected — uses defaults

---

*Stack analysis: 2026-03-17*

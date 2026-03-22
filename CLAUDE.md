# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server at localhost:4321
pnpm build        # Production build to ./dist/
pnpm preview      # Preview production build
pnpm format       # Format with Prettier
pnpm format:check # Check formatting (no writes)
```

No test runner is configured. No lint command exists (only Prettier for formatting).

## Architecture Overview

This is a bilingual (Traditional Chinese `tw` / English `en`) blog built with **Astro 6 + React 19 + Tailwind 4 + DaisyUI**, deployed to Vercel in hybrid mode (mostly static, SSR for admin/API).

### Content & Routing

- Content lives in `src/contenthttps://cdn.kir4che.com/{lang}/{slug}.mdx` and is loaded via Astro content collections (`src/content.config.ts`)
- All public routes are prefixed with `/[lang]/` — middleware (`src/middleware.ts`) handles `Accept-Language` detection and redirects accordingly
- Static pages use `getStaticPaths()` for build-time generation; admin pages and API routes disable prerendering for SSR

### Key Libraries (`src/lib/`)

- **`posts.ts`** — Primary post-fetching layer. Handles slug resolution, language detection from entry IDs (`tw/slug`), CJK-aware word counting, and aggressive caching in production. Use `getPost()`, `getPostsInfo()`, `getPostMetaBySlug()`, `getPostAvailableLangs()`.
- **`i18n.ts`** — `createTranslator(lang, namespace)` returns a translation function. Translations are in `src/i18n/{lang}.json` with dot-notation keys and interpolation support.
- **`admin.ts`** — HMAC-SHA256 session auth, 7-day cookies, timing-safe comparisons. File-based post CRUD (fsPromises, no database). Cover images stored as WebP in Cloudflare R2.
- **`post-passwords.ts`** — In-memory password store sourced from `POST_PASSWORDS` env var (JSON). Verification via `POST /api/posts/[id]/verify`, unlock state in cookies.
- **`sidebar.ts`** — Aggregates categories, tags, and popular posts for sidebar rendering.
- **`seo.ts`** / `src/pages/og/[...slug].png.ts` — Dynamic OG image generation via `@vercel/og`.

### i18n Pattern

Default language is `tw`. Supported: `tw`, `en`. When adding translated strings, add to both `src/i18n/tw.json` and `src/i18n/en.json`. Link components in `src/components/ui/` handle language-aware routing automatically.

### MDX Components (`src/components/mdx/`)

Custom components injected into MDX: headings with auto IDs, responsive images, video embeds, accordions, ratings, code blocks (Expressive Code with `one-dark-pro` theme), inline mark/ins highlighting.

### Rendering Strategy

- Public pages: prerendered (static) at build time
- `src/pages/[lang]/index.astro` (home): SSR for pagination
- `src/pages/admin/` + `src/pages/api/`: SSR, require session auth
- OG images: SSR on-demand

### Environment Variables

```
PUBLIC_SITE_URL=
GOOGLE_SITE_VERIFICATION=
GOOGLE_ANALYTICS_ID=
SESSION_SECRET=          # HMAC secret for admin auth
ADMIN_USERNAME=
ADMIN_PASSWORD=
DEFAULT_POST_PASSWORD=
POST_PASSWORDS=          # JSON: {"tw/slug": "password"}
GITHUB_TOKEN=            # Personal access token for pushing posts
GITHUB_OWNER=            # GitHub username or org
GITHUB_REPO=             # Repository name
GITHUB_BRANCH=           # Target branch (default: main)
```

### Path Alias

`@/*` maps to `src/*` — use this for all internal imports.

### Post Frontmatter Schema

```yaml
title: string # required
description: string
date: Date # required
categories: string[]
tags: string[]
featured: boolean # default: false
draft: boolean # default: false
protected: boolean # default: false (enables password gate)
coverImage: string
updatedAt: string
showUpdatedAt: boolean # default: false
```

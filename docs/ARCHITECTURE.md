# Architecture

## Overview

RUSTERA is a Next.js 16 App Router application exported as a fully static site for GitHub Pages. There is no runtime server: the browser talks directly to the CORS-enabled RuStore API.

```
Browser (static HTML/JS from GitHub Pages)
  │
  ▼
src/lib/rustore/client-api.ts          (browser-side RuStore adapter)
  │   schemas.ts → normalizers.ts → download-url.ts
  ▼
https://backapi.rustore.ru             (CORS-enabled upstream)
```

## Layers

- **`src/app`** — routing, metadata, error boundaries. All routes are statically prerendered (`output: "export"`); dynamic data is fetched client-side.
- **`src/lib/rustore`** — the only code allowed to talk to RuStore. `client-api.ts` handles transport and envelope unwrapping; `schemas.ts` (zod) validates external data; `normalizers.ts` maps it to domain models; `download-url.ts` enforces an HTTPS host allow-list before any URL is handed to the browser.
- **`src/types/domain.ts`** — provider-agnostic models. No upstream field names appear here.
- **`src/lib`** — pure utilities (Android SDK mapping, validation, formatting, copy constants). No React, no upstream imports.
- **`src/stores`** — small localStorage-backed stores built on `useSyncExternalStore`. No global state library needed.
- **`src/components`** — presentational and interactive UI. No component imports upstream code except through `src/lib/rustore`.

## Pages and data flow

- **Home / about / privacy / terms** — fully static content.
- **Search (`/search/`)** — static shell; `SearchExperience` reads `?q=` via `useSearchParams` (wrapped in `Suspense`) and runs debounced client-side queries with bounded-concurrency size enrichment.
- **Application detail (`/app/?p=<packageName>`)** — a query parameter instead of a dynamic route so every package works from a static host. `AppDetailClient` loads details, screenshots, technical panels and related apps client-side.
- **Download** — `DownloadPanel` calls `resolveDownloadClient` (v3 → v2 → v1 endpoints) and `validatedDownloadUrl` checks every resolved URL against the RuStore CDN allow-list before the browser follows it. APK bytes never pass through RUSTERA.

## Caching

- No metadata caching: every request goes to the upstream with `cache: "no-store"`.
- Download resolutions: never cached (signed URLs expire).
- Browser local storage: favorites, history, recent searches, comparison and theme only.

## Error handling

`RuStoreError` separates transport failures (HTTP, schema) from business failures (not found, no download, paid app). `toPublicError` maps everything to a user-safe message; internal details never reach the UI.

## Static-export notes

- `robots.ts` and `sitemap.ts` are pinned to `export const dynamic = "force-static"`.
- `basePath`/`assetPrefix` switch to `/rustera` when `GITHUB_PAGES=true` at build time; public-folder assets are prefixed manually via `NEXT_PUBLIC_BASE_PATH`.
- See `docs/DEPLOYMENT.md` for the build and deploy pipeline.

## Design system

Semantic CSS variables in `globals.css` define surfaces, text, borders, accents and status colors for dark and light themes. Tailwind 4 maps them to utility classes via `@theme inline`. Components use those utilities rather than hardcoded colors. The theme script in the root layout applies the stored preference before hydration.

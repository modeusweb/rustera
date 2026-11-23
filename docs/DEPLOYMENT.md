# Deployment

## Target

GitHub Pages (project site `https://modeusweb.github.io/rustera/`). The app is a fully static Next.js export (`output: "export"`) — no Node server is involved at runtime. The browser talks directly to the CORS-enabled RuStore API (`src/lib/rustore/client-api.ts`).

## Pipeline

`.github/workflows/deploy.yml` runs on every push to `main`:

1. `npm ci`, lint, typecheck, unit tests.
2. `npm run build` with `GITHUB_PAGES=true` (sets `basePath: /rustera` and `assetPrefix: /rustera/`) and `NEXT_PUBLIC_SITE_URL=https://modeusweb.github.io/rustera`.
3. The `out/` folder is uploaded and published via `actions/deploy-pages`.

GitHub Pages must be set to **GitHub Actions** as the build and deployment source (already selected in repository settings).

## Local build parity

```bash
GITHUB_PAGES=true npm run build   # same base path as production
npx serve out                     # or any static file server
```

Without `GITHUB_PAGES=true` the site builds with an empty base path for local `next dev`.

## Static-export constraints

- Detail pages use a query parameter (`/app/?p=<packageName>`) so every package works without a server. Dynamic route handlers, rewrites, headers and the API routes were removed; all catalog calls happen client-side.
- `sitemap.ts` and `robots.ts` are pinned to `export const dynamic = "force-static"`, which `output: "export"` requires.
- Public-folder assets referenced from components are prefixed manually via `NEXT_PUBLIC_BASE_PATH` (see `next.config.ts`).

## Verification before release

```bash
npm run verify          # lint, typecheck, unit tests, build
npm run test:e2e        # Playwright against next dev with mocked upstream
```

After deployment, perform one manual search and one manual download-link resolution against the live upstream.

## Rollback

Re-run the deploy workflow on the previous commit. No database migrations or persistent state are involved.

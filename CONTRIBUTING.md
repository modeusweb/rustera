# Contributing

Thanks for your interest in RUSTERA.

## Development setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Use Node.js LTS and npm. All code, comments and documentation must be in English.

## Ground rules

1. The app is a static export: do not add Node-only runtime code, API route handlers or server-only headers.
2. Validate all external data at the provider boundary with Zod. Never trust upstream payloads.
3. Keep domain models provider-agnostic. Upstream field names stay inside `src/lib/rustore`.
4. Do not fabricate metadata, download progress, test results or integration success.
5. Do not add dependencies without a concrete need.
6. Use Heroicons for all interface icons.
7. Add tests for every behavior change. Do not rely on live RuStore availability in CI.
8. Use semantic HTML and accessible labels.

## Before opening a pull request

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Describe what changed, why, and how it was verified. If the upstream RuStore API changes, update `docs/RUSTORE-INTEGRATION.md` with the new verification date and evidence.

## Reporting issues

Include the affected route, steps to reproduce, browser and environment. Never include a signed download URL. For security issues follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

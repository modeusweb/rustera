# Security

## Deployment model

RUSTERA is a statically exported Next.js application (`output: "export"`). There is **no application server**, no API route handler and no server-side request proxy. The browser talks directly to the RuStore API, and the built files are served as static assets (normally by GitHub Pages).

Consequences that matter for security review:

- No server-side headers (CSP, `X-Frame-Options`, `Referrer-Policy`, etc.) can be set by this application. Header configuration is the hosting platform's responsibility; Next.js does not support `headers()` in static exports.
- There is no server-side rate limiting, retry queue, response cache or secret store. Request timeouts and failure handling are client-side only.
- No request ID is generated or returned by the application.

## Trust model

RuStore is an untrusted external service. All upstream JSON is validated with Zod at the client boundary (`src/lib/rustore/schemas.ts`) before use; missing or malformed optional fields become `null` or are dropped. Validation failures become typed `RuStoreError`s with fixed, user-facing messages — upstream text is never rendered as HTML. React escapes all values, and screenshot/icon URLs are restricted by the `next.config.ts` remote-host allow-list.

APK/ZIP files are untrusted binaries. RUSTERA never executes, modifies or inspects them and never claims they are malware-free. Users see an explicit responsibility notice.

## Client-side protections

- **Download URL allow-list** — `src/lib/rustore/download-url.ts` accepts only HTTPS URLs on `static-m.rustore.ru` or `static.rustore.ru`, with no credentials, non-standard port, IP literal, CRLF or NUL characters. Every resolved download URL is validated before it is exposed as a link.
- **Envelope and schema checks** — non-`OK` upstream envelopes are rejected before rendering; search, detail and download payloads are parsed with Zod.
- **Bounded requests** — every upstream request has a 10-second timeout; cancellation aborts in-flight searches and enrichment calls.
- **Input validation** — package names, queries, page numbers and page sizes are validated before they reach the upstream URL.
- **Local data only** — favorites, recent searches, comparison selections and download history live in `localStorage`. Signed download URLs and downloaded bytes are never persisted. Corrupted local values are discarded instead of crashing the UI.
- **Supply chain** — dependencies are pinned by `package-lock.json` and installed with `npm ci` in CI and deployment.

## Reporting vulnerabilities

See [SECURITY.md](../SECURITY.md) at the repository root for the disclosure process. Never include signed download URLs or query strings from RuStore CDN URLs in a report.

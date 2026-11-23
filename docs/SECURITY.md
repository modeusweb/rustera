# Security

## Trust model

RuStore is an untrusted external service. All upstream JSON is validated with Zod before use; missing or malformed optional fields become `null` or are dropped. No external data is rendered as HTML — React escapes all values. Icons and screenshots are loaded through Next.js Image with a strict remote-host allow-list.

APK/ZIP files are untrusted binaries. RUSTERA never executes them, never modifies them, and never claims they are malware-free. Users see an explicit responsibility notice.

## Server-side protections

- **SSRF / open redirects** — download URLs must be HTTPS, on `static-m.rustore.ru` or `static.rustore.ru`, with no credentials, no non-standard port, no IP literal and no CRLF characters. Upstream requests use `redirect: "error"`, so there are no redirect hops to revalidate.
- **Input validation** — package names, queries, page numbers and page sizes are validated with Zod on the server, even when the UI already validates them.
- **Path traversal** — package names are validated by regex before being interpolated into upstream paths and never used as filesystem paths.
- **Header injection** — upstream host and path are derived from configuration and validated; user input only appears in URL search parameters constructed with `URLSearchParams`.
- **Resource exhaustion** — request timeouts, bounded retries with jitter, rate limits, bounded page sizes and response caches limit abuse. APK bytes are never buffered by the server.
- **Secret hygiene** — no credentials are required. Signed URLs are excluded from logs and from persistent storage; the logger provides `safeUrl()`.
- **Security headers** — CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`, `object-src 'none'`, `upgrade-insecure-requests`. `poweredByHeader` is disabled.
- **CSRF** — no cookie-authenticated mutations exist. All download resolution is a read-only GET that returns metadata or a redirect.

## Content Security Policy notes

`style-src 'unsafe-inline'` is required by Tailwind's generated styles in this deployment model. `script-src` includes `'unsafe-inline'` because Next.js App Router injects dynamic inline bootstrap scripts carrying RSC request IDs; blocking them makes hydration fail. The application itself adds no inline scripts — the theme preference uses a CSS media query plus a client component. React's development-only debugging features require `'unsafe-eval'`, added exclusively when `NODE_ENV === "development"`. A nonce-based CSP can be introduced later if the framework hooks allow threading a per-request nonce.

## Reporting vulnerabilities

See [SECURITY.md](../SECURITY.md) at the repository root for the disclosure process.

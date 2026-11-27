# Security policy

## Supported versions

Security fixes are applied to the latest published version only.

## Reporting a vulnerability

Please report suspected vulnerabilities privately through your Git provider's private vulnerability reporting feature, or by contacting the maintainer directly. Do not open a public issue for a security problem.

Include:

- affected route or component,
- steps to reproduce,
- impact assessment,
- browser and environment (the app has no server-side request IDs).

**Never include signed download URLs, tokens or credentials in a report.** Redact query strings from RuStore CDN URLs.

## Response expectations

You should receive an acknowledgement within a reasonable period. Fixes are prioritized by severity: critical, high, medium, low. We may ask for additional information or a proof of concept that does not involve real user data.

## Scope

RUSTERA itself: the statically exported Next.js application, provider adapter, validation, download URL checks and client storage. Hosting-level HTTP headers are out of scope. Vulnerabilities in RuStore's own service or in Android applications distributed through it are out of scope and should be reported to their respective owners.

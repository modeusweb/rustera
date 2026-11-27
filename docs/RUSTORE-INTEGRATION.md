# RuStore integration notes

This document records the **verified** behaviour of the RuStore backend integration used by RUSTERA. All findings were obtained by reading the reference project and probing the upstream service directly on **2026-11-23**. The upstream is an undocumented, private API: treat every contract here as observational, not guaranteed.

## 1. Reference project findings

The reference project (`k7361/rustore-downloader`) is a static single-page application. It proxied `/api/*` to `https://backapi.rustore.ru` with Vercel rewrites, which meant the real upstream paths were **without** the `/api` prefix. Its requests were:

| Purpose                  | Method | Upstream path                                            |
| ------------------------ | ------ | -------------------------------------------------------- |
| Search                   | `GET`  | `/applicationData/apps?pageNumber=0&pageSize=20&query=…` |
| App details              | `GET`  | `/applicationData/overallInfo/{packageName}`             |
| Version history          | `GET`  | `/applicationData/allAppVersionWhatsNew/{appId}`         |
| Comments                 | `GET`  | `/comment/comment?...`                                   |
| Download link (primary)  | `POST` | `/v3/showcase/apps/download-link`                        |
| Download link (fallback) | `POST` | `/applicationData/v2/download-link`                      |

Special header: `ruStoreVerCode: 1105001` on details and download requests; `deviceType: mobile|tv` on search/details.

The reference replaced trailing `.zip` with `.apk` in returned URLs before displaying them. **RUSTERA deliberately does not do this.** The replacement is a cosmetic hack: the actual object served by the CDN is a ZIP containing split APKs. Renaming the URL changes only the displayed suffix, not the bytes. Presenting it as a single APK is misleading.

## 2. Live verification (2026-11-23)

- `https://backapi.rustore.ru/api/...` → **404** on every path. The old rewrite prefix no longer exists.
- `https://backapi.rustore.ru/applicationData/apps?...` with `ruStoreVerCode: 1000` → **417** ("Please update RuStore").
- The same request with `ruStoreVerCode: 1105001` → **200 OK** with a valid catalog response.
- The same request with **no** version header → **200 OK**. The header is therefore an optional compatibility hint, not a credential or access-control bypass.
- `overallInfo/{packageName}` with no header → **400**; with the version header → works. The header remains necessary for detail endpoints in practice.
- `v3/showcase/apps/download-link` → **200**, returns signed CDN URLs directly (no `code` envelope).
- `applicationData/v2/download-link` → **200**, wrapped in `{ code: "OK", body: {…} }`, additionally returns the app's signing certificate.
- `applicationData/download-link` (v1) → **200**, returns a single `apkUrl`.
- `www.rustore.ru` is reachable and server-renders search results, but the browser-facing `web-api.rustore.ru` gateway requires an undocumented signed request path; RUSTERA does not attempt to reverse-engineer or replay it.

### Verified response shapes

Search (`GET /applicationData/apps`):

```json
{
  "code": "OK",
  "message": null,
  "body": {
    "content": [
      {
        "appId": 2063507966,
        "packageName": "org.telegram.messenger.web",
        "minSdkVersion": 23,
        "appName": "Telegram",
        "shortDescription": "…",
        "iconUrl": "https://static-m.rustore.ru/…png",
        "appType": "MAIN",
        "versionCode": 73469,
        "price": 0,
        "averageUserRating": 3.96,
        "totalRatings": 29849,
        "roundedDownloadsText": "20 млн +"
      }
    ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 492,
    "totalPages": 25
  }
}
```

Details (`GET /applicationData/overallInfo/{packageName}`) — envelope `{ code, message, body, timestamp }`. The body includes `appId`, `packageName`, `appName`, `categories`, `companyName`, `shortDescription`, `fullDescription`, `fileSize`, `versionName`, `versionCode`, `minSdkVersion`, `minAndroidVersion`, `targetSdkVersion`, `maxSdkVersion`, `whatsNew`, `fileUrls[]` (screenshots with `ordinal`), `iconUrl`, `ageRestriction`, `rating`, `downloads`, `price`, `appVerUpdatedAt`, `firstPublishedAt`, `signatures[]`, `signature`, `aggregatorInfo`, `deviceTypes`, `versionId`, `seoTags`, `developerContacts`. **Unavailable:** supported ABIs and definitive target-architecture data. Only `minSdkVersion`, `targetSdkVersion`, `minAndroidVersion` and `maxSdkVersion` can be shown reliably.

Download links (`POST /v3/showcase/apps/download-link`):

```json
{
  "appId": 2063507966,
  "versionCode": 73469,
  "versionId": 2064970947,
  "downloadUrls": [
    {
      "url": "https://static-m.rustore.ru/2026/11/21/...zip",
      "size": 79899094,
      "hash": "f9ccec874cf73ff9"
    }
  ]
}
```

The `v2` variant wraps the same payload in `{ code, body }` and adds `signature`. The `hash` field is a short upstream-provided digest whose algorithm is undocumented — RUSTERA stores it as `upstreamDigest` but **never** presents it as a verified SHA-256 checksum.

## 3. Known limitations (must be surfaced in the UI)

1. **Search requires a non-empty query.** There is no verified "browse all" endpoint; the homepage is not a catalog browser.
2. **Package lookup is an exact-match details request.** It is not a search-by-package API. A package not published in RuStore returns a 404 application error.
3. **No verified sorting/filter/category parameters** for the search endpoint. RUSTERA does not render nonfunctional filters. Filters are limited to client-side presentation options that reflect real response fields (e.g. minimum SDK threshold) and are labeled as such.
4. **Downloaded files are ZIP archives containing split APKs** for most modern apps. They are not standalone APKs. RUSTERA never renames `.zip` to `.apk`. The UI states the actual content type and links to the original RuStore-provided URL.
5. **No supported architecture field.** Architecture cannot be shown. Compatibility with a specific device cannot be guaranteed from metadata.
6. **Signed URLs expire.** RUSTERA never caches download responses and never persists signed URLs in history.
7. **External-source listings** (`aggregatorInfo` present) may not be downloadable directly; the detail UI explains this.
8. **Paid apps** (`price > 0`) are displayed but never offered for free download.
9. **The service is regionally restricted and may block datacenter IPs.** HTTP 403/417/5xx are mapped to actionable errors; they are not retried blindly.
10. **Upstream field presence varies.** Every external response is validated with Zod and normalized; missing optional fields become `null`, never fabricated values.

## 4. Compatibility header policy

`ruStoreVerCode` is isolated in configuration (`NEXT_PUBLIC_RUSTORE_VERSION_CODE`, default `1105001`) and documented here. It is a compatibility identifier observed in the reference client, not a secret and not an authentication bypass. It can be changed or removed through environment variables if upstream behavior changes.

## 5. Download delivery policy

RUSTERA resolves the signed URL **in the browser** and links directly to the original `static-m.rustore.ru` / `static.rustore.ru` URL. No server or proxy is involved, so APK bytes never pass through application infrastructure and there is no server-side redirect to revalidate. Every returned URL is validated before it is exposed as a link: HTTPS only, allow-listed hosts, no credentials, non-standard port, IP literal, CRLF or NUL characters. Signed URLs are never persisted in history.

A streaming proxy is intentionally **not** implemented: it would require a server, add bandwidth cost and provide no benefit for original-file delivery.

## 6. How to replace or update the adapter

1. Change upstream paths and schemas in `src/lib/rustore/client-api.ts` and `src/lib/rustore/schemas.ts`.
2. Update normalization in `src/lib/rustore/normalizers.ts`; the domain models in `src/types/domain.ts` must not change because of an upstream field rename.
3. Re-run `npm run test:unit` and `npm run test:e2e`. E2E fixtures live in `tests/e2e/fixtures.ts`; upstream requests are mocked there, so CI does not depend on RuStore availability.
4. Update this document with the new verification date and findings.

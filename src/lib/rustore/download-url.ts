import { RuStoreError } from "./errors";

/** Hosts observed serving original RuStore APK/ZIP files (verified 2026-11-23). */
const ALLOWED_DOWNLOAD_HOSTS = new Set(["static-m.rustore.ru", "static.rustore.ru"]);

function isIpLiteral(hostname: string): boolean {
  const normalized = hostname.replace(/^\[|\]$/g, "");
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(normalized) || normalized.includes(":");
}

/**
 * Validates an upstream-provided download URL before it is exposed to a browser.
 * Redirect-only delivery means no server-side fetch occurs here, but the same
 * checks prevent open redirects to attacker-controlled hosts.
 */
export function validateDownloadUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new RuStoreError({
      code: "DOWNLOAD_UNAVAILABLE",
      message: "The download link returned by the catalog was invalid.",
      kind: "business",
    });
  }

  if (url.protocol !== "https:") {
    throw new RuStoreError({
      code: "DOWNLOAD_UNAVAILABLE",
      message: "Only secure (HTTPS) download links are accepted.",
      kind: "business",
    });
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!ALLOWED_DOWNLOAD_HOSTS.has(hostname)) {
    throw new RuStoreError({
      code: "DOWNLOAD_UNAVAILABLE",
      message: "The download link points to an unapproved host and was blocked.",
      kind: "business",
    });
  }

  if (url.username || url.password || (url.port && url.port !== "443")) {
    throw new RuStoreError({
      code: "DOWNLOAD_UNAVAILABLE",
      message: "The download link contains unexpected credentials or a non-standard port.",
      kind: "business",
    });
  }

  if (isIpLiteral(hostname)) {
    throw new RuStoreError({
      code: "DOWNLOAD_UNAVAILABLE",
      message: "IP-address download links are not accepted.",
      kind: "business",
    });
  }

  if (/[\r\n\0]/.test(url.toString())) {
    throw new RuStoreError({
      code: "DOWNLOAD_UNAVAILABLE",
      message: "The download link contained invalid characters.",
      kind: "business",
    });
  }

  return url;
}

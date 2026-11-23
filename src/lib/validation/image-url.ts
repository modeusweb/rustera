/** Shared, server-safe validation for RuStore CDN image URLs. */

const ALLOWED_IMAGE_HOSTS = new Set(["static-m.rustore.ru", "static.rustore.ru"]);

export function isAllowedRemoteImage(src: string | null | undefined): src is string {
  if (!src) return false;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && ALLOWED_IMAGE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

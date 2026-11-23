/** Presentation-only formatting helpers. No domain logic here. */

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes <= 0) {
    return "Not available";
  }
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "Not available";
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Compact English download totals in the style of the original RuStore
 * listing ("80 mln +" → "80M+"). The trailing "+" carries the same
 * approximation as the upstream rounded figure — RuStore never reports
 * exact install counts.
 */
export function formatCompactCount(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value) || value <= 0) {
    return "Not available";
  }
  if (value >= 1e9) return `${Math.floor(value / 1e9)}B+`;
  if (value >= 1e6) return `${Math.floor(value / 1e6)}M+`;
  if (value >= 1e3) return `${Math.floor(value / 1e3)}K+`;
  return new Intl.NumberFormat("en-US").format(value);
}

export function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
}

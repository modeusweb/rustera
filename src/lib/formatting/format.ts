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
 * RuStore reports download totals rounded (an upstream "30 mln +" listing is
 * returned as the number 30,000,000), so a numeric total is always an
 * approximation and must be presented as one.
 */
export function formatApproxCount(value: number | null | undefined): string {
  const formatted = formatCount(value);
  return formatted === "Not available" ? formatted : `≈ ${formatted}`;
}

export function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
}

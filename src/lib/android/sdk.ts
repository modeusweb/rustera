/**
 * Centralized Android API-level mapping. Never import SDK tables into UI code.
 * Source: Android version history; special pre-API-21 values and the 12L exception.
 */

const NAMED_LEVELS: Readonly<Record<number, string>> = {
  1: "1.0",
  2: "1.1",
  3: "1.5",
  4: "1.6",
  5: "2.0",
  6: "2.0.1",
  7: "2.1",
  8: "2.2",
  9: "2.3",
  10: "2.3.3",
  11: "3.0",
  12: "3.1",
  13: "3.2",
  14: "4.0",
  15: "4.0.3",
  16: "4.1",
  17: "4.2",
  18: "4.3",
  19: "4.4",
  20: "4.4W",
  21: "5.0",
  22: "5.1",
  23: "6.0",
  24: "7.0",
  25: "7.1",
  26: "8.0",
  27: "8.1",
  28: "9",
  29: "10",
  30: "11",
  31: "12",
  32: "12L",
  33: "13",
  34: "14",
  35: "15",
  36: "16",
};

export interface AndroidVersionInfo {
  apiLevel: number;
  versionName: string | null;
  label: string;
  known: boolean;
}

/**
 * Maps an Android API level to a human-readable version.
 * Returns a graceful "API n" / "Unknown API level" fallback for unknown values.
 */
export function mapAndroidSdk(level: number | null | undefined): AndroidVersionInfo {
  if (level === null || level === undefined || !Number.isInteger(level) || level <= 0) {
    return { apiLevel: 0, versionName: null, label: "Unknown", known: false };
  }

  // Never extrapolate a future Android version from the API level: upstream
  // names are not derivable and a wrong label is worse than no label.
  const versionName = NAMED_LEVELS[level] ?? null;

  if (versionName === null) {
    return { apiLevel: level, versionName: null, label: `API ${level}`, known: false };
  }

  return {
    apiLevel: level,
    versionName,
    label: `Android ${versionName} (API ${level})`,
    known: true,
  };
}

/** Converts an upstream `minAndroidVersion` string into a display-safe value. */
export function normalizeUpstreamAndroidVersion(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) return null;
  return trimmed;
}

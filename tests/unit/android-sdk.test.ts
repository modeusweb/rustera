import { describe, expect, it } from "vitest";
import { mapAndroidSdk, normalizeUpstreamAndroidVersion } from "@/lib/android/sdk";

describe("mapAndroidSdk", () => {
  it.each([
    [21, "Android 5.0 (API 21)"],
    [23, "Android 6.0 (API 23)"],
    [30, "Android 11 (API 30)"],
    [32, "Android 12L (API 32)"],
    [35, "Android 15 (API 35)"],
    [36, "Android 16 (API 36)"],
    [37, "Android 17 (API 37)"],
  ])("maps API %i to %s", (level, expected) => {
    expect(mapAndroidSdk(level).label).toBe(expected);
  });

  it("handles unknown and invalid values gracefully", () => {
    expect(mapAndroidSdk(null).label).toBe("Unknown");
    expect(mapAndroidSdk(0).label).toBe("Unknown");
    expect(mapAndroidSdk(-1).label).toBe("Unknown");
    expect(mapAndroidSdk(1.5).label).toBe("Unknown");
    expect(mapAndroidSdk(1234).label).toBe("API 1234");
    expect(mapAndroidSdk(1234).known).toBe(false);
  });

  it("normalizes upstream Android version strings", () => {
    expect(normalizeUpstreamAndroidVersion(" 6 ")).toBe("6");
    expect(normalizeUpstreamAndroidVersion("12.1")).toBe("12.1");
    expect(normalizeUpstreamAndroidVersion("Android 6")).toBeNull();
    expect(normalizeUpstreamAndroidVersion(null)).toBeNull();
  });
});

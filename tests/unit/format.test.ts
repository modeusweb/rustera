import { describe, expect, it } from "vitest";
import { formatCompactCount, formatCount } from "@/lib/formatting/format";

describe("formatCount", () => {
  it("formats full numbers with separators", () => {
    expect(formatCount(30_000_000)).toBe("30,000,000");
    expect(formatCount(null)).toBe("Not available");
  });
});

describe("formatCompactCount", () => {
  it("uses RuStore-style rounded English totals", () => {
    expect(formatCompactCount(80_000_000)).toBe("80M+");
    expect(formatCompactCount(12_345_678)).toBe("12M+");
    expect(formatCompactCount(1_500_000_000)).toBe("1B+");
    expect(formatCompactCount(25_400)).toBe("25K+");
  });

  it("keeps small totals exact", () => {
    expect(formatCompactCount(850)).toBe("850");
    expect(formatCompactCount(1)).toBe("1");
  });

  it("handles invalid input", () => {
    expect(formatCompactCount(null)).toBe("Not available");
    expect(formatCompactCount(undefined)).toBe("Not available");
    expect(formatCompactCount(0)).toBe("Not available");
    expect(formatCompactCount(Number.NaN)).toBe("Not available");
  });
});

import { describe, expect, it } from "vitest";
import {
  isValidPackageName,
  packageNameSchema,
  safeFileName,
  searchQuerySchema,
} from "@/lib/validation/input";

describe("package name validation", () => {
  it.each(["com.example.app", "org.telegram.messenger.web", "ru.yandex.searchplugin", "a.b"])(
    "accepts %s",
    (value) => expect(isValidPackageName(value)).toBe(true),
  );

  it.each(["", "com", "com..app", "com.example.app/", "com example.app", "1com.example.app", "com.example.app<script>"])(
    "rejects %s",
    (value) => expect(isValidPackageName(value)).toBe(false),
  );

  it("rejects overly long identifiers", () => {
    expect(packageNameSchema.safeParse(`com.${"a".repeat(300)}`).success).toBe(false);
  });
});

describe("search query validation", () => {
  it("trims and accepts normal queries", () => {
    expect(searchQuerySchema.parse("  telegram  ")).toBe("telegram");
  });

  it("rejects empty and oversized queries", () => {
    expect(searchQuerySchema.safeParse("").success).toBe(false);
    expect(searchQuerySchema.safeParse("a".repeat(121)).success).toBe(false);
  });
});

describe("safeFileName", () => {
  it("removes path separators and control characters", () => {
    expect(safeFileName("../../etc/passwd")).toBe(".._.._etc_passwd");
    expect(safeFileName("com.example.app")).toBe("com.example.app");
  });
});

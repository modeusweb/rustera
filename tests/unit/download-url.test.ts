import { describe, expect, it } from "vitest";
import { validateDownloadUrl } from "@/lib/rustore/download-url";
import { RuStoreError } from "@/lib/rustore/errors";
import { isAllowedRemoteImage } from "@/lib/validation/image-url";

describe("validateDownloadUrl", () => {
  const valid =
    "https://static-m.rustore.ru/2026/11/21/dc/1b6612aa-706a-466d-98b9-163fe8d483ae.zip";

  it("accepts official HTTPS CDN URLs", () => {
    expect(validateDownloadUrl(valid).hostname).toBe("static-m.rustore.ru");
    expect(validateDownloadUrl("https://static.rustore.ru/app.apk").hostname).toBe("static.rustore.ru");
  });

  it("allows only official RuStore CDN hosts for images", () => {
    expect(isAllowedRemoteImage("https://static-m.rustore.ru/icon.png")).toBe(true);
    expect(isAllowedRemoteImage("https://static.rustore.ru/s.png")).toBe(true);
    expect(isAllowedRemoteImage("http://static-m.rustore.ru/icon.png")).toBe(false);
    expect(isAllowedRemoteImage("https://evil.example.com/icon.png")).toBe(false);
    expect(isAllowedRemoteImage(null)).toBe(false);
  });

  it.each([
    "http://static-m.rustore.ru/app.apk",
    "https://evil.example.com/app.apk",
    "https://static-m.rustore.ru.evil.com/app.apk",
    "https://127.0.0.1/app.apk",
    "https://[::1]/app.apk",
    "https://user:pass@static-m.rustore.ru/app.apk",
    "https://static-m.rustore.ru:8443/app.apk",
    "not a url",
  ])("rejects unsafe URL %s", (url) => {
    expect(() => validateDownloadUrl(url)).toThrow(RuStoreError);
  });
});

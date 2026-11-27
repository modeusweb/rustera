import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  resolveDownloadClient,
  searchCatalogClient,
  validatedDownloadUrls,
} from "@/lib/rustore/client-api";
import { normalizeDownload } from "@/lib/rustore/normalizers";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const detailsBody = {
  appId: 1,
  packageName: "com.example.app",
  appName: "Example",
  fileSize: 100,
  versionCode: 1,
  minSdkVersion: 23,
  targetSdkVersion: 36,
  maxSdkVersion: null,
  downloads: 0,
  versionId: 1,
  versionName: "1.0",
  appVerUpdatedAt: null,
};

describe("client-api", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("rejects an ERROR envelope instead of showing zero results", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ code: "ERROR", message: "bad request", body: null }),
    );

    await expect(searchCatalogClient({ query: "telegram" })).rejects.toMatchObject({
      code: "UPSTREAM_ERROR",
      kind: "business",
    });
  });

  it("preserves caller cancellation instead of reporting an outage", async () => {
    const controller = new AbortController();
    vi.mocked(fetch).mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          (init as RequestInit).signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );

    const pending = searchCatalogClient({ query: "telegram", signal: controller.signal });
    controller.abort();

    await expect(pending).rejects.toBeInstanceOf(DOMException);
  });

  it("reports transport failures instead of a missing download file", async () => {
    vi.mocked(fetch).mockImplementation((input) =>
      Promise.resolve(
        String(input).includes("overallInfo")
          ? jsonResponse({ code: "OK", body: detailsBody })
          : jsonResponse({}, 500),
      ),
    );

    await expect(resolveDownloadClient("com.example.app")).rejects.toMatchObject({
      code: "UPSTREAM_UNAVAILABLE",
      status: 500,
      retryable: true,
    });
  });

  it("validates every resolved download URL, not just the first", () => {
    const resolution = normalizeDownload({
      v3: {
        appId: 1,
        versionCode: 1,
        versionId: 1,
        signature: null,
        downloadUrls: [
          { url: "https://static-m.rustore.ru/release.apk", size: 10, hash: null },
          { url: "https://static.rustore.ru/split.zip", size: 20, hash: null },
        ],
      },
      packageName: "com.example.app",
      versionName: "1.0",
      updatedAt: null,
    });

    expect(validatedDownloadUrls(resolution)).toEqual([
      "https://static-m.rustore.ru/release.apk",
      "https://static.rustore.ru/split.zip",
    ]);

    resolution.urls[1]!.url = "https://attacker.example/split.zip";
    expect(() => validatedDownloadUrls(resolution)).toThrow("unapproved host");
  });
});

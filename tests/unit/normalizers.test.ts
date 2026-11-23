import { describe, expect, it } from "vitest";
import { normalizeAppDetails, normalizeDownload, normalizeSearchResponse } from "@/lib/rustore/normalizers";
import {
  appDetailsSchema,
  downloadV3Schema,
  searchResponseSchema,
} from "@/lib/rustore/schemas";

const sampleSearch = {
  code: "OK",
  body: {
    content: [
      {
        appId: 1,
        packageName: "org.telegram.messenger.web",
        appName: "Telegram",
        minSdkVersion: 23,
        shortDescription: "Messaging",
        iconUrl: null,
        versionCode: 100,
        price: 0,
      },
    ],
    pageNumber: 0,
    pageSize: 20,
    totalElements: 1,
    totalPages: 1,
  },
};

const sampleDetails = {
  code: "OK",
  body: {
    appId: 1,
    packageName: "org.telegram.messenger.web",
    appName: "Telegram",
    categories: ["social"],
    companyName: "Telegram FZ-LLC",
    shortDescription: "Messaging",
    fullDescription: "Full description",
    fileSize: 79899094,
    versionName: "13.3.1",
    versionCode: 100,
    minSdkVersion: 23,
    minAndroidVersion: "6",
    targetSdkVersion: 36,
    maxSdkVersion: 0,
    whatsNew: "Fixes",
    iconUrl: null,
    fileUrls: [
      { fileUrl: "https://static-m.rustore.ru/s2.png", ordinal: 2, type: "SCREENSHOT" },
      { fileUrl: "https://static-m.rustore.ru/s1.png", ordinal: 1, type: "SCREENSHOT" },
    ],
    signatures: ["abc"],
    ageRestriction: { category: "12+", name: "12+" },
    rating: { average: 4.1, votes: 100 },
    downloads: 1000,
    price: 0,
    appVerUpdatedAt: "2026-11-21T12:02:33.514+00:00",
    firstPublishedAt: null,
    aggregatorInfo: null,
    deviceTypes: ["MOBILE"],
    versionId: 55,
  },
};

const sampleDownload = {
  appId: 1,
  versionCode: 100,
  versionId: 55,
  downloadUrls: [
    { url: "https://static-m.rustore.ru/release.zip", size: 79899094, hash: "f9ccec87" },
  ],
};

describe("normalizers", () => {
  it("normalizes search results without inventing fields", () => {
    const parsed = searchResponseSchema.parse(sampleSearch);
    const result = normalizeSearchResponse(parsed, "telegram");
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      packageName: "org.telegram.messenger.web",
      name: "Telegram",
      minSdkVersion: 23,
      developer: null,
      versionName: null,
    });
    expect(result.totalElements).toBe(1);
  });

  it("normalizes details and sorts screenshots by ordinal", () => {
    const parsed = appDetailsSchema.parse(sampleDetails);
    const result = normalizeAppDetails(parsed);
    expect(result.screenshots.map((item) => item.ordinal)).toEqual([1, 2]);
    expect(result.ageRating).toBe("12+");
    expect(result.hasExternalSource).toBe(false);
    expect(result.sourceUrl).toContain("org.telegram.messenger.web");
  });

  it("keeps the original .zip URL and file type", () => {
    const parsed = downloadV3Schema.parse(sampleDownload);
    const result = normalizeDownload({
      v3: parsed,
      packageName: "org.telegram.messenger.web",
      versionName: "13.3.1",
      updatedAt: null,
    });
    expect(result.urls[0]?.url).toBe("https://static-m.rustore.ru/release.zip");
    expect(result.urls[0]?.fileName).toBe("org.telegram.messenger.web-13.3.1.zip");
    expect(result.urls[0]?.isSplitBundle).toBe(true);
    expect(result.method).toBe("v3");
  });

  it("rejects malformed upstream payloads", () => {
    expect(() => appDetailsSchema.parse({ code: "OK", body: { appId: "x" } })).toThrow();
  });
});

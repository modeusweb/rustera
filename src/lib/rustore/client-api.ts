/**
 * Browser-side RuStore adapter used by the static export.
 * The upstream allows cross-origin GET/POST with the compatibility header
 * (verified 2026-11-23), so no server or CORS proxy is required.
 */
import type { AppDetails, DownloadResolution, SearchResultPage } from "@/types/domain";
import { RuStoreError } from "./errors";
import {
  appDetailsSchema,
  downloadV1Schema,
  downloadV2Schema,
  downloadV3Schema,
  searchResponseSchema,
} from "./schemas";
import {
  normalizeAppDetails,
  normalizeDownload,
  normalizeSearchResponse,
} from "./normalizers";
import { validateDownloadUrl } from "./download-url";

const API_BASE = "https://backapi.rustore.ru";
const VERSION_CODE = process.env.NEXT_PUBLIC_RUSTORE_VERSION_CODE ?? "1105001";

async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (VERSION_CODE) headers.set("ruStoreVerCode", VERSION_CODE);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, headers, cache: "no-store" });
  } catch {
    throw new RuStoreError({
      code: "UPSTREAM_UNAVAILABLE",
      message: "The application catalog is temporarily unavailable.",
    });
  }

  const text = await response.text();
  if (!text) {
    throw new RuStoreError({
      code: "UPSTREAM_UNAVAILABLE",
      message: "The application catalog returned an empty response.",
      status: response.status,
    });
  }

  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    throw new RuStoreError({
      code: "UPSTREAM_SCHEMA_CHANGE",
      message: "The application catalog returned a malformed response.",
      status: response.status,
    });
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
        ? data.message
        : "";
    if (/find required data|not found|does not match the required format/i.test(message)) {
      throw new RuStoreError({
        code: "NOT_FOUND",
        message: "The requested application was not found in the catalog.",
        kind: "business",
        status: response.status,
      });
    }
    throw new RuStoreError({
      code: response.status === 429 ? "UPSTREAM_RATE_LIMITED" : "UPSTREAM_UNAVAILABLE",
      message:
        response.status === 429
          ? "The catalog is receiving too many requests. Please wait a moment and retry."
          : "The application catalog is temporarily unavailable.",
      status: response.status,
    });
  }

  return data;
}

function unwrap(data: unknown): unknown {
  if (typeof data !== "object" || data === null || !("code" in data)) return data;
  const envelope = data as { code?: unknown; message?: unknown; body?: unknown };
  if (envelope.code !== "OK") {
    const message = typeof envelope.message === "string" ? envelope.message : "";
    if (/find required data|not found/i.test(message)) {
      throw new RuStoreError({
        code: "NOT_FOUND",
        message: "The requested application was not found in the catalog.",
        kind: "business",
        status: 404,
      });
    }
    throw new RuStoreError({
      code: "UPSTREAM_ERROR",
      message: "The catalog rejected the request.",
      kind: "business",
    });
  }
  return envelope.body;
}

export async function searchCatalogClient(input: {
  query: string;
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}): Promise<SearchResultPage> {
  const params = new URLSearchParams({
    pageNumber: String(input.page ?? 0),
    pageSize: String(input.pageSize ?? 20),
    query: input.query,
  });
  const raw = await request(`/applicationData/apps?${params}`, { signal: input.signal });
  const parsed = searchResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new RuStoreError({
      code: "UPSTREAM_SCHEMA_CHANGE",
      message: "The catalog returned an unexpected response format.",
    });
  }
  return normalizeSearchResponse(parsed.data, input.query);
}

/** Fills real file sizes from detail metadata with bounded concurrency. */
export async function enrichSearchPageClient(
  page: SearchResultPage,
  signal?: AbortSignal,
): Promise<SearchResultPage> {
  const queue = [...page.items];
  const sizes = new Map<string, number>();

  const worker = async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item || signal?.aborted) return;
      try {
        const details = await getAppDetailsClient(item.packageName, signal);
        if (details.fileSizeBytes !== null) sizes.set(item.packageName, details.fileSizeBytes);
      } catch {
        // Keep "Not available" when detail metadata cannot be loaded.
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(4, queue.length) }, worker));

  return {
    ...page,
    items: page.items.map((item) => ({
      ...item,
      fileSizeBytes: sizes.get(item.packageName) ?? item.fileSizeBytes,
    })),
  };
}

export async function getAppDetailsClient(
  packageName: string,
  signal?: AbortSignal,
): Promise<AppDetails> {
  const raw = unwrap(
    await request(`/applicationData/overallInfo/${encodeURIComponent(packageName)}`, { signal }),
  );
  const parsed = appDetailsSchema.safeParse({ code: "OK", body: raw });
  if (!parsed.success) {
    throw new RuStoreError({
      code: "UPSTREAM_SCHEMA_CHANGE",
      message: "The application metadata returned by the catalog was unexpected.",
    });
  }
  return normalizeAppDetails(parsed.data);
}

async function post(path: string, body: unknown, signal?: AbortSignal): Promise<unknown | null> {
  try {
    return await request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    return null;
  }
}

export async function resolveDownloadClient(
  packageName: string,
  signal?: AbortSignal,
): Promise<DownloadResolution> {
  const details = await getAppDetailsClient(packageName, signal);
  if ((details.price ?? 0) > 0) {
    throw new RuStoreError({
      code: "DOWNLOAD_UNAVAILABLE",
      message: "This application is not free. No download link is offered.",
      kind: "business",
      status: 403,
    });
  }

  const device = {
    appId: details.appId,
    firstInstall: true,
    mobileServices: ["GMS", "HMS"],
    supportedAbis: ["arm64-v8a", "armeabi-v7a", "x86_64", "x86"],
    screenDensity: 480,
    supportedLocales: ["ru_RU", "en_US"],
    sdkVersion: 36,
    withoutSplits: false,
  };

  const v3 = await post("/v3/showcase/apps/download-link", device, signal);
  if (v3 && typeof v3 === "object" && "downloadUrls" in v3) {
    const parsed = downloadV3Schema.safeParse(v3);
    if (parsed.success && parsed.data.downloadUrls.length > 0) {
      return normalizeDownload({
        v3: parsed.data,
        packageName: details.packageName,
        versionName: details.versionName,
        updatedAt: details.updatedAt,
      });
    }
  }

  const v2 = await post("/applicationData/v2/download-link", device, signal);
  if (v2 !== null) {
    const parsed = downloadV2Schema.safeParse(v2);
    if (parsed.success && parsed.data.code === "OK" && parsed.data.body.downloadUrls.length > 0) {
      return normalizeDownload({
        v2: parsed.data,
        packageName: details.packageName,
        versionName: details.versionName,
        updatedAt: details.updatedAt,
      });
    }
  }

  const v1 = await post(
    "/applicationData/download-link",
    { appId: details.appId, firstInstall: true },
    signal,
  );
  if (v1 !== null) {
    const parsed = downloadV1Schema.safeParse(v1);
    if (parsed.success && parsed.data.code === "OK" && parsed.data.body.apkUrl) {
      return normalizeDownload({
        v1: parsed.data,
        packageName: details.packageName,
        versionName: details.versionName,
        updatedAt: details.updatedAt,
      });
    }
  }

  throw new RuStoreError({
    code: "DOWNLOAD_UNAVAILABLE",
    message: "No downloadable file is available for this release. The app may be distributed externally.",
    kind: "business",
    status: 404,
  });
}

/** Validates every resolved URL before the browser is allowed to follow it. */
export function validatedDownloadUrl(resolution: DownloadResolution): string {
  if (resolution.urls.length === 0) {
    throw new RuStoreError({
      code: "DOWNLOAD_UNAVAILABLE",
      message: "No downloadable file is available for this release.",
      kind: "business",
    });
  }
  return validateDownloadUrl(resolution.urls[0]!.url).toString();
}

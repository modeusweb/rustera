import type { AppDetails, AppSummary, DownloadResolution, DownloadUrl, SearchResultPage } from "@/types/domain";
import { safeFileName } from "@/lib/validation/input";
import { normalizeUpstreamAndroidVersion } from "@/lib/android/sdk";
import type { AppDetailsRaw, DownloadV1Raw, DownloadV2Raw, DownloadV3Raw, SearchItemRaw } from "./types";
import type { SearchResponseRaw } from "./types";

function asNumber(value: number | null): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizeSearchItem(raw: SearchItemRaw): AppSummary {
  const price = raw.price === null || raw.price === undefined ? null : Number(raw.price);
  return {
    appId: asNumber(raw.appId) ?? 0,
    packageName: raw.packageName,
    name: raw.appName,
    shortDescription: raw.shortDescription ?? null,
    iconUrl: raw.iconUrl ?? null,
    minSdkVersion: asNumber(raw.minSdkVersion),
    versionCode: asNumber(raw.versionCode),
    versionName: raw.versionName ?? null,
    developer: null,
    price: Number.isFinite(price) ? price : null,
    rating: typeof raw.averageUserRating === "number" ? raw.averageUserRating : null,
    ratingVotes: typeof raw.totalRatings === "number" ? raw.totalRatings : null,
    downloadsText: raw.roundedDownloadsText ?? null,
    fileSizeBytes: null,
  };
}

export function normalizeSearchResponse(raw: SearchResponseRaw, query: string): SearchResultPage {
  const page = "body" in raw ? raw.body : raw;
  return {
    items: page.content.map(normalizeSearchItem),
    pageNumber: page.pageNumber ?? 0,
    pageSize: page.pageSize ?? page.content.length,
    totalElements: page.totalElements ?? page.content.length,
    totalPages: page.totalPages ?? 1,
    query,
  };
}

export function normalizeAppDetails(raw: AppDetailsRaw): AppDetails {
  const body = raw.body;
  const price = body.price === null || body.price === undefined ? null : Number(body.price);
  const screenshots = (body.fileUrls ?? [])
    .filter((file) => file.type === null || file.type === undefined || file.type === "SCREENSHOT")
    .map((file) => ({
      url: file.fileUrl,
      ordinal: file.ordinal ?? 0,
      orientation: file.orientation ?? null,
    }))
    .sort((a, b) => a.ordinal - b.ordinal);

  return {
    appId: asNumber(body.appId) ?? 0,
    packageName: body.packageName,
    name: body.appName,
    shortDescription: body.shortDescription ?? null,
    iconUrl: body.iconUrl ?? null,
    minSdkVersion: asNumber(body.minSdkVersion),
    versionCode: asNumber(body.versionCode),
    versionName: body.versionName ?? null,
    developer: body.companyName ?? null,
    price: Number.isFinite(price) ? price : null,
    rating: body.rating?.average ?? null,
    ratingVotes: body.rating?.votes ?? null,
    downloadsText: null,
    categories: body.categories ?? [],
    fullDescription: body.fullDescription ?? null,
    whatsNew: body.whatsNew ?? null,
    fileSizeBytes: asNumber(body.fileSize),
    targetSdkVersion: asNumber(body.targetSdkVersion),
    maxSdkVersion: asNumber(body.maxSdkVersion),
    minAndroidVersion: normalizeUpstreamAndroidVersion(body.minAndroidVersion),
    downloads: asNumber(body.downloads),
    ageRating: body.ageRestriction?.category ?? body.ageLegal ?? null,
    ageRatingName: body.ageRestriction?.name ?? null,
    screenshots,
    signatures: body.signatures ?? (body.signature ? [body.signature] : []),
    updatedAt: body.appVerUpdatedAt ?? null,
    firstPublishedAt: body.firstPublishedAt ?? null,
    hasExternalSource: Boolean(body.aggregatorInfo),
    externalSourceName: body.aggregatorInfo?.displayedSource ?? body.aggregatorInfo?.source ?? null,
    deviceTypes: body.deviceTypes ?? [],
    versionId: asNumber(body.versionId),
    sourceUrl: `https://www.rustore.ru/catalog/app/${encodeURIComponent(body.packageName)}`,
  };
}

function buildDownloadUrl(
  rawUrl: string,
  size: number | null,
  upstreamDigest: string | null,
  packageName: string,
  versionName: string | null,
): DownloadUrl {
  // The URL path may end in .zip; never rewrite it to .apk.
  const parsed = new URL(rawUrl);
  const pathName = parsed.pathname.split("/").pop() ?? "download";
  const isSplitBundle = pathName.toLowerCase().endsWith(".zip");
  const base = safeFileName(packageName);
  const version = versionName ? `-${safeFileName(versionName)}` : "";
  const fileName = `${base}${version}${isSplitBundle ? ".zip" : ".apk"}`;

  return {
    url: rawUrl,
    sizeBytes: size,
    upstreamDigest,
    fileName,
    contentType: isSplitBundle
      ? "application/zip (split APK bundle)"
      : "application/vnd.android.package-archive",
    isSplitBundle,
  };
}

export function normalizeDownload(params: {
  v3?: DownloadV3Raw;
  v2?: DownloadV2Raw;
  v1?: DownloadV1Raw;
  packageName: string;
  versionName: string | null;
  updatedAt: string | null;
}): DownloadResolution {
  const payload = params.v3 ?? params.v2?.body;
  const resolvedAt = new Date().toISOString();

  if (payload && payload.downloadUrls.length > 0) {
    return {
      appId: asNumber(payload.appId) ?? 0,
      packageName: params.packageName,
      versionCode: asNumber(payload.versionCode),
      versionId: asNumber(payload.versionId),
      signingCertificate: payload.signature ?? null,
      releaseDate: params.updatedAt,
      urls: payload.downloadUrls.map((item) =>
        buildDownloadUrl(
          item.url,
          asNumber(item.size),
          item.hash ?? null,
          params.packageName,
          params.versionName,
        ),
      ),
      method: params.v3 ? "v3" : "v2",
      resolvedAt,
      // Signed URLs expire; the exact lifetime is not published upstream.
      expiresAt: null,
    };
  }

  if (params.v1?.body.apkUrl) {
    return {
      appId: asNumber(params.v1.body.appId) ?? 0,
      packageName: params.packageName,
      versionCode: asNumber(params.v1.body.versionCode),
      versionId: null,
      signingCertificate: null,
      releaseDate: params.updatedAt,
      urls: [
        buildDownloadUrl(
          params.v1.body.apkUrl,
          null,
          null,
          params.packageName,
          params.versionName,
        ),
      ],
      method: "v1",
      resolvedAt,
      expiresAt: null,
    };
  }

  throw new Error("No downloadable URL in any upstream response.");
}

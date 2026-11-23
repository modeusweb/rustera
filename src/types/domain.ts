/**
 * Internal domain models. These are provider-agnostic: upstream field names never
 * leak past the normalization layer.
 */

export interface AppSummary {
  appId: number;
  packageName: string;
  name: string;
  shortDescription: string | null;
  iconUrl: string | null;
  minSdkVersion: number | null;
  versionCode: number | null;
  versionName: string | null;
  developer: string | null;
  price: number | null;
  rating: number | null;
  ratingVotes: number | null;
  downloadsText: string | null;
  /** Filled by detail enrichment; null when the upstream search payload omits it. */
  fileSizeBytes: number | null;
}

export interface AppScreenshot {
  url: string;
  ordinal: number;
  orientation: string | null;
}

export interface AppDetails extends AppSummary {
  categories: string[];
  fullDescription: string | null;
  whatsNew: string | null;
  fileSizeBytes: number | null;
  targetSdkVersion: number | null;
  maxSdkVersion: number | null;
  minAndroidVersion: string | null;
  downloads: number | null;
  ageRating: string | null;
  ageRatingName: string | null;
  screenshots: AppScreenshot[];
  signatures: string[];
  updatedAt: string | null;
  firstPublishedAt: string | null;
  hasExternalSource: boolean;
  externalSourceName: string | null;
  deviceTypes: string[];
  versionId: number | null;
  sourceUrl: string;
}

export interface SearchResultPage {
  items: AppSummary[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  query: string;
}

export interface DownloadUrl {
  url: string;
  sizeBytes: number | null;
  upstreamDigest: string | null;
  fileName: string;
  contentType: string;
  isSplitBundle: boolean;
}

export interface DownloadResolution {
  appId: number;
  packageName: string;
  versionCode: number | null;
  versionId: number | null;
  signingCertificate: string | null;
  releaseDate: string | null;
  urls: DownloadUrl[];
  method: "v3" | "v2" | "v1";
  resolvedAt: string;
  expiresAt: string | null;
}

export type ErrorCode =
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "UPSTREAM_UNAVAILABLE"
  | "UPSTREAM_RATE_LIMITED"
  | "UPSTREAM_SCHEMA_CHANGE"
  | "UPSTREAM_ERROR"
  | "DOWNLOAD_UNAVAILABLE"
  | "UNEXPECTED_ERROR";

export interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    requestId: string;
  };
}

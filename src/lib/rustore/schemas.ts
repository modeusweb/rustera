import { z } from "zod";

/**
 * Zod schemas for observed upstream payloads. Unknown fields are stripped.
 * Numeric fields are coerced because upstream occasionally sends numeric strings.
 */

const numeric = z.union([z.number(), z.string().regex(/^\d+$/)]).transform(Number).nullable();

const envelope = <T extends z.ZodTypeAny>(body: T) =>
  z.object({
    code: z.string(),
    message: z.string().nullable().optional(),
    body,
    timestamp: z.string().optional(),
  });

export const searchItemSchema = z.object({
  appId: numeric,
  packageName: z.string().min(1),
  appName: z.string().min(1),
  minSdkVersion: numeric,
  shortDescription: z.string().nullable().optional(),
  iconUrl: z.string().url().nullable().optional(),
  appType: z.string().nullable().optional(),
  versionCode: numeric,
  versionName: z.string().nullable().optional(),
  price: z.union([z.number(), z.string()]).nullable().optional(),
  averageUserRating: z.number().nullable().optional(),
  totalRatings: z.number().nullable().optional(),
  roundedDownloadsText: z.string().nullable().optional(),
});

export const searchResponseSchema = z.union([
  envelope(
    z.object({
      content: z.array(searchItemSchema),
      pageNumber: z.number().optional(),
      pageSize: z.number().optional(),
      totalElements: z.number().optional(),
      totalPages: z.number().optional(),
    }),
  ),
  // The v3 showcase variant returns the page object directly.
  z.object({
    content: z.array(searchItemSchema),
    pageNumber: z.number().optional(),
    pageSize: z.number().optional(),
    totalElements: z.number().optional(),
    totalPages: z.number().optional(),
  }),
]);

const screenshotSchema = z.object({
  fileUrl: z.string().url(),
  ordinal: z.number().nullable().optional(),
  type: z.string().nullable().optional(),
  orientation: z.string().nullable().optional(),
});

const ageRestrictionSchema = z.object({
  category: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
}).nullable();

const aggregatorSchema = z.object({
  companyName: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  displayedSource: z.string().nullable().optional(),
}).nullable();

const ratingSchema = z.object({
  average: z.number().nullable().optional(),
  votes: z.number().nullable().optional(),
}).nullable();

export const appDetailsSchema = envelope(
  z.object({
    appId: numeric,
    packageName: z.string().min(1),
    appName: z.string().min(1),
    categories: z.array(z.string()).nullable().optional(),
    companyName: z.string().nullable().optional(),
    shortDescription: z.string().nullable().optional(),
    fullDescription: z.string().nullable().optional(),
    fileSize: numeric,
    versionName: z.string().nullable().optional(),
    versionCode: numeric,
    minSdkVersion: numeric,
    minAndroidVersion: z.string().nullable().optional(),
    targetSdkVersion: numeric,
    maxSdkVersion: numeric,
    whatsNew: z.string().nullable().optional(),
    iconUrl: z.string().url().nullable().optional(),
    fileUrls: z.array(screenshotSchema).nullable().optional(),
    signatures: z.array(z.string()).nullable().optional(),
    signature: z.string().nullable().optional(),
    ageRestriction: ageRestrictionSchema.optional(),
    rating: ratingSchema.optional(),
    downloads: numeric,
    price: z.union([z.number(), z.string()]).nullable().optional(),
    appVerUpdatedAt: z.string().nullable().optional(),
    firstPublishedAt: z.string().nullable().optional(),
    aggregatorInfo: aggregatorSchema.optional(),
    deviceTypes: z.array(z.string()).nullable().optional(),
    versionId: numeric,
    ageLegal: z.string().nullable().optional(),
  }),
);

const downloadUrlSchema = z.object({
  url: z.string().url(),
  size: numeric,
  hash: z.string().nullable().optional(),
});

const downloadPayloadSchema = z.object({
  appId: numeric,
  versionCode: numeric,
  versionId: numeric,
  downloadUrls: z.array(downloadUrlSchema),
  signature: z.string().nullable().optional(),
});

export const downloadV3Schema = downloadPayloadSchema;

export const downloadV2Schema = envelope(downloadPayloadSchema);

export const downloadV1Schema = envelope(
  z.object({
    appId: numeric,
    versionCode: numeric,
    apkUrl: z.string().url(),
  }),
);

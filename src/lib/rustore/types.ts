import type { z } from "zod";
import type {
  appDetailsSchema,
  downloadV1Schema,
  downloadV2Schema,
  downloadV3Schema,
  searchItemSchema,
  searchResponseSchema,
} from "./schemas";

export type SearchItemRaw = z.infer<typeof searchItemSchema>;
export type SearchResponseRaw = z.infer<typeof searchResponseSchema>;
export type AppDetailsRaw = z.infer<typeof appDetailsSchema>;
export type DownloadV3Raw = z.infer<typeof downloadV3Schema>;
export type DownloadV2Raw = z.infer<typeof downloadV2Schema>;
export type DownloadV1Raw = z.infer<typeof downloadV1Schema>;

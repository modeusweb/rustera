import { z } from "zod";

/** Android package identifiers: segments of [A-Za-z0-9_], each starting with a letter. */
export const PACKAGE_NAME_PATTERN =
  /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/;

export const packageNameSchema = z
  .string()
  .trim()
  .min(3)
  .max(255)
  .regex(PACKAGE_NAME_PATTERN, "Enter a valid Android package identifier.");

export const searchQuerySchema = z
  .string()
  .trim()
  .min(1, "Enter a search query.")
  .max(120, "Search queries must be 120 characters or fewer.");

export const pageNumberSchema = z.coerce.number().int().min(0).max(10_000).default(0);

export const pageSizeSchema = z.coerce.number().int().min(1).max(50).default(20);

export const deviceTypeSchema = z.enum(["mobile", "tv"]).default("mobile");

export function isValidPackageName(value: string): boolean {
  return packageNameSchema.safeParse(value).success;
}

/** Sanitizes a package name for use in a generated file name. */
export function safeFileName(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 200) || "application";
}

import type { ErrorCode } from "@/types/domain";

/**
 * Typed integration errors. `transport` errors describe HTTP/network/schema
 * problems; `business` errors describe upstream responses that are valid but
 * cannot satisfy the request (app missing, no download file, etc.).
 */
export class RuStoreError extends Error {
  readonly code: ErrorCode;
  readonly status: number | null;
  readonly kind: "transport" | "business";
  readonly retryable: boolean;

  constructor(options: {
    code: ErrorCode;
    message: string;
    status?: number | null;
    kind?: "transport" | "business";
    retryable?: boolean;
  }) {
    super(options.message);
    this.name = "RuStoreError";
    this.code = options.code;
    this.status = options.status ?? null;
    this.kind = options.kind ?? "transport";
    this.retryable = options.retryable ?? false;
  }
}

export function toPublicError(error: unknown): { code: ErrorCode; message: string } {
  if (error instanceof RuStoreError) {
    return { code: error.code, message: error.message };
  }
  return {
    code: "UNEXPECTED_ERROR",
    message: "An unexpected error occurred. Please try again.",
  };
}

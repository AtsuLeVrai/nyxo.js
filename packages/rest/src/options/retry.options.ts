import { z } from "zod";

export const RetryOnOptions = z
  .object({
    networkErrors: z.boolean().default(true),
    timeouts: z.boolean().default(true),
    rateLimits: z.boolean().default(true),
  })
  .strict();

const DEFAULT_RETRYABLE_STATUS_CODES = [
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
];

const DEFAULT_RETRYABLE_ERRORS = [
  "ECONNRESET", // Connection was forcibly closed
  "ETIMEDOUT", // Connection timed out
  "ECONNREFUSED", // Connection was refused
  "EPIPE", // Broken pipe
  "ENOTFOUND", // DNS lookup failed
  "ENETUNREACH", // Network unreachable
];

const DEFAULT_NON_RETRYABLE_STATUS_CODES = [
  401, // Unauthorized
  403, // Forbidden
  404, // Not Found
];

const DEFAULT_NON_RETRYABLE_ERRORS = [
  "ERR_INVALID_TOKEN", // Invalid authentication token
  "ERR_INVALID_AUTH", // Invalid authentication credentials
];

export const RetryOptions = z
  .object({
    maxRetries: z.number().int().positive().default(3),
    backoff: z.number().int().positive().default(2),
    maxDelay: z.number().int().positive().default(5000),
    jitter: z.number().positive().min(0).max(1).default(0.1),
    retryableStatusCodes: z
      .array(z.number())
      .default(DEFAULT_RETRYABLE_STATUS_CODES),
    retryableErrors: z.array(z.string()).default(DEFAULT_RETRYABLE_ERRORS),
    nonRetryableStatusCodes: z
      .array(z.number())
      .default(DEFAULT_NON_RETRYABLE_STATUS_CODES),
    nonRetryableErrors: z
      .array(z.string())
      .default(DEFAULT_NON_RETRYABLE_ERRORS),
    retryOn: RetryOnOptions.default({}),
  })
  .strict();

export type RetryOptions = z.infer<typeof RetryOptions>;

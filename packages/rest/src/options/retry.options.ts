import { z } from "zod";

const RETRY_DEFAULTS = {
  MAX_RETRIES: 3,
  BACKOFF: 2,
  MAX_DELAY: 5000,
  JITTER: 0.1,
  MIN_DELAY: 100,
  MAX_JITTER: 500,
  NETWORK_ERROR: [
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "EPIPE",
    "ENOTFOUND",
    "ENETUNREACH",
  ] as string[],
  RETRYABLE_STATUS_CODES: [
    408, // Request Timeout
    429, // Too Many Requests
    500, // Internal Server Error
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
  ] as number[],
  RETRYABLE_ERRORS: [
    "ECONNRESET",
    "ECONNREFUSED",
    "EPIPE",
    "ENOTFOUND",
    "ETIMEDOUT",
    "EAI_AGAIN",
  ] as string[],
  NON_RETRYABLE_STATUS_CODES: [
    401, // Unauthorized
    403, // Forbidden
    404, // Not Found
  ] as number[],
  NON_RETRYABLE_ERRORS: [
    "ERR_INVALID_TOKEN", // Invalid token
    "ERR_INVALID_AUTH", // Invalid auth
  ] as string[],
} as const;

export const RetryOnOptions = z
  .object({
    networkErrors: z.boolean().default(true),
    timeouts: z.boolean().default(true),
    rateLimits: z.boolean().default(true),
  })
  .strict()
  .readonly();

export const RetryOptions = z
  .object({
    maxRetries: z.number().int().positive().default(RETRY_DEFAULTS.MAX_RETRIES),
    backoff: z.number().int().positive().default(RETRY_DEFAULTS.BACKOFF),
    minDelay: z.number().int().positive().default(RETRY_DEFAULTS.MIN_DELAY),
    maxDelay: z.number().int().positive().default(RETRY_DEFAULTS.MAX_DELAY),
    jitter: z.number().positive().min(0).max(1).default(RETRY_DEFAULTS.JITTER),
    maxJitter: z.number().int().positive().default(RETRY_DEFAULTS.MAX_JITTER),
    retryableStatusCodes: z
      .array(z.number())
      .default(RETRY_DEFAULTS.RETRYABLE_STATUS_CODES),
    retryableErrors: z
      .array(z.string())
      .default(RETRY_DEFAULTS.RETRYABLE_ERRORS),
    nonRetryableStatusCodes: z
      .array(z.number())
      .default(RETRY_DEFAULTS.NON_RETRYABLE_STATUS_CODES),
    nonRetryableErrors: z
      .array(z.string())
      .default(RETRY_DEFAULTS.NON_RETRYABLE_ERRORS),
    networkErrors: z.array(z.string()).default(RETRY_DEFAULTS.NETWORK_ERROR),
    retryOn: RetryOnOptions.default({}),
  })
  .strict()
  .readonly();

export type RetryOptions = z.infer<typeof RetryOptions>;

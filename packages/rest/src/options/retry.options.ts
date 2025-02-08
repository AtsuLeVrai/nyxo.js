import { z } from "zod";

/**
 * Configuration for retry behavior on different types of errors
 */
export const RetryOnOptions = z
  .object({
    /** Whether to retry on network-related errors */
    networkErrors: z.boolean().default(true),
    /** Whether to retry on timeout errors */
    timeouts: z.boolean().default(true),
    /** Whether to retry on rate limit errors */
    rateLimits: z.boolean().default(true),
  })
  .strict();

/**
 * Common HTTP status codes that typically indicate temporary issues
 */
const DEFAULT_RETRYABLE_STATUS_CODES = [
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
];

/**
 * Common network errors that typically indicate temporary issues
 */
const DEFAULT_RETRYABLE_ERRORS = [
  "ECONNRESET", // Connection was forcibly closed
  "ETIMEDOUT", // Connection timed out
  "ECONNREFUSED", // Connection was refused
  "EPIPE", // Broken pipe
  "ENOTFOUND", // DNS lookup failed
  "ENETUNREACH", // Network unreachable
];

/**
 * HTTP status codes that should never be retried
 */
const DEFAULT_NON_RETRYABLE_STATUS_CODES = [
  401, // Unauthorized
  403, // Forbidden
  404, // Not Found
];

/**
 * Error codes that should never be retried
 */
const DEFAULT_NON_RETRYABLE_ERRORS = [
  "ERR_INVALID_TOKEN", // Invalid authentication token
  "ERR_INVALID_AUTH", // Invalid authentication credentials
];

/**
 * Comprehensive retry configuration options
 */
export const RetryOptions = z
  .object({
    /** Maximum number of retry attempts */
    maxRetries: z.number().int().positive().default(3),

    /** Exponential backoff factor */
    backoff: z.number().int().positive().default(2),

    /** Maximum delay between retries in milliseconds */
    maxDelay: z.number().int().positive().default(5000),

    /** Random variance in retry timing (0-1) */
    jitter: z.number().positive().min(0).max(1).default(0.1),

    /** HTTP status codes that should trigger a retry */
    retryableStatusCodes: z
      .array(z.number())
      .default(DEFAULT_RETRYABLE_STATUS_CODES),

    /** Error codes that should trigger a retry */
    retryableErrors: z.array(z.string()).default(DEFAULT_RETRYABLE_ERRORS),

    /** HTTP status codes that should never trigger a retry */
    nonRetryableStatusCodes: z
      .array(z.number())
      .default(DEFAULT_NON_RETRYABLE_STATUS_CODES),

    /** Error codes that should never trigger a retry */
    nonRetryableErrors: z
      .array(z.string())
      .default(DEFAULT_NON_RETRYABLE_ERRORS),

    /** Configuration for specific retry scenarios */
    retryOn: RetryOnOptions.default({}),
  })
  .strict();

export type RetryOptions = z.infer<typeof RetryOptions>;

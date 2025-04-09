import { z } from "zod";

/**
 * Configuration options for the retry mechanism
 *
 * Controls how failed requests are retried, including timeouts,
 * eligible HTTP methods, status codes, and network error types.
 */
export const RetryOptions = z
  .object({
    /**
     * Maximum number of retry attempts before giving up
     * @default 5
     */
    maxRetries: z.number().int().min(0).default(5),

    /**
     * Maximum timeout in milliseconds between retry attempts
     * @default 30000
     */
    maxTimeout: z.number().int().min(0).default(30000),

    /**
     * Minimum timeout in milliseconds between retry attempts
     * @default 500
     */
    minTimeout: z.number().int().min(0).default(500),

    /**
     * Exponential backoff factor applied to timeouts between retries
     * Each retry's timeout is multiplied by this factor
     * @default 2
     */
    timeoutFactor: z.number().min(1).default(2),

    /**
     * Whether to respect the retry-after header from Discord
     * @default true
     */
    retryAfter: z.boolean().default(true),

    /**
     * HTTP methods that are eligible for retry
     * @default ["GET", "PUT", "HEAD", "OPTIONS", "DELETE"]
     */
    methods: z
      .array(z.string())
      .default(["GET", "PUT", "HEAD", "OPTIONS", "DELETE"]),

    /**
     * HTTP status codes that trigger a retry
     * @default [429, 500, 502, 503, 504]
     */
    statusCodes: z.array(z.number()).default([429, 500, 502, 503, 504]),

    /**
     * Network error codes that trigger a retry
     * @default ["ECONNRESET", "ECONNREFUSED", "ENOTFOUND", "ENETDOWN", "ENETUNREACH", "EHOSTDOWN", "UND_ERR_SOCKET"]
     */
    errorCodes: z
      .array(z.string())
      .default([
        "ECONNRESET",
        "ECONNREFUSED",
        "ENOTFOUND",
        "ENETDOWN",
        "ENETUNREACH",
        "EHOSTDOWN",
        "UND_ERR_SOCKET",
      ]),
  })
  .strict()
  .readonly();

export type RetryOptions = z.infer<typeof RetryOptions>;

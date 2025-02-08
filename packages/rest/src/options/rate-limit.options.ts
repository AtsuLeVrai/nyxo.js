import { z } from "zod";

/**
 * Default values for rate limit configuration
 */
const RATE_LIMIT_DEFAULTS = {
  CLEANUP_INTERVAL: 60_000, // 1 minute in milliseconds
  SAFETY_MARGIN: 1_000, // 1 second in milliseconds
} as const;

/**
 * Rate limiting configuration options
 */
export const RateLimitOptions = z
  .object({
    /** Interval in milliseconds to clean up expired rate limit buckets */
    cleanupInterval: z
      .number()
      .int()
      .positive()
      .default(RATE_LIMIT_DEFAULTS.CLEANUP_INTERVAL),

    /** Additional time in milliseconds to wait before considering a rate limit expired */
    safetyMargin: z
      .number()
      .int()
      .positive()
      .default(RATE_LIMIT_DEFAULTS.SAFETY_MARGIN),
  })
  .strict();

export type RateLimitOptions = z.infer<typeof RateLimitOptions>;

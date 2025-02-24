import { z } from "zod";

/**
 * Configuration options for rate limiting
 *
 * Controls how the client manages Discord API rate limits,
 * including cleanup intervals, safety margins, and request limits
 */
export const RateLimitOptions = z
  .object({
    /**
     * Safety margin in milliseconds to avoid hitting rate limits
     * Prevents using the last request in a bucket that's close to resetting
     * @default 1000
     */
    safetyMargin: z.number().int().default(1000),

    /**
     * Global maximum requests per second
     * Used to implement client-side global rate limiting
     * @default 50
     */
    requestsPerSecond: z.number().int().default(50),

    /**
     * Maximum number of invalid requests allowed in a time window
     * Helps prevent Cloudflare bans for excessive invalid requests
     * @default 10000
     */
    invalidRequestsLimit: z.number().int().default(10_000),

    /**
     * Time window in milliseconds for counting invalid requests
     * @default 600000 (10 minutes)
     */
    invalidRequestsWindow: z.number().int().default(600_000),
  })
  .strict()
  .readonly();

export type RateLimitOptions = z.infer<typeof RateLimitOptions>;

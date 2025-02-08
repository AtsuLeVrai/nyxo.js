import { z } from "zod";

const RATE_LIMIT_DEFAULTS = {
  CLEANUP_INTERVAL: 60_000, // 1 minute in milliseconds
  SAFETY_MARGIN: 1_000, // 1 second in milliseconds
} as const;

export const RateLimitOptions = z
  .object({
    cleanupInterval: z
      .number()
      .int()
      .positive()
      .default(RATE_LIMIT_DEFAULTS.CLEANUP_INTERVAL),
    safetyMargin: z
      .number()
      .int()
      .positive()
      .default(RATE_LIMIT_DEFAULTS.SAFETY_MARGIN),
  })
  .strict();

export type RateLimitOptions = z.infer<typeof RateLimitOptions>;

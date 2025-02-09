import { z } from "zod";

const RATE_LIMIT_DEFAULTS = {
  CLEANUP_INTERVAL: 60_000,
  SAFETY_MARGIN: 1000,
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
  .strict()
  .readonly();

export type RateLimitOptions = z.infer<typeof RateLimitOptions>;

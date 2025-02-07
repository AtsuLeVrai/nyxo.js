import { z } from "zod";

export const RateLimitOptions = z
  .object({
    cleanupInterval: z.number().int().positive().default(60_000),
    safetyMargin: z.number().int().positive().default(50),
    globalRateLimit: z.number().int().positive().default(50),
    invalidRequestLimit: z.number().int().positive().default(10000),
    invalidRequestWindow: z.number().int().positive().default(10),
    defaultRetryDelay: z.number().int().positive().default(500),
  })
  .strict();

export type RateLimitOptions = z.infer<typeof RateLimitOptions>;

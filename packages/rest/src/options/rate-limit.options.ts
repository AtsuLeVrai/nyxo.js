import { z } from "zod";

export const RateLimitOptions = z
  .object({
    cleanupInterval: z.number().int().default(60000),
    safetyMargin: z.number().int().default(1000),
    requestsPerSecond: z.number().int().default(50),
    invalidRequestsLimit: z.number().int().default(10_000),
    invalidRequestsWindow: z.number().int().default(600_000),
  })
  .strict()
  .readonly();

export type RateLimitOptions = z.infer<typeof RateLimitOptions>;

import { z } from "zod";

export const RateLimitOptions = z
  .object({
    cleanupInterval: z.number().int().positive().default(60000),
    safetyMargin: z.number().int().positive().default(1000),
  })
  .strict()
  .readonly();

export type RateLimitOptions = z.infer<typeof RateLimitOptions>;

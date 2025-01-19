import { z } from "zod";

export const RateLimiterOptions = z.object({
  invalidRequestWindow: z.number().int().default(600_000),
  invalidRequestMaxLimit: z.number().int().default(10_000),
  latencyThreshold: z.number().int().default(30_000),
  maxLatencyEntries: z.number().int().default(10),
});

import { z } from "zod";

export const RateLimiterOptions = z.object({
  invalidRequestWindow: z.number().positive().default(600_000),
  invalidRequestMaxLimit: z.number().positive().default(10_000),
});

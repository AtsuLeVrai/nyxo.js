import { z } from "zod";
import { API_CONSTANTS } from "../constants/index.js";

export const RateLimitOptions = z
  .object({
    cleanupInterval: z
      .number()
      .int()
      .positive()
      .default(API_CONSTANTS.RATE_LIMIT.CLEANUP_INTERVAL),
    safetyMargin: z
      .number()
      .int()
      .positive()
      .default(API_CONSTANTS.RATE_LIMIT.SAFETY_MARGIN),
  })
  .strict();

export type RateLimitOptions = z.infer<typeof RateLimitOptions>;

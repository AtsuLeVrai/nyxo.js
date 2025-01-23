import { z } from "zod";
import { HttpOptions } from "./http.options.js";
import { RateLimiterOptions } from "./rate-limiter.options.js";

export const QueueOptions = z.object({
  concurrency: z.number().int().default(5),
  intervalCap: z.number().int().default(10),
  interval: z.number().int().default(1000),
  timeout: z.number().int().default(15000),
  autoStart: z.boolean().default(true),
  throwOnTimeout: z.boolean().default(false),
  carryoverConcurrencyCount: z.boolean().default(false),
});

export const RestOptions = z.object({
  maxRetries: z.number().int().default(Number.MAX_SAFE_INTEGER),
  ...HttpOptions.shape,
  ...RateLimiterOptions.shape,
  ...QueueOptions.shape,
});

import { z } from "zod";

export const DEFAULT_RATE_LIMITER_OPTIONS = {
  invalidRequestWindow: 600_000,
  invalidRequestMaxLimit: 10_000,
  latencyThreshold: 30_000,
  maxLatencyEntries: 10,
  cleanupInterval: 30_000,
} as const;

export const RateLimiterOptions = z
  .object({
    invalidRequestWindow: z
      .number()
      .int()
      .positive()
      .default(DEFAULT_RATE_LIMITER_OPTIONS.invalidRequestWindow),
    invalidRequestMaxLimit: z
      .number()
      .int()
      .positive()
      .default(DEFAULT_RATE_LIMITER_OPTIONS.invalidRequestMaxLimit),
    latencyThreshold: z
      .number()
      .int()
      .positive()
      .default(DEFAULT_RATE_LIMITER_OPTIONS.latencyThreshold),
    maxLatencyEntries: z
      .number()
      .int()
      .positive()
      .default(DEFAULT_RATE_LIMITER_OPTIONS.maxLatencyEntries),
    cleanupInterval: z
      .number()
      .int()
      .positive()
      .default(DEFAULT_RATE_LIMITER_OPTIONS.cleanupInterval),
  })
  .strict();

export type RateLimiterOptions = z.infer<typeof RateLimiterOptions>;

import { z } from "zod";

const DEFAULT_INVALID_REQUEST_WINDOW = 600_000;
const DEFAULT_INVALID_REQUEST_MAX_LIMIT = 10_000;
const DEFAULT_LATENCY_THRESHOLD = 30_000;
const DEFAULT_MAX_LATENCY_ENTRIES = 10;
const DEFAULT_CLEANUP_INTERVAL = 30_000;

export const RateLimiterOptions = z
  .object({
    invalidRequestWindow: z
      .number()
      .int()
      .positive()
      .default(DEFAULT_INVALID_REQUEST_WINDOW),
    invalidRequestMaxLimit: z
      .number()
      .int()
      .positive()
      .default(DEFAULT_INVALID_REQUEST_MAX_LIMIT),
    latencyThreshold: z
      .number()
      .int()
      .positive()
      .default(DEFAULT_LATENCY_THRESHOLD),
    maxLatencyEntries: z
      .number()
      .int()
      .positive()
      .default(DEFAULT_MAX_LATENCY_ENTRIES),
    cleanupInterval: z
      .number()
      .int()
      .positive()
      .default(DEFAULT_CLEANUP_INTERVAL),
  })
  .strict();

export type RateLimiterOptions = z.infer<typeof RateLimiterOptions>;

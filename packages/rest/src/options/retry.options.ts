import { z } from "zod";

export const RetryOnOptions = z
  .object({
    networkErrors: z.boolean().default(true),
    timeouts: z.boolean().default(true),
    rateLimits: z.boolean().default(true),
  })
  .strict();

export const RetryOptions = z
  .object({
    maxRetries: z.number().int().positive().default(3),
    baseDelay: z.number().int().positive().default(1000),
    backoff: z.number().int().positive().default(2),
    maxDelay: z.number().int().positive().default(5000),
    jitter: z.number().positive().min(0).max(1).default(0.1),
    retryableStatusCodes: z
      .array(z.number())
      .default([408, 429, 500, 502, 503, 504]),
    retryableErrors: z
      .array(z.string())
      .default([
        "ECONNRESET",
        "ETIMEDOUT",
        "ECONNREFUSED",
        "EPIPE",
        "ENOTFOUND",
        "ENETUNREACH",
      ]),
    nonRetryableStatusCodes: z.array(z.number()).default([401, 403, 404]),
    nonRetryableErrors: z
      .array(z.string())
      .default(["ERR_INVALID_TOKEN", "ERR_INVALID_AUTH"]),
    strategy: z.enum(["exponential", "linear", "fixed"]).default("exponential"),
    retryOn: RetryOnOptions.default({}),
  })
  .strict();

export type RetryOptions = z.infer<typeof RetryOptions>;

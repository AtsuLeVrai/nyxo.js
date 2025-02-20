import { z } from "zod";

export const RetryOnOptions = z
  .object({
    networkErrors: z.boolean().default(true),
    timeouts: z.boolean().default(true),
    rateLimits: z.boolean().default(true),
  })
  .strict()
  .readonly();

export const RetryOptions = z
  .object({
    maxRetries: z.number().int().positive().default(3),
    backoff: z.number().int().positive().default(2),
    minDelay: z.number().int().positive().default(100),
    maxDelay: z.number().int().positive().default(5000),
    jitter: z.number().positive().min(0).max(1).default(Math.random()),
    retryableStatusCodes: z
      .array(z.number())
      .default([408, 429, 500, 502, 503, 504]),
    retryableErrors: z
      .array(z.string())
      .default([
        "ECONNRESET",
        "ECONNREFUSED",
        "EPIPE",
        "ENOTFOUND",
        "ETIMEDOUT",
        "EAI_AGAIN",
      ]),
    nonRetryableStatusCodes: z.array(z.number()).default([401, 403, 404]),
    nonRetryableErrors: z
      .array(z.string())
      .default(["ERR_INVALID_TOKEN", "ERR_INVALID_AUTH"]),
    networkErrors: z
      .array(z.string())
      .default([
        "ECONNRESET",
        "ETIMEDOUT",
        "ECONNREFUSED",
        "EPIPE",
        "ENOTFOUND",
        "ENETUNREACH",
      ]),
    retryOn: RetryOnOptions.default({}),
  })
  .strict()
  .readonly();

export type RetryOptions = z.infer<typeof RetryOptions>;

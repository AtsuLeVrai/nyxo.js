import { z } from "zod";
import { API_CONSTANTS } from "../constants/index.js";

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
    backoff: z.number().int().positive().default(2),
    maxDelay: z.number().int().positive().default(5000),
    jitter: z.number().positive().min(0).max(1).default(0.1),
    retryableStatusCodes: z
      .array(z.number())
      .readonly()
      .default(API_CONSTANTS.RETRY.STATUS_CODES.RETRYABLE),
    retryableErrors: z
      .array(z.string())
      .readonly()
      .default(API_CONSTANTS.RETRY.ERROR_CODES.RETRYABLE),
    nonRetryableStatusCodes: z
      .array(z.number())
      .readonly()
      .default(API_CONSTANTS.RETRY.STATUS_CODES.NON_RETRYABLE),
    nonRetryableErrors: z
      .array(z.string())
      .readonly()
      .default(API_CONSTANTS.RETRY.ERROR_CODES.NON_RETRYABLE),
    retryOn: RetryOnOptions.default({}),
  })
  .strict();

export type RetryOptions = z.infer<typeof RetryOptions>;

import { z } from "zod";

export const RetryOptions = z
  .object({
    maxRetries: z.number().int().min(0).default(5),
    maxTimeout: z.number().int().min(0).default(30000),
    minTimeout: z.number().int().min(0).default(500),
    timeoutFactor: z.number().min(1).default(2),
    retryAfter: z.boolean().default(true),
    methods: z
      .array(z.string())
      .default(["GET", "PUT", "HEAD", "OPTIONS", "DELETE"]),
    statusCodes: z.array(z.number()).default([429, 500, 502, 503, 504]),
    errorCodes: z
      .array(z.string())
      .default([
        "ECONNRESET",
        "ECONNREFUSED",
        "ENOTFOUND",
        "ENETDOWN",
        "ENETUNREACH",
        "EHOSTDOWN",
        "UND_ERR_SOCKET",
      ]),
  })
  .strict()
  .readonly();

export type RetryOptions = z.infer<typeof RetryOptions>;

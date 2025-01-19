import { z } from "zod";
import { FileOptions } from "./file.options.js";
import { HttpOptions } from "./http.options.js";
import { RateLimiterOptions } from "./rate-limiter.options.js";

export const RestOptions = z.object({
  maxRetries: z.number().int().default(Number.MAX_SAFE_INTEGER),
  ...HttpOptions.shape,
  ...RateLimiterOptions.shape,
  ...FileOptions.shape,
});

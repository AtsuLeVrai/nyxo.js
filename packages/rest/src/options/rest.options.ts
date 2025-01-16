import { z } from "zod";
import { HttpOptions } from "./http.options.js";
import { RateLimiterOptions } from "./rate-limiter.options.js";

export const RestOptions = z.object({
  ...HttpOptions.shape,
  ...RateLimiterOptions.shape,
});

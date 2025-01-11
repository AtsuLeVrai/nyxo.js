import { ApiVersion } from "@nyxjs/core";
import type { Pool, ProxyAgent, RetryHandler } from "undici";
import { z } from "zod";
import { FileProcessorOptions } from "./file-processor.options.js";
import { RateLimitOptions } from "./rate-limit.options.js";

export const DISCORD_USER_AGENT_REGEX =
  /^DiscordBot \(([^,\s]+), (\d+(\.\d+)*)\)$/;

export const RestOptions = z
  .object({
    token: z.string(),
    version: z.nativeEnum(ApiVersion).default(ApiVersion.V10),
    fileProcessor: FileProcessorOptions.optional(),
    rateLimit: RateLimitOptions.optional(),
    userAgent: z
      .string()
      .regex(DISCORD_USER_AGENT_REGEX)
      .default("DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)"),
    pool: z.custom<Pool.Options>().default({
      allowH2: false,
      maxConcurrentStreams: 100,
      keepAliveTimeout: 10000,
      keepAliveMaxTimeout: 30000,
      bodyTimeout: 15000,
      headersTimeout: 15000,
    }),
    retry: z.custom<RetryHandler.RetryOptions>().default({
      retryAfter: false,
      maxRetries: 3,
      minTimeout: 100,
      maxTimeout: 15000,
      timeoutFactor: 2,
    }),
    proxy: z.custom<ProxyAgent.Options>().optional(),
  })
  .strict();

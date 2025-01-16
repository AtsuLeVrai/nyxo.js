import { ApiVersion } from "@nyxjs/core";
import type { Pool, ProxyAgent, RetryHandler } from "undici";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/reference#user-agent}
 */
export const DISCORD_USER_AGENT_REGEX =
  /^DiscordBot \(([^,\s]+), (\d+(\.\d+)*)\)$/;

export const HttpOptions = z.object({
  token: z.string(),
  version: z.nativeEnum(ApiVersion).default(ApiVersion.V10),
  userAgent: z
    .string()
    .regex(DISCORD_USER_AGENT_REGEX)
    .default("DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)"),
  proxy: z.custom<ProxyAgent.Options>().optional(),
  pool: z.custom<Pool.Options>().default({
    allowH2: false,
    maxConcurrentStreams: 100,
    keepAliveTimeout: 10000,
    keepAliveMaxTimeout: 30000,
    bodyTimeout: 15000,
    headersTimeout: 15000,
  }),
  retry: z.custom<RetryHandler.RetryOptions>().default({
    retryAfter: true,
    maxRetries: 3,
    minTimeout: 100,
    maxTimeout: 15000,
    timeoutFactor: 2,
  }),
});

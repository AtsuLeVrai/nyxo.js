import { ApiVersion, BotToken } from "@nyxjs/core";
import type { Pool, RetryHandler } from "undici";
import { z } from "zod";
import { RateLimiterOptions } from "./rate-limiter.options.js";

const DEFAULT_API_VERSION = ApiVersion.V10;
const DEFAULT_USER_AGENT =
  "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)";
const DISCORD_BASE_URL = "https://discord.com";
const DEFAULT_POOL_OPTIONS: Pool.Options = {
  keepAliveTimeout: 5000,
  maxHeaderSize: 16384,
  maxResponseSize: 10485760,
} as const;
const DEFAULT_RETRY_OPTIONS: RetryHandler.RetryOptions = {
  maxRetries: 5,
  minTimeout: 1000,
  maxTimeout: 30000,
  timeoutFactor: 2,
  retryAfter: true,
  methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
  statusCodes: [408, 429, 500, 502, 503, 504],
  errorCodes: [
    "ECONNRESET",
    "ECONNREFUSED",
    "ENOTFOUND",
    "ENETDOWN",
    "ENETUNREACH",
    "EHOSTDOWN",
    "UND_ERR_SOCKET",
  ],
} as const;

/**
 * @see {@link https://discord.com/developers/docs/reference#user-agent}
 */
export const DISCORD_USER_AGENT_REGEX = /^DiscordBot \((.+), ([0-9.]+)\)$/;

export const RestOptions = z.object({
  token: BotToken,
  version: z.literal(ApiVersion.V10).default(DEFAULT_API_VERSION),
  userAgent: z
    .string()
    .regex(DISCORD_USER_AGENT_REGEX)
    .default(DEFAULT_USER_AGENT),
  maxRetries: z.number().int().positive().default(3),
  rateLimit: RateLimiterOptions.default({}),
  baseUrl: z.string().default(DISCORD_BASE_URL),
  pool: z.custom<Pool.Options>().default(DEFAULT_POOL_OPTIONS),
  retry: z.custom<RetryHandler.RetryOptions>().default(DEFAULT_RETRY_OPTIONS),
});

export type RestOptions = z.infer<typeof RestOptions>;

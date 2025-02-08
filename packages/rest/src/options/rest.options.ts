import { ApiVersion, BotToken } from "@nyxjs/core";
import { z } from "zod";
import { RateLimitOptions } from "./rate-limit.options.js";
import { RetryOptions } from "./retry.options.js";

/**
 * Regular expression for validating Discord bot user agents
 * @see {@link https://discord.com/developers/docs/reference#user-agent}
 */
export const DISCORD_USER_AGENT_REGEX = /^DiscordBot \((.+), ([0-9.]+)\)$/;

/**
 * Default values for REST client configuration
 */
const DEFAULT_VALUES = {
  VERSION: ApiVersion.V10,
  USER_AGENT: "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)",
  BASE_URL: "https://discord.com",
} as const;

/**
 * REST client configuration options
 */
export const RestOptions = z
  .object({
    /** Discord bot token for authentication */
    token: BotToken,

    /** API version to use */
    version: z.literal(ApiVersion.V10).default(DEFAULT_VALUES.VERSION),

    /** User agent string for API requests */
    userAgent: z
      .string()
      .regex(DISCORD_USER_AGENT_REGEX)
      .default(DEFAULT_VALUES.USER_AGENT),

    /** Base URL for API requests */
    baseUrl: z.string().url().default(DEFAULT_VALUES.BASE_URL),

    /** Rate limiting configuration */
    rateLimit: RateLimitOptions.default({}),

    /** Retry behavior configuration */
    retry: RetryOptions.default({}),
  })
  .strict();

export type RestOptions = z.infer<typeof RestOptions>;

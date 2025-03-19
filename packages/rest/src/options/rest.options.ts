import { ApiVersion, Token, TokenType } from "@nyxjs/core";
import { z } from "zod";
import { QueueOptions } from "./queue.options.js";
import { RetryOptions } from "./retry.options.js";

/**
 * Regular expression pattern for validating Discord bot user agents
 * @see {@link https://discord.com/developers/docs/reference#user-agent}
 */
export const DISCORD_USER_AGENT_REGEX = /^DiscordBot \((.+), ([0-9.]+)\)$/;

/**
 * Configuration options for the REST client
 *
 * Controls authentication, API version, endpoints, and behavior
 * for requests to the Discord API.
 */
export const RestOptions = z
  .object({
    /**
     * Discord Bot or Bearer token for authentication
     * Required for all API requests
     */
    token: Token,

    /**
     * Type of authentication to use with the token
     * @default "Bot"
     */
    authType: TokenType.default("Bot"),

    /**
     * Discord API version to use
     * @default ApiVersion.V10
     */
    version: z.literal(ApiVersion.V10).default(ApiVersion.V10),

    /**
     * User agent string to send with requests
     * Must follow Discord's user agent format requirements
     * @default "DiscordBot (https://github.com/AtsuLeVrai/nyx.js, 1.0.0)"
     */
    userAgent: z
      .string()
      .regex(DISCORD_USER_AGENT_REGEX)
      .default("DiscordBot (https://github.com/AtsuLeVrai/nyx.js, 1.0.0)"),

    /**
     * Base URL for Discord API requests
     * @default "https://discord.com"
     */
    baseUrl: z.string().url().default("https://discord.com"),

    /**
     * Request retry configuration
     * @default {}
     */
    retry: RetryOptions.default({}),

    /**
     * Request queue configuration
     * @default {}
     */
    queue: QueueOptions.default({}),
  })
  .readonly();

export type RestOptions = z.infer<typeof RestOptions>;

import { ApiVersion } from "@nyxjs/core";
import { DEFAULT_QUEUE_OPTIONS, type QueueOptions } from "./queue.options.js";
import { DEFAULT_RETRY_OPTIONS, type RetryOptions } from "./retry.options.js";

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
export interface RestOptions {
  /**
   * Discord Bot or Bearer token for authentication
   * Required for all API requests
   */
  readonly token: string;

  /**
   * Type of authentication to use with the token
   * @default "Bot"
   */
  readonly authType: "Bot" | "Bearer";

  /**
   * Discord API version to use
   * @default ApiVersion.V10
   */
  readonly version: ApiVersion.V10;

  /**
   * User agent string to send with requests
   * Must follow Discord's user agent format requirements
   * @default "DiscordBot (https://github.com/AtsuLeVrai/nyx.js, 1.0.0)"
   * @pattern ^DiscordBot \((.+), ([0-9.]+)\)$
   */
  readonly userAgent: string;

  /**
   * Base URL for Discord API requests
   * @default "https://discord.com"
   * @format url
   */
  readonly baseUrl: string;

  /**
   * Request retry configuration
   * @default {}
   */
  readonly retry: RetryOptions;

  /**
   * Request queue configuration
   * @default {}
   */
  readonly queue: QueueOptions;
}

/**
 * Default configuration options for the REST client
 */
export const DEFAULT_REST_OPTIONS: Omit<RestOptions, "token"> = {
  authType: "Bot",
  version: ApiVersion.V10,
  userAgent: "DiscordBot (https://github.com/AtsuLeVrai/nyx.js, 1.0.0)",
  baseUrl: "https://discord.com",
  retry: DEFAULT_RETRY_OPTIONS,
  queue: DEFAULT_QUEUE_OPTIONS,
};

/**
 * Validates and merges REST client options with default values
 *
 * @param options - User-provided options
 * @returns Validated options merged with defaults
 * @throws Error if validation fails
 */
export function validateRestOptions(
  options: Partial<RestOptions> & { token: string },
): RestOptions {
  if (!options.token || typeof options.token !== "string") {
    throw new Error("Token is required and must be a string");
  }

  if (options.authType && !["Bot", "Bearer"].includes(options.authType)) {
    throw new Error('authType must be either "Bot" or "Bearer"');
  }

  if (options.version && options.version !== ApiVersion.V10) {
    throw new Error("Only API version 10 is supported");
  }

  if (options.userAgent && !DISCORD_USER_AGENT_REGEX.test(options.userAgent)) {
    throw new Error("userAgent must follow Discord bot user agent format");
  }

  if (options.baseUrl && !/^https?:\/\//.test(options.baseUrl)) {
    throw new Error("baseUrl must be a valid URL");
  }

  // Create the validated options by merging with defaults
  return {
    ...DEFAULT_REST_OPTIONS,
    ...options,
    // Recursively validate nested options
    retry: options.retry
      ? { ...DEFAULT_RETRY_OPTIONS, ...options.retry }
      : DEFAULT_RETRY_OPTIONS,
    queue: options.queue
      ? { ...DEFAULT_QUEUE_OPTIONS, ...options.queue }
      : DEFAULT_QUEUE_OPTIONS,
  };
}

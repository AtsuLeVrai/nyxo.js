import { ApiVersion, BotToken } from "@nyxjs/core";
import { z } from "zod";
import { QueueOptions } from "./queue.options.js";
import { RateLimiterOptions } from "./rate-limiter.options.js";

const DEFAULT_API_VERSION = ApiVersion.V10;
const DEFAULT_USER_AGENT =
  "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)";

/**
 * @see {@link https://discord.com/developers/docs/reference#user-agent}
 */
export const DISCORD_USER_AGENT_REGEX = /^DiscordBot \((.+), ([0-9.]+)\)$/;

export const RestOptions = z
  .object({
    token: BotToken,
    version: z.literal(ApiVersion.V10).default(DEFAULT_API_VERSION),
    userAgent: z
      .string()
      .regex(DISCORD_USER_AGENT_REGEX)
      .default(DEFAULT_USER_AGENT),
    maxRetries: z.number().int().positive().default(3),
    rateLimit: RateLimiterOptions.default({}),
    queue: QueueOptions.default({}),
  })
  .strict();

export type RestOptions = z.infer<typeof RestOptions>;

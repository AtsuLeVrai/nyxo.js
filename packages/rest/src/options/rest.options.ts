import { ApiVersion, BotToken } from "@nyxjs/core";
import { z } from "zod";
import { RateLimitOptions } from "./rate-limit.options.js";
import { RetryOptions } from "./retry.options.js";

/**
 * @see {@link https://discord.com/developers/docs/reference#user-agent}
 */
export const DISCORD_USER_AGENT_REGEX = /^DiscordBot \((.+), ([0-9.]+)\)$/;

export const RestOptions = z.object({
  token: BotToken,
  version: z.literal(ApiVersion.V10).default(ApiVersion.V10),
  userAgent: z
    .string()
    .regex(DISCORD_USER_AGENT_REGEX)
    .default("DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)"),
  baseUrl: z.string().default("https://discord.com"),
  rateLimit: RateLimitOptions.default({}),
  retry: RetryOptions.default({}),
  metrics: z.boolean().default(false),
});

export type RestOptions = z.infer<typeof RestOptions>;

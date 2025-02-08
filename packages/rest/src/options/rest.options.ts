import { ApiVersion } from "@nyxjs/core";
import { z } from "zod";
import { RateLimitOptions } from "./rate-limit.options.js";
import { RetryOptions } from "./retry.options.js";

/** @see {@link https://discord.com/developers/docs/reference#user-agent} */
export const DISCORD_USER_AGENT_REGEX = /^DiscordBot \((.+), ([0-9.]+)\)$/;

const DEFAULT_VALUES = {
  VERSION: ApiVersion.V10,
  USER_AGENT: "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)",
  BASE_URL: "https://discord.com",
} as const;

export const RestOptions = z
  .object({
    token: z.string(),
    authType: z.enum(["Bot", "Bearer"]).default("Bot"),
    version: z.literal(ApiVersion.V10).default(DEFAULT_VALUES.VERSION),
    userAgent: z
      .string()
      .regex(DISCORD_USER_AGENT_REGEX)
      .default(DEFAULT_VALUES.USER_AGENT),
    baseUrl: z.string().url().default(DEFAULT_VALUES.BASE_URL),
    rateLimit: RateLimitOptions.default({}),
    retry: RetryOptions.default({}),
  })
  .strict();

export type RestOptions = z.infer<typeof RestOptions>;

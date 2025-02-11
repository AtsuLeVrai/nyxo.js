import { ApiVersion } from "@nyxjs/core";
import { z } from "zod";
import { RateLimitOptions } from "./rate-limit.options.js";
import { RetryOptions } from "./retry.options.js";

const REST_DEFAULTS = {
  AUTH_TYPE: "Bot",
  VERSION: ApiVersion.V10,
  USER_AGENT: "DiscordBot (https://github.com/AtsuLeVrai/nyx.js, 1.0.0)",
  BASE_URL: "https://discord.com",
} as const;

/** @see {@link https://discord.com/developers/docs/reference#user-agent} */
export const DISCORD_USER_AGENT_REGEX = /^DiscordBot \((.+), ([0-9.]+)\)$/;

export const RestOptions = z
  .object({
    token: z.string(),
    authType: z.enum(["Bot", "Bearer"]).default(REST_DEFAULTS.AUTH_TYPE),
    version: z.literal(ApiVersion.V10).default(REST_DEFAULTS.VERSION),
    userAgent: z
      .string()
      .regex(DISCORD_USER_AGENT_REGEX)
      .default(REST_DEFAULTS.USER_AGENT),
    baseUrl: z.string().url().default(REST_DEFAULTS.BASE_URL),
    rateLimit: RateLimitOptions.default({}),
    retry: RetryOptions.default({}),
  })
  .readonly();

export type RestOptions = z.infer<typeof RestOptions>;

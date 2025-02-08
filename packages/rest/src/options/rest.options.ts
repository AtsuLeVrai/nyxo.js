import { ApiVersion } from "@nyxjs/core";
import { z } from "zod";
import { API_CONSTANTS } from "../constants/index.js";
import { RateLimitOptions } from "./rate-limit.options.js";
import { RetryOptions } from "./retry.options.js";

/** @see {@link https://discord.com/developers/docs/reference#user-agent} */
export const DISCORD_USER_AGENT_REGEX = /^DiscordBot \((.+), ([0-9.]+)\)$/;

export const RestOptions = z
  .object({
    token: z.string(),
    authType: z
      .enum(["Bot", "Bearer"])
      .default(API_CONSTANTS.DEFAULTS.AUTH_TYPE),
    version: z.literal(ApiVersion.V10).default(API_CONSTANTS.DEFAULTS.VERSION),
    userAgent: z
      .string()
      .regex(DISCORD_USER_AGENT_REGEX)
      .default(API_CONSTANTS.DEFAULTS.USER_AGENT),
    baseUrl: z.string().url().default(API_CONSTANTS.DEFAULTS.BASE_URL),
    rateLimit: RateLimitOptions.default({}),
    retry: RetryOptions.default({}),
  })
  .strict();

export type RestOptions = z.infer<typeof RestOptions>;

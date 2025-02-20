import { ApiVersion } from "@nyxjs/core";
import { z } from "zod";
import { RateLimitOptions } from "./rate-limit.options.js";
import { RetryOptions } from "./retry.options.js";

/** @see {@link https://discord.com/developers/docs/reference#user-agent} */
export const DISCORD_USER_AGENT_REGEX = /^DiscordBot \((.+), ([0-9.]+)\)$/;

export const RestOptions = z
  .object({
    token: z.string(),
    authType: z.enum(["Bot", "Bearer"]).default("Bot"),
    version: z.literal(ApiVersion.V10).default(ApiVersion.V10),
    userAgent: z
      .string()
      .regex(DISCORD_USER_AGENT_REGEX)
      .default("DiscordBot (https://github.com/AtsuLeVrai/nyx.js, 1.0.0)"),
    baseUrl: z.string().url().default("https://discord.com"),
    rateLimit: RateLimitOptions.default({}),
    retry: RetryOptions.default({}),
  })
  .readonly();

export type RestOptions = z.infer<typeof RestOptions>;

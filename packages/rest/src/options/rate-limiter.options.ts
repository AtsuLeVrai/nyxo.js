import { z } from "zod";

export const RateLimiterOptions = z
  .object({
    cleanupInterval: z.number().int().positive().default(60_000),
    invalidRequestWindow: z.number().int().positive().default(600_000),
    invalidRequestMaxLimit: z.number().int().positive().default(10_000),
    majorParameters: z.map(z.instanceof(RegExp), z.string()).default(
      new Map([
        [/^\/guilds\/(\d+)/, "guild_id"],
        [/^\/channels\/(\d+)/, "channel_id"],
        [/^\/webhooks\/(\d+)/, "webhook_id"],
      ]),
    ),
    sharedRoutes: z.map(z.instanceof(RegExp), z.string()).default(
      new Map([
        [/^\/guilds\/\d+\/emojis/, "emoji"],
        [/^\/channels\/\d+\/messages\/bulk-delete/, "bulk-delete"],
        [/^\/guilds\/\d+\/channels/, "guild-channels"],
        [/^\/guilds\/\d+\/members/, "guild-members"],
      ]),
    ),
  })
  .strict();

export type RateLimiterOptions = z.infer<typeof RateLimiterOptions>;

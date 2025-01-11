import { z } from "zod";

export const RateLimitHeadersOptions = z
  .object({
    limit: z.string().default("x-ratelimit-limit"),
    remaining: z.string().default("x-ratelimit-remaining"),
    reset: z.string().default("x-ratelimit-reset"),
    resetAfter: z.string().default("x-ratelimit-reset-after"),
    bucket: z.string().default("x-ratelimit-bucket"),
    scope: z.string().default("x-ratelimit-scope"),
    global: z.string().default("x-ratelimit-global"),
    retryAfter: z.string().default("retry-after"),
  })
  .strict();

export const RateLimitSharedRouteOptions = z
  .map(z.instanceof(RegExp), z.string().min(1))
  .default(
    new Map([
      [/^\/guilds\/\d+\/emojis/, "emoji"],
      [/^\/channels\/\d+\/messages\/bulk-delete/, "bulk-delete"],
      [/^\/guilds\/\d+\/channels/, "guild-channels"],
      [/^\/guilds\/\d+\/members/, "guild-members"],
    ]),
  );

export const RateLimitMajorParamOptions = z
  .array(
    z
      .object({
        regex: z.instanceof(RegExp),
        param: z.string().min(1),
      })
      .strict(),
  )
  .default([
    { regex: /^\/guilds\/(\d+)/, param: "guild_id" },
    { regex: /^\/channels\/(\d+)/, param: "channel_id" },
    { regex: /^\/webhooks\/(\d+)/, param: "webhook_id" },
  ]);

export const RateLimitTimeoutOptions = z.object({
  cloudflareWindow: z.number().positive().default(600_000),
  cloudflareErrorThreshold: z.number().positive().default(50),
  cloudflareBlockThreshold: z.number().positive().default(10),
  cloudflareBlockWindow: z.number().positive().default(60_000),
  invalidRequestWindow: z.number().positive().default(600_000),
  invalidRequestWarningThreshold: z.number().positive().default(8000),
  invalidRequestMaxLimit: z.number().positive().default(10_000),
});

export const RateLimitOptions = z
  .object({
    headers: RateLimitHeadersOptions.default({
      limit: "x-ratelimit-limit",
      remaining: "x-ratelimit-remaining",
      reset: "x-ratelimit-reset",
      resetAfter: "x-ratelimit-reset-after",
      bucket: "x-ratelimit-bucket",
      scope: "x-ratelimit-scope",
      global: "x-ratelimit-global",
      retryAfter: "retry-after",
    }),
    sharedRoutes: RateLimitSharedRouteOptions.default(
      new Map([
        [/^\/guilds\/\d+\/emojis/, "emoji"],
        [/^\/channels\/\d+\/messages\/bulk-delete/, "bulk-delete"],
        [/^\/guilds\/\d+\/channels/, "guild-channels"],
        [/^\/guilds\/\d+\/members/, "guild-members"],
      ]),
    ),
    majorParams: RateLimitMajorParamOptions.default([
      { regex: /^\/guilds\/(\d+)/, param: "guild_id" },
      { regex: /^\/channels\/(\d+)/, param: "channel_id" },
      { regex: /^\/webhooks\/(\d+)/, param: "webhook_id" },
    ]),
    timeouts: RateLimitTimeoutOptions.default({
      cloudflareWindow: 600_000,
      cloudflareErrorThreshold: 50,
      cloudflareBlockThreshold: 10,
      cloudflareBlockWindow: 60_000,
      invalidRequestWindow: 600_000,
      invalidRequestWarningThreshold: 8000,
      invalidRequestMaxLimit: 10_000,
    }),
  })
  .strict();

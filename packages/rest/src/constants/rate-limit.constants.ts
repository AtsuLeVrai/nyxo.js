export const RateLimitConstants = {
  global: {
    requestsPerSeconds: 50,
    resetInterval: 1000,
  },
  invalidRequest: {
    maxRequests: 10_000,
    windowSize: 600_000,
  },
  emoji: {
    maxRequests: 30,
    resetInterval: 60_000,
  },
  headers: {
    bucket: "x-ratelimit-bucket",
    limit: "x-ratelimit-limit",
    remaining: "x-ratelimit-remaining",
    reset: "x-ratelimit-reset",
    resetAfter: "x-ratelimit-reset-after",
    global: "x-ratelimit-global",
    scope: "x-ratelimit-scope",
    retryAfter: "retry-after",
  },
  majorParameters: [
    { regex: /^\/channels\/(\d+)/, param: "channel_id" },
    { regex: /^\/guilds\/(\d+)/, param: "guild_id" },
    { regex: /^\/webhooks\/(\d+)/, param: "webhook_id" },
  ],
  sharedRoutes: [
    /^\/guilds\/\d+\/emojis/,
    /^\/channels\/\d+\/messages\/\d+\/reactions/,
  ],
} as const;

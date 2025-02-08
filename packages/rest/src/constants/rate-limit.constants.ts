export const RATE_LIMIT_CONSTANTS = {
  HEADERS: {
    LIMIT: "x-ratelimit-limit",
    REMAINING: "x-ratelimit-remaining",
    RESET: "x-ratelimit-reset",
    RESET_AFTER: "x-ratelimit-reset-after",
    BUCKET: "x-ratelimit-bucket",
    SCOPE: "x-ratelimit-scope",
    GLOBAL: "x-ratelimit-global",
    RETRY_AFTER: "retry-after",
  } as const,

  ROUTES: {
    PATTERNS: {
      WEBHOOK: /^\/webhooks\/(\d+)\/([A-Za-z0-9-_]+)/,
      EXEMPT: ["/interactions", "/webhooks"] as const,
      MAJOR_PARAMETERS: new Map([
        [/^\/guilds\/(\d+)/, "guild_id"],
        [/^\/channels\/(\d+)/, "channel_id"],
        [/^\/webhooks\/(\d+)/, "webhook_id"],
      ]),
      SHARED_BUCKETS: new Map([
        [/^\/guilds\/\d+\/emojis/, "emoji"],
        [/^\/channels\/\d+\/messages\/bulk-delete/, "bulk-delete"],
        [/^\/guilds\/\d+\/channels/, "guild-channels"],
        [/^\/guilds\/\d+\/members/, "guild-members"],
      ]),
    },
  },
  TIMING: {
    DEFAULT_RETRY_DELAY: 1000,
    MAX_RETRY_ATTEMPTS: 3,
    SAFETY_MARGIN: 500,
  },
} as const;

export type RateLimitHeader =
  (typeof RATE_LIMIT_CONSTANTS.HEADERS)[keyof typeof RATE_LIMIT_CONSTANTS.HEADERS];

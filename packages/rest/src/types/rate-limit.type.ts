export type RateLimitScope = "user" | "global" | "shared";

export interface BucketInfo {
  hash: string;
  limit: number;
  remaining: number;
  reset: number;
  resetAfter: number;
  scope: RateLimitScope;
  isEmoji: boolean;
  guildId?: string;
}

export interface EmojiRateLimit {
  remaining: number;
  reset: number;
}

export interface GlobalRateLimit {
  remaining: number;
  reset: number | null;
  lastReset: number;
}

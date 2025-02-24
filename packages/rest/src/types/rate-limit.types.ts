/**
 * Possible rate limit scopes returned by the Discord API
 */
export type RateLimitScope = "user" | "global" | "shared";

/**
 * Tracks the number of invalid requests within a time window
 */
export interface InvalidRequestTracking {
  /** The number of invalid requests within the window */
  count: number;
  /** The timestamp when the window started */
  windowStart: number;
}

/**
 * Represents a rate limit bucket from Discord
 */
export interface RateLimitBucket {
  /** The unique hash identifier for this bucket */
  hash: string;

  /** The maximum number of requests allowed in this bucket */
  limit: number;

  /** The number of requests remaining in this bucket */
  remaining: number;

  /** The timestamp (in ms) when the bucket resets */
  reset: number;

  /** The time (in ms) until the bucket resets */
  resetAfter: number;

  /** The scope of this rate limit bucket */
  scope: RateLimitScope;

  /** Whether this bucket is for an emoji route, which has special handling */
  isEmojiRoute?: boolean;

  /** The timestamp when this bucket was created */
  requestId: string;
}

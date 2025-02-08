/**
 * Possible scopes for rate limits
 */
export type RateLimitScope = "user" | "global" | "shared";

/**
 * Represents a rate limit bucket configuration
 */
export interface RateLimitBucket {
  /** Unique bucket identifier */
  hash: string;
  /** Maximum number of requests allowed */
  limit: number;
  /** Number of remaining requests */
  remaining: number;
  /** Timestamp when the rate limit resets */
  reset: number;
  /** Time in seconds until the rate limit resets */
  resetAfter: number;
  /** Scope of the rate limit */
  scope: RateLimitScope;
  /** Route shared with this bucket (if applicable) */
  sharedRoute?: string;
}

/**
 * Context for rate limit errors
 */
export interface RateLimitErrorContext {
  /** HTTP method that triggered the rate limit */
  method: string;
  /** API endpoint path */
  path: string;
  /** Rate limit scope */
  scope: RateLimitScope;
  /** Time in milliseconds until the rate limit resets */
  retryAfter: number;
  /** Whether this is a global rate limit */
  global?: boolean;
  /** Rate limit bucket hash */
  bucketHash?: string;
  /** Number of attempts made */
  attempts?: number;
}

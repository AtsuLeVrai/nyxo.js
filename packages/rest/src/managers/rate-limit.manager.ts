import type { Dispatcher } from "undici";
import type { Rest } from "../core/index.js";
import { RateLimitError } from "../errors/index.js";

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
  /** The timestamp when this bucket was created */
  requestId: string;

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
}

/**
 * Result of a rate limit check
 */
export interface RateLimitResult {
  /** Whether the request can proceed */
  canProceed: boolean;

  /** Time in seconds to wait before retrying if canProceed is false */
  retryAfter?: number;

  /** Type of rate limit that was hit */
  limitType?: "global" | "bucket" | "cloudflare" | "emoji";

  /** Reason for the rate limit */
  reason?: string;

  /** Associated bucket hash if applicable */
  bucketHash?: string;

  /** Rate limit scope if applicable */
  scope?: RateLimitScope;
}

/**
 * Configuration constants for rate limiting
 */
const RATE_LIMIT_CONFIG = {
  // Routes that are exempt from standard rate limiting
  EXEMPT_ROUTES: new Set(["/interactions", "/webhooks"]),

  // Status codes that indicate invalid requests
  INVALID_STATUSES: new Set([401, 403, 429]),

  // Regular expressions for route pattern detection
  PATTERNS: {
    WEBHOOK: /^\/webhooks\/(\d+)\/([A-Za-z0-9-_]+)/,
    EMOJI: /^\/guilds\/(\d+)\/emojis/,
  },

  // Discord API response header names
  HEADERS: {
    LIMIT: "x-ratelimit-limit",
    REMAINING: "x-ratelimit-remaining",
    RESET: "x-ratelimit-reset",
    RESET_AFTER: "x-ratelimit-reset-after",
    BUCKET: "x-ratelimit-bucket",
    SCOPE: "x-ratelimit-scope",
    GLOBAL: "x-ratelimit-global",
    RETRY_AFTER: "retry-after",
  },
};

/**
 * Manages rate limits for Discord API requests to ensure
 * compliance with their rate limiting policies.
 */
export class RateLimitManager {
  /** Map of bucket hashes to their bucket objects */
  readonly #buckets = new Map<string, RateLimitBucket>();

  /** Map of API route keys to their corresponding bucket hashes */
  readonly #routeBuckets = new Map<string, string>();

  /** Tracks invalid requests to prevent Cloudflare bans */
  readonly #invalidRequests: InvalidRequestTracking = {
    count: 0,
    windowStart: Date.now(),
  };

  /** Array of timestamps for global rate limit tracking */
  readonly #globalRequestTimes: number[] = [];

  /** Reference to the Rest instance for emitting events */
  readonly #rest: Rest;

  /**
   * Creates a new rate limit manager
   *
   * @param rest - The Rest instance to emit events on
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Checks if a request would exceed rate limits
   *
   * @param path - The API path being requested
   * @param method - The HTTP method being used
   * @param requestId - The unique ID for this request
   * @returns Result indicating whether the request can proceed
   */
  checkRateLimit(
    path: string,
    method: Dispatcher.HttpMethod,
    requestId: string,
  ): RateLimitResult {
    // Clean up expired buckets before checking
    this.#cleanupExpiredBuckets();

    // First check global rate limits
    const globalCheck = this.#checkGlobalRateLimit(requestId);
    if (!globalCheck.canProceed) {
      return globalCheck;
    }

    // Then check for invalid request limits (Cloudflare protection)
    const invalidCheck = this.#checkInvalidRequestLimit(requestId);
    if (!invalidCheck.canProceed) {
      return invalidCheck;
    }

    // Skip checking for exempt routes
    if (RATE_LIMIT_CONFIG.EXEMPT_ROUTES.has(path)) {
      return { canProceed: true };
    }

    // Get the bucket for this route
    const routeKey = this.getRouteKey(method, path);
    const bucketHash = this.#routeBuckets.get(routeKey);
    if (!bucketHash) {
      return { canProceed: true };
    }

    const bucket = this.#buckets.get(bucketHash);
    if (!bucket) {
      return { canProceed: true };
    }

    // Special handling for emoji routes
    if (this.#isEmojiRoute(path)) {
      return this.#checkEmojiBucketLimit(bucket, path, method, requestId);
    }

    // Standard bucket check
    return this.#checkBucketLimit(bucket, path, method, requestId);
  }

  /**
   * Enforces rate limits by handling the result of a rate limit check
   *
   * @param path - The API path being requested
   * @param method - The HTTP method being used
   * @param requestId - The unique ID for this request
   * @throws If the request would exceed rate limits
   */
  enforceRateLimit(
    path: string,
    method: Dispatcher.HttpMethod,
    requestId: string,
  ): void {
    const result = this.checkRateLimit(path, method, requestId);

    if (!result.canProceed) {
      throw this.#createRateLimitError(requestId, result, path, method);
    }
  }

  /**
   * Generates a unique key for an API route
   *
   * @param method - The HTTP method
   * @param path - The API path
   * @returns A unique string key for this route
   */
  getRouteKey(method: Dispatcher.HttpMethod, path: string): string {
    // Special handling for webhook routes
    const webhookMatch = path.match(RATE_LIMIT_CONFIG.PATTERNS.WEBHOOK);
    if (webhookMatch) {
      return `webhook:${webhookMatch[1]}:${webhookMatch[2]}:${method}`;
    }

    // Special handling for emoji routes
    const emojiMatch = path.match(RATE_LIMIT_CONFIG.PATTERNS.EMOJI);
    if (emojiMatch) {
      return `emoji:${emojiMatch[1]}:${method}`;
    }

    // Default route key format
    return `${method}:${path}`;
  }

  /**
   * Updates rate limit information based on API response
   *
   * @param path - The API path that was requested
   * @param method - The HTTP method that was used
   * @param headers - The response headers
   * @param statusCode - The HTTP status code
   * @param requestId - The unique ID for this request
   */
  updateRateLimit(
    path: string,
    method: Dispatcher.HttpMethod,
    headers: Record<string, string>,
    statusCode: number,
    requestId: string,
  ): void {
    // Clean up expired buckets
    this.#cleanupExpiredBuckets();

    // Keep track of global request counts
    this.#trackGlobalRequest();

    // Track invalid responses
    if (RATE_LIMIT_CONFIG.INVALID_STATUSES.has(statusCode)) {
      this.#trackInvalidRequest();
    }

    // Skip processing for exempt routes
    if (RATE_LIMIT_CONFIG.EXEMPT_ROUTES.has(path)) {
      return;
    }

    const routeKey = this.getRouteKey(method, path);

    // Handle rate limit exceeded responses
    if (statusCode === 429) {
      this.#handleRateLimitExceeded(path, method, headers, requestId);
      return;
    }

    // Update bucket info if available
    const bucketHash = headers[RATE_LIMIT_CONFIG.HEADERS.BUCKET];
    if (!bucketHash) {
      return;
    }

    this.#updateBucket(bucketHash, headers, routeKey, path, requestId);
  }

  /**
   * Cleans up resources used by the manager
   */
  destroy(): void {
    this.#buckets.clear();
    this.#routeBuckets.clear();
    this.#globalRequestTimes.length = 0;
  }

  /**
   * Creates a rate limit error from a result
   *
   * @param requestId - The request ID
   * @param result - The rate limit result
   * @param path - The API path
   * @param method - The HTTP method
   * @returns A RateLimitError instance
   * @private
   */
  #createRateLimitError(
    requestId: string,
    result: RateLimitResult,
    path: string,
    method: Dispatcher.HttpMethod,
  ): RateLimitError {
    // Create error context based on result
    const errorContext = {
      method: result.limitType === "global" ? "ANY" : method,
      path: result.limitType === "global" ? "ANY" : path,
      retryAfter: result.retryAfter ?? 1,
      scope: result.scope ?? "global",
      global: result.limitType === "global",
      bucketHash: result.bucketHash,
      reason: result.reason,
    };

    return new RateLimitError(requestId, errorContext);
  }

  /**
   * Tracks an invalid request for rate limiting purposes
   *
   * @private
   */
  #trackInvalidRequest(): void {
    const now = Date.now();
    if (now - this.#invalidRequests.windowStart >= 600_000) {
      this.#invalidRequests.count = 1;
      this.#invalidRequests.windowStart = now;
    } else {
      this.#invalidRequests.count++;
    }
  }

  /**
   * Checks if we've hit the invalid request limit (Cloudflare protection)
   *
   * @param requestId - ID to correlate related events
   * @returns Result indicating whether the request can proceed
   * @private
   */
  #checkInvalidRequestLimit(requestId: string): RateLimitResult {
    const now = Date.now();

    if (
      now - this.#invalidRequests.windowStart < 600_000 &&
      this.#invalidRequests.count >= 10_000
    ) {
      const retryAfter =
        (this.#invalidRequests.windowStart + 600_000 - now) / 1000;

      // Emit an event when hitting Cloudflare's invalid request limit
      this.#rest.emit("rateLimitHit", {
        timestamp: new Date().toISOString(),
        requestId,
        bucketId: "cloudflare",
        resetAfter: retryAfter,
        global: true,
        route: "ANY",
        method: "TRACE",
        reason: "Cloudflare invalid requests limit exceeded",
      });

      return {
        canProceed: false,
        retryAfter,
        limitType: "cloudflare",
        scope: "global",
        reason: "Cloudflare invalid requests limit exceeded",
      };
    }

    return { canProceed: true };
  }

  /**
   * Tracks a request for global rate limiting
   *
   * @private
   */
  #trackGlobalRequest(): void {
    const now = Date.now();
    this.#globalRequestTimes.push(now);

    // Remove timestamps older than 1 second
    while (
      this.#globalRequestTimes.length > 0 &&
      this.#globalRequestTimes[0] &&
      this.#globalRequestTimes[0] < now - 1000
    ) {
      this.#globalRequestTimes.shift();
    }
  }

  /**
   * Checks if we've hit the global rate limit
   *
   * @param requestId - ID to correlate related events
   * @returns Result indicating whether the request can proceed
   * @private
   */
  #checkGlobalRateLimit(requestId: string): RateLimitResult {
    if (this.#globalRequestTimes.length >= 1000) {
      const oldestRequest = this.#globalRequestTimes[0];
      if (!oldestRequest) {
        return { canProceed: true };
      }

      const now = Date.now();
      const waitTime = 1000 - (now - oldestRequest);

      if (waitTime > 0) {
        const retryAfter = waitTime / 1000;

        // Emit an event when hitting the global rate limit
        this.#rest.emit("rateLimitHit", {
          timestamp: new Date().toISOString(),
          requestId,
          bucketId: "global",
          resetAfter: retryAfter,
          global: true,
          reason: "Global rate limit exceeded",
        });

        return {
          canProceed: false,
          retryAfter,
          limitType: "global",
          scope: "global",
          reason: "Global rate limit exceeded",
        };
      }
    }

    return { canProceed: true };
  }

  /**
   * Checks if a path is for the emoji API
   *
   * @param path - The API path to check
   * @returns Whether the path is for the emoji API
   * @private
   */
  #isEmojiRoute(path: string): boolean {
    return RATE_LIMIT_CONFIG.PATTERNS.EMOJI.test(path);
  }

  /**
   * Handles a 429 Too Many Requests response
   *
   * @param path - The API path
   * @param method - The HTTP method
   * @param headers - The response headers
   * @param requestId - ID to correlate related events
   * @private
   */
  #handleRateLimitExceeded(
    path: string,
    method: Dispatcher.HttpMethod,
    headers: Record<string, string>,
    requestId: string,
  ): void {
    const { HEADERS } = RATE_LIMIT_CONFIG;

    const retryAfter = Number(headers[HEADERS.RETRY_AFTER]);
    const scope = (headers[HEADERS.SCOPE] as RateLimitScope) ?? "user";
    const isGlobal = headers[HEADERS.GLOBAL] === "true";
    const bucketId = headers[HEADERS.BUCKET] || "unknown";

    // Emit an event when hitting a rate limit from the API
    this.#rest.emit("rateLimitHit", {
      timestamp: new Date().toISOString(),
      requestId,
      bucketId,
      resetAfter: retryAfter,
      global: isGlobal,
      route: path,
      method,
      retryAfter: Number(headers[HEADERS.RETRY_AFTER]) || undefined,
    });

    // Create and throw the rate limit error
    const errorContext = {
      method,
      path,
      retryAfter,
      scope,
      global: isGlobal,
      bucketHash: bucketId,
    };

    throw new RateLimitError(requestId, errorContext);
  }

  /**
   * Updates or creates a rate limit bucket
   *
   * @param bucketHash - The bucket hash from the API
   * @param headers - The response headers
   * @param routeKey - The route key for this request
   * @param path - The API path
   * @param requestId - ID to correlate related events
   * @private
   */
  #updateBucket(
    bucketHash: string,
    headers: Record<string, string>,
    routeKey: string,
    path: string,
    requestId: string,
  ): void {
    const { HEADERS } = RATE_LIMIT_CONFIG;

    // Extract bucket information from headers
    const bucket: RateLimitBucket = {
      hash: bucketHash,
      limit: Number(headers[HEADERS.LIMIT]),
      remaining: Number(headers[HEADERS.REMAINING]),
      reset: Number(headers[HEADERS.RESET]) * 1000,
      resetAfter: Number(headers[HEADERS.RESET_AFTER]) * 1000,
      scope: (headers[HEADERS.SCOPE] as RateLimitScope) ?? "user",
      isEmojiRoute: this.#isEmojiRoute(path),
      requestId,
    };

    // Update our stores
    this.#buckets.set(bucketHash, bucket);
    this.#routeBuckets.set(routeKey, bucketHash);

    // Emit an event with the updated bucket info
    this.#rest.emit("rateLimitUpdate", {
      timestamp: new Date().toISOString(),
      requestId,
      bucketId: bucketHash,
      remaining: bucket.remaining,
      limit: bucket.limit,
      resetAfter: bucket.resetAfter,
      resetAt: new Date(bucket.reset).toISOString(),
      route: path,
    });
  }

  /**
   * Checks if a request would exceed a bucket's limit
   *
   * @param bucket - The rate limit bucket
   * @param path - The API path
   * @param method - The HTTP method
   * @param requestId - ID to correlate related events
   * @returns Result indicating whether the request can proceed
   * @private
   */
  #checkBucketLimit(
    bucket: RateLimitBucket,
    path: string,
    method: Dispatcher.HttpMethod,
    requestId: string,
  ): RateLimitResult {
    const now = Date.now();

    // No remaining requests in this bucket
    if (bucket.remaining <= 0 && bucket.reset > now) {
      const retryAfter = (bucket.reset - now) / 1000;

      // Emit an event for hitting a bucket limit
      this.#rest.emit("rateLimitHit", {
        timestamp: new Date().toISOString(),
        requestId,
        bucketId: bucket.hash,
        resetAfter: retryAfter,
        global: false,
        route: path,
        method,
        reason: "Bucket has no remaining requests",
      });

      return {
        canProceed: false,
        retryAfter,
        limitType: "bucket",
        scope: bucket.scope,
        bucketHash: bucket.hash,
        reason: "Bucket has no remaining requests",
      };
    }

    // Only one request remaining and close to reset - use safety margin
    if (bucket.remaining === 1 && bucket.reset - now < 1000) {
      const retryAfter = 1000 / 1000;

      // Emit an event for hitting the safety margin
      this.#rest.emit("rateLimitHit", {
        timestamp: new Date().toISOString(),
        requestId,
        bucketId: bucket.hash,
        resetAfter: retryAfter,
        global: false,
        route: path,
        method,
        reason: "Safety margin - approaching bucket reset",
      });

      return {
        canProceed: false,
        retryAfter,
        limitType: "bucket",
        scope: bucket.scope,
        bucketHash: bucket.hash,
        reason: "Safety margin - approaching bucket reset",
      };
    }

    return { canProceed: true };
  }

  /**
   * Special check for emoji route limits which have different rules
   *
   * @param bucket - The rate limit bucket
   * @param path - The API path
   * @param method - The HTTP method
   * @param requestId - ID to correlate related events
   * @returns Result indicating whether the request can proceed
   * @private
   */
  #checkEmojiBucketLimit(
    bucket: RateLimitBucket,
    path: string,
    method: Dispatcher.HttpMethod,
    requestId: string,
  ): RateLimitResult {
    const now = Date.now();

    // Emoji routes have special handling - stop at 1 remaining
    if (bucket.remaining <= 1 && bucket.reset > now) {
      const retryAfter = (bucket.reset - now) / 1000;

      // Emit an event for hitting an emoji route limit
      this.#rest.emit("rateLimitHit", {
        timestamp: new Date().toISOString(),
        requestId,
        bucketId: bucket.hash,
        resetAfter: retryAfter,
        global: false,
        route: path,
        method,
        reason: "Emoji route rate limit",
      });

      return {
        canProceed: false,
        retryAfter,
        limitType: "emoji",
        scope: bucket.scope,
        bucketHash: bucket.hash,
        reason: "Emoji rate limit",
      };
    }

    return { canProceed: true };
  }

  /**
   * Periodically removes expired buckets to prevent memory leaks
   *
   * @private
   */
  #cleanupExpiredBuckets(): void {
    const now = Date.now();

    // Check each bucket
    for (const [hash, bucket] of this.#buckets.entries()) {
      if (bucket.reset < now) {
        this.#buckets.delete(hash);

        // Emit an event when a bucket expires
        this.#rest.emit("rateLimitExpire", {
          timestamp: new Date().toISOString(),
          requestId: bucket.requestId,
          bucketId: hash,
          lifespan: now - (bucket.reset - bucket.resetAfter),
        });
      }
    }

    // Clean up route mappings for expired buckets
    for (const [route, hash] of this.#routeBuckets.entries()) {
      if (!this.#buckets.has(hash)) {
        this.#routeBuckets.delete(route);
      }
    }
  }
}

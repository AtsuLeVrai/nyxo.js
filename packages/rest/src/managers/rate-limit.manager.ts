import { sleep } from "@nyxojs/core";
import { Store } from "@nyxojs/store";
import { z } from "zod";
import type { Rest } from "../core/index.js";
import type { HttpMethod, RateLimitHitEvent } from "../types/index.js";

/**
 * Possible rate limit scopes returned by the Discord API.
 * Defines the scope at which the rate limit applies.
 */
export type RateLimitScope = "user" | "global" | "shared";

/**
 * Rate limit tracking information for invalid requests.
 * Monitors potentially abusive behavior to prevent Cloudflare bans.
 */
export interface InvalidRequestTracking {
  /** Count of invalid requests in the current window. */
  count: number;

  /** Timestamp when the current tracking window started. */
  windowStart: number;
}

/**
 * Represents a rate limit bucket from Discord.
 * Each bucket contains rate limit state for specific endpoints.
 */
export interface RateLimitBucket {
  /** Request ID that created/updated this bucket. */
  requestId: string;

  /** Unique hash identifier for this bucket. */
  hash: string;

  /** Maximum requests allowed in this window. */
  limit: number;

  /** Remaining requests in this window. */
  remaining: number;

  /** Timestamp when the bucket resets (in ms). */
  reset: number;

  /** Time until the bucket resets (in ms). */
  resetAfter: number;

  /** Rate limit scope. */
  scope: RateLimitScope;

  /** Whether this route is an emoji route (special handling). */
  isEmojiRoute?: boolean;
}

/**
 * Result of a rate limit check.
 * Indicates whether a request can proceed and provides retry information.
 */
export interface RateLimitResult {
  /** Whether the request can proceed. */
  canProceed: boolean;

  /** Time in milliseconds to wait before retrying. */
  retryAfter?: number;

  /** Type of rate limit that was hit. */
  limitType?: "global" | "bucket" | "cloudflare" | "emoji";

  /** Reason for the rate limit. */
  reason?: string;

  /** Associated bucket hash if applicable. */
  bucketHash?: string;

  /** Rate limit scope if applicable. */
  scope?: RateLimitScope;
}

/**
 * Configuration options for the rate limit manager.
 * Controls how rate limits are tracked and managed.
 */
export const RateLimitOptions = z.object({
  /**
   * Cleanup interval in milliseconds.
   * Controls how often expired buckets are removed from memory.
   * @default 60000 (1 minute)
   */
  cleanupInterval: z.number().int().min(0).default(60000),

  /**
   * Safety margin in milliseconds to apply when approaching reset.
   * Adds buffer to prevent accidental rate limit violations.
   * @default 100 (reduced from 500)
   */
  safetyMarginMs: z.number().int().min(0).default(100),

  /**
   * Maximum invalid requests allowed in a 10-minute window.
   * Prevents Cloudflare bans from excessive invalid requests.
   * @default 10000 (Discord limit)
   */
  maxInvalidRequests: z.number().int().min(0).max(10000).default(10000),

  /**
   * Maximum global requests per second.
   * Controls overall request rate to Discord API.
   * @default 50 (Discord limit)
   */
  maxGlobalRequestsPerSecond: z.number().int().min(0).default(50),

  /**
   * Maximum number of buckets to keep in memory.
   * Limits memory usage for long-running applications.
   * @default 1000
   */
  maxBuckets: z.number().int().min(100).default(1000),

  /**
   * Default TTL for rate limit cache entries in milliseconds.
   * Controls expiration of cached rate limit results.
   * @default 100
   */
  ratelimitCacheTtl: z.number().int().min(0).default(100),
});

export type RateLimitOptions = z.infer<typeof RateLimitOptions>;

/**
 * Manages rate limits for Discord API requests.
 * Tracks and enforces rate limits to prevent 429 errors.
 *
 * Features:
 * - Automatic rate limit tracking from response headers
 * - Proactive prevention of rate limit violations
 * - Support for global, route-specific, and shared rate limits
 * - Special handling for emoji routes (per Discord documentation)
 * - Cloudflare ban prevention through invalid request tracking
 * - Efficient memory management with TTL and LRU eviction
 */
export class RateLimitManager {
  /**
   * Emoji route pattern for special handling.
   * Discord documentation confirms only emoji routes have special rate limit handling.
   */
  static readonly EMOJI_ROUTE_PATTERN = /^\/guilds\/(\d+)\/emojis/;

  /**
   * Routes not subject to the global rate limit per Discord documentation.
   * Only interaction endpoints are exempted from global rate limits.
   */
  static readonly GLOBAL_EXEMPT_ROUTES = ["/interactions"];

  /**
   * Status codes that indicate invalid requests.
   * Used for Cloudflare ban prevention.
   */
  static readonly INVALID_STATUSES = [401, 403, 429];

  /**
   * Header names for rate limit information.
   * Used to extract rate limit data from responses.
   */
  static readonly HEADERS = {
    LIMIT: "x-ratelimit-limit",
    REMAINING: "x-ratelimit-remaining",
    RESET: "x-ratelimit-reset",
    RESET_AFTER: "x-ratelimit-reset-after",
    BUCKET: "x-ratelimit-bucket",
    SCOPE: "x-ratelimit-scope",
    GLOBAL: "x-ratelimit-global",
    RETRY_AFTER: "retry-after",
  };

  /** Store of bucket hashes to bucket objects with automatic TTL and LRU eviction. */
  readonly #buckets: Store<string, RateLimitBucket>;

  /** Store of API routes to their bucket hashes with automatic cleanup. */
  readonly #routeBuckets: Store<string, string>;

  /** Store for caching rate limit check results to reduce redundant operations. */
  readonly #rateLimitCache: Store<string, RateLimitResult>;

  /** Tracks invalid requests to prevent Cloudflare bans. */
  readonly #invalidRequests: InvalidRequestTracking = {
    count: 0,
    windowStart: Date.now(),
  };

  /** Timestamp tracking for global rate limit. */
  readonly #globalRateTracker = {
    requestCount: 0,
    windowStartTime: Date.now(),
  };

  /** Reference to the Rest instance. */
  readonly #rest: Rest;

  /** Configuration options. */
  readonly #options: RateLimitOptions;

  /**
   * Creates a new rate limit manager.
   * Initializes stores and tracking systems.
   *
   * @param rest - REST client instance that will use this manager
   * @param options - Rate limit configuration options
   */
  constructor(rest: Rest, options: RateLimitOptions) {
    this.#rest = rest;
    this.#options = options;

    // Initialize Stores with appropriate options
    this.#buckets = new Store<string, RateLimitBucket>(null, {
      maxSize: this.#options.maxBuckets,
      evictionStrategy: "lru",
      cloneValues: false,
      minCleanupInterval: this.#options.cleanupInterval,
    });

    this.#routeBuckets = new Store<string, string>(null, {
      maxSize: this.#options.maxBuckets * 2, // Routes may outnumber buckets
      evictionStrategy: "lru",
      minCleanupInterval: this.#options.cleanupInterval,
    });

    this.#rateLimitCache = new Store<string, RateLimitResult>(null, {
      maxSize: 1000,
      ttl: this.#options.ratelimitCacheTtl,
      evictionStrategy: "lru",
      cloneValues: false,
    });
  }

  /**
   * Gets the rate limit buckets currently tracked.
   * Provides read-only access to bucket information.
   *
   * @returns Map of bucket hashes to bucket objects
   */
  get buckets(): Map<string, RateLimitBucket> {
    return this.#buckets;
  }

  /**
   * Gets the route mappings currently tracked.
   * Provides read-only access to route-to-bucket mappings.
   *
   * @returns Map of route keys to bucket hashes
   */
  get routeBuckets(): Map<string, string> {
    return this.#routeBuckets;
  }

  /**
   * Checks if a request would exceed rate limits and waits if necessary.
   * Combines rate limit checking and waiting into a single operation.
   *
   * @param path - API path to request
   * @param method - HTTP method used for the request
   * @param requestId - Unique identifier for this request
   * @returns Promise resolving to rate limit check result
   */
  async checkAndWaitIfNeeded(
    path: string,
    method: HttpMethod,
    requestId: string,
  ): Promise<RateLimitResult> {
    // Check if we can proceed
    const checkResult = this.checkRateLimit(path, method, requestId);

    // If we can proceed, return immediately
    if (checkResult.canProceed) {
      return checkResult;
    }

    // Otherwise, wait for the specified time
    if (checkResult.retryAfter && checkResult.retryAfter > 0) {
      await sleep(checkResult.retryAfter);

      // After waiting, check again to be safe
      return this.checkRateLimit(path, method, requestId);
    }

    // Fallback in case retryAfter wasn't provided
    return checkResult;
  }

  /**
   * Checks if a request would exceed rate limits.
   * Does not perform any waiting, just returns the result.
   *
   * @param path - API path to request
   * @param method - HTTP method used for the request
   * @param requestId - Unique identifier for this request
   * @returns Rate limit check result
   */
  checkRateLimit(
    path: string,
    method: HttpMethod,
    requestId: string,
  ): RateLimitResult {
    const now = Date.now();

    // Check cache first for performance
    const cacheKey = `${method}:${path}`;
    const cached = this.#rateLimitCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Skip global exempt routes (only interaction endpoints per Discord docs)
    const isGlobalExempt = RateLimitManager.GLOBAL_EXEMPT_ROUTES.some((route) =>
      path.startsWith(route),
    );

    // Check global limits unless this route is exempt
    if (!isGlobalExempt) {
      const globalCheck = this.#checkGlobalRateLimit(requestId, now);
      if (!globalCheck.canProceed) {
        return globalCheck;
      }
    }

    // Check for CloudFlare protection
    const invalidCheck = this.#checkInvalidRequestLimit(requestId, now);
    if (!invalidCheck.canProceed) {
      return invalidCheck;
    }

    // Get bucket for this route
    const routeKey = this.getRouteKey(method, path);
    const bucketHash = this.#routeBuckets.get(routeKey);

    // No bucket means no known limit
    if (!bucketHash) {
      const result = { canProceed: true };

      // Cache positive results briefly to improve performance
      this.#rateLimitCache.set(cacheKey, result);

      return result;
    }

    const bucket = this.#buckets.get(bucketHash);
    if (!bucket) {
      const result = { canProceed: true };

      // Cache positive results briefly
      this.#rateLimitCache.set(cacheKey, result);

      return result;
    }

    // Check bucket limits
    const result = this.#checkBucketLimit(bucket, path, method, requestId, now);

    // Cache results if they allow proceeding
    if (result.canProceed) {
      this.#rateLimitCache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Updates rate limit information from API response and waits if needed.
   * Combines rate limit updating and waiting into a single operation.
   *
   * @param path - API path that was requested
   * @param method - HTTP method used for the request
   * @param headers - Response headers containing rate limit information
   * @param statusCode - HTTP status code from the response
   * @param requestId - Unique identifier for this request
   * @returns Promise resolving to updated rate limit result
   */
  async updateRateLimitAndWaitIfNeeded(
    path: string,
    method: HttpMethod,
    headers: Record<string, string>,
    statusCode: number,
    requestId: string,
  ): Promise<RateLimitResult> {
    // Update rate limit information
    const updateResult = this.updateRateLimit(
      path,
      method,
      headers,
      statusCode,
      requestId,
    );

    // If we need to wait (e.g., hit a rate limit), wait now
    if (
      !updateResult.canProceed &&
      updateResult.retryAfter &&
      updateResult.retryAfter > 0
    ) {
      await sleep(updateResult.retryAfter);

      // After waiting, return an updated result that indicates we can proceed
      return {
        canProceed: true,
        bucketHash: updateResult.bucketHash,
        scope: updateResult.scope,
      };
    }

    // Otherwise just return the update result
    return updateResult;
  }

  /**
   * Generates a unique key for an API route.
   * Used to map routes to their rate limit buckets.
   *
   * @param method - HTTP method used for the request
   * @param path - API path for the request
   * @returns Unique key for this route
   */
  getRouteKey(method: HttpMethod, path: string): string {
    // Check for emoji routes (only special case per Discord docs)
    const emojiMatch = path.match(RateLimitManager.EMOJI_ROUTE_PATTERN);
    if (emojiMatch) {
      return `emoji:${emojiMatch[1]}:${method}`;
    }

    // Default route format
    return `${method}:${path}`;
  }

  /**
   * Updates rate limit information from API response.
   * Processes response headers to update bucket information.
   *
   * @param path - API path that was requested
   * @param method - HTTP method used for the request
   * @param headers - Response headers containing rate limit information
   * @param statusCode - HTTP status code from the response
   * @param requestId - Unique identifier for this request
   * @returns Updated rate limit result
   */
  updateRateLimit(
    path: string,
    method: HttpMethod,
    headers: Record<string, string>,
    statusCode: number,
    requestId: string,
  ): RateLimitResult {
    const now = Date.now();

    // Update global request tracking
    this.#updateGlobalRequestCount(now);

    // Track invalid responses
    if (RateLimitManager.INVALID_STATUSES.includes(statusCode)) {
      this.#trackInvalidRequest(now);
    }

    // Invalidate cache for this route
    const cacheKey = `${method}:${path}`;
    this.#rateLimitCache.delete(cacheKey);

    const routeKey = this.getRouteKey(method, path);

    // Handle rate limit exceeded responses
    if (statusCode === 429) {
      return this.#handleRateLimitExceeded(
        path,
        method,
        headers,
        requestId,
        now,
      );
    }

    // Update bucket info if available
    const bucketHash = headers[RateLimitManager.HEADERS.BUCKET];
    if (!bucketHash) {
      return {
        canProceed: true,
      };
    }

    return this.#updateBucket(
      bucketHash,
      headers,
      routeKey,
      path,
      requestId,
      now,
    );
  }

  /**
   * Cleans up resources used by the manager.
   * Should be called when the manager is no longer needed.
   */
  destroy(): void {
    // Destroy all stores to release resources
    this.#buckets.destroy();
    this.#routeBuckets.destroy();
    this.#rateLimitCache.destroy();
  }

  /**
   * Tracks an invalid request in the rolling window.
   * Used for Cloudflare ban prevention.
   *
   * @param now - Current timestamp
   * @private
   */
  #trackInvalidRequest(now: number): void {
    const windowDuration = 600_000; // 10 minutes

    if (now - this.#invalidRequests.windowStart >= windowDuration) {
      // Reset window if it's expired
      this.#invalidRequests.count = 1;
      this.#invalidRequests.windowStart = now;
    } else {
      // Increment counter in current window
      this.#invalidRequests.count++;
    }
  }

  /**
   * Updates the global request counter.
   * Tracks overall request rate to prevent global rate limits.
   *
   * @param now - Current timestamp
   * @private
   */
  #updateGlobalRequestCount(now: number): void {
    const windowDuration = 1000; // 1 second window

    if (now - this.#globalRateTracker.windowStartTime >= windowDuration) {
      // Reset window if it's expired
      this.#globalRateTracker.requestCount = 1;
      this.#globalRateTracker.windowStartTime = now;
    } else {
      // Increment counter in current window
      this.#globalRateTracker.requestCount++;
    }
  }

  /**
   * Checks if we've hit the invalid request limit.
   * Prevents Cloudflare bans from too many invalid requests.
   *
   * @param requestId - Unique identifier for this request
   * @param now - Current timestamp
   * @returns Rate limit check result
   * @private
   */
  #checkInvalidRequestLimit(requestId: string, now: number): RateLimitResult {
    const windowDuration = 600_000; // 10 minutes

    if (
      now - this.#invalidRequests.windowStart < windowDuration &&
      this.#invalidRequests.count >= this.#options.maxInvalidRequests
    ) {
      const retryAfter =
        this.#invalidRequests.windowStart + windowDuration - now;

      // Emit rate limit hit event
      this.#emitRateLimitHit(
        {
          requestId,
          bucketId: "invalid",
          resetAfter: retryAfter,
          global: false,
          method: undefined,
          route: "invalid",
        },
        now,
      );

      return {
        canProceed: false,
        retryAfter,
        limitType: "cloudflare",
        scope: "global",
        reason: "Cloudflare protection limit exceeded",
      };
    }

    return { canProceed: true };
  }

  /**
   * Checks if we've hit the global rate limit.
   * Prevents global rate limit violations.
   *
   * @param requestId - Unique identifier for this request
   * @param now - Current timestamp
   * @returns Rate limit check result
   * @private
   */
  #checkGlobalRateLimit(requestId: string, now: number): RateLimitResult {
    const windowDuration = 1000; // 1 second window

    if (
      now - this.#globalRateTracker.windowStartTime < windowDuration &&
      this.#globalRateTracker.requestCount >=
        this.#options.maxGlobalRequestsPerSecond
    ) {
      // Calculate how long to wait
      const retryAfter =
        this.#globalRateTracker.windowStartTime + windowDuration - now;

      // Emit rate limit hit event
      this.#emitRateLimitHit(
        {
          requestId,
          bucketId: "global",
          resetAfter: retryAfter,
          global: true,
          method: "GLOBAL",
          route: "global",
        },
        now,
      );

      return {
        canProceed: false,
        retryAfter,
        limitType: "global",
        scope: "global",
        reason: "Global rate limit exceeded",
      };
    }

    return { canProceed: true };
  }

  /**
   * Checks if a request would exceed a bucket's limit.
   * Enforces bucket-specific rate limits.
   *
   * @param bucket - Rate limit bucket to check
   * @param path - API path for the request
   * @param method - HTTP method used for the request
   * @param requestId - Unique identifier for this request
   * @param now - Current timestamp
   * @returns Rate limit check result
   * @private
   */
  #checkBucketLimit(
    bucket: RateLimitBucket,
    path: string,
    method: HttpMethod,
    requestId: string,
    now: number,
  ): RateLimitResult {
    // Handle emoji routes with stricter limits
    if (bucket.isEmojiRoute) {
      return this.#checkEmojiRouteLimit(bucket, path, method, requestId, now);
    }

    // No remaining requests in this bucket
    if (bucket.remaining <= 0 && bucket.reset > now) {
      const retryAfter = bucket.reset - now;

      // Emit event
      this.#emitRateLimitHit(
        {
          requestId,
          bucketId: bucket.hash,
          resetAfter: retryAfter,
          global: false,
          method,
          route: path,
        },
        now,
      );

      return {
        canProceed: false,
        retryAfter,
        limitType: "bucket",
        scope: bucket.scope,
        bucketHash: bucket.hash,
        reason: "Bucket has no remaining requests",
      };
    }

    // Adaptive safety margin based on bucket
    // Use smaller margin for high-capacity buckets
    const adaptiveSafetyMargin =
      bucket.limit > 10
        ? Math.min(50, this.#options.safetyMarginMs)
        : this.#options.safetyMarginMs;

    // Safety margin when approaching reset
    if (bucket.remaining === 1 && bucket.reset - now < adaptiveSafetyMargin) {
      const retryAfter = adaptiveSafetyMargin;

      // Emit event
      this.#emitRateLimitHit(
        {
          requestId,
          bucketId: bucket.hash,
          resetAfter: retryAfter,
          global: false,
          method,
          route: path,
        },
        now,
      );

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
   * Special check for emoji routes per Discord documentation.
   * Emoji routes have special rate limit handling.
   *
   * @param bucket - Rate limit bucket to check
   * @param path - API path for the request
   * @param method - HTTP method used for the request
   * @param requestId - Unique identifier for this request
   * @param now - Current timestamp
   * @returns Rate limit check result
   * @private
   */
  #checkEmojiRouteLimit(
    bucket: RateLimitBucket,
    path: string,
    method: HttpMethod,
    requestId: string,
    now: number,
  ): RateLimitResult {
    // Emoji routes need more cautious handling per Discord documentation
    // Stop at 1 remaining request to prevent rate limit issues
    if (bucket.remaining <= 1 && bucket.reset > now) {
      const retryAfter = bucket.reset - now;

      // Emit event
      this.#emitRateLimitHit(
        {
          requestId,
          bucketId: bucket.hash,
          resetAfter: retryAfter,
          global: false,
          method,
          route: path,
        },
        now,
      );

      return {
        canProceed: false,
        retryAfter,
        limitType: "emoji",
        scope: bucket.scope,
        bucketHash: bucket.hash,
        reason: "Emoji route rate limit",
      };
    }

    return { canProceed: true };
  }

  /**
   * Handles a 429 Too Many Requests response.
   * Processes rate limit exceeded responses.
   *
   * @param path - API path that was requested
   * @param method - HTTP method used for the request
   * @param headers - Response headers containing rate limit information
   * @param requestId - Unique identifier for this request
   * @param now - Current timestamp
   * @returns Rate limit result
   * @private
   */
  #handleRateLimitExceeded(
    path: string,
    method: HttpMethod,
    headers: Record<string, string>,
    requestId: string,
    now: number,
  ): RateLimitResult {
    const { HEADERS } = RateLimitManager;

    const retryAfterSec = Number(headers[HEADERS.RETRY_AFTER]);
    const retryAfter = retryAfterSec * 1000; // Convert to milliseconds
    const scope = (headers[HEADERS.SCOPE] as RateLimitScope) ?? "user";
    const isGlobal = headers[HEADERS.GLOBAL] === "true";
    const bucketId = headers[HEADERS.BUCKET] || "unknown";

    // Emit rate limit hit event
    this.#emitRateLimitHit(
      {
        requestId,
        bucketId,
        resetAfter: retryAfter,
        global: isGlobal,
        method,
        route: path,
      },
      now,
    );

    return {
      canProceed: false,
      retryAfter,
      limitType: isGlobal ? "global" : "bucket",
      scope,
      bucketHash: bucketId,
      reason: "Rate limit exceeded",
    };
  }

  /**
   * Updates a rate limit bucket from response headers.
   * Processes and stores rate limit information.
   *
   * @param bucketHash - Unique hash identifier for this bucket
   * @param headers - Response headers containing rate limit information
   * @param routeKey - Unique key for this route
   * @param path - API path that was requested
   * @param requestId - Unique identifier for this request
   * @param now - Current timestamp
   * @returns Rate limit result
   * @private
   */
  #updateBucket(
    bucketHash: string,
    headers: Record<string, string>,
    routeKey: string,
    path: string,
    requestId: string,
    now: number,
  ): RateLimitResult {
    const { HEADERS } = RateLimitManager;

    // Check if it's an emoji route
    const isEmojiRoute = RateLimitManager.EMOJI_ROUTE_PATTERN.test(path);

    // Parse reset time and calculate TTL for the bucket
    const resetTimeSeconds = Number(headers[HEADERS.RESET]);
    const resetTimeMs = resetTimeSeconds * 1000; // Convert from seconds to milliseconds
    const bucketTtl = Math.max(0, resetTimeMs - now) + 60000; // Add 1 minute buffer

    // Extract bucket information from headers
    const bucket: RateLimitBucket = {
      hash: bucketHash,
      limit: Number(headers[HEADERS.LIMIT]),
      remaining: Number(headers[HEADERS.REMAINING]),
      reset: resetTimeMs,
      resetAfter: Number(headers[HEADERS.RESET_AFTER]) * 1000, // Convert from seconds to milliseconds
      scope: (headers[HEADERS.SCOPE] as RateLimitScope) ?? "user",
      isEmojiRoute,
      requestId,
    };

    // Update stores with TTL based on reset time
    this.#buckets.setWithTtl(bucketHash, bucket, bucketTtl);
    this.#routeBuckets.set(routeKey, bucketHash);

    // Emit update event
    this.#rest.emit("rateLimitUpdate", {
      timestamp: new Date(now).toISOString(),
      requestId,
      bucketId: bucketHash,
      remaining: bucket.remaining,
      limit: bucket.limit,
      resetAfter: bucket.resetAfter,
      resetAt: new Date(bucket.reset).toISOString(),
      route: path,
    });

    // Return the result
    return {
      canProceed: true,
      bucketHash,
      scope: bucket.scope,
    };
  }

  /**
   * Emits a rate limit hit event.
   * Used for tracking and monitoring rate limit hits.
   *
   * @param params - Parameters for the rate limit hit event
   * @param now - Current timestamp
   * @private
   */
  #emitRateLimitHit(
    params: Omit<RateLimitHitEvent, "timestamp">,
    now: number,
  ): void {
    const event: RateLimitHitEvent = {
      timestamp: new Date(now).toISOString(),
      requestId: params.requestId,
      bucketId: params.bucketId,
      resetAfter: params.resetAfter,
      global: params.global,
      method: params.method,
      route: params.route,
    };

    this.#rest.emit("rateLimitHit", event);
  }
}

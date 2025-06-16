import { sleep } from "@nyxojs/core";
import { Store, StoreOptions } from "@nyxojs/store";
import { z } from "zod/v4";
import type { Rest } from "../core/index.js";
import type { HttpMethod, RateLimitHitEvent } from "../types/index.js";

/**
 * Constants defining rate limit behavior and Discord API patterns.
 * These values are based on Discord's official documentation and observed behavior.
 */
export const RATE_LIMIT_CONSTANTS = {
  /**
   * Emoji route pattern for special handling.
   * Discord documentation confirms only emoji routes have special rate limit handling.
   * Emoji routes are more restrictive and require conservative rate limiting.
   *
   * @example "/guilds/123456789/emojis" matches this pattern
   */
  EMOJI_ROUTE_PATTERN: /^\/guilds\/(\d+)\/emojis/,

  /**
   * Routes not subject to the global rate limit per Discord documentation.
   * Only interaction endpoints are exempted from global rate limits because
   * they have their own separate rate limiting system and are time-sensitive.
   *
   * @remarks Webhook routes are also exempt as they use different authentication
   */
  GLOBAL_EXEMPT_ROUTES: ["/interactions", "/webhooks"],

  /**
   * Status codes that indicate invalid requests for Cloudflare protection.
   * These codes count towards the invalid request limit that can trigger
   * Cloudflare IP bans if exceeded within a 10-minute window.
   *
   * @remarks 429 is included because repeated rate limit violations
   * can trigger Cloudflare protection even when handled properly
   */
  INVALID_STATUSES: [401, 403, 429],

  /**
   * Header names for rate limit information from Discord API responses.
   * These headers provide crucial information for rate limit tracking and
   * prevention of 429 Too Many Requests errors.
   */
  HEADERS: {
    /** Current rate limit for this bucket */
    LIMIT: "x-ratelimit-limit",
    /** Remaining requests in current window */
    REMAINING: "x-ratelimit-remaining",
    /** Unix timestamp when bucket resets */
    RESET: "x-ratelimit-reset",
    /** Seconds until bucket resets */
    RESET_AFTER: "x-ratelimit-reset-after",
    /** Unique bucket hash for this endpoint */
    BUCKET: "x-ratelimit-bucket",
    /** Scope of this rate limit (user, global, shared) */
    SCOPE: "x-ratelimit-scope",
    /** Whether this is a global rate limit */
    GLOBAL: "x-ratelimit-global",
    /** Seconds to wait before retrying (429 responses) */
    RETRY_AFTER: "retry-after",
  },
};

/**
 * Configuration schema for the rate limit manager.
 * Extends StoreOptions to inherit caching and memory management settings.
 *
 * @remarks All timing values are in milliseconds for consistency
 */
export const RateLimitOptions = StoreOptions.extend({
  /**
   * Cleanup interval in milliseconds for removing expired buckets.
   * Controls how often expired rate limit buckets are removed from memory.
   * Lower values use more CPU but free memory faster.
   *
   * @default 60000 (1 minute)
   * @remarks Should be balanced with typical bucket reset times
   */
  cleanupInterval: z.number().int().positive().default(60000),

  /**
   * Safety margin in milliseconds when approaching bucket reset.
   * Adds buffer time to prevent accidental rate limit violations due to
   * network latency, clock drift, or processing delays.
   *
   * @default 100 (reduced from 500 for better performance)
   * @remarks Lower values increase throughput but risk rate limit violations
   */
  safetyMargin: z.number().int().positive().default(100),

  /**
   * Maximum invalid requests allowed in a 10-minute rolling window.
   * Prevents Cloudflare IP bans from excessive invalid requests.
   * Based on Discord's documented Cloudflare protection limits.
   *
   * @default 10000 (Discord's documented limit)
   * @remarks Exceeding this triggers a 10-minute cooldown period
   */
  maxInvalidRequests: z.number().int().positive().max(10000).default(10000),

  /**
   * Maximum global requests per second across all endpoints.
   * Controls overall request rate to Discord API to prevent global rate limits.
   * Based on Discord's global rate limit of 50 requests per second.
   *
   * @default 50 (Discord's global limit)
   * @remarks This is separate from per-route rate limits
   */
  maxGlobalRequestsPerSecond: z.number().int().positive().default(50),
});

/**
 * Validated configuration options for the rate limit manager.
 * This type is derived from the RateLimitOptions schema and ensures
 * all options are type-safe and correctly configured.
 */
export type RateLimitOptions = z.infer<typeof RateLimitOptions>;

/**
 * Rate limit scopes returned by the Discord API.
 * Defines the scope at which the rate limit applies and affects caching strategy.
 *
 * @remarks Different scopes have different sharing behaviors:
 * - `user`: Rate limit applies per bot token
 * - `global`: Rate limit applies across all bots globally
 * - `shared`: Rate limit is shared across multiple related endpoints
 */
export type RateLimitScope = "user" | "global" | "shared";

/**
 * Tracking information for invalid requests within a rolling time window.
 * Used to monitor potentially abusive behavior and prevent Cloudflare IP bans.
 *
 * @remarks This implements a sliding window counter to track request patterns
 * that could trigger Discord's Cloudflare protection mechanisms.
 */
export interface InvalidRequestTracking {
  /**
   * Count of invalid requests in the current window.
   * Increments with each 401, 403, or 429 response.
   */
  count: number;

  /**
   * Unix timestamp when the current tracking window started.
   * Used to determine when to reset the counter for a new window.
   */
  windowStart: number;
}

/**
 * Rate limit bucket representing Discord's rate limiting state for specific endpoints.
 * Each bucket contains rate limit information and state for a group of related API endpoints.
 *
 * @remarks Buckets are identified by hash values returned in Discord API responses.
 * Multiple endpoints may share the same bucket if they're related.
 */
export interface RateLimitBucket {
  /**
   * Request ID that created or last updated this bucket.
   * Used for debugging and tracing rate limit updates.
   */
  requestId: string;

  /**
   * Unique hash identifier for this bucket from Discord.
   * Multiple API routes may share the same bucket hash.
   */
  hash: string;

  /**
   * Maximum requests allowed in this bucket's time window.
   * This value rarely changes for a given bucket.
   */
  limit: number;

  /**
   * Remaining requests in the current time window.
   * Decrements with each request until the bucket resets.
   */
  remaining: number;

  /**
   * Unix timestamp (in milliseconds) when the bucket resets.
   * After this time, remaining requests returns to the limit.
   */
  reset: number;

  /**
   * Time in milliseconds until the bucket resets.
   * Provides a countdown alternative to the absolute reset timestamp.
   */
  resetAfter: number;

  /**
   * Rate limit scope defining how this bucket is shared.
   * Affects caching and rate limit enforcement strategy.
   */
  scope: RateLimitScope;

  /**
   * Whether this route is an emoji route requiring special handling.
   * Emoji routes have more restrictive rate limiting per Discord docs.
   */
  isEmojiRoute?: boolean;
}

/**
 * Result of a rate limit check operation.
 * Provides comprehensive information about whether a request can proceed
 * and what actions should be taken if it cannot.
 */
export interface RateLimitResult {
  /**
   * Whether the request can proceed without violating rate limits.
   * False indicates the request should be delayed or aborted.
   */
  canProceed: boolean;

  /**
   * Time in milliseconds to wait before retrying the request.
   * Only present when canProceed is false.
   */
  retryAfter?: number;

  /**
   * Type of rate limit that was hit, affecting retry strategy.
   * Different limit types may require different handling approaches.
   */
  limitType?: "global" | "bucket" | "cloudflare" | "emoji";

  /**
   * Human-readable reason for the rate limit.
   * Useful for logging and debugging rate limit issues.
   */
  reason?: string;

  /**
   * Associated bucket hash if the limit is bucket-specific.
   * Allows correlation with bucket state for debugging.
   */
  bucketHash?: string;

  /**
   * Rate limit scope if applicable.
   * Indicates how the rate limit affects other requests.
   */
  scope?: RateLimitScope;
}

/**
 * Advanced rate limit manager for Discord API requests.
 *
 * Provides comprehensive rate limit tracking and enforcement to prevent 429 errors
 * and Cloudflare IP bans. Implements sophisticated algorithms for:
 *
 * - **Proactive rate limit prevention**: Checks limits before making requests
 * - **Multi-level rate limiting**: Handles global, bucket, and Cloudflare limits
 * - **Intelligent caching**: Caches rate limit decisions for performance
 * - **Adaptive safety margins**: Adjusts safety buffers based on bucket characteristics
 * - **Discord-specific optimizations**: Special handling for emoji routes and webhooks
 * - **Memory-efficient storage**: Uses TTL and LRU eviction for bucket storage
 * - **Comprehensive observability**: Emits detailed events for monitoring
 *
 * @example
 * ```typescript
 * const rateLimiter = new RateLimitManager(restClient, {
 *   maxGlobalRequestsPerSecond: 45, // Slightly under Discord's limit
 *   safetyMargin: 150, // Extra buffer for network latency
 *   maxInvalidRequests: 5000 // Conservative Cloudflare protection
 * });
 *
 * // Check if request can proceed
 * const result = await rateLimiter.checkAndWaitIfNeeded('/channels/123/messages', 'POST', 'req-123');
 * if (result.canProceed) {
 *   // Make the request
 * }
 * ```
 */
export class RateLimitManager {
  /**
   * Store for rate limit buckets indexed by bucket hash.
   * Contains rate limit state for each unique bucket returned by Discord.
   * Uses TTL eviction based on bucket reset times for automatic cleanup.
   *
   * @remarks Buckets are automatically removed when they expire to prevent memory leaks
   */
  readonly buckets: Store<string, RateLimitBucket>;

  /**
   * Store for route-to-bucket mappings indexed by route key.
   * Maps API routes to their corresponding rate limit bucket hashes.
   * Essential for determining which bucket applies to a given request.
   *
   * @remarks Route keys are generated using method and path combinations
   */
  readonly routeBuckets: Store<string, string>;

  /**
   * Cache for rate limit check results to reduce redundant computations.
   * Stores recent rate limit decisions to avoid repeated calculations
   * for the same route within a short time window.
   *
   * @remarks Cache is invalidated when bucket state changes
   */
  readonly #rateLimitCache: Store<string, RateLimitResult>;

  /**
   * Tracking state for invalid requests within rolling time windows.
   * Monitors 401, 403, and 429 responses to prevent Cloudflare IP bans.
   * Implements a sliding window counter with automatic reset.
   */
  readonly #invalidRequests: InvalidRequestTracking = {
    count: 0,
    windowStart: Date.now(),
  };

  /**
   * Global request rate tracking for per-second limits.
   * Monitors overall request rate across all endpoints to prevent
   * global rate limit violations (50 requests/second Discord limit).
   */
  readonly #globalRateTracker = {
    requestCount: 0,
    windowStartTime: Date.now(),
  };

  /**
   * Reference to the REST client instance for event emission.
   * Used to emit rate limit events for monitoring and observability.
   */
  readonly #rest: Rest;

  /**
   * Validated configuration options for this manager instance.
   * All options are validated through Zod schema for type safety.
   */
  readonly #options: RateLimitOptions;

  /**
   * Creates a new rate limit manager with the specified configuration.
   *
   * Initializes all storage systems and tracking mechanisms. The manager
   * starts in a clean state with no cached buckets or rate limit history.
   *
   * @param rest - REST client instance that will use this manager for rate limiting
   * @param options - Configuration options controlling rate limit behavior
   *
   * @remarks The manager automatically configures store sizes based on expected usage patterns
   */
  constructor(rest: Rest, options: RateLimitOptions) {
    this.#rest = rest;
    this.#options = options;

    // Initialize bucket storage with TTL support for automatic cleanup
    this.buckets = new Store<string, RateLimitBucket>(this.#options);

    // Initialize route mapping with larger capacity since routes may outnumber buckets
    this.routeBuckets = new Store<string, string>({
      ...this.#options,
      maxSize: this.#options.maxSize * 2, // Routes may outnumber buckets significantly
    });

    // Initialize decision cache with moderate size for performance optimization
    this.#rateLimitCache = new Store<string, RateLimitResult>({
      ...this.#options,
      maxSize: 1000, // Balance memory usage with cache hit rate
    });
  }

  /**
   * Checks rate limits and waits if necessary before proceeding with a request.
   *
   * This method combines rate limit checking and waiting into a single atomic operation,
   * ensuring that by the time it returns with `canProceed: true`, the request is
   * safe to make without violating any known rate limits.
   *
   * @param path - API path to request (e.g., "/channels/123/messages")
   * @param method - HTTP method for the request (GET, POST, etc.)
   * @param requestId - Unique identifier for request tracking and correlation
   * @returns Promise resolving to rate limit check result after any necessary waiting
   *
   * @example
   * ```typescript
   * const result = await rateLimiter.checkAndWaitIfNeeded('/guilds/123', 'GET', 'req-456');
   * if (result.canProceed) {
   *   // Safe to make the request now
   *   const response = await rest.get('/guilds/123');
   * }
   * ```
   *
   * @remarks This method may sleep for extended periods if rate limits are hit.
   * Consider implementing timeouts for user-facing operations.
   */
  async checkAndWaitIfNeeded(
    path: string,
    method: HttpMethod,
    requestId: string,
  ): Promise<RateLimitResult> {
    // Perform initial rate limit check without waiting
    const checkResult = this.checkRateLimit(path, method, requestId);

    // If we can proceed immediately, return success
    if (checkResult.canProceed) {
      return checkResult;
    }

    // Wait for the required time if rate limit was hit
    if (checkResult.retryAfter && checkResult.retryAfter > 0) {
      await sleep(checkResult.retryAfter);

      // Re-check after waiting to ensure we can now proceed
      // This handles edge cases where multiple rate limits might be active
      return this.checkRateLimit(path, method, requestId);
    }

    // Fallback for cases where retryAfter wasn't provided (should not happen)
    return checkResult;
  }

  /**
   * Performs a comprehensive rate limit check without waiting.
   *
   * Evaluates all applicable rate limits in order of precedence:
   * 1. Cached results (for performance)
   * 2. Global rate limits (unless route is exempt)
   * 3. Cloudflare protection limits
   * 4. Bucket-specific limits (with special emoji route handling)
   *
   * @param path - API path to check against rate limits
   * @param method - HTTP method for the request
   * @param requestId - Unique identifier for tracking and debugging
   * @returns Rate limit check result indicating whether request can proceed
   *
   * @example
   * ```typescript
   * const result = rateLimiter.checkRateLimit('/users/@me', 'GET', 'req-789');
   * if (!result.canProceed) {
   *   console.log(`Rate limited: ${result.reason}, wait ${result.retryAfter}ms`);
   * }
   * ```
   *
   * @remarks This method is synchronous except for cached lookups and does not
   * modify any rate limit state. It's safe to call repeatedly.
   */
  checkRateLimit(
    path: string,
    method: HttpMethod,
    requestId: string,
  ): RateLimitResult {
    const now = Date.now();

    // Check cached results first for performance optimization
    const cacheKey = `${method}:${path}`;
    const cached = this.#rateLimitCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Skip global rate limit check for exempt routes (interactions, webhooks)
    const isGlobalExempt = RATE_LIMIT_CONSTANTS.GLOBAL_EXEMPT_ROUTES.some(
      (route) => path.startsWith(route) || path.includes(route),
    );

    // Check global rate limits unless this route is specifically exempt
    if (!isGlobalExempt) {
      const globalCheck = this.#checkGlobalRateLimit(requestId, now);
      if (!globalCheck.canProceed) {
        return globalCheck;
      }
    }

    // Check Cloudflare protection limits to prevent IP bans
    const invalidCheck = this.#checkInvalidRequestLimit(requestId, now);
    if (!invalidCheck.canProceed) {
      return invalidCheck;
    }

    // Determine which bucket applies to this route
    const routeKey = this.getRouteKey(method, path);
    const bucketHash = this.routeBuckets.get(routeKey);

    // No bucket means no known rate limit for this route
    if (!bucketHash) {
      const result = { canProceed: true };

      // Cache positive results briefly to improve performance
      this.#rateLimitCache.set(cacheKey, result);
      return result;
    }

    // Retrieve bucket state for rate limit checking
    const bucket = this.buckets.get(bucketHash);
    if (!bucket) {
      const result = { canProceed: true };

      // Cache positive results when bucket is missing (expired or invalid)
      this.#rateLimitCache.set(cacheKey, result);
      return result;
    }

    // Perform bucket-specific rate limit checking
    const result = this.#checkBucketLimit(bucket, path, method, requestId, now);

    // Cache positive results to avoid redundant checks
    if (result.canProceed) {
      this.#rateLimitCache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Updates rate limit information from API response and waits if a new limit was hit.
   *
   * Processes rate limit headers from Discord API responses to update bucket state
   * and handle any newly discovered rate limits. If a 429 response indicates a
   * rate limit was hit, this method will wait for the specified retry period.
   *
   * @param path - API path that was requested
   * @param method - HTTP method used for the request
   * @param headers - Response headers containing rate limit information
   * @param statusCode - HTTP status code from the response
   * @param requestId - Unique identifier for request correlation
   * @returns Promise resolving to updated rate limit state
   *
   * @example
   * ```typescript
   * // After making a request
   * const updateResult = await rateLimiter.updateRateLimitAndWaitIfNeeded(
   *   '/channels/123/messages',
   *   'POST',
   *   response.headers,
   *   response.statusCode,
   *   'req-456'
   * );
   * ```
   *
   * @remarks This method should be called after every API response to maintain
   * accurate rate limit state and handle any newly discovered limits.
   */
  async updateRateLimitAndWaitIfNeeded(
    path: string,
    method: HttpMethod,
    headers: Record<string, string>,
    statusCode: number,
    requestId: string,
  ): Promise<RateLimitResult> {
    // Update rate limit state from response headers
    const updateResult = this.updateRateLimit(
      path,
      method,
      headers,
      statusCode,
      requestId,
    );

    // If we hit a rate limit (e.g., 429 response), wait for the retry period
    if (
      !updateResult.canProceed &&
      updateResult.retryAfter &&
      updateResult.retryAfter > 0
    ) {
      await sleep(updateResult.retryAfter);

      // After waiting, return success state since we've waited the required time
      return {
        canProceed: true,
        bucketHash: updateResult.bucketHash,
        scope: updateResult.scope,
      };
    }

    // Return the update result if no waiting was required
    return updateResult;
  }

  /**
   * Generates a unique key for mapping API routes to rate limit buckets.
   *
   * Creates consistent identifiers for API routes that account for special cases
   * like emoji routes which have different rate limiting behavior. The key format
   * ensures that routes sharing the same rate limit bucket are properly grouped.
   *
   * @param method - HTTP method used for the request
   * @param path - API path for the request
   * @returns Unique string key for this route combination
   *
   * @example
   * ```typescript
   * // Regular route
   * const key1 = rateLimiter.getRouteKey('GET', '/channels/123');
   * // Returns: "GET:/channels/123"
   *
   * // Emoji route (special handling)
   * const key2 = rateLimiter.getRouteKey('POST', '/guilds/456/emojis');
   * // Returns: "emoji:456:POST"
   * ```
   *
   * @remarks Emoji routes receive special key formatting because they have
   * different rate limiting characteristics per Discord documentation.
   */
  getRouteKey(method: HttpMethod, path: string): string {
    // Handle emoji routes with special key format for different rate limiting
    const emojiMatch = path.match(RATE_LIMIT_CONSTANTS.EMOJI_ROUTE_PATTERN);
    if (emojiMatch) {
      return `emoji:${emojiMatch[1]}:${method}`;
    }

    // Standard route key format for most endpoints
    return `${method}:${path}`;
  }

  /**
   * Processes and updates rate limit information from API response headers.
   *
   * Parses Discord's rate limit headers to update bucket state, track invalid
   * requests, and handle rate limit exceeded responses. This method is the
   * primary mechanism for learning about and adapting to Discord's rate limits.
   *
   * @param path - API path that was requested
   * @param method - HTTP method used for the request
   * @param headers - Response headers containing rate limit data
   * @param statusCode - HTTP status code to determine response type
   * @param requestId - Unique identifier for request tracking
   * @returns Updated rate limit result reflecting new state
   *
   * @example
   * ```typescript
   * const result = rateLimiter.updateRateLimit(
   *   '/guilds/123/members',
   *   'GET',
   *   {
   *     'x-ratelimit-limit': '100',
   *     'x-ratelimit-remaining': '95',
   *     'x-ratelimit-reset': '1640995200',
   *     'x-ratelimit-bucket': 'abc123'
   *   },
   *   200,
   *   'req-789'
   * );
   * ```
   *
   * @remarks This method handles both successful responses (updating bucket state)
   * and error responses (tracking invalid requests and rate limit hits).
   */
  updateRateLimit(
    path: string,
    method: HttpMethod,
    headers: Record<string, string>,
    statusCode: number,
    requestId: string,
  ): RateLimitResult {
    const now = Date.now();

    // Update global request counter for rate tracking
    this.#updateGlobalRequestCount(now);

    // Track invalid responses for Cloudflare protection
    if (RATE_LIMIT_CONSTANTS.INVALID_STATUSES.includes(statusCode)) {
      this.#trackInvalidRequest(now);
    }

    // Invalidate cache for this route since state may have changed
    const cacheKey = `${method}:${path}`;
    this.#rateLimitCache.delete(cacheKey);

    const routeKey = this.getRouteKey(method, path);

    // Handle rate limit exceeded responses (429 status)
    if (statusCode === 429) {
      return this.#handleRateLimitExceeded(
        path,
        method,
        headers,
        requestId,
        now,
      );
    }

    // Extract bucket hash from headers to update bucket state
    const bucketHash = headers[RATE_LIMIT_CONSTANTS.HEADERS.BUCKET];
    if (!bucketHash) {
      // No bucket information available, return success
      return {
        canProceed: true,
      };
    }

    // Update bucket state with new rate limit information
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
   * Releases all resources used by the rate limit manager.
   *
   * Destroys all internal stores and clears tracking state. This method should
   * be called when the manager is no longer needed to prevent memory leaks.
   * The manager instance cannot be used after calling destroy().
   *
   * @example
   * ```typescript
   * // When shutting down the application
   * await restClient.destroy(); // This calls rateLimiter.destroy() internally
   * ```
   *
   * @remarks This method is automatically called when the parent REST client
   * is destroyed, so manual calls are usually not necessary.
   */
  destroy(): void {
    // Destroy all stores to release memory and clear event listeners
    this.buckets.destroy();
    this.routeBuckets.destroy();
    this.#rateLimitCache.destroy();
  }

  /**
   * Records an invalid request in the rolling window for Cloudflare protection.
   *
   * Implements a sliding window counter to track 401, 403, and 429 responses
   * that count towards Discord's Cloudflare protection limits. Automatically
   * resets the window after 10 minutes to prevent indefinite penalties.
   *
   * @param now - Current timestamp for window calculations
   * @internal
   */
  #trackInvalidRequest(now: number): void {
    const windowDuration = 600_000; // 10 minutes in milliseconds

    // Check if we need to start a new tracking window
    if (now - this.#invalidRequests.windowStart >= windowDuration) {
      // Start fresh window with this request
      this.#invalidRequests.count = 1;
      this.#invalidRequests.windowStart = now;
    } else {
      // Increment counter within current window
      this.#invalidRequests.count++;
    }
  }

  /**
   * Updates the global request counter for per-second rate limiting.
   *
   * Maintains a sliding window counter for the global 50 requests/second limit.
   * Automatically resets the counter each second to track current request rate.
   *
   * @param now - Current timestamp for window calculations
   * @internal
   */
  #updateGlobalRequestCount(now: number): void {
    const windowDuration = 1000; // 1 second window for global rate limiting

    // Check if we need to start a new tracking window
    if (now - this.#globalRateTracker.windowStartTime >= windowDuration) {
      // Start fresh window with this request
      this.#globalRateTracker.requestCount = 1;
      this.#globalRateTracker.windowStartTime = now;
    } else {
      // Increment counter within current window
      this.#globalRateTracker.requestCount++;
    }
  }

  /**
   * Checks if the invalid request limit has been exceeded for Cloudflare protection.
   *
   * Evaluates whether the current invalid request count would trigger Discord's
   * Cloudflare protection, which can result in temporary IP bans. Returns a
   * rate limit result indicating when it's safe to make requests again.
   *
   * @param requestId - Unique identifier for event correlation
   * @param now - Current timestamp for calculations
   * @returns Rate limit result indicating if requests should be blocked
   * @internal
   */
  #checkInvalidRequestLimit(requestId: string, now: number): RateLimitResult {
    const windowDuration = 600_000; // 10 minutes window

    // Check if we're still within the tracking window and over the limit
    if (
      now - this.#invalidRequests.windowStart < windowDuration &&
      this.#invalidRequests.count >= this.#options.maxInvalidRequests
    ) {
      // Calculate how long to wait until the window expires
      const retryAfter =
        this.#invalidRequests.windowStart + windowDuration - now;

      // Emit rate limit hit event for monitoring
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

    // Within acceptable limits, can proceed
    return { canProceed: true };
  }

  /**
   * Checks if the global request rate limit has been exceeded.
   *
   * Evaluates whether the current global request rate would exceed Discord's
   * 50 requests/second limit. This check applies to most endpoints except
   * interactions and webhooks which have separate rate limiting.
   *
   * @param requestId - Unique identifier for event correlation
   * @param now - Current timestamp for calculations
   * @returns Rate limit result indicating if request should be delayed
   * @internal
   */
  #checkGlobalRateLimit(requestId: string, now: number): RateLimitResult {
    const windowDuration = 1000; // 1 second window

    // Check if we're still within the window and over the rate limit
    if (
      now - this.#globalRateTracker.windowStartTime < windowDuration &&
      this.#globalRateTracker.requestCount >=
        this.#options.maxGlobalRequestsPerSecond
    ) {
      // Calculate how long to wait until the window resets
      const retryAfter =
        this.#globalRateTracker.windowStartTime + windowDuration - now;

      // Emit rate limit hit event for monitoring
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

    // Within global rate limit, can proceed
    return { canProceed: true };
  }

  /**
   * Checks if a request would exceed a specific bucket's rate limit.
   *
   * Evaluates bucket-specific rate limits with intelligent safety margins
   * and special handling for emoji routes. Uses adaptive safety margins
   * based on bucket characteristics to balance throughput with safety.
   *
   * @param bucket - Rate limit bucket to check against
   * @param path - API path for the request
   * @param method - HTTP method for the request
   * @param requestId - Unique identifier for event correlation
   * @param now - Current timestamp for calculations
   * @returns Rate limit result for this specific bucket
   * @internal
   */
  #checkBucketLimit(
    bucket: RateLimitBucket,
    path: string,
    method: HttpMethod,
    requestId: string,
    now: number,
  ): RateLimitResult {
    // Use special handling for emoji routes which are more restrictive
    if (bucket.isEmojiRoute) {
      return this.#checkEmojiRouteLimit(bucket, path, method, requestId, now);
    }

    // Check if bucket has no remaining requests and hasn't reset yet
    if (bucket.remaining <= 0 && bucket.reset > now) {
      const retryAfter = bucket.reset - now;

      // Emit rate limit hit event for monitoring
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

    // Calculate adaptive safety margin based on bucket capacity
    // High-capacity buckets can use smaller margins for better throughput
    const adaptiveSafetyMargin =
      bucket.limit > 10
        ? Math.min(50, this.#options.safetyMargin)
        : this.#options.safetyMargin;

    // Apply safety margin when approaching bucket reset to prevent races
    if (bucket.remaining === 1 && bucket.reset - now < adaptiveSafetyMargin) {
      const retryAfter = adaptiveSafetyMargin;

      // Emit rate limit hit event for monitoring
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

    // Bucket has sufficient capacity, can proceed
    return { canProceed: true };
  }

  /**
   * Applies special rate limiting rules for emoji routes.
   *
   * Emoji routes have more restrictive rate limiting per Discord documentation
   * and require conservative handling to prevent violations. This method
   * implements stricter limits than regular routes.
   *
   * @param bucket - Rate limit bucket for the emoji route
   * @param path - API path for the emoji request
   * @param method - HTTP method for the request
   * @param requestId - Unique identifier for event correlation
   * @param now - Current timestamp for calculations
   * @returns Rate limit result with emoji-specific restrictions
   * @internal
   */
  #checkEmojiRouteLimit(
    bucket: RateLimitBucket,
    path: string,
    method: HttpMethod,
    requestId: string,
    now: number,
  ): RateLimitResult {
    // Emoji routes require more conservative handling - stop at 1 remaining
    // This prevents rate limit violations due to their special characteristics
    if (bucket.remaining <= 1 && bucket.reset > now) {
      const retryAfter = bucket.reset - now;

      // Emit emoji-specific rate limit hit event
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

    // Emoji route has sufficient capacity
    return { canProceed: true };
  }

  /**
   * Processes a 429 Too Many Requests response from the Discord API.
   *
   * Handles rate limit exceeded responses by extracting retry information
   * and determining the appropriate scope and wait time. Also tracks
   * invalid requests for Cloudflare protection.
   *
   * @param path - API path that returned 429
   * @param method - HTTP method used for the request
   * @param headers - Response headers with retry information
   * @param requestId - Unique identifier for event correlation
   * @param now - Current timestamp for calculations
   * @returns Rate limit result with retry information
   * @internal
   */
  #handleRateLimitExceeded(
    path: string,
    method: HttpMethod,
    headers: Record<string, string>,
    requestId: string,
    now: number,
  ): RateLimitResult {
    const { HEADERS } = RATE_LIMIT_CONSTANTS;

    // Extract retry delay from response headers
    const retryAfterSec = Number(headers[HEADERS.RETRY_AFTER]);
    const retryAfter = retryAfterSec * 1000; // Convert to milliseconds

    // Determine rate limit scope, defaulting to 'user' if not specified
    const scope = (headers[HEADERS.SCOPE] as RateLimitScope) ?? "user";

    // Track as invalid request unless it's a shared scope limit
    if (scope !== "shared") {
      this.#trackInvalidRequest(now);
    }

    // Determine if this is a global rate limit
    const isGlobal = headers[HEADERS.GLOBAL] === "true";
    const bucketId = headers[HEADERS.BUCKET] || "unknown";

    // Emit rate limit hit event for monitoring and alerting
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
   * Updates or creates a rate limit bucket from response headers.
   *
   * Processes rate limit information from successful API responses to update
   * bucket state. Calculates appropriate TTL values and updates both bucket
   * storage and route mappings for future rate limit checks.
   *
   * @param bucketHash - Unique bucket identifier from response headers
   * @param headers - Response headers containing rate limit information
   * @param routeKey - Route key for mapping this route to the bucket
   * @param path - API path for the request
   * @param requestId - Unique identifier for event correlation
   * @param now - Current timestamp for TTL calculations
   * @returns Rate limit result indicating success
   * @internal
   */
  #updateBucket(
    bucketHash: string,
    headers: Record<string, string>,
    routeKey: string,
    path: string,
    requestId: string,
    now: number,
  ): RateLimitResult {
    const { HEADERS } = RATE_LIMIT_CONSTANTS;

    // Determine if this is an emoji route for special handling
    const isEmojiRoute = RATE_LIMIT_CONSTANTS.EMOJI_ROUTE_PATTERN.test(path);

    // Parse reset time and calculate TTL for bucket storage
    const resetTimeSeconds = Number(headers[HEADERS.RESET]);
    const resetTimeMs = resetTimeSeconds * 1000; // Convert to milliseconds
    const bucketTtl = Math.max(0, resetTimeMs - now) + 60000; // Add 1 minute buffer

    // Create bucket object with all rate limit information
    const bucket: RateLimitBucket = {
      hash: bucketHash,
      limit: Number(headers[HEADERS.LIMIT]),
      remaining: Number(headers[HEADERS.REMAINING]),
      reset: resetTimeMs,
      resetAfter: Number(headers[HEADERS.RESET_AFTER]) * 1000, // Convert to milliseconds
      scope: (headers[HEADERS.SCOPE] as RateLimitScope) ?? "user",
      isEmojiRoute,
      requestId,
    };

    // Store bucket with automatic TTL expiration based on reset time
    this.buckets.setWithTtl(bucketHash, bucket, bucketTtl);

    // Map this route to the bucket for future lookups
    this.routeBuckets.set(routeKey, bucketHash);

    // Emit rate limit update event for monitoring
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

    // Return success result with bucket information
    return {
      canProceed: true,
      bucketHash,
      scope: bucket.scope,
    };
  }

  /**
   * Emits a rate limit hit event for monitoring and observability.
   *
   * Creates and emits a standardized rate limit hit event that can be
   * consumed by monitoring systems, alerting, and logging infrastructure.
   * Provides comprehensive context about the rate limit violation.
   *
   * @param params - Event parameters without timestamp
   * @param now - Current timestamp for the event
   * @internal
   */
  #emitRateLimitHit(
    params: Omit<RateLimitHitEvent, "timestamp">,
    now: number,
  ): void {
    // Create complete event object with timestamp
    const event: RateLimitHitEvent = {
      timestamp: new Date(now).toISOString(),
      requestId: params.requestId,
      bucketId: params.bucketId,
      resetAfter: params.resetAfter,
      global: params.global,
      method: params.method,
      route: params.route,
    };

    // Emit event for external monitoring and logging systems
    this.#rest.emit("rateLimitHit", event);
  }
}

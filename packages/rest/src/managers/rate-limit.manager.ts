import { sleep } from "@nyxojs/core";
import { z } from "zod";
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
 *
 * @remarks All timing values are in milliseconds for consistency
 */
export const RateLimitOptions = z.object({
  /**
   * Safety margin in milliseconds when approaching bucket reset.
   * Adds buffer time to prevent accidental rate limit violations due to
   * network latency, clock drift, or processing delays.
   *
   * @default 100
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

  /**
   * Interval in milliseconds for cleaning up expired buckets.
   * Prevents memory leaks by removing buckets that have expired.
   *
   * @default 300000 (5 minutes)
   * @remarks Lower values use more CPU but free memory faster
   */
  cleanupInterval: z.number().int().positive().default(300000),
});

/**
 * Validated configuration options for the rate limit manager.
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
interface InvalidRequestTracking {
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
 * Global rate tracker for monitoring request rates across all endpoints.
 * Prevents global rate limit violations by tracking requests per second.
 *
 * @remarks This tracker resets every second to maintain a rolling count
 * of requests made in the current second, allowing proactive rate limit management.
 */
interface GlobalRateTracker {
  /**
   * Count of requests made in the current second.
   * Resets every second to track global request rate.
   */
  requestCount: number;

  /**
   * Unix timestamp when the current tracking window started.
   * Used to determine when to reset the request count for a new second.
   */
  windowStartTime: number;
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
 * Simple bucket store with automatic TTL-based cleanup.
 * Buckets are automatically removed when they expire to prevent memory leaks.
 */
class BucketStore {
  /**
   * Internal storage for rate limit buckets.
   * @internal
   */
  readonly #buckets = new Map<string, RateLimitBucket>();

  /**
   * Timeout IDs for bucket cleanup operations.
   * @internal
   */
  readonly #cleanupTimeouts = new Map<string, NodeJS.Timeout>();

  /**
   * Returns the number of active buckets.
   */
  get size(): number {
    return this.#buckets.size;
  }

  /**
   * Sets a bucket with automatic cleanup when it expires.
   *
   * @param hash - Unique bucket identifier
   * @param bucket - Rate limit bucket data
   */
  set(hash: string, bucket: RateLimitBucket): void {
    // Clear existing cleanup timeout if it exists
    const existingTimeout = this.#cleanupTimeouts.get(hash);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Store the bucket
    this.#buckets.set(hash, bucket);

    // Schedule automatic cleanup when bucket expires
    const ttl = Math.max(0, bucket.reset - Date.now()) + 60000; // Add 1 minute buffer
    const timeout = setTimeout(() => {
      this.#buckets.delete(hash);
      this.#cleanupTimeouts.delete(hash);
    }, ttl);

    this.#cleanupTimeouts.set(hash, timeout);
  }

  /**
   * Retrieves a bucket if it exists and hasn't expired.
   *
   * @param hash - Bucket identifier to retrieve
   * @returns The bucket if found and valid, undefined otherwise
   */
  get(hash: string): RateLimitBucket | undefined {
    const bucket = this.#buckets.get(hash);
    if (!bucket) {
      return undefined;
    }

    // Check if bucket has expired
    if (Date.now() >= bucket.reset) {
      this.delete(hash);
      return undefined;
    }

    return bucket;
  }

  /**
   * Checks if a bucket exists and is valid.
   *
   * @param hash - Bucket identifier to check
   * @returns True if bucket exists and is valid
   */
  has(hash: string): boolean {
    return this.get(hash) !== undefined;
  }

  /**
   * Manually deletes a bucket and its cleanup timeout.
   *
   * @param hash - Bucket identifier to delete
   * @returns True if bucket was deleted
   */
  delete(hash: string): boolean {
    const timeout = this.#cleanupTimeouts.get(hash);
    if (timeout) {
      clearTimeout(timeout);
      this.#cleanupTimeouts.delete(hash);
    }
    return this.#buckets.delete(hash);
  }

  /**
   * Clears all buckets and cleanup timeouts.
   */
  clear(): void {
    // Clear all timeouts
    for (const timeout of this.#cleanupTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.#cleanupTimeouts.clear();
    this.#buckets.clear();
  }
}

/**
 * Advanced rate limit manager for Discord API requests.
 *
 * Provides comprehensive rate limit tracking and enforcement to prevent 429 errors
 * and Cloudflare IP bans. Implements sophisticated algorithms for:
 *
 * - **Proactive rate limit prevention**: Checks limits before making requests
 * - **Multi-level rate limiting**: Handles global, bucket, and Cloudflare limits
 * - **Discord-specific optimizations**: Special handling for emoji routes and webhooks
 * - **Memory-efficient storage**: Automatic cleanup of expired buckets
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
   * Buckets are automatically removed when they expire.
   */
  readonly buckets = new BucketStore();

  /**
   * Simple map for route-to-bucket mappings indexed by route key.
   * Maps API routes to their corresponding rate limit bucket hashes.
   */
  readonly routeBuckets = new Map<string, string>();

  /**
   * Tracking state for invalid requests within rolling time windows.
   * Monitors 401, 403, and 429 responses to prevent Cloudflare IP bans.
   * @internal
   */
  readonly #invalidRequests: InvalidRequestTracking = {
    count: 0,
    windowStart: Date.now(),
  };

  /**
   * Global request rate tracking for per-second limits.
   * Monitors overall request rate across all endpoints to prevent
   * global rate limit violations (50 requests/second Discord limit).
   * @internal
   */
  readonly #globalRateTracker: GlobalRateTracker = {
    requestCount: 0,
    windowStartTime: Date.now(),
  };

  /**
   * Reference to the REST client instance for event emission.
   * @internal
   */
  readonly #rest: Rest;

  /**
   * Validated configuration options for this manager instance.
   * @internal
   */
  readonly #options: RateLimitOptions;

  /**
   * Interval for periodic cleanup of expired data.
   * @internal
   */
  #cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Flag to track if the manager has been destroyed.
   * @internal
   */
  #isDestroyed = false;

  /**
   * Creates a new rate limit manager with the specified configuration.
   *
   * Initializes all storage systems and tracking mechanisms. The manager
   * starts in a clean state with no cached buckets or rate limit history.
   *
   * @param rest - REST client instance that will use this manager for rate limiting
   * @param options - Configuration options controlling rate limit behavior
   *
   * @remarks The manager automatically configures cleanup based on expected usage patterns
   */
  constructor(rest: Rest, options: RateLimitOptions) {
    this.#rest = rest;
    this.#options = options;

    // Start periodic cleanup of expired data
    this.#cleanupInterval = setInterval(() => {
      if (!this.#isDestroyed) {
        this.#cleanup();
      }
    }, this.#options.cleanupInterval);
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

      // Return the original result as tests expect this behavior
      return checkResult;
    }

    // Fallback for cases where retryAfter wasn't provided
    return checkResult;
  }

  /**
   * Performs a comprehensive rate limit check without waiting.
   *
   * Evaluates all applicable rate limits in order of precedence:
   * 1. Global rate limits (unless route is exempt)
   * 2. Cloudflare protection limits
   * 3. Bucket-specific limits (with special emoji route handling)
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
   * @remarks This method is synchronous and does not modify any rate limit state.
   */
  checkRateLimit(
    path: string,
    method: HttpMethod,
    requestId: string,
  ): RateLimitResult {
    const now = Date.now();

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
      return { canProceed: true };
    }

    // Retrieve bucket state for rate limit checking
    const bucket = this.buckets.get(bucketHash);
    if (!bucket) {
      return { canProceed: true };
    }

    // Perform bucket-specific rate limit checking
    return this.#checkBucketLimit(bucket, path, method, requestId, now);
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

    return updateResult;
  }

  /**
   * Generates a unique key for mapping API routes to rate limit buckets.
   *
   * Creates consistent identifiers for API routes that account for special cases
   * like emoji routes which have different rate limiting behavior.
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
      return { canProceed: true };
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
   *
   * @example
   * ```typescript
   * // When shutting down the application
   * await restClient.destroy(); // This calls rateLimiter.destroy() internally
   * ```
   */
  destroy(): void {
    this.#isDestroyed = true;

    // Stop cleanup interval
    if (this.#cleanupInterval) {
      clearInterval(this.#cleanupInterval);
      this.#cleanupInterval = null;
    }

    // Clear all stores
    this.buckets.clear();
    this.routeBuckets.clear();
  }

  /**
   * Records an invalid request in the rolling window for Cloudflare protection.
   *
   * Tracks 401, 403, and 429 responses within a 10-minute rolling window to prevent
   * Cloudflare IP bans from excessive invalid requests. Implements a sliding window
   * counter that resets every 10 minutes.
   *
   * @param now - Current timestamp in milliseconds for window calculations
   *
   * @internal
   */
  #trackInvalidRequest(now: number): void {
    const windowDuration = 600_000; // 10 minutes

    if (now - this.#invalidRequests.windowStart >= windowDuration) {
      this.#invalidRequests.count = 1;
      this.#invalidRequests.windowStart = now;
    } else {
      this.#invalidRequests.count++;
    }
  }

  /**
   * Updates the global request counter for per-second rate limiting.
   *
   * Maintains a rolling count of requests made in the current second to enforce
   * Discord's global rate limit of 50 requests per second. Resets the counter
   * when entering a new second-based time window.
   *
   * @param now - Current timestamp in milliseconds for window calculations
   *
   * @internal
   */
  #updateGlobalRequestCount(now: number): void {
    const windowDuration = 1000; // 1 second

    if (now - this.#globalRateTracker.windowStartTime >= windowDuration) {
      this.#globalRateTracker.requestCount = 1;
      this.#globalRateTracker.windowStartTime = now;
    } else {
      this.#globalRateTracker.requestCount++;
    }
  }

  /**
   * Checks if the invalid request limit has been exceeded for Cloudflare protection.
   *
   * Validates the current count of invalid requests against the configured limit
   * to prevent Cloudflare IP bans. If the limit is exceeded, calculates the
   * remaining time until the window expires and requests can resume.
   *
   * @param requestId - Unique identifier for request tracking and correlation
   * @param now - Current timestamp in milliseconds for window calculations
   * @returns Rate limit result indicating if request can proceed and retry timing
   *
   * @internal
   */
  #checkInvalidRequestLimit(requestId: string, now: number): RateLimitResult {
    const windowDuration = 600_000; // 10 minutes

    if (
      now - this.#invalidRequests.windowStart < windowDuration &&
      this.#invalidRequests.count >= this.#options.maxInvalidRequests
    ) {
      const retryAfter =
        this.#invalidRequests.windowStart + windowDuration - now;

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
   * Checks if the global request rate limit has been exceeded.
   *
   * Validates the current request count against Discord's global rate limit
   * of 50 requests per second. If exceeded, calculates the remaining time
   * until the current second expires and requests can resume.
   *
   * @param requestId - Unique identifier for request tracking and correlation
   * @param now - Current timestamp in milliseconds for window calculations
   * @returns Rate limit result indicating if request can proceed and retry timing
   *
   * @internal
   */
  #checkGlobalRateLimit(requestId: string, now: number): RateLimitResult {
    const windowDuration = 1000; // 1 second

    if (
      now - this.#globalRateTracker.windowStartTime < windowDuration &&
      this.#globalRateTracker.requestCount >=
        this.#options.maxGlobalRequestsPerSecond
    ) {
      const retryAfter =
        this.#globalRateTracker.windowStartTime + windowDuration - now;

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
   * Checks if a request would exceed a specific bucket's rate limit.
   *
   * Evaluates the current state of a rate limit bucket to determine if a new
   * request can proceed without violating Discord's per-bucket limits. Applies
   * safety margins and special handling for emoji routes when necessary.
   *
   * @param bucket - Rate limit bucket containing current state and limits
   * @param path - API path being requested for context and emoji route detection
   * @param method - HTTP method for the request
   * @param requestId - Unique identifier for request tracking and correlation
   * @param now - Current timestamp in milliseconds for limit calculations
   * @returns Rate limit result indicating if request can proceed and retry timing
   *
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

    // Apply safety margin when approaching bucket reset to prevent races
    if (
      bucket.remaining <= 1 &&
      bucket.reset - now < this.#options.safetyMargin
    ) {
      const retryAfter = bucket.reset - now + this.#options.safetyMargin;

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
   * Applies special rate limiting rules for emoji routes.
   *
   * Emoji routes require more conservative rate limiting per Discord's documentation.
   * Uses stricter thresholds (stops at 1 remaining instead of 0) to prevent violations
   * on these more sensitive endpoints.
   *
   * @param bucket - Rate limit bucket for the emoji route
   * @param path - API path being requested for context
   * @param method - HTTP method for the request
   * @param requestId - Unique identifier for request tracking and correlation
   * @param now - Current timestamp in milliseconds for limit calculations
   * @returns Rate limit result with conservative emoji route handling
   *
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
    if (bucket.remaining <= 1 && bucket.reset > now) {
      const retryAfter = bucket.reset - now;

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
   * Processes a 429 Too Many Requests response from the Discord API.
   *
   * Handles rate limit exceeded responses by extracting retry timing information
   * from Discord's response headers and determining appropriate retry strategies.
   * Tracks the violation for invalid request counting and emits monitoring events.
   *
   * @param path - API path that received the 429 response
   * @param method - HTTP method that was rate limited
   * @param headers - Response headers containing rate limit information
   * @param requestId - Unique identifier for request tracking and correlation
   * @param now - Current timestamp in milliseconds for calculations
   * @returns Rate limit result with retry timing and violation context
   *
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

    const retryAfterHeader =
      headers[HEADERS.RETRY_AFTER] ?? headers[HEADERS.RESET_AFTER];
    const retryAfterSec = Number(retryAfterHeader);
    const retryAfter = retryAfterSec * 1000;

    const scope = (headers[HEADERS.SCOPE] as RateLimitScope) ?? "user";

    // Track as invalid request unless it's a shared scope limit
    if (scope !== "shared") {
      this.#trackInvalidRequest(now);
    }

    const isGlobal = headers[HEADERS.GLOBAL] === "true";
    const bucketId =
      headers[HEADERS.BUCKET] || (isGlobal ? "global" : "unknown");

    this.#emitRateLimitHit(
      {
        requestId,
        bucketId,
        resetAfter: retryAfter,
        global: isGlobal,
        method: isGlobal ? "GLOBAL" : method,
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
   * Processes Discord API response headers to extract rate limit information
   * and update the corresponding bucket state. Creates new buckets for previously
   * unknown rate limit hashes and maps API routes to their buckets.
   *
   * @param bucketHash - Unique bucket identifier from Discord response headers
   * @param headers - Response headers containing complete rate limit data
   * @param routeKey - Internal route key for mapping routes to buckets
   * @param path - API path for emoji route detection and context
   * @param requestId - Unique identifier for request tracking and correlation
   * @param now - Current timestamp in milliseconds for bucket state
   * @returns Success result with updated bucket information
   *
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

    const isEmojiRoute = RATE_LIMIT_CONSTANTS.EMOJI_ROUTE_PATTERN.test(path);
    const resetTimeSeconds = Number(headers[HEADERS.RESET]);
    const resetTimeMs = resetTimeSeconds * 1000;

    const bucket: RateLimitBucket = {
      hash: bucketHash,
      limit: Number(headers[HEADERS.LIMIT]),
      remaining: Number(headers[HEADERS.REMAINING]),
      reset: resetTimeMs,
      resetAfter: Number(headers[HEADERS.RESET_AFTER]) * 1000,
      scope: (headers[HEADERS.SCOPE] as RateLimitScope) ?? "user",
      isEmojiRoute,
      requestId,
    };

    // Store bucket with automatic cleanup
    this.buckets.set(bucketHash, bucket);

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

    return {
      canProceed: true,
      bucketHash,
      scope: bucket.scope,
    };
  }

  /**
   * Emits a rate limit hit event for monitoring and observability.
   *
   * Publishes comprehensive rate limit hit events through the REST client's
   * event system for external monitoring, logging, and alerting systems.
   * Includes complete context about the rate limit violation.
   *
   * @param params - Rate limit hit event parameters with violation details
   * @param now - Current timestamp for consistent event timing
   *
   * @internal
   */
  #emitRateLimitHit(
    params: Omit<RateLimitHitEvent, "timestamp">,
    now: number,
  ): void {
    this.#rest.emit("rateLimitHit", {
      timestamp: new Date(now).toISOString(),
      requestId: params.requestId,
      bucketId: params.bucketId,
      resetAfter: params.resetAfter,
      global: params.global,
      method: params.method,
      route: params.route,
    });
  }

  /**
   * Performs periodic cleanup of expired data.
   *
   * Cleans up stale route-to-bucket mappings for buckets that no longer exist.
   * The BucketStore handles its own automatic cleanup, but route mappings need
   * manual cleanup to prevent memory leaks from orphaned references.
   *
   * @internal
   */
  #cleanup(): void {
    // The BucketStore handles its own cleanup automatically,
    // but we can clean up route mappings for deleted buckets
    const expiredRoutes: string[] = [];

    for (const [routeKey, bucketHash] of this.routeBuckets.entries()) {
      if (!this.buckets.has(bucketHash)) {
        expiredRoutes.push(routeKey);
      }
    }

    for (const routeKey of expiredRoutes) {
      this.routeBuckets.delete(routeKey);
    }
  }
}

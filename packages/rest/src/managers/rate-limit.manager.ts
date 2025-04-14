import { z } from "zod";
import type { Rest } from "../core/index.js";
import type { HttpMethod, RateLimitHitEvent } from "../types/index.js";

/**
 * Possible rate limit scopes returned by the Discord API.
 * Defines the scope of application for a rate limit.
 */
export type RateLimitScope = "user" | "global" | "shared";

/**
 * Rate limit tracking information for invalid requests.
 * Used to prevent excessive invalid requests that could trigger Cloudflare bans.
 */
export interface InvalidRequestTracking {
  /**
   * Count of invalid requests in the current window.
   * Resets when the window expires.
   */
  count: number;

  /**
   * Timestamp when the current tracking window started.
   * Used to determine when the window should expire.
   */
  windowStart: number;
}

/**
 * Represents a rate limit bucket from Discord.
 * Discord groups API endpoints into buckets which share rate limits.
 */
export interface RateLimitBucket {
  /**
   * Request ID that created/updated this bucket.
   * Used for tracking and correlation.
   */
  requestId: string;

  /**
   * Unique hash identifier for this bucket.
   * Assigned by Discord to identify the specific rate limit bucket.
   */
  hash: string;

  /**
   * Maximum requests allowed in this window.
   * The total capacity of the bucket.
   */
  limit: number;

  /**
   * Remaining requests in this window.
   * Decrements with each request to the bucket.
   */
  remaining: number;

  /**
   * Timestamp when the bucket resets (in ms).
   * Absolute time when limits will be refreshed.
   */
  reset: number;

  /**
   * Time until the bucket resets (in ms).
   * Relative time until limits will be refreshed.
   */
  resetAfter: number;

  /**
   * Rate limit scope.
   * Indicates whether limits apply globally, per-user, or are shared.
   */
  scope: RateLimitScope;

  /**
   * Whether this route needs special handling.
   * Some routes have custom rate limit behavior.
   */
  isSpecialRoute?: boolean;

  /**
   * Route type for special handling.
   * Identifies specific APIs that need custom rate limiting.
   */
  routeType?: "emoji" | "webhook" | "reaction";
}

/**
 * Result of a rate limit check.
 * Contains information about whether a request can proceed and, if not, why.
 */
export interface RateLimitResult {
  /**
   * Whether the request can proceed.
   * If false, the request should be delayed.
   */
  canProceed: boolean;

  /**
   * Time in milliseconds to wait before retrying.
   * Only provided if canProceed is false.
   */
  retryAfter?: number;

  /**
   * Type of rate limit that was hit.
   * Identifies the source or category of the limit.
   */
  limitType?: "global" | "bucket" | "cloudflare" | "special";

  /**
   * Reason for the rate limit.
   * Human-readable explanation of why the limit was hit.
   */
  reason?: string;

  /**
   * Associated bucket hash if applicable.
   * Identifies which specific bucket triggered the limit.
   */
  bucketHash?: string;

  /**
   * Rate limit scope if applicable.
   * Indicates the scope of the limit that was hit.
   */
  scope?: RateLimitScope;
}

/**
 * Configuration options for the rate limit manager.
 * Controls the behavior of rate limit tracking and enforcement.
 */
export const RateLimitOptions = z.object({
  /**
   * Cleanup interval in milliseconds (default: 30000).
   * Controls how often expired buckets are removed from memory.
   */
  cleanupInterval: z.number().nonnegative().int().min(0).default(30000),

  /**
   * Safety margin in milliseconds to apply when approaching reset (default: 500).
   * Adds a buffer to avoid hitting limits exactly at reset boundaries.
   */
  safetyMarginMs: z.number().nonnegative().int().min(0).default(500),

  /**
   * Maximum invalid requests allowed in a 10-minute window (default: 10000).
   * Prevents excessive invalid requests which could trigger Cloudflare bans.
   */
  maxInvalidRequests: z
    .number()
    .nonnegative()
    .int()
    .min(0)
    .max(10000)
    .default(10000),

  /**
   * Maximum global requests per second (default: 1000).
   * Limits total API calls to prevent hitting global rate limits.
   */
  maxGlobalRequestsPerSecond: z
    .number()
    .nonnegative()
    .int()
    .min(0)
    .default(1000),
});

export type RateLimitOptions = z.infer<typeof RateLimitOptions>;

/**
 * Manages rate limits for Discord API requests.
 *
 * Responsibilities:
 * - Tracks rate limit buckets from Discord API responses
 * - Prevents requests that would exceed rate limits
 * - Monitors global and per-route request limits
 * - Provides information about when rate-limited requests can be retried
 * - Emits events for rate limit monitoring and debugging
 */
export class RateLimitManager {
  /**
   * Pattern matching for special routes.
   * Used to identify routes that need custom rate limit handling.
   */
  static readonly ROUTE_PATTERNS = {
    WEBHOOK: /^\/webhooks\/(\d+)\/([A-Za-z0-9-_]+)/,
    EMOJI: /^\/guilds\/(\d+)\/emojis/,
    REACTION: /^\/channels\/(\d+)\/messages\/(\d+)\/reactions/,
  };

  /**
   * Routes that are exempt from bucket tracking.
   * These routes have special handling in the Discord API.
   */
  static readonly EXEMPT_ROUTES = ["/interactions", "/webhooks"];

  /**
   * Status codes that indicate invalid requests.
   * Used to track potentially problematic requests.
   */
  static readonly INVALID_STATUSES = [401, 403, 429];

  /**
   * Header names for rate limit information.
   * Standard headers provided by Discord API in responses.
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

  /**
   * Map of bucket hashes to bucket objects.
   * Stores active rate limit buckets.
   */
  readonly #buckets = new Map<string, RateLimitBucket>();

  /**
   * Map of API routes to their bucket hashes.
   * Allows quick lookup of which bucket applies to a given route.
   */
  readonly #routeBuckets = new Map<string, string>();

  /**
   * Tracks invalid requests to prevent Cloudflare bans.
   * Monitors potentially problematic requests in a rolling window.
   */
  readonly #invalidRequests: InvalidRequestTracking = {
    count: 0,
    windowStart: Date.now(),
  };

  /**
   * Timestamp tracking for global rate limit.
   * Monitors overall request frequency to prevent global rate limits.
   */
  readonly #globalRateTracker = {
    requestCount: 0,
    windowStartTime: Date.now(),
  };

  /**
   * Reference to the Rest instance.
   * Used to emit events for logging and monitoring.
   */
  readonly #rest: Rest;

  /**
   * Cleanup interval timer.
   * Periodically removes expired buckets to prevent memory leaks.
   */
  #cleanupTimer: NodeJS.Timeout | null = null;

  /**
   * Configuration options.
   * Controls the behavior of the rate limit manager.
   */
  readonly #options: RateLimitOptions;

  /**
   * Creates a new rate limit manager.
   *
   * @param rest - Rest instance to emit events on
   * @param options - Configuration options for rate limit behavior
   */
  constructor(rest: Rest, options: RateLimitOptions) {
    this.#rest = rest;
    this.#options = options;

    // Start the cleanup timer
    this.#startCleanupTimer();
  }

  /**
   * Gets the rate limit buckets currently tracked.
   * Provides access to the internal bucket map for debugging and monitoring.
   *
   * @returns Map of bucket hashes to bucket objects
   */
  get buckets(): Map<string, RateLimitBucket> {
    return this.#buckets;
  }

  /**
   * Gets the route mappings currently tracked.
   * Provides access to the internal route-to-bucket mapping for debugging.
   *
   * @returns Map of route keys to bucket hashes
   */
  get routeBuckets(): Map<string, string> {
    return this.#routeBuckets;
  }

  /**
   * Checks if a request would exceed rate limits.
   * Determines whether a request can proceed immediately or should be delayed.
   *
   * @param path - API path being requested
   * @param method - HTTP method being used
   * @param requestId - Unique ID for this request for tracking purposes
   * @returns Result indicating whether the request can proceed and delay information if it can't
   */
  checkRateLimit(
    path: string,
    method: HttpMethod,
    requestId: string,
  ): RateLimitResult {
    // Skip exempt routes early
    if (
      RateLimitManager.EXEMPT_ROUTES.some((route) => path.startsWith(route))
    ) {
      return { canProceed: true };
    }

    // Check global limits first
    const globalCheck = this.#checkGlobalRateLimit(requestId);
    if (!globalCheck.canProceed) {
      return globalCheck;
    }

    // Check for CloudFlare protection
    const invalidCheck = this.#checkInvalidRequestLimit(requestId);
    if (!invalidCheck.canProceed) {
      return invalidCheck;
    }

    // Get bucket for this route
    const routeKey = this.getRouteKey(method, path);
    const bucketHash = this.#routeBuckets.get(routeKey);

    // No bucket means no known limit
    if (!bucketHash) {
      return { canProceed: true };
    }

    const bucket = this.#buckets.get(bucketHash);
    if (!bucket) {
      return { canProceed: true };
    }

    return this.#checkBucketLimit(bucket, path, method, requestId);
  }

  /**
   * Generates a unique key for an API route.
   * Creates a consistent identifier for routes, handling special cases appropriately.
   *
   * @param method - HTTP method used for the request
   * @param path - API path being requested
   * @returns Unique string key that identifies this specific route+method combination
   */
  getRouteKey(method: HttpMethod, path: string): string {
    // Check for special routes
    const patterns = RateLimitManager.ROUTE_PATTERNS;

    // Webhook routes
    const webhookMatch = path.match(patterns.WEBHOOK);
    if (webhookMatch) {
      return `webhook:${webhookMatch[1]}:${webhookMatch[2]}:${method}`;
    }

    // Emoji routes
    const emojiMatch = path.match(patterns.EMOJI);
    if (emojiMatch) {
      return `emoji:${emojiMatch[1]}:${method}`;
    }

    // Reaction routes
    const reactionMatch = path.match(patterns.REACTION);
    if (reactionMatch) {
      return `reaction:${reactionMatch[1]}:${reactionMatch[2]}:${method}`;
    }

    // Default route format
    return `${method}:${path}`;
  }

  /**
   * Updates rate limit information from API response.
   * Processes headers from a response to update internal rate limit tracking.
   *
   * @param path - API path that was requested
   * @param method - HTTP method that was used
   * @param headers - Response headers containing rate limit information
   * @param statusCode - HTTP status code from the response
   * @param requestId - Unique request ID for tracking and correlation
   * @returns Result indicating whether future requests can proceed
   */
  updateRateLimit(
    path: string,
    method: HttpMethod,
    headers: Record<string, string>,
    statusCode: number,
    requestId: string,
  ): RateLimitResult {
    // Update global request tracking
    this.#updateGlobalRequestCount();

    // Track invalid responses
    if (RateLimitManager.INVALID_STATUSES.includes(statusCode)) {
      this.#trackInvalidRequest();
    }

    // Skip processing for exempt routes
    if (
      RateLimitManager.EXEMPT_ROUTES.some((route) => path.startsWith(route))
    ) {
      return {
        canProceed: true,
      };
    }

    const routeKey = this.getRouteKey(method, path);

    // Handle rate limit exceeded responses
    if (statusCode === 429) {
      return this.#handleRateLimitExceeded(path, method, headers, requestId);
    }

    // Update bucket info if available
    const bucketHash = headers[RateLimitManager.HEADERS.BUCKET];
    if (!bucketHash) {
      return {
        canProceed: true,
      };
    }

    return this.#updateBucket(bucketHash, headers, routeKey, path, requestId);
  }

  /**
   * Cleans up resources used by the manager.
   * Should be called when the manager is no longer needed to prevent memory leaks.
   */
  destroy(): void {
    // Stop the cleanup timer
    if (this.#cleanupTimer !== null) {
      clearInterval(this.#cleanupTimer);
      this.#cleanupTimer = null;
    }

    // Clear stored data
    this.#buckets.clear();
    this.#routeBuckets.clear();
  }

  /**
   * Starts the automatic bucket cleanup timer.
   * Periodically removes expired buckets to prevent memory leaks.
   * @private
   */
  #startCleanupTimer(): void {
    // Clear any existing timer
    if (this.#cleanupTimer !== null) {
      clearInterval(this.#cleanupTimer);
    }

    // Set new cleanup interval
    this.#cleanupTimer = setInterval(() => {
      this.#cleanupExpiredBuckets();
    }, this.#options.cleanupInterval);
  }

  /**
   * Tracks an invalid request in the rolling window.
   * Used to prevent excessive invalid requests that could trigger Cloudflare bans.
   * @private
   */
  #trackInvalidRequest(): void {
    const now = Date.now();
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
   * Monitors overall request frequency to prevent hitting global rate limits.
   * @private
   */
  #updateGlobalRequestCount(): void {
    const now = Date.now();
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
   * Checks if a path is a special route needing custom handling.
   * Some routes have specific rate limit requirements or patterns.
   *
   * @param path - API path to check
   * @returns Route type if it matches a special pattern, undefined otherwise
   * @private
   */
  #getRouteType(path: string): "emoji" | "webhook" | "reaction" | undefined {
    const patterns = RateLimitManager.ROUTE_PATTERNS;

    if (patterns.EMOJI.test(path)) {
      return "emoji";
    }
    if (patterns.WEBHOOK.test(path)) {
      return "webhook";
    }
    if (patterns.REACTION.test(path)) {
      return "reaction";
    }

    return undefined;
  }

  /**
   * Checks if we've hit the invalid request limit.
   * Prevents excessive invalid requests that could trigger Cloudflare bans.
   *
   * @param requestId - Request ID for correlation in events
   * @returns Result indicating whether request can proceed based on invalid request history
   * @private
   */
  #checkInvalidRequestLimit(requestId: string): RateLimitResult {
    const now = Date.now();
    const windowDuration = 600_000; // 10 minutes

    if (
      now - this.#invalidRequests.windowStart < windowDuration &&
      this.#invalidRequests.count >= this.#options.maxInvalidRequests
    ) {
      const retryAfter =
        this.#invalidRequests.windowStart + windowDuration - now;

      // Emit rate limit hit event
      this.#emitRateLimitHit({
        requestId,
        bucketId: "invalid",
        resetAfter: retryAfter,
        global: false,
        method: undefined,
        route: "invalid",
      });

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
   * Prevents excessive requests that could trigger global rate limits.
   *
   * @param requestId - Request ID for correlation in events
   * @returns Result indicating whether request can proceed based on global request frequency
   * @private
   */
  #checkGlobalRateLimit(requestId: string): RateLimitResult {
    const now = Date.now();
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
      this.#emitRateLimitHit({
        requestId,
        bucketId: "global",
        resetAfter: retryAfter,
        global: true,
        method: "GLOBAL",
        route: "global",
      });

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
   * Evaluates a specific bucket to determine if a request can proceed.
   *
   * @param bucket - Rate limit bucket to check
   * @param path - API path being requested (for event emission)
   * @param method - HTTP method being used (for event emission)
   * @param requestId - Request ID for correlation
   * @returns Result indicating whether request can proceed based on bucket state
   * @private
   */
  #checkBucketLimit(
    bucket: RateLimitBucket,
    path: string,
    method: HttpMethod,
    requestId: string,
  ): RateLimitResult {
    const now = Date.now();

    // Handle special routes with stricter limits
    if (bucket.isSpecialRoute) {
      return this.#checkSpecialRouteLimit(bucket, path, method, requestId);
    }

    // No remaining requests in this bucket
    if (bucket.remaining <= 0 && bucket.reset > now) {
      const retryAfter = bucket.reset - now;

      this.#emitRateLimitHit({
        requestId,
        bucketId: bucket.hash,
        resetAfter: retryAfter,
        global: false,
        method,
        route: path,
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

    // Safety margin when approaching reset
    // This prevents hitting the rate limit exactly at the reset boundary
    if (
      bucket.remaining === 1 &&
      bucket.reset - now < this.#options.safetyMarginMs
    ) {
      const retryAfter = this.#options.safetyMarginMs;

      this.#emitRateLimitHit({
        requestId,
        bucketId: bucket.hash,
        resetAfter: retryAfter,
        global: false,
        method,
        route: path,
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
   * Special check for routes with custom handling.
   * Some routes (like emoji, reactions) need more cautious rate limit handling.
   *
   * @param bucket - Rate limit bucket to check
   * @param path - API path being requested (for event emission)
   * @param method - HTTP method being used (for event emission)
   * @param requestId - Request ID for correlation
   * @returns Result indicating whether request can proceed based on special route rules
   * @private
   */
  #checkSpecialRouteLimit(
    bucket: RateLimitBucket,
    path: string,
    method: HttpMethod,
    requestId: string,
  ): RateLimitResult {
    const now = Date.now();

    // Special routes (emoji, reaction) need more cautious handling
    // We stop at higher remaining values to prevent rate limit issues
    const minimumRemaining = bucket.routeType === "emoji" ? 1 : 0;

    if (bucket.remaining <= minimumRemaining && bucket.reset > now) {
      const retryAfter = bucket.reset - now;

      this.#emitRateLimitHit({
        requestId,
        bucketId: bucket.hash,
        resetAfter: retryAfter,
        global: false,
        method,
        route: path,
      });

      return {
        canProceed: false,
        retryAfter,
        limitType: "special",
        scope: bucket.scope,
        bucketHash: bucket.hash,
        reason: `${bucket.routeType} route rate limit`,
      };
    }

    return { canProceed: true };
  }

  /**
   * Handles a 429 Too Many Requests response.
   * Processes headers from a rate limit exceeded response to update tracking.
   *
   * @param path - API path that was requested
   * @param method - HTTP method that was used
   * @param headers - Response headers containing rate limit information
   * @param requestId - Request ID for correlation
   * @returns Result indicating delay until the request can be retried
   * @private
   */
  #handleRateLimitExceeded(
    path: string,
    method: HttpMethod,
    headers: Record<string, string>,
    requestId: string,
  ): RateLimitResult {
    const { HEADERS } = RateLimitManager;

    const retryAfterSec = Number(headers[HEADERS.RETRY_AFTER]);
    const retryAfter = retryAfterSec * 1000; // Convert to milliseconds
    const scope = (headers[HEADERS.SCOPE] as RateLimitScope) ?? "user";
    const isGlobal = headers[HEADERS.GLOBAL] === "true";
    const bucketId = headers[HEADERS.BUCKET] || "unknown";

    // Emit rate limit hit event
    this.#emitRateLimitHit({
      requestId,
      bucketId,
      resetAfter: retryAfter,
      global: isGlobal,
      method,
      route: path,
    });

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
   * Creates or updates bucket tracking information based on API response.
   *
   * @param bucketHash - Bucket hash from the API response headers
   * @param headers - Response headers containing rate limit information
   * @param routeKey - Route key for this request
   * @param path - API path that was requested
   * @param requestId - Request ID for correlation
   * @returns Result indicating whether future requests to this bucket can proceed
   * @private
   */
  #updateBucket(
    bucketHash: string,
    headers: Record<string, string>,
    routeKey: string,
    path: string,
    requestId: string,
  ): RateLimitResult {
    const { HEADERS } = RateLimitManager;

    // Extract route type for special handling
    const routeType = this.#getRouteType(path);

    // Extract bucket information from headers
    const bucket: RateLimitBucket = {
      hash: bucketHash,
      limit: Number(headers[HEADERS.LIMIT]),
      remaining: Number(headers[HEADERS.REMAINING]),
      reset: Number(headers[HEADERS.RESET]) * 1000, // Convert from seconds to milliseconds
      resetAfter: Number(headers[HEADERS.RESET_AFTER]) * 1000, // Convert from seconds to milliseconds
      scope: (headers[HEADERS.SCOPE] as RateLimitScope) ?? "user",
      isSpecialRoute: routeType !== undefined,
      routeType,
      requestId,
    };

    // Update our stores
    this.#buckets.set(bucketHash, bucket);
    this.#routeBuckets.set(routeKey, bucketHash);

    // Emit update event
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

    // Return the result
    return {
      canProceed: true,
      bucketHash,
      scope: bucket.scope,
    };
  }

  /**
   * Removes expired buckets to prevent memory leaks.
   * Periodically called to clean up buckets that are no longer needed.
   * @private
   */
  #cleanupExpiredBuckets(): void {
    const now = Date.now();
    const expiredBuckets: string[] = [];

    // Identify expired buckets
    for (const [hash, bucket] of this.#buckets.entries()) {
      if (bucket.reset < now) {
        expiredBuckets.push(hash);

        // Emit bucket expire event
        this.#rest.emit("rateLimitExpire", {
          timestamp: new Date().toISOString(),
          requestId: bucket.requestId,
          bucketId: hash,
          lifespan: now - (bucket.reset - bucket.resetAfter),
        });
      }
    }

    // Remove expired buckets
    for (const hash of expiredBuckets) {
      this.#buckets.delete(hash);
    }

    // Clean up route mappings in a memory-efficient way
    if (expiredBuckets.length > 0) {
      for (const [route, hash] of this.#routeBuckets.entries()) {
        if (expiredBuckets.includes(hash)) {
          this.#routeBuckets.delete(route);
        }
      }
    }
  }

  /**
   * Emits a rate limit hit event.
   * Used to communicate rate limit information for monitoring and debugging.
   *
   * @param params - Event parameters containing rate limit details
   * @private
   */
  #emitRateLimitHit(params: Omit<RateLimitHitEvent, "timestamp">): void {
    const event: RateLimitHitEvent = {
      timestamp: new Date().toISOString(),
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

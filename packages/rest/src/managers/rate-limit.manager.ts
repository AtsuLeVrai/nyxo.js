import { sleep } from "@nyxojs/core";
import { z } from "zod";
import type { Rest } from "../core/index.js";
import type { HttpMethod, RateLimitHitEvent } from "../types/index.js";

/**
 * Rate limit constants based on Discord API documentation.
 *
 * @public
 */
export const RATE_LIMIT_CONSTANTS = {
  /**
   * Emoji route pattern requiring special rate limit handling.
   */
  EMOJI_ROUTE_PATTERN: /^\/guilds\/(\d+)\/emojis/,

  /**
   * Routes exempt from global rate limits.
   */
  GLOBAL_EXEMPT_ROUTES: ["/interactions", "/webhooks"],

  /**
   * Status codes counting towards Cloudflare protection limits.
   */
  INVALID_STATUSES: [401, 403, 429],

  /**
   * Discord API rate limit header names.
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
    /** Scope of this rate limit */
    SCOPE: "x-ratelimit-scope",
    /** Whether this is a global rate limit */
    GLOBAL: "x-ratelimit-global",
    /** Seconds to wait before retrying */
    RETRY_AFTER: "retry-after",
  },
};

/**
 * Rate limit scope types from Discord API.
 * Determines sharing behavior and caching strategy.
 *
 * @public
 */
export type RateLimitScope = "user" | "global" | "shared";

/**
 * Invalid request tracking for Cloudflare protection.
 * Implements sliding window counter for abuse prevention.
 *
 * @internal
 */
interface InvalidRequestTracking {
  /**
   * Invalid request count in current window.
   */
  count: number;

  /**
   * Window start timestamp for counter reset.
   */
  windowStart: number;
}

/**
 * Global request rate tracker.
 * Maintains rolling per-second count for proactive rate limiting.
 *
 * @internal
 */
interface GlobalRateTracker {
  /**
   * Request count in current second.
   */
  requestCount: number;

  /**
   * Current tracking window start time.
   */
  windowStartTime: number;
}

/**
 * Rate limit bucket for Discord API endpoints.
 * Contains state for groups of related endpoints.
 *
 * @public
 */
export interface RateLimitBucket {
  /**
   * Request ID for debugging and tracing.
   */
  requestId: string;

  /**
   * Unique bucket hash from Discord API.
   */
  hash: string;

  /**
   * Maximum requests allowed in bucket window.
   */
  limit: number;

  /**
   * Remaining requests in current window.
   */
  remaining: number;

  /**
   * Bucket reset timestamp in milliseconds.
   */
  reset: number;

  /**
   * Time until bucket reset in milliseconds.
   */
  resetAfter: number;

  /**
   * Rate limit scope for sharing behavior.
   */
  scope: RateLimitScope;

  /**
   * Special handling flag for emoji routes.
   */
  isEmojiRoute?: boolean;
}

/**
 * Rate limit check result.
 * Indicates if request can proceed and required actions.
 *
 * @public
 */
export interface RateLimitResult {
  /**
   * Whether request can proceed without violation.
   */
  canProceed: boolean;

  /**
   * Retry delay in milliseconds when blocked.
   */
  retryAfter?: number;

  /**
   * Type of rate limit hit.
   */
  limitType?: "global" | "bucket" | "cloudflare" | "emoji";

  /**
   * Human-readable rate limit reason.
   */
  reason?: string;

  /**
   * Bucket hash for correlation and debugging.
   */
  bucketHash?: string;

  /**
   * Rate limit scope affecting other requests.
   */
  scope?: RateLimitScope;
}

/**
 * Rate limit manager configuration schema.
 * All timing values in milliseconds.
 *
 * @public
 */
export const RateLimitOptions = z.object({
  /**
   * Safety margin when approaching bucket reset.
   *
   * @default 100
   */
  safetyMargin: z.number().int().positive().default(100),

  /**
   * Maximum invalid requests in 10-minute rolling window.
   *
   * @default 10000
   */
  maxInvalidRequests: z.number().int().positive().max(10000).default(10000),

  /**
   * Maximum global requests per second across all endpoints.
   *
   * @default 50
   */
  maxGlobalRequestsPerSecond: z.number().int().positive().default(50),

  /**
   * Cleanup interval for expired buckets.
   *
   * @default 300000
   */
  cleanupInterval: z.number().int().positive().default(300000),
});

export type RateLimitOptions = z.infer<typeof RateLimitOptions>;

/**
 * Bucket store with automatic TTL cleanup.
 * Prevents memory leaks by removing expired buckets.
 *
 * @internal
 */
class BucketStore {
  /**
   * Internal bucket storage.
   *
   * @internal
   */
  readonly #buckets = new Map<string, RateLimitBucket>();

  /**
   * Cleanup timeout IDs.
   *
   * @internal
   */
  readonly #cleanupTimeouts = new Map<string, NodeJS.Timeout>();

  /**
   * Sets bucket with automatic cleanup on expiration.
   *
   * @param hash - Bucket identifier
   * @param bucket - Bucket data
   *
   * @public
   */
  set(hash: string, bucket: RateLimitBucket): void {
    const existingTimeout = this.#cleanupTimeouts.get(hash);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    this.#buckets.set(hash, bucket);

    const ttl = Math.max(0, bucket.reset - Date.now()) + 60000;
    const timeout = setTimeout(() => {
      this.#buckets.delete(hash);
      this.#cleanupTimeouts.delete(hash);
    }, ttl);

    this.#cleanupTimeouts.set(hash, timeout);
  }

  /**
   * Retrieves bucket if valid and not expired.
   *
   * @param hash - Bucket identifier
   * @returns Bucket if valid, undefined otherwise
   *
   * @public
   */
  get(hash: string): RateLimitBucket | undefined {
    const bucket = this.#buckets.get(hash);
    if (!bucket) {
      return undefined;
    }

    if (Date.now() >= bucket.reset) {
      this.delete(hash);
      return undefined;
    }

    return bucket;
  }

  /**
   * Checks if bucket exists and is valid.
   *
   * @param hash - Bucket identifier
   * @returns True if valid bucket exists
   *
   * @public
   */
  has(hash: string): boolean {
    return this.get(hash) !== undefined;
  }

  /**
   * Deletes bucket and cleanup timeout.
   *
   * @param hash - Bucket identifier
   * @returns True if deleted
   *
   * @public
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
   * Clears all buckets and timeouts.
   *
   * @public
   */
  clear(): void {
    for (const timeout of this.#cleanupTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.#cleanupTimeouts.clear();
    this.#buckets.clear();
  }
}

/**
 * Discord API rate limit manager.
 * Provides comprehensive rate limiting with proactive prevention.
 *
 * @example
 * ```typescript
 * const rateLimiter = new RateLimitManager(restClient, {
 *   maxGlobalRequestsPerSecond: 45,
 *   safetyMargin: 150
 * });
 * ```
 *
 * @public
 */
export class RateLimitManager {
  /**
   * Rate limit bucket store with automatic cleanup.
   *
   * @public
   */
  readonly buckets = new BucketStore();

  /**
   * Route-to-bucket hash mappings.
   *
   * @public
   */
  readonly routeBuckets = new Map<string, string>();

  /**
   * Invalid request tracking for Cloudflare protection.
   *
   * @internal
   */
  readonly #invalidRequests: InvalidRequestTracking = {
    count: 0,
    windowStart: Date.now(),
  };

  /**
   * Global rate tracker for per-second limits.
   *
   * @internal
   */
  readonly #globalRateTracker: GlobalRateTracker = {
    requestCount: 0,
    windowStartTime: Date.now(),
  };

  /**
   * REST client for event emission.
   *
   * @internal
   */
  readonly #rest: Rest;

  /**
   * Manager configuration options.
   *
   * @internal
   */
  readonly #options: RateLimitOptions;

  /**
   * Cleanup interval timer.
   *
   * @internal
   */
  #cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Manager destruction state.
   *
   * @internal
   */
  #isDestroyed = false;

  /**
   * Creates a new rate limit manager.
   * Initializes all storage systems and tracking mechanisms.
   *
   * @param rest - REST client instance for rate limiting
   * @param options - Configuration options controlling behavior
   *
   * @public
   */
  constructor(rest: Rest, options: RateLimitOptions) {
    this.#rest = rest;
    this.#options = options;

    this.#cleanupInterval = setInterval(() => {
      if (!this.#isDestroyed) {
        this.#cleanup();
      }
    }, this.#options.cleanupInterval);
  }

  /**
   * Checks rate limits and waits if necessary.
   * Combines rate limit checking and waiting into atomic operation.
   *
   * @param path - API path to request
   * @param method - HTTP method for the request
   * @param requestId - Unique identifier for tracking
   * @returns Promise resolving to rate limit check result
   *
   * @example
   * ```typescript
   * const result = await rateLimiter.checkAndWaitIfNeeded('/guilds/123', 'GET', 'req-456');
   * if (result.canProceed) {
   *   // Safe to make request
   * }
   * ```
   *
   * @public
   */
  async checkAndWaitIfNeeded(
    path: string,
    method: HttpMethod,
    requestId: string,
  ): Promise<RateLimitResult> {
    const checkResult = this.checkRateLimit(path, method, requestId);

    if (checkResult.canProceed) {
      return checkResult;
    }

    if (checkResult.retryAfter && checkResult.retryAfter > 0) {
      await sleep(checkResult.retryAfter);
      return checkResult;
    }

    return checkResult;
  }

  /**
   * Performs comprehensive rate limit check without waiting.
   * Evaluates all applicable rate limits in order of precedence.
   *
   * @param path - API path to check against rate limits
   * @param method - HTTP method for the request
   * @param requestId - Unique identifier for tracking
   * @returns Rate limit check result
   *
   * @example
   * ```typescript
   * const result = rateLimiter.checkRateLimit('/users/@me', 'GET', 'req-789');
   * if (!result.canProceed) {
   *   console.log(`Rate limited: ${result.reason}`);
   * }
   * ```
   *
   * @public
   */
  checkRateLimit(
    path: string,
    method: HttpMethod,
    requestId: string,
  ): RateLimitResult {
    const now = Date.now();

    const isGlobalExempt = RATE_LIMIT_CONSTANTS.GLOBAL_EXEMPT_ROUTES.some(
      (route) => path.startsWith(route) || path.includes(route),
    );

    if (!isGlobalExempt) {
      const globalCheck = this.#checkGlobalRateLimit(requestId, now);
      if (!globalCheck.canProceed) {
        return globalCheck;
      }
    }

    const invalidCheck = this.#checkInvalidRequestLimit(requestId, now);
    if (!invalidCheck.canProceed) {
      return invalidCheck;
    }

    const routeKey = this.getRouteKey(method, path);
    const bucketHash = this.routeBuckets.get(routeKey);

    if (!bucketHash) {
      return { canProceed: true };
    }

    const bucket = this.buckets.get(bucketHash);
    if (!bucket) {
      return { canProceed: true };
    }

    return this.#checkBucketLimit(bucket, path, method, requestId, now);
  }

  /**
   * Updates rate limit information from API response and waits if needed.
   * Processes headers to update bucket state and handle new limits.
   *
   * @param path - API path that was requested
   * @param method - HTTP method used for the request
   * @param headers - Response headers containing rate limit information
   * @param statusCode - HTTP status code from the response
   * @param requestId - Unique identifier for correlation
   * @returns Promise resolving to updated rate limit state
   *
   * @example
   * ```typescript
   * const result = await rateLimiter.updateRateLimitAndWaitIfNeeded(
   *   '/channels/123/messages', 'POST', response.headers, 200, 'req-456'
   * );
   * ```
   *
   * @public
   */
  async updateRateLimitAndWaitIfNeeded(
    path: string,
    method: HttpMethod,
    headers: Record<string, string>,
    statusCode: number,
    requestId: string,
  ): Promise<RateLimitResult> {
    const updateResult = this.updateRateLimit(
      path,
      method,
      headers,
      statusCode,
      requestId,
    );

    if (
      !updateResult.canProceed &&
      updateResult.retryAfter &&
      updateResult.retryAfter > 0
    ) {
      await sleep(updateResult.retryAfter);

      return {
        canProceed: true,
        bucketHash: updateResult.bucketHash,
        scope: updateResult.scope,
      };
    }

    return updateResult;
  }

  /**
   * Generates unique key for mapping API routes to buckets.
   * Creates consistent identifiers accounting for special cases.
   *
   * @param method - HTTP method used for the request
   * @param path - API path for the request
   * @returns Unique string key for this route combination
   *
   * @example
   * ```typescript
   * const key = rateLimiter.getRouteKey('GET', '/channels/123');
   * // Returns: "GET:/channels/123"
   * ```
   *
   * @public
   */
  getRouteKey(method: HttpMethod, path: string): string {
    const emojiMatch = path.match(RATE_LIMIT_CONSTANTS.EMOJI_ROUTE_PATTERN);
    if (emojiMatch) {
      return `emoji:${emojiMatch[1]}:${method}`;
    }

    return `${method}:${path}`;
  }

  /**
   * Processes and updates rate limit information from response headers.
   * Parses Discord headers to update bucket state and track violations.
   *
   * @param path - API path that was requested
   * @param method - HTTP method used for the request
   * @param headers - Response headers containing rate limit data
   * @param statusCode - HTTP status code to determine response type
   * @param requestId - Unique identifier for tracking
   * @returns Updated rate limit result reflecting new state
   *
   * @example
   * ```typescript
   * const result = rateLimiter.updateRateLimit('/guilds/123', 'GET', headers, 200, 'req-789');
   * ```
   *
   * @public
   */
  updateRateLimit(
    path: string,
    method: HttpMethod,
    headers: Record<string, string>,
    statusCode: number,
    requestId: string,
  ): RateLimitResult {
    const now = Date.now();

    this.#updateGlobalRequestCount(now);

    if (RATE_LIMIT_CONSTANTS.INVALID_STATUSES.includes(statusCode)) {
      this.#trackInvalidRequest(now);
    }

    const routeKey = this.getRouteKey(method, path);

    if (statusCode === 429) {
      return this.#handleRateLimitExceeded(
        path,
        method,
        headers,
        requestId,
        now,
      );
    }

    const bucketHash = headers[RATE_LIMIT_CONSTANTS.HEADERS.BUCKET];
    if (!bucketHash) {
      return { canProceed: true };
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
   * Releases all resources used by the manager.
   * Destroys internal stores and clears tracking state.
   *
   * @example
   * ```typescript
   * await restClient.destroy(); // Calls rateLimiter.destroy() internally
   * ```
   *
   * @public
   */
  destroy(): void {
    this.#isDestroyed = true;

    if (this.#cleanupInterval) {
      clearInterval(this.#cleanupInterval);
      this.#cleanupInterval = null;
    }

    this.buckets.clear();
    this.routeBuckets.clear();
  }

  /**
   * Records invalid request in rolling window for Cloudflare protection.
   * Tracks responses within 10-minute window to prevent IP bans.
   *
   * @param now - Current timestamp for window calculations
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
   * Updates global request counter for per-second rate limiting.
   * Maintains rolling count to enforce Discord's global limit.
   *
   * @param now - Current timestamp for window calculations
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
   * Checks if invalid request limit exceeded for Cloudflare protection.
   * Validates count against configured limit to prevent IP bans.
   *
   * @param requestId - Unique identifier for tracking
   * @param now - Current timestamp for window calculations
   * @returns Rate limit result with retry timing if exceeded
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
   * Checks if global request rate limit exceeded.
   * Validates count against Discord's 50 requests per second limit.
   *
   * @param requestId - Unique identifier for tracking
   * @param now - Current timestamp for window calculations
   * @returns Rate limit result with retry timing if exceeded
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
   * Checks if request would exceed bucket's rate limit.
   * Evaluates bucket state with safety margins and special handling.
   *
   * @param bucket - Rate limit bucket containing current state
   * @param path - API path being requested for context
   * @param method - HTTP method for the request
   * @param requestId - Unique identifier for tracking
   * @param now - Current timestamp for limit calculations
   * @returns Rate limit result with retry timing if blocked
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
    if (bucket.isEmojiRoute) {
      return this.#checkEmojiRouteLimit(bucket, path, method, requestId, now);
    }

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
   * Uses stricter thresholds for more sensitive endpoints.
   *
   * @param bucket - Rate limit bucket for the emoji route
   * @param path - API path being requested for context
   * @param method - HTTP method for the request
   * @param requestId - Unique identifier for tracking
   * @param now - Current timestamp for limit calculations
   * @returns Rate limit result with conservative emoji handling
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
   * Processes 429 Too Many Requests response from Discord API.
   * Extracts retry timing and determines appropriate strategies.
   *
   * @param path - API path that received the 429 response
   * @param method - HTTP method that was rate limited
   * @param headers - Response headers containing rate limit information
   * @param requestId - Unique identifier for tracking
   * @param now - Current timestamp for calculations
   * @returns Rate limit result with retry timing and context
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
   * Updates or creates rate limit bucket from response headers.
   * Processes headers to extract and update bucket state.
   *
   * @param bucketHash - Unique bucket identifier from headers
   * @param headers - Response headers containing rate limit data
   * @param routeKey - Internal route key for mapping
   * @param path - API path for emoji route detection
   * @param requestId - Unique identifier for tracking
   * @param now - Current timestamp for bucket state
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

    this.buckets.set(bucketHash, bucket);
    this.routeBuckets.set(routeKey, bucketHash);

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
   * Emits rate limit hit event for monitoring.
   * Publishes comprehensive events for external systems.
   *
   * @param params - Rate limit hit event parameters
   * @param now - Current timestamp for consistent timing
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
   * Cleans up stale route-to-bucket mappings.
   *
   * @internal
   */
  #cleanup(): void {
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

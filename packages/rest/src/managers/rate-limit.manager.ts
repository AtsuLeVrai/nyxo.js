import { Store } from "@nyxjs/store";
import type { Dispatcher } from "undici";
import type { Rest } from "../core/index.js";
import { RateLimitError } from "../errors/index.js";
import type { RateLimitOptions } from "../options/index.js";
import type {
  InvalidRequestTracking,
  RateLimitBucket,
  RateLimitScope,
} from "../types/index.js";

// Regular expressions for route pattern detection
const WEBHOOK_REGEX = /^\/webhooks\/(\d+)\/([A-Za-z0-9-_]+)/;
const EMOJI_REGEX = /^\/guilds\/(\d+)\/emojis/;
const EXEMPT_ROUTES = new Set(["/interactions", "/webhooks"]);

// Header names used in Discord API responses
const HEADERS = {
  limit: "x-ratelimit-limit",
  remaining: "x-ratelimit-remaining",
  reset: "x-ratelimit-reset",
  resetAfter: "x-ratelimit-reset-after",
  bucket: "x-ratelimit-bucket",
  scope: "x-ratelimit-scope",
  global: "x-ratelimit-global",
  retryAfter: "retry-after",
} as const;

/**
 * Manages rate limits for Discord API requests to ensure
 * compliance with their rate limiting policies.
 */
export class RateLimitManager {
  /** Map of bucket hashes to their bucket objects */
  readonly #buckets = new Store<string, RateLimitBucket>();

  /** Map of API route keys to their corresponding bucket hashes */
  readonly #routeBuckets = new Store<string, string>();

  /** Tracks invalid requests to prevent Cloudflare bans */
  readonly #invalidRequests: InvalidRequestTracking = {
    count: 0,
    windowStart: Date.now(),
  };

  /** Array of timestamps for global rate limit tracking */
  readonly #globalRequestTimes: number[] = [];

  /** Reference to the Rest instance for emitting events */
  readonly #rest: Rest;

  /** Rate limit configuration options */
  readonly #options: RateLimitOptions;

  /**
   * Creates a new rate limit manager
   * @param rest The Rest instance to emit events on
   * @param options Configuration options for rate limiting
   */
  constructor(rest: Rest, options: RateLimitOptions) {
    this.#rest = rest;
    this.#options = options;
  }

  /**
   * Checks if a request would exceed rate limits
   * @param path The API path being requested
   * @param method The HTTP method being used
   * @param requestId The unique ID for this request
   * @throws {RateLimitError} If the request would exceed rate limits
   */
  checkRateLimit(
    path: string,
    method: Dispatcher.HttpMethod,
    requestId: string,
  ): void {
    // Clean up expired buckets before checking
    this.#cleanupExpiredBuckets();

    // First check global rate limits
    this.#checkGlobalRateLimit(requestId);

    // Then check for invalid request limits (Cloudflare protection)
    this.#checkInvalidRequestLimit(requestId);

    // Skip checking for exempt routes
    if (EXEMPT_ROUTES.has(path)) {
      return;
    }

    // Get the bucket for this route
    const routeKey = this.getRouteKey(method, path);
    const bucketHash = this.#routeBuckets.get(routeKey);
    if (!bucketHash) {
      return;
    }

    const bucket = this.#buckets.get(bucketHash);
    if (bucket) {
      // Special handling for emoji routes
      if (this.#isEmojiRoute(path)) {
        this.#checkEmojiBucketLimit(bucket, path, method, requestId);
        return;
      }

      // Standard bucket check
      this.#checkBucketLimit(bucket, path, method, requestId);
    }
  }

  /**
   * Generates a unique key for an API route
   * @param method The HTTP method
   * @param path The API path
   * @returns A unique string key for this route
   */
  getRouteKey(method: Dispatcher.HttpMethod, path: string): string {
    // Special handling for webhook routes
    const webhookMatch = path.match(WEBHOOK_REGEX);
    if (webhookMatch) {
      return `webhook:${webhookMatch[1]}:${webhookMatch[2]}:${method}`;
    }

    // Special handling for emoji routes
    const emojiMatch = path.match(EMOJI_REGEX);
    if (emojiMatch) {
      return `emoji:${emojiMatch[1]}:${method}`;
    }

    // Default route key format
    return `${method}:${path}`;
  }

  /**
   * Updates rate limit information based on API response
   * @param path The API path that was requested
   * @param method The HTTP method that was used
   * @param headers The response headers
   * @param statusCode The HTTP status code
   * @param requestId The unique ID for this request
   */
  updateRateLimit(
    path: string,
    method: Dispatcher.HttpMethod,
    headers: Record<string, string>,
    statusCode: number,
    requestId: string,
  ): void {
    // Clean up expired buckets before checking
    this.#cleanupExpiredBuckets();

    // Keep track of global request counts
    this.#trackGlobalRequest();

    // Track invalid responses
    if (this.#isInvalidStatus(statusCode)) {
      this.#trackInvalidRequest();
    }

    // Skip processing for exempt routes
    if (EXEMPT_ROUTES.has(path)) {
      return;
    }

    const routeKey = this.getRouteKey(method, path);

    // Handle rate limit exceeded responses
    if (statusCode === 429) {
      this.#handleRateLimitExceeded(path, method, headers, requestId);
      return;
    }

    // Update bucket info if available
    const bucketHash = headers[HEADERS.bucket];
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
   * Checks if a status code indicates an invalid request
   * @private
   */
  #isInvalidStatus(statusCode: number): boolean {
    return statusCode === 401 || statusCode === 403 || statusCode === 429;
  }

  /**
   * Tracks an invalid request for rate limiting purposes
   * @private
   */
  #trackInvalidRequest(): void {
    const now = Date.now();
    if (
      now - this.#invalidRequests.windowStart >=
      this.#options.invalidRequestsWindow
    ) {
      this.#invalidRequests.count = 1;
      this.#invalidRequests.windowStart = now;
    } else {
      this.#invalidRequests.count++;
    }
  }

  /**
   * Checks if we've hit the invalid request limit (Cloudflare protection)
   * @param requestId ID to correlate related events
   * @private
   * @throws {RateLimitError} If the invalid request limit is exceeded
   */
  #checkInvalidRequestLimit(requestId: string): void {
    const now = Date.now();
    if (
      now - this.#invalidRequests.windowStart <
        this.#options.invalidRequestsWindow &&
      this.#invalidRequests.count >= this.#options.invalidRequestsLimit
    ) {
      const retryAfter =
        (this.#invalidRequests.windowStart +
          this.#options.invalidRequestsWindow -
          now) /
        1000;

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

      throw new RateLimitError(requestId, {
        method: "ANY",
        path: "ANY",
        retryAfter,
        scope: "global",
        global: true,
        reason: "Cloudflare invalid requests limit exceeded",
      });
    }
  }

  /**
   * Tracks a request for global rate limiting
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
   * @param requestId ID to correlate related events
   * @private
   * @throws {RateLimitError} If the global rate limit is exceeded
   */
  #checkGlobalRateLimit(requestId: string): void {
    if (this.#globalRequestTimes.length >= this.#options.requestsPerSecond) {
      const oldestRequest = this.#globalRequestTimes[0];
      if (!oldestRequest) {
        return;
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

        throw new RateLimitError(requestId, {
          method: "ANY",
          path: "ANY",
          retryAfter,
          scope: "global",
          global: true,
          reason: "Global rate limit exceeded",
        });
      }
    }
  }

  /**
   * Checks if a path is for the emoji API
   * @private
   */
  #isEmojiRoute(path: string): boolean {
    return EMOJI_REGEX.test(path);
  }

  /**
   * Handles a 429 Too Many Requests response
   * @param path The API path
   * @param method The HTTP method
   * @param headers The response headers
   * @param requestId ID to correlate related events
   * @private
   * @throws {RateLimitError} Always throws with details about the rate limit
   */
  #handleRateLimitExceeded(
    path: string,
    method: Dispatcher.HttpMethod,
    headers: Record<string, string>,
    requestId: string,
  ): void {
    const retryAfter = Number(headers[HEADERS.retryAfter]);
    const scope = (headers[HEADERS.scope] as RateLimitScope) ?? "user";
    const isGlobal = headers[HEADERS.global] === "true";
    const bucketId = headers[HEADERS.bucket] || "unknown";

    // Emit an event when hitting a rate limit from the API
    this.#rest.emit("rateLimitHit", {
      timestamp: new Date().toISOString(),
      requestId,
      bucketId,
      resetAfter: retryAfter,
      global: isGlobal,
      route: path,
      method,
      retryAfter: Number(headers[HEADERS.retryAfter]) || undefined,
    });

    throw new RateLimitError(requestId, {
      method,
      path,
      retryAfter,
      scope,
      global: isGlobal,
      bucketHash: bucketId,
    });
  }

  /**
   * Updates or creates a rate limit bucket
   * @param bucketHash The bucket hash from the API
   * @param headers The response headers
   * @param routeKey The route key for this request
   * @param path The API path
   * @param requestId ID to correlate related events
   * @private
   */
  #updateBucket(
    bucketHash: string,
    headers: Record<string, string>,
    routeKey: string,
    path: string,
    requestId: string,
  ): void {
    // Extract bucket information from headers
    const bucket: RateLimitBucket = {
      hash: bucketHash,
      limit: Number(headers[HEADERS.limit]),
      remaining: Number(headers[HEADERS.remaining]),
      reset: Number(headers[HEADERS.reset]) * 1000,
      resetAfter: Number(headers[HEADERS.resetAfter]) * 1000,
      scope: (headers[HEADERS.scope] as RateLimitScope) ?? "user",
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
   * @param bucket The rate limit bucket
   * @param path The API path
   * @param method The HTTP method
   * @param requestId ID to correlate related events
   * @private
   * @throws {RateLimitError} If the request would exceed the bucket's limit
   */
  #checkBucketLimit(
    bucket: RateLimitBucket,
    path: string,
    method: Dispatcher.HttpMethod,
    requestId: string,
  ): void {
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

      throw new RateLimitError(requestId, {
        method,
        path,
        retryAfter,
        scope: bucket.scope,
        bucketHash: bucket.hash,
      });
    }

    // Only one request remaining and close to reset - use safety margin
    if (
      bucket.remaining === 1 &&
      bucket.reset - now < this.#options.safetyMargin
    ) {
      const retryAfter = this.#options.safetyMargin / 1000;

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

      throw new RateLimitError(requestId, {
        method,
        path,
        retryAfter,
        scope: bucket.scope,
        bucketHash: bucket.hash,
      });
    }
  }

  /**
   * Special check for emoji route limits which have different rules
   * @param bucket The rate limit bucket
   * @param path The API path
   * @param method The HTTP method
   * @param requestId ID to correlate related events
   * @private
   * @throws {RateLimitError} If the request would exceed the emoji limit
   */
  #checkEmojiBucketLimit(
    bucket: RateLimitBucket,
    path: string,
    method: Dispatcher.HttpMethod,
    requestId: string,
  ): void {
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

      throw new RateLimitError(requestId, {
        method,
        path,
        retryAfter,
        scope: bucket.scope,
        bucketHash: bucket.hash,
        reason: "Emoji rate limit",
      });
    }
  }

  /**
   * Periodically removes expired buckets to prevent memory leaks
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

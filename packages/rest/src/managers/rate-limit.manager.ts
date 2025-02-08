import { Store } from "@nyxjs/store";
import type { Rest } from "../core/index.js";
import type { RateLimitOptions } from "../options/index.js";
import type {
  RateLimitBucket,
  RateLimitError,
  RateLimitScope,
} from "../types/index.js";

// Constants for rate limiting behavior
const RATE_LIMIT_CONSTANTS = {
  SAFETY_MARGIN_MS: 50,
  GLOBAL_RATE_LIMIT_PER_SECOND: 50,
  INVALID_REQUEST_LIMIT: 10000,
  INVALID_REQUEST_WINDOW_MINUTES: 10,
  DEFAULT_RETRY_DELAY_MS: 500,
} as const;

// Rate limit header constants as specified in Discord documentation
const RATE_LIMIT_HEADERS = {
  limit: "x-ratelimit-limit",
  remaining: "x-ratelimit-remaining",
  reset: "x-ratelimit-reset",
  resetAfter: "x-ratelimit-reset-after",
  bucket: "x-ratelimit-bucket",
  scope: "x-ratelimit-scope",
  global: "x-ratelimit-global",
  retryAfter: "retry-after",
} as const;

// Route patterns for special handling
const ROUTE_PATTERNS = {
  // Webhook route pattern with capture groups for ID and token
  WEBHOOK: /^\/webhooks\/(\d+)\/([A-Za-z0-9-_]+)/,

  // Routes exempt from global rate limits
  EXEMPT_ROUTES: ["/interactions", "/webhooks"],

  // Major resource identifiers as per Discord documentation
  MAJOR_RESOURCES: new Map([
    [/^\/guilds\/(\d+)/, "guild_id"],
    [/^\/channels\/(\d+)/, "channel_id"],
    [/^\/webhooks\/(\d+)/, "webhook_id"],
  ]),

  // Routes with shared rate limits
  SHARED_RESOURCES: new Map([
    [/^\/guilds\/\d+\/emojis/, "emoji"],
    [/^\/channels\/\d+\/messages\/bulk-delete/, "bulk-delete"],
    [/^\/guilds\/\d+\/channels/, "guild-channels"],
    [/^\/guilds\/\d+\/members/, "guild-members"],
  ]),
} as const;

// Interface for tracking rate limit attempts
interface RateLimitAttempt {
  count: number; // Number of attempts made
  lastAttempt: number; // Timestamp of the last attempt
  nextReset: number; // Timestamp when the rate limit resets
  inProgress: boolean; // Flag to prevent concurrent retries
}

export class RateLimiterError extends Error {
  readonly context: RateLimitError;

  constructor(context: RateLimitError) {
    super(
      `Rate limit encountered for ${context.path} (${context.method}): retry after ${context.retryAfter}s`,
    );
    this.name = "RateLimiterError";
    this.context = context;
  }
}

export class RateLimitManager {
  readonly #buckets = new Store<string, RateLimitBucket>();
  readonly #routesToBuckets = new Store<string, string>();
  readonly #sharedBuckets = new Store<string, Set<string>>();
  readonly #attempts = new Store<string, RateLimitAttempt>();
  readonly #rest: Rest;
  readonly #options: RateLimitOptions;

  constructor(rest: Rest, options: RateLimitOptions) {
    this.#rest = rest;
    this.#options = options;

    // Start periodic cleanup of expired rate limits
    setInterval(
      () => this.#cleanupExpiredLimits(),
      this.#options.cleanupInterval,
    );
  }

  // Check if a request would exceed rate limits
  checkRateLimit(path: string, method: string): void {
    // Skip rate limit checks for exempt routes (interactions and webhooks)
    if (this.#isExemptRoute(path)) {
      return;
    }

    const routeKey = this.getRouteKey(method, path);

    // Check for ongoing retry attempts
    this.#handleRetryAttempt(routeKey, path, method);

    // Check bucket-specific rate limits
    const bucket = this.#getBucket(path, method);
    if (bucket) {
      this.#checkBucketLimit(bucket, path, method);
    }
  }

  // Update rate limit information based on response headers
  updateRateLimit(
    path: string,
    method: string,
    headers: Record<string, string>,
    statusCode: number,
  ): void {
    const routeKey = this.getRouteKey(method, path);

    if (statusCode === 429) {
      this.#handleRateLimitExceeded(path, method, headers, routeKey);
      return;
    }

    // Reset attempt counter on successful requests
    if (statusCode < 400) {
      this.#attempts.delete(routeKey);
    }

    // Update rate limit bucket information
    this.#updateBucketInfo(path, method, headers);
  }

  // Generate a unique key for a route considering resource IDs
  getRouteKey(method: string, path: string): string {
    // Handle webhook routes specially
    const webhookMatch = path.match(ROUTE_PATTERNS.WEBHOOK);
    if (webhookMatch) {
      return `webhook:${webhookMatch[1]}:${webhookMatch[2]}:${method}`;
    }

    // Check for shared rate limit routes
    for (const [
      pattern,
      identifier,
    ] of ROUTE_PATTERNS.SHARED_RESOURCES.entries()) {
      if (pattern.test(path)) {
        return `shared:${identifier}`;
      }
    }

    // Normalize path with major parameters
    const normalizedPath = this.#normalizePath(path);
    return `${method}:${normalizedPath}`;
  }

  // Clean up resources
  destroy(): void {
    this.#buckets.clear();
    this.#routesToBuckets.clear();
    this.#sharedBuckets.clear();
    this.#attempts.clear();
  }

  // Helper method to get detailed bucket info for debugging
  getBucketDebugInfo(path: string, method: string): object {
    const routeKey = this.getRouteKey(method, path);
    const bucketHash = this.#routesToBuckets.get(routeKey);
    const bucket = bucketHash ? this.#buckets.get(bucketHash) : undefined;
    const attempt = this.#attempts.get(routeKey);

    return {
      routeKey,
      bucketHash,
      bucket: bucket
        ? {
            ...bucket,
            timeUntilReset: bucket.reset - Date.now(),
          }
        : undefined,
      attempt: attempt
        ? {
            ...attempt,
            timeUntilReset: attempt.nextReset - Date.now(),
          }
        : undefined,
      isExemptRoute: this.#isExemptRoute(path),
      normalizedPath: this.#normalizePath(path),
      sharedRoute: this.#getSharedRoute(path),
    };
  }

  // Helper method to check if a route is currently rate limited
  isRateLimited(path: string, method: string): boolean {
    try {
      this.checkRateLimit(path, method);
      return false;
    } catch (error) {
      if (error instanceof RateLimiterError) {
        return true;
      }
      throw error;
    }
  }

  // Get estimated time until rate limit reset
  getTimeUntilReset(path: string, method: string): number | null {
    const bucket = this.#getBucket(path, method);
    if (!bucket) {
      return null;
    }

    const now = Date.now();
    return Math.max(0, bucket.reset - now);
  }

  // Get current rate limit status for a route
  getRateLimitStatus(
    path: string,
    method: string,
  ): {
    limited: boolean;
    remaining: number;
    resetAfter: number;
    scope: RateLimitScope;
  } {
    const bucket = this.#getBucket(path, method);
    if (!bucket) {
      return {
        limited: false,
        remaining: Number.POSITIVE_INFINITY,
        resetAfter: 0,
        scope: "user",
      };
    }

    const now = Date.now();
    return {
      limited: bucket.remaining <= 0 && bucket.reset > now,
      remaining: bucket.remaining,
      resetAfter: Math.max(0, bucket.reset - now) / 1000,
      scope: bucket.scope,
    };
  }

  // Check if a route is exempt from rate limits
  #isExemptRoute(path: string): boolean {
    return ROUTE_PATTERNS.EXEMPT_ROUTES.some((route) => path.startsWith(route));
  }

  // Handle retry attempts for a route
  #handleRetryAttempt(routeKey: string, path: string, method: string): void {
    const attempt = this.#attempts.get(routeKey);
    if (!attempt) {
      return;
    }

    if (attempt.inProgress) {
      throw new RateLimiterError({
        method,
        path,
        retryAfter: RATE_LIMIT_CONSTANTS.DEFAULT_RETRY_DELAY_MS / 1000,
        scope: "user",
        global: false,
      });
    }

    this.#checkMaxRetries(attempt, path, method, routeKey);
  }

  // Check if maximum retries have been exceeded
  #checkMaxRetries(
    attempt: RateLimitAttempt,
    path: string,
    method: string,
    routeKey: string,
  ): void {
    if (attempt.count >= this.#rest.options.retry.maxRetries) {
      const now = Date.now();
      if (now < attempt.nextReset) {
        throw new RateLimiterError({
          method,
          path,
          retryAfter: (attempt.nextReset - now) / 1000,
          scope: "user",
          global: false,
        });
      }
      this.#attempts.delete(routeKey);
    }
  }

  // Handle rate limit exceeded response
  #handleRateLimitExceeded(
    path: string,
    method: string,
    headers: Record<string, string>,
    routeKey: string,
  ): void {
    const retryAfter = Number(headers[RATE_LIMIT_HEADERS.retryAfter]);
    const scope =
      (headers[RATE_LIMIT_HEADERS.scope] as RateLimitScope) || "user";
    const isGlobal = headers[RATE_LIMIT_HEADERS.global] === "true";

    const attempt = this.#updateRateLimitAttempt(routeKey, retryAfter);
    const actualDelay = this.#calculateRetryDelay(attempt, retryAfter);

    this.#scheduleRetryReset(routeKey, actualDelay);

    throw new RateLimiterError({
      method,
      path,
      retryAfter: actualDelay / 1000,
      scope,
      global: isGlobal,
    });
  }

  // Update rate limit attempt information
  #updateRateLimitAttempt(
    routeKey: string,
    retryAfter: number,
  ): RateLimitAttempt {
    const now = Date.now();
    const attempt = this.#attempts.get(routeKey) || {
      count: 0,
      lastAttempt: now,
      nextReset: now + retryAfter * 1000,
      inProgress: false,
    };

    attempt.count++;
    attempt.lastAttempt = now;
    attempt.nextReset = now + retryAfter * 1000;
    attempt.inProgress = true;

    this.#attempts.set(routeKey, attempt);
    return attempt;
  }

  // Calculate actual retry delay with exponential backoff
  #calculateRetryDelay(attempt: RateLimitAttempt, retryAfter: number): number {
    return this.#rest.calculateRetryDelay(retryAfter * 1000, attempt.count);
  }

  // Schedule reset of retry attempt
  #scheduleRetryReset(routeKey: string, delay: number): void {
    setTimeout(() => {
      const attempt = this.#attempts.get(routeKey);
      if (attempt) {
        attempt.inProgress = false;
        this.#attempts.set(routeKey, attempt);
      }
    }, delay);
  }

  // Update bucket information from response headers
  #updateBucketInfo(
    path: string,
    method: string,
    headers: Record<string, string>,
  ): void {
    const bucketHash = headers[RATE_LIMIT_HEADERS.bucket];
    if (!bucketHash) {
      return;
    }

    const bucket: RateLimitBucket = {
      hash: bucketHash,
      limit: Number(headers[RATE_LIMIT_HEADERS.limit]),
      remaining: Number(headers[RATE_LIMIT_HEADERS.remaining]),
      reset: Number(headers[RATE_LIMIT_HEADERS.reset]) * 1000,
      resetAfter: Number(headers[RATE_LIMIT_HEADERS.resetAfter]) * 1000,
      scope: (headers[RATE_LIMIT_HEADERS.scope] as RateLimitScope) || "user",
      sharedRoute: this.#getSharedRoute(path),
    };

    this.#buckets.set(bucketHash, bucket);
    this.#routesToBuckets.set(this.getRouteKey(method, path), bucketHash);

    if (bucket.sharedRoute) {
      this.#linkSharedBucket(bucket.sharedRoute, bucketHash);
    }
  }

  // Normalize path by replacing resource IDs with placeholders
  #normalizePath(path: string): string {
    let normalizedPath = path;
    for (const [regex, param] of ROUTE_PATTERNS.MAJOR_RESOURCES.entries()) {
      const match = path.match(regex);
      if (match) {
        normalizedPath = normalizedPath.replace(String(match[1]), `{${param}}`);
      }
    }
    return normalizedPath;
  }

  // Get shared route identifier if applicable
  #getSharedRoute(path: string): string | undefined {
    for (const [
      pattern,
      identifier,
    ] of ROUTE_PATTERNS.SHARED_RESOURCES.entries()) {
      if (pattern.test(path)) {
        return identifier;
      }
    }
    return undefined;
  }

  // Link bucket to shared route
  #linkSharedBucket(sharedRoute: string, bucketHash: string): void {
    let buckets = this.#sharedBuckets.get(sharedRoute);
    if (!buckets) {
      buckets = new Set();
      this.#sharedBuckets.set(sharedRoute, buckets);
    }
    buckets.add(bucketHash);
  }

  // Check if bucket has available capacity
  #checkBucketLimit(
    bucket: RateLimitBucket,
    path: string,
    method: string,
  ): void {
    const now = Date.now();

    if (bucket.remaining <= 0) {
      const waitTime = bucket.reset - now;
      if (waitTime > 0) {
        throw new RateLimiterError({
          method,
          path,
          retryAfter: waitTime / 1000,
          scope: bucket.scope,
          bucketHash: bucket.hash,
        });
      }
    } else if (bucket.remaining === 1) {
      const timeUntilReset = bucket.reset - now;
      if (timeUntilReset < this.#options.safetyMargin) {
        throw new RateLimiterError({
          method,
          path,
          retryAfter: (this.#options.safetyMargin - timeUntilReset) / 1000,
          scope: bucket.scope,
          bucketHash: bucket.hash,
        });
      }
    }
  }

  // Get bucket for route if exists
  #getBucket(path: string, method: string): RateLimitBucket | undefined {
    const routeKey = this.getRouteKey(method, path);
    const bucketHash = this.#routesToBuckets.get(routeKey);
    return bucketHash ? this.#buckets.get(bucketHash) : undefined;
  }

  // Clean up expired rate limits
  #cleanupExpiredLimits(): void {
    const now = Date.now();
    const activeHashes = new Set<string>();

    // Clean expired buckets
    for (const [hash, bucket] of this.#buckets.entries()) {
      if (bucket.reset < now) {
        this.#buckets.delete(hash);
      } else {
        activeHashes.add(hash);
      }
    }

    // Clean unused route mappings
    for (const [route, hash] of this.#routesToBuckets.entries()) {
      if (!activeHashes.has(hash)) {
        this.#routesToBuckets.delete(route);
      }
    }

    // Clean shared buckets
    for (const [route, hashes] of this.#sharedBuckets.entries()) {
      const validHashes = new Set(
        [...hashes].filter((hash) => activeHashes.has(hash)),
      );
      if (validHashes.size === 0) {
        this.#sharedBuckets.delete(route);
      } else {
        this.#sharedBuckets.set(route, validHashes);
      }
    }

    // Clean expired attempts
    for (const [route, attempt] of this.#attempts.entries()) {
      if (attempt.nextReset < now) {
        this.#attempts.delete(route);
      }
    }
  }
}

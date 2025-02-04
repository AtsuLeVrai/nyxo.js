import { Store } from "@nyxjs/store";
import type { RateLimiterOptions } from "../options/index.js";
import type {
  RateLimitBucket,
  RateLimitError,
  RateLimitHeaders,
  RateLimitScope,
} from "../types/index.js";

const RATE_LIMIT_HEADERS: RateLimitHeaders = {
  limit: "x-ratelimit-limit",
  remaining: "x-ratelimit-remaining",
  reset: "x-ratelimit-reset",
  resetAfter: "x-ratelimit-reset-after",
  bucket: "x-ratelimit-bucket",
  scope: "x-ratelimit-scope",
  global: "x-ratelimit-global",
  retryAfter: "retry-after",
} as const;

const INTERACTION_ROUTES = ["/interactions", "/webhooks"];
const INVALID_STATUS_CODES = [401, 403, 404, 429];
const WEBHOOK_ROUTE_REGEX = /^\/webhooks\/(\d+)\/([A-Za-z0-9-_]+)/;

export class RateLimiterManager {
  #globalReset: number | null = null;
  #invalidCount = 0;
  #invalidResetTime = Date.now();
  readonly #buckets = new Store<string, RateLimitBucket>();
  readonly #routesToBuckets = new Store<string, string>();
  readonly #sharedBuckets = new Store<string, Set<string>>();

  readonly #options: RateLimiterOptions;

  constructor(options: RateLimiterOptions) {
    this.#options = options;
    setInterval(() => this.#cleanup(), this.#options.cleanupInterval);
  }

  checkRateLimit(path: string, method: string): void {
    if (INTERACTION_ROUTES.some((route) => path.startsWith(route))) {
      return;
    }

    if (this.#isGloballyLimited()) {
      throw this.#createError(path, method, true, "global");
    }

    if (this.#isInvalidRequestLimited()) {
      throw this.#createError(path, method, false, "user");
    }

    const bucket = this.#getBucket(path, method);
    if (!bucket) {
      return;
    }

    if (this.#isBucketLimited(bucket)) {
      throw this.#createError(path, method, false, bucket.scope, bucket);
    }
  }

  updateRateLimit(
    path: string,
    method: string,
    headers: Record<string, string>,
    statusCode: number,
  ): void {
    if (INVALID_STATUS_CODES.includes(statusCode) && statusCode !== 429) {
      this.#invalidCount++;
      return;
    }

    if (statusCode === 429) {
      const retryAfter = Number(headers[RATE_LIMIT_HEADERS.retryAfter]) * 1000;
      const isGlobal = headers[RATE_LIMIT_HEADERS.global] === "true";
      const scope =
        (headers[RATE_LIMIT_HEADERS.scope] as RateLimitScope) || "user";

      if (isGlobal) {
        this.#globalReset = Date.now() + retryAfter;
      }
      if (scope !== "shared") {
        this.#invalidCount++;
      }

      throw this.#createError(path, method, isGlobal, scope);
    }

    const bucketHash = headers[RATE_LIMIT_HEADERS.bucket];
    if (!bucketHash) {
      return;
    }

    const routeKey = this.#getRouteKey(method, path);
    const bucket: RateLimitBucket = {
      hash: bucketHash,
      limit: Number(headers[RATE_LIMIT_HEADERS.limit]),
      remaining: Number(headers[RATE_LIMIT_HEADERS.remaining]),
      reset: Number(headers[RATE_LIMIT_HEADERS.reset]) * 1000,
      resetAfter: Number(headers[RATE_LIMIT_HEADERS.resetAfter]) * 1000,
      scope: (headers[RATE_LIMIT_HEADERS.scope] as RateLimitScope) || "user",
      sharedRoute: this.#getSharedRoute(path),
      lastUsed: Date.now(),
    };

    this.#buckets.set(bucketHash, bucket);
    this.#routesToBuckets.set(routeKey, bucketHash);

    if (bucket.sharedRoute) {
      this.#linkSharedBucket(bucket.sharedRoute, bucketHash);
    }
  }

  destroy(): void {
    this.#buckets.clear();
    this.#routesToBuckets.clear();
    this.#sharedBuckets.clear();
    this.#globalReset = null;
    this.#invalidCount = 0;
    this.#invalidResetTime = Date.now();
  }

  #getRouteKey(method: string, path: string): string {
    const webhookMatch = path.match(WEBHOOK_ROUTE_REGEX);
    if (webhookMatch) {
      return `webhook:${webhookMatch[1]}:${webhookMatch[2]}:${method}`;
    }

    for (const [pattern, identifier] of this.#options.sharedRoutes.entries()) {
      if (pattern.test(path)) {
        return `shared:${identifier}`;
      }
    }

    let normalizedPath = path;
    for (const [regex, param] of this.#options.majorParameters.entries()) {
      const match = path.match(regex);
      if (match) {
        normalizedPath = normalizedPath.replace(String(match[1]), `{${param}}`);
      }
    }

    return `${method}:${normalizedPath}`;
  }

  #getSharedRoute(path: string): string | undefined {
    for (const [pattern, identifier] of this.#options.sharedRoutes.entries()) {
      if (pattern.test(path)) {
        return identifier;
      }
    }
    return undefined;
  }

  #linkSharedBucket(sharedRoute: string, bucketHash: string): void {
    let buckets = this.#sharedBuckets.get(sharedRoute);
    if (!buckets) {
      buckets = new Set();
      this.#sharedBuckets.set(sharedRoute, buckets);
    }
    buckets.add(bucketHash);
  }

  #getBucket(path: string, method: string): RateLimitBucket | undefined {
    const routeKey = this.#getRouteKey(method, path);
    const bucketHash = this.#routesToBuckets.get(routeKey);
    return bucketHash ? this.#buckets.get(bucketHash) : undefined;
  }

  #isGloballyLimited(): boolean {
    return Boolean(this.#globalReset && Date.now() < this.#globalReset);
  }

  #isBucketLimited(bucket: RateLimitBucket): boolean {
    return bucket.remaining <= 0 && Date.now() < bucket.reset;
  }

  #isInvalidRequestLimited(): boolean {
    if (
      Date.now() >=
      this.#invalidResetTime + this.#options.invalidRequestWindow
    ) {
      this.#invalidCount = 0;
      this.#invalidResetTime = Date.now();
      return false;
    }
    return this.#invalidCount >= this.#options.invalidRequestMaxLimit;
  }

  #createError(
    path: string,
    method: string,
    global: boolean,
    scope: RateLimitScope,
    bucket?: RateLimitBucket,
  ): RateLimitError {
    return {
      timeToReset: bucket
        ? bucket.reset - Date.now()
        : this.#globalReset
          ? this.#globalReset - Date.now()
          : 0,
      method,
      path,
      global,
      scope,
    };
  }

  #cleanup(): void {
    const now = Date.now();
    const activeHashes = new Set<string>();

    for (const [hash, bucket] of this.#buckets.entries()) {
      if (bucket.reset < now) {
        this.#buckets.delete(hash);
      } else {
        activeHashes.add(hash);
      }
    }

    for (const [route, hash] of this.#routesToBuckets.entries()) {
      if (!activeHashes.has(hash)) {
        this.#routesToBuckets.delete(route);
      }
    }

    for (const [route, hashes] of this.#sharedBuckets.entries()) {
      const validHashes = new Set<string>();
      for (const hash of hashes) {
        if (activeHashes.has(hash)) {
          validHashes.add(hash);
        }
      }
      if (validHashes.size === 0) {
        this.#sharedBuckets.delete(route);
      } else {
        this.#sharedBuckets.set(route, validHashes);
      }
    }
  }
}

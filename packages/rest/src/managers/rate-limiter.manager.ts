import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import { RateLimitError } from "../errors/index.js";
import type { RateLimiterOptions } from "../options/index.js";
import type {
  RateLimitBucket,
  RateLimitScope,
  RestEvents,
} from "../types/index.js";

export const DISCORD_RATE_LIMIT_HEADERS = {
  limit: "x-ratelimit-limit",
  remaining: "x-ratelimit-remaining",
  reset: "x-ratelimit-reset",
  resetAfter: "x-ratelimit-reset-after",
  bucket: "x-ratelimit-bucket",
  scope: "x-ratelimit-scope",
  global: "x-ratelimit-global",
  retryAfter: "retry-after",
} as const;

const DISCORD_MAJOR_PARAMS = new Map([
  [/^\/guilds\/(\d+)/, "guild_id"],
  [/^\/channels\/(\d+)/, "channel_id"],
  [/^\/webhooks\/(\d+)/, "webhook_id"],
]);

const DISCORD_SHARED_ROUTES = new Map([
  [/^\/guilds\/\d+\/emojis/, "emoji"],
  [/^\/channels\/\d+\/messages\/bulk-delete/, "bulk-delete"],
  [/^\/guilds\/\d+\/channels/, "guild-channels"],
  [/^\/guilds\/\d+\/members/, "guild-members"],
]);

const INVALID_STATUS_CODES = [401, 403, 404, 429];
const INTERACTION_ROUTES = ["/interactions", "/webhooks"];
const WEBHOOK_ROUTE_REGEX = /^\/webhooks\/(\d+)\/([A-Za-z0-9-_]+)/;

export class RateLimiterManager extends EventEmitter<RestEvents> {
  #globalReset: number | null = null;
  #invalidRequestCount = 0;
  #invalidRequestResetTime = Date.now();
  readonly #buckets = new Store<string, RateLimitBucket>();
  readonly #sharedBuckets = new Store<string, Set<string>>();
  readonly #routesToBuckets = new Store<string, string>();

  readonly #options: RateLimiterOptions;
  readonly #cleanupInterval: NodeJS.Timeout;

  constructor(options: RateLimiterOptions) {
    super();
    this.#options = options;
    this.#cleanupInterval = setInterval(
      () => this.#cleanupBuckets(),
      this.#options.cleanupInterval,
    );
  }

  checkRateLimit(path: string, method: string): void {
    this.emit("debug", "Checking rate limits", { path, method });

    if (INTERACTION_ROUTES.some((route) => path.startsWith(route))) {
      this.emit("debug", "Interaction route bypass global limit", {
        path,
        method,
      });
      return;
    }

    if (this.#isGloballyLimited()) {
      throw new RateLimitError({
        timeToReset: this.#globalReset ? this.#globalReset - Date.now() : -1,
        method,
        path,
        global: true,
        scope: "global",
      });
    }

    if (this.#isInvalidRequestLimited()) {
      throw new RateLimitError({
        timeToReset: this.#getInvalidRequestResetTime(),
        method,
        path,
        global: false,
        scope: "user",
      });
    }

    const bucket = this.#getBucket(path, method);
    if (!bucket) {
      return;
    }

    if (this.#isBucketLimited(bucket)) {
      const timeToReset = this.#getBucketResetTime(bucket);

      this.emit("rateLimited", {
        bucketHash: bucket.hash,
        timeToReset,
        limit: bucket.limit,
        remaining: bucket.remaining,
        method,
        path,
        global: false,
        scope: bucket.scope,
      });

      throw new RateLimitError({
        timeToReset,
        method,
        path,
        bucketHash: bucket.hash,
        global: false,
        scope: bucket.scope,
      });
    }
  }

  updateRateLimit(
    path: string,
    method: string,
    _latency: number,
    headers: Record<string, string>,
    statusCode: number,
  ): void {
    if (INVALID_STATUS_CODES.includes(statusCode) && statusCode !== 429) {
      this.incrementInvalidRequestCount();
      this.emit("error", `Invalid status code: ${statusCode}`, {
        path,
        method,
      });
    }

    const rateLimitHeaders = this.#extractRateLimitHeaders(headers);

    if (statusCode === 429) {
      const retryAfter = Number(rateLimitHeaders.retryAfter) * 1000;
      const isGlobal = rateLimitHeaders.global === "true";
      const scope = (rateLimitHeaders.scope as RateLimitScope) || "user";

      if (isGlobal) {
        this.#globalReset = Date.now() + retryAfter;
      }
      if (scope !== "shared") {
        this.incrementInvalidRequestCount();
      }

      throw new RateLimitError({
        timeToReset: retryAfter,
        method,
        path,
        global: isGlobal,
        scope,
        retryAfter,
      });
    }

    const bucketHash = rateLimitHeaders.bucket;
    if (!bucketHash) {
      return;
    }

    const routeKey = this.#generateRouteKey(method, path);
    const bucket: RateLimitBucket = {
      hash: bucketHash,
      limit: Number(rateLimitHeaders.limit),
      remaining: Number(rateLimitHeaders.remaining),
      reset: Math.max(0, Number(rateLimitHeaders.reset) * 1000),
      resetAfter: Math.max(0, Number(rateLimitHeaders.resetAfter) * 1000),
      scope: (rateLimitHeaders.scope as RateLimitScope) || "user",
      sharedRoute: this.#getSharedRoute(path),
      lastUsed: Date.now(),
    };

    const isNewBucket = !this.#buckets.has(bucketHash);
    this.#buckets.set(bucketHash, bucket);
    this.#routesToBuckets.set(routeKey, bucketHash);

    if (bucket.sharedRoute) {
      this.#linkSharedBucket(bucket.sharedRoute, bucketHash);
    }

    if (isNewBucket) {
      this.emit("bucketCreated", bucket);
    }

    this.emit("debug", "Updated rate limit bucket", { bucketHash, bucket });
  }

  incrementInvalidRequestCount(): void {
    this.#invalidRequestCount++;
  }

  destroy(): void {
    this.#buckets.clear();
    this.#routesToBuckets.clear();
    this.#sharedBuckets.clear();
    this.#globalReset = null;
    this.#invalidRequestCount = 0;
    this.#invalidRequestResetTime = Date.now();
    clearInterval(this.#cleanupInterval);
    this.removeAllListeners();
  }

  #getBucket(path: string, method: string): RateLimitBucket | undefined {
    const routeKey = this.#generateRouteKey(method, path);
    const bucketHash = this.#routesToBuckets.get(routeKey);
    if (!bucketHash) {
      return undefined;
    }
    return this.#buckets.get(bucketHash);
  }

  #generateRouteKey(method: string, path: string): string {
    const webhookMatch = path.match(WEBHOOK_ROUTE_REGEX);
    if (webhookMatch) {
      return `webhook:${webhookMatch[1]}:${webhookMatch[2]}:${method}`;
    }

    for (const [pattern, identifier] of DISCORD_SHARED_ROUTES.entries()) {
      if (pattern.test(path)) {
        return `shared:${identifier}`;
      }
    }

    let normalizedPath = path;
    for (const [regex, param] of DISCORD_MAJOR_PARAMS.entries()) {
      const match = path.match(regex);
      if (match) {
        normalizedPath = normalizedPath.replace(String(match[1]), `{${param}}`);
      }
    }

    return `${method}:${normalizedPath}`;
  }

  #extractRateLimitHeaders(
    headers: Record<string, string>,
  ): Record<keyof typeof DISCORD_RATE_LIMIT_HEADERS, string> {
    const safeGet = (header: string): string => headers[header]?.trim() || "0";

    return {
      limit: safeGet(DISCORD_RATE_LIMIT_HEADERS.limit),
      remaining: safeGet(DISCORD_RATE_LIMIT_HEADERS.remaining),
      reset: safeGet(DISCORD_RATE_LIMIT_HEADERS.reset),
      resetAfter: safeGet(DISCORD_RATE_LIMIT_HEADERS.resetAfter),
      bucket: headers[DISCORD_RATE_LIMIT_HEADERS.bucket] || "",
      scope: headers[DISCORD_RATE_LIMIT_HEADERS.scope] || "user",
      global: headers[DISCORD_RATE_LIMIT_HEADERS.global] || "false",
      retryAfter: safeGet(DISCORD_RATE_LIMIT_HEADERS.retryAfter),
    };
  }

  #isGloballyLimited(): boolean {
    return Boolean(this.#globalReset && Date.now() < this.#globalReset);
  }

  #isBucketLimited(bucket: RateLimitBucket): boolean {
    return bucket.remaining <= 0 && Date.now() < bucket.reset;
  }

  #getBucketResetTime(bucket: RateLimitBucket): number {
    return Math.max(0, bucket.reset - Date.now());
  }

  #isInvalidRequestLimited(): boolean {
    if (
      Date.now() >=
      this.#invalidRequestResetTime + this.#options.invalidRequestWindow
    ) {
      this.#invalidRequestCount = 0;
      this.#invalidRequestResetTime = Date.now();
      return false;
    }

    return this.#invalidRequestCount >= this.#options.invalidRequestMaxLimit;
  }

  #getInvalidRequestResetTime(): number {
    return Math.max(
      0,
      this.#invalidRequestResetTime +
        this.#options.invalidRequestWindow -
        Date.now(),
    );
  }

  #getSharedRoute(path: string): string | undefined {
    for (const [pattern, identifier] of DISCORD_SHARED_ROUTES.entries()) {
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

  #cleanupBuckets(): void {
    const now = Date.now();
    const activeHashes = new Set(this.#buckets.keys());

    for (const [hash, bucket] of this.#buckets.entries()) {
      if (bucket.reset < now) {
        this.#buckets.delete(hash);
        this.emit("bucketDeleted", hash);
      }
    }

    for (const [routeKey, bucketHash] of this.#routesToBuckets.entries()) {
      if (!activeHashes.has(bucketHash)) {
        this.#routesToBuckets.delete(routeKey);
      }
    }

    for (const [sharedRoute, bucketHashes] of this.#sharedBuckets.entries()) {
      const validHashes = new Set<string>();
      for (const hash of bucketHashes) {
        if (activeHashes.has(hash)) {
          validHashes.add(hash);
        }
      }
      if (validHashes.size === 0) {
        this.#sharedBuckets.delete(sharedRoute);
      } else {
        this.#sharedBuckets.set(sharedRoute, validHashes);
      }
    }
  }
}

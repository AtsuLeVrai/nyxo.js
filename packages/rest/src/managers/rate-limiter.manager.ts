import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import { RateLimitError } from "../errors/index.js";
import type { RateLimiterOptions } from "../options/index.js";
import type {
  BucketLatencyInfo,
  BucketStatusInfo,
  GlobalRateLimitStats,
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

const DISCORD_MAJOR_PARAMS = [
  { regex: /^\/guilds\/(\d+)/, param: "guild_id" },
  { regex: /^\/channels\/(\d+)/, param: "channel_id" },
  { regex: /^\/webhooks\/(\d+)/, param: "webhook_id" },
] as const;

const DISCORD_SHARED_ROUTES = new Map([
  [/^\/guilds\/\d+\/emojis/, "emoji"],
  [/^\/channels\/\d+\/messages\/bulk-delete/, "bulk-delete"],
  [/^\/guilds\/\d+\/channels/, "guild-channels"],
  [/^\/guilds\/\d+\/members/, "guild-members"],
]);

const INVALID_STATUS_CODES = new Set([401, 403, 429]);
const INTERACTION_ROUTES = new Set(["/interactions", "/webhooks"]);

export class RateLimiterManager extends EventEmitter<RestEvents> {
  readonly #buckets = new Store<string, RateLimitBucket>();
  readonly #routesToBuckets = new Store<string, string>();
  readonly #sharedBuckets = new Store<string, Set<string>>();
  readonly #bucketLatencies = new Store<string, BucketLatencyInfo[]>();
  readonly #options: z.output<typeof RateLimiterOptions>;

  #globalReset: number | null = null;
  #invalidRequestCount = 0;
  #invalidRequestResetTime = Date.now();
  readonly #cleanupInterval: NodeJS.Timeout;

  constructor(options: z.output<typeof RateLimiterOptions>) {
    super();
    this.#options = options;
    this.#cleanupInterval = setInterval(() => this.#cleanupBuckets(), 30_000);
  }

  checkRateLimit(path: string, method: string): void {
    this.emit("debug", "Checking rate limits", { path, method });

    if (this.#isGloballyLimited()) {
      for (const route of INTERACTION_ROUTES) {
        if (path.startsWith(route)) {
          return;
        }
      }

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
    latency: number,
    headers: Record<string, string>,
    statusCode: number,
  ): void {
    if (INVALID_STATUS_CODES.has(statusCode) && statusCode !== 429) {
      this.incrementInvalidRequestCount();
      this.emit("error", `Invalid status code: ${statusCode}`, {
        path,
        method,
        headers,
      });
    }

    const rateLimitHeaders = this.#extractRateLimitHeaders(headers);

    if (statusCode === 429) {
      const retryAfter =
        Number(headers[DISCORD_RATE_LIMIT_HEADERS.retryAfter]) * 1000;
      const isGlobal = headers[DISCORD_RATE_LIMIT_HEADERS.global] === "true";
      const scope =
        (headers[DISCORD_RATE_LIMIT_HEADERS.scope] as RateLimitScope) || "user";

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

    const bucketHash = headers[DISCORD_RATE_LIMIT_HEADERS.bucket];
    if (!bucketHash) {
      return;
    }

    const routeKey = this.#generateRouteKey(method, path);
    const bucket: RateLimitBucket = {
      hash: bucketHash,
      limit: Number(rateLimitHeaders.limit),
      remaining: Number(rateLimitHeaders.remaining),
      reset: Math.max(0, Number(rateLimitHeaders.reset) * 1000 || Date.now()),
      resetAfter: Math.max(0, Number(rateLimitHeaders.remaining)),
      scope:
        (headers[DISCORD_RATE_LIMIT_HEADERS.scope] as RateLimitScope) || "user",
      sharedRoute: this.#getSharedRoute(path),
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

    this.calculateLatency(bucket.hash, latency);

    this.emit("debug", "Updated rate limit bucket", { bucketHash, bucket });
  }

  reset(): void {
    this.#buckets.clear();
    this.#routesToBuckets.clear();
    this.#sharedBuckets.clear();
    this.#bucketLatencies.clear();
    this.#globalReset = null;
    this.#invalidRequestCount = 0;
    this.#invalidRequestResetTime = Date.now();
    clearInterval(this.#cleanupInterval);
  }

  shouldRetry(error: RateLimitError): boolean {
    if (error.context.global) {
      return false;
    }

    if (error.context.scope === "shared") {
      return true;
    }

    return true;
  }

  getNextReset(path: string, method: string): number | null {
    const bucket = this.#getBucket(path, method);
    return bucket ? bucket.reset : null;
  }

  getBucketStatus(path: string, method: string): BucketStatusInfo | null {
    const bucket = this.#getBucket(path, method);
    if (!bucket) {
      return null;
    }

    return {
      remaining: bucket.remaining,
      reset: bucket.reset,
      limit: bucket.limit,
    };
  }

  getGlobalStats(): GlobalRateLimitStats {
    return {
      totalBuckets: this.#buckets.size,
      activeBuckets: Array.from(this.#buckets.values()).filter(
        (b) => b.reset > Date.now(),
      ).length,
      globallyLimited: this.#isGloballyLimited(),
      invalidRequestCount: this.#invalidRequestCount,
      timeToReset: this.#globalReset ? this.#globalReset - Date.now() : 0,
    };
  }

  incrementInvalidRequestCount(): void {
    this.#invalidRequestCount++;
  }

  destroy(): void {
    this.reset();
    this.removeAllListeners();
  }

  calculateLatency(bucketHash: string, latency: number): void {
    if (latency > this.#options.latencyThreshold) {
      return;
    }

    const bucket = this.#buckets.get(bucketHash);
    if (!bucket) {
      return;
    }

    const latencies = this.#bucketLatencies.get(bucketHash) ?? [];
    latencies.push({ timestamp: Date.now(), latency });

    if (latencies.length > this.#options.maxLatencyEntries) {
      latencies.shift();
    }

    this.#bucketLatencies.set(bucketHash, latencies);

    const avgLatency =
      latencies.reduce((sum, l) => sum + l.latency, 0) / latencies.length;
    bucket.reset += avgLatency;
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
    for (const [pattern, identifier] of DISCORD_SHARED_ROUTES.entries()) {
      if (pattern.test(path)) {
        return `shared:${identifier}`;
      }
    }

    let normalizedPath = path;
    for (const { regex, param } of DISCORD_MAJOR_PARAMS) {
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
    return {
      limit: headers[DISCORD_RATE_LIMIT_HEADERS.limit] as string,
      remaining: headers[DISCORD_RATE_LIMIT_HEADERS.remaining] as string,
      reset: headers[DISCORD_RATE_LIMIT_HEADERS.reset] as string,
      resetAfter: headers[DISCORD_RATE_LIMIT_HEADERS.resetAfter] as string,
      bucket: headers[DISCORD_RATE_LIMIT_HEADERS.bucket] as string,
      scope: headers[DISCORD_RATE_LIMIT_HEADERS.scope] as string,
      global: headers[DISCORD_RATE_LIMIT_HEADERS.global] as string,
      retryAfter: headers[DISCORD_RATE_LIMIT_HEADERS.retryAfter] as string,
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

    for (const [hash, bucket] of this.#buckets.entries()) {
      if (bucket.reset < now) {
        this.#buckets.delete(hash);
        this.emit("bucketDeleted", hash);
      }
    }

    for (const [hash, latencies] of this.#bucketLatencies.entries()) {
      const validLatencies = latencies.filter(
        (l) => now - l.timestamp < 60_000,
      );
      if (validLatencies.length === 0) {
        this.#bucketLatencies.delete(hash);
      } else {
        this.#bucketLatencies.set(hash, validLatencies);
      }
    }
  }
}

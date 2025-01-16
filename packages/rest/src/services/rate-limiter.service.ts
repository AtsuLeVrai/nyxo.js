import { Store } from "@nyxjs/store";
import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import { RateLimitError } from "../errors/index.js";
import type { RateLimiterOptions } from "../options/index.js";
import type {
  RateLimitBucket,
  RateLimitScope,
  RestEvents,
} from "../types/index.js";

const DISCORD_RATELIMIT_HEADERS = {
  limit: "x-ratelimit-limit",
  remaining: "x-ratelimit-remaining",
  reset: "x-ratelimit-reset",
  resetAfter: "x-ratelimit-reset-after",
  bucket: "x-ratelimit-bucket",
  scope: "x-ratelimit-scope",
  global: "x-ratelimit-global",
  retryAfter: "retry-after",
} as const;

const DISCORD_SHARED_ROUTES = new Map([
  [/^\/guilds\/\d+\/emojis/, "emoji"],
  [/^\/channels\/\d+\/messages\/bulk-delete/, "bulk-delete"],
  [/^\/guilds\/\d+\/channels/, "guild-channels"],
  [/^\/guilds\/\d+\/members/, "guild-members"],
]);

const DISCORD_MAJOR_PARAMS = [
  { regex: /^\/guilds\/(\d+)/, param: "guild_id" },
  { regex: /^\/channels\/(\d+)/, param: "channel_id" },
  { regex: /^\/webhooks\/(\d+)/, param: "webhook_id" },
] as const;

export class RateLimiterService extends EventEmitter<RestEvents> {
  readonly #buckets = new Store<string, RateLimitBucket>();
  readonly #routesToBuckets = new Store<string, string>();
  readonly #options: z.output<typeof RateLimiterOptions>;

  #globalReset: number | null = null;
  #invalidRequestCount = 0;
  #invalidRequestResetTime = Date.now();

  constructor(options: z.output<typeof RateLimiterOptions>) {
    super();
    this.#options = options;
  }

  checkRateLimit(path: string, method: string): void {
    this.emit("debug", "Checking rate limits", { path, method });

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
    headers: Record<string, string>,
    status: number,
  ): void {
    const rateLimitHeaders = this.#extractRateLimitHeaders(headers);

    if (status === 429) {
      const retryAfter =
        Number(headers[DISCORD_RATELIMIT_HEADERS.retryAfter]) * 1000;
      const isGlobal = headers[DISCORD_RATELIMIT_HEADERS.global] === "true";

      if (isGlobal) {
        this.#globalReset = Date.now() + retryAfter;
      }

      throw new RateLimitError({
        timeToReset: retryAfter,
        method,
        path,
        global: isGlobal,
        scope:
          (headers[DISCORD_RATELIMIT_HEADERS.scope] as RateLimitScope) ||
          "user",
        retryAfter,
      });
    }

    const bucketHash = headers[DISCORD_RATELIMIT_HEADERS.bucket];
    if (!bucketHash) {
      return;
    }

    const routeKey = this.#generateRouteKey(method, path);
    const bucket: RateLimitBucket = {
      hash: bucketHash,
      limit: Number(rateLimitHeaders.limit),
      remaining: Number(rateLimitHeaders.remaining),
      reset: Number(rateLimitHeaders.reset) * 1000,
      resetAfter: Number(rateLimitHeaders.resetAfter) * 1000,
      scope:
        (headers[DISCORD_RATELIMIT_HEADERS.scope] as RateLimitScope) || "user",
      sharedRoute: this.#getSharedRoute(path),
    };

    this.#buckets.set(bucketHash, bucket);
    this.#routesToBuckets.set(routeKey, bucketHash);

    this.emit("debug", "Updated rate limit bucket", { bucketHash, bucket });
  }

  reset(): void {
    this.#buckets.clear();
    this.#routesToBuckets.clear();
    this.#globalReset = null;
    this.#invalidRequestCount = 0;
    this.#invalidRequestResetTime = Date.now();
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
  ): Record<keyof typeof DISCORD_RATELIMIT_HEADERS, string> {
    return {
      limit: headers[DISCORD_RATELIMIT_HEADERS.limit] as string,
      remaining: headers[DISCORD_RATELIMIT_HEADERS.remaining] as string,
      reset: headers[DISCORD_RATELIMIT_HEADERS.reset] as string,
      resetAfter: headers[DISCORD_RATELIMIT_HEADERS.resetAfter] as string,
      bucket: headers[DISCORD_RATELIMIT_HEADERS.bucket] as string,
      scope: headers[DISCORD_RATELIMIT_HEADERS.scope] as string,
      global: headers[DISCORD_RATELIMIT_HEADERS.global] as string,
      retryAfter: headers[DISCORD_RATELIMIT_HEADERS.retryAfter] as string,
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
}

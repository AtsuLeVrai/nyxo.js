import { Store } from "@nyxjs/store";
import type { Rest } from "../core/index.js";
import type { RateLimitEntity, RateLimitScope } from "../types/index.js";
import { HttpStatusCode } from "../types/index.js";

export class RateLimiterManager {
  static readonly MAX_QUEUE_SIZE = 1000;
  static readonly MAX_GLOBAL_REQUESTS = 50;
  static readonly MAX_INVALID_REQUESTS = 10000;
  static readonly INVALID_REQUEST_WINDOW = 600000;
  static readonly GLOBAL_RESET_INTERVAL = 1000;
  static readonly SHARED_RATE_LIMIT_PATHS = new Set([
    /^\/guilds\/\d+\/emojis/,
    /^\/channels\/\d+\/messages\/\d+\/reactions/,
  ]);

  static readonly RATE_LIMIT_HEADERS = {
    BUCKET: "x-ratelimit-bucket",
    LIMIT: "x-ratelimit-limit",
    REMAINING: "x-ratelimit-remaining",
    RESET: "x-ratelimit-reset",
    RESET_AFTER: "x-ratelimit-reset-after",
    GLOBAL: "x-ratelimit-global",
    SCOPE: "x-ratelimit-scope",
    RETRY_AFTER: "retry-after",
  } as const;

  readonly #rest: Rest;
  readonly #bucketHashes = new Store<string, string>();
  #globalRateLimit: number | null = null;
  #globalRequestCounter = 0;
  #globalResetTimeout: NodeJS.Timeout | null = null;
  #invalidRequestCount = 0;
  #lastInvalidRequestReset = Date.now();
  #isDestroyed = false;

  readonly #rateLimitBuckets = new Store<
    string,
    Omit<RateLimitEntity, "bucket">
  >();
  readonly #requestQueue = new Store<
    string,
    Array<{
      resolve: () => void;
      reject: (error: Error) => void;
      addedAt: number;
    }>
  >();

  constructor(rest: Rest) {
    this.#rest = rest;
    this.#startGlobalResetInterval();
  }

  async checkRateLimits(path: string): Promise<void> {
    if (this.#isDestroyed) {
      throw new Error("RateLimiterManager has been destroyed");
    }

    if (this.#isInvalidRequestLimited()) {
      throw new Error("Invalid request rate limit exceeded");
    }

    if (
      !path.startsWith("/interactions") &&
      this.#globalRequestCounter >= RateLimiterManager.MAX_GLOBAL_REQUESTS
    ) {
      await this.#handleGlobalRateLimit();
      return;
    }

    const bucketKey = this.#getBucketKey(path);
    const rateLimit = this.#rateLimitBuckets.get(bucketKey);

    if (this.#isBucketRateLimited(rateLimit)) {
      if (rateLimit.scope === "shared") {
        this.#rest.emit(
          "debug",
          `Hit shared rate limit for bucket: ${bucketKey}`,
        );
      }
      await this.#handleBucketRateLimit(bucketKey, rateLimit);
      return;
    }

    if (!path.startsWith("/interactions")) {
      this.#globalRequestCounter++;
    }

    if (rateLimit) {
      this.#updateBucketRemaining(bucketKey, rateLimit);
    }
  }

  updateRateLimits(headers: Record<string, string>, statusCode: number): void {
    if (this.#isDestroyed) {
      return;
    }

    if (this.#isErrorStatus(statusCode)) {
      this.incrementInvalidRequestCount(statusCode);
    }

    if (statusCode === HttpStatusCode.TooManyRequests) {
      if (headers[RateLimiterManager.RATE_LIMIT_HEADERS.SCOPE] === "shared") {
        this.#rest.emit("debug", "Received shared rate limit response");
      }
      this.#handleGlobalRateLimitHeader(headers);
      return;
    }

    const rateLimitData = this.#extractRateLimitData(headers);
    if (!rateLimitData) {
      return;
    }

    const { bucket, reset, resetAfter, remaining, limit, global, scope } =
      rateLimitData;

    this.#updateBucket(bucket, {
      limit,
      remaining,
      reset,
      resetAfter,
      global,
      scope,
    });

    const bucketHash = headers[RateLimiterManager.RATE_LIMIT_HEADERS.BUCKET];
    if (bucketHash) {
      this.#bucketHashes.set(bucket, bucketHash);
    }

    this.#processQueue(bucket);

    if (global) {
      this.#handleGlobalRateLimitHeader(headers);
    }

    if (remaining === 0) {
      this.#rest.emit("rateLimitHit", {
        bucket,
        resetAfter,
        limit,
        scope,
      });
    }
  }

  incrementInvalidRequestCount(statusCode: number): void {
    if (this.#isErrorStatus(statusCode)) {
      this.#invalidRequestCount++;

      const now = Date.now();
      if (
        now - this.#lastInvalidRequestReset >=
        RateLimiterManager.INVALID_REQUEST_WINDOW
      ) {
        this.#invalidRequestCount = 1;
        this.#lastInvalidRequestReset = now;
      }
    }
  }

  destroy(): void {
    if (this.#isDestroyed) {
      return;
    }

    this.#isDestroyed = true;
    if (this.#globalResetTimeout) {
      clearInterval(this.#globalResetTimeout);
      this.#globalResetTimeout = null;
    }

    this.#rateLimitBuckets.clear();
    this.#requestQueue.clear();
    this.#bucketHashes.clear();
    this.#globalRateLimit = null;
    this.#invalidRequestCount = 0;
    this.#globalRequestCounter = 0;

    for (const queue of this.#requestQueue.values()) {
      for (const request of queue) {
        request.reject(new Error("RateLimiterManager is being destroyed"));
      }
    }
  }

  #startGlobalResetInterval(): void {
    this.#globalResetTimeout = setInterval(() => {
      this.#globalRequestCounter = 0;
    }, RateLimiterManager.GLOBAL_RESET_INTERVAL);
  }

  #getBucketKey(path: string): string {
    for (const pattern of RateLimiterManager.SHARED_RATE_LIMIT_PATHS) {
      if (pattern.test(path)) {
        return `shared:${path}`;
      }
    }

    const routes = {
      channels: /^\/channels\/(\d+)/,
      guilds: /^\/guilds\/(\d+)/,
      webhooks: /^\/webhooks\/(\d+)/,
    };

    for (const [type, regex] of Object.entries(routes)) {
      const match = path.match(regex);
      if (match) {
        const [, id] = match;
        const hash = this.#bucketHashes.get(`${type}:${id}`);
        return hash ? `${type}:${id}:${hash}` : `${type}:${id}:${path}`;
      }
    }

    return path;
  }

  #isErrorStatus(statusCode: number): boolean {
    return (
      statusCode === HttpStatusCode.Unauthorized ||
      statusCode === HttpStatusCode.Forbidden ||
      statusCode === HttpStatusCode.TooManyRequests
    );
  }

  #isInvalidRequestLimited(): boolean {
    return this.#invalidRequestCount >= RateLimiterManager.MAX_INVALID_REQUESTS;
  }

  #isBucketRateLimited(
    rateLimit?: Omit<RateLimitEntity, "bucket">,
  ): rateLimit is Omit<RateLimitEntity, "bucket"> {
    if (!rateLimit) {
      return false;
    }
    return rateLimit.remaining === 0 && Date.now() < rateLimit.reset * 1000;
  }

  async #handleGlobalRateLimit(): Promise<void> {
    if (!this.#globalRateLimit) {
      return;
    }

    const delay = this.#globalRateLimit - Date.now();
    if (delay <= 0) {
      this.#globalRateLimit = null;
      return;
    }

    this.#rest.emit("debug", `Waiting ${delay}ms for global rate limit`);
    await this.#wait(delay);
    this.#globalRateLimit = null;
  }

  async #handleBucketRateLimit(
    bucket: string,
    rateLimit: Omit<RateLimitEntity, "bucket">,
  ): Promise<void> {
    const resetTime = rateLimit.reset * 1000;
    const now = Date.now();

    if (now < resetTime) {
      const delay = resetTime - now;

      if (delay > 0) {
        this.#rest.emit(
          "debug",
          `Waiting ${delay}ms for bucket ${bucket} rate limit`,
        );

        await new Promise<void>((resolve, reject) => {
          const queueEntry = {
            resolve,
            reject,
            addedAt: Date.now(),
          };

          this.#addToQueue(bucket, queueEntry);
        });
      }
    }
  }

  #handleGlobalRateLimitHeader(headers: Record<string, string>): void {
    const retryAfter =
      headers[RateLimiterManager.RATE_LIMIT_HEADERS.RETRY_AFTER];
    if (!retryAfter) {
      return;
    }

    const retryMs = Number(retryAfter) * 1000;
    this.#globalRateLimit = Date.now() + retryMs;

    this.#rest.emit("debug", `Global rate limit set, retry after ${retryMs}ms`);
    this.#rest.emit("rateLimitHit", {
      bucket: "global",
      resetAfter: retryMs,
      limit: 0,
      scope: "global",
    });
  }

  #extractRateLimitData(
    headers: Record<string, string>,
  ): RateLimitEntity | null {
    const h = RateLimiterManager.RATE_LIMIT_HEADERS;
    const bucket = headers[h.BUCKET];
    if (!bucket) {
      return null;
    }

    const reset = Number(headers[h.RESET]);
    const resetAfter = Number(headers[h.RESET_AFTER]);
    const remaining = Number(headers[h.REMAINING]);
    const limit = Number(headers[h.LIMIT]);
    const global = Boolean(headers[h.GLOBAL]);
    const scope = headers[h.SCOPE] as RateLimitScope;

    if ([reset, resetAfter, remaining, limit].some(Number.isNaN)) {
      this.#rest.emit("warn", "Invalid rate limit headers received");
      return null;
    }

    return { bucket, reset, resetAfter, remaining, limit, global, scope };
  }

  #updateBucket(bucket: string, data: Omit<RateLimitEntity, "bucket">): void {
    this.#rateLimitBuckets.set(bucket, {
      ...data,
      reset: Number(data.reset),
      resetAfter: Number(data.resetAfter),
      remaining: Number(data.remaining),
      limit: Number(data.limit),
    });

    this.#rest.emit(
      "debug",
      `Updated bucket ${bucket}: ${data.remaining}/${data.limit} remaining`,
    );
  }

  #updateBucketRemaining(
    bucket: string,
    rateLimit: Omit<RateLimitEntity, "bucket">,
  ): void {
    if (rateLimit.remaining > 0) {
      this.#rateLimitBuckets.set(bucket, {
        ...rateLimit,
        remaining: rateLimit.remaining - 1,
      });
    }
  }

  #addToQueue(
    bucket: string,
    entry: {
      resolve: () => void;
      reject: (error: Error) => void;
      addedAt: number;
    },
  ): void {
    const queue = this.#requestQueue.get(bucket) ?? [];
    if (queue.length >= RateLimiterManager.MAX_QUEUE_SIZE) {
      throw new Error("Rate limit queue is full");
    }
    queue.push(entry);
    this.#requestQueue.set(bucket, queue);
    this.#rest.emit("debug", `Added request to queue for bucket ${bucket}`);
  }

  #processQueue(bucket: string): void {
    const queue = this.#requestQueue.get(bucket);
    if (!queue || queue?.length === 0) {
      return;
    }

    const rateLimit = this.#rateLimitBuckets.get(bucket);
    if (!rateLimit || rateLimit.remaining === 0) {
      return;
    }

    while (queue.length > 0 && rateLimit.remaining > 0) {
      const entry = queue.shift();
      if (entry) {
        entry.resolve();
        rateLimit.remaining--;
      }
    }

    if (queue.length === 0) {
      this.#requestQueue.delete(bucket);
      this.#rest.emit("debug", `Queue cleared for bucket ${bucket}`);
    } else {
      this.#requestQueue.set(bucket, queue);
      this.#rest.emit(
        "debug",
        `${queue.length} requests remaining in queue for bucket ${bucket}`,
      );
    }

    this.#rateLimitBuckets.set(bucket, rateLimit);
  }

  #wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

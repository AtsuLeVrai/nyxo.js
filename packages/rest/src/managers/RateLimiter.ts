import { Store } from "@nyxjs/store";
import type { Rest } from "../core/index.js";
import type { RateLimitEntity, RateLimitScope } from "../types/index.js";
import { HttpStatusCode } from "../utils/index.js";

export class RateLimiter {
  static readonly MAX_QUEUE_SIZE = 1000;
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
  #globalRateLimit: number | null = null;
  #isDestroyed = false;

  readonly #rateLimitBuckets = new Store<
    string,
    Omit<RateLimitEntity, "bucket">
  >();
  readonly #requestQueue = new Map<
    string,
    Array<{
      resolve: () => void;
      reject: (error: Error) => void;
      addedAt: number;
    }>
  >();

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  async checkRateLimits(path: string): Promise<void> {
    if (this.#isDestroyed) {
      throw new Error("RateLimiter has been destroyed");
    }

    const bucketKey = this.#getBucketKey(path);

    if (this.#isGloballyRateLimited()) {
      await this.#handleGlobalRateLimit();
      return;
    }

    const rateLimit = this.#rateLimitBuckets.get(bucketKey);
    if (this.#isBucketRateLimited(rateLimit)) {
      await this.#handleBucketRateLimit(bucketKey, rateLimit);
      return;
    }

    if (rateLimit) {
      this.#updateBucketRemaining(bucketKey, rateLimit);
    }
  }

  updateRateLimits(headers: Record<string, string>, statusCode: number): void {
    if (statusCode === HttpStatusCode.TooManyRequests) {
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

  destroy(): void {
    if (this.#isDestroyed) {
      return;
    }

    this.#isDestroyed = true;
    this.#rateLimitBuckets.clear();
    this.#requestQueue.clear();
    this.#globalRateLimit = null;

    for (const queue of this.#requestQueue.values()) {
      for (const request of queue) {
        request.reject(new Error("RateLimiter is being destroyed"));
      }
    }
  }

  #getBucketKey(path: string): string {
    const routes = {
      channels: /^\/channels\/(\d+)/,
      guilds: /^\/guilds\/(\d+)/,
      webhooks: /^\/webhooks\/(\d+)/,
      reactions: /^\/channels\/\d+\/messages\/\d+\/reactions\/([^/]+)/,
      messages: /^\/channels\/\d+\/messages\/(\d+)/,
    };

    for (const [type, regex] of Object.entries(routes)) {
      const match = path.match(regex);
      if (match) {
        const [, id] = match;
        return `${type}:${id}:${path}`;
      }
    }

    return path;
  }

  #isGloballyRateLimited(): boolean {
    return this.#globalRateLimit !== null && Date.now() < this.#globalRateLimit;
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

  #handleGlobalRateLimitHeader(headers: Record<string, string>): void {
    const retryAfter = headers[RateLimiter.RATE_LIMIT_HEADERS.RETRY_AFTER];
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
    const h = RateLimiter.RATE_LIMIT_HEADERS;
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

  #addToQueue(
    bucket: string,
    entry: {
      resolve: () => void;
      reject: (error: Error) => void;
      addedAt: number;
    },
  ): void {
    const queue = this.#requestQueue.get(bucket) ?? [];
    if (queue.length >= RateLimiter.MAX_QUEUE_SIZE) {
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

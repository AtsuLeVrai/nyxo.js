import { Store } from "@nyxjs/store";
import type {
  QueueEntry,
  RateLimitData,
  RateLimitScope,
} from "../types/index.js";
import { HttpStatusCode } from "../types/index.js";

export class RestRateLimitManager {
  static readonly PATHS = {
    SHARED: new Set([
      /^\/guilds\/\d+\/emojis/,
      /^\/channels\/\d+\/messages\/\d+\/reactions/,
    ]),
    EXCLUDED: new Set(["/interactions"]),
  } as const;

  static readonly HEADERS = {
    BUCKET: "x-ratelimit-bucket",
    LIMIT: "x-ratelimit-limit",
    REMAINING: "x-ratelimit-remaining",
    RESET: "x-ratelimit-reset",
    RESET_AFTER: "x-ratelimit-reset-after",
    GLOBAL: "x-ratelimit-global",
    SCOPE: "x-ratelimit-scope",
    RETRY_AFTER: "retry-after",
  } as const;

  static readonly LIMITS = {
    MAX_QUEUE_SIZE: 1000,
    MAX_GLOBAL_REQUESTS: 50,
    MAX_INVALID_REQUESTS: 10000,
    INVALID_REQUEST_WINDOW: 600_000,
    GLOBAL_RESET_INTERVAL: 1000,
  } as const;

  readonly #bucketHashes = new Store<string, string>();
  readonly #requestQueue = new Store<string, QueueEntry[]>();
  readonly #rateLimitBuckets = new Store<
    string,
    Omit<RateLimitData, "bucket">
  >();

  #globalRateLimit: number | null = null;
  #globalRequestCounter = 0;
  #globalResetTimeout: NodeJS.Timeout | null = null;

  #invalidRequestCount = 0;
  #lastInvalidRequestReset = Date.now();

  #isDestroyed = false;

  constructor() {
    this.#startGlobalResetInterval();
  }

  async checkRateLimits(path: string): Promise<void> {
    this.#validateManagerState();

    if (this.#isInvalidRequestLimited()) {
      throw new Error("Invalid request rate limit exceeded");
    }

    if (this.#isGloballyLimited(path)) {
      await this.#handleGlobalRateLimit();
      return;
    }

    const bucketKey = this.#getBucketKey(path);
    const rateLimit = this.#rateLimitBuckets.get(bucketKey);
    if (this.#isBucketRateLimited(rateLimit)) {
      await this.#handleBucketRateLimit(bucketKey, rateLimit);
      return;
    }

    this.#incrementGlobalCounter(path);

    if (rateLimit) {
      this.#updateBucketRemaining(bucketKey, rateLimit);
    }
  }

  updateRateLimits(headers: Record<string, string>, statusCode: number): void {
    if (this.#isDestroyed) {
      return;
    }

    if (this.#isErrorStatusCode(statusCode)) {
      this.incrementInvalidRequestCount();
    }

    if (statusCode === HttpStatusCode.TooManyRequests) {
      this.#handleGlobalRateLimitHeader(headers);
      return;
    }

    const rateLimitData = this.#extractRateLimitData(headers);
    if (!rateLimitData) {
      return;
    }

    this.#updateBucketData(rateLimitData, headers);
    this.#processQueue(rateLimitData.bucket);
  }

  incrementInvalidRequestCount(): void {
    this.#invalidRequestCount++;
    const now = Date.now();

    if (
      now - this.#lastInvalidRequestReset >=
      RestRateLimitManager.LIMITS.INVALID_REQUEST_WINDOW
    ) {
      this.#invalidRequestCount = 1;
      this.#lastInvalidRequestReset = now;
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

    this.#clearStores();
    this.#resetCounters();
    this.#rejectPendingRequests();
  }

  #validateManagerState(): void {
    if (this.#isDestroyed) {
      throw new Error("RestRateLimitManager has been destroyed");
    }
  }

  #startGlobalResetInterval(): void {
    this.#globalResetTimeout = setInterval(() => {
      this.#globalRequestCounter = 0;
    }, RestRateLimitManager.LIMITS.GLOBAL_RESET_INTERVAL);
  }

  #getBucketKey(path: string): string {
    for (const pattern of RestRateLimitManager.PATHS.SHARED) {
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

  #isGloballyLimited(path: string): boolean {
    return (
      !path.startsWith("/interactions") &&
      this.#globalRequestCounter >=
        RestRateLimitManager.LIMITS.MAX_GLOBAL_REQUESTS
    );
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

    await this.#wait(delay);
    this.#globalRateLimit = null;
  }

  #isBucketRateLimited(
    rateLimit?: Omit<RateLimitData, "bucket">,
  ): rateLimit is RateLimitData {
    if (!rateLimit) {
      return false;
    }
    return rateLimit.remaining === 0 && Date.now() < rateLimit.reset * 1000;
  }

  async #handleBucketRateLimit(
    bucket: string,
    rateLimit: Omit<RateLimitData, "bucket">,
  ): Promise<void> {
    const resetTime = rateLimit.reset * 1000;
    const now = Date.now();

    if (now < resetTime) {
      const delay = resetTime - now;
      if (delay > 0) {
        await new Promise<void>((resolve, reject) => {
          const queueEntry: QueueEntry = {
            resolve,
            reject,
            addedAt: Date.now(),
          };
          this.#addToQueue(bucket, queueEntry);
        });
      }
    }
  }

  #addToQueue(bucket: string, entry: QueueEntry): void {
    const queue = this.#requestQueue.get(bucket) ?? [];

    if (queue.length >= RestRateLimitManager.LIMITS.MAX_QUEUE_SIZE) {
      throw new Error("Rate limit queue is full");
    }

    queue.push(entry);
    this.#requestQueue.set(bucket, queue);
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
    } else {
      this.#requestQueue.set(bucket, queue);
    }

    this.#rateLimitBuckets.set(bucket, rateLimit);
  }

  #extractRateLimitData(headers: Record<string, string>): RateLimitData | null {
    const h = RestRateLimitManager.HEADERS;
    const bucket = headers[h.BUCKET];

    if (!bucket) {
      return null;
    }

    const values = {
      reset: Number(headers[h.RESET]),
      resetAfter: Number(headers[h.RESET_AFTER]),
      remaining: Number(headers[h.REMAINING]),
      limit: Number(headers[h.LIMIT]),
    };

    if (Object.values(values).some(Number.isNaN)) {
      return null;
    }

    return {
      ...values,
      bucket,
      global: Boolean(headers[h.GLOBAL]),
      scope: headers[h.SCOPE] as RateLimitScope,
    };
  }

  #clearStores(): void {
    this.#rateLimitBuckets.clear();
    this.#requestQueue.clear();
    this.#bucketHashes.clear();
  }

  #resetCounters(): void {
    this.#globalRateLimit = null;
    this.#invalidRequestCount = 0;
    this.#globalRequestCounter = 0;
  }

  #rejectPendingRequests(): void {
    for (const queue of this.#requestQueue.values()) {
      for (const request of queue) {
        request.reject(new Error("RestRateLimitManager is being destroyed"));
      }
    }
  }

  #handleGlobalRateLimitHeader(headers: Record<string, string>): void {
    const retryAfter = headers[RestRateLimitManager.HEADERS.RETRY_AFTER];
    if (!retryAfter) {
      return;
    }

    const retryMs = Number(retryAfter) * 1000;
    this.#globalRateLimit = Date.now() + retryMs;
  }

  #updateBucketData(
    rateLimitData: RateLimitData,
    headers: Record<string, string>,
  ): void {
    const { bucket, ...data } = rateLimitData;

    this.#rateLimitBuckets.set(bucket, {
      ...data,
      reset: Number(data.reset),
      resetAfter: Number(data.resetAfter),
      remaining: Number(data.remaining),
      limit: Number(data.limit),
    });

    const bucketHash = headers[RestRateLimitManager.HEADERS.BUCKET];
    if (bucketHash) {
      this.#bucketHashes.set(bucket, bucketHash);
    }
  }

  #updateBucketRemaining(
    bucket: string,
    rateLimit: Omit<RateLimitData, "bucket">,
  ): void {
    if (rateLimit.remaining > 0) {
      this.#rateLimitBuckets.set(bucket, {
        ...rateLimit,
        remaining: rateLimit.remaining - 1,
      });
    }
  }

  #wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  #isErrorStatusCode(statusCode: number): boolean {
    return (
      statusCode === HttpStatusCode.Unauthorized ||
      statusCode === HttpStatusCode.Forbidden ||
      statusCode === HttpStatusCode.TooManyRequests
    );
  }

  #isInvalidRequestLimited(): boolean {
    return (
      this.#invalidRequestCount >=
      RestRateLimitManager.LIMITS.MAX_INVALID_REQUESTS
    );
  }

  #incrementGlobalCounter(path: string): void {
    if (!RestRateLimitManager.PATHS.EXCLUDED.has(path)) {
      this.#globalRequestCounter++;
    }
  }
}

import { Store } from "@nyxjs/store";
import type { RateLimitData, RequestOptions } from "../types/index.js";

export class RateLimitManager {
  static #INVALID_REQUESTS_LIMIT = 10000;
  static #INVALID_REQUESTS_INTERVAL = 10 * 60 * 1000;
  readonly #buckets: Store<string, RateLimitData> = new Store();
  #globalRateLimit: number | null = null;
  #invalidRequestsCount = 0;
  #lastInvalidRequestReset = Date.now();
  readonly #cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.#cleanupInterval = setInterval(() => {
      this.#cleanupInvalidRequests();
    }, RateLimitManager.#INVALID_REQUESTS_INTERVAL);
  }

  *waitForRateLimit(request: RequestOptions): Generator<number> {
    while (true) {
      const waitTime = this.#getRateLimitWaitTime(request);
      if (!waitTime) {
        break;
      }
      yield waitTime;
    }
  }

  handleRateLimit(
    request: RequestOptions,
    headers: Record<string, string>,
  ): void {
    const {
      "x-ratelimit-limit": limit,
      "x-ratelimit-remaining": remaining,
      "x-ratelimit-reset": reset,
      "x-ratelimit-reset-after": resetAfter,
      "x-ratelimit-bucket": bucket,
      "x-ratelimit-global": global,
      "x-ratelimit-scope": scope,
    } = headers;

    if (!bucket) {
      return;
    }

    this.#buckets.set(request.path, {
      limit: Number(limit),
      remaining: Number(remaining),
      reset: Number(reset),
      resetAfter: Number(resetAfter),
      bucket,
      global: Boolean(global),
      scope: (scope as RateLimitData["scope"]) ?? "user",
    });
  }

  handleGlobalRateLimit(retryAfter: number): void {
    this.#globalRateLimit = Date.now() + retryAfter * 1000;
  }

  handleInvalidRequest(): void {
    this.#invalidRequestsCount++;

    if (
      this.#invalidRequestsCount >= RateLimitManager.#INVALID_REQUESTS_LIMIT
    ) {
      const timeSinceReset = Date.now() - this.#lastInvalidRequestReset;
      if (timeSinceReset < RateLimitManager.#INVALID_REQUESTS_INTERVAL) {
        throw new Error(
          "Invalid request limit exceeded. Your IP may be temporarily banned.",
        );
      }
    }
  }

  destroy(): void {
    clearInterval(this.#cleanupInterval);
    this.#buckets.clear();
    this.#globalRateLimit = null;
    this.#invalidRequestsCount = 0;
  }

  #getRateLimitWaitTime(request: RequestOptions): number | null {
    if (this.#globalRateLimit && Date.now() < this.#globalRateLimit) {
      return this.#globalRateLimit - Date.now();
    }

    const bucket = this.#buckets.get(request.path);
    if (!bucket || bucket.remaining > 0) {
      return null;
    }

    const now = Date.now();
    const reset = bucket.reset * 1000;
    return now < reset ? reset - now : null;
  }

  #cleanupInvalidRequests(): void {
    this.#invalidRequestsCount = 0;
    this.#lastInvalidRequestReset = Date.now();

    const now = Date.now();
    for (const [path, bucket] of this.#buckets) {
      if (bucket.reset * 1000 < now) {
        this.#buckets.delete(path);
      }
    }
  }
}

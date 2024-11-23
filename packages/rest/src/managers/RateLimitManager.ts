import { Store } from "@nyxjs/store";
import type {
  RateLimitData,
  RateLimitResponseEntity,
  RequestOptions,
} from "../types/index.js";

export class RateLimitManager {
  readonly #buckets: Store<string, RateLimitData> = new Store();
  #globalRateLimit: number | null = null;
  #invalidRequestsCount = 0;
  #lastInvalidRequestReset = Date.now();

  readonly #invalidRequestsLimit = 10000;
  readonly #invalidRequestsInterval = 10 * 60 * 1000;

  constructor() {
    setInterval(() => {
      this.#invalidRequestsCount = 0;
      this.#lastInvalidRequestReset = Date.now();
    }, this.#invalidRequestsInterval);
  }

  destroy(): void {
    this.#buckets.clear();
  }

  isRateLimited(request: RequestOptions): number | null {
    if (this.#globalRateLimit && Date.now() < this.#globalRateLimit) {
      return this.#globalRateLimit - Date.now();
    }

    const bucket = this.#buckets.get(request.path);
    if (!bucket) {
      return null;
    }

    if (bucket.remaining === 0) {
      const now = Date.now();
      const reset = bucket.reset * 1000;
      if (now < reset) {
        return reset - now;
      }
    }

    return null;
  }

  handleInvalidRequest(): void {
    this.#invalidRequestsCount++;

    if (this.#invalidRequestsCount >= this.#invalidRequestsLimit) {
      const timeSinceReset = Date.now() - this.#lastInvalidRequestReset;
      if (timeSinceReset < this.#invalidRequestsInterval) {
        throw new Error(
          "Invalid request limit exceeded. Your IP may be temporarily banned by Cloudflare.",
        );
      }
    }
  }

  handleRateLimit(
    request: RequestOptions,
    headers: Record<string, string>,
  ): void {
    const limit = headers["X-RateLimit-Limit"];
    const remaining = headers["X-RateLimit-Remaining"];
    const reset = headers["X-RateLimit-Reset"];
    const resetAfter = headers["X-RateLimit-Reset-After"];
    const bucket = headers["X-RateLimit-Bucket"];
    const global = headers["X-RateLimit-Global"];
    const scope = headers["X-RateLimit-Scope"] as RateLimitData["scope"];

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
      scope: scope ?? "user",
    });
  }

  handleRateLimitError(error: RateLimitResponseEntity): void {
    if (error.global) {
      this.#globalRateLimit = Date.now() + error.retry_after * 1000;
    }
  }
}

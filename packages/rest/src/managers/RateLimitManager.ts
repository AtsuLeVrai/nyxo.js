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
    const limit = headers["x-ratelimit-limit"];
    const remaining = headers["x-ratelimit-remaining"];
    const reset = headers["x-ratelimit-reset"];
    const resetAfter = headers["x-ratelimit-reset-after"];
    const bucket = headers["x-ratelimit-bucket"];
    const global = headers["x-ratelimit-global"];
    const scope = headers["x-ratelimit-scope"] as RateLimitData["scope"];

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

import { setTimeout } from "node:timers/promises";
import type { Rest } from "../core/index.js";
import { ApiError, RateLimitError } from "../errors/index.js";
import type { RetryOptions } from "../options/index.js";

export class RetryManager {
  readonly #rest: Rest;
  readonly #options: RetryOptions;

  constructor(rest: Rest, options: RetryOptions) {
    this.#rest = rest;
    this.#options = options;
  }

  async execute<T>(
    operation: () => Promise<T>,
    context: {
      method: string;
      path: string;
    },
  ): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        return await operation();
      } catch (error) {
        const normalizedError = this.#normalizeError(error);

        const shouldRetry = await this.#handleError(
          normalizedError,
          attempt,
          context,
        );

        if (!shouldRetry || attempt >= this.#options.maxRetries) {
          throw normalizedError;
        }

        attempt++;
      }
    }
  }

  async #handleError(
    error: Error,
    attempt: number,
    context: { method: string; path: string },
  ): Promise<boolean> {
    this.#rest.emit("debug", "Handling retry error", {
      error: error.message,
      attempt,
      context,
    });

    if (!this.#shouldRetry(error, attempt)) {
      this.#rest.emit("debug", "Retry not allowed", {
        reason: "Policy or max attempts reached",
        attempt,
      });

      return false;
    }

    const delay = this.#calculateDelay(error, attempt);

    this.#rest.emit("retryAttempt", {
      error,
      attempt,
      delay,
      ...context,
      timestamp: Date.now(),
    });

    await setTimeout(delay);
    return true;
  }

  #calculateDelay(error: Error, attempt: number): number {
    if (error instanceof RateLimitError) {
      return this.#calculateRateLimitDelay(error.context.retryAfter, attempt);
    }

    return this.#calculateBackoffDelay(attempt);
  }

  #calculateRateLimitDelay(baseDelay: number, attempt: number): number {
    const exponentialDelay = Math.min(
      baseDelay * 2 ** attempt,
      this.#options.maxDelay,
    );

    return Math.max(
      exponentialDelay * this.#options.jitter,
      this.#options.minDelay,
    );
  }

  #calculateBackoffDelay(attempt: number): number {
    const exponentialDelay = 1000 * 2 ** attempt;
    const finalDelay = Math.min(exponentialDelay, this.#options.maxDelay);
    const jitter = Math.random() * this.#options.jitter * finalDelay;
    return finalDelay + jitter;
  }

  #shouldRetry(error: Error, attempt: number): boolean {
    if (attempt >= this.#options.maxRetries) {
      return false;
    }

    if (error instanceof ApiError) {
      return this.#options.retryableStatusCodes.includes(error.status);
    }

    if (error instanceof RateLimitError) {
      return this.#options.retryOn.rateLimits;
    }

    const errorMessage = error.message.toLowerCase();

    const isNetworkError = this.#options.retryableErrors.some((code) =>
      errorMessage.includes(code.toLowerCase()),
    );
    if (isNetworkError) {
      return this.#options.retryOn.networkErrors;
    }

    if (errorMessage.includes("timeout")) {
      return this.#options.retryOn.timeouts;
    }

    return false;
  }

  #normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === "object" && error !== null) {
      return new Error(JSON.stringify(error), {
        cause: error,
      });
    }

    return new Error(String(error));
  }
}

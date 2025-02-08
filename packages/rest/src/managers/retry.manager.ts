import { setTimeout } from "node:timers/promises";
import { REQUEST_CONSTANTS } from "../constants/index.js";
import type { Rest } from "../core/index.js";
import { ApiError, RateLimitError } from "../errors/index.js";
import type { RestOptions } from "../options/index.js";

export class RetryManager {
  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  async execute<T>(
    operation: () => Promise<T>,
    context: {
      method: string;
      path: string;
      sessionId?: string;
    },
  ): Promise<T> {
    let attempt = 0;
    const session = this.#rest.sessions.getSessionInfo(context.sessionId);

    while (true) {
      try {
        return await operation();
      } catch (error) {
        const normalizedError = this.#normalizeError(error);

        const shouldRetry = await this.#handleError(
          normalizedError,
          attempt,
          context,
          session.options,
        );

        if (!shouldRetry || attempt >= session.options.retry.maxRetries) {
          throw normalizedError;
        }

        attempt++;
      }
    }
  }

  async #handleError(
    error: Error,
    attempt: number,
    context: { method: string; path: string; sessionId?: string },
    options: RestOptions,
  ): Promise<boolean> {
    if (!this.#shouldRetry(error, attempt, options)) {
      return false;
    }

    const delay = this.#calculateDelay(error, attempt, options);

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

  #calculateDelay(error: Error, attempt: number, options: RestOptions): number {
    if (error instanceof RateLimitError) {
      return this.#calculateRateLimitDelay(
        error.context.retryAfter,
        attempt,
        options,
      );
    }

    return this.#calculateBackoffDelay(attempt, options);
  }

  #calculateRateLimitDelay(
    baseDelay: number,
    attempt: number,
    options: RestOptions,
  ): number {
    const exponentialDelay = Math.min(
      baseDelay * 2 ** attempt,
      options.retry.maxDelay,
    );

    const maxJitter = Math.min(
      exponentialDelay * options.retry.jitter,
      REQUEST_CONSTANTS.MAX_JITTER,
    );
    const jitter = Math.random() * maxJitter;

    return Math.max(
      exponentialDelay + jitter,
      REQUEST_CONSTANTS.MIN_RETRY_DELAY,
    );
  }

  #calculateBackoffDelay(attempt: number, options: RestOptions): number {
    const exponentialDelay = 1000 * 2 ** attempt;
    const finalDelay = Math.min(exponentialDelay, options.retry.maxDelay);
    const jitter = Math.random() * options.retry.jitter * finalDelay;
    return finalDelay + jitter;
  }

  #shouldRetry(error: Error, attempt: number, options: RestOptions): boolean {
    if (attempt >= options.retry.maxRetries) {
      return false;
    }

    if (error instanceof ApiError) {
      return options.retry.retryableStatusCodes.includes(error.status);
    }

    if (error instanceof RateLimitError) {
      return options.retry.retryOn.rateLimits;
    }

    const errorMessage = error.message.toLowerCase();

    const isNetworkError = options.retry.retryableErrors.some((code) =>
      errorMessage.includes(code.toLowerCase()),
    );
    if (isNetworkError) {
      return options.retry.retryOn.networkErrors;
    }

    if (errorMessage.includes("timeout")) {
      return options.retry.retryOn.timeouts;
    }

    return false;
  }

  #normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(typeof error === "string" ? error : JSON.stringify(error));
  }
}

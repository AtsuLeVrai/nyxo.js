import { setTimeout } from "node:timers/promises";
import type { Rest } from "../core/index.js";
import { ApiError, RateLimitError } from "../errors/index.js";
import type { RetryOptions } from "../options/index.js";

interface HandleError {
  shouldRetry: boolean;
  timeout: number;
}

export interface RetryState {
  retryCount: number;
  retryAfter?: number;
  timeoutAt?: number;
  error?: Error;
}

export class RetryManager {
  #state: RetryState = {
    retryCount: 0,
  };

  readonly #rest: Rest;
  readonly #options: RetryOptions;

  constructor(rest: Rest, options: RetryOptions) {
    this.#rest = rest;
    this.#options = options;
  }

  async execute<T>(
    operation: () => Promise<T>,
    context: { method: string; path: string },
  ): Promise<T> {
    while (true) {
      try {
        return await operation();
      } catch (error) {
        const retryDetails = this.#handleError(error, context);

        if (!retryDetails.shouldRetry) {
          throw error;
        }

        await setTimeout(retryDetails.timeout);
        this.#state.retryCount++;
      }
    }
  }

  #handleError(
    error: unknown,
    context: { method: string; path: string },
  ): HandleError {
    if (this.#state.retryCount >= this.#options.maxRetries) {
      return { shouldRetry: false, timeout: 0 };
    }

    if (!this.#options.methods.includes(context.method)) {
      return { shouldRetry: false, timeout: 0 };
    }

    if (error instanceof RateLimitError) {
      const timeout = this.#calculateTimeout(error.retryAfter);
      this.#state.retryAfter = error.retryAfter;

      this.#emitRetryEvent(error, timeout, "Rate limit exceeded");
      return { shouldRetry: true, timeout };
    }

    if (error instanceof ApiError) {
      if (!this.#options.statusCodes.includes(error.context.statusCode)) {
        return { shouldRetry: false, timeout: 0 };
      }

      if (this.#options.retryAfter && error.context.headers?.["retry-after"]) {
        const retryAfter = Number(error.context.headers["retry-after"]) * 1000;
        const timeout = this.#calculateTimeout(retryAfter);

        this.#emitRetryEvent(
          error,
          timeout,
          `Status ${error.context.statusCode} with Retry-After`,
        );
        return { shouldRetry: true, timeout };
      }

      const timeout = this.#calculateTimeout();
      this.#emitRetryEvent(
        error,
        timeout,
        `Status ${error.context.statusCode}`,
      );
      return { shouldRetry: true, timeout };
    }

    if (error instanceof Error) {
      const errorCode = this.#getErrorCode(error);
      if (this.#options.errorCodes.includes(errorCode)) {
        const timeout = this.#calculateTimeout();
        this.#emitRetryEvent(error, timeout, `Network error: ${errorCode}`);
        return { shouldRetry: true, timeout };
      }
    }

    return { shouldRetry: false, timeout: 0 };
  }

  #calculateTimeout(baseTimeout?: number): number {
    const base = baseTimeout ?? this.#options.minTimeout;
    const factor = this.#options.timeoutFactor ** this.#state.retryCount;
    const timeout = base * factor;

    // Add jitter (±10%)
    const jitter = timeout * 0.1 * (Math.random() * 2 - 1);

    return Math.min(
      Math.max(timeout + jitter, this.#options.minTimeout),
      this.#options.maxTimeout,
    );
  }

  #getErrorCode(error: Error): string {
    const message = error.message.toUpperCase();
    return (
      this.#options.errorCodes.find((code) => message.includes(code)) ??
      "UNKNOWN"
    );
  }

  #emitRetryEvent(error: Error, timeout: number, reason: string): void {
    this.#rest.emit("retryAttempt", {
      error,
      attempt: this.#state.retryCount + 1,
      timeout,
      reason,
      timestamp: new Date().toISOString(),
    });
  }
}

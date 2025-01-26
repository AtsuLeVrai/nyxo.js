import type { RateLimitScope } from "../types/index.js";

export interface RateLimitErrorContext {
  path: string;
  method: string;
  headers?: Record<string, string>;
  retryable?: boolean;
  timestamp?: number;
  timeToReset: number;
  bucketHash?: string;
  global: boolean;
  scope: RateLimitScope;
  retryAfter?: number;
  limit?: number;
  remaining?: number;
  reset?: number;
  resetAfter?: number;
}

export class RateLimitError extends Error {
  readonly context: RateLimitErrorContext;
  readonly timestamp: number;

  constructor(context: RateLimitErrorContext) {
    super();
    this.name = "RateLimitError";
    this.message = this.#buildErrorMessage(context);
    this.timestamp = Date.now();

    this.context = {
      ...context,
      timestamp: this.timestamp,
      retryable: this.#isRetryable(context),
    };
  }

  get retryable(): boolean {
    return this.context.retryable ?? false;
  }

  get headers(): Record<string, string> | undefined {
    return this.context.headers;
  }

  get bucket(): string | undefined {
    return this.context.bucketHash;
  }

  get scope(): RateLimitScope {
    return this.context.scope;
  }

  get global(): boolean {
    return this.context.global;
  }

  get timeToReset(): number {
    return this.context.timeToReset;
  }

  getRetryDelay(): number {
    const now = Date.now();
    if (this.context.reset) {
      return Math.max(0, this.context.reset - now);
    }
    if (this.context.resetAfter) {
      return this.context.resetAfter * 1000;
    }
    return this.context.timeToReset;
  }

  #buildErrorMessage(context: RateLimitErrorContext): string {
    const base = context.global
      ? "Global rate limit exceeded"
      : `Rate limit exceeded for ${context.scope} scope`;

    const details = [
      context.method && context.path
        ? `on route ${context.method} ${context.path}`
        : null,
      context.bucketHash ? `(Bucket: ${context.bucketHash})` : null,
      `Retry after ${context.timeToReset}ms`,
      context.limit ? `Rate limit: ${context.limit}` : null,
      context.remaining !== undefined
        ? `Remaining: ${context.remaining}`
        : null,
    ]
      .filter(Boolean)
      .join(". ");

    return `${base}. ${details}`;
  }

  #isRetryable(context: RateLimitErrorContext): boolean {
    if (context.global || context.scope === "user") {
      return false;
    }

    if (context.scope === "shared") {
      return true;
    }

    return Boolean(context.timeToReset && context.timeToReset > 0);
  }
}

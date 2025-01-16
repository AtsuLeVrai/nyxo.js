import type { RateLimitScope } from "../types/index.js";

export interface RateLimitErrorContext {
  timeToReset: number;
  method: string;
  path: string;
  bucketHash?: string;
  global: boolean;
  scope: RateLimitScope;
  retryAfter?: number;
}

export class RateLimitError extends Error {
  readonly context: RateLimitErrorContext;

  constructor(context: RateLimitErrorContext) {
    const message = context.global
      ? `Global rate limit exceeded. Retry after ${context.timeToReset}ms`
      : `Rate limit exceeded for ${context.scope} scope on route ${context.method} ${context.path}. ` +
        `Retry after ${context.timeToReset}ms`;

    super(message);
    this.name = "RateLimitError";
    this.context = context;
  }
}

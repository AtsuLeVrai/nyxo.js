import { BaseApiError, type BaseApiErrorContext } from "../base/index.js";

export interface RateLimitContext extends BaseApiErrorContext {
  scope: "user" | "global" | "shared";
  retryAfter: number;
  bucketHash?: string;
  global?: boolean;
  reason?: string;
}

export interface RateLimitErrorJson {
  name: string;
  message: string;
  context: RateLimitContext;
}

export class RateLimitError extends BaseApiError {
  readonly retryAfter: number;

  constructor(
    context: Omit<RateLimitContext, "statusCode" | "timestamp" | "headers">,
  ) {
    super(
      `Rate limit exceeded for ${context.path} (${context.method}): retry after ${context.retryAfter}ms`,
      {
        statusCode: 429,
        ...context,
      },
    );
    this.retryAfter = context.retryAfter;
  }

  get rateLimitContext(): RateLimitContext {
    return this.context as RateLimitContext;
  }

  toJson(): RateLimitErrorJson {
    return {
      name: this.name,
      message: this.message,
      context: this.rateLimitContext,
    };
  }
}

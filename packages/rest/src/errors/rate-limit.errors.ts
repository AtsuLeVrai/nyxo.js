import type { RateLimitErrorContext } from "../types/index.js";

export interface RateLimitErrorJson {
  name: string;
  message: string;
  code: number;
  context: RateLimitErrorContext;
}

export class RateLimitError extends Error {
  readonly context: RateLimitErrorContext;
  readonly code = 429;

  constructor(context: RateLimitErrorContext) {
    super(
      `Rate limit exceeded for ${context.path} (${context.method}): retry after ${context.retryAfter}s`,
    );
    this.name = "RateLimitError";
    this.context = context;
  }

  toJson(): RateLimitErrorJson {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
    };
  }
}

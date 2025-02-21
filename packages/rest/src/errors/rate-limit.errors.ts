import type { RateLimitScope } from "../managers/index.js";

export interface RateLimitErrorContext {
  method: string;
  path: string;
  scope: RateLimitScope;
  retryAfter: number;
  global?: boolean;
  bucketHash?: string;
  attempts?: number;
  reason?: string;
}

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
      `Rate limit exceeded for ${context.path} (${context.method}): retry after ${context.retryAfter}ms`,
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

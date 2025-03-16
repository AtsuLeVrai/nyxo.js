import type { RateLimitScope } from "../managers/index.js";

export interface RateLimitErrorContext {
  path: string;
  method: string;
  retryAfter: number;
  scope: RateLimitScope;
  bucketHash?: string;
  global?: boolean;
  reason?: string;
}

export class RateLimitError extends Error {
  readonly requestId: string;
  readonly statusCode: number;
  readonly path: string;
  readonly method: string;
  readonly timestamp: string;
  readonly retryAfter: number;
  readonly scope: RateLimitScope;
  readonly bucketHash?: string;
  readonly global?: boolean;
  readonly reason?: string;

  constructor(requestId: string, context: RateLimitErrorContext) {
    super(
      `Rate limit exceeded for ${context.path} (${context.method}): retry after ${context.retryAfter}ms`,
    );
    this.name = this.constructor.name;
    this.requestId = requestId;
    this.statusCode = 429;
    this.path = context.path;
    this.method = context.method;
    this.timestamp = new Date().toISOString();
    this.retryAfter = context.retryAfter;
    this.scope = context.scope;
    this.bucketHash = context.bucketHash;
    this.global = context.global;
    this.reason = context.reason;
  }

  toJson(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      requestId: this.requestId,
      statusCode: this.statusCode,
      path: this.path,
      method: this.method,
      timestamp: this.timestamp,
      retryAfter: this.retryAfter,
      scope: this.scope,
      bucketHash: this.bucketHash,
      global: this.global,
      reason: this.reason,
    };
  }

  override toString(): string {
    return `${this.name}: [${this.requestId}] ${this.message}${this.reason ? ` (${this.reason})` : ""}`;
  }
}

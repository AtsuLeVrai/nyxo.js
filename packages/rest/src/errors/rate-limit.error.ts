import type { RateLimitScope } from "../types/index.js";
import { RestBaseError } from "./rest.error.js";

export class RestRateLimitError extends RestBaseError {
  readonly timeToReset: number;
  readonly global: boolean;
  readonly scope: RateLimitScope;
  readonly method: string;
  readonly url: string;
  readonly retryAfter?: number;
  readonly limit?: number;
  readonly remaining?: number;
  readonly bucketHash?: string;

  constructor(
    timeToReset: number,
    global: boolean,
    scope: RateLimitScope,
    method: string,
    url: string,
    retryAfter?: number,
    limit?: number,
    remaining?: number,
    bucketHash?: string,
  ) {
    super(`Rate limited on ${method} ${url} for ${timeToReset}ms`);
    this.name = "RestRateLimitError";
    this.timeToReset = timeToReset;
    this.global = global;
    this.scope = scope;
    this.method = method;
    this.url = url;
    this.retryAfter = retryAfter;
    this.limit = limit;
    this.remaining = remaining;
    this.bucketHash = bucketHash;
  }

  override toString(): string {
    return `${this.name}[${this.scope}]: ${this.message}`;
  }
}

export function isRestRateLimitError(
  error: unknown,
): error is RestRateLimitError {
  return error instanceof RestRateLimitError;
}

export class RestCloudflareBanError extends RestBaseError {
  readonly recommendedWaitTime: number;
  readonly url: string;
  readonly analytics: {
    total: number;
    errors: number;
    lastMinute: number;
    mostAffectedRoutes: Array<{ path: string; count: number }>;
  };

  constructor(
    recommendedWaitTime: number,
    url: string,
    analytics: {
      total: number;
      errors: number;
      lastMinute: number;
      mostAffectedRoutes: Array<{ path: string; count: number }>;
    },
  ) {
    super(
      `Cloudflare ban detected on ${url}. Wait ${recommendedWaitTime}ms before retrying.`,
    );
    this.name = "RestCloudflareBanError";
    this.recommendedWaitTime = recommendedWaitTime;
    this.url = url;
    this.analytics = analytics;
  }

  override toString(): string {
    return `${this.name}: ${this.message}`;
  }
}

export function isRestCloudflareBanError(
  error: unknown,
): error is RestCloudflareBanError {
  return error instanceof RestCloudflareBanError;
}

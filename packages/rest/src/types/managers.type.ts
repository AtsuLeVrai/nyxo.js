export type RateLimitScope = "user" | "global" | "shared";

export interface RateLimitBucket {
  hash: string;
  limit: number;
  remaining: number;
  reset: number;
  resetAfter: number;
  scope: RateLimitScope;
  sharedRoute?: string;
}

export interface RateLimitAttempt {
  count: number;
  lastAttempt: number;
  nextReset: number;
  scope: RateLimitScope;
}

export interface RetryAttempt {
  error: Error;
  attempt: number;
  delay: number;
  method: string;
  path: string;
  timestamp: number;
}

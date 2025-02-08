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

export interface RateLimitErrorContext {
  method: string;
  path: string;
  scope: RateLimitScope;
  retryAfter: number;
  global?: boolean;
  bucketHash?: string;
  attempts?: number;
}

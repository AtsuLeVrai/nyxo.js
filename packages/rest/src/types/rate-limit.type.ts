export type RateLimitScope = "user" | "global" | "shared";

export interface RateLimitBucket {
  hash: string;
  limit: number;
  remaining: number;
  reset: number;
  resetAfter: number;
  scope: RateLimitScope;
  lastUsed: number;
  sharedRoute?: string;
}

export interface RateLimitEvent {
  bucketHash?: string;
  timeToReset: number;
  limit: number;
  remaining: number;
  method: string;
  path: string;
  global: boolean;
  scope: RateLimitScope;
  retryAfter?: number;
}

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

export interface RateLimitError {
  timeToReset: number;
  method: string;
  path: string;
  global: boolean;
  scope: RateLimitScope;
  retryAfter?: number;
}

export interface RateLimitHeaders {
  limit: string;
  remaining: string;
  reset: string;
  resetAfter: string;
  bucket: string;
  scope: string;
  global: string;
  retryAfter: string;
}

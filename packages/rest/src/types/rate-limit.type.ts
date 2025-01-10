export type RateLimitScope = "user" | "global" | "shared";

export interface RateLimitBucket {
  hash: string;
  limit: number;
  remaining: number;
  reset: number; // Epoch time
  resetAfter: number; // Seconds
  scope: RateLimitScope;
  sharedRoute?: string; // For shared buckets
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

export interface CloudflareAnalytics {
  status: number;
  timestamp: number;
  path: string;
}

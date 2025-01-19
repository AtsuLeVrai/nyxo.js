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

export interface BucketStatusInfo {
  remaining: number;
  reset: number;
  limit: number;
  latency?: number;
}

export interface BucketLatencyInfo {
  timestamp: number;
  latency: number;
}

export interface GlobalRateLimitStats {
  totalBuckets: number;
  activeBuckets: number;
  globallyLimited: boolean;
  invalidRequestCount: number;
  timeToReset: number;
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

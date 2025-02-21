export interface ApiRequest {
  path: string;
  method: string;
  headers: Record<string, string>;
  statusCode: number;
  latency: number;
  timestamp: number;
}

export interface RetryAttempt {
  error: Error;
  attempt: number;
  delay: number;
  method: string;
  path: string;
  timestamp: number;
}

export type BucketEventType = "expired" | "updated";

export interface BucketEventBase {
  type: BucketEventType;
  bucketHash: string;
}

export interface BucketExpiredEvent extends BucketEventBase {
  type: "expired";
}

export interface BucketUpdatedEvent extends BucketEventBase {
  type: "updated";
  remaining: number;
  resetAfter: number;
}

export type BucketEvent = BucketExpiredEvent | BucketUpdatedEvent;

export interface RestEventHandlers {
  debug: [message: string, context?: Record<string, unknown>];
  error: [error: Error | string, context?: Record<string, unknown>];
  requestFinish: [request: ApiRequest];
  retryAttempt: [retry: RetryAttempt];
  rateLimitExceeded: [resetAfter: number, bucket?: string];
  bucketUpdate: [bucket: BucketEvent];
}

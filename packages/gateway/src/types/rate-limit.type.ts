export interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
  blocked: boolean;
}

export interface RateLimitOptions {
  maxTokens?: number;
  refillInterval?: number;
  maxConcurrentIdentifies?: number;
  identifyInterval?: number;
}

export interface RateLimitIdentifyQueueItem {
  shardId: number;
  bucket: number;
  timestamp: number;
  resolve: () => void;
  reject: (error: Error) => void;
}

export interface RateLimitStats {
  buckets: number;
  identifyQueueLength: number;
  isProcessingIdentify: boolean;
}

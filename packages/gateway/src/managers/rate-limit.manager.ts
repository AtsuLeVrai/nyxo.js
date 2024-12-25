import { Store } from "@nyxjs/store";
import type {
  RateLimitBucket,
  RateLimitIdentifyQueueItem,
  RateLimitOptions,
  RateLimitStats,
} from "../types/index.js";

export class RateLimitManager {
  static readonly DEFAULT_MAX_TOKENS = 120;
  static readonly DEFAULT_REFILL_INTERVAL = 60_000;
  static readonly DEFAULT_IDENTIFY_INTERVAL = 5_000;
  static readonly DEFAULT_MAX_CONCURRENT_IDENTIFIES = 1;

  readonly #maxTokens: number;
  readonly #refillInterval: number;
  readonly #identifyInterval: number;
  readonly #maxConcurrentIdentifies: number;
  readonly #buckets = new Store<string, RateLimitBucket>();
  readonly #identifyQueue: RateLimitIdentifyQueueItem[] = [];

  #processingIdentify = false;
  #identifyProcessor: NodeJS.Timeout | null = null;

  constructor(options: RateLimitOptions = {}) {
    this.#maxTokens = options.maxTokens ?? RateLimitManager.DEFAULT_MAX_TOKENS;
    this.#refillInterval =
      options.refillInterval ?? RateLimitManager.DEFAULT_REFILL_INTERVAL;
    this.#identifyInterval =
      options.identifyInterval ?? RateLimitManager.DEFAULT_IDENTIFY_INTERVAL;
    this.#maxConcurrentIdentifies =
      options.maxConcurrentIdentifies ??
      RateLimitManager.DEFAULT_MAX_CONCURRENT_IDENTIFIES;
  }

  async acquire(bucketId: string): Promise<void> {
    const bucket = this.#getOrCreateBucket(bucketId);

    if (bucket.blocked) {
      throw new Error(`Bucket ${bucketId} is blocked due to rate limit`);
    }

    this.#refillBucket(bucket);

    if (bucket.tokens <= 0) {
      bucket.blocked = true;
      try {
        await this.#waitForRefill(bucket);
        this.#refillBucket(bucket);
      } finally {
        bucket.blocked = false;
      }
    }

    bucket.tokens--;
  }

  async acquireIdentify(shardId: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.#identifyQueue.push({ shardId, resolve, reject });
      this.#processIdentifyQueue().catch(reject);
    });
  }

  isRateLimited(bucketId: string): boolean {
    const bucket = this.#buckets.get(bucketId);
    if (!bucket) {
      return false;
    }

    this.#refillBucket(bucket);
    return bucket.tokens <= 0;
  }

  getBucketInfo(
    bucketId: string,
  ): { remaining: number; resetAfter: number } | null {
    const bucket = this.#buckets.get(bucketId);
    if (!bucket) {
      return null;
    }

    this.#refillBucket(bucket);

    return {
      remaining: bucket.tokens,
      resetAfter: this.#calculateWaitTime(bucket),
    };
  }

  getStats(): RateLimitStats {
    return {
      buckets: this.#buckets.size,
      identifyQueueLength: this.#identifyQueue.length,
      isProcessingIdentify: this.#processingIdentify,
    };
  }

  resetBucket(bucketId: string): void {
    const bucket = this.#getOrCreateBucket(bucketId);
    this.#resetBucketState(bucket);
  }

  destroy(): void {
    if (this.#identifyProcessor) {
      clearTimeout(this.#identifyProcessor);
      this.#identifyProcessor = null;
    }

    this.#buckets.clear();
    this.#identifyQueue.splice(0, this.#identifyQueue.length);
    this.#processingIdentify = false;
  }

  #getOrCreateBucket(bucketId: string): RateLimitBucket {
    let bucket = this.#buckets.get(bucketId);

    if (!bucket) {
      bucket = {
        tokens: this.#maxTokens,
        lastRefill: Date.now(),
        blocked: false,
      };
      this.#buckets.set(bucketId, bucket);
    }

    return bucket;
  }

  #refillBucket(bucket: RateLimitBucket): void {
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const intervalsPassed = Math.floor(timePassed / this.#refillInterval);

    if (intervalsPassed > 0) {
      bucket.tokens = Math.min(
        this.#maxTokens,
        bucket.tokens + this.#maxTokens * intervalsPassed,
      );
      bucket.lastRefill = now - (timePassed % this.#refillInterval);
    }
  }

  #resetBucketState(bucket: RateLimitBucket): void {
    bucket.tokens = this.#maxTokens;
    bucket.lastRefill = Date.now();
    bucket.blocked = false;
  }

  async #processIdentifyQueue(): Promise<void> {
    if (this.#processingIdentify || this.#identifyQueue.length === 0) {
      return;
    }

    this.#processingIdentify = true;

    try {
      while (this.#identifyQueue.length > 0) {
        const batch = this.#identifyQueue.splice(
          0,
          this.#maxConcurrentIdentifies,
        );

        await Promise.all(
          batch.map((item) => {
            try {
              item.resolve();
            } catch (error) {
              item.reject(
                error instanceof Error ? error : new Error(String(error)),
              );
            }
          }),
        );

        if (this.#identifyQueue.length > 0) {
          await this.#wait(this.#identifyInterval);
        }
      }
    } finally {
      this.#processingIdentify = false;
    }
  }

  #calculateWaitTime(bucket: RateLimitBucket): number {
    const now = Date.now();
    const timeSinceLastRefill = now - bucket.lastRefill;
    return Math.max(0, this.#refillInterval - timeSinceLastRefill);
  }

  async #waitForRefill(bucket: RateLimitBucket): Promise<void> {
    const waitTime = this.#calculateWaitTime(bucket);
    await this.#wait(waitTime);
  }

  #wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.#identifyProcessor = setTimeout(resolve, ms);
    });
  }
}

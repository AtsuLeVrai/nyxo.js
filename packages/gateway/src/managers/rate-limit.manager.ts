import { Store } from "@nyxjs/store";
import type {
  RateLimitBucket,
  RateLimitIdentifyQueueItem,
  RateLimitOptions,
  RateLimitStats,
} from "../types/index.js";

export class RateLimitManager {
  readonly #maxTokens: number;
  readonly #refillInterval: number;
  readonly #identifyInterval: number;
  readonly #maxConcurrentIdentifies: number;

  #buckets: Store<string, RateLimitBucket> = new Store();
  #identifyQueue: RateLimitIdentifyQueueItem[] = [];
  #processingIdentify = false;

  constructor(options: RateLimitOptions = {}) {
    this.#maxTokens = options.maxTokens ?? 120;
    this.#refillInterval = options.refillInterval ?? 60000;
    this.#identifyInterval = options.identifyInterval ?? 5000;
    this.#maxConcurrentIdentifies = options.maxConcurrentIdentifies ?? 1;
  }

  async acquire(bucketId: string): Promise<void> {
    const bucket = this.#getOrCreateBucket(bucketId);

    if (bucket.blocked) {
      throw new Error(
        `Bucket ${bucketId} is currently blocked due to rate limit`,
      );
    }

    this.#refillBucket(bucket);

    if (bucket.tokens <= 0) {
      bucket.blocked = true;
      const waitTime = this.#calculateWaitTime(bucket);
      await this.#wait(waitTime);
      bucket.blocked = false;
      this.#refillBucket(bucket);
    }

    bucket.tokens--;
  }

  async acquireIdentify(shardId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.#identifyQueue.push({ shardId, resolve, reject });

      if (!this.#processingIdentify) {
        this.#processIdentifyQueue();
      }
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

  resetBucket(bucketId: string): void {
    const bucket = this.#getOrCreateBucket(bucketId);
    bucket.tokens = this.#maxTokens;
    bucket.lastRefill = Date.now();
    bucket.blocked = false;
  }

  resetAll(): void {
    this.#buckets.clear();
    this.#identifyQueue = [];
    this.#processingIdentify = false;
  }

  getStats(): RateLimitStats {
    return {
      buckets: this.#buckets.size,
      identifyQueueLength: this.#identifyQueue.length,
      isProcessingIdentify: this.#processingIdentify,
    };
  }

  async #processIdentifyQueue(): Promise<void> {
    if (this.#processingIdentify || this.#identifyQueue.length === 0) {
      return;
    }

    this.#processingIdentify = true;

    try {
      const batch = this.#identifyQueue.splice(
        0,
        this.#maxConcurrentIdentifies,
      );

      for (const { resolve } of batch) {
        resolve();
      }

      await this.#wait(this.#identifyInterval);
    } catch (error) {
      const current = this.#identifyQueue[0];
      if (current) {
        current.reject(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    } finally {
      this.#processingIdentify = false;

      if (this.#identifyQueue.length > 0) {
        await this.#processIdentifyQueue();
      }
    }
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

    if (timePassed >= this.#refillInterval) {
      const intervals = Math.floor(timePassed / this.#refillInterval);
      bucket.tokens = Math.min(
        this.#maxTokens,
        bucket.tokens + this.#maxTokens * intervals,
      );
      bucket.lastRefill = now - (timePassed % this.#refillInterval);
    }
  }

  #calculateWaitTime(bucket: RateLimitBucket): number {
    const now = Date.now();
    const timeSinceLastRefill = now - bucket.lastRefill;
    return Math.max(0, this.#refillInterval - timeSinceLastRefill);
  }

  #wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

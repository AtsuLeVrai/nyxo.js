import type { RestHttpDiscordHeaders } from "../types/index.js";

interface RateLimiterBucket {
    limit: number;
    remaining: number;
    reset: number;
    lastUpdated: number;
}

export class RateLimiterManager {
    readonly #buckets = new Map<string, RateLimiterBucket>();
    readonly #routeToBucket = new Map<string, string>();
    readonly #queues = new Map<string, Promise<void>>();
    readonly #cleanupInterval = 5 * 60 * 1000;

    constructor() {
        this.#startCleanupInterval();
    }

    async wait(route: string): Promise<void> {
        const bucketKey = this.#getBucketKey(route);
        const rateLimitInfo = this.#buckets.get(bucketKey);

        if (!rateLimitInfo) {
            return;
        }

        if (rateLimitInfo.remaining <= 0) {
            const now = Date.now();
            const timeToWait = rateLimitInfo.reset - now;

            if (timeToWait > 0) {
                const currentQueue = this.#queues.get(bucketKey) || Promise.resolve();
                const newQueue = currentQueue.then(() => this.#delay(timeToWait));

                this.#queues.set(bucketKey, newQueue);
                await newQueue;

                if (this.#queues.get(bucketKey) === newQueue) {
                    this.#queues.delete(bucketKey);
                }
            }
        }

        if (rateLimitInfo.remaining > 0) {
            rateLimitInfo.remaining--;
        }
    }

    update(route: string, headers: RestHttpDiscordHeaders): void {
        const bucketId = headers["x-ratelimit-bucket"];
        const limit = Number(headers["x-ratelimit-limit"]);
        const remaining = Number(headers["x-ratelimit-remaining"]);
        const reset = Number(headers["x-ratelimit-reset"]) * 1000;

        if (bucketId) {
            this.#routeToBucket.set(route, bucketId);

            this.#buckets.set(bucketId, {
                limit,
                remaining,
                reset,
                lastUpdated: Date.now(),
            });
        }
    }

    getRateLimitInfo(route: string): RateLimiterBucket | null {
        const bucketKey = this.#getBucketKey(route);
        return this.#buckets.get(bucketKey) || null;
    }

    isRateLimited(route: string): boolean {
        const info = this.getRateLimitInfo(route);
        if (!info) {
            return false;
        }

        return info.remaining <= 0 && Date.now() < info.reset;
    }

    getEstimatedTimeToReset(route: string): number {
        const info = this.getRateLimitInfo(route);
        if (!info) {
            return 0;
        }

        const timeToReset = info.reset - Date.now();
        return Math.max(0, timeToReset);
    }

    getBucketStats(): { totalBuckets: number; activeBuckets: number; queuedRequests: number } {
        const now = Date.now();
        const activeBuckets = Array.from(this.#buckets.values()).filter((bucket) => bucket.reset > now).length;

        return {
            totalBuckets: this.#buckets.size,
            activeBuckets,
            queuedRequests: this.#queues.size,
        };
    }

    #getBucketKey(route: string): string {
        return this.#routeToBucket.get(route) || route;
    }

    #delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    #startCleanupInterval(): void {
        setInterval(() => this.#cleanup(), this.#cleanupInterval);
    }

    #cleanup(): void {
        const now = Date.now();

        for (const [bucketId, bucket] of this.#buckets) {
            if (bucket.reset < now) {
                this.#buckets.delete(bucketId);
            }
        }

        for (const [route, bucketId] of this.#routeToBucket) {
            if (!this.#buckets.has(bucketId)) {
                this.#routeToBucket.delete(route);
            }
        }
    }
}

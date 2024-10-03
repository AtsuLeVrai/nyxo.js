import { setInterval } from "node:timers";

export type StoreOptions<K, V> = {
    /**
     * The interval (in milliseconds) to run the cleanup function.
     */
    cleanup_interval?: number;
    /**
     * The threshold to trigger the cleanup function.
     */
    cleanup_threshold?: number;
    /**
     * The time-to-live (in milliseconds) of the value.
     */
    default_ttl?: number;
    /**
     * Custom deserialization function for retrieving complex objects.
     */
    deserialize?(this: void, value: string): V;
    /**
     * The eviction strategy to use when the cache is full.
     */
    eviction_strategy?: "fifo" | "lfu" | "lru";
    /**
     * The maximum size of the cache.
     */
    max_size?: number;
    /**
     * The callback function to be called when an item is evicted from the cache.
     *
     * @param key - The key of the evicted item.
     * @param value - The value of the evicted item.
     */
    onEvict?(this: void, key: K, value: V): void;
    /**
     * Preload the cache with a map of key-value pairs.
     */
    preload?: Map<K, V>;
    /**
     * Custom serialization function for storing complex objects.
     */
    serialize?(this: void, value: V): string;
};

export type StoreStats = {
    /**
     * The number of cache hits.
     */
    hitCount: number;
    /**
     * The number of cache misses.
     */
    hitRatio: number;
    /**
     * The number of cache misses.
     */
    missCount: number;
    /**
     * The current size of the cache.
     */
    size: number;
    /**
     * The total number of items evicted from the cache.
     */
    totalItemsEvicted: number;
};

export class Store<K, V> {
    #hitCount = 0;

    #missCount = 0;

    #totalItemsEvicted = 0;

    #cache: Map<K, { expiry?: number; frequency: number; value: V }> = new Map();

    #cleanupInterval?: NodeJS.Timeout;

    readonly #lruOrder: K[] = [];

    readonly #options: Required<StoreOptions<K, V>>;

    public constructor(options: StoreOptions<K, V> = {}) {
        this.#options = {
            max_size: options.max_size ?? Number.POSITIVE_INFINITY,
            default_ttl: options.default_ttl ?? 0,
            onEvict: options.onEvict ?? (() => {}),
            serialize: options.serialize ?? JSON.stringify,
            deserialize: options.deserialize ?? JSON.parse,
            preload: options.preload ?? new Map(),
            cleanup_interval: options.cleanup_interval ?? 0,
            eviction_strategy: options.eviction_strategy ?? "lru",
            cleanup_threshold: options.cleanup_threshold ?? 0.1,
        };
        this.#preloadData();
        this.#setupAutomaticCleanup();
    }

    public get(key: K): V | undefined {
        const item = this.#cache.get(key);
        if (!item) {
            this.#missCount++;
            return undefined;
        }

        if (this.#isExpired(item)) {
            this.delete(key);
            this.#missCount++;
            return undefined;
        }

        this.#hitCount++;
        item.frequency++;
        this.#updateOrder(key);
        return item.value;
    }

    public set(key: K, value: V, ttl: number = this.#options.default_ttl): void {
        this.#validateValue(value);

        const serializedValue = this.#options.serialize(value);
        const item = {
            value: this.#options.deserialize(serializedValue),
            expiry: ttl ? Date.now() + ttl : undefined,
            frequency: 0,
        };

        if (this.#cache.has(key)) {
            this.#cache.set(key, item);
            this.#updateOrder(key);
        } else {
            if (this.#lruOrder.length >= this.#options.max_size) {
                this.#evict();
            }

            this.#cache.set(key, item);
            this.#lruOrder.push(key);
        }

        if (this.size() / this.#options.max_size >= this.#options.cleanup_threshold) {
            this.cleanup();
        }
    }

    public delete(key: K): boolean {
        const deleted = this.#cache.delete(key);
        if (deleted) {
            const index = this.#lruOrder.indexOf(key);
            if (index > -1) {
                this.#lruOrder.splice(index, 1);
            }
        }

        return deleted;
    }

    public clear(): void {
        this.#lruOrder.length = 0;
        this.#cache.clear();
    }

    public size(): number {
        return this.#lruOrder.length;
    }

    public keys(): K[] {
        return [...this.#lruOrder];
    }

    public values(): V[] {
        return this.#lruOrder.map((key) => this.#cache.get(key)!.value);
    }

    public entries(): [K, V][] {
        return this.#lruOrder.map((key) => [key, this.#cache.get(key)!.value]);
    }

    public has(key: K): boolean {
        return this.#cache.has(key);
    }

    public forEach(callback: (value: V, key: K, store: this) => void): void {
        for (const [key, value] of this.entries()) {
            callback(value, key, this);
        }
    }

    public getStats(): StoreStats {
        const totalRequests = this.#hitCount + this.#missCount;
        const hitRatio = totalRequests > 0 ? this.#hitCount / totalRequests : 0;
        return {
            size: this.size(),
            hitCount: this.#hitCount,
            missCount: this.#missCount,
            hitRatio,
            totalItemsEvicted: this.#totalItemsEvicted,
        };
    }

    public setMaxSize(newMaxSize: number): void {
        if (newMaxSize < 0) {
            throw new Error("Max size must be a non-negative number");
        }

        this.#options.max_size = newMaxSize;
        while (this.size() > newMaxSize) {
            this.#evictLeastUsed();
        }
    }

    public cleanup(): number {
        let removedCount = 0;
        for (const [key, item] of this.#cache) {
            if (this.#isExpired(item)) {
                this.delete(key);
                removedCount++;
            }
        }

        return removedCount;
    }

    public bulkSet(entries: [K, V][], ttl?: number): void {
        for (const [key, value] of entries) {
            this.set(key, value, ttl);
        }
    }

    #updateOrder(key: K): void {
        if (this.#options.eviction_strategy === "lru") {
            const index = this.#lruOrder.indexOf(key);
            if (index > -1) {
                this.#lruOrder.splice(index, 1);
            }

            this.#lruOrder.push(key);
        }
    }

    #evict(): void {
        if (this.#lruOrder.length === 0) return;

        let keyToEvict: K;
        switch (this.#options.eviction_strategy) {
            case "lru":
                keyToEvict = this.#lruOrder.shift()!;
                break;
            case "lfu":
                keyToEvict = this.#getLeastFrequentlyUsedKey();
                break;
            case "fifo":
                keyToEvict = this.#lruOrder.shift()!;
                break;
            default:
                keyToEvict = this.#lruOrder.shift()!;
        }

        const evictedItem = this.#cache.get(keyToEvict);
        this.#cache.delete(keyToEvict);
        this.#totalItemsEvicted++;

        if (evictedItem) {
            try {
                this.#options.onEvict(keyToEvict, evictedItem.value);
            } catch (error) {
                console.error("Eviction callback error:", error);
            }
        }
    }

    #getLeastFrequentlyUsedKey(): K {
        let leastFrequent: K | undefined;
        let minFrequency = Number.POSITIVE_INFINITY;

        for (const [key, item] of this.#cache) {
            if (item.frequency < minFrequency) {
                minFrequency = item.frequency;
                leastFrequent = key;
            }
        }

        return leastFrequent!;
    }

    #preloadData(): void {
        for (const [key, value] of this.#options.preload) {
            this.set(key, value);
        }
    }

    #setupAutomaticCleanup(): void {
        if (this.#options.cleanup_interval > 0) {
            this.#cleanupInterval = setInterval(() => {
                this.cleanup();
            }, this.#options.cleanup_interval);
        }
    }

    #validateValue(value: V): void {
        if (value === undefined || value === null) {
            throw new Error(`[Store] Invalid value: ${value}`);
        }
    }

    #isExpired(item: { expiry?: number }): boolean {
        return item.expiry !== undefined && Date.now() > item.expiry;
    }

    #evictLeastUsed(): void {
        if (this.#lruOrder.length === 0) return;

        const leastUsed = this.#lruOrder.shift()!;
        const evictedItem = this.#cache.get(leastUsed);
        this.#cache.delete(leastUsed);

        if (evictedItem) {
            try {
                this.#options.onEvict(leastUsed, evictedItem.value);
            } catch (error) {
                console.error("Eviction callback error:", error);
            }
        }
    }
}

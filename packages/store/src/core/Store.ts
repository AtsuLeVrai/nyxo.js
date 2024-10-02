export type StoreOptions = {
    /**
     * The time-to-live (in milliseconds) of the value.
     */
    default_ttl?: number;
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
    onEvict?(this: void, key: any, value: any): void;
};

export class Store<K, V> {
    #cache: Map<K, { expiry?: number; value: V }> = new Map();

    readonly #lruOrder: K[] = [];

    readonly #options: Readonly<Required<StoreOptions>>;

    public constructor(options: StoreOptions = {}) {
        this.#options = Object.freeze({
            max_size: options.max_size ?? Number.POSITIVE_INFINITY,
            default_ttl: options.default_ttl ?? 0,
            onEvict: options.onEvict ?? (() => {}),
        });
    }

    public get(key: K): V | undefined {
        const item = this.#cache.get(key);
        if (!item) return undefined;

        if (this.isExpired(item)) {
            this.delete(key);
            return undefined;
        }

        this.updateLRUOrder(key);
        return item.value;
    }

    public set(key: K, value: V, ttl: number = this.#options.default_ttl): void {
        this.validateValue(value);

        const item = { value, expiry: ttl ? Date.now() + ttl : undefined };

        if (this.#cache.has(key)) {
            this.#cache.set(key, item);
            this.updateLRUOrder(key);
        } else {
            if (this.#lruOrder.length >= this.#options.max_size) {
                this.evictLeastUsed();
            }

            this.#cache.set(key, item);
            this.#lruOrder.push(key);
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
        this.#cache = new Map();
    }

    public size(): number {
        return this.#lruOrder.length;
    }

    public keys(): K[] {
        return this.#lruOrder.slice();
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

    private validateValue(value: V): void {
        if (value === undefined) {
            throw new Error(`[Store] Invalid value: ${value}`);
        }
    }

    private isExpired(item: { expiry?: number }): boolean {
        return item.expiry !== undefined && Date.now() > item.expiry;
    }

    private updateLRUOrder(key: K): void {
        const index = this.#lruOrder.indexOf(key);
        if (index > -1) {
            this.#lruOrder.splice(index, 1);
        }

        this.#lruOrder.push(key);
    }

    private evictLeastUsed(): void {
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

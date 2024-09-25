import type { StoreOptions } from "../types";
import { StoreErrorCode } from "../types";
import { StoreError } from "./StoreError";

const cache = Symbol("cache");
const lruOrder = Symbol("lruOrder");
const options = Symbol("options");

export class Store<K, V> {
    public [Symbol.toStringTag]: string = "Store";

    private [cache]: Map<K, { expiry?: number; value: V }>;

    private readonly [lruOrder]: K[];

    private readonly [options]: Required<StoreOptions>;

    public constructor(initialOptions: StoreOptions = {}) {
        this[cache] = new Map();
        this[lruOrder] = [];
        this[options] = {
            max_size: initialOptions.max_size ?? Infinity,
            default_ttl: initialOptions.default_ttl ?? 0,
            onEvict: initialOptions.onEvict ?? (() => {}),
        };
        Object.freeze(this[options]);
    }

    public get(key: K): V | undefined {
        const item = this[cache].get(key);
        if (!item) return undefined;

        if (this.isExpired(item)) {
            this.delete(key);
            return undefined;
        }

        this.updateLRUOrder(key);
        return item.value;
    }

    public set(key: K, value: V, ttl: number = this[options].default_ttl): void {
        this.validateValue(value);

        const item = { value, expiry: ttl ? Date.now() + ttl : undefined };

        if (this[cache].has(key)) {
            this[cache].set(key, item);
            this.updateLRUOrder(key);
        } else {
            if (this[lruOrder].length >= this[options].max_size) {
                this.evictLeastUsed();
            }

            this[cache].set(key, item);
            this[lruOrder].push(key);
        }
    }

    public delete(key: K): boolean {
        const deleted = this[cache].delete(key);
        if (deleted) {
            const index = this[lruOrder].indexOf(key);
            if (index > -1) {
                this[lruOrder].splice(index, 1);
            }
        }

        return deleted;
    }

    public clear(): void {
        this[lruOrder].length = 0;
        this[cache] = new Map();
    }

    public size(): number {
        return this[lruOrder].length;
    }

    public keys(): K[] {
        return this[lruOrder].slice();
    }

    public values(): V[] {
        return this[lruOrder].map((key) => this[cache].get(key)!.value);
    }

    public entries(): [K, V][] {
        return this[lruOrder].map((key) => [key, this[cache].get(key)!.value]);
    }

    public has(key: K): boolean {
        return this[cache].has(key);
    }

    public [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries()[Symbol.iterator]();
    }

    public forEach(callback: (value: V, key: K, store: this) => void): void {
        for (const [key, value] of this.entries()) {
            callback(value, key, this);
        }
    }

    private validateValue(value: V): void {
        if (value === undefined) {
            throw new StoreError("Invalid value: cannot be undefined", StoreErrorCode.InvalidValue);
        }
    }

    private isExpired(item: { expiry?: number }): boolean {
        return item.expiry !== undefined && Date.now() > item.expiry;
    }

    private updateLRUOrder(key: K): void {
        const index = this[lruOrder].indexOf(key);
        if (index > -1) {
            this[lruOrder].splice(index, 1);
        }

        this[lruOrder].push(key);
    }

    private evictLeastUsed(): void {
        if (this[lruOrder].length === 0) return;

        const leastUsed = this[lruOrder].shift()!;
        const evictedItem = this[cache].get(leastUsed);
        this[cache].delete(leastUsed);

        if (evictedItem) {
            try {
                this[options].onEvict(leastUsed, evictedItem.value);
            } catch (error) {
                console.error("Eviction callback error:", error);
            }
        }
    }
}

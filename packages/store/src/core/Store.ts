import type { StoreOptions, StoreSetOptions } from "../types";
import { StoreError } from "./StoreError";

export class Store<K, V> {
    private lruOrder: K[];

    private readonly cache: Map<K, { expiry?: number; value: V }>;

    private readonly maxSize?: number;

    private readonly defaultTTL?: number;

    private readonly onEvict?: (key: K, value: V) => void;

    public constructor(private options: StoreOptions = {}) {
        this.lruOrder = [];
        this.cache = new Map();
        this.maxSize = options.max_size;
        this.defaultTTL = options.default_ttL;
        this.onEvict = options.onEvict;
    }

    public get(key: K): V {
        if (key === undefined || key === null) {
            throw StoreError.invalidKey(key);
        }

        const item = this.cache.get(key);
        if (!item) {
            throw StoreError.keyNotFound(key);
        }

        if (item.expiry && Date.now() > item.expiry) {
            this.delete(key);
            throw StoreError.expiredKey(key);
        }

        this.updateLRUOrder(key);
        return item.value;
    }

    public set(key: K, value: V, options?: StoreSetOptions): void {
        if (key === undefined || key === null) {
            throw StoreError.invalidKey(key);
        }

        if (value === undefined) {
            throw StoreError.invalidValue(value);
        }

        const item: { expiry?: number; value: V } = { value };

        const ttl = options?.ttl ?? this.defaultTTL;
        if (ttl !== undefined) {
            if (typeof ttl !== "number" || ttl < 0) {
                throw StoreError.invalidTTL(ttl);
            }

            item.expiry = Date.now() + ttl;
        }

        if (this.maxSize && this.cache.size >= this.maxSize && !this.cache.has(key)) {
            throw StoreError.storeFull();
        }

        this.cache.set(key, item);
        this.updateLRUOrder(key);
        this.ensureMaxSize();
    }

    public add(key: K, value: V, options?: StoreSetOptions): boolean {
        if (this.has(key)) {
            return false;
        }

        this.set(key, value, options);
        return true;
    }

    public memoize<T extends (...args: any[]) => any>(fn: T, options?: StoreSetOptions): T {
        return ((...args: Parameters<T>) => {
            let key: K;
            try {
                key = JSON.stringify(args) as K;
            } catch {
                throw StoreError.serializationError(args);
            }

            if (this.has(key)) {
                return this.get(key) as ReturnType<T>;
            }

            const result = fn(...args);
            this.set(key, result as V, options);
            return result;
        }) as T;
    }

    public clear(): void {
        this.cache.clear();
        this.lruOrder = [];
    }

    public has(key: K): boolean {
        return this.cache.has(key);
    }

    public delete(key: K): boolean {
        if (key === undefined || key === null) {
            throw StoreError.invalidKey(key);
        }

        const deleted = this.cache.delete(key);
        const index = this.lruOrder.indexOf(key);
        if (index > -1) {
            this.lruOrder.splice(index, 1);
        }

        return deleted;
    }

    public size(): number {
        return this.cache.size;
    }

    public keys(): K[] {
        return Array.from(this.cache.keys());
    }

    public values(): V[] {
        return Array.from(this.cache.values()).map((item) => item.value);
    }

    public entries(): [K, V][] {
        return Array.from(this.cache.entries()).map(([key, item]) => [key, item.value]);
    }

    public cleanExpired(): void {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (item.expiry && now > item.expiry) {
                this.delete(key);
            }
        }
    }

    public updateIfExists(key: K, updateFunction: (oldValue: V) => V): boolean {
        if (this.has(key)) {
            const oldValue = this.get(key)!;
            const newValue = updateFunction(oldValue);
            this.set(key, newValue);
            return true;
        }

        return false;
    }

    public setMany(entries: [K, V][]): void {
        for (const [key, value] of entries) this.set(key, value);
    }

    public getMany(keys: K[]): (V | undefined)[] {
        return keys.map((key) => this.get(key));
    }

    public clearExpired(): number {
        let count = 0;
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (item.expiry && now > item.expiry) {
                this.delete(key);
                count++;
            }
        }

        return count;
    }

    public prune(shouldDelete: (key: K, value: V) => boolean): number {
        let count = 0;
        for (const [key, item] of this.cache.entries()) {
            try {
                if (shouldDelete(key, item.value)) {
                    this.delete(key);
                    count++;
                }
            } catch (error) {
                throw StoreError.operationFailed("prune", error instanceof Error ? error.message : String(error));
            }
        }

        return count;
    }

    public toJSON(): Record<string, V> {
        const obj: Record<string, V> = {};
        for (const [key, item] of this.cache.entries()) {
            obj[String(key)] = item.value;
        }

        return obj;
    }

    public getCacheStats(): {
        lruOrderLength: number;
        maxSize: number;
        size: number;
    } {
        return {
            size: this.cache.size,
            maxSize: this.maxSize ?? 0,
            lruOrderLength: this.lruOrder.length,
        };
    }

    public map<T>(transform: (value: V, key: K) => T): Store<K, T> {
        const newStore = new Store<K, T>(this.options);
        for (const [key, item] of this.cache.entries()) {
            const transformedValue = transform(item.value, key);
            newStore.set(key, transformedValue, { ttl: item.expiry ? item.expiry - Date.now() : undefined });
        }

        return newStore;
    }

    public forEach(callback: (value: V, key: K) => void): void {
        for (const [key, item] of this.cache.entries()) {
            callback(item.value, key);
        }
    }

    public filter(predicate: (value: V, key: K) => boolean): Store<K, V> {
        const newStore = new Store<K, V>(this.options);
        for (const [key, item] of this.cache.entries()) {
            if (predicate(item.value, key)) {
                newStore.set(key, item.value, { ttl: item.expiry ? item.expiry - Date.now() : undefined });
            }
        }

        return newStore;
    }

    public reduce<T>(reducer: (accumulator: T, value: V, key: K) => T, initialValue: T): T {
        let accumulator = initialValue;
        for (const [key, item] of this.cache.entries()) {
            accumulator = reducer(accumulator, item.value, key);
        }

        return accumulator;
    }

    private ensureMaxSize(): void {
        if (!this.maxSize) return;

        while (this.cache.size > this.maxSize) {
            const leastUsed = this.lruOrder.shift();
            if (leastUsed) {
                const evictedItem = this.cache.get(leastUsed);
                this.cache.delete(leastUsed);
                if (this.onEvict && evictedItem) {
                    try {
                        this.onEvict(leastUsed, evictedItem.value);
                    } catch (error) {
                        throw StoreError.operationFailed(
                            "onEvict",
                            error instanceof Error ? error.message : String(error)
                        );
                    }
                }
            }
        }

        if (this.cache.size > this.maxSize) {
            throw StoreError.maxSizeExceeded(this.cache.size, this.maxSize);
        }
    }

    private updateLRUOrder(key: K): void {
        const index = this.lruOrder.indexOf(key);
        if (index > -1) {
            this.lruOrder.splice(index, 1);
        }

        this.lruOrder.push(key);
    }
}

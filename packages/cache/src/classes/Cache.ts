import { clearInterval, setInterval } from "node:timers";
import type { CacheOptions } from "../types/types";
import { Node } from "./Node";

/**
 * A cache that supports time-to-live (TTL) and capacity limits.
 * Uses a Least Recently Used (LRU) eviction policy.
 *
 * @template K - The type of the keys.
 * @template V - The type of the values.
 * @example
 * const cache = new Cache<string, number>({ capacity: 100, ttl: 60000 });
 * cache.set("key", 42);
 * const value = cache.get("key"); // 42
 */
export class Cache<K, V> {
    /**
     * The internal map that holds the cache items.
     */
    private map: Map<K, Node<K, V>> = new Map();

    /**
     * The head of the doubly linked list.
     */
    private head: Node<K, V> | null = null;

    /**
     * The tail of the doubly linked list.
     */
    private tail: Node<K, V> | null = null;

    /**
     * The timer used to evict expired items from the cache.
     */
    private timer: NodeJS.Timeout | null = null;

    /**
     * Creates a new Cache.
     *
     * @param options - The options for configuring the cache.
     */
    public constructor(private options: CacheOptions = {}) {
        this.startCleanupTimer();
    }

    /**
     * Sets the capacity of the cache.
     * If the new capacity is less than the current size of the cache,
     * the least recently used items will be evicted.
     *
     * @param capacity - The maximum number of items the cache can hold.
     */
    public setCapacity(capacity: number): void {
        if (this.options) {
            this.options.capacity = capacity;
            this.enforceCapacity();
        }
    }

    /**
     * Sets the time-to-live (TTL) for items in the cache.
     * This does not affect items already in the cache.
     *
     * @param ttl - The TTL in milliseconds.
     */
    public setTTL(ttl: number): void {
        if (this.options) {
            this.options.ttl = ttl;
        }
    }

    /**
     * Adds or updates an item in the cache.
     * If the key already exists, its value is updated and the item becomes the most recently used.
     * If the cache has reached its maximum capacity, the least recently used item is evicted.
     *
     * @param key - The key associated with the item.
     * @param value - The value associated with the item.
     */
    public set(key: K, value: V): void {
        const now = Date.now();
        if (this.map.has(key)) {
            const existingItem = this.map.get(key)!;
            this.remove(existingItem);
        } else if (this.options.capacity !== undefined && this.map.size >= this.options.capacity) {
            this.evict();
        }

        const newItem = new Node(key, value, now);
        this.setHead(newItem);
        this.map.set(key, newItem);
        this.enforceCapacity();
    }

    /**
     * Retrieves an item from the cache.
     * If the item exists and is not expired, it becomes the most recently used.
     *
     * @param key - The key associated with the item.
     * @returns The value associated with the key, or undefined if the key is not found or the item is expired.
     */
    public get(key: K): V | undefined {
        const item = this.map.get(key);
        if (item) {
            if (this.isExpired(item)) {
                this.delete(key);
                return undefined;
            } else {
                this.refresh(item);
                return item.value;
            }
        }

        return undefined;
    }

    /**
     * Deletes an item from the cache.
     * If an onEvict callback is defined in the options, it will be called.
     *
     * @param key - The key associated with the item.
     */
    public delete(key: K): void {
        const item = this.map.get(key);
        if (item) {
            this.remove(item);
            this.map.delete(key);
            if (this.options.onEvict) {
                this.options.onEvict(key, item.value);
            }
        }
    }

    /**
     * Clears all items from the cache.
     */
    public clear(): void {
        this.map.clear();
        this.head = null;
        this.tail = null;
    }

    /**
     * Returns the number of items in the cache.
     *
     * @returns The number of items in the cache.
     */
    public size(): number {
        return this.map.size;
    }

    /**
     * Returns an array of all keys in the cache.
     *
     * @returns An array containing all keys in the cache.
     */
    public keys(): K[] {
        return Array.from(this.map.keys());
    }

    /**
     * Returns an array of all values in the cache.
     *
     * @returns An array containing all values in the cache.
     */
    public values(): V[] {
        return Array.from(this.map.values()).map((node) => node.value);
    }

    /**
     * Checks if a key exists in the cache.
     *
     * @param key - The key to check.
     * @returns true if the key exists in the cache, false otherwise.
     */
    public has(key: K): boolean {
        return this.map.has(key);
    }

    /**
     * Removes a node from the doubly linked list.
     *
     * @param item - The node to remove.
     */
    private remove(item: Node<K, V>): void {
        // ... (rest of the code remains unchanged)
    }

    /**
     * Sets a node as the head of the doubly linked list.
     *
     * @param item - The node to set as the head.
     */
    private setHead(item: Node<K, V>): void {
        // ... (rest of the code remains unchanged)
    }

    /**
     * Evicts the least recently used item from the cache.
     */
    private evict(): void {
        if (this.tail) {
            this.delete(this.tail.key);
        }
    }

    /**
     * Checks if an item is expired based on the TTL.
     *
     * @param item - The item to check.
     * @returns true if the item is expired, false otherwise.
     */
    private isExpired(item: Node<K, V>): boolean {
        return this.options.ttl !== undefined && Date.now() - item.timestamp > this.options.ttl;
    }

    /**
     * Refreshes an item by moving it to the head of the list and updating its timestamp.
     *
     * @param item - The item to refresh.
     */
    private refresh(item: Node<K, V>): void {
        this.remove(item);
        this.setHead(item);
        item.timestamp = Date.now();
    }

    /**
     * Enforces the capacity limit by evicting items if necessary.
     */
    private enforceCapacity(): void {
        if (this.options.capacity !== undefined) {
            while (this.map.size > this.options.capacity) {
                this.evict();
            }
        }
    }

    /**
     * Starts the timer that cleans up expired items from the cache.
     */
    private startCleanupTimer(): void {
        if (this.timer) {
            clearInterval(this.timer);
        }

        if (this.options.ttl) {
            this.timer = setInterval(() => this.cleanupExpiredItems(), this.options.ttl);
        }
    }

    /**
     * Removes all expired items from the cache.
     */
    private cleanupExpiredItems(): void {
        const now = Date.now();
        for (const [key, item] of this.map) {
            if (now - item.timestamp > (this.options.ttl ?? 0)) {
                this.delete(key);
            }
        }
    }
}

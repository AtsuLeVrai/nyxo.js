import { clearInterval, setInterval } from "node:timers";
import type { StoreOptions } from "../types/types";
import { Node } from "./Node";

/**
 * A store that supports time-to-live (TTL) and capacity limits.
 * Uses a Least Recently Used (LRU) eviction policy.
 *
 * @template K - The type of the keys.
 * @template V - The type of the values.
 * @example
 * const store = new Store<string, number>({ capacity: 100, ttl: 60000 });
 * store.set("key", 42);
 * const value = store.get("key"); // 42
 */
export class Store<K, V> {
    /**
     * The internal map that holds the store items.
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
     * The timer used to evict expired items from the store.
     */
    private timer: NodeJS.Timeout | null = null;

    /**
     * Creates a new Store.
     *
     * @param options - The options for configuring the store.
     */
    public constructor(private options: StoreOptions = {}) {
        this.startCleanupTimer();
    }

    /**
     * Sets the capacity of the store.
     * If the new capacity is less than the current size of the store,
     * the least recently used items will be evicted.
     *
     * @param capacity - The maximum number of items the store can hold.
     */
    public setCapacity(capacity: number): void {
        if (this.options) {
            this.options.capacity = capacity;
            this.enforceCapacity();
        }
    }

    /**
     * Sets the time-to-live (TTL) for items in the store.
     * This does not affect items already in the store.
     *
     * @param ttl - The TTL in milliseconds.
     */
    public setTTL(ttl: number): void {
        if (this.options) {
            this.options.ttl = ttl;
        }
    }

    /**
     * Adds an item to the store only if the key doesn't already exist.
     * If the store has reached its maximum capacity, the least recently used item is evicted.
     *
     * @param key - The key associated with the item.
     * @param value - The value associated with the item.
     * @returns true if the item was added successfully, false if the key already exists.
     */
    public add(key: K, value: V): boolean {
        if (this.map.has(key)) {
            return false;
        }

        const now = Date.now();
        if (this.options.capacity !== undefined && this.map.size >= this.options.capacity) {
            this.evict();
        }

        const newItem = new Node(key, value, now);
        this.setHead(newItem);
        this.map.set(key, newItem);
        this.enforceCapacity();
        return true;
    }

    /**
     * Adds or updates an item in the store.
     * If the key already exists, its value is updated and the item becomes the most recently used.
     * If the store has reached its maximum capacity, the least recently used item is evicted.
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
     * Retrieves an item from the store.
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
     * Deletes an item from the store.
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
     * Clears all items from the store.
     */
    public clear(): void {
        this.map.clear();
        this.head = null;
        this.tail = null;
    }

    /**
     * Returns the number of items in the store.
     *
     * @returns The number of items in the store.
     */
    public size(): number {
        return this.map.size;
    }

    /**
     * Returns an array of all keys in the store.
     *
     * @returns An array containing all keys in the store.
     */
    public keys(): K[] {
        return Array.from(this.map.keys());
    }

    /**
     * Returns an array of all values in the store.
     *
     * @returns An array containing all values in the store.
     */
    public values(): V[] {
        return Array.from(this.map.values()).map((node) => node.value);
    }

    /**
     * Checks if a key exists in the store.
     *
     * @param key - The key to check.
     * @returns true if the key exists in the store, false otherwise.
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
        if (item.prev) {
            item.prev.next = item.next;
        }

        if (item.next) {
            item.next.prev = item.prev;
        }

        if (this.head === item) {
            this.head = item.next;
        }

        if (this.tail === item) {
            this.tail = item.prev;
        }
    }

    /**
     * Sets a node as the head of the doubly linked list.
     *
     * @param item - The node to set as the head.
     */
    private setHead(item: Node<K, V>): void {
        item.next = this.head;
        item.prev = null;
        if (this.head) {
            this.head.prev = item;
        }

        this.head = item;
        if (!this.tail) {
            this.tail = item;
        }
    }

    /**
     * Evicts the least recently used item from the store.
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
     * Starts the timer that cleans up expired items from the store.
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
     * Removes all expired items from the store.
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

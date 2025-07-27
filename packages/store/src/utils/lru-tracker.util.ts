import { LruNode } from "./lru-node.util.js";

/**
 * High-performance LRU cache tracker with O(1) operations.
 * Combines HashMap for lookups with doubly-linked list for ordering.
 *
 * @typeParam K - Key type to track
 *
 * @example
 * ```typescript
 * const tracker = new LruTracker<string>(100);
 *
 * const evicted = tracker.touch("key1"); // null
 * const exists = tracker.has("key1"); // true
 * const lru = tracker.lru; // "key1"
 * ```
 *
 * @public
 */
export class LruTracker<K extends PropertyKey> {
  /**
   * Maximum items before eviction occurs.
   * Immutable after construction.
   *
   * @readonly
   * @public
   */
  readonly capacity: number;

  /**
   * HashMap providing O(1) key-to-node lookup.
   * @internal
   */
  #cache = new Map<K, LruNode<K>>();

  /**
   * Most recently used node pointer.
   * @internal
   */
  #head: LruNode<K> | null = null;

  /**
   * Least recently used node pointer.
   * @internal
   */
  #tail: LruNode<K> | null = null;

  /**
   * Creates new LRU tracker with specified capacity.
   *
   * @param capacity - Maximum items to track (minimum 1)
   *
   * @example
   * ```typescript
   * const tracker = new LruTracker<string>(100);
   * const minTracker = new LruTracker<string>(1);
   * ```
   *
   * @see {@link touch} - For adding and accessing items
   *
   * @public
   */
  constructor(capacity: number) {
    this.capacity = Math.max(1, capacity);
  }

  /**
   * Current number of tracked items.
   *
   * @public
   */
  get size(): number {
    return this.#cache.size;
  }

  /**
   * Least recently used key.
   * Prime candidate for eviction.
   *
   * @public
   */
  get lru(): K | null {
    return this.#tail?.key ?? null;
  }

  /**
   * Most recently used key.
   * Represents hottest item in cache.
   *
   * @public
   */
  get mru(): K | null {
    return this.#head?.key ?? null;
  }

  /**
   * Updates access time, promoting key to MRU position.
   * Adds new keys or moves existing keys to front.
   *
   * @param key - Key to mark as accessed or add
   * @returns Evicted key if capacity exceeded, null otherwise
   *
   * @example
   * ```typescript
   * const evicted = tracker.touch("new-key"); // null
   * tracker.touch("existing-key"); // null (move to front)
   * const evictedKey = tracker.touch("another-key"); // "oldest-key"
   * ```
   *
   * @see {@link has} - For non-destructive checking
   *
   * @public
   */
  touch(key: K): K | null {
    const node = this.#cache.get(key);

    if (node) {
      this.#removeNode(node);
      this.#addToFront(node);
      return null;
    }

    const newNode = new LruNode<K>(key);
    this.#addToFront(newNode);
    this.#cache.set(key, newNode);

    if (this.#cache.size > this.capacity) {
      return this.#evictLru();
    }

    return null;
  }

  /**
   * Checks key existence without affecting LRU position.
   *
   * @param key - Key to check
   * @returns True if key exists
   *
   * @example
   * ```typescript
   * console.log(tracker.has("nonexistent")); // false
   * tracker.touch("key1");
   * console.log(tracker.has("key1")); // true
   * ```
   *
   * @see {@link touch} - For accessing items (modifies order)
   *
   * @public
   */
  has(key: K): boolean {
    return this.#cache.has(key);
  }

  /**
   * Removes specific key with comprehensive cleanup.
   *
   * @param key - Key to remove
   * @returns True if key was found and removed
   *
   * @example
   * ```typescript
   * tracker.touch("key1");
   * const removed = tracker.delete("key1"); // true
   * const notRemoved = tracker.delete("nonexistent"); // false
   * ```
   *
   * @see {@link clear} - For removing all items
   *
   * @public
   */
  delete(key: K): boolean {
    const node = this.#cache.get(key);
    if (node) {
      this.#removeNode(node);
      this.#cache.delete(key);
      node.dispose();
      return true;
    }

    return false;
  }

  /**
   * Removes all items with memory cleanup.
   *
   * @example
   * ```typescript
   * tracker.touch("key1");
   * tracker.touch("key2");
   * tracker.clear();
   * console.log(tracker.size); // 0
   * ```
   *
   * @see {@link delete} - For removing individual items
   *
   * @public
   */
  clear(): void {
    for (const node of this.#cache.values()) {
      node.dispose();
    }

    this.#cache.clear();
    this.#head = null;
    this.#tail = null;
  }

  /**
   * Returns keys ordered from MRU to LRU.
   *
   * @returns Array of keys from most to least recently used
   *
   * @example
   * ```typescript
   * tracker.touch("first");
   * tracker.touch("second");
   * tracker.touch("third");
   * console.log(tracker.keys()); // ["third", "second", "first"]
   * ```
   *
   * @see {@link keysReverse} - For LRU to MRU ordering
   *
   * @public
   */
  keys(): K[] {
    const result: K[] = [];
    let current = this.#head;

    while (current) {
      result.push(current.key);
      current = current.next;
    }

    return result;
  }

  /**
   * Returns keys ordered from LRU to MRU.
   *
   * @returns Array of keys from least to most recently used
   *
   * @example
   * ```typescript
   * tracker.touch("first");
   * tracker.touch("second");
   * console.log(tracker.keysReverse()); // ["first", "second"]
   * ```
   *
   * @see {@link keys} - For MRU to LRU ordering
   *
   * @public
   */
  keysReverse(): K[] {
    const result: K[] = [];
    let current = this.#tail;

    while (current) {
      result.push(current.key);
      current = current.prev;
    }

    return result;
  }

  /**
   * Returns entries as key-node pairs for debugging.
   * Node instances should not be modified directly.
   *
   * @returns Array of [key, LruNode] pairs
   *
   * @example
   * ```typescript
   * const entries = tracker.entries();
   * for (const [key, node] of entries) {
   *   console.log(`Key: ${key}, has prev: ${node.prev !== null}`);
   * }
   * ```
   *
   * @see {@link keys} - For keys without node access
   *
   * @public
   */
  entries(): [K, LruNode<K>][] {
    return [...this.#cache.entries()];
  }

  /**
   * Evicts least recently used item.
   * @internal
   */
  #evictLru(): K | null {
    if (this.#tail) {
      const key = this.#tail.key;
      const node = this.#tail;

      this.#removeNode(node);
      this.#cache.delete(key);
      node.dispose();

      return key;
    }

    return null;
  }

  /**
   * Adds node to front of list (MRU position).
   * @internal
   */
  #addToFront(node: LruNode<K>): void {
    node.prev = null;
    node.next = this.#head;

    if (this.#head) {
      this.#head.prev = node;
    }

    this.#head = node;

    if (!this.#tail) {
      this.#tail = node;
    }
  }

  /**
   * Removes node from list maintaining integrity.
   * @internal
   */
  #removeNode(node: LruNode<K>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.#head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.#tail = node.prev;
    }

    node.prev = null;
    node.next = null;
  }
}

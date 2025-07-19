import { LruNode } from "./lru-node.util.js";

/**
 * High-performance Least Recently Used (LRU) cache tracker with O(1) operations.
 *
 * Implements a sophisticated LRU algorithm using a hybrid data structure that
 * combines a HashMap for fast key lookups with a doubly-linked list for efficient
 * ordering and eviction.
 *
 * @typeParam K - The type of keys to be tracked, must extend StoreKey
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
   * Maximum number of items this tracker can hold before eviction occurs.
   * Immutable after construction for consistency.
   *
   * @readonly
   * @minimum 1
   * @public
   */
  readonly capacity: number;

  /**
   * Internal HashMap providing O(1) key-to-node lookup functionality.
   * Maintains mapping between keys and their corresponding LruNode instances.
   *
   * @internal
   */
  #cache = new Map<K, LruNode<K>>();

  /**
   * Head pointer to the most recently used (MRU) node in the doubly-linked list.
   * Points to null when the cache is empty.
   *
   * @internal
   */
  #head: LruNode<K> | null = null;

  /**
   * Tail pointer to the least recently used (LRU) node in the doubly-linked list.
   * Target for eviction when capacity is exceeded.
   *
   * @internal
   */
  #tail: LruNode<K> | null = null;

  /**
   * Creates a new LRU tracker with the specified capacity.
   *
   * @param capacity - Maximum number of items the tracker can hold. Must be at least 1.
   *
   * @example
   * ```typescript
   * const tracker = new LruTracker<string>(100);
   * const minTracker = new LruTracker<string>(1);
   * ```
   *
   * @see {@link touch} - For adding and accessing items in the tracker
   *
   * @public
   */
  constructor(capacity: number) {
    this.capacity = Math.max(1, capacity);
  }

  /**
   * Returns the current number of items being tracked in the cache.
   *
   * @returns Current number of items in the cache (0 to capacity)
   *
   * @public
   */
  get size(): number {
    return this.#cache.size;
  }

  /**
   * Returns the least recently used key without modifying the access order.
   *
   * This key is the prime candidate for eviction when the cache reaches capacity.
   *
   * @returns The least recently used key, or null if the cache is empty
   *
   * @see {@link mru} - For getting the most recently used key
   *
   * @public
   */
  get lru(): K | null {
    return this.#tail?.key ?? null;
  }

  /**
   * Returns the most recently used key without modifying the access order.
   *
   * Represents the "hottest" item in the cache.
   *
   * @returns The most recently used key, or null if the cache is empty
   *
   * @see {@link lru} - For getting the least recently used key
   *
   * @public
   */
  get mru(): K | null {
    return this.#head?.key ?? null;
  }

  /**
   * Updates access time for a key, promoting it to most recently used position.
   *
   * For existing keys, moves to front without eviction. For new keys, adds to front
   * and may trigger LRU eviction if at capacity.
   *
   * @param key - The key to mark as recently accessed or add to cache
   * @returns The key that was evicted (if any), or null if no eviction occurred
   *
   * @example
   * ```typescript
   * const evicted = tracker.touch("new-key"); // null
   * tracker.touch("existing-key"); // null (move to front)
   *
   * // When at capacity
   * const evictedKey = tracker.touch("another-key"); // "oldest-key"
   * ```
   *
   * @see {@link has} - For non-destructive existence checking
   * @see {@link delete} - For manual item removal
   *
   * @public
   */
  touch(key: K): K | null {
    const node = this.#cache.get(key);

    if (node) {
      // Key exists: move to front (most recently used position)
      // This maintains LRU ordering by promoting accessed items
      this.#removeNode(node);
      this.#addToFront(node);
      return null;
    }

    // Key doesn't exist: create new node and add to front
    const newNode = new LruNode<K>(key);
    this.#addToFront(newNode);
    this.#cache.set(key, newNode);

    // Check if we exceeded capacity and need to evict
    if (this.#cache.size > this.capacity) {
      return this.#evictLru();
    }

    return null;
  }

  /**
   * Checks if a key exists in the tracker without affecting its LRU position.
   *
   * Non-destructive existence checking that does not modify access order.
   *
   * @param key - The key to check for existence
   * @returns true if the key exists in the tracker, false otherwise
   *
   * @example
   * ```typescript
   * console.log(tracker.has("nonexistent")); // false
   * tracker.touch("key1");
   * console.log(tracker.has("key1")); // true
   * ```
   *
   * @see {@link touch} - For accessing items (modifies LRU order)
   *
   * @public
   */
  has(key: K): boolean {
    return this.#cache.has(key);
  }

  /**
   * Removes a specific key from the tracker with comprehensive cleanup.
   *
   * Performs complete removal from both HashMap and doubly-linked list with
   * proper node disposal to prevent memory leaks.
   *
   * @param key - The key to remove from the cache
   * @returns true if the key was found and removed, false if key didn't exist
   *
   * @example
   * ```typescript
   * tracker.touch("key1");
   * const removed = tracker.delete("key1"); // true
   * const notRemoved = tracker.delete("nonexistent"); // false
   * ```
   *
   * @see {@link clear} - For removing all items at once
   * @see {@link touch} - For adding items to the tracker
   *
   * @public
   */
  delete(key: K): boolean {
    const node = this.#cache.get(key);
    if (node) {
      // Remove the node from the doubly-linked list
      this.#removeNode(node);

      // Remove the key-node mapping from the HashMap
      this.#cache.delete(key);

      // Clean up node references to prevent memory leaks
      // This is critical for preventing circular references
      node.dispose();

      return true;
    }

    return false;
  }

  /**
   * Removes all items from the cache with comprehensive memory cleanup.
   *
   * Performs systematic cleanup of all nodes and returns tracker to initial empty state.
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
   * @see {@link size} - For checking if clear operation was successful
   *
   * @public
   */
  clear(): void {
    // Clean up all node references before clearing to prevent memory leaks
    // This is critical for preventing circular references and ensuring proper GC
    for (const node of this.#cache.values()) {
      node.dispose();
    }

    // Clear the HashMap that maps keys to nodes
    this.#cache.clear();

    // Reset list pointers to initial empty state
    this.#head = null;
    this.#tail = null;
  }

  /**
   * Returns all keys ordered from most recently used to least recently used.
   *
   * Provides a complete snapshot of the current LRU ordering by traversing
   * the doubly-linked list from head (MRU) to tail (LRU).
   *
   * @returns Array of keys in order from most recently used to least recently used
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

    // Traverse from head (MRU) to tail (LRU)
    while (current) {
      result.push(current.key);
      current = current.next;
    }

    return result;
  }

  /**
   * Returns all keys ordered from least recently used to most recently used.
   *
   * Provides the inverse ordering of keys() by traversing from tail (LRU) to head (MRU).
   * Useful for eviction algorithms and cache analysis.
   *
   * @returns Array of keys in order from least recently used to most recently used
   *
   * @example
   * ```typescript
   * tracker.touch("first");
   * tracker.touch("second");
   * console.log(tracker.keysReverse()); // ["first", "second"]
   * ```
   *
   * @see {@link keys} - For MRU to LRU ordering
   * @see {@link lru} - For getting just the least recently used key
   *
   * @public
   */
  keysReverse(): K[] {
    const result: K[] = [];
    let current = this.#tail;

    // Traverse from tail (LRU) to head (MRU)
    while (current) {
      result.push(current.key);
      current = current.prev;
    }

    return result;
  }

  /**
   * Returns all entries as key-node pairs for advanced debugging and analysis.
   *
   * ⚠️ **WARNING**: The returned LruNode instances should NOT be modified directly
   * as this can corrupt the internal list structure. For read-only inspection only.
   *
   * @returns Array of [key, LruNode] pairs representing the internal state
   *
   * @example
   * ```typescript
   * const entries = tracker.entries();
   * for (const [key, node] of entries) {
   *   console.log(`Key: ${key}, has prev: ${node.prev !== null}`);
   * }
   * ```
   *
   * @see {@link keys} - For getting just the keys without node access
   *
   * @public
   */
  entries(): [K, LruNode<K>][] {
    return [...this.#cache.entries()];
  }

  /**
   * Evicts the least recently used item to make room for new entries.
   * Called automatically by touch() when capacity is exceeded.
   *
   * @returns The key of the evicted item, or null if cache was empty
   * @internal
   */
  #evictLru(): K | null {
    if (this.#tail) {
      const key = this.#tail.key;
      const node = this.#tail;

      // Remove from linked list and hash map
      this.#removeNode(node);
      this.#cache.delete(key);

      // Clean up node references to prevent memory leaks
      node.dispose();

      return key;
    }

    return null;
  }

  /**
   * Adds a node to the front of the doubly-linked list (MRU position).
   * Handles both empty list and populated list cases.
   *
   * @param node - The node to add to the front of the list
   * @internal
   */
  #addToFront(node: LruNode<K>): void {
    // Reset node connections to ensure clean state
    node.prev = null;
    node.next = this.#head;

    // Update the current head's previous pointer
    if (this.#head) {
      this.#head.prev = node;
    }

    // Update head pointer to the new node
    this.#head = node;

    // If this is the first node, it's also the tail
    if (!this.#tail) {
      this.#tail = node;
    }
  }

  /**
   * Removes a node from the doubly-linked list while maintaining integrity.
   * Handles edge cases including head and tail removal scenarios.
   *
   * @param node - The node to remove from the list
   * @internal
   */
  #removeNode(node: LruNode<K>): void {
    // Update the previous node's next pointer
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      // This was the head node
      this.#head = node.next;
    }

    // Update the next node's previous pointer
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      // This was the tail node
      this.#tail = node.prev;
    }

    // Clean up the removed node's references to prevent memory leaks
    // This is crucial to avoid circular references and dangling pointers
    node.prev = null;
    node.next = null;
  }
}

import type { StoreKey } from "./index.js";

/**
 * Node class representing an element in the doubly linked list used for LRU cache implementation.
 * Each node contains a key and maintains bidirectional references to adjacent nodes for O(1) operations.
 *
 * **Memory Management**: Includes proper disposal methods to prevent memory leaks and circular references.
 *
 * @typeParam K - The type of keys stored in the node
 */
export class LruNode<K> {
  /** The key stored in this node */
  key: K;

  /** Reference to the previous node in the doubly linked list (closer to tail) */
  prev: LruNode<K> | null = null;

  /** Reference to the next node in the doubly linked list (closer to head) */
  next: LruNode<K> | null = null;

  /**
   * Creates a new LRU node with the specified key.
   * @param key - The key to store in this node
   */
  constructor(key: K) {
    this.key = key;
  }

  /**
   * Clears all references from this node to help with garbage collection.
   * This method should be called when the node is being removed from the list
   * to prevent memory leaks and circular references.
   */
  dispose(): void {
    this.prev = null;
    this.next = null;
  }
}

/**
 * Implementation of a Least Recently Used (LRU) cache tracker using a doubly linked list
 * and hash map for O(1) operations. This class maintains a fixed-size cache of keys,
 * automatically evicting the least recently used item when the capacity is exceeded.
 *
 * **Algorithm**: Uses a combination of:
 * - HashMap for O(1) key lookup
 * - Doubly linked list for O(1) insertion/deletion and LRU ordering
 * - Head represents most recently used items
 * - Tail represents least recently used items
 *
 * **Memory Management**: Includes comprehensive cleanup of node references to prevent
 * memory leaks, circular references, and dangling pointers.
 *
 * **Performance Characteristics**:
 * - touch(): O(1) - Update access time
 * - getLru()/getMru(): O(1) - Get least/most recently used
 * - delete(): O(1) - Remove specific key
 * - has(): O(1) - Check key existence
 * - clear(): O(n) - Clear all entries with proper cleanup
 *
 * @typeParam K - The type of keys to be stored in the cache, must extend StoreKey
 */
export class LruTracker<K extends StoreKey> {
  /** Maximum number of items this tracker can hold */
  readonly #capacity: number;

  /** Hash map for O(1) key-to-node lookup */
  #cache = new Map<K, LruNode<K>>();

  /** Head of the doubly linked list (most recently used) */
  #head: LruNode<K> | null = null;

  /** Tail of the doubly linked list (least recently used) */
  #tail: LruNode<K> | null = null;

  /**
   * Creates a new LRU tracker with the specified capacity.
   * @param capacity - The maximum number of items the tracker can hold. Must be at least 1.
   */
  constructor(capacity: number) {
    this.#capacity = Math.max(1, capacity);
  }

  /**
   * Returns the current number of items being tracked in the cache.
   * @returns The number of items currently in the cache
   */
  get size(): number {
    return this.#cache.size;
  }

  /**
   * Returns the maximum capacity of the tracker.
   * @returns The maximum number of items this tracker can hold
   */
  get capacity(): number {
    return this.#capacity;
  }

  /**
   * The least recently used key from the cache without modifying access order.
   * @returns The least recently used key, or null if the cache is empty
   */
  get lru(): K | null {
    return this.#tail?.key ?? null;
  }

  /**
   * The most recently used key from the cache without modifying access order.
   * @returns The most recently used key, or null if the cache is empty
   */
  get mru(): K | null {
    return this.#head?.key ?? null;
  }

  /**
   * Updates the access time for a key, moving it to the front of the LRU list (most recently used).
   * If the key doesn't exist, it will be added to the cache.
   * If adding the key exceeds capacity, the least recently used item will be automatically evicted.
   *
   * @param key - The key to update or add to the cache
   * @returns The key that was evicted (if any), or null if no eviction occurred
   */
  touch(key: K): K | null {
    const node = this.#cache.get(key);

    if (node) {
      // Key exists: move to front (most recently used position)
      this.#removeNode(node);
      this.#addToFront(node);
      return null;
    }

    // Key doesn't exist: create new node and add to front
    const newNode = new LruNode<K>(key);
    this.#addToFront(newNode);
    this.#cache.set(key, newNode);

    // Check if we exceeded capacity and need to evict
    if (this.#cache.size > this.#capacity) {
      return this.#evictLru();
    }
    return null;
  }

  /**
   * Checks if a key exists in the tracker without affecting its position in the LRU order.
   * @param key - The key to check
   * @returns true if the key exists, false otherwise
   */
  has(key: K): boolean {
    return this.#cache.has(key);
  }

  /**
   * Removes a specific key from the tracker along with all its metadata.
   * Properly cleans up node references to prevent memory leaks.
   *
   * @param key - The key to remove from the cache
   * @returns true if the key was found and removed, false otherwise
   */
  delete(key: K): boolean {
    const node = this.#cache.get(key);
    if (node) {
      this.#removeNode(node);
      this.#cache.delete(key);

      // Clean up node references to prevent memory leaks
      node.dispose();

      return true;
    }
    return false;
  }

  /**
   * Removes all items from the cache, resetting it to its initial empty state.
   * Properly cleans up all node references to prevent memory leaks and circular references.
   */
  clear(): void {
    // Clean up all node references before clearing to prevent memory leaks
    for (const node of this.#cache.values()) {
      node.dispose();
    }

    this.#cache.clear();
    this.#head = null;
    this.#tail = null;
  }

  /**
   * Returns all keys in the cache, ordered from most recently used to least recently used.
   * This traverses the linked list from head to tail.
   *
   * @returns An array of keys in order of their last access time (MRU to LRU)
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
   * Returns all keys in the cache, ordered from least recently used to most recently used.
   * This traverses the linked list from tail to head (reverse order).
   *
   * @returns An array of keys in reverse order of their last access time (LRU to MRU)
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
   * Returns all entries in the cache as key-node pairs for debugging purposes.
   *
   * **Warning**: The returned nodes should not be modified directly as this can break
   * the internal doubly linked list structure and cause undefined behavior.
   *
   * @returns An array of [key, LruNode] pairs
   */
  entries(): [K, LruNode<K>][] {
    return [...this.#cache.entries()];
  }

  /**
   * Removes the least recently used item from the cache to make room for new items.
   * This is called automatically when the cache exceeds its capacity.
   *
   * @returns The key of the evicted item, or null if the cache was empty
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
   * Adds a node to the front of the doubly linked list, making it the most recently used item.
   * Handles both empty list and non-empty list cases.
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
   * Removes a node from the doubly linked list while maintaining list integrity.
   * Properly handles edge cases (head/tail removal) and cleans up node references.
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

import type { StoreKey } from "./index.js";

/**
 * Node class representing an element in the doubly linked list used for LRU cache implementation.
 * Each node contains a key and maintains references to its previous and next nodes.
 */
export class LruNode<K> {
  key: K;
  prev: LruNode<K> | null = null;
  next: LruNode<K> | null = null;

  constructor(key: K) {
    this.key = key;
  }

  /**
   * Clears all references from this node to help with garbage collection.
   * This method should be called when the node is being removed from the list.
   */
  dispose(): void {
    this.prev = null;
    this.next = null;
  }
}

/**
 * Implementation of a Least Recently Used (LRU) cache tracker.
 * This class maintains a fixed-size cache of keys, automatically evicting the least recently used
 * item when the capacity is exceeded. It uses a combination of Map and doubly linked list to achieve
 * O(1) time complexity for all operations.
 *
 * **Memory Management**: This implementation includes proper cleanup of node references to prevent
 * memory leaks and circular references.
 *
 * @template K - The type of keys to be stored in the cache, must extend StoreKey
 */
export class LruTracker<K extends StoreKey> {
  readonly #capacity: number;

  #cache = new Map<K, LruNode<K>>();
  #head: LruNode<K> | null = null;
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
   */
  get size(): number {
    return this.#cache.size;
  }

  /**
   * Returns the maximum capacity of the tracker.
   */
  get capacity(): number {
    return this.#capacity;
  }

  /**
   * Updates the access time for a key, moving it to the front of the LRU list.
   * If the key doesn't exist, it will be added to the cache.
   * If adding the key exceeds capacity, the least recently used item will be evicted.
   *
   * @param key - The key to update or add to the cache
   * @returns The key that was evicted (if any), or null if no eviction occurred
   */
  touch(key: K): K | null {
    const node = this.#cache.get(key);

    if (node) {
      // Remove from current position
      this.#removeNode(node);
      // Add to front (most recently used)
      this.#addToFront(node);
      return null;
    }

    // Create new node and add to front
    const newNode = new LruNode<K>(key);
    this.#addToFront(newNode);
    this.#cache.set(key, newNode);

    // Evict if over capacity
    if (this.#cache.size > this.#capacity) {
      return this.#evictLru();
    }
    return null;
  }

  /**
   * Retrieves the least recently used key from the cache.
   * @returns The least recently used key, or null if the cache is empty
   */
  getLru(): K | null {
    return this.#tail ? this.#tail.key : null;
  }

  /**
   * Retrieves the most recently used key from the cache.
   * @returns The most recently used key, or null if the cache is empty
   */
  getMru(): K | null {
    return this.#head ? this.#head.key : null;
  }

  /**
   * Checks if a key exists in the tracker.
   * @param key - The key to check
   * @returns true if the key exists, false otherwise
   */
  has(key: K): boolean {
    return this.#cache.has(key);
  }

  /**
   * Removes a specific key from the tracker.
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
   * Removes all items from the cache, resetting it to its initial state.
   * Properly cleans up all node references to prevent memory leaks.
   */
  clear(): void {
    // Clean up all node references before clearing
    for (const node of this.#cache.values()) {
      node.dispose();
    }

    this.#cache.clear();
    this.#head = null;
    this.#tail = null;
  }

  /**
   * Returns all keys in the cache, ordered from most recently used to least recently used.
   * @returns An array of keys in order of their last access time
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
   * @returns An array of keys in reverse order of their last access time
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
   * Returns all entries in the cache as key-node pairs.
   * **Note**: The returned nodes should not be modified directly as this can break the internal structure.
   * @returns An array of [key, LRUNode] pairs
   */
  entries(): [K, LruNode<K>][] {
    return [...this.#cache.entries()];
  }

  /**
   * Removes the least recently used item from the cache.
   * @returns The key of the evicted item, or null if the cache was empty
   * @private
   */
  #evictLru(): K | null {
    if (this.#tail) {
      const key = this.#tail.key;
      const node = this.#tail;
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
   * @param node - The node to add to the front of the list
   * @private
   */
  #addToFront(node: LruNode<K>): void {
    // Reset node connections to ensure clean state
    node.prev = null;
    node.next = this.#head;

    // Update head pointer
    if (this.#head) {
      this.#head.prev = node;
    }
    this.#head = node;

    // If this is the first node, it's also the tail
    if (!this.#tail) {
      this.#tail = node;
    }
  }

  /**
   * Removes a node from the doubly linked list, maintaining the list's integrity.
   * Properly cleans up node references to prevent memory leaks.
   * @param node - The node to remove from the list
   * @private
   */
  #removeNode(node: LruNode<K>): void {
    // Update previous node
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      // This was the head
      this.#head = node.next;
    }

    // Update next node
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      // This was the tail
      this.#tail = node.prev;
    }

    // Clean up the removed node's references to prevent memory leaks
    // This is crucial to avoid circular references and lingering pointers
    node.prev = null;
    node.next = null;
  }
}

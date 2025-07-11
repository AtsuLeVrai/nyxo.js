/**
 * High-performance node implementation for doubly-linked list in LRU cache systems.
 *
 * Each node represents a cache entry and maintains bidirectional links to enable
 * O(1) insertion, deletion, and reordering operations in LRU data structures.
 *
 * @typeParam K - The type of keys stored in the node, must be serializable
 *
 * @example
 * ```typescript
 * const node1 = new LruNode("key1");
 * const node2 = new LruNode("key2");
 *
 * // Build doubly-linked structure
 * node1.next = node2;
 * node2.prev = node1;
 * ```
 *
 * @public
 */
export class LruNode<K> {
  /**
   * Reference to the previous node in the doubly-linked list (toward tail/LRU end).
   * A null value indicates this node is at the tail or unlinked.
   *
   * @default null - No previous node initially
   * @public
   */
  prev: LruNode<K> | null = null;

  /**
   * Reference to the next node in the doubly-linked list (toward head/MRU end).
   * A null value indicates this node is at the head or unlinked.
   *
   * @default null - No next node initially
   * @public
   */
  next: LruNode<K> | null = null;

  /**
   * The key stored in this node, uniquely identifying the cache entry.
   * Should be immutable after creation to maintain data structure integrity.
   *
   * @readonly
   * @public
   */
  readonly key: K;

  /**
   * Creates a new LRU node with the specified key.
   *
   * The node is created in an unlinked state with both prev and next pointers
   * set to null, ready for insertion into an LRU tracking system.
   *
   * @param key - The key to store in this node
   *
   * @example
   * ```typescript
   * const userNode = new LruNode("user:12345");
   * const numberNode = new LruNode(42);
   * const symbolNode = new LruNode(Symbol("unique"));
   * ```
   *
   * @see {@link dispose} - For proper cleanup when removing nodes
   * @see {@link LruTracker} - For typical usage in LRU tracking systems
   *
   * @public
   */
  constructor(key: K) {
    this.key = key;
  }

  /**
   * Clears all references from this node to enable safe garbage collection.
   *
   * This method performs comprehensive cleanup to prevent memory leaks and
   * circular references in doubly-linked list structures. Should be called
   * whenever a node is removed from an LRU list.
   *
   * @example
   * ```typescript
   * const node = new LruNode("session:abc123");
   * // Use node in LRU list...
   * node.dispose(); // Clean disposal before removal
   * ```
   *
   * @see {@link constructor} - For creating nodes that will eventually need disposal
   *
   * @public
   */
  dispose(): void {
    this.prev = null;
    this.next = null;
  }
}

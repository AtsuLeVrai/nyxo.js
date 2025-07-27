/**
 * Node implementation for doubly-linked list in LRU systems.
 * Maintains bidirectional links for O(1) operations.
 *
 * @typeParam K - Key type, must be serializable
 *
 * @example
 * ```typescript
 * const node1 = new LruNode("key1");
 * const node2 = new LruNode("key2");
 *
 * node1.next = node2;
 * node2.prev = node1;
 * ```
 *
 * @public
 */
export class LruNode<K> {
  /**
   * Reference to previous node (toward LRU end).
   * Null indicates tail position or unlinked state.
   *
   * @public
   */
  prev: LruNode<K> | null = null;

  /**
   * Reference to next node (toward MRU end).
   * Null indicates head position or unlinked state.
   *
   * @public
   */
  next: LruNode<K> | null = null;

  /**
   * Key stored in this node.
   * Should remain immutable after creation.
   *
   * @readonly
   * @public
   */
  readonly key: K;

  /**
   * Creates new LRU node with specified key.
   * Node starts unlinked with null pointers.
   *
   * @param key - Key to store in this node
   *
   * @example
   * ```typescript
   * const userNode = new LruNode("user:12345");
   * const numberNode = new LruNode(42);
   * ```
   *
   * @see {@link dispose} - For cleanup when removing nodes
   *
   * @public
   */
  constructor(key: K) {
    this.key = key;
  }

  /**
   * Clears all references for safe garbage collection.
   * Prevents memory leaks in doubly-linked structures.
   *
   * @example
   * ```typescript
   * const node = new LruNode("session:abc123");
   * node.dispose(); // Clean disposal before removal
   * ```
   *
   * @public
   */
  dispose(): void {
    this.prev = null;
    this.next = null;
  }
}

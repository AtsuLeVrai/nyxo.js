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

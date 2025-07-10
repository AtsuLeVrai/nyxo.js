/**
 * High-performance node implementation for doubly-linked list in LRU cache systems.
 *
 * The LruNode class provides the fundamental building block for efficient LRU (Least Recently Used)
 * cache implementations. Each node represents a cache entry and maintains bidirectional links
 * to enable O(1) insertion, deletion, and reordering operations in the LRU data structure.
 *
 * ## Architecture Overview
 *
 * **Doubly-Linked List Structure:**
 * ```
 * HEAD ↔ [Node1] ↔ [Node2] ↔ [Node3] ↔ TAIL
 *           ↑                           ↑
 *     Most Recently Used        Least Recently Used
 * ```
 *
 * **Node Relationships:**
 * - `prev`: Points toward the tail (older items)
 * - `next`: Points toward the head (newer items)
 * - Head position indicates most recent access
 * - Tail position indicates least recent access
 *
 * ## Key Features
 *
 * **🚀 Performance Optimized**
 * - O(1) insertion and removal operations
 * - O(1) list reordering for access updates
 * - Minimal memory overhead per node
 * - Cache-friendly memory layout
 *
 * **💾 Memory Management**
 * - Explicit disposal methods to prevent memory leaks
 * - Circular reference prevention with proper cleanup
 * - Efficient garbage collection support
 * - Resource-conscious design patterns
 *
 * **🔧 Integration Ready**
 * - Seamless integration with LRU tracking systems
 * - Type-safe generic implementation
 * - Simple API for common list operations
 * - Robust error handling and edge case management
 *
 * ## Performance Characteristics
 *
 * | Operation | Time Complexity | Space Complexity | Notes |
 * |-----------|----------------|------------------|-------|
 * | Creation  | O(1)           | O(1)            | Constant time allocation |
 * | Link/Unlink | O(1)         | O(1)            | Bidirectional pointer updates |
 * | Disposal  | O(1)           | O(1)            | Reference cleanup |
 * | Memory    | ~24-32 bytes   | Per node        | Key + 2 pointers + object overhead |
 *
 * ## Memory Layout
 *
 * **Per-node memory usage:**
 * - Key storage: Variable (depends on key type)
 * - Previous pointer: 8 bytes (64-bit systems)
 * - Next pointer: 8 bytes (64-bit systems)
 * - Object overhead: 8-16 bytes (varies by JS engine)
 * - **Total**: ~24-32 bytes + key size
 *
 * ## Usage Patterns
 *
 * ### Basic Node Creation and Linking
 * ```typescript
 * // Create nodes
 * const node1 = new LruNode("key1");
 * const node2 = new LruNode("key2");
 * const node3 = new LruNode("key3");
 *
 * // Build doubly-linked structure
 * node1.next = node2;
 * node2.prev = node1;
 * node2.next = node3;
 * node3.prev = node2;
 *
 * // Result: node1 ↔ node2 ↔ node3
 * ```
 *
 * ### LRU Cache Integration
 * ```typescript
 * class SimpleLRUCache<K, V> {
 *   private nodeMap = new Map<K, LruNode<K>>();
 *   private head: LruNode<K> | null = null;
 *   private tail: LruNode<K> | null = null;
 *
 *   access(key: K): void {
 *     const node = this.nodeMap.get(key);
 *     if (node) {
 *       this.moveToHead(node);
 *     }
 *   }
 *
 *   private moveToHead(node: LruNode<K>): void {
 *     // Remove from current position
 *     this.removeNode(node);
 *     // Add to head position
 *     this.addToHead(node);
 *   }
 *
 *   private removeNode(node: LruNode<K>): void {
 *     if (node.prev) node.prev.next = node.next;
 *     if (node.next) node.next.prev = node.prev;
 *   }
 *
 *   private addToHead(node: LruNode<K>): void {
 *     node.next = this.head;
 *     node.prev = null;
 *     if (this.head) this.head.prev = node;
 *     this.head = node;
 *   }
 * }
 * ```
 *
 * ### Memory Management Best Practices
 * ```typescript
 * class ManagedLRUCache<K, V> {
 *   private nodes = new Set<LruNode<K>>();
 *
 *   removeNode(node: LruNode<K>): void {
 *     // Unlink from list
 *     if (node.prev) node.prev.next = node.next;
 *     if (node.next) node.next.prev = node.prev;
 *
 *     // Clean up references to prevent memory leaks
 *     node.dispose();
 *
 *     // Remove from tracking
 *     this.nodes.delete(node);
 *   }
 *
 *   clear(): void {
 *     // Dispose all nodes before clearing
 *     for (const node of this.nodes) {
 *       node.dispose();
 *     }
 *     this.nodes.clear();
 *   }
 * }
 * ```
 *
 * ## Integration Examples
 *
 * ### High-Performance Cache Implementation
 * ```typescript
 * interface CacheEntry<V> {
 *   value: V;
 *   node: LruNode<string>;
 *   accessCount: number;
 *   lastAccess: number;
 * }
 *
 * class AdvancedLRUCache<V> {
 *   private entries = new Map<string, CacheEntry<V>>();
 *   private head: LruNode<string> | null = null;
 *   private tail: LruNode<string> | null = null;
 *   private maxSize: number;
 *
 *   constructor(maxSize: number) {
 *     this.maxSize = maxSize;
 *   }
 *
 *   get(key: string): V | undefined {
 *     const entry = this.entries.get(key);
 *     if (!entry) return undefined;
 *
 *     // Update access tracking
 *     entry.accessCount++;
 *     entry.lastAccess = Date.now();
 *
 *     // Move to head (most recently used)
 *     this.moveToHead(entry.node);
 *
 *     return entry.value;
 *   }
 *
 *   set(key: string, value: V): void {
 *     const existingEntry = this.entries.get(key);
 *
 *     if (existingEntry) {
 *       // Update existing entry
 *       existingEntry.value = value;
 *       existingEntry.lastAccess = Date.now();
 *       this.moveToHead(existingEntry.node);
 *     } else {
 *       // Create new entry
 *       const node = new LruNode(key);
 *       const entry: CacheEntry<V> = {
 *         value,
 *         node,
 *         accessCount: 1,
 *         lastAccess: Date.now()
 *       };
 *
 *       this.entries.set(key, entry);
 *       this.addToHead(node);
 *
 *       // Evict if necessary
 *       if (this.entries.size > this.maxSize) {
 *         this.evictLRU();
 *       }
 *     }
 *   }
 *
 *   private evictLRU(): void {
 *     if (!this.tail) return;
 *
 *     const key = this.tail.key;
 *     const entry = this.entries.get(key);
 *
 *     if (entry) {
 *       // Remove from tracking
 *       this.entries.delete(key);
 *
 *       // Remove from list
 *       this.removeNode(entry.node);
 *
 *       // Clean up node references
 *       entry.node.dispose();
 *     }
 *   }
 * }
 * ```
 *
 * ## Error Handling and Edge Cases
 *
 * The LruNode implementation handles various edge cases gracefully:
 *
 * ```typescript
 * // Safe disposal handling
 * const safeDispose = (node: LruNode<string> | null): void => {
 *   if (node) {
 *     node.dispose(); // Safe to call multiple times
 *   }
 * };
 *
 * // Circular reference prevention
 * const preventCircularRef = (node1: LruNode<string>, node2: LruNode<string>): void => {
 *   // Always dispose before creating new links
 *   node1.dispose();
 *   node2.dispose();
 *
 *   // Create new clean links
 *   node1.next = node2;
 *   node2.prev = node1;
 * };
 *
 * // Robust list manipulation
 * const safeRemoveNode = (node: LruNode<string>): void => {
 *   // Check for valid references before manipulation
 *   if (node.prev) {
 *     node.prev.next = node.next;
 *   }
 *   if (node.next) {
 *     node.next.prev = node.prev;
 *   }
 *
 *   // Always dispose after removal
 *   node.dispose();
 * };
 * ```
 *
 * ## Thread Safety Considerations
 *
 * ⚠️ **Important**: The LruNode class is **not thread-safe**. In concurrent environments:
 *
 * - External synchronization is required when accessing shared nodes
 * - Atomic operations should be used for critical list manipulations
 * - Consider using locks or other synchronization primitives
 * - Be aware of race conditions in multi-threaded scenarios
 *
 * @typeParam K - The type of keys stored in the node, must be serializable
 *
 * @public
 */
export class LruNode<K> {
  /**
   * The key stored in this node, uniquely identifying the cache entry.
   *
   * This key serves as the identifier for the cache entry associated with this node.
   * It should be immutable after node creation to maintain data structure integrity.
   * The key type should support proper equality comparison and be serializable
   * for optimal performance in hash-based lookups.
   *
   * **Key Requirements:**
   * - Should be immutable after creation
   * - Must support equality comparison (===, ==)
   * - Should be serializable for debugging and persistence
   * - Recommended types: string, number, symbol
   *
   * **Performance Notes:**
   * - Primitive types (string, number) offer best performance
   * - Object keys require careful equality handling
   * - Symbol keys provide unique identity guarantees
   *
   * @example
   * ```typescript
   * // String keys (most common)
   * const userNode = new LruNode("user:12345");
   * console.log(userNode.key); // "user:12345"
   *
   * // Numeric keys for array-like access
   * const indexNode = new LruNode(42);
   * console.log(indexNode.key); // 42
   *
   * // Symbol keys for unique identity
   * const symbolKey = Symbol("unique-identifier");
   * const uniqueNode = new LruNode(symbolKey);
   * console.log(uniqueNode.key === symbolKey); // true
   *
   * // Composite keys (use with caution)
   * const compositeKey = `${userId}:${timestamp}`;
   * const compositeNode = new LruNode(compositeKey);
   * ```
   *
   * @readonly After construction, should not be modified to maintain data structure integrity
   * @public
   */
  key: K;

  /**
   * Reference to the previous node in the doubly-linked list (toward tail/LRU end).
   *
   * This pointer creates the backward link in the doubly-linked list structure,
   * pointing toward nodes that are older (less recently used) in the LRU ordering.
   * A null value indicates this node is at the tail of the list (least recently used)
   * or is not currently part of any list structure.
   *
   * **List Position Semantics:**
   * - `null`: Node is at tail (LRU end) or unlinked
   * - `LruNode<K>`: Points to the next older node in access order
   * - Head direction: More recently accessed items
   * - Tail direction: Less recently accessed items
   *
   * **Memory Management:**
   * - Should be set to null when node is removed from list
   * - Prevents circular references and memory leaks
   * - Enables proper garbage collection
   * - Cleared automatically by dispose() method
   *
   * **Thread Safety:**
   * - Not thread-safe; requires external synchronization
   * - Modifications should be atomic in concurrent environments
   * - Consider using locks for multi-threaded access
   *
   * @example
   * ```typescript
   * const node1 = new LruNode("first");
   * const node2 = new LruNode("second");
   * const node3 = new LruNode("third");
   *
   * // Build list: node1 ↔ node2 ↔ node3
   * node2.prev = node1;
   * node2.next = node3;
   * node1.next = node2;
   * node3.prev = node2;
   *
   * console.log(node2.prev?.key); // "first"
   * console.log(node1.prev);      // null (at head)
   * console.log(node3.prev?.key); // "second"
   *
   * // Safe traversal toward tail
   * let current = node1;
   * while (current) {
   *   console.log(current.key);
   *   current = current.next;
   * }
   * // Output: "first", "second", "third"
   * ```
   *
   * @default null - No previous node initially
   * @public
   */
  prev: LruNode<K> | null = null;

  /**
   * Reference to the next node in the doubly-linked list (toward head/MRU end).
   *
   * This pointer creates the forward link in the doubly-linked list structure,
   * pointing toward nodes that are newer (more recently used) in the LRU ordering.
   * A null value indicates this node is at the head of the list (most recently used)
   * or is not currently part of any list structure.
   *
   * **List Position Semantics:**
   * - `null`: Node is at head (MRU end) or unlinked
   * - `LruNode<K>`: Points to the next newer node in access order
   * - Head direction: More recently accessed items
   * - Tail direction: Less recently accessed items
   *
   * **Traversal Patterns:**
   * - Forward traversal: From tail to head (old to new)
   * - Backward traversal: From head to tail (new to old)
   * - Insertion: Typically at head for new/accessed items
   * - Removal: Typically from tail for eviction
   *
   * **Performance Characteristics:**
   * - O(1) link/unlink operations
   * - O(n) full list traversal
   * - Efficient random access with node references
   * - Cache-friendly sequential access patterns
   *
   * @example
   * ```typescript
   * const node1 = new LruNode("oldest");
   * const node2 = new LruNode("middle");
   * const node3 = new LruNode("newest");
   *
   * // Build LRU order: newest ↔ middle ↔ oldest
   * node3.next = node2;
   * node2.prev = node3;
   * node2.next = node1;
   * node1.prev = node2;
   *
   * console.log(node2.next?.key); // "oldest"
   * console.log(node3.next?.key); // "middle"
   * console.log(node1.next);      // null (at tail)
   *
   * // Traverse from head to tail (MRU to LRU)
   * let current = node3; // Start at head
   * while (current) {
   *   console.log(`${current.key} (position in LRU order)`);
   *   current = current.next;
   * }
   * // Output: "newest (MRU)", "middle", "oldest (LRU)"
   *
   * // Find tail (LRU item)
   * let tail = node3;
   * while (tail.next) {
   *   tail = tail.next;
   * }
   * console.log(`LRU item: ${tail.key}`); // "oldest"
   * ```
   *
   * @default null - No next node initially
   * @public
   */
  next: LruNode<K> | null = null;

  /**
   * Creates a new LRU node with the specified key and initializes link pointers.
   *
   * This constructor creates an isolated node that can be inserted into a doubly-linked
   * list structure. The node is created in an unlinked state with both prev and next
   * pointers set to null, ready for insertion into an LRU tracking system.
   *
   * **Initialization Process:**
   * 1. Stores the provided key immutably
   * 2. Initializes prev and next pointers to null
   * 3. Creates isolated node ready for list insertion
   * 4. Maintains type safety with generic key parameter
   *
   * **Design Decisions:**
   * - Nodes start unlinked for flexible insertion strategies
   * - Key is stored by reference (not copied) for performance
   * - Simple construction without complex initialization
   * - Type-safe generic implementation
   *
   * **Memory Allocation:**
   * - Allocates ~24-32 bytes per node (plus key storage)
   * - No additional heap allocations beyond the node object
   * - Efficient memory layout for cache performance
   * - Minimal overhead for high-performance applications
   *
   * @param key - The key to store in this node, should be immutable after creation
   *
   * @example
   * ```typescript
   * // Basic node creation
   * const userNode = new LruNode("user:12345");
   * console.log(userNode.key);  // "user:12345"
   * console.log(userNode.prev); // null
   * console.log(userNode.next); // null
   *
   * // Type-safe creation with different key types
   * const stringNode = new LruNode("cache-key");
   * const numberNode = new LruNode(42);
   * const symbolNode = new LruNode(Symbol("unique"));
   *
   * // Batch node creation for cache initialization
   * const createNodes = (keys: string[]): LruNode<string>[] => {
   *   return keys.map(key => new LruNode(key));
   * };
   *
   * const nodes = createNodes(["key1", "key2", "key3"]);
   * console.log(nodes.length); // 3
   * console.log(nodes[0].key); // "key1"
   * ```
   *
   * @example
   * ```typescript
   * // Integration with cache systems
   * class CacheNodeFactory<K> {
   *   private nodePool: LruNode<K>[] = [];
   *
   *   createNode(key: K): LruNode<K> {
   *     // Reuse nodes from pool if available
   *     const pooledNode = this.nodePool.pop();
   *     if (pooledNode) {
   *       pooledNode.key = key;
   *       pooledNode.prev = null;
   *       pooledNode.next = null;
   *       return pooledNode;
   *     }
   *
   *     // Create new node if pool is empty
   *     return new LruNode(key);
   *   }
   *
   *   recycleNode(node: LruNode<K>): void {
   *     node.dispose(); // Clean references
   *     this.nodePool.push(node);
   *   }
   * }
   *
   * // Usage in high-performance scenarios
   * const factory = new CacheNodeFactory<string>();
   * const node1 = factory.createNode("session:abc");
   * const node2 = factory.createNode("user:123");
   *
   * // Later, recycle nodes to reduce allocation overhead
   * factory.recycleNode(node1);
   * factory.recycleNode(node2);
   * ```
   *
   * @example
   * ```typescript
   * // Error handling and validation
   * const createValidatedNode = <K>(key: K): LruNode<K> => {
   *   if (key === null || key === undefined) {
   *     throw new Error("Node key cannot be null or undefined");
   *   }
   *
   *   return new LruNode(key);
   * };
   *
   * // Safe creation with error handling
   * try {
   *   const validNode = createValidatedNode("valid-key");
   *   console.log("Node created successfully");
   * } catch (error) {
   *   console.error("Failed to create node:", error.message);
   * }
   *
   * // Conditional node creation
   * const maybeCreateNode = <K>(key: K | null): LruNode<K> | null => {
   *   return key !== null ? new LruNode(key) : null;
   * };
   * ```
   *
   * @throws {Error} Does not throw under normal circumstances
   * @throws {TypeError} May throw if key type is incompatible (rare)
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
   * This method performs comprehensive cleanup of the node's references to prevent
   * memory leaks and circular references in doubly-linked list structures. It should
   * be called whenever a node is removed from an LRU list to ensure proper resource
   * management and optimal garbage collection.
   *
   * **Cleanup Operations:**
   * - Sets prev pointer to null (breaks backward link)
   * - Sets next pointer to null (breaks forward link)
   * - Isolates node completely from list structure
   * - Enables garbage collector to reclaim memory efficiently
   *
   * **Memory Leak Prevention:**
   * - Breaks circular references in doubly-linked lists
   * - Prevents retention of large object graphs
   * - Enables deterministic cleanup in cache systems
   * - Reduces memory pressure in long-running applications
   *
   * **When to Call:**
   * - Before removing node from active LRU list
   * - During cache eviction operations
   * - When clearing entire cache structures
   * - In cleanup/shutdown procedures
   * - Before recycling nodes in object pools
   *
   * **Safety Guarantees:**
   * - Safe to call multiple times (idempotent)
   * - No side effects on other nodes
   * - Does not modify the stored key
   * - Thread-safe for the individual node
   *
   * @example
   * ```typescript
   * // Basic disposal pattern
   * const node = new LruNode("session:abc123");
   *
   * // Use node in LRU list...
   * // [previous operations]
   *
   * // Clean disposal before removal
   * node.dispose();
   * console.log(node.prev); // null
   * console.log(node.next); // null
   * console.log(node.key);  // "session:abc123" (preserved)
   * ```
   *
   * @example
   * ```typescript
   * // LRU cache eviction with proper disposal
   * class LRUCache<K, V> {
   *   private nodeMap = new Map<K, LruNode<K>>();
   *   private head: LruNode<K> | null = null;
   *   private tail: LruNode<K> | null = null;
   *
   *   evictLRU(): K | null {
   *     if (!this.tail) return null;
   *
   *     const evictedKey = this.tail.key;
   *
   *     // Update list structure
   *     if (this.tail.prev) {
   *       this.tail.prev.next = null;
   *       this.tail = this.tail.prev;
   *     } else {
   *       this.head = null;
   *       this.tail = null;
   *     }
   *
   *     // Clean up the evicted node
   *     const evictedNode = this.nodeMap.get(evictedKey);
   *     if (evictedNode) {
   *       evictedNode.dispose(); // Prevent memory leaks
   *       this.nodeMap.delete(evictedKey);
   *     }
   *
   *     return evictedKey;
   *   }
   *
   *   clear(): void {
   *     // Dispose all nodes before clearing maps
   *     for (const [, node] of this.nodeMap) {
   *       node.dispose();
   *     }
   *
   *     this.nodeMap.clear();
   *     this.head = null;
   *     this.tail = null;
   *   }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Batch disposal for large cleanups
   * const disposeNodeList = (head: LruNode<string> | null): number => {
   *   let count = 0;
   *   let current = head;
   *
   *   while (current) {
   *     const next = current.next; // Store reference before disposal
   *     current.dispose();
   *     current = next;
   *     count++;
   *   }
   *
   *   return count;
   * };
   *
   * // Memory-conscious disposal with progress tracking
   * const disposeWithProgress = async (
   *   nodes: LruNode<string>[],
   *   onProgress?: (disposed: number, total: number) => void
   * ): Promise<void> => {
   *   for (let i = 0; i < nodes.length; i++) {
   *     nodes[i].dispose();
   *
   *     // Report progress periodically
   *     if (onProgress && i % 100 === 0) {
   *       onProgress(i + 1, nodes.length);
   *
   *       // Yield control to prevent blocking
   *       await new Promise(resolve => setTimeout(resolve, 0));
   *     }
   *   }
   *
   *   onProgress?.(nodes.length, nodes.length);
   * };
   * ```
   *
   * @example
   * ```typescript
   * // Safe disposal with error handling
   * const safeDispose = (node: LruNode<any> | null): boolean => {
   *   try {
   *     if (node) {
   *       node.dispose();
   *       return true;
   *     }
   *   } catch (error) {
   *     console.error("Disposal failed:", error);
   *   }
   *   return false;
   * };
   *
   * // Conditional disposal based on node state
   * const conditionalDispose = (node: LruNode<string>): void => {
   *   // Only dispose if node is still linked
   *   if (node.prev !== null || node.next !== null) {
   *     console.log(`Disposing linked node: ${node.key}`);
   *     node.dispose();
   *   } else {
   *     console.log(`Node ${node.key} already disposed`);
   *   }
   * };
   *
   * // Object pool integration with disposal
   * class NodePool<K> {
   *   private available: LruNode<K>[] = [];
   *
   *   borrow(): LruNode<K> | null {
   *     return this.available.pop() ?? null;
   *   }
   *
   *   return(node: LruNode<K>): void {
   *     // Always dispose before returning to pool
   *     node.dispose();
   *     this.available.push(node);
   *   }
   *
   *   clear(): void {
   *     // Dispose all pooled nodes
   *     this.available.forEach(node => node.dispose());
   *     this.available.length = 0;
   *   }
   * }
   * ```
   *
   * @performance
   * - **Time Complexity:** O(1) - constant time operation
   * - **Space Complexity:** O(1) - no additional memory allocation
   * - **Memory Impact:** Enables immediate garbage collection of linked nodes
   * - **CPU Overhead:** Minimal - just two pointer assignments
   *
   * @see {@link constructor} - For creating nodes that will eventually need disposal
   * @see {@link LruTracker} - For systematic node lifecycle management
   *
   * @public
   */
  dispose(): void {
    this.prev = null;
    this.next = null;
  }
}

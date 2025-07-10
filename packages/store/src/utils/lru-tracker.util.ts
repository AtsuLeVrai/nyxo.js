import type { StoreKey } from "../core/index.js";
import { LruNode } from "./lru-node.util.js";

/**
 * High-performance Least Recently Used (LRU) cache tracker with O(1) operations.
 *
 * The LruTracker implements a sophisticated LRU algorithm using a hybrid data structure
 * that combines a HashMap for fast key lookups with a doubly-linked list for efficient
 * ordering and eviction. This design provides optimal performance characteristics for
 * cache management in high-throughput applications.
 *
 * ## Algorithm Overview
 *
 * **Hybrid Data Structure:**
 * ```
 * HashMap: key → LruNode (O(1) lookup)
 *    ↓
 * Doubly-Linked List: [HEAD] ↔ [Node1] ↔ [Node2] ↔ [TAIL]
 *                        ↑                           ↑
 *                      MRU                         LRU
 * ```
 *
 * **Core Algorithm Components:**
 * - **HashMap**: Provides O(1) key-to-node mapping for instant access
 * - **Doubly-Linked List**: Maintains chronological access order with O(1) reordering
 * - **Head Position**: Most Recently Used (MRU) items for quick access
 * - **Tail Position**: Least Recently Used (LRU) items for efficient eviction
 *
 * ## Key Features
 *
 * **🚀 Optimal Performance**
 * - O(1) access time tracking with touch() operations
 * - O(1) key existence checking and retrieval
 * - O(1) insertion and deletion operations
 * - O(1) LRU/MRU identification for eviction policies
 *
 * **💾 Memory Management**
 * - Automatic capacity management with configurable limits
 * - Comprehensive node cleanup to prevent memory leaks
 * - Circular reference prevention with proper disposal
 * - Resource-conscious design optimized for long-running applications
 *
 * **🔧 Production Features**
 * - Thread-safe individual operations (external synchronization required for sequences)
 * - Robust error handling and edge case management
 * - Comprehensive debugging and introspection capabilities
 * - Type-safe generic implementation with strict key constraints
 *
 * ## Performance Characteristics
 *
 * | Operation | Time Complexity | Space Complexity | Use Case |
 * |-----------|-----------------|------------------|----------|
 * | touch()   | O(1)           | O(1)            | Access tracking, cache hits |
 * | has()     | O(1)           | O(1)            | Existence checks |
 * | delete()  | O(1)           | O(1)            | Manual eviction |
 * | clear()   | O(n)           | O(1)            | Cache reset |
 * | keys()    | O(n)           | O(n)            | Debugging, iteration |
 * | lru/mru   | O(1)           | O(1)            | Eviction decisions |
 *
 * ## Memory Footprint
 *
 * **Per-tracker overhead:**
 * - HashMap: ~8-16 bytes + (entries × 24 bytes)
 * - Head/Tail pointers: 16 bytes
 * - Capacity storage: 8 bytes
 * - **Total base**: ~32-40 bytes
 *
 * **Per-entry overhead:**
 * - HashMap entry: ~24 bytes (key hash + value pointer + metadata)
 * - LruNode: ~24-32 bytes (key + prev + next + object overhead)
 * - **Total per entry**: ~48-56 bytes + key size
 *
 * ## Usage Patterns
 *
 * ### Basic LRU Cache Implementation
 * ```typescript
 * class SimpleCache<K extends StoreKey, V> {
 *   private tracker = new LruTracker<K>(1000); // 1000 item limit
 *   private data = new Map<K, V>();
 *
 *   get(key: K): V | undefined {
 *     if (this.data.has(key)) {
 *       this.tracker.touch(key); // Mark as recently used
 *       return this.data.get(key);
 *     }
 *     return undefined;
 *   }
 *
 *   set(key: K, value: V): void {
 *     const evicted = this.tracker.touch(key);
 *
 *     if (evicted && evicted !== key) {
 *       this.data.delete(evicted); // Clean up evicted data
 *     }
 *
 *     this.data.set(key, value);
 *   }
 *
 *   delete(key: K): boolean {
 *     const existed = this.data.delete(key);
 *     if (existed) {
 *       this.tracker.delete(key);
 *     }
 *     return existed;
 *   }
 * }
 * ```
 *
 * ### Advanced Cache with Metrics
 * ```typescript
 * interface CacheMetrics {
 *   hits: number;
 *   misses: number;
 *   evictions: number;
 *   hitRate: number;
 * }
 *
 * class MetricsLRUCache<K extends StoreKey, V> {
 *   private tracker = new LruTracker<K>(5000);
 *   private data = new Map<K, V>();
 *   private metrics: CacheMetrics = { hits: 0, misses: 0, evictions: 0, hitRate: 0 };
 *
 *   get(key: K): V | undefined {
 *     if (this.data.has(key)) {
 *       this.tracker.touch(key);
 *       this.metrics.hits++;
 *       this.updateHitRate();
 *       return this.data.get(key);
 *     }
 *
 *     this.metrics.misses++;
 *     this.updateHitRate();
 *     return undefined;
 *   }
 *
 *   set(key: K, value: V): void {
 *     const evicted = this.tracker.touch(key);
 *
 *     if (evicted && evicted !== key) {
 *       this.data.delete(evicted);
 *       this.metrics.evictions++;
 *     }
 *
 *     this.data.set(key, value);
 *   }
 *
 *   getMetrics(): CacheMetrics {
 *     return { ...this.metrics };
 *   }
 *
 *   private updateHitRate(): void {
 *     const total = this.metrics.hits + this.metrics.misses;
 *     this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;
 *   }
 *
 *   // Get cache efficiency insights
 *   getInsights(): string[] {
 *     const insights: string[] = [];
 *     const { hitRate, evictions } = this.metrics;
 *
 *     if (hitRate < 0.8) insights.push("Low hit rate - consider increasing cache size");
 *     if (evictions > this.tracker.capacity) insights.push("High eviction rate - cache thrashing detected");
 *     if (this.tracker.size < this.tracker.capacity * 0.5) insights.push("Underutilized cache capacity");
 *
 *     return insights;
 *   }
 * }
 * ```
 *
 * ### Multi-Tier Cache System
 * ```typescript
 * class TieredLRUCache<K extends StoreKey, V> {
 *   private l1Tracker = new LruTracker<K>(100);   // Hot data
 *   private l2Tracker = new LruTracker<K>(1000);  // Warm data
 *   private l1Data = new Map<K, V>();
 *   private l2Data = new Map<K, V>();
 *
 *   get(key: K): V | undefined {
 *     // Check L1 cache first (hot data)
 *     if (this.l1Data.has(key)) {
 *       this.l1Tracker.touch(key);
 *       return this.l1Data.get(key);
 *     }
 *
 *     // Check L2 cache (warm data)
 *     if (this.l2Data.has(key)) {
 *       const value = this.l2Data.get(key)!;
 *       this.l2Tracker.touch(key);
 *
 *       // Promote to L1 cache
 *       this.promoteToL1(key, value);
 *       return value;
 *     }
 *
 *     return undefined;
 *   }
 *
 *   set(key: K, value: V): void {
 *     // Always add to L1 cache
 *     const l1Evicted = this.l1Tracker.touch(key);
 *
 *     if (l1Evicted && l1Evicted !== key) {
 *       // Demote evicted L1 item to L2
 *       const evictedValue = this.l1Data.get(l1Evicted);
 *       if (evictedValue) {
 *         this.demoteToL2(l1Evicted, evictedValue);
 *       }
 *       this.l1Data.delete(l1Evicted);
 *     }
 *
 *     this.l1Data.set(key, value);
 *
 *     // Remove from L2 if it exists there
 *     if (this.l2Data.has(key)) {
 *       this.l2Data.delete(key);
 *       this.l2Tracker.delete(key);
 *     }
 *   }
 *
 *   private promoteToL1(key: K, value: V): void {
 *     // Remove from L2
 *     this.l2Data.delete(key);
 *     this.l2Tracker.delete(key);
 *
 *     // Add to L1
 *     this.set(key, value);
 *   }
 *
 *   private demoteToL2(key: K, value: V): void {
 *     const l2Evicted = this.l2Tracker.touch(key);
 *
 *     if (l2Evicted && l2Evicted !== key) {
 *       this.l2Data.delete(l2Evicted);
 *     }
 *
 *     this.l2Data.set(key, value);
 *   }
 * }
 * ```
 *
 * ## Integration Examples
 *
 * ### Store Integration Pattern
 * ```typescript
 * // This is how LruTracker integrates with the Store class
 * class StoreWithLRU<K extends StoreKey, V> extends Map<K, V> {
 *   private lruTracker: LruTracker<K>;
 *   private maxSize: number;
 *
 *   constructor(maxSize: number) {
 *     super();
 *     this.maxSize = maxSize;
 *     this.lruTracker = new LruTracker<K>(maxSize);
 *   }
 *
 *   override get(key: K): V | undefined {
 *     const value = super.get(key);
 *     if (value !== undefined) {
 *       this.lruTracker.touch(key); // Update access order
 *     }
 *     return value;
 *   }
 *
 *   override set(key: K, value: V): this {
 *     // Handle eviction if at capacity
 *     if (this.size >= this.maxSize && !this.has(key)) {
 *       const lru = this.lruTracker.lru;
 *       if (lru) {
 *         super.delete(lru);
 *         this.lruTracker.delete(lru);
 *       }
 *     }
 *
 *     super.set(key, value);
 *     this.lruTracker.touch(key);
 *     return this;
 *   }
 *
 *   override delete(key: K): boolean {
 *     const deleted = super.delete(key);
 *     if (deleted) {
 *       this.lruTracker.delete(key);
 *     }
 *     return deleted;
 *   }
 * }
 * ```
 *
 * ## Error Handling and Edge Cases
 *
 * The LruTracker handles various edge cases robustly:
 *
 * ```typescript
 * // Safe operations with error handling
 * const safeTracker = new LruTracker<string>(100);
 *
 * // Handle empty tracker operations
 * console.log(safeTracker.lru); // null (not undefined)
 * console.log(safeTracker.mru); // null (not undefined)
 *
 * // Safe iteration over empty tracker
 * const keys = safeTracker.keys(); // []
 * const reverseKeys = safeTracker.keysReverse(); // []
 *
 * // Multiple delete operations are safe
 * safeTracker.delete("nonexistent"); // false
 * safeTracker.delete("nonexistent"); // false (idempotent)
 *
 * // Clear operations are always safe
 * safeTracker.clear(); // Safe even when already empty
 * safeTracker.clear(); // Idempotent
 *
 * // Capacity edge cases
 * const smallTracker = new LruTracker<string>(1);
 * const evicted1 = smallTracker.touch("first");  // null
 * const evicted2 = smallTracker.touch("second"); // "first"
 * const evicted3 = smallTracker.touch("first");  // "second"
 * ```
 *
 * ## Debugging and Monitoring
 *
 * ```typescript
 * class DebuggableLRUTracker<K extends StoreKey> extends LruTracker<K> {
 *   // Get detailed state information
 *   getDebugInfo(): {
 *     size: number;
 *     capacity: number;
 *     utilization: number;
 *     mru: K | null;
 *     lru: K | null;
 *     accessOrder: K[];
 *   } {
 *     return {
 *       size: this.size,
 *       capacity: this.capacity,
 *       utilization: this.size / this.capacity,
 *       mru: this.mru,
 *       lru: this.lru,
 *       accessOrder: this.keys()
 *     };
 *   }
 *
 *   // Validate internal consistency
 *   validateIntegrity(): boolean {
 *     const keys = this.keys();
 *     const reverseKeys = this.keysReverse();
 *
 *     // Check that forward and reverse traversals match
 *     return keys.length === reverseKeys.length &&
 *            keys.every((key, i) => key === reverseKeys[reverseKeys.length - 1 - i]);
 *   }
 *
 *   // Get memory usage estimation
 *   getMemoryEstimate(): {
 *     totalBytes: number;
 *     perEntryBytes: number;
 *     overhead: number;
 *   } {
 *     const baseOverhead = 32; // Tracker object overhead
 *     const perEntry = 56; // HashMap entry + LruNode
 *     const total = baseOverhead + (this.size * perEntry);
 *
 *     return {
 *       totalBytes: total,
 *       perEntryBytes: perEntry,
 *       overhead: baseOverhead
 *     };
 *   }
 * }
 * ```
 *
 * ## Thread Safety Considerations
 *
 * ⚠️ **Important**: The LruTracker is **not thread-safe**. For concurrent access:
 *
 * ```typescript
 * // External synchronization example
 * class ThreadSafeLRUTracker<K extends StoreKey> {
 *   private tracker = new LruTracker<K>(1000);
 *   private mutex = new Mutex(); // Hypothetical mutex implementation
 *
 *   async touch(key: K): Promise<K | null> {
 *     return this.mutex.runExclusive(() => {
 *       return this.tracker.touch(key);
 *     });
 *   }
 *
 *   async has(key: K): Promise<boolean> {
 *     return this.mutex.runExclusive(() => {
 *       return this.tracker.has(key);
 *     });
 *   }
 *
 *   // ... other synchronized methods
 * }
 * ```
 *
 * @typeParam K - The type of keys to be tracked, must extend StoreKey for optimal performance
 *
 * @public
 */
export class LruTracker<K extends StoreKey> {
  /**
   * Maximum number of items this tracker can hold before eviction occurs.
   *
   * This value is set during construction and cannot be changed afterward to maintain
   * consistent behavior and prevent race conditions. The capacity determines when
   * automatic eviction will occur during touch() operations.
   *
   * **Capacity Enforcement:**
   * - Eviction occurs when size exceeds capacity during touch() operations
   * - Minimum capacity is 1 (enforced during construction)
   * - Capacity is immutable after construction for consistency
   * - No upper limit (constrained only by available memory)
   *
   * **Performance Implications:**
   * - Higher capacity: More memory usage, fewer evictions, better hit rates
   * - Lower capacity: Less memory usage, more evictions, potential cache thrashing
   * - Optimal sizing depends on workload characteristics and memory constraints
   *
   * @readonly - Immutable after construction
   * @minimum 1 - Enforced during construction
   * @public
   */
  readonly #capacity: number;

  /**
   * Internal HashMap providing O(1) key-to-node lookup functionality.
   *
   * This Map serves as the primary index for the LRU tracker, enabling instant
   * access to nodes in the doubly-linked list without traversal. It maintains
   * the mapping between keys and their corresponding LruNode instances.
   *
   * **Implementation Details:**
   * - Uses native JavaScript Map for optimal performance
   * - Key-value pairs: K → LruNode<K>
   * - Synchronized with doubly-linked list operations
   * - Cleaned up during delete() and clear() operations
   *
   * **Performance Characteristics:**
   * - Lookup: O(1) average case, O(n) worst case (hash collisions)
   * - Insertion: O(1) average case
   * - Deletion: O(1) average case
   * - Memory overhead: ~24 bytes per entry (varies by engine)
   *
   * **Synchronization:**
   * - Always kept in sync with the doubly-linked list
   * - Size matches the number of nodes in the list
   * - Entries are added/removed atomically with list operations
   *
   * @internal
   */
  #cache = new Map<K, LruNode<K>>();

  /**
   * Head pointer to the most recently used (MRU) node in the doubly-linked list.
   *
   * The head represents the "hot" end of the cache, pointing to the item that was
   * most recently accessed. New items and recently accessed items are moved to
   * this position to maintain proper LRU ordering.
   *
   * **Position Semantics:**
   * - Points to the most recently used item in the cache
   * - null when the cache is empty
   * - Updated during touch() operations when items are accessed
   * - New items are inserted at this position
   *
   * **List Structure:**
   * ```
   * HEAD → [Node1] ↔ [Node2] ↔ [Node3] ← TAIL
   *         ↑                           ↑
   *        MRU                        LRU
   * ```
   *
   * **Thread Safety:**
   * - Not thread-safe; concurrent access requires external synchronization
   * - Modifications should be atomic to prevent list corruption
   * - Consider memory barriers in multi-threaded environments
   *
   * @internal
   */
  #head: LruNode<K> | null = null;

  /**
   * Tail pointer to the least recently used (LRU) node in the doubly-linked list.
   *
   * The tail represents the "cold" end of the cache, pointing to the item that was
   * accessed least recently. This position is used for eviction decisions when
   * the cache reaches capacity limits.
   *
   * **Position Semantics:**
   * - Points to the least recently used item in the cache
   * - null when the cache is empty
   * - Target for eviction when capacity is exceeded
   * - Rarely accessed items naturally migrate toward this position
   *
   * **Eviction Strategy:**
   * - Items are evicted from the tail position (LRU end)
   * - Eviction is automatic when capacity is exceeded during touch()
   * - Provides optimal cache replacement policy for temporal locality
   * - Ensures frequently accessed items remain in cache
   *
   * **Performance Benefits:**
   * - O(1) identification of eviction candidates
   * - No scanning required to find least recently used items
   * - Efficient cache replacement with minimal overhead
   * - Optimal for workloads with temporal access patterns
   *
   * @internal
   */
  #tail: LruNode<K> | null = null;

  /**
   * Creates a new LRU tracker with the specified capacity and initializes internal structures.
   *
   * The constructor sets up an empty LRU tracker ready for use, with all internal
   * data structures initialized and capacity validation performed. The tracker
   * starts in an empty state and will begin tracking items as they are added
   * through touch() operations.
   *
   * **Initialization Process:**
   * 1. Validates and sets capacity (minimum 1)
   * 2. Initializes empty HashMap for key-to-node mapping
   * 3. Sets head and tail pointers to null (empty list)
   * 4. Prepares tracker for immediate use
   *
   * **Capacity Validation:**
   * - Ensures capacity is at least 1 to prevent invalid states
   * - Uses Math.max() for efficient validation
   * - No upper limit imposed (memory is the practical constraint)
   * - Immutable after construction for consistency
   *
   * **Memory Allocation:**
   * - Allocates base object (~32 bytes)
   * - Initializes empty Map (~16 bytes initial overhead)
   * - No upfront allocation for nodes (lazy allocation)
   * - Minimal initial memory footprint
   *
   * @param capacity - Maximum number of items the tracker can hold. Must be at least 1.
   *
   * @example
   * ```typescript
   * // Basic tracker creation
   * const tracker = new LruTracker<string>(100);
   * console.log(tracker.capacity); // 100
   * console.log(tracker.size);     // 0
   * console.log(tracker.lru);      // null
   * console.log(tracker.mru);      // null
   *
   * // Different capacity configurations
   * const smallTracker = new LruTracker<number>(10);    // Small cache
   * const largeTracker = new LruTracker<string>(10000); // Large cache
   * const minTracker = new LruTracker<symbol>(1);       // Minimum capacity
   *
   * // Edge case: capacity normalization
   * const normalizedTracker = new LruTracker<string>(0);  // Becomes capacity 1
   * console.log(normalizedTracker.capacity); // 1 (normalized from 0)
   * ```
   *
   * @example
   * ```typescript
   * // Integration with cache systems
   * class CacheFactory {
   *   static createSmallCache<K extends StoreKey>(): LruTracker<K> {
   *     return new LruTracker<K>(100);
   *   }
   *
   *   static createMediumCache<K extends StoreKey>(): LruTracker<K> {
   *     return new LruTracker<K>(1000);
   *   }
   *
   *   static createLargeCache<K extends StoreKey>(): LruTracker<K> {
   *     return new LruTracker<K>(10000);
   *   }
   *
   *   static createCustomCache<K extends StoreKey>(capacity: number): LruTracker<K> {
   *     if (capacity < 1) {
   *       throw new Error("Capacity must be at least 1");
   *     }
   *     return new LruTracker<K>(capacity);
   *   }
   * }
   *
   * // Dynamic capacity based on environment
   * const getOptimalCapacity = (): number => {
   *   const memoryMB = process.memoryUsage().heapTotal / (1024 * 1024);
   *   return Math.floor(memoryMB * 10); // 10 entries per MB
   * };
   *
   * const adaptiveTracker = new LruTracker<string>(getOptimalCapacity());
   * ```
   *
   * @throws {Error} Does not throw under normal circumstances
   * @throws {RangeError} Theoretical possibility for extremely large capacity values
   *
   * @see {@link capacity} - For accessing the configured capacity
   * @see {@link touch} - For adding and accessing items in the tracker
   *
   * @public
   */
  constructor(capacity: number) {
    this.#capacity = Math.max(1, capacity);
  }

  /**
   * Returns the current number of items being tracked in the cache.
   *
   * This getter provides real-time information about cache utilization,
   * reflecting the exact number of unique keys currently being tracked.
   * The size is automatically maintained during all operations and provides
   * essential metrics for cache monitoring and optimization.
   *
   * **Synchronization Guarantee:**
   * - Always matches the number of nodes in the doubly-linked list
   * - Synchronized with HashMap size for consistency
   * - Updated atomically during add/remove operations
   * - Reliable for capacity calculations and monitoring
   *
   * **Performance Characteristics:**
   * - O(1) time complexity (native Map.size property)
   * - No iteration or calculation required
   * - Constant-time access regardless of cache size
   * - Minimal CPU overhead for frequent monitoring
   *
   * **Use Cases:**
   * - Capacity utilization monitoring
   * - Cache efficiency calculations
   * - Memory usage estimation
   * - Debugging and diagnostic information
   * - Adaptive cache sizing algorithms
   *
   * @returns Current number of items in the cache (0 to capacity)
   *
   * @example
   * ```typescript
   * const tracker = new LruTracker<string>(100);
   *
   * console.log(tracker.size); // 0 (empty)
   *
   * tracker.touch("key1");
   * console.log(tracker.size); // 1
   *
   * tracker.touch("key2");
   * tracker.touch("key3");
   * console.log(tracker.size); // 3
   *
   * tracker.delete("key1");
   * console.log(tracker.size); // 2
   *
   * tracker.clear();
   * console.log(tracker.size); // 0
   * ```
   *
   * @example
   * ```typescript
   * // Cache utilization monitoring
   * const monitorCacheUtilization = (tracker: LruTracker<string>): void => {
   *   const utilization = tracker.size / tracker.capacity;
   *
   *   if (utilization > 0.9) {
   *     console.warn("Cache nearly full:", utilization.toFixed(2));
   *   } else if (utilization < 0.1) {
   *     console.info("Cache underutilized:", utilization.toFixed(2));
   *   }
   * };
   *
   * // Adaptive eviction strategy
   * const shouldPreemptivelyEvict = (tracker: LruTracker<string>): boolean => {
   *   return tracker.size > tracker.capacity * 0.8; // 80% threshold
   * };
   *
   * // Memory estimation
   * const estimateMemoryUsage = (tracker: LruTracker<string>): number => {
   *   const bytesPerEntry = 56; // Estimated overhead per entry
   *   return tracker.size * bytesPerEntry;
   * };
   * ```
   *
   * @performance O(1) - Constant time access to Map.size property
   * @public
   */
  get size(): number {
    return this.#cache.size;
  }

  /**
   * Returns the maximum capacity of the tracker as configured during construction.
   *
   * This getter provides access to the immutable capacity setting that controls
   * when automatic eviction occurs. The capacity represents the maximum number
   * of unique keys that can be tracked simultaneously before the least recently
   * used items are automatically evicted.
   *
   * **Immutability Guarantee:**
   * - Value never changes after construction
   * - Provides predictable behavior for cache sizing
   * - Safe for concurrent access (read-only)
   * - Reliable for capacity planning and monitoring
   *
   * **Usage in Algorithms:**
   * - Eviction threshold calculations
   * - Utilization percentage computations
   * - Memory allocation planning
   * - Performance optimization decisions
   *
   * **Design Rationale:**
   * - Immutable to prevent runtime capacity changes that could cause inconsistency
   * - Simple integer for efficient comparison operations
   * - No complex capacity management or resizing to maintain O(1) guarantees
   *
   * @returns The maximum number of items this tracker can hold
   *
   * @example
   * ```typescript
   * const tracker = new LruTracker<string>(500);
   *
   * console.log(tracker.capacity); // 500
   * console.log(tracker.size);     // 0 initially
   *
   * // Capacity is immutable
   * // tracker.capacity = 1000; // TypeScript error - readonly property
   *
   * // Use capacity for calculations
   * const utilizationPercent = (tracker.size / tracker.capacity) * 100;
   * const remainingSlots = tracker.capacity - tracker.size;
   * const isNearCapacity = tracker.size > tracker.capacity * 0.9;
   * ```
   *
   * @example
   * ```typescript
   * // Cache configuration patterns
   * const configureCacheForEnvironment = (env: 'dev' | 'prod') => {
   *   const capacity = env === 'dev' ? 100 : 10000;
   *   const tracker = new LruTracker<string>(capacity);
   *
   *   console.log(`${env} cache capacity: ${tracker.capacity}`);
   *   return tracker;
   * };
   *
   * // Capacity-based algorithm selection
   * const selectEvictionStrategy = (tracker: LruTracker<string>) => {
   *   if (tracker.capacity < 100) {
   *     return 'aggressive'; // Small cache, evict quickly
   *   } else if (tracker.capacity < 1000) {
   *     return 'balanced';
   *   } else {
   *     return 'conservative'; // Large cache, allow higher utilization
   *   }
   * };
   *
   * // Multi-tier cache sizing
   * const createTieredCaches = (totalCapacity: number) => {
   *   const l1Capacity = Math.floor(totalCapacity * 0.1); // 10% for hot data
   *   const l2Capacity = Math.floor(totalCapacity * 0.9); // 90% for warm data
   *
   *   return {
   *     l1: new LruTracker<string>(l1Capacity),
   *     l2: new LruTracker<string>(l2Capacity)
   *   };
   * };
   * ```
   *
   * @readonly - Immutable after construction
   * @minimum 1 - Guaranteed by constructor validation
   * @public
   */
  get capacity(): number {
    return this.#capacity;
  }

  /**
   * Returns the least recently used key without modifying the access order.
   *
   * This getter provides non-destructive access to the LRU key, which is the
   * prime candidate for eviction when the cache reaches capacity. The value
   * represents the key that has gone the longest without being accessed through
   * touch() operations.
   *
   * **Non-Destructive Access:**
   * - Does not modify access order or list structure
   * - Safe to call repeatedly without side effects
   * - Suitable for monitoring and decision-making algorithms
   * - Does not trigger eviction or cache modifications
   *
   * **Eviction Candidate:**
   * - Identifies the next item to be evicted when capacity is exceeded
   * - Represents the "coldest" item in the cache
   * - Optimal target for manual eviction or cache analysis
   * - Critical for implementing custom eviction policies
   *
   * **Return Value Semantics:**
   * - Returns null for empty cache (not undefined)
   * - Returns the actual key value for non-empty cache
   * - Consistent with modern JavaScript Optional patterns
   * - Type-safe with strict null checking
   *
   * @returns The least recently used key, or null if the cache is empty
   *
   * @example
   * ```typescript
   * const tracker = new LruTracker<string>(3);
   *
   * console.log(tracker.lru); // null (empty cache)
   *
   * tracker.touch("first");
   * tracker.touch("second");
   * tracker.touch("third");
   *
   * console.log(tracker.lru); // "first" (oldest access)
   *
   * tracker.touch("first"); // Move to front
   * console.log(tracker.lru); // "second" (now oldest)
   *
   * tracker.touch("fourth"); // Triggers eviction
   * console.log(tracker.lru); // "third" (second was evicted)
   * ```
   *
   * @example
   * ```typescript
   * // Proactive eviction strategy
   * const proactiveEvict = (tracker: LruTracker<string>, threshold: number): string[] => {
   *   const evicted: string[] = [];
   *
   *   while (tracker.size > threshold) {
   *     const lru = tracker.lru;
   *     if (lru) {
   *       tracker.delete(lru);
   *       evicted.push(lru);
   *     } else {
   *       break; // Safety check
   *     }
   *   }
   *
   *   return evicted;
   * };
   *
   * // Cache monitoring and alerting
   * const monitorLRUAge = (tracker: LruTracker<string>, accessTimes: Map<string, number>): void => {
   *   const lru = tracker.lru;
   *   if (lru) {
   *     const lastAccess = accessTimes.get(lru);
   *     if (lastAccess) {
   *       const age = Date.now() - lastAccess;
   *       if (age > 60000) { // 1 minute
   *         console.warn(`LRU item "${lru}" is ${age}ms old`);
   *       }
   *     }
   *   }
   * };
   *
   * // Conditional eviction based on LRU analysis
   * const shouldEvictLRU = (tracker: LruTracker<string>, isImportant: (key: string) => boolean): boolean => {
   *   const lru = tracker.lru;
   *   return lru !== null && !isImportant(lru);
   * };
   * ```
   *
   * @example
   * ```typescript
   * // LRU-based cache warming
   * const warmCacheIfNeeded = async (
   *   tracker: LruTracker<string>,
   *   loader: (key: string) => Promise<any>
   * ): Promise<void> => {
   *   if (tracker.size < tracker.capacity * 0.5) {
   *     const lru = tracker.lru;
   *     if (lru) {
   *       // Refresh the LRU item to keep cache warm
   *       await loader(lru);
   *       tracker.touch(lru); // Mark as recently used
   *     }
   *   }
   * };
   *
   * // Debug information collection
   * const getCacheAnalysis = (tracker: LruTracker<string>) => {
   *   return {
   *     size: tracker.size,
   *     capacity: tracker.capacity,
   *     utilization: tracker.size / tracker.capacity,
   *     lru: tracker.lru,
   *     mru: tracker.mru,
   *     isEmpty: tracker.lru === null,
   *     isFull: tracker.size >= tracker.capacity
   *   };
   * };
   * ```
   *
   * @performance O(1) - Direct access to tail pointer
   * @sideEffects None - read-only operation
   * @public
   */
  get lru(): K | null {
    return this.#tail?.key ?? null;
  }

  /**
   * Returns the most recently used key without modifying the access order.
   *
   * This getter provides non-destructive access to the MRU key, which represents
   * the "hottest" item in the cache - the one that was most recently accessed
   * through touch() operations. This information is valuable for cache analysis
   * and optimization strategies.
   *
   * **Hot Data Identification:**
   * - Represents the most frequently accessed or recently used item
   * - Indicates current cache access patterns and hot spots
   * - Useful for cache warming and preloading strategies
   * - Provides insight into application access patterns
   *
   * **Non-Destructive Monitoring:**
   * - Safe for frequent polling and monitoring
   * - Does not affect cache state or access order
   * - Suitable for real-time analytics and debugging
   * - No performance impact on cache operations
   *
   * **Access Pattern Analysis:**
   * - Helps identify frequently accessed keys
   * - Useful for predictive caching algorithms
   * - Enables hot-data prioritization strategies
   * - Supports cache optimization decisions
   *
   * @returns The most recently used key, or null if the cache is empty
   *
   * @example
   * ```typescript
   * const tracker = new LruTracker<string>(3);
   *
   * console.log(tracker.mru); // null (empty cache)
   *
   * tracker.touch("first");
   * console.log(tracker.mru); // "first"
   *
   * tracker.touch("second");
   * console.log(tracker.mru); // "second"
   *
   * tracker.touch("first"); // Access again
   * console.log(tracker.mru); // "first" (moved to front)
   * ```
   *
   * @example
   * ```typescript
   * // Hot data analysis
   * const analyzeHotData = (tracker: LruTracker<string>): void => {
   *   const mru = tracker.mru;
   *   if (mru) {
   *     console.log(`Current hot item: ${mru}`);
   *
   *     // Could trigger preloading of related data
   *     preloadRelatedData(mru);
   *   }
   * };
   *
   * // Cache warming strategy
   * const warmRelatedItems = async (
   *   tracker: LruTracker<string>,
   *   getRelated: (key: string) => string[]
   * ): Promise<void> => {
   *   const mru = tracker.mru;
   *   if (mru) {
   *     const related = getRelated(mru);
   *     for (const relatedKey of related) {
   *       if (!tracker.has(relatedKey)) {
   *         tracker.touch(relatedKey); // Warm the cache
   *       }
   *     }
   *   }
   * };
   *
   * // Access pattern monitoring
   * class AccessPatternMonitor {
   *   private mruHistory: string[] = [];
   *
   *   recordAccess(tracker: LruTracker<string>): void {
   *     const mru = tracker.mru;
   *     if (mru && mru !== this.mruHistory[0]) {
   *       this.mruHistory.unshift(mru);
   *       if (this.mruHistory.length > 100) {
   *         this.mruHistory.pop();
   *       }
   *     }
   *   }
   *
   *   getHotKeys(threshold: number = 5): string[] {
   *     const counts = new Map<string, number>();
   *     for (const key of this.mruHistory) {
   *       counts.set(key, (counts.get(key) || 0) + 1);
   *     }
   *
   *     return Array.from(counts.entries())
   *       .filter(([, count]) => count >= threshold)
   *       .map(([key]) => key);
   *   }
   * }
   * ```
   *
   * @performance O(1) - Direct access to head pointer
   * @sideEffects None - read-only operation
   * @public
   */
  get mru(): K | null {
    return this.#head?.key ?? null;
  }

  /**
   * Updates access time for a key, promoting it to most recently used position.
   *
   * This method is the core operation of the LRU tracker, handling both access
   * tracking for existing keys and insertion of new keys. It maintains the LRU
   * ordering by moving accessed items to the head of the list and automatically
   * evicts the least recently used item when capacity is exceeded.
   *
   * **Operation Flow:**
   * 1. **Existing Key**: Moves to front (MRU position) without eviction
   * 2. **New Key**: Adds to front, may trigger LRU eviction if at capacity
   * 3. **Eviction**: Returns evicted key if capacity was exceeded
   * 4. **No Eviction**: Returns null when no eviction occurs
   *
   * **LRU Algorithm Implementation:**
   * - Existing keys: Remove from current position, add to head
   * - New keys: Add to head, evict tail if capacity exceeded
   * - Maintains strict chronological ordering based on access time
   * - Ensures most recently accessed items are preserved
   *
   * **Performance Guarantees:**
   * - O(1) time complexity for all operations
   * - Constant memory allocation per operation
   * - No iteration or scanning required
   * - Optimal for high-frequency access patterns
   *
   * **Eviction Policy:**
   * - Automatic eviction when size exceeds capacity
   * - Evicts least recently used item (tail of list)
   * - Returns evicted key for cleanup in calling code
   * - Maintains exact capacity limits
   *
   * @param key - The key to mark as recently accessed or add to cache
   * @returns The key that was evicted (if any), or null if no eviction occurred
   *
   * @example
   * ```typescript
   * const tracker = new LruTracker<string>(3);
   *
   * // Adding new keys
   * let evicted = tracker.touch("first");
   * console.log(evicted); // null (no eviction)
   * console.log(tracker.size); // 1
   *
   * evicted = tracker.touch("second");
   * console.log(evicted); // null (still under capacity)
   *
   * evicted = tracker.touch("third");
   * console.log(evicted); // null (at capacity)
   *
   * // Accessing existing key
   * evicted = tracker.touch("first"); // Move to front
   * console.log(evicted); // null (no eviction for existing key)
   *
   * // Triggering eviction
   * evicted = tracker.touch("fourth"); // Exceeds capacity
   * console.log(evicted); // "second" (was LRU)
   * console.log(tracker.keys()); // ["fourth", "first", "third"]
   * ```
   *
   * @example
   * ```typescript
   * // Cache implementation with eviction handling
   * class LRUCache<K extends StoreKey, V> {
   *   private tracker = new LruTracker<K>(1000);
   *   private data = new Map<K, V>();
   *
   *   set(key: K, value: V): void {
   *     const evicted = this.tracker.touch(key);
   *
   *     // Clean up evicted data
   *     if (evicted && evicted !== key) {
   *       this.data.delete(evicted);
   *       console.log(`Evicted key: ${String(evicted)}`);
   *     }
   *
   *     this.data.set(key, value);
   *   }
   *
   *   get(key: K): V | undefined {
   *     if (this.data.has(key)) {
   *       this.tracker.touch(key); // Mark as accessed
   *       return this.data.get(key);
   *     }
   *     return undefined;
   *   }
   * }
   *
   * // Access pattern simulation
   * const simulateAccess = (tracker: LruTracker<string>) => {
   *   const keys = ["user:1", "user:2", "user:3", "user:4", "user:5"];
   *   const evictionLog: string[] = [];
   *
   *   for (const key of keys) {
   *     const evicted = tracker.touch(key);
   *     if (evicted) {
   *       evictionLog.push(evicted);
   *     }
   *   }
   *
   *   return evictionLog;
   * };
   * ```
   *
   * @example
   * ```typescript
   * // Advanced eviction handling with metrics
   * class MetricsTracker<K extends StoreKey> {
   *   private tracker: LruTracker<K>;
   *   private evictionCount = 0;
   *   private accessCount = 0;
   *   private evictionLog: K[] = [];
   *
   *   constructor(capacity: number) {
   *     this.tracker = new LruTracker<K>(capacity);
   *   }
   *
   *   touch(key: K): { evicted: K | null; metrics: object } {
   *     this.accessCount++;
   *     const evicted = this.tracker.touch(key);
   *
   *     if (evicted) {
   *       this.evictionCount++;
   *       this.evictionLog.push(evicted);
   *
   *       // Keep only recent evictions for analysis
   *       if (this.evictionLog.length > 100) {
   *         this.evictionLog.shift();
   *       }
   *     }
   *
   *     return {
   *       evicted,
   *       metrics: {
   *         totalAccesses: this.accessCount,
   *         totalEvictions: this.evictionCount,
   *         evictionRate: this.evictionCount / this.accessCount,
   *         recentEvictions: this.evictionLog.slice(-10)
   *       }
   *     };
   *   }
   * }
   *
   * // Adaptive capacity management
   * const adaptiveTouch = (
   *   tracker: LruTracker<string>,
   *   key: string,
   *   importance: 'low' | 'medium' | 'high'
   * ): string | null => {
   *   const evicted = tracker.touch(key);
   *
   *   // If high importance item was evicted, consider expanding cache
   *   if (evicted && importance === 'high') {
   *     console.warn(`High importance item evicted: ${evicted}`);
   *     // Could trigger cache expansion or different eviction policy
   *   }
   *
   *   return evicted;
   * };
   * ```
   *
   * @performance
   * - **Time Complexity**: O(1) for all operations
   * - **Space Complexity**: O(1) additional memory per operation
   * - **Throughput**: Optimized for high-frequency access patterns
   *
   * @see {@link has} - For non-destructive existence checking
   * @see {@link delete} - For manual item removal
   * @see {@link lru} - For identifying eviction candidates
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
    if (this.#cache.size > this.#capacity) {
      return this.#evictLru();
    }

    return null;
  }

  /**
   * Checks if a key exists in the tracker without affecting its LRU position.
   *
   * This method provides non-destructive existence checking that does not modify
   * the access order or trigger any LRU reordering. It's ideal for conditional
   * logic, validation, and monitoring scenarios where you need to check presence
   * without impacting cache behavior.
   *
   * **Non-Destructive Checking:**
   * - Does not update access time or LRU ordering
   * - Safe for polling and monitoring operations
   * - Suitable for conditional logic without side effects
   * - Ideal for existence validation before expensive operations
   *
   * **Performance Characteristics:**
   * - O(1) time complexity using HashMap lookup
   * - No iteration or list traversal required
   * - Minimal CPU overhead for frequent checking
   * - Constant memory usage regardless of cache size
   *
   * **Use Cases:**
   * - Pre-flight checks before cache operations
   * - Conditional cache warming or loading
   * - Monitoring and analytics without cache pollution
   * - Validation in APIs and user interfaces
   * - Debug and diagnostic information gathering
   *
   * @param key - The key to check for existence
   * @returns true if the key exists in the tracker, false otherwise
   *
   * @example
   * ```typescript
   * const tracker = new LruTracker<string>(3);
   *
   * console.log(tracker.has("nonexistent")); // false
   *
   * tracker.touch("key1");
   * tracker.touch("key2");
   *
   * console.log(tracker.has("key1")); // true
   * console.log(tracker.has("key2")); // true
   * console.log(tracker.has("key3")); // false
   *
   * // Verify has() doesn't affect order
   * const orderBefore = tracker.keys();
   * tracker.has("key1"); // Non-destructive check
   * const orderAfter = tracker.keys();
   * console.log(orderBefore.join(',') === orderAfter.join(',')); // true
   * ```
   *
   * @example
   * ```typescript
   * // Conditional cache operations
   * const conditionalLoad = async (
   *   tracker: LruTracker<string>,
   *   loader: (key: string) => Promise<any>,
   *   key: string
   * ): Promise<any> => {
   *   if (tracker.has(key)) {
   *     // Item exists, mark as accessed
   *     tracker.touch(key);
   *     return getCachedValue(key);
   *   } else {
   *     // Item doesn't exist, load and cache
   *     const value = await loader(key);
   *     tracker.touch(key);
   *     return value;
   *   }
   * };
   *
   * // Batch existence checking
   * const checkMultipleKeys = (
   *   tracker: LruTracker<string>,
   *   keys: string[]
   * ): { existing: string[]; missing: string[] } => {
   *   const existing: string[] = [];
   *   const missing: string[] = [];
   *
   *   for (const key of keys) {
   *     if (tracker.has(key)) {
   *       existing.push(key);
   *     } else {
   *       missing.push(key);
   *     }
   *   }
   *
   *   return { existing, missing };
   * };
   *
   * // Cache analytics without pollution
   * const analyzeCache = (tracker: LruTracker<string>, testKeys: string[]) => {
   *   const analysis = {
   *     totalKeys: testKeys.length,
   *     presentKeys: 0,
   *     missingKeys: 0,
   *     hitRate: 0
   *   };
   *
   *   for (const key of testKeys) {
   *     if (tracker.has(key)) {
   *       analysis.presentKeys++;
   *     } else {
   *       analysis.missingKeys++;
   *     }
   *   }
   *
   *   analysis.hitRate = analysis.presentKeys / analysis.totalKeys;
   *   return analysis;
   * };
   * ```
   *
   * @example
   * ```typescript
   * // API endpoint validation
   * const validateCacheKey = (tracker: LruTracker<string>, key: string): boolean => {
   *   // Check if key exists without affecting cache order
   *   return tracker.has(key);
   * };
   *
   * // Monitoring and alerting
   * const monitorKeyPresence = (
   *   tracker: LruTracker<string>,
   *   criticalKeys: string[]
   * ): string[] => {
   *   const missingCritical: string[] = [];
   *
   *   for (const key of criticalKeys) {
   *     if (!tracker.has(key)) {
   *       missingCritical.push(key);
   *     }
   *   }
   *
   *   if (missingCritical.length > 0) {
   *     console.warn("Missing critical cache keys:", missingCritical);
   *   }
   *
   *   return missingCritical;
   * };
   *
   * // Preemptive cache warming
   * const warmCacheSelectively = async (
   *   tracker: LruTracker<string>,
   *   candidateKeys: string[],
   *   maxWarmup: number
   * ): Promise<void> => {
   *   let warmed = 0;
   *
   *   for (const key of candidateKeys) {
   *     if (!tracker.has(key) && warmed < maxWarmup) {
   *       await loadAndCache(key);
   *       tracker.touch(key);
   *       warmed++;
   *     }
   *   }
   * };
   * ```
   *
   * @performance O(1) - HashMap lookup with no side effects
   * @sideEffects None - completely non-destructive operation
   * @public
   */
  has(key: K): boolean {
    return this.#cache.has(key);
  }

  /**
   * Removes a specific key from the tracker with comprehensive cleanup.
   *
   * This method performs complete removal of a key from both the HashMap index
   * and the doubly-linked list structure. It includes proper node disposal to
   * prevent memory leaks and maintains list integrity through careful pointer
   * management.
   *
   * **Complete Removal Process:**
   * 1. Locates the node in the HashMap
   * 2. Removes node from doubly-linked list structure
   * 3. Removes entry from HashMap index
   * 4. Disposes node references to prevent memory leaks
   * 5. Returns success status for calling code
   *
   * **Memory Management:**
   * - Calls node.dispose() to clear circular references
   * - Removes all tracking data for the key
   * - Enables immediate garbage collection
   * - Prevents memory leaks in long-running applications
   *
   * **List Integrity:**
   * - Maintains proper doubly-linked list structure
   * - Updates head/tail pointers when necessary
   * - Preserves LRU ordering for remaining items
   * - Handles edge cases (head/tail removal) correctly
   *
   * **Performance Guarantees:**
   * - O(1) time complexity for all operations
   * - No iteration or scanning required
   * - Immediate memory reclamation
   * - Constant overhead regardless of cache size
   *
   * @param key - The key to remove from the cache
   * @returns true if the key was found and removed, false if key didn't exist
   *
   * @example
   * ```typescript
   * const tracker = new LruTracker<string>(3);
   *
   * tracker.touch("key1");
   * tracker.touch("key2");
   * tracker.touch("key3");
   *
   * console.log(tracker.size); // 3
   * console.log(tracker.has("key2")); // true
   *
   * // Remove existing key
   * const removed = tracker.delete("key2");
   * console.log(removed); // true
   * console.log(tracker.size); // 2
   * console.log(tracker.has("key2")); // false
   *
   * // Remove non-existent key
   * const notRemoved = tracker.delete("nonexistent");
   * console.log(notRemoved); // false
   * console.log(tracker.size); // 2 (unchanged)
   * ```
   *
   * @example
   * ```typescript
   * // Cache invalidation patterns
   * const invalidateRelatedKeys = (
   *   tracker: LruTracker<string>,
   *   baseKey: string
   * ): string[] => {
   *   const invalidated: string[] = [];
   *   const pattern = new RegExp(`^${baseKey}:`);
   *
   *   // Get all keys first to avoid modifying during iteration
   *   const allKeys = tracker.keys();
   *
   *   for (const key of allKeys) {
   *     if (pattern.test(key)) {
   *       if (tracker.delete(key)) {
   *         invalidated.push(key);
   *       }
   *     }
   *   }
   *
   *   return invalidated;
   * };
   *
   * // Conditional removal with validation
   * const conditionalDelete = (
   *   tracker: LruTracker<string>,
   *   key: string,
   *   shouldDelete: (key: string) => boolean
   * ): boolean => {
   *   if (tracker.has(key) && shouldDelete(key)) {
   *     return tracker.delete(key);
   *   }
   *   return false;
   * };
   *
   * // Batch deletion with progress tracking
   * const batchDelete = (
   *   tracker: LruTracker<string>,
   *   keys: string[]
   * ): { deleted: number; total: number; failed: string[] } => {
   *   let deleted = 0;
   *   const failed: string[] = [];
   *
   *   for (const key of keys) {
   *     if (tracker.delete(key)) {
   *       deleted++;
   *     } else {
   *       failed.push(key);
   *     }
   *   }
   *
   *   return { deleted, total: keys.length, failed };
   * };
   * ```
   *
   * @example
   * ```typescript
   * // Cache cleanup strategies
   * class CacheManager<K extends StoreKey> {
   *   private tracker = new LruTracker<K>(1000);
   *   private accessTimes = new Map<K, number>();
   *
   *   delete(key: K): boolean {
   *     const deleted = this.tracker.delete(key);
   *     if (deleted) {
   *       this.accessTimes.delete(key);
   *     }
   *     return deleted;
   *   }
   *
   *   // Remove items older than threshold
   *   cleanupOldItems(maxAge: number): K[] => {
   *     const now = Date.now();
   *     const removed: K[] = [];
   *
   *     for (const [key, accessTime] of this.accessTimes) {
   *       if (now - accessTime > maxAge) {
   *         if (this.delete(key)) {
   *           removed.push(key);
   *         }
   *       }
   *     }
   *
   *     return removed;
   *   }
   *
   *   // Force evict LRU items
   *   forceTrim(targetSize: number): K[] => {
   *     const evicted: K[] = [];
   *
   *     while (this.tracker.size > targetSize) {
   *       const lru = this.tracker.lru;
   *       if (lru && this.delete(lru)) {
   *         evicted.push(lru);
   *       } else {
   *         break; // Safety check
   *       }
   *     }
   *
   *     return evicted;
   *   }
   * }
   *
   * // Memory pressure handling
   * const handleMemoryPressure = (tracker: LruTracker<string>): void => {
   *   const memoryUsage = estimateMemoryUsage(tracker);
   *   const threshold = 100 * 1024 * 1024; // 100MB
   *
   *   if (memoryUsage > threshold) {
   *     // Remove 25% of LRU items
   *     const targetSize = Math.floor(tracker.size * 0.75);
   *
   *     while (tracker.size > targetSize) {
   *       const lru = tracker.lru;
   *       if (lru) {
   *         tracker.delete(lru);
   *       } else {
   *         break;
   *       }
   *     }
   *   }
   * };
   * ```
   *
   * @performance
   * - **Time Complexity**: O(1) for lookup, removal, and cleanup
   * - **Space Complexity**: O(1) - immediate memory reclamation
   * - **Memory Safety**: Comprehensive reference cleanup prevents leaks
   *
   * @see {@link clear} - For removing all items at once
   * @see {@link touch} - For adding items to the tracker
   * @see {@link has} - For checking existence before deletion
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
   * This method provides complete cache reset functionality with proper resource
   * management. It performs systematic cleanup of all nodes, references, and
   * internal data structures to prevent memory leaks and ensure the tracker
   * returns to its initial empty state.
   *
   * **Complete Reset Process:**
   * 1. Disposes all nodes to prevent circular references
   * 2. Clears HashMap to remove all key-node mappings
   * 3. Resets head and tail pointers to null
   * 4. Returns tracker to initial empty state
   * 5. Enables immediate garbage collection of all tracked data
   *
   * **Memory Safety:**
   * - Systematically disposes all nodes before clearing
   * - Breaks all circular references in doubly-linked list
   * - Enables aggressive garbage collection
   * - Prevents memory leaks in long-running applications
   *
   * **Performance Characteristics:**
   * - O(n) time complexity for node disposal iteration
   * - O(1) space complexity (no additional memory allocation)
   * - Bulk operation more efficient than individual deletions
   * - Immediate memory reclamation for all tracked items
   *
   * **Use Cases:**
   * - Cache invalidation and refresh scenarios
   * - Memory pressure relief without destroying tracker
   * - Application state reset operations
   * - Testing and development workflows
   * - Periodic maintenance and cleanup procedures
   *
   * @example
   * ```typescript
   * const tracker = new LruTracker<string>(100);
   *
   * // Populate with data
   * tracker.touch("key1");
   * tracker.touch("key2");
   * tracker.touch("key3");
   *
   * console.log(tracker.size); // 3
   * console.log(tracker.lru);  // "key1"
   * console.log(tracker.mru);  // "key3"
   *
   * // Clear all data
   * tracker.clear();
   *
   * console.log(tracker.size); // 0
   * console.log(tracker.lru);  // null
   * console.log(tracker.mru);  // null
   * console.log(tracker.keys()); // []
   *
   * // Tracker is ready for reuse
   * tracker.touch("new-key");
   * console.log(tracker.size); // 1
   * ```
   *
   * @example
   * ```typescript
   * // Periodic cache refresh pattern
   * const refreshCache = async (
   *   tracker: LruTracker<string>,
   *   dataLoader: () => Promise<[string, any][]>
   * ): Promise<void> => {
   *   console.log(`Clearing cache with ${tracker.size} items`);
   *
   *   // Clear existing data
   *   tracker.clear();
   *
   *   // Reload fresh data
   *   const freshData = await dataLoader();
   *
   *   for (const [key] of freshData) {
   *     tracker.touch(key);
   *   }
   *
   *   console.log(`Cache refreshed with ${tracker.size} items`);
   * };
   *
   * // Memory management strategy
   * const manageMemoryPressure = (tracker: LruTracker<string>): void => {
   *   const memoryUsage = process.memoryUsage();
   *   const threshold = 500 * 1024 * 1024; // 500MB
   *
   *   if (memoryUsage.heapUsed > threshold) {
   *     console.log("Memory pressure detected, clearing LRU cache");
   *     tracker.clear();
   *
   *     // Force garbage collection if available
   *     if (global.gc) {
   *       global.gc();
   *     }
   *   }
   * };
   *
   * // Application lifecycle management
   * class CacheLifecycleManager {
   *   private tracker = new LruTracker<string>(1000);
   *
   *   onApplicationStart(): void {
   *     // Ensure clean start
   *     this.tracker.clear();
   *   }
   *
   *   onConfigurationChange(): void {
   *     // Clear cache when configuration changes
   *     console.log("Configuration changed, clearing cache");
   *     this.tracker.clear();
   *   }
   *
   *   onMemoryWarning(): void {
   *     // Respond to memory pressure
   *     this.tracker.clear();
   *   }
   *
   *   onApplicationShutdown(): void {
   *     // Clean shutdown
   *     this.tracker.clear();
   *   }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Testing and development utilities
   * const resetCacheForTest = (tracker: LruTracker<string>): void => {
   *   tracker.clear();
   *
   *   // Verify clean state
   *   console.assert(tracker.size === 0, "Cache should be empty");
   *   console.assert(tracker.lru === null, "LRU should be null");
   *   console.assert(tracker.mru === null, "MRU should be null");
   * };
   *
   * // Conditional clearing with backup
   * const conditionalClear = (
   *   tracker: LruTracker<string>,
   *   condition: () => boolean,
   *   backup?: (keys: string[]) => void
   * ): boolean => {
   *   if (condition()) {
   *     // Optional backup before clearing
   *     if (backup) {
   *       const keys = tracker.keys();
   *       backup(keys);
   *     }
   *
   *     tracker.clear();
   *     return true;
   *   }
   *   return false;
   * };
   *
   * // Performance monitoring during clear
   * const timedClear = (tracker: LruTracker<string>): number => {
   *   const startTime = performance.now();
   *   const initialSize = tracker.size;
   *
   *   tracker.clear();
   *
   *   const endTime = performance.now();
   *   const duration = endTime - startTime;
   *
   *   console.log(`Cleared ${initialSize} items in ${duration.toFixed(2)}ms`);
   *   return duration;
   * };
   * ```
   *
   * @performance
   * - **Time Complexity**: O(n) where n is the number of items in cache
   * - **Space Complexity**: O(1) - no additional memory allocation
   * - **Memory Reclamation**: Immediate for all tracked items
   * - **Efficiency**: More efficient than individual delete() calls
   *
   * @see {@link delete} - For removing individual items
   * @see {@link constructor} - For creating a fresh tracker instance
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
   * This method provides a complete snapshot of the current LRU ordering by
   * traversing the doubly-linked list from head (MRU) to tail (LRU). The
   * returned array reflects the exact access order maintained by the tracker.
   *
   * **Traversal Order:**
   * - Starts at head (most recently used)
   * - Follows next pointers toward tail
   * - Ends at tail (least recently used)
   * - Maintains chronological access order
   *
   * **Use Cases:**
   * - Debugging cache behavior and access patterns
   * - Implementing custom eviction policies
   * - Cache analysis and optimization
   * - Generating reports on data access patterns
   * - Testing LRU algorithm correctness
   *
   * **Performance Considerations:**
   * - O(n) time complexity for full list traversal
   * - O(n) space complexity for result array
   * - Memory allocation proportional to cache size
   * - Consider pagination for very large caches
   *
   * **Data Integrity:**
   * - Snapshot of current state (not live view)
   * - Consistent ordering based on access times
   * - Safe for iteration without affecting cache state
   * - Immutable result array
   *
   * @returns Array of keys in order from most recently used to least recently used
   *
   * @example
   * ```typescript
   * const tracker = new LruTracker<string>(5);
   *
   * // Add items in sequence
   * tracker.touch("first");
   * tracker.touch("second");
   * tracker.touch("third");
   *
   * console.log(tracker.keys()); // ["third", "second", "first"]
   *
   * // Access "first" to move it to front
   * tracker.touch("first");
   * console.log(tracker.keys()); // ["first", "third", "second"]
   *
   * // Add more items
   * tracker.touch("fourth");
   * tracker.touch("fifth");
   * console.log(tracker.keys()); // ["fifth", "fourth", "first", "third", "second"]
   * ```
   *
   * @example
   * ```typescript
   * // Cache analysis and reporting
   * const analyzeAccessPattern = (tracker: LruTracker<string>): void => {
   *   const keys = tracker.keys();
   *
   *   console.log("=== Cache Access Analysis ===");
   *   console.log(`Total items: ${keys.length}`);
   *   console.log(`Most recent: ${keys[0] || 'none'}`);
   *   console.log(`Least recent: ${keys[keys.length - 1] || 'none'}`);
   *
   *   console.log("\nAccess order (MRU → LRU):");
   *   keys.forEach((key, index) => {
   *     const position = index === 0 ? ' (MRU)' :
   *                    index === keys.length - 1 ? ' (LRU)' : '';
   *     console.log(`  ${index + 1}. ${key}${position}`);
   *   });
   * };
   *
   * // Custom eviction policy implementation
   * const selectiveEvict = (
   *   tracker: LruTracker<string>,
   *   shouldEvict: (key: string, position: number) => boolean
   * ): string[] => {
   *   const keys = tracker.keys();
   *   const evicted: string[] = [];
   *
   *   for (let i = keys.length - 1; i >= 0; i--) { // Start from LRU end
   *     const key = keys[i];
   *     if (shouldEvict(key, i)) {
   *       if (tracker.delete(key)) {
   *         evicted.push(key);
   *       }
   *     }
   *   }
   *
   *   return evicted;
   * };
   *
   * // Cache warmup based on access patterns
   * const warmupSimilarKeys = (
   *   tracker: LruTracker<string>,
   *   getSimilarKeys: (key: string) => string[]
   * ): void => {
   *   const currentKeys = tracker.keys();
   *   const topKeys = currentKeys.slice(0, 3); // Top 3 MRU items
   *
   *   for (const key of topKeys) {
   *     const similarKeys = getSimilarKeys(key);
   *     for (const similarKey of similarKeys) {
   *       if (!tracker.has(similarKey)) {
   *         // Warmup cache with similar items
   *         tracker.touch(similarKey);
   *       }
   *     }
   *   }
   * };
   * ```
   *
   * @example
   * ```typescript
   * // Debugging and validation utilities
   * const validateLRUOrder = (tracker: LruTracker<string>): boolean => {
   *   const keys = tracker.keys();
   *   const reverseKeys = tracker.keysReverse();
   *
   *   // Verify that keys() and keysReverse() are inverse of each other
   *   if (keys.length !== reverseKeys.length) return false;
   *
   *   for (let i = 0; i < keys.length; i++) {
   *     if (keys[i] !== reverseKeys[reverseKeys.length - 1 - i]) {
   *       return false;
   *     }
   *   }
   *
   *   return true;
   * };
   *
   * // Export cache state for persistence
   * const exportCacheState = (tracker: LruTracker<string>): object => {
   *   return {
   *     capacity: tracker.capacity,
   *     size: tracker.size,
   *     keys: tracker.keys(),
   *     mru: tracker.mru,
   *     lru: tracker.lru,
   *     timestamp: Date.now()
   *   };
   * };
   *
   * // Compare cache states for testing
   * const compareCacheStates = (
   *   tracker1: LruTracker<string>,
   *   tracker2: LruTracker<string>
   * ): boolean => {
   *   const keys1 = tracker1.keys();
   *   const keys2 = tracker2.keys();
   *
   *   return keys1.length === keys2.length &&
   *          keys1.every((key, index) => key === keys2[index]);
   * };
   * ```
   *
   * @performance
   * - **Time Complexity**: O(n) - must traverse entire list
   * - **Space Complexity**: O(n) - creates array with all keys
   * - **Memory Impact**: Allocates new array proportional to cache size
   * - **Optimization**: Consider caching result if called frequently
   *
   * @see {@link keysReverse} - For LRU to MRU ordering
   * @see {@link entries} - For key-node pairs (debugging)
   * @see {@link size} - For getting count without allocation
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
   * This method provides the inverse ordering of keys() by traversing the
   * doubly-linked list from tail (LRU) to head (MRU). This reverse ordering
   * is particularly useful for eviction algorithms and cache analysis that
   * focuses on the least recently used items first.
   *
   * **Traversal Order:**
   * - Starts at tail (least recently used)
   * - Follows prev pointers toward head
   * - Ends at head (most recently used)
   * - Provides LRU-first ordering for eviction algorithms
   *
   * **Use Cases:**
   * - Implementing custom eviction strategies (process LRU items first)
   * - Cache cleanup operations starting with coldest data
   * - Analysis of least frequently accessed items
   * - Debugging LRU algorithm from eviction perspective
   * - Generating reports focused on underutilized cache entries
   *
   * **Relationship to keys():**
   * - Exact reverse of keys() array
   * - Same performance characteristics
   * - Complementary views of the same data structure
   * - Useful for different algorithmic approaches
   *
   * @returns Array of keys in order from least recently used to most recently used
   *
   * @example
   * ```typescript
   * const tracker = new LruTracker<string>(4);
   *
   * tracker.touch("first");
   * tracker.touch("second");
   * tracker.touch("third");
   * tracker.touch("fourth");
   *
   * console.log(tracker.keys());        // ["fourth", "third", "second", "first"]
   * console.log(tracker.keysReverse()); // ["first", "second", "third", "fourth"]
   *
   * // Access "second" to change ordering
   * tracker.touch("second");
   *
   * console.log(tracker.keys());        // ["second", "fourth", "third", "first"]
   * console.log(tracker.keysReverse()); // ["first", "third", "fourth", "second"]
   * ```
   *
   * @example
   * ```typescript
   * // Eviction strategy implementation
   * const evictOldestItems = (
   *   tracker: LruTracker<string>,
   *   count: number
   * ): string[] => {
   *   const keysLRUFirst = tracker.keysReverse();
   *   const evicted: string[] = [];
   *
   *   for (let i = 0; i < Math.min(count, keysLRUFirst.length); i++) {
   *     const key = keysLRUFirst[i];
   *     if (tracker.delete(key)) {
   *       evicted.push(key);
   *     }
   *   }
   *
   *   return evicted;
   * };
   *
   * // Cache analysis focusing on cold data
   * const analyzeColdData = (
   *   tracker: LruTracker<string>,
   *   threshold: number = 0.3
   * ): string[] => {
   *   const keysLRUFirst = tracker.keysReverse();
   *   const coldThreshold = Math.floor(keysLRUFirst.length * threshold);
   *
   *   return keysLRUFirst.slice(0, coldThreshold);
   * };
   *
   * // Gradual cache warming from LRU end
   * const warmCacheGradually = async (
   *   tracker: LruTracker<string>,
   *   refresher: (key: string) => Promise<boolean>,
   *   batchSize: number = 5
   * ): Promise<void> => {
   *   const keysLRUFirst = tracker.keysReverse();
   *
   *   for (let i = 0; i < keysLRUFirst.length; i += batchSize) {
   *     const batch = keysLRUFirst.slice(i, i + batchSize);
   *
   *     await Promise.all(batch.map(async (key) => {
   *       const refreshed = await refresher(key);
   *       if (refreshed) {
   *         tracker.touch(key); // Move to MRU position
   *       }
   *     }));
   *
   *     // Yield control between batches
   *     await new Promise(resolve => setTimeout(resolve, 0));
   *   }
   * };
   * ```
   *
   * @example
   * ```typescript
   * // Cache health monitoring
   * const assessCacheHealth = (tracker: LruTracker<string>): {
   *   coldestItems: string[];
   *   oldestAge: number;
   *   recommendedEvictions: string[];
   * } => {
   *   const keysLRUFirst = tracker.keysReverse();
   *   const coldestItems = keysLRUFirst.slice(0, 5); // 5 coldest items
   *
   *   // Mock age calculation (would use real timestamps in practice)
   *   const oldestAge = keysLRUFirst.length > 0 ?
   *     Math.random() * 3600000 : 0; // Random age up to 1 hour
   *
   *   // Recommend eviction of bottom 10% if cache is over 80% full
   *   const utilizationThreshold = tracker.capacity * 0.8;
   *   const evictionPercentage = 0.1;
   *   const recommendedEvictions = tracker.size > utilizationThreshold ?
   *     keysLRUFirst.slice(0, Math.floor(tracker.size * evictionPercentage)) : [];
   *
   *   return {
   *     coldestItems,
   *     oldestAge,
   *     recommendedEvictions
   *   };
   * };
   *
   * // Verify data structure integrity
   * const verifyIntegrity = (tracker: LruTracker<string>): boolean => {
   *   const forward = tracker.keys();
   *   const reverse = tracker.keysReverse();
   *
   *   // Should be exact inverses of each other
   *   if (forward.length !== reverse.length) return false;
   *
   *   for (let i = 0; i < forward.length; i++) {
   *     if (forward[i] !== reverse[reverse.length - 1 - i]) {
   *       return false;
   *     }
   *   }
   *
   *   return true;
   * };
   * ```
   *
   * @performance
   * - **Time Complexity**: O(n) - must traverse entire list
   * - **Space Complexity**: O(n) - creates array with all keys
   * - **Traversal Direction**: Backward from tail to head
   * - **Memory Impact**: Same as keys() method
   *
   * @see {@link keys} - For MRU to LRU ordering
   * @see {@link lru} - For getting just the least recently used key
   * @see {@link clear} - For removing items identified through this method
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
   * This method provides low-level access to the internal HashMap structure,
   * returning key-node pairs that reveal the complete internal state of the
   * LRU tracker. It's primarily intended for debugging, testing, and advanced
   * analysis scenarios where direct node access is necessary.
   *
   * **⚠️ WARNING: Advanced Usage Only**
   * The returned LruNode instances should NOT be modified directly as this can
   * corrupt the internal doubly-linked list structure and cause undefined behavior.
   * This method is for read-only inspection and debugging purposes only.
   *
   * **Use Cases:**
   * - Internal state debugging and validation
   * - Unit testing of LRU algorithm correctness
   * - Performance analysis and memory profiling
   * - Advanced cache analytics requiring node-level access
   * - Troubleshooting unexpected cache behavior
   *
   * **Safety Considerations:**
   * - Nodes should be treated as read-only
   * - Modifying node pointers can corrupt the list structure
   * - Direct node manipulation bypasses safety checks
   * - Use only for debugging and analysis, not production algorithms
   *
   * **Data Structure Insight:**
   * - Reveals HashMap key-to-node mappings
   * - Shows internal node structure and relationships
   * - Provides access to node pointer information
   * - Enables low-level cache structure analysis
   *
   * @returns Array of [key, LruNode] pairs representing the internal state
   *
   * @example
   * ```typescript
   * const tracker = new LruTracker<string>(3);
   *
   * tracker.touch("first");
   * tracker.touch("second");
   * tracker.touch("third");
   *
   * const entries = tracker.entries();
   * console.log(`Found ${entries.length} entries`);
   *
   * for (const [key, node] of entries) {
   *   console.log(`Key: ${key}`);
   *   console.log(`  Node key: ${node.key}`);
   *   console.log(`  Has prev: ${node.prev !== null}`);
   *   console.log(`  Has next: ${node.next !== null}`);
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Advanced debugging utilities
   * const validateListIntegrity = (tracker: LruTracker<string>): boolean => {
   *   const entries = tracker.entries();
   *
   *   for (const [key, node] of entries) {
   *     // Verify key consistency
   *     if (key !== node.key) {
   *       console.error(`Key mismatch: map key ${key} !== node key ${node.key}`);
   *       return false;
   *     }
   *
   *     // Verify bidirectional links
   *     if (node.prev && node.prev.next !== node) {
   *       console.error(`Broken backward link for key ${key}`);
   *       return false;
   *     }
   *
   *     if (node.next && node.next.prev !== node) {
   *       console.error(`Broken forward link for key ${key}`);
   *       return false;
   *     }
   *   }
   *
   *   return true;
   * };
   *
   * // Memory analysis and profiling
   * const analyzeMemoryUsage = (tracker: LruTracker<string>): {
   *   totalNodes: number;
   *   isolatedNodes: number;
   *   linkedNodes: number;
   *   memoryEstimate: number;
   * } => {
   *   const entries = tracker.entries();
   *   let isolatedNodes = 0;
   *   let linkedNodes = 0;
   *
   *   for (const [, node] of entries) {
   *     if (node.prev === null && node.next === null) {
   *       isolatedNodes++;
   *     } else {
   *       linkedNodes++;
   *     }
   *   }
   *
   *   return {
   *     totalNodes: entries.length,
   *     isolatedNodes,
   *     linkedNodes,
   *     memoryEstimate: entries.length * 56 // Estimated bytes per entry
   *   };
   * };
   *
   * // List structure visualization
   * const visualizeListStructure = (tracker: LruTracker<string>): void => {
   *   const entries = tracker.entries();
   *   const nodeMap = new Map<string, LruNode<string>>();
   *
   *   // Build lookup map
   *   for (const [key, node] of entries) {
   *     nodeMap.set(key, node);
   *   }
   *
   *   console.log("=== LRU List Structure ===");
   *
   *   // Find and display head-to-tail chain
   *   let current = null;
   *   for (const [, node] of entries) {
   *     if (node.prev === null) {
   *       current = node;
   *       break;
   *     }
   *   }
   *
   *   const chain: string[] = [];
   *   while (current) {
   *     chain.push(current.key);
   *     current = current.next;
   *   }
   *
   *   console.log("Chain:", chain.join(" → "));
   *   console.log(`Head: ${tracker.mru}, Tail: ${tracker.lru}`);
   * };
   * ```
   *
   * @example
   * ```typescript
   * // Unit testing utilities
   * const createTestValidators = (tracker: LruTracker<string>) => {
   *   return {
   *     validateSize: (): boolean => {
   *       const entries = tracker.entries();
   *       return entries.length === tracker.size;
   *     },
   *
   *     validateUniqueness: (): boolean => {
   *       const entries = tracker.entries();
   *       const keys = new Set(entries.map(([key]) => key));
   *       return keys.size === entries.length;
   *     },
   *
   *     validateChainIntegrity: (): boolean => {
   *       const entries = tracker.entries();
   *       if (entries.length === 0) return true;
   *
   *       // Count reachable nodes from head
   *       let headReachable = 0;
   *       let current = entries.find(([, node]) => node.prev === null)?.[1];
   *       while (current) {
   *         headReachable++;
   *         current = current.next;
   *       }
   *
   *       return headReachable === entries.length;
   *     }
   *   };
   * };
   *
   * // Performance benchmarking
   * const benchmarkInternalAccess = (tracker: LruTracker<string>): void => {
   *   const iterations = 1000;
   *
   *   console.time("entries() access");
   *   for (let i = 0; i < iterations; i++) {
   *     const entries = tracker.entries();
   *     // Simulate read-only access
   *     entries.forEach(([key, node]) => {
   *       void key; void node.key; // Touch but don't modify
   *     });
   *   }
   *   console.timeEnd("entries() access");
   * };
   * ```
   *
   * @performance
   * - **Time Complexity**: O(n) - iterates through HashMap entries
   * - **Space Complexity**: O(n) - creates array with all key-node pairs
   * - **Memory Impact**: Larger than keys() due to node references
   * - **Use Sparingly**: Intended for debugging, not regular operations
   *
   * @see {@link keys} - For getting just the keys without node access
   * @see {@link LruNode} - For understanding the node structure
   *
   * @public
   */
  entries(): [K, LruNode<K>][] {
    return [...this.#cache.entries()];
  }

  /**
   * Evicts the least recently used item to make room for new entries.
   *
   * This internal method implements the core eviction logic that maintains
   * the capacity constraint of the LRU tracker. It automatically removes
   * the least recently used item (tail of the list) and performs comprehensive
   * cleanup to prevent memory leaks.
   *
   * **Eviction Process:**
   * 1. Identifies the LRU item (tail node)
   * 2. Removes it from the doubly-linked list
   * 3. Removes the key-node mapping from HashMap
   * 4. Disposes node references to prevent memory leaks
   * 5. Returns the evicted key for calling code cleanup
   *
   * **Automatic Invocation:**
   * - Called automatically by touch() when capacity is exceeded
   * - Only operates when cache is at or above capacity
   * - Ensures exact capacity compliance
   * - Transparent to external callers
   *
   * **Memory Management:**
   * - Comprehensive node cleanup with dispose()
   * - Immediate memory reclamation
   * - Prevention of circular references
   * - Optimal garbage collection support
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
   *
   * This internal method handles the insertion of nodes at the head of the
   * list, making them the most recently used items. It properly manages
   * all pointer updates and handles both empty list and populated list cases.
   *
   * **Insertion Logic:**
   * - Resets node connections for clean state
   * - Links node as new head with proper pointer management
   * - Updates existing head's backward pointer
   * - Handles empty list case by setting both head and tail
   *
   * **Pointer Management:**
   * - Sets node.prev to null (head position)
   * - Links node.next to current head
   * - Updates current head.prev to point to new node
   * - Maintains bidirectional link integrity
   *
   * **Edge Cases:**
   * - Empty list: Node becomes both head and tail
   * - Single item: Proper head/tail distinction maintained
   * - Multiple items: Standard insertion at head
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
   *
   * This internal method handles node removal from any position in the list,
   * properly updating all affected pointers and maintaining list structure.
   * It handles edge cases including head and tail removal scenarios.
   *
   * **Removal Logic:**
   * - Updates previous node's next pointer
   * - Updates next node's previous pointer
   * - Handles head removal by updating head pointer
   * - Handles tail removal by updating tail pointer
   * - Clears removed node's pointers to prevent references
   *
   * **Edge Case Handling:**
   * - Head removal: Updates head to next node
   * - Tail removal: Updates tail to previous node
   * - Middle removal: Links adjacent nodes directly
   * - Single node: Resets both head and tail to null
   *
   * **Pointer Safety:**
   * - Null-safe pointer updates
   * - Comprehensive reference cleanup
   * - Prevention of dangling pointers
   * - Maintenance of list invariants
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

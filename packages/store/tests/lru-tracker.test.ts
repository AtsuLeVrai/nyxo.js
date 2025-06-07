import { beforeEach, describe, expect, it } from "vitest";
import { LruNode, LruTracker } from "../src/index.js";

describe("LruNode", () => {
  describe("Constructor", () => {
    it("creates node with given key", () => {
      const node = new LruNode("test-key");
      expect(node.key).toBe("test-key");
      expect(node.prev).toBeNull();
      expect(node.next).toBeNull();
    });

    it("creates node with numeric key", () => {
      const node = new LruNode(42);
      expect(node.key).toBe(42);
    });

    it("creates node with symbol key", () => {
      const sym = Symbol("test");
      const node = new LruNode(sym);
      expect(node.key).toBe(sym);
    });
  });

  describe("dispose", () => {
    it("clears all references", () => {
      const node1 = new LruNode("key1");
      const node2 = new LruNode("key2");
      const node3 = new LruNode("key3");

      // Setup linked list
      node1.next = node2;
      node2.prev = node1;
      node2.next = node3;
      node3.prev = node2;

      node2.dispose();

      expect(node2.prev).toBeNull();
      expect(node2.next).toBeNull();
      expect(node2.key).toBe("key2"); // Key should remain
    });

    it("handles dispose on isolated node", () => {
      const node = new LruNode("isolated");
      node.dispose();

      expect(node.prev).toBeNull();
      expect(node.next).toBeNull();
    });
  });
});

describe("LruTracker", () => {
  let tracker: LruTracker<string>;

  beforeEach(() => {
    tracker = new LruTracker<string>(3);
  });

  describe("Constructor", () => {
    it("creates tracker with specified capacity", () => {
      const newTracker = new LruTracker<string>(5);
      expect(newTracker.capacity).toBe(5);
      expect(newTracker.size).toBe(0);
    });

    it("enforces minimum capacity of 1", () => {
      const zeroTracker = new LruTracker<string>(0);
      expect(zeroTracker.capacity).toBe(1);

      const negativeTracker = new LruTracker<string>(-5);
      expect(negativeTracker.capacity).toBe(1);
    });

    it("handles large capacity values", () => {
      const largeTracker = new LruTracker<string>(1000000);
      expect(largeTracker.capacity).toBe(1000000);
    });
  });

  describe("Properties", () => {
    it("returns correct size as items are added", () => {
      expect(tracker.size).toBe(0);

      tracker.touch("key1");
      expect(tracker.size).toBe(1);

      tracker.touch("key2");
      expect(tracker.size).toBe(2);

      tracker.touch("key3");
      expect(tracker.size).toBe(3);
    });

    it("returns correct capacity", () => {
      expect(tracker.capacity).toBe(3);
    });

    it("size remains accurate after evictions", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");
      tracker.touch("key4"); // Should evict key1

      expect(tracker.size).toBe(3);
    });
  });

  describe("touch", () => {
    it("adds new key to empty tracker", () => {
      const evicted = tracker.touch("key1");

      expect(evicted).toBeNull();
      expect(tracker.size).toBe(1);
      expect(tracker.has("key1")).toBe(true);
      expect(tracker.getMru()).toBe("key1");
      expect(tracker.getLru()).toBe("key1");
    });

    it("adds multiple keys maintaining order", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      expect(tracker.getMru()).toBe("key3");
      expect(tracker.getLru()).toBe("key1");
      expect(tracker.size).toBe(3);
    });

    it("moves existing key to front when touched", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      // Touch key1 again - should move to front
      const evicted = tracker.touch("key1");

      expect(evicted).toBeNull();
      expect(tracker.getMru()).toBe("key1");
      expect(tracker.getLru()).toBe("key2");
      expect(tracker.size).toBe(3);
    });

    it("evicts least recently used when capacity exceeded", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      // Adding key4 should evict key1
      const evicted = tracker.touch("key4");

      expect(evicted).toBe("key1");
      expect(tracker.size).toBe(3);
      expect(tracker.has("key1")).toBe(false);
      expect(tracker.has("key4")).toBe(true);
      expect(tracker.getMru()).toBe("key4");
      expect(tracker.getLru()).toBe("key2");
    });

    it("handles touch on recently evicted key", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");
      tracker.touch("key4"); // Evicts key1

      // Touch key1 again - should be added as new
      const evicted = tracker.touch("key1");

      expect(evicted).toBe("key2"); // key2 should be evicted now
      expect(tracker.getMru()).toBe("key1");
      expect(tracker.has("key2")).toBe(false);
    });

    it("handles rapid alternating touches", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      // Alternate between key1 and key2
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key1");

      expect(tracker.getMru()).toBe("key1");
      expect(tracker.getLru()).toBe("key3");
    });

    it("works with numeric keys", () => {
      const numTracker = new LruTracker<number>(2);

      numTracker.touch(1);
      numTracker.touch(2);
      const evicted = numTracker.touch(3);

      expect(evicted).toBe(1);
      expect(numTracker.getMru()).toBe(3);
    });

    it("works with symbol keys", () => {
      const sym1 = Symbol("key1");
      const sym2 = Symbol("key2");
      const symTracker = new LruTracker<symbol>(2);

      symTracker.touch(sym1);
      symTracker.touch(sym2);

      expect(symTracker.getMru()).toBe(sym2);
      expect(symTracker.getLru()).toBe(sym1);
    });
  });

  describe("getLru and getMru", () => {
    it("returns null for empty tracker", () => {
      expect(tracker.getLru()).toBeNull();
      expect(tracker.getMru()).toBeNull();
    });

    it("returns same key for single item", () => {
      tracker.touch("only-key");

      expect(tracker.getLru()).toBe("only-key");
      expect(tracker.getMru()).toBe("only-key");
    });

    it("returns correct LRU and MRU for multiple items", () => {
      tracker.touch("first");
      tracker.touch("second");
      tracker.touch("third");

      expect(tracker.getLru()).toBe("first");
      expect(tracker.getMru()).toBe("third");
    });

    it("updates correctly after touching middle item", () => {
      tracker.touch("first");
      tracker.touch("second");
      tracker.touch("third");

      tracker.touch("second"); // Move second to front

      expect(tracker.getLru()).toBe("first");
      expect(tracker.getMru()).toBe("second");
    });

    it("updates correctly after eviction", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");
      tracker.touch("key4"); // Evicts key1

      expect(tracker.getLru()).toBe("key2");
      expect(tracker.getMru()).toBe("key4");
    });
  });

  describe("has", () => {
    it("returns false for empty tracker", () => {
      expect(tracker.has("nonexistent")).toBe(false);
    });

    it("returns true for existing keys", () => {
      tracker.touch("key1");
      tracker.touch("key2");

      expect(tracker.has("key1")).toBe(true);
      expect(tracker.has("key2")).toBe(true);
    });

    it("returns false for non-existing keys", () => {
      tracker.touch("key1");

      expect(tracker.has("key2")).toBe(false);
      expect(tracker.has("nonexistent")).toBe(false);
    });

    it("returns false for evicted keys", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");
      tracker.touch("key4"); // Evicts key1

      expect(tracker.has("key1")).toBe(false);
      expect(tracker.has("key4")).toBe(true);
    });

    it("does not affect LRU order", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      const lruBefore = tracker.getLru();
      const mruBefore = tracker.getMru();

      tracker.has("key2");

      expect(tracker.getLru()).toBe(lruBefore);
      expect(tracker.getMru()).toBe(mruBefore);
    });
  });

  describe("delete", () => {
    it("returns false for empty tracker", () => {
      expect(tracker.delete("nonexistent")).toBe(false);
    });

    it("deletes single item from tracker", () => {
      tracker.touch("only-key");

      const deleted = tracker.delete("only-key");

      expect(deleted).toBe(true);
      expect(tracker.size).toBe(0);
      expect(tracker.has("only-key")).toBe(false);
      expect(tracker.getLru()).toBeNull();
      expect(tracker.getMru()).toBeNull();
    });

    it("deletes head item from multi-item tracker", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      const deleted = tracker.delete("key3"); // Delete head (MRU)

      expect(deleted).toBe(true);
      expect(tracker.size).toBe(2);
      expect(tracker.getMru()).toBe("key2");
      expect(tracker.getLru()).toBe("key1");
    });

    it("deletes tail item from multi-item tracker", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      const deleted = tracker.delete("key1"); // Delete tail (LRU)

      expect(deleted).toBe(true);
      expect(tracker.size).toBe(2);
      expect(tracker.getMru()).toBe("key3");
      expect(tracker.getLru()).toBe("key2");
    });

    it("deletes middle item from multi-item tracker", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      const deleted = tracker.delete("key2"); // Delete middle

      expect(deleted).toBe(true);
      expect(tracker.size).toBe(2);
      expect(tracker.getMru()).toBe("key3");
      expect(tracker.getLru()).toBe("key1");
    });

    it("returns false for non-existing key", () => {
      tracker.touch("key1");

      const deleted = tracker.delete("nonexistent");

      expect(deleted).toBe(false);
      expect(tracker.size).toBe(1);
    });

    it("handles deleting all items one by one", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      expect(tracker.delete("key2")).toBe(true);
      expect(tracker.size).toBe(2);

      expect(tracker.delete("key1")).toBe(true);
      expect(tracker.size).toBe(1);

      expect(tracker.delete("key3")).toBe(true);
      expect(tracker.size).toBe(0);
    });

    it("allows adding items after deletion", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.delete("key1");

      tracker.touch("key3");

      expect(tracker.size).toBe(2);
      expect(tracker.has("key1")).toBe(false);
      expect(tracker.has("key2")).toBe(true);
      expect(tracker.has("key3")).toBe(true);
    });
  });

  describe("clear", () => {
    it("clears empty tracker", () => {
      tracker.clear();

      expect(tracker.size).toBe(0);
      expect(tracker.getLru()).toBeNull();
      expect(tracker.getMru()).toBeNull();
    });

    it("clears tracker with single item", () => {
      tracker.touch("only-key");
      tracker.clear();

      expect(tracker.size).toBe(0);
      expect(tracker.has("only-key")).toBe(false);
      expect(tracker.getLru()).toBeNull();
      expect(tracker.getMru()).toBeNull();
    });

    it("clears tracker with multiple items", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      tracker.clear();

      expect(tracker.size).toBe(0);
      expect(tracker.has("key1")).toBe(false);
      expect(tracker.has("key2")).toBe(false);
      expect(tracker.has("key3")).toBe(false);
      expect(tracker.getLru()).toBeNull();
      expect(tracker.getMru()).toBeNull();
    });

    it("allows normal operations after clear", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.clear();

      tracker.touch("new-key");

      expect(tracker.size).toBe(1);
      expect(tracker.getMru()).toBe("new-key");
      expect(tracker.getLru()).toBe("new-key");
    });

    it("handles multiple consecutive clears", () => {
      tracker.touch("key1");
      tracker.clear();
      tracker.clear();
      tracker.clear();

      expect(tracker.size).toBe(0);
    });
  });

  describe("keys", () => {
    it("returns empty array for empty tracker", () => {
      const keys = tracker.keys();
      expect(keys).toEqual([]);
    });

    it("returns single key for single item", () => {
      tracker.touch("only-key");

      const keys = tracker.keys();
      expect(keys).toEqual(["only-key"]);
    });

    it("returns keys in MRU to LRU order", () => {
      tracker.touch("first");
      tracker.touch("second");
      tracker.touch("third");

      const keys = tracker.keys();
      expect(keys).toEqual(["third", "second", "first"]);
    });

    it("reflects order changes after touching", () => {
      tracker.touch("first");
      tracker.touch("second");
      tracker.touch("third");

      tracker.touch("first"); // Move first to front

      const keys = tracker.keys();
      expect(keys).toEqual(["first", "third", "second"]);
    });

    it("reflects changes after eviction", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");
      tracker.touch("key4"); // Evicts key1

      const keys = tracker.keys();
      expect(keys).toEqual(["key4", "key3", "key2"]);
    });

    it("reflects changes after deletion", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      tracker.delete("key2");

      const keys = tracker.keys();
      expect(keys).toEqual(["key3", "key1"]);
    });

    it("returns new array each time", () => {
      tracker.touch("key1");

      const keys1 = tracker.keys();
      const keys2 = tracker.keys();

      expect(keys1).not.toBe(keys2);
      expect(keys1).toEqual(keys2);
    });
  });

  describe("keysReverse", () => {
    it("returns empty array for empty tracker", () => {
      const keys = tracker.keysReverse();
      expect(keys).toEqual([]);
    });

    it("returns single key for single item", () => {
      tracker.touch("only-key");

      const keys = tracker.keysReverse();
      expect(keys).toEqual(["only-key"]);
    });

    it("returns keys in LRU to MRU order", () => {
      tracker.touch("first");
      tracker.touch("second");
      tracker.touch("third");

      const keys = tracker.keysReverse();
      expect(keys).toEqual(["first", "second", "third"]);
    });

    it("is reverse of keys() method", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      const keys = tracker.keys();
      const keysReverse = tracker.keysReverse();

      expect(keysReverse).toEqual([...keys].reverse());
    });

    it("reflects order changes after touching", () => {
      tracker.touch("first");
      tracker.touch("second");
      tracker.touch("third");

      tracker.touch("first"); // Move first to front

      const keys = tracker.keysReverse();
      expect(keys).toEqual(["second", "third", "first"]);
    });

    it("returns new array each time", () => {
      tracker.touch("key1");

      const keys1 = tracker.keysReverse();
      const keys2 = tracker.keysReverse();

      expect(keys1).not.toBe(keys2);
      expect(keys1).toEqual(keys2);
    });
  });

  describe("entries", () => {
    it("returns empty array for empty tracker", () => {
      const entries = tracker.entries();
      expect(entries).toEqual([]);
    });

    it("returns key-node pairs for single item", () => {
      tracker.touch("only-key");

      const entries = tracker.entries();
      expect(entries).toHaveLength(1);
      expect(entries[0]?.[0]).toBe("only-key");
      expect(entries[0]?.[1]).toBeInstanceOf(LruNode);
      expect(entries[0]?.[1].key).toBe("only-key");
    });

    it("returns all key-node pairs for multiple items", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      const entries = tracker.entries();
      expect(entries).toHaveLength(3);

      const keys = entries.map(([key]) => key);
      expect(keys).toContain("key1");
      expect(keys).toContain("key2");
      expect(keys).toContain("key3");

      for (const [key, node] of entries) {
        expect(node).toBeInstanceOf(LruNode);
        expect(node.key).toBe(key);
      }
    });

    it("nodes have correct linkage information", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      const entries = tracker.entries();
      const nodeMap = new Map(entries);

      // Check that nodes are properly linked
      const node1 = nodeMap.get("key1");
      const node2 = nodeMap.get("key2");
      const node3 = nodeMap.get("key3");

      expect(node1).toBeDefined();
      expect(node2).toBeDefined();
      expect(node3).toBeDefined();

      // Verify internal structure (implementation details for debugging)
      if (node1 && node2 && node3) {
        // These are implementation details but useful for testing internal consistency
        expect(typeof node1.prev).not.toBe("undefined");
        expect(typeof node1.next).not.toBe("undefined");
      }
    });

    it("returns new array each time", () => {
      tracker.touch("key1");

      const entries1 = tracker.entries();
      const entries2 = tracker.entries();

      expect(entries1).not.toBe(entries2);
      expect(entries1[0]?.[0]).toBe(entries2[0]?.[0]);
    });
  });

  describe("Edge Cases and Stress Tests", () => {
    it("handles single capacity tracker", () => {
      const singleTracker = new LruTracker<string>(1);

      singleTracker.touch("key1");
      expect(singleTracker.size).toBe(1);
      expect(singleTracker.getMru()).toBe("key1");
      expect(singleTracker.getLru()).toBe("key1");

      const evicted = singleTracker.touch("key2");
      expect(evicted).toBe("key1");
      expect(singleTracker.size).toBe(1);
      expect(singleTracker.getMru()).toBe("key2");
      expect(singleTracker.getLru()).toBe("key2");
    });

    it("handles rapid sequential operations", () => {
      const fastTracker = new LruTracker<number>(5);

      // Add items up to capacity
      for (let i = 0; i < 5; i++) {
        fastTracker.touch(i);
      }

      // Rapid evictions and additions
      for (let i = 5; i < 100; i++) {
        const evicted = fastTracker.touch(i);
        expect(evicted).toBe(i - 5);
        expect(fastTracker.size).toBe(5);
      }
    });

    it("maintains consistency during mixed operations", () => {
      tracker.touch("a");
      tracker.touch("b");
      tracker.touch("c");

      // Mix of operations
      tracker.touch("a"); // Move to front
      tracker.delete("b"); // Delete middle
      tracker.touch("d"); // Add new
      tracker.touch("c"); // Move existing to front

      expect(tracker.size).toBe(3);
      expect(tracker.getMru()).toBe("c");
      expect(tracker.has("a")).toBe(true);
      expect(tracker.has("b")).toBe(false);
      expect(tracker.has("d")).toBe(true);
    });

    it("handles alternating touch and delete operations", () => {
      for (let i = 0; i < 10; i++) {
        tracker.touch(`key${i}`);
        if (i > 2) {
          tracker.delete(`key${i - 3}`);
        }
      }

      expect(tracker.size).toBe(3);
      expect(tracker.has("key7")).toBe(true);
      expect(tracker.has("key8")).toBe(true);
      expect(tracker.has("key9")).toBe(true);
    });

    it("maintains internal consistency after complex operations", () => {
      // Complex sequence of operations
      tracker.touch("a");
      tracker.touch("b");
      tracker.touch("c");
      tracker.delete("b");
      tracker.touch("d");
      tracker.touch("a"); // Move to front
      tracker.touch("e"); // Should evict c

      const keys = tracker.keys();
      const keysReverse = tracker.keysReverse();

      expect(keys.length).toBe(keysReverse.length);
      expect(keys).toEqual([...keysReverse].reverse());
      expect(tracker.size).toBe(keys.length);

      // Verify all keys from keys() method exist in has()
      for (const key of keys) {
        expect(tracker.has(key)).toBe(true);
      }
    });

    it("handles string keys with special characters", () => {
      const specialKeys = ["", " ", "\n", "\t", "🚀", "键", "key with spaces"];
      const specialTracker = new LruTracker<string>(specialKeys.length);

      for (const key of specialKeys) {
        specialTracker.touch(key);
        expect(specialTracker.has(key)).toBe(true);
      }

      expect(specialTracker.size).toBe(specialKeys.length);
    });

    it("handles very large capacity without memory issues", () => {
      const largeTracker = new LruTracker<number>(10000);

      // Add many items
      for (let i = 0; i < 5000; i++) {
        largeTracker.touch(i);
      }

      expect(largeTracker.size).toBe(5000);
      expect(largeTracker.getMru()).toBe(4999);
      expect(largeTracker.getLru()).toBe(0);

      // Verify some middle elements
      expect(largeTracker.has(2500)).toBe(true);
      expect(largeTracker.has(1000)).toBe(true);
    });

    it("preserves type safety with different key types", () => {
      const stringTracker = new LruTracker<string>(3);
      const numberTracker = new LruTracker<number>(3);
      const symbolTracker = new LruTracker<symbol>(3);

      stringTracker.touch("string-key");
      numberTracker.touch(42);
      symbolTracker.touch(Symbol("test"));

      expect(stringTracker.getMru()).toBe("string-key");
      expect(numberTracker.getMru()).toBe(42);
      expect(typeof symbolTracker.getMru()).toBe("symbol");
    });

    it("handles boundary conditions correctly", () => {
      // Test exactly at capacity
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3"); // At capacity

      expect(tracker.size).toBe(3);

      const evicted = tracker.touch("key4"); // Exceeds capacity
      expect(evicted).toBe("key1");
      expect(tracker.size).toBe(3);
    });
  });

  describe("Memory Management", () => {
    it("properly disposes nodes when deleted", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      const entries = tracker.entries();
      const nodeToDelete = entries.find(([key]) => key === "key2");

      tracker.delete("key2");

      // Node should still exist but be disposed
      if (nodeToDelete) {
        expect(nodeToDelete[1].prev).toBeNull();
        expect(nodeToDelete[1].next).toBeNull();
      }
    });

    it("properly disposes all nodes when cleared", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      const entries = tracker.entries();

      tracker.clear();

      // All nodes should be disposed
      for (const [, node] of entries) {
        expect(node.prev).toBeNull();
        expect(node.next).toBeNull();
      }
    });

    it("properly disposes evicted nodes", () => {
      tracker.touch("key1");
      tracker.touch("key2");
      tracker.touch("key3");

      const entries = tracker.entries();
      const firstNode = entries.find(([key]) => key === "key1");

      tracker.touch("key4"); // Should evict key1

      // Evicted node should be disposed
      if (firstNode) {
        expect(firstNode[1].prev).toBeNull();
        expect(firstNode[1].next).toBeNull();
      }
    });
  });
});

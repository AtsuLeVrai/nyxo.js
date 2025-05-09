import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Store } from "../src/index.js";

describe("Store and LruTracker Integration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should properly integrate LruTracker with Store for LRU eviction", () => {
    // Create a store with LRU eviction strategy
    const store = new Store<string, number>(null, {
      maxSize: 3,
      evictionStrategy: "lru",
    });

    // Add items to fill the store
    store.set("a", 1);
    store.set("b", 2);
    store.set("c", 3);

    // Access items in specific order to influence LRU tracking
    store.get("a"); // a should be most recently used
    store.get("b"); // now b is most recently used

    // c has not been accessed, so it should be least recently used

    // Add a new item, which should trigger eviction of c
    store.set("d", 4);

    // Verify c was evicted but a and b remain
    expect(store.has("a")).toBe(true);
    expect(store.has("b")).toBe(true);
    expect(store.has("c")).toBe(false);
    expect(store.has("d")).toBe(true);

    // Further verify LRU ordering by adding another item
    // 'a' should be evicted next since it was accessed before 'b'
    store.set("e", 5);

    expect(store.has("a")).toBe(false);
    expect(store.has("b")).toBe(true);
    expect(store.has("d")).toBe(true);
    expect(store.has("e")).toBe(true);
  });

  it("should maintain correct LRU order across various operations", () => {
    const store = new Store<string, { id: number }>(null, {
      maxSize: 3,
      evictionStrategy: "lru",
    });

    // Add initial items
    store.set("a", { id: 1 });
    store.set("b", { id: 2 });
    store.set("c", { id: 3 });

    // Access with different methods to ensure all update LRU status
    store.get("a");
    store.find((item) => item.id === 2); // Should touch 'b'

    // 'c' is now the least recently used

    // Add a new item to trigger eviction
    store.set("d", { id: 4 });

    expect(store.has("c")).toBe(false);

    // Use add method and verify it updates LRU status
    store.add("a", { id: 10 }); // Updates 'a' to most recent

    // 'b' should now be least recently used
    store.set("e", { id: 5 });

    expect(store.has("b")).toBe(false);
    expect(store.has("a")).toBe(true);
    expect(store.has("d")).toBe(true);
    expect(store.has("e")).toBe(true);
  });

  it("should properly handle TTL expiration with LRU tracking", () => {
    // Store with both TTL and LRU
    const store = new Store<string, number>(null, {
      maxSize: 3,
      ttl: 1000,
      evictionStrategy: "lru",
    });

    store.set("a", 1);
    store.set("b", 2);

    // Advance time a bit
    vi.advanceTimersByTime(300);

    // Set item c with a custom shorter TTL
    store.setWithTtl("c", 3, 500);

    // Access a to make it most recently used
    store.get("a");

    // Advance time past c's TTL
    vi.advanceTimersByTime(600);

    // c should be expired, but a and b should still be there
    expect(store.has("a")).toBe(true);
    expect(store.has("b")).toBe(true);
    expect(store.has("c")).toBe(false);

    // Add two more items
    store.set("d", 4);
    store.set("e", 5);

    // Even though b is older, we have maxSize=3 and only have a,d,e now
    // So all three should remain despite adding two items
    expect(store.has("a")).toBe(true);
    expect(store.has("d")).toBe(true);
    expect(store.has("e")).toBe(true);

    // Advance time past all initial items' TTL
    vi.advanceTimersByTime(500);

    // Now a and b should be gone, d and e should remain
    expect(store.has("a")).toBe(false);
    expect(store.has("b")).toBe(false); // b was already gone
    expect(store.has("d")).toBe(true);
    expect(store.has("e")).toBe(true);
  });

  it("should properly handle search methods with LRU tracking", () => {
    // Store with LRU and objects
    const store = new Store<string, { type: string; value: number }>(null, {
      maxSize: 3,
      evictionStrategy: "lru",
    });

    store.set("a", { type: "foo", value: 1 });
    store.set("b", { type: "bar", value: 2 });
    store.set("c", { type: "foo", value: 3 });

    // Find operations should update LRU
    store.find({ type: "foo" }); // Should touch 'a'

    // findAll also updates LRU status for matching items
    store.findAll({ type: "foo" }); // Should touch 'a' and 'c'

    // 'b' should now be least recently used
    store.set("d", { type: "baz", value: 4 });

    expect(store.has("a")).toBe(true);
    expect(store.has("b")).toBe(false); // Evicted
    expect(store.has("c")).toBe(true);
    expect(store.has("d")).toBe(true);

    // filter doesn't update LRU on the source store but creates a new store
    const filtered = store.filter({ type: "foo" });
    expect(filtered.size).toBe(2);

    // Original store should be unaffected in size
    expect(store.size).toBe(3);
  });

  it("should handle complex eviction scenarios", () => {
    // Complex sequence of operations to test eviction logic
    const store = new Store<string, number>(null, {
      maxSize: 3,
      evictionStrategy: "lru",
    });

    // 1. Fill the store
    store.set("a", 1);
    store.set("b", 2);
    store.set("c", 3);

    // 2. Access in a specific pattern
    store.get("a");
    store.get("c");
    store.get("b");
    // LRU order now: a (oldest), c, b (newest)

    // 3. Replace an existing value (should not cause eviction)
    store.set("c", 30);
    // LRU order now: a (oldest), c, b (newest)
    // b is still newest because set('c') just updates the value, not the order

    // 4. Add a new item to trigger eviction
    store.set("d", 4);
    // 'a' should be evicted as LRU
    expect(store.has("a")).toBe(false);
    expect(store.has("b")).toBe(true);
    expect(store.has("c")).toBe(true);
    expect(store.has("d")).toBe(true);

    // 5. Access items to change order
    store.get("c");
    // LRU order now: b (oldest), d, c (newest)

    // 6. Delete an item
    store.delete("d");
    // LRU order now: b (oldest), c (newest)

    // 7. Add two new items
    store.set("e", 5);
    // No eviction yet, we have b, c, e

    store.set("f", 6);
    // 'b' should be evicted as LRU
    expect(store.has("b")).toBe(false);
    expect(store.has("c")).toBe(true);
    expect(store.has("e")).toBe(true);
    expect(store.has("f")).toBe(true);
  });
});

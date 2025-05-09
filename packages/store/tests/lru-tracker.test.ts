import { beforeEach, describe, expect, it } from "vitest";
import { LruNode, LruTracker } from "../src/index.js";

describe("LruNode", () => {
  it("should create a node with the given key", () => {
    const node = new LruNode<string>("test-key");
    expect(node.key).toBe("test-key");
    expect(node.prev).toBeNull();
    expect(node.next).toBeNull();
  });
});

describe("LruTracker", () => {
  let tracker: LruTracker<string>;

  beforeEach(() => {
    tracker = new LruTracker<string>(3);
  });

  it("should enforce minimum capacity of 1", () => {
    const smallTracker = new LruTracker<string>(0);
    // The constructor should set capacity to at least 1
    smallTracker.touch("key1");
    expect(smallTracker.size).toBe(1);
  });

  it("should track size correctly", () => {
    expect(tracker.size).toBe(0);

    tracker.touch("key1");
    expect(tracker.size).toBe(1);

    tracker.touch("key2");
    expect(tracker.size).toBe(2);
  });

  it("should add items to the front when touched", () => {
    tracker.touch("key1");
    tracker.touch("key2");
    tracker.touch("key3");

    // Most recently used should be first
    expect(tracker.keys()).toEqual(["key3", "key2", "key1"]);
  });

  it("should move existing items to the front when touched", () => {
    tracker.touch("key1");
    tracker.touch("key2");
    tracker.touch("key3");

    // Now touch key1 again, moving it to the front
    tracker.touch("key1");

    expect(tracker.keys()).toEqual(["key1", "key3", "key2"]);
  });

  it("should return the least recently used key", () => {
    tracker.touch("key1");
    tracker.touch("key2");
    tracker.touch("key3");

    expect(tracker.getLru()).toBe("key1");

    // Touch key1, so key2 becomes LRU
    tracker.touch("key1");
    expect(tracker.getLru()).toBe("key2");
  });

  it("should return null for getLru when empty", () => {
    expect(tracker.getLru()).toBeNull();
  });

  it("should evict the least recently used item when capacity is exceeded", () => {
    tracker.touch("key1");
    tracker.touch("key2");
    tracker.touch("key3");

    // Adding a 4th item should evict key1 (the LRU)
    tracker.touch("key4");

    expect(tracker.size).toBe(3);
    expect(tracker.keys()).toEqual(["key4", "key3", "key2"]);

    // key1 should no longer be in the cache
    const allKeys = new Set(tracker.keys());
    expect(allKeys.has("key1")).toBe(false);
  });

  it("should delete a specific key", () => {
    tracker.touch("key1");
    tracker.touch("key2");
    tracker.touch("key3");

    const result = tracker.delete("key2");

    expect(result).toBe(true);
    expect(tracker.size).toBe(2);
    expect(tracker.keys()).toEqual(["key3", "key1"]);
  });

  it("should return false when deleting a non-existent key", () => {
    tracker.touch("key1");

    const result = tracker.delete("non-existent");

    expect(result).toBe(false);
    expect(tracker.size).toBe(1);
  });

  it("should clear all items", () => {
    tracker.touch("key1");
    tracker.touch("key2");

    tracker.clear();

    expect(tracker.size).toBe(0);
    expect(tracker.keys()).toEqual([]);
    expect(tracker.getLru()).toBeNull();
  });

  it("should handle edge cases with head and tail nodes", () => {
    // Test with a single item (head and tail are the same)
    tracker.touch("key1");
    expect(tracker.getLru()).toBe("key1");

    // Delete the only item
    tracker.delete("key1");
    expect(tracker.size).toBe(0);
    expect(tracker.getLru()).toBeNull();

    // Add three items
    tracker.touch("key1");
    tracker.touch("key2");
    tracker.touch("key3");

    // Delete the head (most recent)
    tracker.delete("key3");
    expect(tracker.keys()).toEqual(["key2", "key1"]);

    // Delete the tail (least recent)
    tracker.delete("key1");
    expect(tracker.keys()).toEqual(["key2"]);
  });

  it("should return entries correctly", () => {
    tracker.touch("key1");
    tracker.touch("key2");

    const entries = tracker.entries();
    expect(entries.length).toBe(2);

    // Each entry should be a [key, LruNode] pair
    for (const entry of entries) {
      expect(Array.isArray(entry)).toBe(true);
      expect(entry.length).toBe(2);
      expect(typeof entry[0]).toBe("string");
      expect(entry[1]).toBeInstanceOf(LruNode);
    }

    // Ensure the keys match what we added
    const keys = entries.map(([key]) => key);
    expect(keys).toContain("key1");
    expect(keys).toContain("key2");
  });
});

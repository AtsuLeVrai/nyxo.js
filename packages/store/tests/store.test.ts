import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { z } from "zod";
import { Store, type StoreOptions } from "../src/index.js";

describe("Store", () => {
  // Setup and teardown
  beforeEach(() => {
    // Use fake timers to control time-based functionality
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Constructor", () => {
    it("should create a store with default options", () => {
      const store = new Store<string, number>();
      expect(store.size).toBe(0);
    });

    it("should create a store with initial entries", () => {
      const entries: [string, number][] = [
        ["one", 1],
        ["two", 2],
      ];
      const store = new Store<string, number>(entries);

      expect(store.size).toBe(2);
      expect(store.get("one")).toBe(1);
      expect(store.get("two")).toBe(2);
    });

    it("should create a store with custom options", () => {
      const options: StoreOptions = {
        maxSize: 5,
        ttl: 1000,
        evictionStrategy: "lru",
        cloneValues: true,
        expirationCheckInterval: 5000,
      };
      const store = new Store<string, number>(options);

      expect(store.size).toBe(0);
      // Since options are private, we can test their effect indirectly

      // Test maxSize effect
      for (let i = 0; i < 6; i++) {
        store.set(`key${i}`, i);
      }
      expect(store.size).toBe(5); // maxSize is 5
    });

    it("should create a store with both initial entries and options", () => {
      const entries: [string, number][] = [
        ["one", 1],
        ["two", 2],
      ];
      const options: z.input<typeof StoreOptions> = {
        maxSize: 3,
        ttl: 1000,
      };
      const store = new Store<string, number>(entries, options);

      expect(store.size).toBe(2);
      expect(store.get("one")).toBe(1);

      // Test maxSize effect
      store.set("three", 3);
      store.set("four", 4); // This should cause an eviction
      expect(store.size).toBe(3);
    });

    it("should throw error for invalid constructor arguments", () => {
      // @ts-expect-error Testing runtime error for invalid input
      expect(() => new Store<string, number>("invalid")).toThrow();
    });

    it("should throw error for invalid options", () => {
      expect(() => new Store<string, number>({ maxSize: -1 })).toThrow();

      expect(() => new Store<string, number>({ ttl: -100 })).toThrow();

      expect(
        () =>
          // @ts-expect-error Testing runtime error for invalid option
          new Store<string, number>({ evictionStrategy: "invalid" }),
      ).toThrow();
    });
  });

  describe("Basic Map operations", () => {
    let store: Store<string, number>;

    beforeEach(() => {
      store = new Store<string, number>();
    });

    it("should set and get values", () => {
      store.set("key1", 42);
      expect(store.get("key1")).toBe(42);
    });

    it("should check if key exists", () => {
      store.set("key1", 42);
      expect(store.has("key1")).toBe(true);
      expect(store.has("key2")).toBe(false);
    });

    it("should delete keys", () => {
      store.set("key1", 42);
      expect(store.delete("key1")).toBe(true);
      expect(store.has("key1")).toBe(false);
      expect(store.delete("key1")).toBe(false); // Already deleted
    });

    it("should clear the store", () => {
      store.set("key1", 42);
      store.set("key2", 43);
      store.clear();
      expect(store.size).toBe(0);
    });

    it("should iterate over entries", () => {
      store.set("key1", 42);
      store.set("key2", 43);

      const entries: [string, number][] = [];
      for (const [key, value] of store) {
        entries.push([key, value]);
      }

      expect(entries).toHaveLength(2);
      expect(entries).toContainEqual(["key1", 42]);
      expect(entries).toContainEqual(["key2", 43]);
    });
  });

  describe("Enhanced operations", () => {
    let store: Store<
      string,
      { name?: string; age?: number; emails?: string[] }
    >;

    beforeEach(() => {
      store = new Store<
        string,
        { name?: string; age?: number; emails?: string[] }
      >();
    });

    it("should merge objects with add method", () => {
      store.set("user1", { name: "John", age: 30 });
      store.add("user1", { emails: ["john@example.com"] });

      expect(store.get("user1")).toEqual({
        name: "John",
        age: 30,
        emails: ["john@example.com"],
      });
    });

    it("should add new items with add method", () => {
      store.add("user1", { name: "John" });
      expect(store.get("user1")).toEqual({ name: "John" });
    });

    it("should replace non-object values with add method", () => {
      // First setup a store with numbers
      const numStore = new Store<string, number>();
      numStore.set("counter", 1);
      numStore.add("counter", 2);
      expect(numStore.get("counter")).toBe(2);
    });

    it("should remove properties from objects", () => {
      store.set("user1", {
        name: "John",
        age: 30,
        emails: ["john@example.com"],
      });

      // Remove a single property
      store.remove("user1", "age");
      expect(store.get("user1")).toEqual({
        name: "John",
        emails: ["john@example.com"],
      });

      // Remove multiple properties
      store.remove("user1", ["name", "emails"]);
      expect(store.get("user1")).toEqual({});
    });

    it("should throw when removing from non-existent key", () => {
      expect(() => store.remove("nonexistent", "name")).toThrow();
    });

    it("should throw when removing from non-object value", () => {
      const numStore = new Store<string, number>();
      numStore.set("counter", 1);
      expect(() => numStore.remove("counter", "anything")).toThrow();
    });
  });

  describe("Search and find operations", () => {
    let store: Store<
      string,
      { name: string; age: number; role: string; tags: string[] }
    >;

    beforeEach(() => {
      store = new Store<
        string,
        { name: string; age: number; role: string; tags: string[] }
      >();
      store.set("user1", {
        name: "John",
        age: 30,
        role: "admin",
        tags: ["staff"],
      });
      store.set("user2", {
        name: "Jane",
        age: 25,
        role: "user",
        tags: ["staff"],
      });
      store.set("user3", {
        name: "Bob",
        age: 40,
        role: "user",
        tags: ["contractor"],
      });
    });

    it("should find the first matching item with function predicate", () => {
      const result = store.find((value) => value.age > 25);
      expect(result).toEqual({
        name: "John",
        age: 30,
        role: "admin",
        tags: ["staff"],
      });
    });

    it("should find the first matching item with pattern object", () => {
      const result = store.find({ role: "user" });
      expect(result?.name).toBe("Jane"); // Should find user2
    });

    it("should handle array properties in pattern matching", () => {
      const result = store.find({ tags: ["staff"] });
      expect(result).toBeTruthy();
      expect(result?.name).toBe("John"); // Should find user1
    });

    it("should return undefined when no match is found", () => {
      const result = store.find({ role: "nonexistent" });
      expect(result).toBeUndefined();
    });

    it("should find all matching items with function predicate", () => {
      const results = store.findAll((value) => value.role === "user");
      expect(results).toHaveLength(2);
      expect(results.map((u) => u.name).sort()).toEqual(["Bob", "Jane"]);
    });

    it("should find all matching items with pattern object", () => {
      const results = store.findAll({ tags: ["staff"] });
      expect(results).toHaveLength(2);
      expect(results.map((u) => u.name).sort()).toEqual(["Jane", "John"]);
    });

    it("should filter items and return a new store", () => {
      const filteredStore = store.filter((value) => value.age > 25);

      expect(filteredStore).toBeInstanceOf(Store);
      expect(filteredStore.size).toBe(2);

      // Original store should be unchanged
      expect(store.size).toBe(3);
    });
  });

  describe("TTL functionality", () => {
    let store: Store<string, number>;

    beforeEach(() => {
      // Store with 1000ms TTL
      store = new Store<string, number>(null, { ttl: 1000 });
    });

    it("should expire items after TTL", () => {
      store.set("key1", 42);

      // Item should exist initially
      expect(store.get("key1")).toBe(42);

      // Advance time past TTL
      vi.advanceTimersByTime(1500);

      // Item should be expired now
      expect(store.get("key1")).toBeUndefined();
      expect(store.has("key1")).toBe(false);
    });

    it("should allow setting custom TTL for specific items", () => {
      store.setWithTtl("shortLived", 10, 500); // 500ms TTL
      store.setWithTtl("longLived", 20, 2000); // 2000ms TTL

      // Advance time 700ms (should expire shortLived but not longLived)
      vi.advanceTimersByTime(700);

      expect(store.get("shortLived")).toBeUndefined();
      expect(store.get("longLived")).toBe(20);

      // Advance time to 2100ms total (should expire longLived too)
      vi.advanceTimersByTime(1400);

      expect(store.get("longLived")).toBeUndefined();
    });

    it("should check if an item is expired", () => {
      store.set("key1", 42);

      expect(store.isExpired("key1")).toBe(false);

      vi.advanceTimersByTime(1500);

      expect(store.isExpired("key1")).toBe(true);
    });

    it("should throw when setting negative TTL", () => {
      expect(() => store.setWithTtl("key", 42, -1000)).toThrow();
    });

    it("should handle automatic cleanup of expired items", () => {
      // Create store with TTL and very short cleanup interval
      const cleanupStore = new Store<string, number>(null, {
        ttl: 1000,
        expirationCheckInterval: 1000,
      });

      cleanupStore.set("key1", 1);
      cleanupStore.set("key2", 2);

      // Advance time past TTL
      vi.advanceTimersByTime(1500);

      // Cleanup should have run
      expect(cleanupStore.size).toBe(0);

      // Make sure to destroy the store to clean up intervals
      cleanupStore.destroy();
    });
  });

  describe("Eviction strategies", () => {
    it("should use FIFO eviction strategy", () => {
      const store = new Store<string, number>(null, {
        maxSize: 3,
        evictionStrategy: "fifo",
      });

      store.set("first", 1);
      store.set("second", 2);
      store.set("third", 3);

      // This should evict 'first' (FIFO)
      store.set("fourth", 4);

      expect(store.has("first")).toBe(false);
      expect(store.has("second")).toBe(true);
      expect(store.has("third")).toBe(true);
      expect(store.has("fourth")).toBe(true);
    });

    it("should use LRU eviction strategy", () => {
      const store = new Store<string, number>(null, {
        maxSize: 3,
        evictionStrategy: "lru",
      });

      store.set("first", 1);
      store.set("second", 2);
      store.set("third", 3);

      // Access 'first' to make it recently used
      store.get("first");

      // This should evict 'second' (least recently used)
      store.set("fourth", 4);

      expect(store.has("first")).toBe(true);
      expect(store.has("second")).toBe(false);
      expect(store.has("third")).toBe(true);
      expect(store.has("fourth")).toBe(true);
    });

    it("should not evict items when maxSize is 0 (unlimited)", () => {
      const store = new Store<string, number>(null, { maxSize: 0 });

      // Add many items
      for (let i = 0; i < 100; i++) {
        store.set(`key${i}`, i);
      }

      expect(store.size).toBe(100);
    });
  });

  describe("Value cloning", () => {
    it("should clone values when cloneValues option is true", () => {
      const store = new Store<string, { count: number }>(null, {
        cloneValues: true,
      });

      const original = { count: 5 };
      store.set("obj", original);

      // Get the value and modify it
      const retrieved = store.get("obj");
      if (retrieved) {
        retrieved.count = 10;
      }

      // The stored value should remain unchanged
      expect(store.get("obj")?.count).toBe(5);

      // Original object should be unchanged
      expect(original.count).toBe(5);
    });

    it("should not clone values when cloneValues option is false", () => {
      const store = new Store<string, { count: number }>();

      const original = { count: 5 };
      store.set("obj", original);

      // Get the value and modify it
      const retrieved = store.get("obj");
      if (retrieved) {
        retrieved.count = 10;
      }

      // The stored value should be changed
      expect(store.get("obj")?.count).toBe(10);

      // Original object should also be changed
      expect(original.count).toBe(10);
    });
  });

  describe("Utility methods", () => {
    let store: Store<string, { name: string; value: number }>;

    beforeEach(() => {
      store = new Store<string, { name: string; value: number }>();
      store.set("a", { name: "Item A", value: 10 });
      store.set("b", { name: "Item B", value: 5 });
      store.set("c", { name: "Item C", value: 15 });
    });

    it("should map values", () => {
      const names = store.map((item) => item.name);
      expect(names).toContain("Item A");
      expect(names).toContain("Item B");
      expect(names).toContain("Item C");
      expect(names).toHaveLength(3);
    });

    it("should sort entries", () => {
      const sorted = store.sort((a, b) => a.value - b.value);

      expect(sorted).toBeInstanceOf(Store);
      expect(sorted.size).toBe(3);

      const values = sorted.toArray();
      expect(values[0]?.value).toBe(5);
      expect(values[1]?.value).toBe(10);
      expect(values[2]?.value).toBe(15);
    });

    it("should provide slice for pagination", () => {
      // Create store with 10 items
      const paginationStore = new Store<number, string>();
      for (let i = 0; i < 10; i++) {
        paginationStore.set(i, `Item ${i}`);
      }

      // Get first page (3 items)
      const page1 = paginationStore.slice(0, 3);
      expect(page1).toHaveLength(3);
      expect(page1).toContain("Item 0");
      expect(page1).toContain("Item 1");
      expect(page1).toContain("Item 2");

      // Get second page
      const page2 = paginationStore.slice(1, 3);
      expect(page2).toHaveLength(3);
      expect(page2).toContain("Item 3");
      expect(page2).toContain("Item 4");
      expect(page2).toContain("Item 5");

      // Last page might be partial
      const lastPage = paginationStore.slice(3, 3);
      expect(lastPage).toHaveLength(1);
      expect(lastPage).toContain("Item 9");
    });

    it("should throw for invalid pagination parameters", () => {
      expect(() => store.slice(-1, 10)).toThrow();
      expect(() => store.slice(0, 0)).toThrow();
      expect(() => store.slice(0, -5)).toThrow();
    });

    it("should convert to array formats", () => {
      // Values array
      const valuesArray = store.toArray();
      expect(valuesArray).toHaveLength(3);
      expect(valuesArray[0]).toHaveProperty("name");

      // Keys array
      const keysArray = store.keysArray();
      expect(keysArray).toHaveLength(3);
      expect(keysArray).toContain("a");
      expect(keysArray).toContain("b");
      expect(keysArray).toContain("c");

      // Entries array
      const entriesArray = store.entriesArray();
      expect(entriesArray).toHaveLength(3);
      expect(entriesArray[0]).toHaveLength(2);
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle various key types", () => {
      // String keys
      const stringStore = new Store<string, number>();
      stringStore.set("key", 1);
      expect(stringStore.get("key")).toBe(1);

      // Number keys
      const numberStore = new Store<number, string>();
      numberStore.set(42, "value");
      expect(numberStore.get(42)).toBe("value");

      // Symbol keys
      const symbolStore = new Store<symbol, boolean>();
      const sym = Symbol("test");
      symbolStore.set(sym, true);
      expect(symbolStore.get(sym)).toBe(true);
    });

    it("should destroy cleanup interval", () => {
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      const store = new Store<string, number>(null, { ttl: 1000 });
      store.destroy();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});

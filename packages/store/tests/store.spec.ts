import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Store } from "../src/index.js";

describe("Store", () => {
  // Constructor tests
  describe("constructor", () => {
    it("should create an empty store with default options", () => {
      const store = new Store();
      expect(store.size).toBe(0);
    });

    it("should initialize with provided entries", () => {
      const entries = [
        ["key1", "value1"],
        ["key2", "value2"],
      ] as const;
      const store = new Store(entries);
      expect(store.size).toBe(2);
      expect(store.get("key1")).toBe("value1");
      expect(store.get("key2")).toBe("value2");
    });

    it("should validate options and throw on invalid options", () => {
      expect(() => new Store(null, { maxSize: -1 })).toThrow();
      expect(() => new Store(null, { ttl: -1 })).toThrow();
      expect(
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        () => new Store(null, { evictionStrategy: "invalid" as any }),
      ).toThrow();
    });
  });

  // Basic Map functionality tests
  describe("basic Map functionality", () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let store: Store<string, any>;

    beforeEach(() => {
      store = new Store();
    });

    it("should set and get values", () => {
      store.set("key1", "value1");
      expect(store.get("key1")).toBe("value1");
    });

    it("should check if a key exists", () => {
      store.set("key1", "value1");
      expect(store.has("key1")).toBe(true);
      expect(store.has("nonexistent")).toBe(false);
    });

    it("should delete values", () => {
      store.set("key1", "value1");
      expect(store.delete("key1")).toBe(true);
      expect(store.has("key1")).toBe(false);
      expect(store.delete("nonexistent")).toBe(false);
    });

    it("should clear all values", () => {
      store.set("key1", "value1");
      store.set("key2", "value2");
      store.clear();
      expect(store.size).toBe(0);
    });

    it("should iterate over entries", () => {
      store.set("key1", "value1");
      store.set("key2", "value2");

      const entries = Array.from(store.entries());
      expect(entries).toEqual([
        ["key1", "value1"],
        ["key2", "value2"],
      ]);

      const keys = Array.from(store.keys());
      expect(keys).toEqual(["key1", "key2"]);

      const values = Array.from(store.values());
      expect(values).toEqual(["value1", "value2"]);
    });
  });

  // Enhanced functionality tests
  describe("add method", () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let store: Store<string, any>;

    beforeEach(() => {
      store = new Store();
    });

    it("should add a new item", () => {
      store.add("user1", { name: "John" });
      expect(store.get("user1")).toEqual({ name: "John" });
    });

    it("should merge with existing object value", () => {
      store.set("user1", { name: "John", age: 30 });
      store.add("user1", { email: "john@example.com" });
      expect(store.get("user1")).toEqual({
        name: "John",
        age: 30,
        email: "john@example.com",
      });
    });

    it("should deep merge nested objects", () => {
      store.set("user1", {
        name: "John",
        address: { city: "New York", zipcode: "10001" },
      });
      store.add("user1", {
        address: { country: "USA", city: "Brooklyn" },
      });
      expect(store.get("user1")).toEqual({
        name: "John",
        address: {
          city: "Brooklyn",
          zipcode: "10001",
          country: "USA",
        },
      });
    });

    it("should replace non-object values", () => {
      store.set("key1", "value1");
      store.add("key1", "value2");
      expect(store.get("key1")).toBe("value2");
    });

    it("should handle adding arrays", () => {
      store.set("key1", { items: [1, 2] });
      store.add("key1", { items: [3, 4] });
      expect(store.get("key1")).toEqual({ items: [1, 2, 3, 4] });
    });

    it("should handle complex nested objects", () => {
      store.set("user1", {
        name: "John",
        preferences: {
          theme: "dark",
          notifications: {
            email: true,
            push: false,
          },
        },
        history: [{ action: "login", date: "2023-01-01" }],
      });

      store.add("user1", {
        preferences: {
          language: "en",
          notifications: {
            sms: true,
          },
        },
        history: [{ action: "update", date: "2023-01-02" }],
      });

      expect(store.get("user1")).toEqual({
        name: "John",
        preferences: {
          theme: "dark",
          language: "en",
          notifications: {
            email: true,
            push: false,
            sms: true,
          },
        },
        history: [
          { action: "login", date: "2023-01-01" },
          { action: "update", date: "2023-01-02" },
        ],
      });
    });
  });

  describe("remove method", () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let store: Store<string, any>;

    beforeEach(() => {
      store = new Store();
      store.set("user1", {
        name: "John",
        age: 30,
        email: "john@example.com",
        address: {
          city: "New York",
          zipcode: "10001",
        },
      });
    });

    it("should remove a specific property", () => {
      store.remove("user1", "email");
      expect(store.get("user1")).toEqual({
        name: "John",
        age: 30,
        address: {
          city: "New York",
          zipcode: "10001",
        },
      });
    });

    it("should remove multiple properties", () => {
      store.remove("user1", ["email", "age"]);
      expect(store.get("user1")).toEqual({
        name: "John",
        address: {
          city: "New York",
          zipcode: "10001",
        },
      });
    });

    it("should remove nested properties", () => {
      store.remove("user1", "address.city");
      expect(store.get("user1")).toEqual({
        name: "John",
        age: 30,
        email: "john@example.com",
        address: {
          zipcode: "10001",
        },
      });
    });

    it("should do nothing for non-existent keys", () => {
      store.remove("nonexistent", "property");
      expect(store.has("nonexistent")).toBe(false);
    });

    it("should do nothing for non-object values", () => {
      store.set("key1", "value1");
      store.remove("key1", "property");
      expect(store.get("key1")).toBe("value1");
    });
  });

  describe("find method", () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let store: Store<string, any>;

    beforeEach(() => {
      // @ts-expect-error
      store = new Store([
        ["user1", { name: "John", age: 30, role: "admin" }],
        ["user2", { name: "Jane", age: 25, role: "user" }],
        ["user3", { name: "Bob", age: 40, role: "admin" }],
      ] as const);
    });

    it("should find using a function predicate", () => {
      const result = store.find((value) => value.age > 35);
      expect(result).toEqual({ name: "Bob", age: 40, role: "admin" });
    });

    it("should find using a pattern object", () => {
      const result = store.find({ role: "admin" });
      expect(result).toEqual({ name: "John", age: 30, role: "admin" });
    });

    it("should find using multiple criteria in a pattern", () => {
      store.set("user4", { name: "Sam", age: 35, role: "admin" });
      const result = store.find({ role: "admin", age: 35 });
      expect(result).toEqual({ name: "Sam", age: 35, role: "admin" });
    });

    it("should find using a pattern with nested properties", () => {
      store.set("user4", {
        name: "Alice",
        age: 35,
        address: { country: "USA" },
      });

      const result = store.find({ "address.country": "USA" });
      expect(result).toEqual({
        name: "Alice",
        age: 35,
        address: { country: "USA" },
      });
    });

    it("should return undefined if no match is found", () => {
      const result = store.find({ role: "manager" });
      expect(result).toBeUndefined();
    });

    it("should find using a pattern matching an array value", () => {
      store.set("post1", {
        title: "Hello",
        tags: ["javascript", "typescript"],
      });

      const result = store.find({ tags: "javascript" });
      expect(result).toEqual({
        title: "Hello",
        tags: ["javascript", "typescript"],
      });
    });
  });

  describe("filter method", () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let store: Store<string, any>;

    beforeEach(() => {
      // @ts-expect-error
      store = new Store([
        ["user1", { name: "John", age: 30, role: "admin" }],
        ["user2", { name: "Jane", age: 25, role: "user" }],
        ["user3", { name: "Bob", age: 40, role: "admin" }],
      ] as const);
    });

    it("should filter using a function predicate", () => {
      const result = store.filter((value) => value.age > 25);
      expect(result.size).toBe(2);
      expect(result.get("user1")).toEqual({
        name: "John",
        age: 30,
        role: "admin",
      });
      expect(result.get("user3")).toEqual({
        name: "Bob",
        age: 40,
        role: "admin",
      });
    });

    it("should filter using a pattern object", () => {
      const result = store.filter({ role: "admin" });
      expect(result.size).toBe(2);
      expect(result.get("user1")).toEqual({
        name: "John",
        age: 30,
        role: "admin",
      });
      expect(result.get("user3")).toEqual({
        name: "Bob",
        age: 40,
        role: "admin",
      });
    });

    it("should filter using multiple criteria in a pattern", () => {
      store.set("user4", { name: "Sam", age: 30, role: "admin" });
      const result = store.filter({ role: "admin", age: 30 });
      expect(result.size).toBe(2);
      expect(result.get("user1")).toEqual({
        name: "John",
        age: 30,
        role: "admin",
      });
      expect(result.get("user4")).toEqual({
        name: "Sam",
        age: 30,
        role: "admin",
      });
    });

    it("should return an empty store if no matches are found", () => {
      const result = store.filter({ role: "manager" });
      expect(result.size).toBe(0);
    });

    it("should filter using a pattern matching an array value", () => {
      store.clear();
      store.set("post1", {
        title: "Hello",
        tags: ["javascript", "typescript"],
      });
      store.set("post2", { title: "World", tags: ["python", "javascript"] });
      store.set("post3", { title: "Test", tags: ["python", "django"] });

      const result = store.filter({ tags: "javascript" });
      expect(result.size).toBe(2);
      expect(result.get("post1")).toBeDefined();
      expect(result.get("post2")).toBeDefined();
      expect(result.get("post3")).toBeUndefined();
    });
  });

  // TTL functionality tests
  describe("TTL functionality", () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let store: Store<string, any>;

    beforeEach(() => {
      // Setup fake timer with Date mocking enabled
      vi.useFakeTimers({
        toFake: [
          "setTimeout",
          "clearTimeout",
          "setInterval",
          "clearInterval",
          "Date",
        ],
      });
      store = new Store(null, { ttl: 1000 }); // 1 second TTL
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
      store.destroy();
    });

    it("should expire items after TTL", () => {
      store.set("key1", "value1");

      // Fast-forward time
      vi.advanceTimersByTime(1500); // 1.5 seconds

      expect(store.get("key1")).toBeUndefined();
      expect(store.has("key1")).toBe(false);
    });

    it("should set items with custom TTL", () => {
      store.setWithTtl("key1", "value1", 2000); // 2 seconds TTL

      // Fast-forward time
      vi.advanceTimersByTime(1500); // 1.5 seconds

      // Item should still exist
      expect(store.get("key1")).toBe("value1");

      // Fast-forward more time
      vi.advanceTimersByTime(1000); // Another 1 second

      // Now it should be expired
      expect(store.get("key1")).toBeUndefined();
    });

    it("should check if an item is expired", () => {
      store.set("key1", "value1");
      expect(store.isExpired("key1")).toBe(false);

      vi.advanceTimersByTime(1500); // 1.5 seconds

      expect(store.isExpired("key1")).toBe(true);
    });

    it("should handle items with no TTL", () => {
      const storeNoTtl = new Store();
      storeNoTtl.set("key1", "value1");

      // Fast-forward time
      vi.advanceTimersByTime(10000); // 10 seconds

      // Item should still exist
      expect(storeNoTtl.get("key1")).toBe("value1");
    });

    it("should run clean-up periodically", () => {
      // Spy on the delete method to see if it's called during cleanup
      const deleteSpy = vi.spyOn(store, "delete");

      store.set("key1", "value1");
      store.set("key2", "value2");

      // Fast-forward time to trigger cleanup
      vi.advanceTimersByTime(1500); // 1.5 seconds

      expect(deleteSpy).toHaveBeenCalled();
    });
  });

  // Eviction strategy tests
  describe("eviction strategies", () => {
    beforeEach(() => {
      vi.useFakeTimers({
        toFake: [
          "setTimeout",
          "clearTimeout",
          "setInterval",
          "clearInterval",
          "Date",
        ],
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe("LRU strategy", () => {
      it("should evict least recently used item when maxSize is reached", () => {
        const store = new Store(null, {
          maxSize: 3,
          evictionStrategy: "lru",
        });

        store.set("key1", "value1");
        store.set("key2", "value2");
        store.set("key3", "value3");

        // Access key1 to make it recently used
        store.get("key1");

        // Adding a new item should evict key2 (least recently used)
        store.set("key4", "value4");

        expect(store.has("key1")).toBe(true);
        expect(store.has("key3")).toBe(true);
        expect(store.has("key4")).toBe(true);
        expect(store.size).toBe(3);
      });

      it("should update access time when item is accessed with get", () => {
        const store = new Store(null, {
          maxSize: 3,
          evictionStrategy: "lru",
        });

        store.set("key1", "value1");
        store.set("key2", "value2");
        store.set("key3", "value3");

        // Access key1 and key2
        store.get("key1");
        store.get("key2");

        // Adding a new item should evict key3 (least recently used)
        store.set("key4", "value4");

        expect(store.has("key1")).toBe(true);
        expect(store.has("key2")).toBe(true);
        expect(store.has("key4")).toBe(true);
        expect(store.size).toBe(3);
      });

      it("should update access time when item is accessed with find", () => {
        const store = new Store<string, { id: string; value: string }>(null, {
          maxSize: 3,
          evictionStrategy: "lru",
        });

        store.set("key1", { id: "1", value: "value1" });
        store.set("key2", { id: "2", value: "value2" });
        store.set("key3", { id: "3", value: "value3" });

        // Access key1 with find
        store.find({ id: "1" });

        // Adding a new item should not evict key1
        store.set("key4", { id: "4", value: "value4" });

        expect(store.has("key1")).toBe(true);
        expect(store.has("key4")).toBe(true);
        expect(store.size).toBe(3);
      });
    });

    describe("FIFO strategy", () => {
      it("should evict oldest item when maxSize is reached", () => {
        const store = new Store(null, {
          maxSize: 3,
          evictionStrategy: "fifo",
        });

        store.set("key1", "value1");
        store.set("key2", "value2");
        store.set("key3", "value3");

        // Access key1 to make it recently used, but with FIFO this shouldn't matter
        store.get("key1");

        // Adding a new item should evict key1 (oldest)
        store.set("key4", "value4");

        expect(store.has("key2")).toBe(true);
        expect(store.has("key3")).toBe(true);
        expect(store.has("key4")).toBe(true);
        expect(store.size).toBe(3);
      });

      it("should maintain insertion order for eviction", () => {
        const store = new Store(null, {
          maxSize: 3,
          evictionStrategy: "fifo",
        });

        store.set("key1", "value1");
        store.set("key2", "value2");
        store.set("key3", "value3");

        // Override key2, but it should still maintain its insertion position
        store.set("key2", "new-value2");

        // Adding a new item should still evict key1 (oldest)
        store.set("key4", "value4");

        expect(store.has("key2")).toBe(true);
        expect(store.get("key2")).toBe("new-value2");
        expect(store.has("key3")).toBe(true);
        expect(store.has("key4")).toBe(true);
        expect(store.size).toBe(3);
      });
    });

    it("should not evict items if maxSize is not reached", () => {
      const store = new Store(null, {
        maxSize: 5,
        evictionStrategy: "lru",
      });

      store.set("key1", "value1");
      store.set("key2", "value2");
      store.set("key3", "value3");

      expect(store.size).toBe(3);
      expect(store.has("key1")).toBe(true);
      expect(store.has("key2")).toBe(true);
      expect(store.has("key3")).toBe(true);
    });

    it("should handle maxSize of 0 (unlimited)", () => {
      const store = new Store(null, {
        maxSize: 0,
        evictionStrategy: "fifo", // Use fifo for unlimited to avoid LRUCache issues
      });

      // Add more items than typical maxSize
      for (let i = 0; i < 100; i++) {
        store.set(`key${i}`, `value${i}`);
      }

      expect(store.size).toBe(100);
      expect(store.has("key0")).toBe(true);
      expect(store.has("key99")).toBe(true);
    });
  });

  // Utility method tests
  describe("utility methods", () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let store: Store<string, any>;

    beforeEach(() => {
      // @ts-expect-error
      store = new Store([
        ["user1", { name: "John", age: 30 }],
        ["user2", { name: "Jane", age: 25 }],
        ["user3", { name: "Bob", age: 40 }],
      ] as const);
    });

    describe("map method", () => {
      it("should map values to a new array", () => {
        const result = store.map((user) => user.name);
        expect(result).toEqual(["John", "Jane", "Bob"]);
      });

      it("should provide key and store as additional arguments", () => {
        const result = store.map((value, key, storeInstance) => {
          expect(storeInstance).toBe(store);
          return `${key}: ${value.name}`;
        });
        expect(result).toEqual(["user1: John", "user2: Jane", "user3: Bob"]);
      });
    });

    describe("sort method", () => {
      it("should sort values with a compare function", () => {
        const sorted = store.sort((a, b) => a.age - b.age);

        const values = Array.from(sorted.values());
        expect(values).toEqual([
          { name: "Jane", age: 25 },
          { name: "John", age: 30 },
          { name: "Bob", age: 40 },
        ]);
      });

      it("should sort lexicographically by default", () => {
        const stringStore = new Store([
          ["key1", "Charlie"],
          ["key2", "Alpha"],
          ["key3", "Bravo"],
        ] as const);

        const sorted = stringStore.sort();
        const values = Array.from(sorted.values());

        expect(values).toEqual(["Alpha", "Bravo", "Charlie"]);
      });

      it("should return a new store instance", () => {
        const sorted = store.sort((a, b) => a.age - b.age);
        expect(sorted).not.toBe(store);

        // Original store should remain unchanged
        const originalValues = Array.from(store.values());
        expect(originalValues[0]).toEqual({ name: "John", age: 30 });
      });
    });

    describe("slice method", () => {
      it("should return a subset of values for pagination", () => {
        // Default page (0) and pageSize (10)
        let result = store.slice();
        expect(result.length).toBe(3);

        // Create a larger store for testing pagination
        const largeStore = new Store<string, number>();
        for (let i = 0; i < 25; i++) {
          largeStore.set(`key${i}`, i);
        }

        // First page, 10 items per page
        result = largeStore.slice(0, 10);
        expect(result.length).toBe(10);

        // Second page, 10 items per page
        result = largeStore.slice(1, 10);
        expect(result.length).toBe(10);

        // Third page, 10 items per page (only 5 remaining)
        result = largeStore.slice(2, 10);
        expect(result.length).toBe(5);
      });

      it("should handle empty pages", () => {
        const result = store.slice(10, 10);
        expect(result.length).toBe(0);
      });
    });
  });

  // Method chaining tests
  describe("method chaining", () => {
    it("should support method chaining for set", () => {
      const store = new Store<string, string>();

      store.set("key1", "value1").set("key2", "value2");

      expect(store.size).toBe(2);
      expect(store.get("key1")).toBe("value1");
      expect(store.get("key2")).toBe("value2");
    });

    it("should support method chaining for add", () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const store = new Store<string, any>();

      store.add("user1", { name: "John" }).add("user2", { name: "Jane" });

      expect(store.size).toBe(2);
      expect(store.get("user1")).toEqual({ name: "John" });
      expect(store.get("user2")).toEqual({ name: "Jane" });
    });

    it("should support method chaining for remove", () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const store = new Store<string, any>();

      store
        .add("user1", { name: "John", age: 30, email: "john@example.com" })
        .remove("user1", "email")
        .remove("user1", "age");

      expect(store.get("user1")).toEqual({ name: "John" });
    });

    it("should support chaining multiple different methods", () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const store = new Store<string, any>();

      store
        .set("key1", "value1")
        .add("user1", { name: "John", role: "admin" })
        .add("user2", { name: "Jane", role: "user" })
        .add("user3", { name: "Bob", role: "admin" })
        .remove("user1", "role")
        .delete("key1");

      expect(store.size).toBe(3);
      expect(store.has("key1")).toBe(false);
      expect(store.get("user1")).toEqual({ name: "John" });

      const adminUsers = store.filter({ role: "admin" });
      expect(adminUsers.size).toBe(1);
      expect(adminUsers.get("user3")).toEqual({ name: "Bob", role: "admin" });
    });
  });

  // Error handling and edge cases
  describe("error handling and edge cases", () => {
    it("should handle null or undefined values", () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const store = new Store<string, any>();

      store.set("key1", null);
      expect(store.get("key1")).toBeNull();

      store.set("key2", undefined);
      expect(store.get("key2")).toBeUndefined();
    });

    it("should handle array values", () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const store = new Store<string, any>();

      store.set("key1", [1, 2, 3]);
      expect(store.get("key1")).toEqual([1, 2, 3]);

      // Test find with array values
      store.set("key2", { tags: ["javascript", "typescript"] });
      const result = store.find({ tags: "javascript" });
      expect(result).toEqual({ tags: ["javascript", "typescript"] });
    });

    it("should handle getting non-existent keys", () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const store = new Store<string, any>();
      expect(store.get("nonexistent")).toBeUndefined();
    });

    it("should handle setting the same key multiple times", () => {
      const store = new Store<string, string>();

      store.set("key1", "value1");
      store.set("key1", "value2");

      expect(store.get("key1")).toBe("value2");
      expect(store.size).toBe(1);
    });

    it("should handle complex objects as keys", () => {
      type ComplexKey = `user_${number}`;
      const store = new Store<ComplexKey, string>();

      const key1: ComplexKey = "user_1";
      const key2: ComplexKey = "user_2";

      store.set(key1, "John");
      store.set(key2, "Jane");

      expect(store.get(key1)).toBe("John");
      expect(store.get(key2)).toBe("Jane");
    });

    it("should handle symbol keys", () => {
      const store = new Store<symbol, string>();

      const key1 = Symbol("key1");
      const key2 = Symbol("key2");

      store.set(key1, "value1");
      store.set(key2, "value2");

      expect(store.get(key1)).toBe("value1");
      expect(store.get(key2)).toBe("value2");
    });
  });
});

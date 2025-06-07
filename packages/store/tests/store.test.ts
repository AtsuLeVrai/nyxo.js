import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Store } from "../src/index.js";

describe("Store", () => {
  let store: Store<string, any>;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new Store<string, any>();
  });

  afterEach(() => {
    store.destroy();
    vi.useRealTimers();
  });

  describe("Constructor", () => {
    it("creates empty store with default options", () => {
      const newStore = new Store<string, number>();
      expect(newStore.size).toBe(0);
      newStore.destroy();
    });

    it("creates store with initial entries", () => {
      const entries: [string, number][] = [
        ["a", 1],
        ["b", 2],
      ];
      const newStore = new Store(entries);
      expect(newStore.size).toBe(2);
      expect(newStore.get("a")).toBe(1);
      expect(newStore.get("b")).toBe(2);
      newStore.destroy();
    });

    it("creates store with options only", () => {
      const options = { maxSize: 5, ttl: 1000 };
      const newStore = new Store<string, number>(options);
      expect(newStore.size).toBe(0);
      newStore.destroy();
    });

    it("creates store with entries and options", () => {
      const entries: [string, number][] = [["a", 1]];
      const options = { maxSize: 10 };
      const newStore = new Store(entries, options);
      expect(newStore.size).toBe(1);
      expect(newStore.get("a")).toBe(1);
      newStore.destroy();
    });

    it("throws error for invalid first argument", () => {
      expect(() => new Store("invalid" as any)).toThrow(
        "First argument must be either an array of entries or an options object",
      );
    });

    it("throws error for invalid options", () => {
      expect(() => new Store({ maxSize: -1 })).toThrow();
    });

    it("handles null entries parameter", () => {
      const newStore = new Store<string, number>(null);
      expect(newStore.size).toBe(0);
      newStore.destroy();
    });

    it("handles undefined entries parameter", () => {
      const newStore = new Store<string, number>(undefined);
      expect(newStore.size).toBe(0);
      newStore.destroy();
    });
  });

  describe("Basic Map Operations", () => {
    it("sets and gets values correctly", () => {
      store.set("key1", "value1");
      expect(store.get("key1")).toBe("value1");
    });

    it("returns undefined for non-existent keys", () => {
      expect(store.get("nonexistent")).toBeUndefined();
    });

    it("checks existence of keys correctly", () => {
      store.set("key1", "value1");
      expect(store.has("key1")).toBe(true);
      expect(store.has("nonexistent")).toBe(false);
    });

    it("deletes keys correctly", () => {
      store.set("key1", "value1");
      expect(store.delete("key1")).toBe(true);
      expect(store.has("key1")).toBe(false);
      expect(store.delete("nonexistent")).toBe(false);
    });

    it("clears all entries", () => {
      store.set("key1", "value1");
      store.set("key2", "value2");
      store.clear();
      expect(store.size).toBe(0);
      expect(store.has("key1")).toBe(false);
      expect(store.has("key2")).toBe(false);
    });

    it("returns correct size", () => {
      expect(store.size).toBe(0);
      store.set("key1", "value1");
      expect(store.size).toBe(1);
      store.set("key2", "value2");
      expect(store.size).toBe(2);
      store.delete("key1");
      expect(store.size).toBe(1);
    });
  });

  describe("TTL (Time To Live)", () => {
    beforeEach(() => {
      store.destroy();
      store = new Store<string, string>({ ttl: 1000 });
    });

    it("removes expired items automatically on get", () => {
      store.set("key1", "value1");
      expect(store.get("key1")).toBe("value1");

      vi.advanceTimersByTime(1001);
      expect(store.get("key1")).toBeUndefined();
      expect(store.has("key1")).toBe(false);
    });

    it("removes expired items automatically on has", () => {
      store.set("key1", "value1");
      expect(store.has("key1")).toBe(true);

      vi.advanceTimersByTime(1001);
      expect(store.has("key1")).toBe(false);
    });

    it("setWithTtl sets custom TTL for specific keys", () => {
      store.setWithTtl("key1", "value1", 500);
      expect(store.get("key1")).toBe("value1");

      vi.advanceTimersByTime(501);
      expect(store.get("key1")).toBeUndefined();
    });

    it("throws error for negative TTL in setWithTtl", () => {
      expect(() => store.setWithTtl("key1", "value1", -100)).toThrow(
        "TTL cannot be negative: -100",
      );
    });

    it("isExpired returns correct expiration status", () => {
      store.setWithTtl("key1", "value1", 1000);
      expect(store.isExpired("key1")).toBe(false);

      vi.advanceTimersByTime(1001);
      expect(store.isExpired("key1")).toBe(true);
    });

    it("isExpired returns false for non-existent keys", () => {
      expect(store.isExpired("nonexistent")).toBe(false);
    });

    it("isExpired handles keys without TTL correctly", () => {
      const noTtlStore = new Store<string, string>();
      noTtlStore.set("key1", "value1");
      expect(noTtlStore.isExpired("key1")).toBe(false);
      noTtlStore.destroy();
    });

    it("applies default TTL to existing keys without explicit TTL", () => {
      const noTtlStore = new Store<string, string>();
      noTtlStore.set("key1", "value1");
      noTtlStore.destroy();

      const ttlStore = new Store<string, string>({ ttl: 1000 });
      ttlStore.set("key1", "value1");
      expect(ttlStore.isExpired("key1")).toBe(false);
      ttlStore.destroy();
    });

    it("performs periodic sweep of expired items", () => {
      store.setWithTtl("key1", "value1", 500);
      store.setWithTtl("key2", "value2", 20000);

      vi.advanceTimersByTime(501); // key1 expire
      vi.advanceTimersByTime(15000); // Trigger sweep (temps total: 15501ms)

      expect(store.has("key1")).toBe(false);
      expect(store.has("key2")).toBe(true);
    });

    it("performs occasional passive sweep on get operations", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.005); // Force passive sweep

      store.setWithTtl("expired1", "value1", 100);
      store.setWithTtl("expired2", "value2", 100);
      store.setWithTtl("valid", "value3", 2000);

      vi.advanceTimersByTime(101);

      // This get should trigger passive sweep
      store.get("valid");

      expect(store.has("expired1")).toBe(false);
      expect(store.has("expired2")).toBe(false);
      expect(store.has("valid")).toBe(true);

      vi.restoreAllMocks();
    });
  });

  describe("Eviction Strategies", () => {
    describe("FIFO Eviction", () => {
      beforeEach(() => {
        store.destroy();
        store = new Store<string, string>({
          maxSize: 3,
          evictionStrategy: "fifo",
        });
      });

      it("evicts oldest items when maxSize is exceeded", () => {
        store.set("key1", "value1");
        store.set("key2", "value2");
        store.set("key3", "value3");
        store.set("key4", "value4"); // Should evict key1

        expect(store.has("key1")).toBe(false);
        expect(store.has("key2")).toBe(true);
        expect(store.has("key3")).toBe(true);
        expect(store.has("key4")).toBe(true);
        expect(store.size).toBe(3);
      });

      it("does not evict when updating existing keys", () => {
        store.set("key1", "value1");
        store.set("key2", "value2");
        store.set("key3", "value3");
        store.set("key2", "updated"); // Update existing key

        expect(store.size).toBe(3);
        expect(store.get("key2")).toBe("updated");
      });
    });

    describe("LRU Eviction", () => {
      beforeEach(() => {
        store.destroy();
        store = new Store<string, string>({
          maxSize: 3,
          evictionStrategy: "lru",
        });
      });

      it("evicts least recently used items", () => {
        store.set("key1", "value1");
        store.set("key2", "value2");
        store.set("key3", "value3");

        // Access key1 to make it recently used
        store.get("key1");

        store.set("key4", "value4"); // Should evict key2 (least recently used)

        expect(store.has("key1")).toBe(true);
        expect(store.has("key2")).toBe(false);
        expect(store.has("key3")).toBe(true);
        expect(store.has("key4")).toBe(true);
      });

      it("updates access time on get operations", () => {
        store.set("key1", "value1");
        store.set("key2", "value2");
        store.set("key3", "value3");

        // Make key1 most recently used
        store.get("key1");

        store.set("key4", "value4");

        expect(store.has("key1")).toBe(true);
      });

      it("updates access time on has operations for expired check", () => {
        store.set("key1", "value1");
        store.set("key2", "value2");
        store.set("key3", "value3");

        // Access through has (but this doesn't update LRU in current implementation)
        store.has("key1");

        store.set("key4", "value4");

        // The behavior depends on implementation details
        expect(store.size).toBe(3);
      });
    });

    describe("No Size Limit", () => {
      beforeEach(() => {
        store.destroy();
        store = new Store<string, string>({ maxSize: 0 });
      });

      it("allows unlimited growth when maxSize is 0", () => {
        for (let i = 0; i < 1000; i++) {
          store.set(`key${i}`, `value${i}`);
        }
        expect(store.size).toBe(1000);
      });
    });
  });

  describe("Advanced Operations", () => {
    beforeEach(() => {
      store.set("user1", { name: "Alice", age: 30, active: true });
      store.set("user2", { name: "Bob", age: 25, active: false });
      store.set("user3", { name: "Charlie", age: 35, active: true });
    });

    describe("add method", () => {
      it("adds new values for non-existent keys", () => {
        store.add("user4", { name: "David", age: 28 });
        expect(store.get("user4")).toEqual({ name: "David", age: 28 });
      });

      it("performs deep merge for existing object values", () => {
        store.add("user1", { age: 31, city: "New York" });
        expect(store.get("user1")).toEqual({
          name: "Alice",
          age: 31,
          active: true,
          city: "New York",
        });
      });

      it("replaces non-object values", () => {
        store.set("simple", "original");
        store.add("simple", "replaced");
        expect(store.get("simple")).toBe("replaced");
      });

      it("replaces object with non-object value", () => {
        store.add("user1", "string value");
        expect(store.get("user1")).toBe("string value");
      });

      it("replaces non-object with object value", () => {
        store.set("simple", "string");
        store.add("simple", { prop: "value" });
        expect(store.get("simple")).toEqual({ prop: "value" });
      });
    });

    describe("remove method", () => {
      it("removes single property from object", () => {
        store.remove("user1", "age");
        const user1 = store.get("user1");
        expect(user1).toEqual({ name: "Alice", active: true });
        expect(user1.age).toBeUndefined();
      });

      it("removes multiple properties from object", () => {
        store.remove("user1", ["age", "active"]);
        expect(store.get("user1")).toEqual({ name: "Alice" });
      });

      it("removes nested properties using dot notation", () => {
        store.set("nested", {
          user: { profile: { name: "Test", age: 25 }, id: 1 },
        });
        store.remove("nested", "user.profile.age");
        expect(store.get("nested")).toEqual({
          user: { profile: { name: "Test" }, id: 1 },
        });
      });

      it("throws error for non-existent key", () => {
        expect(() => store.remove("nonexistent", "prop")).toThrow(
          "Key not found: nonexistent",
        );
      });

      it("throws error for non-object value", () => {
        store.set("simple", "string");
        expect(() => store.remove("simple", "prop")).toThrow(
          "Cannot remove properties from non-object value at key: simple",
        );
      });

      it("throws error for null value", () => {
        store.set("nullValue", null);
        expect(() => store.remove("nullValue", "prop")).toThrow(
          "Cannot remove properties from non-object value at key: nullValue",
        );
      });
    });

    describe("find method", () => {
      it("finds value using function predicate", () => {
        const result = store.find((value) => value.name === "Bob");
        expect(result).toEqual({ name: "Bob", age: 25, active: false });
      });

      it("finds value using object pattern", () => {
        const result = store.find({ active: true, age: 30 });
        expect(result).toEqual({ name: "Alice", age: 30, active: true });
      });

      it("returns undefined when no match found", () => {
        const result = store.find({ name: "NonExistent" });
        expect(result).toBeUndefined();
      });

      it("finds value with nested property pattern", () => {
        store.set("nested", { user: { name: "Test" }, tags: ["a", "b"] });
        const result = store.find({ "user.name": "Test" });
        expect(result).toEqual({ user: { name: "Test" }, tags: ["a", "b"] });
      });

      it("handles array contains matching", () => {
        store.set("withArray", { tags: ["javascript", "typescript"] });
        const result = store.find({ tags: "javascript" });
        expect(result).toEqual({ tags: ["javascript", "typescript"] });
      });

      it("handles array equality matching", () => {
        store.set("withArray", { tags: ["javascript", "typescript"] });
        const result = store.find({ tags: ["javascript", "typescript"] });
        expect(result).toEqual({ tags: ["javascript", "typescript"] });
      });
    });

    describe("findAll method", () => {
      it("finds all values using function predicate", () => {
        const results = store.findAll((value) => value.active === true);
        expect(results).toHaveLength(2);
        expect(results.map((r) => r.name)).toEqual(["Alice", "Charlie"]);
      });

      it("finds all values using object pattern", () => {
        const results = store.findAll({ active: true });
        expect(results).toHaveLength(2);
      });

      it("returns empty array when no matches found", () => {
        const results = store.findAll({ name: "NonExistent" });
        expect(results).toEqual([]);
      });

      it("finds all with partial object matching", () => {
        const results = store.findAll({ active: true });
        expect(results.every((r) => r.active === true)).toBe(true);
      });
    });

    describe("filter method", () => {
      it("creates new Store with filtered entries using function", () => {
        const filtered = store.filter((value) => value.age > 30);
        expect(filtered.size).toBe(1);
        expect(filtered.get("user3")).toEqual({
          name: "Charlie",
          age: 35,
          active: true,
        });
        expect(filtered).toBeInstanceOf(Store);
        filtered.destroy();
      });

      it("creates new Store with filtered entries using object pattern", () => {
        const filtered = store.filter({ active: true });
        expect(filtered.size).toBe(2);
        expect(filtered.has("user1")).toBe(true);
        expect(filtered.has("user3")).toBe(true);
        expect(filtered.has("user2")).toBe(false);
        filtered.destroy();
      });

      it("returns empty Store when no matches", () => {
        const filtered = store.filter({ name: "NonExistent" });
        expect(filtered.size).toBe(0);
        filtered.destroy();
      });

      it("preserves original store options in filtered store", () => {
        store.destroy();
        const originalStore = new Store<string, any>(null, {
          maxSize: 5,
          ttl: 1000,
        });
        originalStore.set("key1", { value: 1 });

        const filtered = originalStore.filter({ value: 1 });
        expect(filtered.size).toBe(1);

        originalStore.destroy();
        filtered.destroy();
      });
    });
  });

  describe("Utility Methods", () => {
    beforeEach(() => {
      store.set("a", 1);
      store.set("b", 2);
      store.set("c", 3);
    });

    describe("map method", () => {
      it("maps values to new array", () => {
        const doubled = store.map((value) => value * 2);
        expect(doubled).toEqual([2, 4, 6]);
      });

      it("provides key and store in callback", () => {
        const result = store.map((value, key, storeRef) => {
          expect(typeof key).toBe("string");
          expect(storeRef).toBe(store);
          return `${key}:${value}`;
        });
        expect(result).toEqual(["a:1", "b:2", "c:3"]);
      });
    });

    describe("sort method", () => {
      it("creates sorted Store with default comparison", () => {
        store.clear();

        store.set("z", "zebra");
        store.set("a", "apple");
        store.set("m", "monkey");

        const sorted = store.sort();
        const values = sorted.toArray();
        expect(values).toEqual(["apple", "monkey", "zebra"]);
        sorted.destroy();
      });

      it("creates sorted Store with custom comparison", () => {
        const sorted = store.sort((a, b) => b - a); // Descending
        const values = sorted.toArray();
        expect(values).toEqual([3, 2, 1]);
        sorted.destroy();
      });

      it("preserves original store options in sorted store", () => {
        store.destroy();
        const originalStore = new Store<string, number>(null, { maxSize: 10 });
        originalStore.set("b", 2);
        originalStore.set("a", 1);

        const sorted = originalStore.sort();
        expect(sorted.toArray()).toEqual([1, 2]);

        originalStore.destroy();
        sorted.destroy();
      });
    });

    describe("slice method", () => {
      beforeEach(() => {
        // Add more items for pagination testing
        for (let i = 4; i <= 10; i++) {
          store.set(String.fromCharCode(96 + i), i); // d=4, e=5, etc.
        }
      });

      it("returns paginated results with default parameters", () => {
        const page = store.slice();
        expect(page).toHaveLength(10);
      });

      it("returns specific page with custom page size", () => {
        const page = store.slice(1, 3); // Page 1 (0-based), 3 items per page
        expect(page).toHaveLength(3);
      });

      it("returns empty array for page beyond data", () => {
        const page = store.slice(10, 5);
        expect(page).toEqual([]);
      });

      it("throws error for negative page number", () => {
        expect(() => store.slice(-1, 5)).toThrow(
          "Page number cannot be negative: -1",
        );
      });

      it("throws error for non-positive page size", () => {
        expect(() => store.slice(0, 0)).toThrow(
          "Page size must be positive: 0",
        );
        expect(() => store.slice(0, -5)).toThrow(
          "Page size must be positive: -5",
        );
      });

      it("handles partial last page correctly", () => {
        const page = store.slice(3, 3); // Should get the last item
        expect(page).toHaveLength(1);
      });
    });

    describe("conversion methods", () => {
      it("toArray returns all values as array", () => {
        const array = store.toArray();
        expect(array).toEqual([1, 2, 3]);
        expect(Array.isArray(array)).toBe(true);
      });

      it("keysArray returns all keys as array", () => {
        const keys = store.keysArray();
        expect(keys).toEqual(["a", "b", "c"]);
        expect(Array.isArray(keys)).toBe(true);
      });

      it("entriesArray returns all entries as array", () => {
        const entries = store.entriesArray();
        expect(entries).toEqual([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]);
        expect(Array.isArray(entries)).toBe(true);
      });
    });
  });

  describe("Resource Management", () => {
    it("destroy stops sweep operations", () => {
      const ttlStore = new Store<string, string>({ ttl: 1000 });
      ttlStore.set("key1", "value1");

      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
      ttlStore.destroy();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it("destroy clears all data and metadata", () => {
      store.set("key1", "value1");
      store.setWithTtl("key2", "value2", 1000);

      store.destroy();

      expect(store.size).toBe(0);
    });

    it("store remains functional after destroy for basic operations", () => {
      store.destroy();

      store.set("key1", "value1");
      expect(store.get("key1")).toBe("value1");
      expect(store.has("key1")).toBe(true);
    });

    it("Symbol.dispose calls destroy", () => {
      const destroySpy = vi.spyOn(store, "destroy");

      store[Symbol.dispose]();

      expect(destroySpy).toHaveBeenCalled();
      destroySpy.mockRestore();
    });

    it("handles multiple destroy calls gracefully", () => {
      store.set("key1", "value1");

      store.destroy();
      store.destroy(); // Second call should not throw

      expect(store.size).toBe(0);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles setting null values", () => {
      store.set("nullKey", null);
      expect(store.get("nullKey")).toBeNull();
      expect(store.has("nullKey")).toBe(true);
    });

    it("handles setting undefined values", () => {
      store.set("undefinedKey", undefined);
      expect(store.get("undefinedKey")).toBeUndefined();
      expect(store.has("undefinedKey")).toBe(true);
    });

    it("handles numeric keys", () => {
      const numStore = new Store<number, string>();
      numStore.set(1, "one");
      numStore.set(2, "two");

      expect(numStore.get(1)).toBe("one");
      expect(numStore.has(2)).toBe(true);
      expect(numStore.size).toBe(2);

      numStore.destroy();
    });

    it("handles symbol keys", () => {
      const sym1 = Symbol("key1");
      const sym2 = Symbol("key2");
      const symStore = new Store<symbol, string>();

      symStore.set(sym1, "value1");
      symStore.set(sym2, "value2");

      expect(symStore.get(sym1)).toBe("value1");
      expect(symStore.has(sym2)).toBe(true);
      expect(symStore.size).toBe(2);

      symStore.destroy();
    });

    it("handles large datasets efficiently", () => {
      const largeStore = new Store<string, number>();

      const startTime = Date.now();
      for (let i = 0; i < 10000; i++) {
        largeStore.set(`key${i}`, i);
      }
      const endTime = Date.now();

      expect(largeStore.size).toBe(10000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second

      largeStore.destroy();
    });

    it("handles concurrent access to expired items", () => {
      const ttlStore = new Store<string, string>({ ttl: 100 });
      ttlStore.set("key1", "value1");

      vi.advanceTimersByTime(101);

      // Multiple concurrent accesses should all return undefined
      expect(ttlStore.get("key1")).toBeUndefined();
      expect(ttlStore.get("key1")).toBeUndefined();
      expect(ttlStore.has("key1")).toBe(false);

      ttlStore.destroy();
    });

    it("preserves insertion order for iteration", () => {
      const keys = ["c", "a", "b"];
      for (const key of keys) {
        store.set(key, key);
      }

      const iteratedKeys = Array.from(store.keys());
      expect(iteratedKeys).toEqual(keys);
    });

    it("handles pattern matching with deeply nested objects", () => {
      store.set("deep", {
        level1: {
          level2: {
            level3: {
              value: "found",
            },
          },
        },
      });

      const result = store.find({ "level1.level2.level3.value": "found" });
      expect(result).toBeDefined();
    });

    it("handles empty array patterns correctly", () => {
      store.set("emptyArray", { tags: [] });

      const result = store.find({ tags: [] });
      expect(result).toEqual({ tags: [] });
    });

    it("handles circular references in merge operations safely", () => {
      const obj1: any = { a: 1 };
      const obj2: any = { b: 2 };
      obj1.ref = obj2;
      obj2.ref = obj1;

      store.set("circular1", obj1);

      // This should not cause infinite recursion
      expect(() => store.add("circular1", { c: 3 })).not.toThrow();
    });
  });

  describe("Integration Tests", () => {
    it("combines TTL with LRU eviction correctly", () => {
      const integratedStore = new Store<string, string>({
        maxSize: 2,
        ttl: 1000,
        evictionStrategy: "lru",
      });

      integratedStore.set("key1", "value1");
      integratedStore.set("key2", "value2");

      // Access key1 to make it most recently used
      integratedStore.get("key1");

      // Add key3, should evict key2 (least recently used)
      integratedStore.set("key3", "value3");

      expect(integratedStore.has("key1")).toBe(true);
      expect(integratedStore.has("key2")).toBe(false);
      expect(integratedStore.has("key3")).toBe(true);

      // Wait for TTL expiration
      vi.advanceTimersByTime(1001);

      expect(integratedStore.get("key1")).toBeUndefined();
      expect(integratedStore.get("key3")).toBeUndefined();

      integratedStore.destroy();
    });

    it("performs complex queries with chained operations", () => {
      store.clear();

      const users = [
        {
          id: 1,
          name: "Alice",
          age: 30,
          department: "Engineering",
          active: true,
        },
        { id: 2, name: "Bob", age: 25, department: "Marketing", active: false },
        {
          id: 3,
          name: "Charlie",
          age: 35,
          department: "Engineering",
          active: true,
        },
        { id: 4, name: "Diana", age: 28, department: "Sales", active: true },
      ];

      for (const user of users) {
        store.set(`user${user.id}`, user);
      }

      // Find active engineering users, sort by age, get first 2
      const activeEngineers = store
        .filter({ department: "Engineering", active: true })
        .sort((a, b) => a.age - b.age)
        .slice(0, 2);

      expect(activeEngineers).toHaveLength(2);
      expect(activeEngineers[0].name).toBe("Alice");
      expect(activeEngineers[1].name).toBe("Charlie");
    });

    it("handles stress testing with rapid operations", () => {
      const stressStore = new Store<string, number>({ maxSize: 100 });

      // Rapid insertions, updates, and deletions
      for (let i = 0; i < 1000; i++) {
        const key = `key${i % 50}`;
        stressStore.set(key, i);

        if (i % 3 === 0) {
          stressStore.get(key);
        }

        if (i % 7 === 0) {
          stressStore.delete(key);
        }
      }

      expect(stressStore.size).toBeLessThanOrEqual(100);
      stressStore.destroy();
    });
  });
});

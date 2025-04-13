import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Store } from "../src/index.js";

describe("Store", () => {
  // Basic tests
  describe("basic functionality", () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let store: Store<string, any>;

    beforeEach(() => {
      store = new Store();
    });

    it("should create an empty store", () => {
      expect(store.size).toBe(0);
    });

    it("should add and retrieve values", () => {
      store.set("key1", "value1");
      expect(store.get("key1")).toBe("value1");
      expect(store.size).toBe(1);
    });

    it("should return undefined for non-existent keys", () => {
      expect(store.get("nonexistent")).toBeUndefined();
    });

    it("should overwrite existing values", () => {
      store.set("key1", "value1");
      store.set("key1", "updated");
      expect(store.get("key1")).toBe("updated");
      expect(store.size).toBe(1);
    });

    it("should delete values", () => {
      store.set("key1", "value1");
      expect(store.delete("key1")).toBe(true);
      expect(store.size).toBe(0);
      expect(store.get("key1")).toBeUndefined();
    });

    it("should return false when deleting non-existent keys", () => {
      expect(store.delete("nonexistent")).toBe(false);
    });

    it("should clear all values", () => {
      store.set("key1", "value1");
      store.set("key2", "value2");
      store.clear();
      expect(store.size).toBe(0);
      expect(store.get("key1")).toBeUndefined();
      expect(store.get("key2")).toBeUndefined();
    });

    it("should create a store with initial entries", () => {
      const entries = [
        ["key1", "value1"],
        ["key2", "value2"],
      ] as const;

      const storeWithEntries = new Store(entries);
      expect(storeWithEntries.size).toBe(2);
      expect(storeWithEntries.get("key1")).toBe("value1");
      expect(storeWithEntries.get("key2")).toBe("value2");
    });
  });

  // Options validation tests
  describe("options validation", () => {
    it("should throw error for invalid maxSize", () => {
      expect(() => {
        new Store(null, { maxSize: -1 });
      }).toThrow("maxSize");
    });

    it("should throw error for invalid ttl", () => {
      expect(() => {
        new Store(null, { ttl: -100 });
      }).toThrow("ttl");
    });

    it("should throw error for invalid eviction strategy", () => {
      expect(() => {
        // @ts-ignore - Testing runtime validation
        new Store(null, { evictionStrategy: "invalid" });
      }).toThrow("evictionStrategy");
    });

    it("should throw error for invalid cleanup interval", () => {
      expect(() => {
        new Store(null, { minCleanupInterval: 500 });
      }).toThrow("minCleanupInterval");
    });
  });

  // Add method tests
  describe("add method", () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let store: Store<string, any>;

    beforeEach(() => {
      store = new Store();
    });

    it("should add a new value", () => {
      store.add("key1", "value1");
      expect(store.get("key1")).toBe("value1");
    });

    it("should merge object values", () => {
      store.add("user", { name: "John", age: 30 });
      store.add("user", { email: "john@example.com" });

      expect(store.get("user")).toEqual({
        name: "John",
        age: 30,
        email: "john@example.com",
      });
    });

    it("should replace non-object values", () => {
      store.add("key", "value1");
      store.add("key", "value2");
      expect(store.get("key")).toBe("value2");
    });

    it("should replace object values with non-object values", () => {
      store.add("key", { prop: "value" });
      store.add("key", "simple string");
      expect(store.get("key")).toBe("simple string");
    });

    it("should replace non-object values with object values", () => {
      store.add("key", "simple string");
      store.add("key", { prop: "value" });
      expect(store.get("key")).toEqual({ prop: "value" });
    });

    it("should handle deeply nested merges", () => {
      store.add("user", {
        name: "John",
        address: {
          city: "New York",
          zip: "10001",
        },
      });

      store.add("user", {
        age: 30,
        address: {
          street: "123 Main St",
        },
      });

      expect(store.get("user")).toEqual({
        name: "John",
        age: 30,
        address: {
          city: "New York",
          zip: "10001",
          street: "123 Main St",
        },
      });
    });
  });

  // Remove method tests
  describe("remove method", () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let store: Store<string, any>;

    beforeEach(() => {
      store = new Store();
      store.set("user", {
        name: "John",
        age: 30,
        email: "john@example.com",
        address: {
          street: "123 Main St",
          city: "New York",
          zip: "10001",
        },
      });
    });

    it("should remove a property from an object", () => {
      store.remove("user", "email");
      expect(store.get("user")).toEqual({
        name: "John",
        age: 30,
        address: {
          street: "123 Main St",
          city: "New York",
          zip: "10001",
        },
      });
    });

    it("should remove multiple properties", () => {
      store.remove("user", ["email", "age"]);
      expect(store.get("user")).toEqual({
        name: "John",
        address: {
          street: "123 Main St",
          city: "New York",
          zip: "10001",
        },
      });
    });

    it("should remove nested properties using path notation", () => {
      store.remove("user", "address.street");
      expect(store.get("user")).toEqual({
        name: "John",
        age: 30,
        email: "john@example.com",
        address: {
          city: "New York",
          zip: "10001",
        },
      });
    });

    it("should remove multiple nested properties", () => {
      store.remove("user", ["address.street", "address.zip"]);
      expect(store.get("user")).toEqual({
        name: "John",
        age: 30,
        email: "john@example.com",
        address: {
          city: "New York",
        },
      });
    });

    it("should throw an error when removing properties from non-existent keys", () => {
      expect(() => {
        store.remove("nonexistent", "property");
      }).toThrow("Key not found");
    });

    it("should throw an error when removing properties from non-object values", () => {
      store.set("key", "value");
      expect(() => {
        store.remove("key", "property");
      }).toThrow("Cannot remove properties from non-object value");
    });

    it("should do nothing when removing non-existent properties", () => {
      const original = { ...store.get("user") };
      store.remove("user", "nonexistent");
      expect(store.get("user")).toEqual(original);
    });
  });

  // Find and filter tests
  describe("find and filter methods", () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let store: Store<string, any>;

    beforeEach(() => {
      store = new Store();
      store.set("user1", { name: "John", age: 30, role: "admin" });
      store.set("user2", { name: "Jane", age: 25, role: "user" });
      store.set("user3", { name: "Bob", age: 40, role: "admin" });
      store.set("user4", { name: "Alice", age: 35, role: "user" });
    });

    it("should find a value using a function predicate", () => {
      const user = store.find((value) => value.age > 35);
      expect(user).toEqual({ name: "Bob", age: 40, role: "admin" });
    });

    it("should find a value using a pattern object", () => {
      const user = store.find({ role: "admin" });
      // Could be either John or Bob, both have role = admin
      expect(user?.role).toBe("admin");
    });

    it("should return undefined when no match is found", () => {
      const user = store.find({ role: "manager" });
      expect(user).toBeUndefined();
    });

    it("should filter values using a function predicate", () => {
      const admins = store.filter((value) => value.role === "admin");
      expect(admins.size).toBe(2);
      expect(admins.get("user1")).toEqual({
        name: "John",
        age: 30,
        role: "admin",
      });
      expect(admins.get("user3")).toEqual({
        name: "Bob",
        age: 40,
        role: "admin",
      });
    });

    it("should filter values using a pattern object", () => {
      const users = store.filter({ role: "user" });
      expect(users.size).toBe(2);
      expect(users.get("user2")).toEqual({
        name: "Jane",
        age: 25,
        role: "user",
      });
      expect(users.get("user4")).toEqual({
        name: "Alice",
        age: 35,
        role: "user",
      });
    });

    it("should return an empty store when no matches are found", () => {
      const managers = store.filter({ role: "manager" });
      expect(managers.size).toBe(0);
    });

    it("should match array values correctly", () => {
      store.set("post1", { tags: ["javascript", "typescript"] });
      store.set("post2", { tags: ["react", "javascript"] });

      const jsPosts = store.filter({ tags: "javascript" });
      expect(jsPosts.size).toBe(2);

      const tsPosts = store.filter({ tags: "typescript" });
      expect(tsPosts.size).toBe(1);
      expect(tsPosts.get("post1")).toBeDefined();
    });

    it("should find all values matching a predicate", () => {
      const admins = store.findAll((user) => user.role === "admin");
      expect(admins.length).toBe(2);
      expect(admins).toContainEqual({ name: "John", age: 30, role: "admin" });
      expect(admins).toContainEqual({ name: "Bob", age: 40, role: "admin" });
    });

    it("should find all values matching a pattern", () => {
      const users = store.findAll({ role: "user" });
      expect(users.length).toBe(2);
      expect(users).toContainEqual({ name: "Jane", age: 25, role: "user" });
      expect(users).toContainEqual({ name: "Alice", age: 35, role: "user" });
    });
  });

  // TTL and expiration tests
  describe("TTL and expiration", () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let store: Store<string, any>;

    beforeEach(() => {
      // Mock Date.now to control time
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should set expiration time for items", () => {
      store = new Store();
      store.setWithTtl("key", "value", 1000); // 1 second TTL

      expect(store.get("key")).toBe("value");

      // Advance time by 500ms (not expired yet)
      vi.advanceTimersByTime(500);
      expect(store.get("key")).toBe("value");

      // Advance time by another 600ms (now expired)
      vi.advanceTimersByTime(600);
      expect(store.get("key")).toBeUndefined();
      expect(store.size).toBe(0);
    });

    it("should respect global TTL set in options", () => {
      store = new Store(null, { ttl: 1000 }); // 1 second TTL for all items
      store.set("key", "value");

      expect(store.get("key")).toBe("value");

      // Advance time by 1100ms (now expired)
      vi.advanceTimersByTime(1100);
      expect(store.get("key")).toBeUndefined();
    });

    it("should automatically clean up expired items", () => {
      store = new Store(null, {
        ttl: 1000,
        minCleanupInterval: 1000,
      });

      store.set("key1", "value1");
      store.set("key2", "value2");

      // Advance time by 1100ms (items should expire)
      vi.advanceTimersByTime(1100);

      // Trigger cleanup by checking any key
      store.get("test");

      expect(store.size).toBe(0);
    });

    it("should throw error for negative TTL", () => {
      store = new Store();
      expect(() => {
        store.setWithTtl("key", "value", -1000);
      }).toThrow("TTL cannot be negative");
    });

    it("should check if an item is expired", () => {
      store = new Store();
      store.setWithTtl("key", "value", 1000);

      expect(store.isExpired("key")).toBe(false);

      // Advance time past expiration
      vi.advanceTimersByTime(1100);

      expect(store.isExpired("key")).toBe(true);
    });

    it("should return false for isExpired on non-existent keys", () => {
      store = new Store();
      expect(store.isExpired("nonexistent")).toBe(false);
    });
  });

  // Eviction strategies tests
  describe("eviction strategies", () => {
    it("should evict items using FIFO strategy", () => {
      const store = new Store<string, string>(null, {
        maxSize: 3,
        evictionStrategy: "fifo",
      });

      store.set("key1", "value1");
      store.set("key2", "value2");
      store.set("key3", "value3");

      // This should evict 'key1' (the first one added)
      store.set("key4", "value4");

      expect(store.size).toBe(3);
      expect(store.get("key1")).toBeUndefined();
      expect(store.get("key2")).toBe("value2");
      expect(store.get("key3")).toBe("value3");
      expect(store.get("key4")).toBe("value4");
    });

    it("should evict items using LRU strategy", () => {
      const store = new Store<string, string>(null, {
        maxSize: 3,
        evictionStrategy: "lru",
      });

      store.set("key1", "value1");
      store.set("key2", "value2");
      store.set("key3", "value3");

      // Access key1 to make it recently used
      store.get("key1");

      // This should evict 'key2' (the least recently used)
      store.set("key4", "value4");

      expect(store.size).toBe(3);
      expect(store.get("key1")).toBe("value1");
      expect(store.get("key2")).toBeUndefined();
      expect(store.get("key3")).toBe("value3");
      expect(store.get("key4")).toBe("value4");
    });

    it("should update LRU status when accessing items with find method", () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const store = new Store<string, any>(null, {
        maxSize: 3,
        evictionStrategy: "lru",
      });

      store.set("key1", { value: 1 });
      store.set("key2", { value: 2 });
      store.set("key3", { value: 3 });

      // Access key1 via find to make it recently used
      store.find({ value: 1 });

      // This should evict 'key2' (the least recently used)
      store.set("key4", { value: 4 });

      expect(store.size).toBe(3);
      expect(store.get("key1")).toEqual({ value: 1 });
      expect(store.get("key2")).toBeUndefined();
      expect(store.get("key3")).toEqual({ value: 3 });
      expect(store.get("key4")).toEqual({ value: 4 });
    });
  });

  // Clone values option tests
  describe("cloneValues option", () => {
    it("should not clone values by default", () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const store = new Store<string, any>();
      const obj = { name: "John" };

      store.set("user", obj);
      const retrieved = store.get("user");

      // Modify the retrieved object
      retrieved.name = "Jane";

      // Original object in the store should be modified
      expect(store.get("user").name).toBe("Jane");
    });

    it("should clone values when cloneValues is true", () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const store = new Store<string, any>(null, { cloneValues: true });
      const obj = { name: "John" };

      store.set("user", obj);
      const retrieved = store.get("user");

      // Modify the retrieved object
      retrieved.name = "Jane";

      // Original object in the store should remain unchanged
      expect(store.get("user").name).toBe("John");
    });

    it("should clone values in filter results when cloneValues is true", () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const store = new Store<string, any>(null, { cloneValues: true });

      store.set("user1", { name: "John", role: "admin" });
      store.set("user2", { name: "Jane", role: "admin" });

      const admins = store.filter({ role: "admin" });
      const adminValues = admins.toArray();

      // Modify all retrieved objects
      for (const admin of adminValues) {
        admin.role = "user";
      }

      // Original objects in the store should remain unchanged
      expect(store.get("user1").role).toBe("admin");
      expect(store.get("user2").role).toBe("admin");
    });
  });

  // Utility methods tests
  describe("utility methods", () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let store: Store<string, any>;

    beforeEach(() => {
      store = new Store();
      store.set("user1", { name: "John", age: 30 });
      store.set("user2", { name: "Jane", age: 25 });
      store.set("user3", { name: "Bob", age: 40 });
    });

    it("should map values", () => {
      const names = store.map((user) => user.name);
      expect(names).toEqual(["John", "Jane", "Bob"]);
    });

    it("should sort values", () => {
      const sorted = store.sort((a, b) => a.age - b.age);

      const sortedAges = sorted.map((user) => user.age);
      expect(sortedAges).toEqual([25, 30, 40]);
    });

    it("should slice values for pagination", () => {
      const page = store.slice(0, 2);
      expect(page.length).toBe(2);
    });

    it("should convert to array", () => {
      const array = store.toArray();
      expect(array.length).toBe(3);
      expect(array).toContainEqual({ name: "John", age: 30 });
      expect(array).toContainEqual({ name: "Jane", age: 25 });
      expect(array).toContainEqual({ name: "Bob", age: 40 });
    });

    it("should get all keys as array", () => {
      const keys = store.keysArray();
      expect(keys).toEqual(["user1", "user2", "user3"]);
    });

    it("should get all entries as array", () => {
      const entries = store.entriesArray();
      expect(entries.length).toBe(3);
      expect(entries).toContainEqual(["user1", { name: "John", age: 30 }]);
      expect(entries).toContainEqual(["user2", { name: "Jane", age: 25 }]);
      expect(entries).toContainEqual(["user3", { name: "Bob", age: 40 }]);
    });
  });

  // Resource cleanup tests
  describe("resource cleanup", () => {
    it("should clean up resources on destroy", () => {
      const store = new Store(null, { ttl: 1000 });

      // Spy on clearInterval to check if it's called
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      store.destroy();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});

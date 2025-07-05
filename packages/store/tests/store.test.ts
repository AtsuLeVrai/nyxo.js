import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Store } from "../src/index.js";

interface TestUser {
  id: string;
  name: string;
  email: string;
  profile?: {
    age: number;
    settings: {
      theme: string;
      notifications: boolean;
    };
  };
}

describe("Store Constructor", () => {
  it("should create store with default options", () => {
    const store = new Store<string, number>();
    expect(store.size).toBe(0);
    expect(store instanceof Map).toBe(true);
  });

  it("should create store with custom options", () => {
    const store = new Store<string, number>({
      maxSize: 500,
      ttl: 60000,
      evictionStrategy: "fifo",
    });
    expect(store.size).toBe(0);
  });

  it("should throw error for invalid options", () => {
    expect(() => {
      new Store<string, number>({ maxSize: -1 });
    }).toThrow();
  });

  it("should throw error for invalid ttl", () => {
    expect(() => {
      new Store<string, number>({ ttl: -100 });
    }).toThrow();
  });

  it("should handle empty options object", () => {
    const store = new Store<string, number>({});
    expect(store.size).toBe(0);
  });
});

describe("Store Populate", () => {
  let store: Store<string, TestUser>;

  beforeEach(() => {
    store = new Store<string, TestUser>();
  });

  it("should populate with array of entries", () => {
    const entries: [string, TestUser][] = [
      ["user1", { id: "user1", name: "Alice", email: "alice@test.com" }],
      ["user2", { id: "user2", name: "Bob", email: "bob@test.com" }],
    ];

    store.populate(entries);
    expect(store.size).toBe(2);
    expect(store.get("user1")?.name).toBe("Alice");
    expect(store.get("user2")?.name).toBe("Bob");
  });

  it("should return store instance for chaining", () => {
    const entries: [string, TestUser][] = [
      ["user1", { id: "user1", name: "Alice", email: "alice@test.com" }],
    ];

    const result = store.populate(entries);
    expect(result).toBe(store);
  });

  it("should handle empty array", () => {
    store.populate([]);
    expect(store.size).toBe(0);
  });

  it("should throw error for non-array input", () => {
    expect(() => {
      store.populate("invalid" as unknown as [string, TestUser][]);
    }).toThrow("Entries must be an array of [key, value] tuples");
  });

  it("should throw error for invalid entry format", () => {
    expect(() => {
      store.populate(["invalid"] as unknown as [string, TestUser][]);
    }).toThrow("Invalid entry format");
  });

  it("should throw error for incomplete tuples", () => {
    expect(() => {
      store.populate([["key"]] as unknown as [string, TestUser][]);
    }).toThrow("Invalid entry format");
  });

  it("should respect maxSize during populate", () => {
    const limitedStore = new Store<string, TestUser>({ maxSize: 2 });
    const entries: [string, TestUser][] = [
      ["user1", { id: "user1", name: "Alice", email: "alice@test.com" }],
      ["user2", { id: "user2", name: "Bob", email: "bob@test.com" }],
      ["user3", { id: "user3", name: "Charlie", email: "charlie@test.com" }],
    ];

    limitedStore.populate(entries);
    expect(limitedStore.size).toBe(2);
  });
});

describe("Store Basic Operations", () => {
  let store: Store<string, TestUser>;

  beforeEach(() => {
    store = new Store<string, TestUser>();
  });

  it("should set and get values", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    store.set("user1", user);
    expect(store.get("user1")).toEqual(user);
  });

  it("should return undefined for non-existent keys", () => {
    expect(store.get("nonexistent")).toBeUndefined();
  });

  it("should check key existence with has", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    store.set("user1", user);
    expect(store.has("user1")).toBe(true);
    expect(store.has("nonexistent")).toBe(false);
  });

  it("should delete entries", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    store.set("user1", user);
    expect(store.delete("user1")).toBe(true);
    expect(store.has("user1")).toBe(false);
    expect(store.delete("nonexistent")).toBe(false);
  });

  it("should clear all entries", () => {
    store.set("user1", { id: "user1", name: "Alice", email: "alice@test.com" });
    store.set("user2", { id: "user2", name: "Bob", email: "bob@test.com" });
    store.clear();
    expect(store.size).toBe(0);
  });

  it("should support method chaining", () => {
    const user1: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    const user2: TestUser = { id: "user2", name: "Bob", email: "bob@test.com" };

    const result = store.set("user1", user1).set("user2", user2);
    expect(result).toBe(store);
    expect(store.size).toBe(2);
  });
});

describe("Store Add Method", () => {
  let store: Store<string, TestUser>;

  beforeEach(() => {
    store = new Store<string, TestUser>();
  });

  it("should add new value when key does not exist", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    store.add("user1", user);
    expect(store.get("user1")).toEqual(user);
  });

  it("should perform shallow merge for objects without nested objects", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    store.set("user1", user);

    store.add("user1", { name: "Alice Updated" });
    const result = store.get("user1");
    expect(result?.name).toBe("Alice Updated");
    expect(result?.email).toBe("alice@test.com");
  });

  it("should perform deep merge for objects with nested objects", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
      profile: {
        age: 25,
        settings: {
          theme: "dark",
          notifications: true,
        },
      },
    };
    store.set("user1", user);

    store.add("user1", {
      profile: {
        // @ts-ignore
        settings: {
          theme: "light",
        },
      },
    });

    const result = store.get("user1");
    expect(result?.profile?.settings.theme).toBe("light");
    expect(result?.profile?.settings.notifications).toBe(true);
    expect(result?.profile?.age).toBe(25);
  });

  it("should replace non-object values directly", () => {
    const numberStore = new Store<string, number>();
    numberStore.set("count", 5);
    numberStore.add("count", 10);
    expect(numberStore.get("count")).toBe(10);
  });

  it("should replace when existing value is null", () => {
    const nullStore = new Store<string, TestUser | null>();
    nullStore.set("user1", null);
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    nullStore.add("user1", user);
    expect(nullStore.get("user1")).toEqual(user);
  });
});

describe("Store Remove Method", () => {
  let store: Store<string, TestUser>;

  beforeEach(() => {
    store = new Store<string, TestUser>();
  });

  it("should remove single property from object", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
      profile: {
        age: 25,
        settings: {
          theme: "dark",
          notifications: true,
        },
      },
    };
    store.set("user1", user);

    store.remove("user1", "email");
    const result = store.get("user1");
    expect(result?.email).toBeUndefined();
    expect(result?.name).toBe("Alice");
  });

  it("should remove nested property using dot notation", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
      profile: {
        age: 25,
        settings: {
          theme: "dark",
          notifications: true,
        },
      },
    };
    store.set("user1", user);

    store.remove("user1", "profile.settings.theme");
    const result = store.get("user1");
    expect(result?.profile?.settings.theme).toBeUndefined();
    expect(result?.profile?.settings.notifications).toBe(true);
  });

  it("should remove multiple properties", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
      profile: {
        age: 25,
        settings: {
          theme: "dark",
          notifications: true,
        },
      },
    };
    store.set("user1", user);

    store.remove("user1", ["email", "profile.age"]);
    const result = store.get("user1");
    expect(result?.email).toBeUndefined();
    expect(result?.profile?.age).toBeUndefined();
    expect(result?.name).toBe("Alice");
  });

  it("should throw error for non-existent key", () => {
    expect(() => {
      store.remove("nonexistent", "name");
    }).toThrow("Key not found: nonexistent");
  });

  it("should throw error for non-object value", () => {
    const numberStore = new Store<string, number>();
    numberStore.set("count", 5);
    expect(() => {
      numberStore.remove("count", "property");
    }).toThrow("Cannot remove properties from non-object value");
  });

  it("should not modify original object", () => {
    const originalUser: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    store.set("user1", originalUser);
    store.remove("user1", "email");
    expect(originalUser.email).toBe("alice@test.com");
  });
});

describe("Store Find and Filter", () => {
  let store: Store<string, TestUser>;

  beforeEach(() => {
    store = new Store<string, TestUser>();
    store.populate([
      ["user1", { id: "user1", name: "Alice", email: "alice@test.com" }],
      ["user2", { id: "user2", name: "Bob", email: "bob@test.com" }],
      ["user3", { id: "user3", name: "Charlie", email: "charlie@test.com" }],
    ]);
  });

  it("should find first matching value", () => {
    const result = store.find((user) => user.name === "Bob");
    expect(result?.id).toBe("user2");
  });

  it("should return undefined when no match found", () => {
    const result = store.find((user) => user.name === "David");
    expect(result).toBeUndefined();
  });

  it("should filter matching values", () => {
    const results = store.filter((user) => user.email.includes("test.com"));
    expect(results).toHaveLength(3);
  });

  it("should return empty array when no matches", () => {
    const results = store.filter((user) => user.name === "David");
    expect(results).toHaveLength(0);
  });

  it("should pass key to predicate function", () => {
    const result = store.find((_, key) => key === "user2");
    expect(result?.name).toBe("Bob");
  });
});

describe("Store TTL Functionality", () => {
  let store: Store<string, TestUser>;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new Store<string, TestUser>({ ttl: 1000 });
  });

  afterEach(() => {
    store.destroy();
    vi.useRealTimers();
  });

  it("should set TTL for items", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    store.set("user1", user);
    expect(store.has("user1")).toBe(true);

    vi.advanceTimersByTime(1500);
    expect(store.has("user1")).toBe(false);
  });

  it("should set custom TTL with setWithTtl", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    store.setWithTtl("user1", user, 2000);

    vi.advanceTimersByTime(1500);
    expect(store.has("user1")).toBe(true);

    vi.advanceTimersByTime(1000);
    expect(store.has("user1")).toBe(false);
  });

  it("should throw error for negative TTL", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    expect(() => {
      store.setWithTtl("user1", user, -100);
    }).toThrow("TTL cannot be negative");
  });

  it("should check expiration with isExpired", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    store.set("user1", user);
    expect(store.isExpired("user1")).toBe(false);

    vi.advanceTimersByTime(1500);
    expect(store.isExpired("user1")).toBe(true);
  });

  it("should remove expired items on access", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    store.set("user1", user);

    vi.advanceTimersByTime(1500);
    expect(store.get("user1")).toBeUndefined();
    expect(store.size).toBe(0);
  });

  it("should handle items without TTL", () => {
    const storeNoTtl = new Store<string, TestUser>();
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    storeNoTtl.set("user1", user);
    expect(storeNoTtl.isExpired("user1")).toBe(false);
    storeNoTtl.destroy();
  });
});

describe("Store Eviction FIFO", () => {
  let store: Store<string, TestUser>;

  beforeEach(() => {
    store = new Store<string, TestUser>({
      maxSize: 3,
      evictionStrategy: "fifo",
    });
  });

  it("should evict oldest item when maxSize exceeded", () => {
    const users: TestUser[] = [
      { id: "user1", name: "Alice", email: "alice@test.com" },
      { id: "user2", name: "Bob", email: "bob@test.com" },
      { id: "user3", name: "Charlie", email: "charlie@test.com" },
      { id: "user4", name: "David", email: "david@test.com" },
    ];

    store.set("user1", users[0] as TestUser);
    store.set("user2", users[1] as TestUser);
    store.set("user3", users[2] as TestUser);
    store.set("user4", users[3] as TestUser);

    expect(store.size).toBe(3);
    expect(store.has("user1")).toBe(false);
    expect(store.has("user4")).toBe(true);
  });

  it("should not evict when updating existing key", () => {
    const users: TestUser[] = [
      { id: "user1", name: "Alice", email: "alice@test.com" },
      { id: "user2", name: "Bob", email: "bob@test.com" },
      { id: "user3", name: "Charlie", email: "charlie@test.com" },
    ];

    store.set("user1", users[0] as TestUser);
    store.set("user2", users[1] as TestUser);
    store.set("user3", users[2] as TestUser);
    store.set("user1", { ...users[0], name: "Alice Updated" } as TestUser);

    expect(store.size).toBe(3);
    expect(store.has("user1")).toBe(true);
    expect(store.get("user1")?.name).toBe("Alice Updated");
  });
});

describe("Store Eviction LRU", () => {
  let store: Store<string, TestUser>;

  beforeEach(() => {
    store = new Store<string, TestUser>({
      maxSize: 3,
      evictionStrategy: "lru",
    });
  });

  it("should evict least recently used item", () => {
    const users: TestUser[] = [
      { id: "user1", name: "Alice", email: "alice@test.com" },
      { id: "user2", name: "Bob", email: "bob@test.com" },
      { id: "user3", name: "Charlie", email: "charlie@test.com" },
      { id: "user4", name: "David", email: "david@test.com" },
    ];

    store.set("user1", users[0] as TestUser);
    store.set("user2", users[1] as TestUser);
    store.set("user3", users[2] as TestUser);

    store.get("user1");
    store.set("user4", users[3] as TestUser);

    expect(store.size).toBe(3);
    expect(store.has("user2")).toBe(false);
    expect(store.has("user1")).toBe(true);
  });

  it("should update access time on get", () => {
    const users: TestUser[] = [
      { id: "user1", name: "Alice", email: "alice@test.com" },
      { id: "user2", name: "Bob", email: "bob@test.com" },
      { id: "user3", name: "Charlie", email: "charlie@test.com" },
      { id: "user4", name: "David", email: "david@test.com" },
    ];

    store.set("user1", users[0] as TestUser);
    store.set("user2", users[1] as TestUser);
    store.set("user3", users[2] as TestUser);

    store.get("user1");
    store.set("user4", users[3] as TestUser);

    expect(store.has("user1")).toBe(true);
    expect(store.has("user2")).toBe(false);
  });

  it("should handle unlimited size", () => {
    const unlimitedStore = new Store<string, TestUser>({ maxSize: 0 });
    for (let i = 0; i < 1000; i++) {
      unlimitedStore.set(`user${i}`, {
        id: `user${i}`,
        name: `User ${i}`,
        email: `user${i}@test.com`,
      });
    }
    expect(unlimitedStore.size).toBe(1000);
    unlimitedStore.destroy();
  });
});

describe("Store Sweep Operations", () => {
  let store: Store<string, TestUser>;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new Store<string, TestUser>({
      ttl: 1000,
      sweepInterval: 5000,
      sweepChunkSize: 2,
    });
  });

  afterEach(() => {
    store.destroy();
    vi.useRealTimers();
  });

  it("should perform periodic sweep", () => {
    const users: TestUser[] = [
      { id: "user1", name: "Alice", email: "alice@test.com" },
      { id: "user2", name: "Bob", email: "bob@test.com" },
    ];

    store.set("user1", users[0] as TestUser);
    store.set("user2", users[1] as TestUser);

    vi.advanceTimersByTime(1500);
    expect(store.size).toBe(2);

    vi.advanceTimersByTime(5000);
    expect(store.size).toBe(0);
  });

  it("should handle chunked sweep", () => {
    const users: TestUser[] = [];
    for (let i = 0; i < 10; i++) {
      users.push({
        id: `user${i}`,
        name: `User ${i}`,
        email: `user${i}@test.com`,
      });
      store.set(`user${i}`, users[i] as TestUser);
    }

    vi.advanceTimersByTime(1500);
    vi.advanceTimersByTime(5000);
    expect(store.size).toBe(0);
  });

  it("should trigger passive sweep on get", () => {
    const originalRandom = Math.random;
    Math.random = () => 0.005;

    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    store.set("user1", user);
    store.set("user2", { id: "user2", name: "Bob", email: "bob@test.com" });

    vi.advanceTimersByTime(1500);
    store.get("user3");

    vi.runAllTimers();

    expect(store.size).toBe(0);
    Math.random = originalRandom;
  });
});

describe("Store Memory Management", () => {
  let store: Store<string, TestUser>;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new Store<string, TestUser>({ ttl: 1000 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should destroy store and cleanup resources", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    store.set("user1", user);

    store.destroy();
    expect(store.size).toBe(0);

    store.set("user2", { id: "user2", name: "Bob", email: "bob@test.com" });
    vi.advanceTimersByTime(2000);
    expect(store.size).toBe(1);
  });

  it("should support Symbol.dispose", () => {
    const user: TestUser = {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    };
    store.set("user1", user);

    store[Symbol.dispose]();
    expect(store.size).toBe(0);
  });

  it("should handle destroy multiple times", () => {
    store.destroy();
    store.destroy();
    expect(store.size).toBe(0);
  });

  it("should cleanup LRU tracker on destroy", () => {
    const lruStore = new Store<string, TestUser>({
      maxSize: 5,
      evictionStrategy: "lru",
    });

    lruStore.set("user1", {
      id: "user1",
      name: "Alice",
      email: "alice@test.com",
    });
    lruStore.destroy();
    expect(lruStore.size).toBe(0);
  });
});

describe("Store Edge Cases", () => {
  // @ts-ignore
  let _store: Store<string, TestUser>;

  beforeEach(() => {
    _store = new Store<string, TestUser>();
  });

  it("should handle symbol keys", () => {
    const symbolStore = new Store<symbol, string>();
    const key = Symbol("test");
    symbolStore.set(key, "value");
    expect(symbolStore.get(key)).toBe("value");
    symbolStore.destroy();
  });

  it("should handle number keys", () => {
    const numberStore = new Store<number, string>();
    numberStore.set(42, "answer");
    expect(numberStore.get(42)).toBe("answer");
    numberStore.destroy();
  });

  it("should handle null and undefined values", () => {
    const nullStore = new Store<string, string | null | undefined>();
    nullStore.set("null", null);
    nullStore.set("undefined", undefined);
    expect(nullStore.get("null")).toBeNull();
    expect(nullStore.get("undefined")).toBeUndefined();
    expect(nullStore.has("null")).toBe(true);
    expect(nullStore.has("undefined")).toBe(true);
    nullStore.destroy();
  });

  it("should handle complex nested objects", () => {
    interface ComplexObject {
      data: {
        nested: {
          deep: {
            value: number;
            array: string[];
            map: Record<string, boolean>;
          };
        };
      };
    }

    const complexStore = new Store<string, ComplexObject>();
    const complexObj: ComplexObject = {
      data: {
        nested: {
          deep: {
            value: 42,
            array: ["a", "b", "c"],
            map: { key1: true, key2: false },
          },
        },
      },
    };

    complexStore.set("complex", complexObj);
    expect(complexStore.get("complex")?.data.nested.deep.value).toBe(42);
    complexStore.destroy();
  });

  it("should handle concurrent operations", () => {
    const concurrentStore = new Store<string, number>({ maxSize: 100 });

    for (let i = 0; i < 200; i++) {
      concurrentStore.set(`key${i}`, i);
      if (i % 2 === 0) {
        concurrentStore.get(`key${Math.floor(i / 2)}`);
      }
      if (i % 3 === 0) {
        concurrentStore.delete(`key${Math.floor(i / 3)}`);
      }
    }

    expect(concurrentStore.size).toBeLessThanOrEqual(100);
    concurrentStore.destroy();
  });

  it("should handle large datasets efficiently", () => {
    const largeStore = new Store<string, { index: number; data: string }>({
      maxSize: 10000,
    });

    const startTime = Date.now();
    for (let i = 0; i < 10000; i++) {
      largeStore.set(`item${i}`, {
        index: i,
        data: `data for item ${i}`,
      });
    }
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(1000);
    expect(largeStore.size).toBe(10000);
    largeStore.destroy();
  });
});

describe("Store Integration Tests", () => {
  it("should work end-to-end with all features", () => {
    vi.useFakeTimers();

    const store = new Store<string, TestUser>({
      maxSize: 5,
      ttl: 2000,
      evictionStrategy: "lru",
    });

    const users: [string, TestUser][] = [
      ["user1", { id: "user1", name: "Alice", email: "alice@test.com" }],
      ["user2", { id: "user2", name: "Bob", email: "bob@test.com" }],
      ["user3", { id: "user3", name: "Charlie", email: "charlie@test.com" }],
    ];

    store.populate(users);

    store.add("user1", {
      profile: {
        age: 25,
        settings: { theme: "dark", notifications: true },
      },
    });

    expect(store.get("user1")?.profile?.age).toBe(25);

    store.remove("user2", "email");
    expect(store.get("user2")?.email).toBeUndefined();

    const found = store.find((user) => user.name === "Charlie");
    expect(found?.id).toBe("user3");

    const filtered = store.filter((user) => user.name.startsWith("A"));
    expect(filtered).toHaveLength(1);

    store.setWithTtl(
      "user4",
      {
        id: "user4",
        name: "David",
        email: "david@test.com",
      },
      1000,
    );

    for (let i = 5; i <= 10; i++) {
      store.set(`user${i}`, {
        id: `user${i}`,
        name: `User ${i}`,
        email: `user${i}@test.com`,
      });
    }

    expect(store.size).toBe(5);

    vi.advanceTimersByTime(1500);
    vi.runAllTimers();
    expect(store.has("user4")).toBe(false);

    vi.advanceTimersByTime(1000);
    vi.runAllTimers();
    store.get("user1");
    vi.runAllTimers();

    expect(store.size).toBeLessThanOrEqual(5);

    store.destroy();
    vi.useRealTimers();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Store } from "../src/index.js";

interface TestUser {
  id: number;
  name: string;
  email: string;
  age: number;
  tags: string[];
}

describe("Store", () => {
  let store: Store<string, TestUser>;
  const testUser: TestUser = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    tags: ["user", "admin"],
  };

  beforeEach(() => {
    store = new Store<string, TestUser>();
  });

  describe("constructor", () => {
    it("should create an empty store", () => {
      expect(store.size).toBe(0);
    });

    it("should initialize with entries", () => {
      const storeWithEntries = new Store([["user1", testUser]]);
      expect(storeWithEntries.size).toBe(1);
      expect(storeWithEntries.get("user1")).toEqual(testUser);
    });

    it("should respect maxSize option", () => {
      const smallStore = new Store<string, TestUser>(null, { maxSize: 2 });
      smallStore.set("user1", testUser);
      smallStore.set("user2", { ...testUser, id: 2 });
      smallStore.set("user3", { ...testUser, id: 3 });
      expect(smallStore.size).toBe(2);
      expect(smallStore.has("user1")).toBe(false);
    });
  });

  describe("add", () => {
    it("should add new entries", () => {
      store.add("user1", testUser);
      expect(store.get("user1")).toEqual(testUser);
    });

    it("should merge objects for existing keys", () => {
      store.add("user1", testUser);
      store.add("user1", { age: 31 });
      expect(store.get("user1")).toEqual({ ...testUser, age: 31 });
    });

    it("should handle deep merging", () => {
      interface DeepTest {
        user: {
          profile: {
            settings: {
              theme: string;
            };
          };
        };
      }

      const deepStore = new Store<string, DeepTest>();
      const initial = {
        user: {
          profile: {
            settings: {
              theme: "light",
            },
          },
        },
      };

      deepStore.add("settings", initial);
      deepStore.add("settings", {
        user: {
          profile: {
            settings: {
              theme: "dark",
            },
          },
        },
      });

      expect(deepStore.get("settings")).toEqual({
        user: {
          profile: {
            settings: {
              theme: "dark",
            },
          },
        },
      });
    });
  });

  describe("remove", () => {
    beforeEach(() => {
      store.set("user1", testUser);
    });

    it("should remove specified properties", () => {
      store.remove("user1", "age");
      const user = store.get("user1");
      expect(user?.age).toBeUndefined();
      expect(user?.name).toBe("John Doe");
    });

    it("should handle multiple properties", () => {
      store.remove("user1", ["age", "email"]);
      const user = store.get("user1");
      expect(user?.age).toBeUndefined();
      expect(user?.email).toBeUndefined();
      expect(user?.name).toBe("John Doe");
    });

    it("should ignore non-existent properties", () => {
      store.remove("user1", "nonexistent");
      expect(store.get("user1")).toEqual(testUser);
    });
  });

  describe("find", () => {
    beforeEach(() => {
      store.set("user1", testUser);
      store.set("user2", { ...testUser, id: 2, name: "Jane Doe" });
    });

    it("should find by predicate function", () => {
      const found = store.find((user) => user.name === "Jane Doe");
      expect(found?.id).toBe(2);
    });

    it("should find by pattern", () => {
      const found = store.find({ name: "John Doe" });
      expect(found?.id).toBe(1);
    });

    it("should handle array values in pattern", () => {
      // @ts-expect-error
      const found = store.find({ tags: "admin" });
      expect(found).toBeDefined();
    });
  });

  describe("filter", () => {
    beforeEach(() => {
      store.set("user1", testUser);
      store.set("user2", { ...testUser, id: 2, age: 25 });
      store.set("user3", { ...testUser, id: 3, age: 35 });
    });

    it("should filter by predicate function", () => {
      const filtered = store.filter((user) => user.age > 30);
      expect(filtered.size).toBe(1);
      expect(filtered.values().next().value?.id).toBe(3);
    });

    it("should filter by pattern", () => {
      const filtered = store.filter({ age: 30 });
      expect(filtered.size).toBe(1);
      expect(filtered.values().next().value?.id).toBe(1);
    });
  });

  describe("TTL functionality", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should expire items after TTL", () => {
      store.setWithTtl("user1", testUser, 1000);
      expect(store.has("user1")).toBe(true);

      setTimeout(() => {
        expect(store.has("user1")).toBe(false);
      }, 1100);
    });

    it("should check expiration correctly", () => {
      store.setWithTtl("user1", testUser, 1000);
      expect(store.isExpired("user1")).toBe(false);

      vi.advanceTimersByTime(1100);
      expect(store.isExpired("user1")).toBe(true);
    });
  });

  describe("Pagination", () => {
    beforeEach(() => {
      for (let i = 0; i < 25; i++) {
        store.set(`user${i}`, { ...testUser, id: i });
      }
    });

    it("should slice results correctly", () => {
      const page1 = store.slice(0, 10);
      expect(page1.length).toBe(10);

      const page2 = store.slice(1, 10);
      expect(page2.length).toBe(10);
      expect(page2[0]?.id).toBe(10);
    });
  });

  describe("LRU Eviction", () => {
    it("should evict least recently used items", () => {
      const lruStore = new Store<string, TestUser>(null, {
        maxSize: 2,
        evictionStrategy: "lru",
      });

      lruStore.set("user1", testUser);
      lruStore.set("user2", { ...testUser, id: 2 });
      lruStore.get("user1");
      lruStore.set("user3", { ...testUser, id: 3 });

      expect(lruStore.has("user1")).toBe(true);
      expect(lruStore.has("user2")).toBe(false);
      expect(lruStore.has("user3")).toBe(true);
    });
  });
});

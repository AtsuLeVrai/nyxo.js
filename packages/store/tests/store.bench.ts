import { bench, describe } from "vitest";
import { Store } from "../src/index.js";

interface TestUser {
  id: number;
  name: string;
  email: string;
  age: number;
  tags: string[];
}

describe("Store Benchmarks", () => {
  const store = new Store<string, TestUser>();
  const testUser: TestUser = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    tags: ["user", "admin"],
  };

  bench("set operation", () => {
    store.set("user1", testUser);
  });

  bench("get operation", () => {
    store.get("user1");
  });

  bench("add operation with merge", () => {
    store.add("user1", { age: 31 });
  });

  bench("find by predicate", () => {
    store.find((user) => user.age === 30);
  });

  bench("find by pattern", () => {
    store.find({ name: "John Doe" });
  });

  bench("filter by predicate", () => {
    store.filter((user) => user.age > 25);
  });

  bench("bulk operations", () => {
    const bulkStore = new Store<string, TestUser>();
    for (let i = 0; i < 1000; i++) {
      bulkStore.set(`user${i}`, { ...testUser, id: i });
    }
  });

  bench("LRU eviction", () => {
    const lruStore = new Store<string, TestUser>(null, {
      maxSize: 100,
      evictionStrategy: "lru",
    });
    for (let i = 0; i < 200; i++) {
      lruStore.set(`user${i}`, { ...testUser, id: i });
      if (i % 2 === 0) {
        lruStore.get(`user${i}`);
      }
    }
  });

  bench("TTL operations", () => {
    store.setWithTtl("tempUser", testUser, 1000);
    store.isExpired("tempUser");
  });

  bench("slice operations", () => {
    store.slice(0, 10);
    store.slice(1, 10);
  });
});

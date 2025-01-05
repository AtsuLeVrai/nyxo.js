import { beforeEach, describe, expect, test } from "vitest";
import { Store } from "../src/index.js";

const measurePerformance = async <T>(
  fn: () => T | Promise<T>,
  iterations = 1,
): Promise<number> => {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    await fn();
  }
  const end = performance.now();
  return (end - start) / iterations;
};

describe("Store", () => {
  describe("Basic Operations", () => {
    let store: Store<string, number>;

    beforeEach(() => {
      store = new Store<string, number>();
    });

    test("should set and get values", () => {
      store.set("a", 1);
      expect(store.get("a")).toBe(1);
    });

    test("should delete values", () => {
      store.set("a", 1);
      store.delete("a");
      expect(store.has("a")).toBe(false);
    });

    test("should clear the store", () => {
      store.set("a", 1);
      store.set("b", 2);
      store.clear();
      expect(store.size).toBe(0);
    });
  });

  describe("Search and Filtering", () => {
    interface TestItem {
      id: number;
      name: string;
    }

    let store: Store<string, TestItem>;

    beforeEach(() => {
      store = new Store<string, TestItem>();
      store.set("a", { id: 1, name: "Alice" });
      store.set("b", { id: 2, name: "Bob" });
      store.set("c", { id: 3, name: "Charlie" });
    });

    test("should find items by predicate", () => {
      const result = store.find((item) => item.name === "Bob");
      expect(result).toEqual({ id: 2, name: "Bob" });
    });

    test("should find multiple items", () => {
      const result = store.find((item) => item.id > 1, {
        multiple: true,
      }) as TestItem[];
      expect(result).toHaveLength(2);
    });

    test("should filter items", () => {
      const filtered = store.filter((item) => item.id > 1);
      expect(filtered.size).toBe(2);
    });
  });

  describe("Transformation and Aggregation", () => {
    let store: Store<string, number>;

    beforeEach(() => {
      store = new Store<string, number>();
      store.set("a", 1);
      store.set("b", 2);
      store.set("c", 3);
    });

    test("should transform values", () => {
      const transformed = store.transform({
        values: (x): number => x * 2,
        keys: (k): string => k.toUpperCase(),
      });
      expect(transformed.get("A")).toBe(2);
      expect(transformed.get("B")).toBe(4);
      expect(transformed.get("C")).toBe(6);
    });

    test("should aggregate values correctly", () => {
      const result = store.aggregate<{ sum: number; avg: number }>({
        groupBy: (value): "low" | "high" => (value <= 2 ? "low" : "high"),
        operations: {
          sum: (group): number => group.reduce((acc, val) => acc + val, 0),
          avg: (group): number =>
            group.reduce((acc, val) => acc + val, 0) / group.length,
        },
      });

      expect(result.get("low")?.sum).toBe(3);
      expect(result.get("high")?.sum).toBe(3);
    });
  });

  describe("Stress Tests", () => {
    test("should handle frequent updates", async () => {
      const store = new Store<number, number>();
      const executionTime = await measurePerformance(() => {
        for (let i = 0; i < 10000; i++) {
          store.set(i % 100, i);
        }
      });
      expect(executionTime).toBeLessThan(1000);
    });

    test("should handle mixed operations", async () => {
      const store = new Store<number, number>();
      const executionTime = await measurePerformance(() => {
        for (let i = 0; i < 1000; i++) {
          store.set(i, i);
          if (i % 2 === 0) {
            store.delete(i - 1);
          }
          if (i % 3 === 0) {
            store.get(i - 2);
          }
          if (i % 10 === 0) {
            store.filter((x) => x > i - 10);
          }
        }
      });
      expect(executionTime).toBeLessThan(500);
    });
  });

  describe("Conversion", () => {
    interface TestItem {
      id: number;
      name: string;
    }

    let store: Store<string, TestItem>;

    beforeEach(() => {
      store = new Store<string, TestItem>();
      store.set("a", { id: 1, name: "Alice" });
      store.set("b", { id: 2, name: "Bob" });
    });

    test("should convert to array", () => {
      const arr = store.to("array");
      expect(Array.isArray(arr)).toBe(true);
      expect(arr).toHaveLength(2);
    });

    test("should convert to object", () => {
      const obj = store.to("object");
      expect(obj.a).toEqual({ id: 1, name: "Alice" });
      expect(obj.b).toEqual({ id: 2, name: "Bob" });
    });

    test("should convert to set with specific property", () => {
      const set = store.to("set", { property: "id" });
      expect(set.has(1 as unknown as TestItem)).toBe(true);
      expect(set.has(2 as unknown as TestItem)).toBe(true);
    });
  });

  describe("Asynchronous Operations", () => {
    test("should process asynchronous operations in parallel", async () => {
      const store = new Store<number, number>();
      for (let i = 0; i < 100; i++) {
        store.set(i, i);
      }

      const result = await store.mapAsync(
        async (x) => {
          await new Promise((resolve) => setTimeout(resolve, 1));
          return x * 2;
        },
        { concurrency: 10 },
      );

      expect(result.size).toBe(100);
      expect(result.get(1)).toBe(2);
      expect(result.get(99)).toBe(198);
    });

    test("should handle errors in asynchronous operations", async () => {
      const store = new Store<number, number>();
      store.set(1, 1);
      store.set(2, 2);

      await expect(
        store.filterAsync(async (x) => {
          if (x === 2) {
            throw new Error("Test error");
          }
          return true;
        }),
      ).rejects.toThrow("Test error");
    });
  });

  describe("Persistence", () => {
    test("should persist and restore data correctly", async () => {
      const store = new Store<string, number>();
      store.set("a", 1);
      store.set("b", 2);

      let persistedData: { entries: [string, number][]; timestamp: number } = {
        entries: [],
        timestamp: 0,
      };

      await store.persistAsync((data) => {
        persistedData = data;
        return Promise.resolve();
      });

      expect(persistedData.entries).toEqual([
        ["a", 1],
        ["b", 2],
      ]);
      expect(typeof persistedData.timestamp).toBe("number");

      const newStore = new Store<string, number>();
      await newStore.loadAsync(() => Promise.resolve(persistedData.entries));

      expect(newStore.get("a")).toBe(1);
      expect(newStore.get("b")).toBe(2);
      expect(newStore.size).toBe(2);
    });

    test("should handle different merge strategies", async () => {
      // Initial store with data
      const store = new Store<string, number>();
      store.set("a", 1);
      store.set("b", 2);

      // Test 'replace' strategy
      await store.loadAsync(
        () =>
          Promise.resolve([
            ["a", 3],
            ["c", 4],
          ]),
        { merge: "replace" },
      );

      expect(store.get("a")).toBe(3);
      expect(store.get("b")).toBe(2); // Untouched
      expect(store.get("c")).toBe(4); // Added

      // Test 'skip' strategy
      await store.loadAsync(
        () =>
          Promise.resolve([
            ["a", 5],
            ["d", 6],
          ]),
        { merge: "skip" },
      );

      expect(store.get("a")).toBe(3); // Not modified because it already exists
      expect(store.get("d")).toBe(6); // Added because it didn't exist

      // Test default strategy ('replace')
      await store.loadAsync(() => Promise.resolve([["b", 7]]));
      expect(store.get("b")).toBe(7);
    });

    test("should handle persistence errors", async () => {
      const store = new Store<string, number>();
      store.set("a", 1);

      await expect(
        store.persistAsync(() =>
          Promise.reject(new Error("Persistence error")),
        ),
      ).rejects.toThrow("Persistence error");
    });

    test("should handle complex data persistence", async () => {
      interface ComplexData {
        id: number;
        name: string;
        metadata: Record<string, unknown>;
      }

      const store = new Store<string, ComplexData>();
      const testData: ComplexData = {
        id: 1,
        name: "test",
        metadata: { key: "value" },
      };

      store.set("test", testData);

      let persistedData: { entries: [string, ComplexData][] };
      await store.persistAsync((data) => {
        persistedData = data;
        return Promise.resolve();
      });

      const newStore = new Store<string, ComplexData>();
      await newStore.loadAsync(() => Promise.resolve(persistedData.entries));

      expect(newStore.get("test")).toEqual(testData);
    });
  });
});

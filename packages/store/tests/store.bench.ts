import { bench, describe } from "vitest";
import { Store } from "../src/index.js";

const generateTestData = (size: number) => {
  const data: [string, any][] = [];
  for (let i = 0; i < size; i++) {
    data.push([`key${i}`, { id: i, name: `item${i}`, data: Math.random() }]);
  }
  return data;
};

const generateLargeObject = () => ({
  id: Math.random(),
  name: "test".repeat(100),
  data: new Array(1000).fill(0).map(() => Math.random()),
  nested: {
    deep: {
      values: new Array(100).fill("data"),
    },
  },
});

describe("Store Basic Operations", () => {
  const store = new Store<string, any>();
  const testData = generateTestData(1000);

  for (const [key, value] of testData) {
    store.set(key, value);
  }

  bench("get operation", () => {
    store.get("key500");
  });

  bench("set operation", () => {
    store.set("newKey", { data: "test" });
  });

  bench("has operation", () => {
    store.has("key500");
  });

  bench("delete operation", () => {
    store.delete("key999");
    store.set("key999", testData[999]?.[1]);
  });

  bench("add operation (merge)", () => {
    store.add("key500", { extraData: "merged" });
  });
});

describe("Store Bulk Operations", () => {
  bench("bulk insert 100 items", () => {
    const store = new Store<string, any>();
    const data = generateTestData(100);

    for (const [key, value] of data) {
      store.set(key, value);
    }

    store.destroy();
  });

  bench("bulk insert 1000 items", () => {
    const store = new Store<string, any>();
    const data = generateTestData(1000);

    for (const [key, value] of data) {
      store.set(key, value);
    }

    store.destroy();
  });

  bench("bulk insert 10000 items", () => {
    const store = new Store<string, any>();
    const data = generateTestData(10000);

    for (const [key, value] of data) {
      store.set(key, value);
    }

    store.destroy();
  });

  bench("constructor with initial data 1000 items", () => {
    const data = generateTestData(1000);
    const store = new Store(data);
    store.destroy();
  });

  bench("constructor with Record object 1000 items", () => {
    const data = generateTestData(1000);
    const record = Object.fromEntries(data);
    const store = new Store(record);
    store.destroy();
  });
});

describe("Store Search Operations", () => {
  const store = new Store<string, any>();
  const testData = generateTestData(5000);

  for (const [key, value] of testData) {
    store.set(key, value);
  }

  bench("find with function predicate", () => {
    store.find((value) => value.id === 2500);
  });

  bench("find with object pattern", () => {
    store.find({ id: 2500 });
  });

  bench("findAll with function predicate", () => {
    store.findAll((value) => value.id > 4000);
  });

  bench("findAll with object pattern", () => {
    store.findAll({ name: "item4000" });
  });

  bench("filter with function predicate", () => {
    const filtered = store.filter((value) => value.id % 10 === 0);
    filtered.destroy();
  });

  bench("filter with object pattern", () => {
    const filtered = store.filter({ data: testData[0]?.[1].data });
    filtered.destroy();
  });
});

describe("Store Data Manipulation", () => {
  const store = new Store<string, any>();
  const testData = generateTestData(1000);

  for (const [key, value] of testData) {
    store.set(key, value);
  }

  bench("sort operation", () => {
    const sorted = store.sort((a, b) => a.id - b.id);
    sorted.destroy();
  });

  bench("sort with default comparator", () => {
    const sorted = store.sort();
    sorted.destroy();
  });

  bench("map operation", () => {
    store.map((value) => ({ ...value, mapped: true }));
  });

  bench("toArray conversion", () => {
    store.toArray();
  });

  bench("entriesArray conversion", () => {
    store.entriesArray();
  });

  bench("keysArray conversion", () => {
    store.keysArray();
  });

  bench("slice operation", () => {
    store.slice(0, 100);
  });
});

describe("Store Convenience Methods", () => {
  const store = new Store<string, any>();
  const testData = generateTestData(1000);

  for (const [key, value] of testData) {
    store.set(key, value);
  }

  bench("first() single value", () => {
    store.first();
  });

  bench("first(10) multiple values", () => {
    store.first(10);
  });

  bench("last() single value", () => {
    store.last();
  });

  bench("last(10) multiple values", () => {
    store.last(10);
  });

  bench("random() single value", () => {
    store.random();
  });

  bench("random(10) multiple values", () => {
    store.random(10);
  });

  bench("at() positive index", () => {
    store.at(500);
  });

  bench("at() negative index", () => {
    store.at(-500);
  });

  bench("reverse operation", () => {
    const reversed = store.reverse();
    reversed.destroy();
  });
});

describe("Store Aggregation Methods", () => {
  const store = new Store<string, any>();
  const testData = generateTestData(1000);

  for (const [key, value] of testData) {
    store.set(key, value);
  }

  bench("reduce operation", () => {
    store.reduce((acc, value) => acc + value.id, 0);
  });

  bench("some with function predicate", () => {
    store.some((value) => value.id > 500);
  });

  bench("some with object pattern", () => {
    store.some({ id: 500 });
  });

  bench("every with function predicate", () => {
    store.every((value) => value.id >= 0);
  });

  bench("every with object pattern", () => {
    store.every({ name: "item500" });
  });
});

describe("Store Set Operations", () => {
  const store1 = new Store<string, any>();
  const store2 = new Store<string, any>();
  const testData1 = generateTestData(500);
  const testData2 = generateTestData(500);

  for (const [key, value] of testData1) {
    store1.set(key, value);
  }

  for (let i = 250; i < 750; i++) {
    store2.set(`key${i}`, testData2[i - 250]?.[1]);
  }

  bench("partition with function predicate", () => {
    const [matching, nonMatching] = store1.partition(
      (value) => value.id % 2 === 0,
    );
    matching.destroy();
    nonMatching.destroy();
  });

  bench("partition with object pattern", () => {
    const [matching, nonMatching] = store1.partition({ id: 100 });
    matching.destroy();
    nonMatching.destroy();
  });

  bench("concat operation", () => {
    const result = store1.concat(store2);
    result.destroy();
  });

  bench("difference operation", () => {
    const result = store1.difference(store2);
    result.destroy();
  });

  bench("intersect operation", () => {
    const result = store1.intersect(store2);
    result.destroy();
  });

  bench("union operation", () => {
    const result = store1.union(store2);
    result.destroy();
  });

  bench("symmetricDifference operation", () => {
    const result = store1.symmetricDifference(store2);
    result.destroy();
  });

  store1.destroy();
  store2.destroy();
});

describe("Store Cloning and Comparison", () => {
  const store = new Store<string, any>();
  const testData = generateTestData(1000);

  for (const [key, value] of testData) {
    store.set(key, value);
  }

  const clonedStore = store.clone();

  bench("clone deep", () => {
    const cloned = store.clone(true);
    cloned.destroy();
  });

  bench("clone shallow", () => {
    const cloned = store.clone(false);
    cloned.destroy();
  });

  bench("equals shallow comparison", () => {
    store.equals(clonedStore, false);
  });

  bench("equals deep comparison", () => {
    store.equals(clonedStore, true);
  });

  bench("tap operation", () => {
    store.tap((s) => s.size);
  });

  clonedStore.destroy();
});

describe("Store Serialization", () => {
  const store = new Store<string, any>();
  const testData = generateTestData(1000);

  for (const [key, value] of testData) {
    store.set(key, value);
  }

  bench("toJSON conversion", () => {
    store.toJson();
  });

  bench("toJSON with complex objects", () => {
    const complexStore = new Store<string, any>();
    for (let i = 0; i < 100; i++) {
      complexStore.set(`key${i}`, generateLargeObject());
    }
    complexStore.toJson();
    complexStore.destroy();
  });
});

describe("Store Memory Management", () => {
  bench("large object storage and retrieval", () => {
    const store = new Store<string, any>();
    const largeObj = generateLargeObject();
    store.set("large", largeObj);
    store.get("large");
    store.destroy();
  });

  bench("deep merge operation", () => {
    const store = new Store<string, any>();
    const baseObj = generateLargeObject();
    store.set("merge", baseObj);
    store.add("merge", {
      nested: {
        deep: {
          additional: "data",
        },
      },
    });
    store.destroy();
  });

  bench("property removal", () => {
    const store = new Store<string, any>();
    const obj = generateLargeObject();
    store.set("remove", obj);
    store.remove("remove", ["nested.deep.values"]);
    store.destroy();
  });

  bench("destroy operation", () => {
    const store = new Store<string, any>();
    const data = generateTestData(100);
    for (const [key, value] of data) {
      store.set(key, value);
    }
    store.destroy();
  });
});

describe("Store TTL Operations", () => {
  bench("setWithTtl operation", () => {
    const store = new Store<string, any>({ ttl: 1000 });
    store.setWithTtl("ttl-key", { data: "test" }, 500);
    store.destroy();
  });

  bench("TTL expiration check", () => {
    const store = new Store<string, any>();
    store.setWithTtl("expire", { data: "test" }, 1);
    setTimeout(() => {
      store.isExpired("expire");
      store.destroy();
    }, 2);
  });

  bench("sweep operation on 1000 expired items", () => {
    const store = new Store<string, any>({ ttl: 1, sweepInterval: 100 });
    for (let i = 0; i < 1000; i++) {
      store.setWithTtl(`expire${i}`, { data: i }, 1);
    }
    setTimeout(() => {
      store.has("expire0");
      store.destroy();
    }, 10);
  });
});

describe("Store Eviction Strategies", () => {
  bench("LRU eviction strategy", () => {
    const store = new Store<string, any>({
      maxSize: 100,
      evictionStrategy: "lru",
    });

    for (let i = 0; i < 150; i++) {
      store.set(`key${i}`, { data: i });
      if (i % 10 === 0) {
        store.get(`key${Math.floor(i / 2)}`);
      }
    }
    store.destroy();
  });

  bench("FIFO eviction strategy", () => {
    const store = new Store<string, any>({
      maxSize: 100,
      evictionStrategy: "fifo",
    });

    for (let i = 0; i < 150; i++) {
      store.set(`key${i}`, { data: i });
    }
    store.destroy();
  });

  bench("eviction with access pattern", () => {
    const store = new Store<string, any>({
      maxSize: 50,
      evictionStrategy: "lru",
    });

    for (let i = 0; i < 100; i++) {
      store.set(`key${i}`, { data: i });
      for (let j = 0; j < 5; j++) {
        store.get(`key${Math.floor(Math.random() * (i + 1))}`);
      }
    }
    store.destroy();
  });
});

describe("Store Configuration Performance", () => {
  bench("default configuration", () => {
    const store = new Store<string, any>();
    const data = generateTestData(100);

    for (const [key, value] of data) {
      store.set(key, value);
    }

    for (const [key] of data) {
      store.get(key);
    }

    store.destroy();
  });

  bench("no TTL, no max size", () => {
    const store = new Store<string, any>({ ttl: 0, maxSize: 0 });
    const data = generateTestData(100);

    for (const [key, value] of data) {
      store.set(key, value);
    }

    for (const [key] of data) {
      store.get(key);
    }

    store.destroy();
  });

  bench("with TTL enabled", () => {
    const store = new Store<string, any>({ ttl: 10000 });
    const data = generateTestData(100);

    for (const [key, value] of data) {
      store.set(key, value);
    }

    for (const [key] of data) {
      store.get(key);
    }

    store.destroy();
  });

  bench("with max size limit", () => {
    const store = new Store<string, any>({ maxSize: 50 });
    const data = generateTestData(100);

    for (const [key, value] of data) {
      store.set(key, value);
    }

    for (const [key] of data) {
      store.get(key);
    }

    store.destroy();
  });

  bench("full featured configuration", () => {
    const store = new Store<string, any>({
      maxSize: 100,
      ttl: 5000,
      evictionStrategy: "lru",
      sweepInterval: 1000,
    });
    const data = generateTestData(150);

    for (const [key, value] of data) {
      store.set(key, value);
    }

    for (const [key] of data) {
      store.get(key);
    }

    store.destroy();
  });
});

describe("Store vs Native Map Comparison", () => {
  const testData = generateTestData(1000);

  bench("Native Map - set/get operations", () => {
    const map = new Map<string, any>();

    for (const [key, value] of testData) {
      map.set(key, value);
    }

    for (const [key] of testData) {
      map.get(key);
    }
  });

  bench("Store - set/get operations", () => {
    const store = new Store<string, any>({ maxSize: 0, ttl: 0 });

    for (const [key, value] of testData) {
      store.set(key, value);
    }

    for (const [key] of testData) {
      store.get(key);
    }

    store.destroy();
  });

  bench("Native Map - has operations", () => {
    const map = new Map<string, any>();

    for (const [key, value] of testData) {
      map.set(key, value);
    }

    for (const [key] of testData) {
      map.has(key);
    }
  });

  bench("Store - has operations", () => {
    const store = new Store<string, any>({ maxSize: 0, ttl: 0 });

    for (const [key, value] of testData) {
      store.set(key, value);
    }

    for (const [key] of testData) {
      store.has(key);
    }

    store.destroy();
  });

  bench("Native Array - first/last operations", () => {
    const values = testData.map(([, value]) => value);
    values[0];
    values[values.length - 1];
    values.slice(0, 10);
    values.slice(-10);
  });

  bench("Store - first/last operations", () => {
    const store = new Store<string, any>({ maxSize: 0, ttl: 0 });

    for (const [key, value] of testData) {
      store.set(key, value);
    }

    store.first();
    store.last();
    store.first(10);
    store.last(10);

    store.destroy();
  });
});

describe("Store Concurrency Simulation", () => {
  bench("mixed operations pattern", () => {
    const store = new Store<string, any>({
      maxSize: 500,
      evictionStrategy: "lru",
    });

    for (let i = 0; i < 1000; i++) {
      const operation = i % 4;
      const key = `key${i % 300}`;

      switch (operation) {
        case 0:
          store.set(key, { data: i, timestamp: Date.now() });
          break;
        case 1:
          store.get(key);
          break;
        case 2:
          store.has(key);
          break;
        case 3:
          if (i % 10 === 0) {
            store.delete(key);
          }
          break;
        default:
          store.add(key, { extraData: `extra${i}` });
      }
    }
    store.destroy();
  });

  bench("read-heavy workload", () => {
    const store = new Store<string, any>();
    const data = generateTestData(100);

    for (const [key, value] of data) {
      store.set(key, value);
    }

    for (let i = 0; i < 1000; i++) {
      const key = `key${Math.floor(Math.random() * 100)}`;
      store.get(key);
    }
    store.destroy();
  });

  bench("write-heavy workload", () => {
    const store = new Store<string, any>({ maxSize: 200 });

    for (let i = 0; i < 1000; i++) {
      store.set(`key${i}`, {
        data: i,
        payload: new Array(10).fill(Math.random()),
      });
    }
    store.destroy();
  });

  bench("convenience methods workload", () => {
    const store = new Store<string, any>();
    const data = generateTestData(100);

    for (const [key, value] of data) {
      store.set(key, value);
    }

    for (let i = 0; i < 100; i++) {
      store.first();
      store.last();
      store.random();
      store.at(Math.floor(Math.random() * 100));
    }
    store.destroy();
  });
});

describe("Store Memory Footprint", () => {
  bench("small objects (100 items)", () => {
    const store = new Store<string, any>();
    for (let i = 0; i < 100; i++) {
      store.set(`key${i}`, { id: i });
    }
    store.destroy();
  });

  bench("medium objects (100 items)", () => {
    const store = new Store<string, any>();
    for (let i = 0; i < 100; i++) {
      store.set(`key${i}`, {
        id: i,
        data: new Array(100).fill(i),
        meta: { created: Date.now() },
      });
    }
    store.destroy();
  });

  bench("large objects (100 items)", () => {
    const store = new Store<string, any>();
    for (let i = 0; i < 100; i++) {
      store.set(`key${i}`, generateLargeObject());
    }
    store.destroy();
  });

  bench("clone operations memory impact", () => {
    const store = new Store<string, any>();
    for (let i = 0; i < 100; i++) {
      store.set(`key${i}`, generateLargeObject());
    }

    const cloned = store.clone();
    cloned.destroy();
    store.destroy();
  });
});

describe("Store Edge Cases Performance", () => {
  bench("frequent clear operations", () => {
    const store = new Store<string, any>();
    for (let cycle = 0; cycle < 10; cycle++) {
      const data = generateTestData(100);

      for (const [key, value] of data) {
        store.set(key, value);
      }

      store.clear();
    }
    store.destroy();
  });

  bench("symbol keys performance", () => {
    const store = new Store<symbol, any>();
    const symbols = Array.from({ length: 100 }, () => Symbol());

    for (const [i, sym] of symbols.entries()) {
      store.set(sym, { id: i, data: `item${i}` });
    }

    for (const sym of symbols) {
      store.get(sym);
    }

    store.destroy();
  });

  bench("numeric keys performance", () => {
    const store = new Store<number, any>();

    for (let i = 0; i < 1000; i++) {
      store.set(i, { data: `item${i}` });
    }

    for (let i = 0; i < 1000; i++) {
      store.get(Math.floor(Math.random() * 1000));
    }
    store.destroy();
  });

  bench("negative index operations", () => {
    const store = new Store<string, any>();
    const data = generateTestData(1000);

    for (const [key, value] of data) {
      store.set(key, value);
    }

    for (let i = 0; i < 100; i++) {
      store.at(-Math.floor(Math.random() * 1000) - 1);
    }
    store.destroy();
  });

  bench("chained operations performance", () => {
    const store1 = new Store<string, any>();
    const store2 = new Store<string, any>();
    const data = generateTestData(100);

    for (const [key, value] of data) {
      store1.set(key, value);
      store2.set(key, { ...value, modified: true });
    }

    const result = store1
      .filter((value) => value.id % 2 === 0)
      .sort((a, b) => a.id - b.id)
      .concat(store2)
      .reverse();

    result.destroy();
    store1.destroy();
    store2.destroy();
  });
});

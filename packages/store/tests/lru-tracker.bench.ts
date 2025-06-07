import { bench, describe } from "vitest";
import { LruTracker } from "../src/index.js";

const generateKeys = (count: number, prefix = "key"): string[] => {
  const keys: string[] = [];
  for (let i = 0; i < count; i++) {
    keys.push(`${prefix}${i}`);
  }
  return keys;
};

const generateSymbolKeys = (count: number): symbol[] => {
  const keys: symbol[] = [];
  for (let i = 0; i < count; i++) {
    keys.push(Symbol(`key${i}`));
  }
  return keys;
};

const generateNumericKeys = (count: number): number[] => {
  const keys: number[] = [];
  for (let i = 0; i < count; i++) {
    keys.push(i);
  }
  return keys;
};

describe("LruTracker Basic Operations", () => {
  const tracker = new LruTracker<string>(1000);
  const testKeys = generateKeys(500);

  for (const key of testKeys) {
    tracker.touch(key);
  }

  bench("touch existing key", () => {
    tracker.touch("key250");
  });

  bench("touch new key", () => {
    tracker.touch(`new${Math.random()}`);
  });

  bench("has operation", () => {
    tracker.has("key250");
  });

  bench("getLru operation", () => {
    tracker.getLru();
  });

  bench("getMru operation", () => {
    tracker.getMru();
  });

  bench("delete operation", () => {
    const key = `temp${Math.random()}`;
    tracker.touch(key);
    tracker.delete(key);
  });
});

describe("LruTracker Capacity Management", () => {
  bench("small capacity (10 items)", () => {
    const tracker = new LruTracker<string>(10);
    for (let i = 0; i < 20; i++) {
      tracker.touch(`key${i}`);
    }
  });

  bench("medium capacity (100 items)", () => {
    const tracker = new LruTracker<string>(100);
    for (let i = 0; i < 200; i++) {
      tracker.touch(`key${i}`);
    }
  });

  bench("large capacity (1000 items)", () => {
    const tracker = new LruTracker<string>(1000);
    for (let i = 0; i < 2000; i++) {
      tracker.touch(`key${i}`);
    }
  });

  bench("extra large capacity (10000 items)", () => {
    const tracker = new LruTracker<string>(10000);
    for (let i = 0; i < 20000; i++) {
      tracker.touch(`key${i}`);
    }
  });
});

describe("LruTracker Eviction Patterns", () => {
  bench("sequential access pattern", () => {
    const tracker = new LruTracker<string>(100);
    for (let i = 0; i < 200; i++) {
      tracker.touch(`key${i}`);
    }
  });

  bench("random access pattern", () => {
    const tracker = new LruTracker<string>(100);
    const keys = generateKeys(200);
    for (const key of keys) {
      tracker.touch(key);
    }
    for (let i = 0; i < 100; i++) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)] as string;
      tracker.touch(randomKey);
    }
  });

  bench("hot key access pattern", () => {
    const tracker = new LruTracker<string>(100);
    const hotKeys = generateKeys(10, "hot");
    const coldKeys = generateKeys(200, "cold");

    for (const key of coldKeys) {
      tracker.touch(key);
      for (const hotKey of hotKeys) {
        tracker.touch(hotKey);
      }
    }
  });

  bench("cyclic access pattern", () => {
    const tracker = new LruTracker<string>(50);
    const keys = generateKeys(100);

    for (let cycle = 0; cycle < 5; cycle++) {
      for (const key of keys) {
        tracker.touch(key);
      }
    }
  });
});

describe("LruTracker Bulk Operations", () => {
  bench("bulk touch 100 items", () => {
    const tracker = new LruTracker<string>(150);
    const keys = generateKeys(100);
    for (const key of keys) {
      tracker.touch(key);
    }
  });

  bench("bulk touch 1000 items", () => {
    const tracker = new LruTracker<string>(1500);
    const keys = generateKeys(1000);
    for (const key of keys) {
      tracker.touch(key);
    }
  });

  bench("bulk touch 10000 items", () => {
    const tracker = new LruTracker<string>(15000);
    const keys = generateKeys(10000);
    for (const key of keys) {
      tracker.touch(key);
    }
  });

  bench("bulk delete operations", () => {
    const tracker = new LruTracker<string>(1000);
    const keys = generateKeys(500);

    for (const key of keys) {
      tracker.touch(key);
    }

    for (let i = 0; i < 100; i++) {
      tracker.delete(`key${i}`);
    }
  });
});

describe("LruTracker Data Retrieval", () => {
  const tracker = new LruTracker<string>(1000);
  const keys = generateKeys(800);

  for (const key of keys) {
    tracker.touch(key);
  }

  bench("keys() method", () => {
    tracker.keys();
  });

  bench("keysReverse() method", () => {
    tracker.keysReverse();
  });

  bench("entries() method", () => {
    tracker.entries();
  });

  bench("size property access", () => {
    tracker.size;
  });

  bench("capacity property access", () => {
    tracker.capacity;
  });
});

describe("LruTracker Memory Management", () => {
  bench("clear operation small tracker", () => {
    const tracker = new LruTracker<string>(100);
    const keys = generateKeys(100);
    for (const key of keys) {
      tracker.touch(key);
    }
    tracker.clear();
  });

  bench("clear operation large tracker", () => {
    const tracker = new LruTracker<string>(5000);
    const keys = generateKeys(5000);
    for (const key of keys) {
      tracker.touch(key);
    }
    tracker.clear();
  });

  bench("repeated clear and refill", () => {
    const tracker = new LruTracker<string>(100);
    const keys = generateKeys(100);

    for (let cycle = 0; cycle < 10; cycle++) {
      for (const key of keys) {
        tracker.touch(key);
      }
      tracker.clear();
    }
  });

  bench("eviction heavy workload", () => {
    const tracker = new LruTracker<string>(50);
    for (let i = 0; i < 500; i++) {
      tracker.touch(`key${i}`);
    }
  });
});

describe("LruTracker Key Types Performance", () => {
  bench("string keys performance", () => {
    const tracker = new LruTracker<string>(100);
    const keys = generateKeys(200);

    for (const key of keys) {
      tracker.touch(key);
    }

    for (const key of keys.slice(0, 50)) {
      tracker.has(key);
    }
  });

  bench("symbol keys performance", () => {
    const tracker = new LruTracker<symbol>(100);
    const keys = generateSymbolKeys(200);

    for (const key of keys) {
      tracker.touch(key);
    }

    for (const key of keys.slice(0, 50)) {
      tracker.has(key);
    }
  });

  bench("numeric keys performance", () => {
    const tracker = new LruTracker<number>(100);
    const keys = generateNumericKeys(200);

    for (const key of keys) {
      tracker.touch(key);
    }

    for (const key of keys.slice(0, 50)) {
      tracker.has(key);
    }
  });
});

describe("LruTracker vs Native Map Comparison", () => {
  const testKeys = generateKeys(1000);

  bench("Native Map operations", () => {
    const map = new Map<string, number>();
    let counter = 0;

    for (const key of testKeys) {
      map.set(key, counter++);
      if (map.size > 100) {
        const firstKey = map.keys().next().value as string;
        map.delete(firstKey);
      }
    }

    for (const key of testKeys.slice(0, 50)) {
      map.has(key);
    }
  });

  bench("LruTracker operations", () => {
    const tracker = new LruTracker<string>(100);

    for (const key of testKeys) {
      tracker.touch(key);
    }

    for (const key of testKeys.slice(0, 50)) {
      tracker.has(key);
    }
  });

  bench("Native Map with manual LRU", () => {
    const map = new Map<string, number>();
    const order: string[] = [];
    let counter = 0;

    for (const key of testKeys) {
      if (map.has(key)) {
        const index = order.indexOf(key);
        order.splice(index, 1);
      } else if (map.size >= 100) {
        const oldestKey = order.shift();
        if (oldestKey) {
          map.delete(oldestKey);
        }
      }

      map.set(key, counter++);
      order.push(key);
    }
  });
});

describe("LruTracker Access Patterns", () => {
  bench("cache hit heavy pattern", () => {
    const tracker = new LruTracker<string>(100);
    const keys = generateKeys(50);

    for (const key of keys) {
      tracker.touch(key);
    }

    for (let i = 0; i < 1000; i++) {
      const key = keys[Math.floor(Math.random() * keys.length)] as string;
      tracker.touch(key);
    }
  });

  bench("cache miss heavy pattern", () => {
    const tracker = new LruTracker<string>(50);

    for (let i = 0; i < 1000; i++) {
      tracker.touch(`key${i}`);
    }
  });

  bench("mixed hit/miss pattern", () => {
    const tracker = new LruTracker<string>(100);
    const existingKeys = generateKeys(100);

    for (const key of existingKeys) {
      tracker.touch(key);
    }

    for (let i = 0; i < 500; i++) {
      if (i % 3 === 0) {
        const existingKey = existingKeys[
          Math.floor(Math.random() * existingKeys.length)
        ] as string;
        tracker.touch(existingKey);
      } else {
        tracker.touch(`new${i}`);
      }
    }
  });

  bench("temporal locality pattern", () => {
    const tracker = new LruTracker<string>(100);
    const keys = generateKeys(500);

    for (let window = 0; window < 10; window++) {
      const windowKeys = keys.slice(window * 10, (window + 1) * 10);
      for (let repeat = 0; repeat < 20; repeat++) {
        for (const key of windowKeys) {
          tracker.touch(key);
        }
      }
    }
  });
});

describe("LruTracker Edge Cases", () => {
  bench("single capacity tracker", () => {
    const tracker = new LruTracker<string>(1);
    const keys = generateKeys(100);

    for (const key of keys) {
      tracker.touch(key);
    }
  });

  bench("alternating touch and delete", () => {
    const tracker = new LruTracker<string>(100);

    for (let i = 0; i < 500; i++) {
      const key = `key${i}`;
      tracker.touch(key);
      if (i % 2 === 0) {
        tracker.delete(key);
      }
    }
  });

  bench("frequent getLru calls", () => {
    const tracker = new LruTracker<string>(100);
    const keys = generateKeys(50);

    for (const key of keys) {
      tracker.touch(key);
    }

    for (let i = 0; i < 1000; i++) {
      tracker.getLru();
      if (i % 10 === 0) {
        tracker.touch(`extra${i}`);
      }
    }
  });

  bench("frequent getMru calls", () => {
    const tracker = new LruTracker<string>(100);
    const keys = generateKeys(50);

    for (const key of keys) {
      tracker.touch(key);
    }

    for (let i = 0; i < 1000; i++) {
      tracker.getMru();
      if (i % 10 === 0) {
        tracker.touch(`extra${i}`);
      }
    }
  });

  bench("touch same key repeatedly", () => {
    const tracker = new LruTracker<string>(100);
    const keys = generateKeys(50);

    for (const key of keys) {
      tracker.touch(key);
    }

    for (let i = 0; i < 1000; i++) {
      tracker.touch("key25");
    }
  });
});

describe("LruTracker Concurrency Simulation", () => {
  bench("read-heavy workload", () => {
    const tracker = new LruTracker<string>(200);
    const keys = generateKeys(100);

    for (const key of keys) {
      tracker.touch(key);
    }

    for (let i = 0; i < 1000; i++) {
      const operation = i % 5;
      switch (operation) {
        case 0:
        case 1:
        case 2: {
          const key = keys[Math.floor(Math.random() * keys.length)] as string;
          tracker.has(key);
          break;
        }
        case 3:
          tracker.getLru();
          break;
        case 4:
          tracker.touch(`new${i}`);
          break;
        default:
          tracker.getMru();
      }
    }
  });

  bench("write-heavy workload", () => {
    const tracker = new LruTracker<string>(100);

    for (let i = 0; i < 1000; i++) {
      const operation = i % 4;
      switch (operation) {
        case 0:
        case 1:
          tracker.touch(`key${i}`);
          break;
        case 2:
          if (i > 50) {
            tracker.delete(`key${i - 50}`);
          }
          break;
        case 3:
          tracker.has(`key${Math.floor(i / 2)}`);
          break;
        default:
          tracker.getLru();
      }
    }
  });

  bench("balanced workload", () => {
    const tracker = new LruTracker<string>(150);
    const baseKeys = generateKeys(100);

    for (const key of baseKeys) {
      tracker.touch(key);
    }

    for (let i = 0; i < 1000; i++) {
      const operation = i % 6;
      switch (operation) {
        case 0:
        case 1: {
          const existingKey = baseKeys[
            Math.floor(Math.random() * baseKeys.length)
          ] as string;
          tracker.touch(existingKey);
          break;
        }
        case 2:
          tracker.touch(`new${i}`);
          break;
        case 3:
          tracker.has(`key${Math.floor(Math.random() * 100)}`);
          break;
        case 4:
          tracker.getLru();
          break;
        case 5: {
          if (Math.random() < 0.1) {
            tracker.delete(`key${Math.floor(Math.random() * 100)}`);
          }
          break;
        }
        default:
          tracker.getMru();
      }
    }
  });
});

describe("LruTracker Traversal Performance", () => {
  const tracker = new LruTracker<string>(1000);
  const keys = generateKeys(800);

  for (const key of keys) {
    tracker.touch(key);
  }

  bench("forward traversal (keys)", () => {
    const allKeys = tracker.keys();
    let _count = 0;
    for (const _ of allKeys) {
      _count++;
    }
  });

  bench("reverse traversal (keysReverse)", () => {
    const allKeys = tracker.keysReverse();
    let _count = 0;
    for (const _ of allKeys) {
      _count++;
    }
  });

  bench("entries traversal", () => {
    const allEntries = tracker.entries();
    let _count = 0;
    for (const [,] of allEntries) {
      _count++;
    }
  });

  bench("partial traversal simulation", () => {
    const allKeys = tracker.keys();
    const firstTen = allKeys.slice(0, 10);
    for (const key of firstTen) {
      tracker.touch(key);
    }
  });
});

describe("LruTracker Stress Tests", () => {
  bench("rapid capacity changes simulation", () => {
    let tracker = new LruTracker<string>(50);

    for (let phase = 0; phase < 10; phase++) {
      for (let i = 0; i < 100; i++) {
        tracker.touch(`phase${phase}_key${i}`);
      }

      tracker = new LruTracker<string>(50);
    }
  });

  bench("memory pressure simulation", () => {
    const tracker = new LruTracker<string>(100);

    for (let round = 0; round < 50; round++) {
      for (let i = 0; i < 200; i++) {
        tracker.touch(`round${round}_key${i}`);
      }

      if (round % 10 === 0) {
        tracker.clear();
      }
    }
  });

  bench("fragmentation simulation", () => {
    const tracker = new LruTracker<string>(200);
    const keys = generateKeys(400);

    for (const key of keys) {
      tracker.touch(key);
    }

    for (let i = 0; i < 300; i += 2) {
      tracker.delete(`key${i}`);
    }

    for (let i = 0; i < 150; i++) {
      tracker.touch(`refill${i}`);
    }
  });
});

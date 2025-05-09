import { bench, describe } from "vitest";
import { LruTracker, Store } from "../src/index.js";

describe("LruTracker Performance", () => {
  bench("Creation and access of 5000 elements", () => {
    const tracker = new LruTracker<string>(10000);

    // Add a large number of elements
    for (let i = 0; i < 5000; i++) {
      tracker.touch(`key${i}`);
    }

    // Access some elements to test access performance
    tracker.touch("key0");
    tracker.touch("key2500");
    tracker.touch("key4999");

    // Get the LRU element
    tracker.getLru();
  });

  bench("Element deletion", () => {
    const tracker = new LruTracker<string>(10000);

    // Add elements
    for (let i = 0; i < 1000; i++) {
      tracker.touch(`key${i}`);
    }

    // Delete elements
    for (let i = 0; i < 500; i++) {
      tracker.delete(`key${i}`);
    }
  });

  bench("Maximum capacity management", () => {
    // Test with limited capacity
    const tracker = new LruTracker<string>(500);

    // Add more elements than the capacity
    for (let i = 0; i < 1000; i++) {
      tracker.touch(`key${i}`);
    }

    // Check the size
    if (tracker.size !== 500) {
      throw new Error("Size should be limited to 500");
    }
  });
});

// Benchmarks for the Store class
describe("Store Performance", () => {
  bench("Basic operations with large datasets", () => {
    const store = new Store<string, { id: number; data: string }>(null, {
      maxSize: 10000,
      evictionStrategy: "lru",
    });

    // Add a large number of elements
    for (let i = 0; i < 5000; i++) {
      store.set(`key${i}`, { id: i, data: `data-${i}` });
    }

    // Access at different positions
    store.get("key0");
    store.get("key2500");
    store.get("key4999");
  });

  bench("Search with object patterns", () => {
    const store = new Store<
      string,
      { category: string; tags: string[]; value: number }
    >(null, {
      maxSize: 10000,
    });

    // Categories and tags for tests
    const categories = ["A", "B", "C", "D"];
    const allTags = ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"];

    // Fill the store
    for (let i = 0; i < 5000; i++) {
      const category = categories[i % categories.length] as string;
      const tags = allTags.filter((_, idx) => i % (idx + 2) === 0);
      store.set(`key${i}`, { category, tags, value: i });
    }

    // Search by pattern
    store.findAll({ category: "A" });
  });

  bench("Search with function predicates", () => {
    const store = new Store<
      string,
      { category: string; tags: string[]; value: number }
    >(null, {
      maxSize: 10000,
    });

    // Categories and tags for tests
    const categories = ["A", "B", "C", "D"];
    const allTags = ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"];

    // Fill the store
    for (let i = 0; i < 5000; i++) {
      const category = categories[i % categories.length] as string;
      const tags = allTags.filter((_, idx) => i % (idx + 2) === 0);
      store.set(`key${i}`, { category, tags, value: i });
    }

    // Search by function predicate
    store.findAll(
      (item) =>
        item.category === "B" &&
        item.tags.includes("tag3") &&
        item.value > 1000,
    );
  });

  bench("TTL and expiration management", () => {
    // Create a store with TTL
    const store = new Store<string, number>(null, {
      ttl: 1000,
      maxSize: 5000,
    });

    // Add elements with different TTLs
    for (let i = 0; i < 1000; i++) {
      if (i % 3 === 0) {
        store.setWithTtl(`fastExpire${i}`, i, 500);
      } else if (i % 3 === 1) {
        store.set(`normalExpire${i}`, i);
      } else {
        store.setWithTtl(`slowExpire${i}`, i, 2000);
      }
    }
  });
});

// Benchmarks for real-world use cases
describe("Real-World Usage Benchmarks", () => {
  // Simulate an API cache
  bench("API cache scenario", () => {
    interface ApiResponse {
      data: unknown;
      timestamp: number;
    }

    const apiCache = new Store<string, ApiResponse>(null, {
      maxSize: 100,
      ttl: 60000,
      cloneValues: true,
    });

    // Simulate 100 API requests
    for (let i = 0; i < 100; i++) {
      const endpoint = `/api/${i % 10}`;

      // Check if the response is already in cache
      if (!apiCache.has(endpoint)) {
        // Cache miss - simulate an API fetch
        const freshData = {
          data: `Response from ${endpoint}`,
          timestamp: Date.now(),
        };
        apiCache.set(endpoint, freshData);
      }

      // Read from cache
      apiCache.get(endpoint);
    }
  });

  // Simulate a configuration manager
  bench("Configuration management scenario", () => {
    interface ConfigItem {
      value: unknown;
      source: "default" | "user" | "environment";
      updatedAt?: number;
    }

    const configStore = new Store<string, ConfigItem>(null, {
      cloneValues: true,
    });

    // Set default values
    for (let i = 0; i < 50; i++) {
      configStore.set(`setting${i}`, {
        value: `default${i}`,
        source: "default",
      });
    }

    // Apply user preferences
    for (let i = 0; i < 30; i++) {
      configStore.add(`setting${i}`, {
        value: `user${i}`,
        source: "user",
        updatedAt: Date.now(),
      });
    }

    // Apply environment overrides
    for (let i = 0; i < 10; i++) {
      configStore.add(`setting${i}`, {
        value: `env${i}`,
        source: "environment",
      });
    }

    // Find all user-modified parameters
    configStore.filter((config) => config.source === "user");
  });

  // Simulate a session store
  bench("Session management scenario", () => {
    interface SessionData {
      userId: string;
      permissions: string[];
      lastActivity: number;
      data: Record<string, unknown>;
    }

    const sessionStore = new Store<string, SessionData>(null, {
      maxSize: 1000,
      ttl: 30000,
      evictionStrategy: "lru",
      cloneValues: true,
    });

    // Simulate active sessions
    for (let i = 0; i < 500; i++) {
      const sessionId = `session${i}`;
      const userData: SessionData = {
        userId: `user${i % 100}`,
        permissions: i % 5 === 0 ? ["admin", "user"] : ["user"],
        lastActivity: Date.now(),
        data: {
          preferences: {
            theme: i % 2 === 0 ? "light" : "dark",
            language: i % 3 === 0 ? "en" : i % 3 === 1 ? "fr" : "es",
          },
          cart: {
            items: i % 4,
          },
        },
      };

      sessionStore.set(sessionId, userData);
    }

    // Simulate user activity - session updates
    for (let i = 0; i < 200; i++) {
      const sessionId = `session${i}`;
      if (sessionStore.has(sessionId)) {
        sessionStore.add(sessionId, {
          lastActivity: Date.now(),
          data: {
            cart: {
              items: (i % 10) + 1,
            },
          },
        });
      }
    }

    // Simulate session lookups
    for (let i = 0; i < 50; i++) {
      const randomId = Math.floor(Math.random() * 500);
      sessionStore.get(`session${randomId}`);
    }
  });
});

// Compare different eviction strategies
describe("Eviction Strategy Comparison", () => {
  bench("FIFO Strategy", () => {
    const store = new Store<string, number>(null, {
      maxSize: 1000,
      evictionStrategy: "fifo",
    });

    // Fill the store
    for (let i = 0; i < 2000; i++) {
      store.set(`key${i}`, i);
    }
  });

  bench("LRU Strategy", () => {
    const store = new Store<string, number>(null, {
      maxSize: 1000,
      evictionStrategy: "lru",
    });

    // Fill the store
    for (let i = 0; i < 2000; i++) {
      store.set(`key${i}`, i);

      // Simulate access patterns for LRU
      if (i % 10 === 0) {
        for (let j = 0; j < 5; j++) {
          if (i > j * 10) {
            store.get(`key${i - j * 10}`);
          }
        }
      }
    }
  });
});

// Compare cloning options
describe("Clone Options Comparison", () => {
  bench("Without cloning", () => {
    const store = new Store<string, { count: number }>();

    for (let i = 0; i < 1000; i++) {
      store.set(`obj${i}`, { count: i });
    }

    // Read and modify
    for (let i = 0; i < 1000; i++) {
      const obj = store.get(`obj${i}`);
      if (obj) {
        obj.count += 1;
      }
    }
  });

  bench("With cloning", () => {
    const store = new Store<string, { count: number }>(null, {
      cloneValues: true,
    });

    for (let i = 0; i < 1000; i++) {
      store.set(`obj${i}`, { count: i });
    }

    // Read and modify (modifications won't affect stored values)
    for (let i = 0; i < 1000; i++) {
      const obj = store.get(`obj${i}`);
      if (obj) {
        obj.count += 1;
      }
    }
  });
});

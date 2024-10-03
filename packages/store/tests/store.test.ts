import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StoreOptions } from "../src";
import { Store } from "../src";

describe("Store", () => {
    let store: Store<string, number>;
    let options: StoreOptions<string, number>;

    beforeEach(() => {
        vi.useFakeTimers();
        options = {
            max_size: 3,
            default_ttl: 1_000,
            cleanup_interval: 500,
            eviction_strategy: "lru",
        };
        store = new Store(options);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should set and get values correctly", () => {
        store.set("a", 1);
        store.set("b", 2);
        expect(store.get("a")).toBe(1);
        expect(store.get("b")).toBe(2);
        expect(store.get("c")).toBeUndefined();
    });

    it("should respect max_size and evict items", () => {
        store.set("a", 1);
        store.set("b", 2);
        store.set("c", 3);
        store.set("d", 4);
        expect(store.get("a")).toBeUndefined();
        expect(store.get("d")).toBe(4);
    });

    it("should respect TTL", () => {
        store.set("a", 1, 100);
        expect(store.get("a")).toBe(1);
        vi.advanceTimersByTime(101);
        expect(store.get("a")).toBeUndefined();
    });

    it("should update LRU order on get", () => {
        store.set("a", 1);
        store.set("b", 2);
        store.set("c", 3);
        store.get("a");
        store.set("d", 4);
        expect(store.get("b")).toBeUndefined();
        expect(store.get("a")).toBe(1);
    });

    it("should perform cleanup", () => {
        store.set("a", 1, 100);
        store.set("b", 2, 200);
        store.set("c", 3, 300);
        vi.advanceTimersByTime(201);
        expect(store.cleanup()).toBe(2);
        expect(store.get("a")).toBeUndefined();
        expect(store.get("b")).toBeUndefined();
        expect(store.get("c")).toBe(3);
    });

    it("should return correct stats", () => {
        store.set("a", 1);
        store.get("a");
        store.get("b");
        const stats = store.getStats();
        expect(stats.hitCount).toBe(1);
        expect(stats.missCount).toBe(1);
        expect(stats.size).toBe(1);
    });

    it("should handle bulk set operations", () => {
        store.bulkSet([
            ["a", 1],
            ["b", 2],
            ["c", 3],
        ]);
        expect(store.get("a")).toBe(1);
        expect(store.get("b")).toBe(2);
        expect(store.get("c")).toBe(3);
    });

    it("should call onEvict callback when item is evicted", () => {
        const onEvict = vi.fn();
        const storeWithCallback = new Store({ ...options, onEvict });
        storeWithCallback.set("a", 1);
        storeWithCallback.set("b", 2);
        storeWithCallback.set("c", 3);
        storeWithCallback.set("d", 4);
        expect(onEvict).toHaveBeenCalledWith("a", 1);
    });

    it("should handle custom serialization and deserialization", () => {
        const serialize = vi.fn(JSON.stringify);
        const deserialize = vi.fn(JSON.parse);
        const storeWithCustomSerialization = new Store({ serialize, deserialize });
        storeWithCustomSerialization.set("a", { value: 1 });
        expect(serialize).toHaveBeenCalled();
        expect(deserialize).toHaveBeenCalled();
        expect(storeWithCustomSerialization.get("a")).toEqual({ value: 1 });
    });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { Store } from "../src";

describe("Store", () => {
    let store: Store<string, number>;

    beforeEach(() => {
        store = new Store<string, number>();
    });

    describe("basic operations", () => {
        it("should set and get a value", () => {
            store.set("key", 42);
            expect(store.get("key")).toBe(42);
        });

        it("should return undefined for non-existent key", () => {
            expect(store.get("nonexistent")).toBeUndefined();
        });

        it("should delete a value", () => {
            store.set("key", 42);
            store.delete("key");
            expect(store.get("key")).toBeUndefined();
        });

        it("should clear all values", () => {
            store.set("key1", 1);
            store.set("key2", 2);
            store.clear();
            expect(store.size()).toBe(0);
        });
    });

    describe("TTL functionality", () => {
        it("should expire items after TTL", async () => {
            const store = new Store<string, number>({ default_ttL: 50 });
            store.set("key", 42);
            await new Promise((resolve) => setTimeout(resolve, 60));
            expect(store.get("key")).toBeUndefined();
        });

        it("should not expire items before TTL", async () => {
            const store = new Store<string, number>({ default_ttL: 100 });
            store.set("key", 42);
            await new Promise((resolve) => setTimeout(resolve, 50));
            expect(store.get("key")).toBe(42);
        });
    });

    describe("LRU functionality", () => {
        it("should evict least recently used item when max size is reached", () => {
            const store = new Store<string, number>({ max_size: 2 });
            store.set("key1", 1);
            store.set("key2", 2);
            store.set("key3", 3);
            expect(store.get("key1")).toBeUndefined();
            expect(store.get("key2")).toBe(2);
            expect(store.get("key3")).toBe(3);
        });
    });

    describe("onEvict callback", () => {
        it("should call onEvict when an item is evicted", () => {
            const onEvict = vi.fn();
            const store = new Store<string, number>({ max_size: 1, onEvict });
            store.set("key1", 1);
            store.set("key2", 2);
            expect(onEvict).toHaveBeenCalledWith("key1", 1);
        });
    });

    describe("advanced operations", () => {
        it("should memoize a function", () => {
            const fn = vi.fn((x: number) => x * 2);
            const memoizedFn = store.memoize(fn);
            expect(memoizedFn(2)).toBe(4);
            expect(memoizedFn(2)).toBe(4);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it("should update if exists", () => {
            store.set("key", 1);
            store.updateIfExists("key", (value) => value + 1);
            expect(store.get("key")).toBe(2);
        });

        it("should set many values", () => {
            store.setMany([
                ["key1", 1],
                ["key2", 2],
            ]);
            expect(store.get("key1")).toBe(1);
            expect(store.get("key2")).toBe(2);
        });

        it("should get many values", () => {
            store.set("key1", 1);
            store.set("key2", 2);
            expect(store.getMany(["key1", "key2", "key3"])).toEqual([1, 2, undefined]);
        });

        it("should clear expired items", async () => {
            const store = new Store<string, number>({ default_ttL: 50 });
            store.set("key1", 1);
            store.set("key2", 2);
            await new Promise((resolve) => setTimeout(resolve, 60));
            const clearedCount = store.clearExpired();
            expect(clearedCount).toBe(2);
            expect(store.size()).toBe(0);
        });

        it("should prune based on condition", () => {
            store.set("key1", 1);
            store.set("key2", 2);
            store.set("key3", 3);
            const prunedCount = store.prune((_, value) => value % 2 === 0);
            expect(prunedCount).toBe(1);
            expect(store.size()).toBe(2);
        });
    });

    describe("functional operations", () => {
        it("should map values", () => {
            store.set("key1", 1);
            store.set("key2", 2);
            const newStore = store.map((value) => value * 2);
            expect(newStore.get("key1")).toBe(2);
            expect(newStore.get("key2")).toBe(4);
        });

        it("should filter values", () => {
            store.set("key1", 1);
            store.set("key2", 2);
            const newStore = store.filter((value) => value % 2 === 0);
            expect(newStore.size()).toBe(1);
            expect(newStore.get("key2")).toBe(2);
        });

        it("should reduce values", () => {
            store.set("key1", 1);
            store.set("key2", 2);
            store.set("key3", 3);
            const sum = store.reduce((acc, value) => acc + value, 0);
            expect(sum).toBe(6);
        });

        it("should iterate over values with forEach", () => {
            store.set("key1", 1);
            store.set("key2", 2);
            const mockCallback = vi.fn();
            store.forEach(mockCallback);
            expect(mockCallback).toHaveBeenCalledTimes(2);
            expect(mockCallback).toHaveBeenCalledWith(1, "key1");
            expect(mockCallback).toHaveBeenCalledWith(2, "key2");
        });
    });
});

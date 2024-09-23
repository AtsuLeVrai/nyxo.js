import { beforeEach, describe, expect, it, vi } from "vitest";
import { Store, StoreError } from "../src";

describe("Store", () => {
    let store: Store<string, number>;

    beforeEach(() => {
        store = new Store();
    });

    describe("constructor", () => {
        it("should create a store with default options", () => {
            expect(store.size()).toBe(0);
        });

        it("should create a store with custom options", () => {
            const customStore = new Store({ max_size: 5, default_ttl: 1000 });
            expect(customStore.size()).toBe(0);
        });
    });

    describe("set and get", () => {
        it("should set and get a value", () => {
            store.set("key1", 100);
            expect(store.get("key1")).toBe(100);
        });

        it("should return undefined for non-existent key", () => {
            expect(store.get("nonexistent")).toBeUndefined();
        });

        it("should overwrite existing value", () => {
            store.set("key1", 100);
            store.set("key1", 200);
            expect(store.get("key1")).toBe(200);
        });

        it("should throw error for invalid key", () => {
            expect(() => store.set("", 100)).toThrow(StoreError);
            expect(() => store.get("")).toThrow(StoreError);
        });

        it("should throw error for undefined value", () => {
            expect(() => store.set("key1", undefined as any)).toThrow(StoreError);
        });
    });

    describe("delete", () => {
        it("should delete an existing key", () => {
            store.set("key1", 100);
            expect(store.delete("key1")).toBe(true);
            expect(store.get("key1")).toBeUndefined();
        });

        it("should return false when deleting non-existent key", () => {
            expect(store.delete("nonexistent")).toBe(false);
        });
    });

    describe("clear", () => {
        it("should remove all items from the store", () => {
            store.set("key1", 100);
            store.set("key2", 200);
            store.clear();
            expect(store.size()).toBe(0);
            expect(store.get("key1")).toBeUndefined();
            expect(store.get("key2")).toBeUndefined();
        });
    });

    describe("size", () => {
        it("should return the correct number of items", () => {
            expect(store.size()).toBe(0);
            store.set("key1", 100);
            expect(store.size()).toBe(1);
            store.set("key2", 200);
            expect(store.size()).toBe(2);
            store.delete("key1");
            expect(store.size()).toBe(1);
        });
    });

    describe("TTL and expiration", () => {
        it("should expire items after TTL", async () => {
            vi.useFakeTimers();
            store.set("key1", 100, 1000); // 1 second TTL
            expect(store.get("key1")).toBe(100);
            vi.advanceTimersByTime(1001);
            expect(store.get("key1")).toBeUndefined();
            vi.useRealTimers();
        });

        it("should not expire items with no TTL", async () => {
            vi.useFakeTimers();
            store.set("key1", 100);
            vi.advanceTimersByTime(10000);
            expect(store.get("key1")).toBe(100);
            vi.useRealTimers();
        });
    });

    describe("LRU eviction", () => {
        it("should evict least recently used item when max size is reached", () => {
            const limitedStore = new Store<string, number>({ max_size: 2 });
            limitedStore.set("key1", 100);
            limitedStore.set("key2", 200);
            limitedStore.set("key3", 300);
            expect(limitedStore.get("key1")).toBeUndefined();
            expect(limitedStore.get("key2")).toBe(200);
            expect(limitedStore.get("key3")).toBe(300);
        });

        it("should update LRU order on get", () => {
            const limitedStore = new Store<string, number>({ max_size: 2 });
            limitedStore.set("key1", 100);
            limitedStore.set("key2", 200);
            limitedStore.get("key1"); // This should move key1 to the front
            limitedStore.set("key3", 300);
            expect(limitedStore.get("key1")).toBe(100);
            expect(limitedStore.get("key2")).toBeUndefined();
            expect(limitedStore.get("key3")).toBe(300);
        });
    });

    describe("onEvict callback", () => {
        it("should call onEvict callback when an item is evicted", () => {
            const onEvictMock = vi.fn();
            const limitedStore = new Store<string, number>({ max_size: 1, onEvict: onEvictMock });
            limitedStore.set("key1", 100);
            limitedStore.set("key2", 200);
            expect(onEvictMock).toHaveBeenCalledWith("key1", 100);
        });
    });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CacheOptions } from "../src";
import { Cache } from "../src";

describe("Cache", () => {
	let cache: Cache<string, number>;
	const defaultOptions: CacheOptions = {
		capacity: 3,
		ttl: 1_000,
	};

	beforeEach(() => {
		cache = new Cache<string, number>(defaultOptions);
	});

	it("should set and get an item", () => {
		cache.set("a", 1);
		expect(cache.get("a")).toBe(1);
	});

	it("should respect capacity limit", () => {
		cache.set("a", 1);
		cache.set("b", 2);
		cache.set("c", 3);
		cache.set("d", 4);
		expect(cache.get("a")).toBeUndefined();
		expect(cache.get("b")).toBe(2);
		expect(cache.get("c")).toBe(3);
		expect(cache.get("d")).toBe(4);
	});

	it("should respect TTL", () => {
		vi.useFakeTimers();
		cache.set("a", 1);
		vi.advanceTimersByTime(500);
		expect(cache.get("a")).toBe(1);
		vi.advanceTimersByTime(501);
		expect(cache.get("a")).toBeUndefined();
		vi.useRealTimers();
	});

	it("should update existing item", () => {
		cache.set("a", 1);
		cache.set("a", 2);
		expect(cache.get("a")).toBe(2);
	});

	it("should delete an item", () => {
		cache.set("a", 1);
		cache.delete("a");
		expect(cache.get("a")).toBeUndefined();
	});

	it("should clear all items", () => {
		cache.set("a", 1);
		cache.set("b", 2);
		cache.clear();
		expect(cache.get("a")).toBeUndefined();
		expect(cache.get("b")).toBeUndefined();
	});

	it("should update LRU order on get", () => {
		cache.set("a", 1);
		cache.set("b", 2);
		cache.set("c", 3);
		cache.get("a");
		cache.set("d", 4);
		expect(cache.get("b")).toBeUndefined();
		expect(cache.get("a")).toBe(1);
		expect(cache.get("c")).toBe(3);
		expect(cache.get("d")).toBe(4);
	});

	it("should allow changing capacity", () => {
		cache.set("a", 1);
		cache.set("b", 2);
		cache.set("c", 3);
		cache.setCapacity(2);
		cache.set("d", 4);
		expect(cache.get("a")).toBeUndefined();
		expect(cache.get("b")).toBeUndefined();
		expect(cache.get("c")).toBe(3);
		expect(cache.get("d")).toBe(4);
	});

	it("should allow changing TTL", () => {
		vi.useFakeTimers();
		cache.set("a", 1);
		cache.setTTL(500);
		vi.advanceTimersByTime(600);
		expect(cache.get("a")).toBeUndefined();
		vi.useRealTimers();
	});
});

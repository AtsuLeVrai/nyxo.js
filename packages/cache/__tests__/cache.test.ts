import { Cache } from "../src";

describe("Cache", () => {
	let cache: Cache<string, number>;

	beforeEach(() => {
		cache = new Cache<string, number>({ capacity: 2, ttl: 1000 });
	});

	test("should set and get values", () => {
		cache.set("key1", 1);
		expect(cache.get("key1")).toBe(1);
	});

	test("should return undefined for non-existing keys", () => {
		expect(cache.get("key1")).toBeUndefined();
	});

	test("should delete values", () => {
		cache.set("key1", 1);
		cache.delete("key1");
		expect(cache.get("key1")).toBeUndefined();
	});

	test("should clear the cache", () => {
		cache.set("key1", 1);
		cache.set("key2", 2);
		cache.clear();
		expect(cache.get("key1")).toBeUndefined();
		expect(cache.get("key2")).toBeUndefined();
	});

	test("should evict the least recently used item when capacity is reached", () => {
		cache.set("key1", 1);
		cache.set("key2", 2);
		cache.set("key3", 3); // This should evict 'key1'
		expect(cache.get("key1")).toBeUndefined();
		expect(cache.get("key2")).toBe(2);
		expect(cache.get("key3")).toBe(3);
	});

	test("should not return expired items", (done) => {
		cache.set("key1", 1);
		setTimeout(() => {
			expect(cache.get("key1")).toBeUndefined();
			done();
		}, 1100);
	});

	test("should not expire items within ttl", (done) => {
		cache.set("key1", 1);
		setTimeout(() => {
			expect(cache.get("key1")).toBe(1);
			done();
		}, 500);
	});

	test("should emit debug events", () => {
		const debugSpy = jest.fn();
		cache.on("debug", debugSpy);
		cache.set("key1", 1);
		expect(debugSpy).toHaveBeenCalled();
	});

	test("should emit warn events when cache is full", () => {
		const warnSpy = jest.fn();
		cache.on("warn", warnSpy);
		cache.set("key1", 1);
		cache.set("key2", 2);
		cache.set("key3", 3); // This should trigger a warning
		expect(warnSpy).toHaveBeenCalled();
	});

	test("should emit error events when eviction is attempted on an empty cache", () => {
		const errorSpy = jest.fn();
		cache.on("error", errorSpy);
		cache.evict();
		expect(errorSpy).toHaveBeenCalled();
	});
});

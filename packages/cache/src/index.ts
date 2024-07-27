import EventEmitter from "eventemitter3";
import { v4 } from "uuid";

class Node<K, V> {
	public next: Node<K, V> | null = null;

	public prev: Node<K, V> | null = null;

	public constructor(public key: K, public value: V, public timestamp: number) {}
}

export type CacheOptions = {
	capacity?: number;
	ttl?: number;
};

export type CacheEvents = {
	debug: [message: string];
	error: [error: Error];
	warn: [warning: string];
};

export class Cache<K, V> extends EventEmitter<CacheEvents> {
	public uuid = v4();

	private map: Map<K, Node<K, V>> = new Map();

	private head: Node<K, V> | null = null;

	private tail: Node<K, V> | null = null;

	public constructor(private readonly options?: CacheOptions) {
		super();
	}

	public set(key: K, value: V): void {
		const now = Date.now();
		this.emit("debug", `[CACHE: ${this.uuid}] Setting key: ${key} with value: ${value}`);

		if (this.map.has(key)) {
			this.emit("debug", `[CACHE: ${this.uuid}] Key: ${key} already exists in cache`);
			const existingItem = this.map.get(key);
			if (existingItem) {
				this.remove(existingItem);
			}
		} else if (this.options?.capacity !== undefined && this.map.size >= this.options.capacity) {
			this.emit("warn", `[CACHE: ${this.uuid}] Cache is full, evicting item`);
			this.evict();
		}

		const newItem = new Node(key, value, now);
		this.setHead(newItem);
		this.map.set(key, newItem);
	}

	public get(key: K): V | undefined {
		this.emit("debug", `[CACHE: ${this.uuid}] Getting key: ${key}`);
		const item = this.map.get(key);
		if (item) {
			if (this.isExpired(item)) {
				this.emit("warn", `[CACHE: ${this.uuid}] Key: ${key} has expired`);
				this.remove(item);
				this.map.delete(key);
				return undefined;
			} else {
				this.remove(item);
				this.setHead(item);
				return item.value;
			}
		} else {
			this.emit("debug", `[CACHE: ${this.uuid}] Key: ${key} not found in cache`);
		}

		return undefined;
	}

	public delete(key: K): void {
		this.emit("debug", `[CACHE: ${this.uuid}] Deleting key: ${key}`);
		const item = this.map.get(key);
		if (item) {
			this.remove(item);
			this.map.delete(key);
		} else {
			this.emit("warn", `[CACHE: ${this.uuid}] Key: ${key} not found in cache`);
		}
	}

	public clear(): void {
		this.emit("debug", `[CACHE: ${this.uuid}] Clearing cache`);
		this.map.clear();
		this.head = null;
		this.tail = null;
	}

	private remove(item: Node<K, V>): void {
		if (item.prev) {
			item.prev.next = item.next;
		}

		if (item.next) {
			item.next.prev = item.prev;
		}

		if (this.head === item) {
			this.head = item.next;
		}

		if (this.tail === item) {
			this.tail = item.prev;
		}
	}

	private setHead(item: Node<K, V>): void {
		item.next = this.head;
		item.prev = null;
		if (this.head) {
			this.head.prev = item;
		}

		this.head = item;
		if (!this.tail) {
			this.tail = item;
		}
	}

	private evict(): void {
		if (this.tail) {
			this.emit(
				"debug",
				`[CACHE: ${this.uuid}] Evicting key: ${this.tail.key}`,
			);
			this.map.delete(this.tail.key);
			this.remove(this.tail);
		} else {
			this.emit(
				"error",
				new Error(`[CACHE: ${this.uuid}] Cannot evict item, cache is empty`),
			);
		}
	}

	private isExpired(item: Node<K, V>): boolean {
		return (
			this.options?.ttl !== undefined &&
            Date.now() - item.timestamp > this.options.ttl
		);
	}
}

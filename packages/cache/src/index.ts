class Node<K, V> {
	public next: Node<K, V> | null = null;

	public prev: Node<K, V> | null = null;

	public constructor(public key: K, public value: V, public timestamp: number) {}
}

export type CacheOptions = {
	capacity?: number;
	ttl?: number;
};

export class Cache<K, V> {
	private map: Map<K, Node<K, V>> = new Map();

	private head: Node<K, V> | null = null;

	private tail: Node<K, V> | null = null;

	public constructor(private readonly options?: CacheOptions) {}

	public setCapacity(capacity: number): void {
		if (this.options) {
			this.options.capacity = capacity;
		}
	}

	public setTTL(ttl: number): void {
		if (this.options) {
			this.options.ttl = ttl;
		}
	}

	public set(key: K, value: V): void {
		const now = Date.now();
		if (this.map.has(key)) {
			const existingItem = this.map.get(key);
			if (existingItem) {
				this.remove(existingItem);
			}
		} else if (this.options?.capacity !== undefined && this.map.size >= this.options.capacity) {
			this.evict();
		}

		const newItem = new Node(key, value, now);
		this.setHead(newItem);
		this.map.set(key, newItem);
	}

	public get(key: K): V | undefined {
		const item = this.map.get(key);
		if (item) {
			if (this.isExpired(item)) {
				this.remove(item);
				this.map.delete(key);
				return undefined;
			} else {
				this.remove(item);
				this.setHead(item);
				return item.value;
			}
		}

		return undefined;
	}

	public delete(key: K): void {
		const item = this.map.get(key);
		if (item) {
			this.remove(item);
			this.map.delete(key);
		}
	}

	public clear(): void {
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
			this.map.delete(this.tail.key);
			this.remove(this.tail);
		}
	}

	private isExpired(item: Node<K, V>): boolean {
		return (
			this.options?.ttl !== undefined &&
            Date.now() - item.timestamp > this.options.ttl
		);
	}
}

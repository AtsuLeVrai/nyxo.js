import { Store } from "@nyxjs/store";
import type { Client } from "../core/index.js";
import type { ClientOptions } from "../options/index.js";

export class CacheManager {
  readonly #stores = new Store<string, Store<string, unknown>>();
  readonly #client: Client;
  readonly #options: ClientOptions;

  constructor(client: Client, options: ClientOptions) {
    this.#client = client;
    this.#options = options;
  }

  get<T>(name: string): Store<string, T> {
    if (!this.#stores.has(name)) {
      this.#stores.set(name, new Store(null, this.#options));
    }
    return this.#stores.get(name) as Store<string, T>;
  }

  set<T>(name: string, key: string, value: T): void {
    const store = this.get<T>(name);

    if (store.has(key)) {
      this.#client.emit("cacheHit", {
        key,
        value,
        className: name,
      });
    } else {
      this.#client.emit("cacheMiss", {
        key,
        value,
        className: name,
      });
    }

    store.set(key, value);
  }

  getValue<T>(name: string, key: string): T | undefined {
    return this.get<T>(name).get(key);
  }

  has(name: string, key: string): boolean {
    return this.#stores.has(name) && this.get(name).has(key);
  }

  delete(name: string, key: string): boolean {
    if (!this.#stores.has(name)) {
      return false;
    }
    return this.get(name).delete(key);
  }

  clear(name: string): void {
    if (this.#stores.has(name)) {
      this.get(name).clear();
    }
  }

  clearAll(): void {
    this.#stores.clear();
  }

  keys(name: string): string[] {
    if (!this.#stores.has(name)) {
      return [];
    }
    return Array.from(this.get(name).keys());
  }

  values<T>(name: string): T[] {
    if (!this.#stores.has(name)) {
      return [];
    }

    return Array.from(this.get(name).values()) as T[];
  }

  size(name: string): number {
    if (!this.#stores.has(name)) {
      return 0;
    }
    return this.get(name).size;
  }
}

import { Store } from "@nyxjs/store";
import type { CacheEntry, CacheOptions } from "../types/index.js";

export class CacheService {
  readonly #cache: Store<string, CacheEntry>;
  readonly #options: Required<CacheOptions>;
  #sweepInterval?: NodeJS.Timeout;

  constructor(options: Required<CacheOptions>) {
    this.#cache = new Store();
    this.#options = options;

    if (this.#options.enableSweeping) {
      this.#initSweeping();
    }
  }

  get<T>(key: string): T | null {
    if (this.#options.disabled) {
      return null;
    }

    const entry = this.#cache.get(key);
    if (!entry || this.#isExpired(entry)) {
      if (entry) {
        this.delete(key);
      }
      return null;
    }

    return entry.data as T;
  }

  set(key: string, value: unknown, lifetime?: number): void {
    if (this.#options.disabled) {
      return;
    }

    if (this.#cache.size >= this.#options.maxSize) {
      const oldestKey = Array.from(this.#cache.entries()).sort(
        ([, a], [, b]) => a.timestamp - b.timestamp,
      )[0]?.[0];

      if (!oldestKey) {
        return;
      }

      this.delete(oldestKey);
    }

    const actualLifetime = lifetime ?? this.#options.lifetime;
    const entry: CacheEntry = {
      data: value,
      timestamp: Date.now(),
      expiresAt: Date.now() + actualLifetime,
    };

    this.#cache.set(key, entry);
  }

  has(key: string): boolean {
    if (this.#options.disabled) {
      return false;
    }

    const entry = this.#cache.get(key);
    if (!entry || this.#isExpired(entry)) {
      if (entry) {
        this.delete(key);
      }
      return false;
    }
    return true;
  }

  delete(key: string): void {
    this.#cache.delete(key);
  }

  clear(): void {
    this.#cache.clear();
  }

  sweep(): void {
    for (const [key, entry] of this.#cache.entries()) {
      if (this.#isExpired(entry)) {
        this.delete(key);
      }
    }
  }

  shouldCache(path: string, method: string): boolean {
    return !this.#options.disabled && this.#options.shouldCache(path, method);
  }

  generateKey(path: string, method: string): string {
    return this.#options.keyGenerator(path, method);
  }

  destroy(): void {
    this.clear();
    if (this.#sweepInterval) {
      clearInterval(this.#sweepInterval);
    }
  }

  #isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  #initSweeping(): void {
    this.#sweepInterval = setInterval(() => {
      this.sweep();
    }, this.#options.sweepInterval);
  }
}

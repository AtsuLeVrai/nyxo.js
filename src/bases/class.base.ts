import { deepmerge } from "deepmerge-ts";
import type { CacheEntityMap, CacheKey, Client } from "../core/index.js";

export type KeyExtractor<T extends object> = (data: T) => string;

export interface CacheEntityInfo {
  storeKey: CacheKey;
  id: string;
}

export const CACHE_METADATA_KEYS = {
  CACHE_STORE_KEY: "nyxojs:cache:storeKey",
  CACHE_KEY_EXTRACTOR: "nyxojs:cache:keyExtractor",
} as const;

export function Cacheable<T extends CacheKey>(
  storeKey: T,
  keyExtractor: KeyExtractor<CacheEntityMap[T]>,
) {
  return (target: object): void => {
    Reflect.defineMetadata(CACHE_METADATA_KEYS.CACHE_STORE_KEY, storeKey, target);
    Reflect.defineMetadata(CACHE_METADATA_KEYS.CACHE_KEY_EXTRACTOR, keyExtractor, target);
  };
}

export abstract class BaseClass<T extends object> {
  protected readonly client: Client;
  protected rawData = {} as T;

  constructor(client: Client, data: Partial<T>) {
    this.client = client;
    this.patch(data);

    this.#syncToCache();
  }

  get isCached(): boolean {
    const cacheInfo = this.cacheInfo;
    if (!cacheInfo) {
      return false;
    }

    return this.client.cache.has(cacheInfo.storeKey, cacheInfo.id);
  }

  get cacheInfo(): CacheEntityInfo | null {
    const entityConstructor = this.constructor as typeof BaseClass;
    const storeKey = Reflect.getMetadata(CACHE_METADATA_KEYS.CACHE_STORE_KEY, entityConstructor) as
      | CacheKey
      | undefined;
    if (!storeKey) {
      return null;
    }

    const keyExtractor = Reflect.getMetadata(
      CACHE_METADATA_KEYS.CACHE_KEY_EXTRACTOR,
      entityConstructor,
    ) as KeyExtractor<T>;
    const id = keyExtractor(this.rawData);

    return id ? { storeKey, id } : null;
  }

  patch(data: Partial<T>): this {
    this.rawData = deepmerge(this.rawData, data) as T;
    this.#syncToCache();
    return this;
  }

  clone(overrides: Partial<T> = {}): this {
    const CloneConstructor = this.constructor as new (client: Client, data: Partial<T>) => this;
    const mergedData = deepmerge(this.rawData, overrides);
    return new CloneConstructor(this.client, mergedData as Partial<T>);
  }

  uncache(): boolean {
    const cacheInfo = this.cacheInfo;
    if (!cacheInfo) {
      return false;
    }

    return this.client.cache.delete(cacheInfo.storeKey, cacheInfo.id);
  }

  sync(): boolean {
    const cacheInfo = this.cacheInfo;
    if (!cacheInfo) {
      return false;
    }

    const cachedData = this.client.cache.get(cacheInfo.storeKey, cacheInfo.id);
    if (cachedData) {
      this.rawData = cachedData as T;
      return true;
    }

    return false;
  }

  toJson(): Readonly<T> {
    return Object.freeze({ ...this.rawData });
  }

  #syncToCache(): void {
    const cacheInfo = this.cacheInfo;
    if (cacheInfo) {
      // @ts-expect-error - rawData is of type T which extends object, so it should be assignable to CacheEntityMap[T]
      this.client.cache.set(cacheInfo.storeKey, cacheInfo.id, this.rawData);
    }
  }
}

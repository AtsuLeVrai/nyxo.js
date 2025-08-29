import type { CacheKey, Client } from "../core/index.js";

export type KeyExtractor<T extends object> = (data: T) => string;

export interface CacheEntityInfo {
  storeKey: CacheKey;
  id: string;
}

export const METADATA_KEYS = {
  CACHE_STORE_KEY: "nyxojs:cache:storeKey",
  CACHE_KEY_EXTRACTOR: "nyxojs:cache:keyExtractor",
} as const;

export function Cacheable<T extends object>(storeKey: CacheKey, keyExtractor: KeyExtractor<T>) {
  return (target: object): void => {
    Reflect.defineMetadata(METADATA_KEYS.CACHE_STORE_KEY, storeKey, target);
    Reflect.defineMetadata(METADATA_KEYS.CACHE_KEY_EXTRACTOR, keyExtractor, target);
  };
}

export abstract class BaseClass<T extends object> {
  protected readonly client: Client;
  protected rawData: T;

  constructor(client: Client, data: T) {
    this.client = client;
    this.rawData = data;

    this.#initializeCache();
  }

  get isCached(): boolean {
    const cacheInfo = this.cacheInfo;
    if (!cacheInfo) {
      return false;
    }

    const { storeKey, id } = cacheInfo;
    return this.client.cache.has(storeKey, id);
  }

  get cacheInfo(): CacheEntityInfo | null {
    const entityConstructor = this.constructor as typeof BaseClass;
    const storeKey = Reflect.getMetadata(METADATA_KEYS.CACHE_STORE_KEY, entityConstructor) as
      | CacheKey
      | undefined;

    if (!storeKey) {
      return null;
    }

    const keyExtractor = Reflect.getMetadata(
      METADATA_KEYS.CACHE_KEY_EXTRACTOR,
      entityConstructor,
    ) as KeyExtractor<T>;
    const id = keyExtractor(this.rawData);

    return id ? { storeKey, id } : null;
  }

  patch(data: Partial<T>): this {
    this.rawData = { ...this.rawData, ...data };

    const cacheInfo = this.cacheInfo;
    if (cacheInfo) {
      const { storeKey, id } = cacheInfo;
      this.client.cache.set(storeKey, id, this.rawData);
    }

    return this;
  }

  uncache(): boolean {
    const cacheInfo = this.cacheInfo;
    if (!cacheInfo) {
      return false;
    }

    const { storeKey, id } = cacheInfo;
    return this.client.cache.delete(storeKey, id);
  }

  toJson(): Readonly<T> {
    return Object.freeze({ ...this.rawData });
  }

  #initializeCache(): void {
    const cacheInfo = this.cacheInfo;
    if (cacheInfo) {
      const { storeKey, id } = cacheInfo;
      this.client.cache.set(storeKey, id, this.rawData);
    }
  }
}

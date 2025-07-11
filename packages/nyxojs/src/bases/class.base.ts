import type { Snowflake } from "@nyxojs/core";
import type { Store } from "@nyxojs/store";
import type { Client } from "../core/index.js";
import type {
  CacheEntityMapping,
  CacheEntityType,
  CacheManager,
} from "../managers/index.js";

/**
 * Represents the necessary information for caching an entity in the appropriate store.
 */
export interface CacheEntityInfo {
  /**
   * The key of the cache store where this entity should be stored.
   */
  storeKey: CacheEntityType;

  /**
   * The unique identifier used as the cache key for this entity.
   */
  id: Snowflake | null;
}

/**
 * Metadata keys used by the caching system
 */
export const METADATA_KEYS = {
  CACHE_STORE_KEY: "nyxojs:cache:storeKey",
  CACHE_KEY_EXTRACTOR: "nyxojs:cache:keyExtractor",
} as const;

/**
 * Type definition for the key extraction function
 */
export type KeyExtractor<T extends object> = (data: T) => Snowflake | null;

/**
 * Decorator that marks a class as cacheable and configures its caching behavior.
 *
 * This decorator enables automatic caching of entity data in the specified store.
 * It optionally accepts a custom key extractor function for complex identifiers.
 *
 * @param storeKey - The name of the cache store where data should be stored
 * @param keyExtractor - Optional function to extract the cache key from entity data
 */
export function Cacheable<T extends object>(
  storeKey: keyof CacheManager,
  keyExtractor: KeyExtractor<T>,
) {
  return (target: object): void => {
    // Store cache store key in metadata
    Reflect.defineMetadata(METADATA_KEYS.CACHE_STORE_KEY, storeKey, target);

    // Store key extractor function if provided
    Reflect.defineMetadata(
      METADATA_KEYS.CACHE_KEY_EXTRACTOR,
      keyExtractor,
      target,
    );
  };
}

/**
 * Base class for all data models in the Nyxo.js framework.
 *
 * The BaseClass provides a foundation for working with Discord API data entities
 * in a structured and type-safe manner. It handles automatic caching of raw data
 * through the @Cacheable decorator.
 *
 * @template T The type of data this model contains (e.g., UserEntity, ChannelEntity)
 */
export abstract class BaseClass<T extends object> {
  /**
   * Reference to the client instance.
   * Provides access to API methods and other parts of the framework.
   */
  protected client: Client;

  /**
   * The raw data object received from the Discord API.
   * This should be accessed through getter methods rather than directly.
   */
  protected rawData: T;

  /**
   * Creates a new instance of a model.
   *
   * @param client - The client instance that will be used for API requests
   * @param data - The raw data object from the Discord API
   * @throws {Error} Error if client or data is not provided
   */
  constructor(client: Client, data: T) {
    this.client = client;
    this.rawData = data;

    // Initialize cache for this entity's data
    this.#initializeCache();
  }

  /**
   * Checks if this entity's data is currently cached.
   *
   * @returns true if the data is in cache, false otherwise
   */
  get isCached(): boolean {
    const cacheInfo = this.cacheInfo;
    if (!cacheInfo) {
      return false;
    }

    const { storeKey, id } = cacheInfo;
    if (!(id && storeKey)) {
      return false;
    }

    const cacheStore = this.client.cache[storeKey] as Store<
      Snowflake,
      CacheEntityMapping[typeof storeKey]
    > | null;

    return cacheStore?.has(id) ?? false;
  }

  /**
   * Retrieves the cached data for this entity.
   *
   * @returns The cached data or null if not cached
   */
  get cachedData(): T | null {
    const cacheInfo = this.cacheInfo;
    if (!cacheInfo) {
      return null;
    }

    const { storeKey, id } = cacheInfo;
    if (!(id && storeKey)) {
      return null;
    }

    const cacheStore = this.client.cache[storeKey] as Store<
      Snowflake,
      CacheEntityMapping[typeof storeKey]
    > | null;

    return (cacheStore?.get(id) as T) ?? null;
  }

  /**
   * Checks if the data object is empty.
   *
   * @returns Whether the data object has no properties
   */
  get isEmpty(): boolean {
    return Object.keys(this.rawData).length === 0;
  }

  /**
   * Gets caching information for this entity by reading metadata from the class.
   * This information is set by the @Cacheable decorator.
   *
   * @returns Cache information containing the store key and ID, or null if the entity cannot be cached
   */
  get cacheInfo(): CacheEntityInfo | null {
    const entityConstructor = this.constructor as typeof BaseClass;

    // Get the store key from metadata
    const storeKey = Reflect.getMetadata(
      METADATA_KEYS.CACHE_STORE_KEY,
      entityConstructor,
    ) as CacheEntityType | undefined;

    // If no store key found, this class is not cacheable
    if (!storeKey) {
      return null;
    }

    // Get the key extractor function from metadata if available
    const keyExtractor = Reflect.getMetadata(
      METADATA_KEYS.CACHE_KEY_EXTRACTOR,
      entityConstructor,
    ) as KeyExtractor<T>;

    // Extract the ID using the custom extractor or fallback to default behavior
    // Use the custom key extractor
    const id = keyExtractor(this.rawData);
    return id ? { storeKey, id } : null;
  }

  /**
   * Converts this modal to a plain object with all properties.
   * The returned object is frozen to prevent accidental modification.
   *
   * @returns An immutable copy of the raw data object
   */
  toJson(): Readonly<T> {
    return Object.freeze({ ...this.rawData });
  }

  /**
   * Updates the internal data of this modal with new data.
   * This is useful when you need to update the model with fresh data from the API.
   * Also updates the cached data if it was previously cached.
   *
   * @param data - New data to merge with the existing data
   * @returns This instance for method chaining
   * @throws Error if data is not provided
   */
  patch(data: Partial<T>): this {
    this.rawData = { ...this.rawData, ...data };

    // Update cached data (not the instance)
    const cacheInfo = this.cacheInfo;
    if (cacheInfo) {
      const { storeKey, id } = cacheInfo;
      if (id && storeKey) {
        const cacheStore = this.client.cache[storeKey] as Store<
          Snowflake,
          CacheEntityMapping[typeof storeKey]
        > | null;

        // Only update if data is already in the cache
        if (cacheStore?.has(id)) {
          // Store the updated raw data, not the instance
          cacheStore.add(
            id,
            this.rawData as CacheEntityMapping[typeof storeKey],
          );
        }
      }
    }

    return this;
  }

  /**
   * Removes this entity's data from the cache if it's currently stored.
   * This method is useful when you want to explicitly remove cached data
   * from the cache without waiting for automatic eviction.
   *
   * @returns true if the data was removed from the cache, false otherwise
   */
  uncache(): boolean {
    // Get cache information for this entity
    const cacheInfo = this.cacheInfo;
    if (!cacheInfo) {
      return false;
    }

    const { storeKey, id } = cacheInfo;
    if (!(id && storeKey)) {
      return false;
    }

    // Get the appropriate cache store
    const cacheStore = this.client.cache[storeKey] as Store<
      Snowflake,
      CacheEntityMapping[typeof storeKey]
    > | null;

    // Check if the data exists in the cache before deleting it
    if (cacheStore?.has(id)) {
      return cacheStore.delete(id);
    }

    return false;
  }

  /**
   * Checks if this modal is equal to another modal.
   * The default implementation compares IDs if available, otherwise compares data.
   *
   * @param other - The other modal to compare with
   * @returns Whether the classes represent the same entity
   */
  equals(other: BaseClass<T>): boolean {
    // If both objects have an id property, compare by ID
    if ("id" in this.rawData && "id" in other.rawData) {
      return this.rawData.id === other.rawData.id;
    }

    // If no ID is available, compare all properties
    const thisKeys = Object.keys(this.rawData).sort();
    const otherKeys = Object.keys(other.rawData).sort();

    // If the number of properties is different, they are not equal
    if (thisKeys.length !== otherKeys.length) {
      return false;
    }

    // Compare each property in the sorted order
    return thisKeys.every((key) => {
      const thisValue = (this.rawData as Record<string, unknown>)[key];
      const otherValue = (other.rawData as Record<string, unknown>)[key];
      return thisValue === otherValue;
    });
  }

  /**
   * Initializes the cache for this entity's data.
   *
   * This method is automatically called when the entity is created.
   * It checks if the entity can be cached based on metadata and stores the raw data
   * (not the instance) in the appropriate cache store.
   *
   * @internal
   */
  #initializeCache(): void {
    // Automatically cache this entity's data
    const cacheInfo = this.cacheInfo;
    if (cacheInfo) {
      const { storeKey, id } = cacheInfo;
      if (id && storeKey) {
        const cacheStore = this.client.cache[storeKey] as Store<
          Snowflake,
          CacheEntityMapping[typeof storeKey]
        > | null;

        // If the cache store is not available, do nothing
        if (!cacheStore) {
          return;
        }

        // Check if data already exists in the cache
        const existingData = cacheStore.get(id);
        if (existingData) {
          // Update the existing cached data with new data
          cacheStore.add(
            id,
            this.rawData as CacheEntityMapping[typeof storeKey],
          );
        } else {
          // Data doesn't exist in cache yet, add it
          // IMPORTANT: Store rawData, not 'this'
          cacheStore.set(
            id,
            this.rawData as CacheEntityMapping[typeof storeKey],
          );
        }
      }
    }
  }
}

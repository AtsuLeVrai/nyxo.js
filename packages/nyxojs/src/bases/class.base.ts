import type { Snowflake } from "@nyxojs/core";
import type { Store } from "@nyxojs/store";
import type { Client } from "../core/index.js";
import type { CacheEntityType, CacheManager } from "../managers/index.js";

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
const METADATA_KEYS = {
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
 * This decorator enables automatic caching of entity instances in the specified store.
 * It optionally accepts a custom key extractor function for complex identifiers.
 *
 * @param storeKey - The name of the cache store where instances should be stored
 * @param keyExtractor - Optional function to extract the cache key from entity data
 */
export function Cacheable<T extends object>(
  storeKey: keyof CacheManager,
  keyExtractor?: KeyExtractor<T>,
) {
  return (target: object): void => {
    // Store cache store key in metadata
    Reflect.defineMetadata(METADATA_KEYS.CACHE_STORE_KEY, storeKey, target);

    // Store key extractor function if provided
    if (keyExtractor) {
      Reflect.defineMetadata(
        METADATA_KEYS.CACHE_KEY_EXTRACTOR,
        keyExtractor,
        target,
      );
    }
  };
}

/**
 * Base class for all data models in the Nyxo.js framework.
 *
 * The BaseClass provides a foundation for working with Discord API data entities
 * in a structured and type-safe manner. It handles automatic caching through the
 * @Cacheable decorator.
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

    // Automatically cache this entity
    const cacheInfo = this.getCacheInfo();
    if (cacheInfo) {
      const { storeKey, id } = cacheInfo;
      if (id && storeKey) {
        const cacheStore = client.cache[storeKey] as unknown as Store<
          Snowflake,
          this
        >;

        // Check if this entity already exists in the cache
        const existingEntity = cacheStore.get(id);
        if (existingEntity) {
          // Update the existing cached entity with new data
          existingEntity.patch(data);
        } else {
          // Entity doesn't exist in cache yet, add it
          cacheStore.set(id, this);
        }
      }
    }
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
   * Also updates the entity in cache if it was previously cached.
   *
   * @param data - New data to merge with the existing data
   * @returns This instance for method chaining
   * @throws Error if data is not provided
   */
  patch(data: Partial<T>): this {
    Object.assign(this.rawData, data);

    // Update entity in cache
    const cacheInfo = this.getCacheInfo();
    if (cacheInfo) {
      const { storeKey, id } = cacheInfo;
      if (id && storeKey) {
        const cacheStore = this.client.cache[storeKey] as unknown as Store<
          Snowflake,
          this
        >;

        // Only update if this entity is already in the cache
        if (cacheStore.has(id)) {
          cacheStore.add(id, this);
        }
      }
    }

    return this;
  }

  /**
   * Removes this entity from the cache if it's currently stored.
   * This method is useful when you want to explicitly remove an entity
   * from the cache without waiting for automatic eviction.
   *
   * @returns true if the entity was removed from the cache, false otherwise
   */
  uncache(): boolean {
    // Get cache information for this entity
    const cacheInfo = this.getCacheInfo();
    if (!cacheInfo) {
      return false;
    }

    const { storeKey, id } = cacheInfo;
    if (!(id && storeKey)) {
      return false;
    }

    // Get the appropriate cache store
    const cacheStore = this.client.cache[storeKey] as unknown as Store<
      Snowflake,
      this
    >;

    // Check if the entity exists in the cache before deleting it
    if (cacheStore.has(id)) {
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

    // Otherwise, compare the full data objects
    return JSON.stringify(this.rawData) === JSON.stringify(other.rawData);
  }

  /**
   * Checks if the data object is empty.
   *
   * @returns Whether the data object has no properties
   */
  isEmpty(): boolean {
    return Object.keys(this.rawData).length === 0;
  }

  /**
   * Gets caching information for this entity by reading metadata from the class.
   * This information is set by the @Cacheable decorator.
   *
   * @returns Cache information containing the store key and ID, or null if the entity cannot be cached
   */
  getCacheInfo(): CacheEntityInfo | null {
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
    ) as KeyExtractor<T> | undefined;

    // Extract the ID using the custom extractor or fallback to default behavior
    let id: Snowflake | null = null;

    if (keyExtractor) {
      // Use the custom key extractor
      id = keyExtractor(this.rawData);
    } else if ("id" in this.rawData) {
      // Default behavior: use the id property if available
      id =
        typeof this.rawData.id === "string"
          ? this.rawData.id
          : String(this.rawData.id);
    }

    return id ? { storeKey, id } : null;
  }
}

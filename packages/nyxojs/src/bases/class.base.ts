import type { Snowflake } from "@nyxojs/core";
import type { Store } from "@nyxojs/store";
import type { Client } from "../core/index.js";
import type { CacheManager } from "../managers/index.js";

/**
 * Represents the necessary information for caching an entity in the appropriate store.
 */
export interface CacheEntityInfo {
  /**
   * The key of the cache store where this entity should be stored.
   */
  storeKey: keyof CacheManager;

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
type KeyExtractor<T extends object> = (data: T) => Snowflake | null;

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
  protected data: T;

  /**
   * Creates a new instance of a model.
   *
   * @param client - The client instance that will be used for API requests
   * @param data - The raw data object from the Discord API
   * @throws {Error} Error if client or data is not provided
   */
  constructor(client: Client, data: T) {
    this.client = client;
    this.data = data;

    // Automatically cache this entity if caching is enabled
    if (client.options.cache.enabled) {
      const cacheInfo = this.#getCacheInfo();
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
            existingEntity.update(data);
          } else {
            // Entity doesn't exist in cache yet, add it
            cacheStore.set(id, this);
          }
        }
      }
    }

    // Initialize all getters to trigger their creation
    this.#initAllGetters();
  }

  /**
   * Returns the raw data for debugging purposes.
   * This is useful for development and debugging but should be avoided in production code.
   *
   * @returns The raw data object
   */
  get rawData(): T {
    return this.data;
  }

  /**
   * Converts this modal to a plain object with all properties.
   * The returned object is frozen to prevent accidental modification.
   *
   * @returns An immutable copy of the raw data object
   */
  toJson(): Readonly<T> {
    return Object.freeze({ ...this.data });
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
  update(data: Partial<T>): this {
    Object.assign(this.data, data);

    // Update entity in cache if caching is enabled
    if (this.client.options.cache.enabled) {
      const cacheInfo = this.#getCacheInfo();
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
  delete(): boolean {
    // Do nothing if caching is disabled
    if (!this.client.options.cache.enabled) {
      return false;
    }

    // Get cache information for this entity
    const cacheInfo = this.#getCacheInfo();
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
   * Creates a deep clone of this modal.
   *
   * @returns A new instance with the same data
   */
  clone(): this {
    // @ts-expect-error: This is safe because we're creating the same class type
    return new this.constructor(this.client, structuredClone(this.data));
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
    if ("id" in this.data && "id" in other.data) {
      return this.data.id === other.data.id;
    }

    // Otherwise, compare the full data objects
    return JSON.stringify(this.data) === JSON.stringify(other.data);
  }

  /**
   * Checks if the data object is empty.
   *
   * @returns Whether the data object has no properties
   */
  isEmpty(): boolean {
    return Object.keys(this.data).length === 0;
  }

  /**
   * Checks if this modal has a specific property in its data.
   *
   * @param key - The property name to check for
   * @returns Whether the property exists and is not null/undefined
   */
  has<K extends keyof T>(key: K): boolean {
    return key in this.data && this.data[key] != null;
  }

  /**
   * Safely gets a property value from the data object.
   *
   * @param key - The property name to get
   * @param defaultValue - Optional default value if the property doesn't exist
   * @returns The property value or the default value
   */
  get<K extends keyof T>(key: K, defaultValue?: T[K]): T[K] {
    return this.has(key) ? this.data[key] : (defaultValue as T[K]);
  }

  /**
   * Gets caching information for this entity by reading metadata from the class.
   * This information is set by the @Cacheable decorator.
   *
   * @returns Cache information containing the store key and ID, or null if the entity cannot be cached
   * @private
   */
  #getCacheInfo(): CacheEntityInfo | null {
    const entityConstructor = this.constructor as typeof BaseClass;

    // Get the store key from metadata
    const storeKey = Reflect.getMetadata(
      METADATA_KEYS.CACHE_STORE_KEY,
      entityConstructor,
    ) as keyof CacheManager | undefined;

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
      id = keyExtractor(this.data);
    } else if ("id" in this.data) {
      // Default behavior: use the id property if available
      id =
        typeof this.data.id === "string" ? this.data.id : String(this.data.id);
    }

    return id ? { storeKey, id } : null;
  }

  /**
   * Initializes all getter properties defined in the derived class.
   *
   * This private method triggers the execution of all getters to ensure they are
   * properly initialized during object construction, which can be important for
   * caching and other initialization side effects.
   *
   * @private
   */
  #initAllGetters(): void {
    // Get all property descriptors from the prototype chain
    const proto = Object.getPrototypeOf(this);
    const propertyDescriptors = Object.getOwnPropertyDescriptors(proto);
    const baseClassDescriptors = Object.getOwnPropertyDescriptors(
      BaseClass.prototype,
    );

    // Only process true getter properties (properties with a get function but no set function)
    for (const [propName, descriptor] of Object.entries(propertyDescriptors)) {
      const isGetter = typeof descriptor.get === "function";
      const isNotFromBaseClass = !Object.hasOwn(baseClassDescriptors, propName);
      const isNotSpecialProperty = ![
        "constructor",
        "prototype",
        "__proto__",
      ].includes(propName);

      if (isGetter && isNotFromBaseClass && isNotSpecialProperty) {
        try {
          // Access the getter to trigger initialization
          // Using type assertion with keyof for type safety
          const propertyKey = propName as keyof this;
          void this[propertyKey];
        } catch {
          // Ignore errors during getter initialization
        }
      }
    }
  }
}

import type { Snowflake } from "@nyxjs/core";
import type { Store } from "@nyxjs/store";
import type { Client } from "../core/index.js";
import type { CacheManager } from "../managers/index.js";

/**
 * Represents the necessary information for caching an entity in the appropriate store.
 *
 * This interface defines the structure that must be returned by any class implementing
 * the `getCacheInfo()` method to support automatic caching in the Nyx.js framework.
 *
 * When an entity cannot or should not be cached (e.g., standard emojis without an ID),
 * the implementation should return `null` instead of this structure.
 *
 * @example
 * ```typescript
 * // Implementing getCacheInfo in an entity class
 * protected getCacheInfo(): CacheEntityInfo | null {
 *   if (this.id) {
 *     return {
 *       storeKey: 'users',
 *       id: this.id
 *     };
 *   }
 *   return null; // Cannot be cached
 * }
 * ```
 */
export interface CacheEntityInfo {
  /**
   * The key of the cache store where this entity should be stored.
   * This must be a valid key in the CacheManager (e.g., 'users', 'guilds', 'emojis').
   *
   * @example 'messages' | 'channels' | 'guilds'
   */
  storeKey: keyof CacheManager;

  /**
   * The unique identifier used as the cache key for this entity.
   * This is typically the entity's Discord ID (Snowflake).
   *
   * If the ID is null, the entity will not be cached even if storeKey is provided.
   * This can happen for entities that don't have stable identifiers or
   * for special cases like standard emojis.
   *
   * @example '123456789012345678'
   */
  id: Snowflake | null;
}

/**
 * Base class for all data models in the Nyx.js framework.
 *
 * The BaseClass provides a foundation for working with Discord API data entities
 * in a structured and type-safe manner. It encapsulates the raw data received from the API
 * and provides common utility methods for manipulating and accessing this data.
 *
 * All entity classes in the framework (such as User, Channel, Guild, etc.) inherit from this base class.
 *
 * @template T The type of data this model contains (e.g., UserEntity, ChannelEntity)
 *
 * @example
 * ```typescript
 * class User extends BaseClass<UserEntity> {
 *   get id(): Snowflake {
 *     return this.data.id;
 *   }
 *
 *   get username(): string {
 *     return this.data.username;
 *   }
 *
 *   protected getCacheInfo() {
 *     return { storeKey: 'users', id: this.id };
 *   }
 * }
 *
 * const user = new User(client, userData).cache();
 * console.log(user.username);
 * ```
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
   * @throws Error if client or data is not provided
   */
  constructor(client: Client, data: T) {
    this.client = client;
    this.data = data;

    // Automatically cache this entity if caching is enabled
    if (client.options.cache.enabled) {
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
   * Creates a new instance from raw data.
   * This static method provides a more elegant way to create instances.
   *
   * @param client - The client instance that will be used for API requests
   * @param data - The raw data object from the Discord API
   * @returns A new instance of the class
   * @static
   *
   * @example
   * ```typescript
   * // Instead of:
   * const user = new User(client, userData);
   *
   * // You can use:
   * const user = User.from(client, userData);
   *
   * // This is especially useful when working with arrays:
   * const users = userDataArray.map(data => User.from(client, data));
   * ```
   */
  static from<S extends object>(
    this: new (
      client: Client,
      data: S,
      // @ts-expect-error: This is safe because we're creating the same class type
    ) => InstanceType<typeof this>,
    client: Client,
    data: S,
  ): InstanceType<typeof this> {
    // biome-ignore lint/complexity/noThisInStatic: This is safe because we're creating the same class type
    return new this(client, data);
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
    }

    return this;
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
   * Returns a string representation of this modal.
   * Override this method in derived classes to provide a more specific representation.
   *
   * @returns A string representation of this modal
   */
  toString(): string {
    // If the data has an id property, include it in the string
    if ("id" in this.data) {
      return `${this.constructor.name}(${this.data.id})`;
    }

    return this.constructor.name;
  }

  /**
   * Abstract method that derived classes must implement to define how they
   * should be cached. If an entity should not be cached (e.g., a standard emoji
   * with no ID), this method should return null.
   *
   * @returns Cache information containing the store key and ID, or null if the entity cannot be cached
   */
  protected abstract getCacheInfo(): CacheEntityInfo | null;

  /**
   * Initializes all getter properties defined in the derived class.
   *
   * This private method triggers the execution of all getters to ensure they are
   * properly initialized during object construction, which can be important for
   * caching and other initialization side effects.
   *
   * It intelligently filters out base class getters and special JavaScript properties
   * to avoid unnecessary or potentially harmful initialization.
   *
   * Any errors during getter initialization are safely caught and ignored,
   * preventing constructor failures while still allowing the rest of the
   * initialization process to continue.
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
      const isNotFromBaseClass = !Object.prototype.hasOwnProperty.call(
        baseClassDescriptors,
        propName,
      );
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
          // biome-ignore lint/complexity/noVoid: This is safe because we're accessing a getter
          void this[propertyKey];
        } catch {
          // Ignore errors during getter initialization
        }
      }
    }
  }
}

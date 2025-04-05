import type { Snowflake } from "@nyxjs/core";
import type { Client } from "../core/index.js";

/**
 * Base class for all data models in the Nyx framework.
 *
 * The BaseModal class provides a foundation for working with Discord API data entities
 * in a structured and type-safe manner. It encapsulates the raw data received from the API
 * and provides common utility methods for manipulating and accessing this data.
 *
 * All entity classes in the framework (such as User, Channel, Guild, etc.) inherit from this base class.
 *
 * @template T The type of data this model contains (e.g., UserEntity, ChannelEntity)
 *
 * @example
 * ```typescript
 * class User extends BaseModal<UserEntity> {
 *   get id(): Snowflake {
 *     return this.data.id;
 *   }
 *
 *   get username(): string {
 *     return this.data.username;
 *   }
 * }
 *
 * const user = new User(client, userData);
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
  static from<S extends object, Q extends BaseClass<S>>(
    this: new (
      client: Client,
      data: S,
    ) => Q,
    client: Client,
    data: S,
  ): Q {
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
   *
   * @param data - New data to merge with the existing data
   * @returns This instance for method chaining
   * @throws Error if data is not provided
   */
  update(data: Partial<T>): this {
    Object.assign(this.data, data);
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
      return (
        (this.data as unknown as { id: Snowflake }).id ===
        (other.data as unknown as { id: Snowflake }).id
      );
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
      return `${this.constructor.name}(${(this.data as unknown as { id: Snowflake }).id})`;
    }

    return this.constructor.name;
  }
}

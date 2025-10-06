import type { Rest } from "../rest/index.js";

/**
 * Thread-safe base class for Discord entities with immutable data access.
 * Provides shared functionality for all Discord object wrappers.
 *
 * @typeParam T - Discord API object type for the entity
 */
export abstract class BaseClass<T extends object> {
  /**
   * @private
   * REST client instance for API requests
   */
  protected readonly rest: Rest;

  /**
   * @private
   * Immutable reference to underlying Discord API data.
   */
  protected readonly data: Readonly<T>;

  /**
   * Creates new entity instance from Discord API data.
   *
   * @param rest - REST client instance for API requests
   * @param data - Raw Discord API object data
   */
  constructor(rest: Rest, data: T) {
    this.rest = rest;
    this.data = Object.freeze(data);
  }
}

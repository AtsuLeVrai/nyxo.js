import type { Rest } from "../core/index.js";

/**
 * Base abstract class for API routers
 * Provides common functionality for all router classes
 */
export abstract class BaseRouter {
  /** The REST client used for making API requests */
  protected readonly rest: Rest;

  /**
   * Creates a new Router instance
   * @param rest - The REST client to use for making API requests
   */
  constructor(rest: Rest) {
    this.rest = rest;
  }
}

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

  /**
   * Format a route with parameters
   * @param route - Route template with placeholders
   * @param params - Object containing parameter values
   * @returns Formatted route string
   * @example
   * // Returns "/applications/123456789/entitlements"
   * formatRoute("/applications/:applicationId/entitlements", { applicationId: "123456789" })
   */
  formatRoute(route: string, params: Record<string, string>): string {
    let formattedRoute = route;

    for (const [key, value] of Object.entries(params)) {
      formattedRoute = formattedRoute.replace(`:${key}`, value);
    }

    return formattedRoute;
  }
}

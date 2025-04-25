import type { SkuEntity, Snowflake } from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Router for Discord SKU (Stock Keeping Unit) related endpoints.
 * Provides methods to interact with Discord's monetization platform offerings.
 *
 * @see {@link https://discord.com/developers/docs/resources/sku}
 */
export class SkuRouter {
  /**
   * API route constants for SKU-related endpoints.
   */
  static readonly SKU_ROUTES = {
    /**
     * Route for application SKUs collection.
     * @param applicationId - The ID of the application
     */
    applicationSkusEndpoint: (applicationId: Snowflake) =>
      `/applications/${applicationId}/skus` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new SKU Router instance.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches all SKUs for a given application.
   * Retrieves subscription offerings, durable items, and consumable items.
   *
   * @param applicationId - The ID of the application to list SKUs for
   * @returns A promise resolving to an array of SKU entities
   * @see {@link https://discord.com/developers/docs/resources/sku#list-skus}
   */
  fetchApplicationSkus(applicationId: Snowflake): Promise<SkuEntity[]> {
    return this.#rest.get(
      SkuRouter.SKU_ROUTES.applicationSkusEndpoint(applicationId),
    );
  }
}

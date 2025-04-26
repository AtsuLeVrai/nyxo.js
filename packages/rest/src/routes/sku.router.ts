import type { SkuEntity, Snowflake } from "@nyxojs/core";
import { BaseRouter } from "../bases/index.js";
/**
 * Router for Discord SKU (Stock Keeping Unit) related endpoints.
 * Provides methods to interact with Discord's monetization platform offerings.
 *
 * @see {@link https://discord.com/developers/docs/resources/sku}
 */
export class SkuRouter extends BaseRouter {
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

  /**
   * Fetches all SKUs for a given application.
   * Retrieves subscription offerings, durable items, and consumable items.
   *
   * @param applicationId - The ID of the application to list SKUs for
   * @returns A promise resolving to an array of SKU entities
   * @see {@link https://discord.com/developers/docs/resources/sku#list-skus}
   */
  fetchApplicationSkus(applicationId: Snowflake): Promise<SkuEntity[]> {
    return this.get(
      SkuRouter.SKU_ROUTES.applicationSkusEndpoint(applicationId),
    );
  }
}

import { BaseRouter } from "../../bases/index.js";
import type { RouteBuilder } from "../../core/index.js";
import type { SKUEntity } from "./sku.entity.js";

/**
 * @description Discord API endpoints for SKU operations with type-safe route building.
 * @see {@link https://discord.com/developers/docs/resources/sku}
 */
export const SKURoutes = {
  listSKUs: (applicationId: string) => `/applications/${applicationId}/skus` as const,
} as const satisfies RouteBuilder;

/**
 * @description Zero-cache Discord SKU API client with direct REST operations for monetization management.
 * @see {@link https://discord.com/developers/docs/resources/sku}
 */
export class SKURouter extends BaseRouter {
  /**
   * @description Retrieves all SKUs for a given application including both subscription types.
   * @see {@link https://discord.com/developers/docs/resources/sku#list-skus}
   *
   * @param applicationId - Snowflake ID of the application to fetch SKUs for
   * @returns Promise resolving to array of SKU objects (includes both type 5 and type 6 for subscriptions)
   */
  listSKUs(applicationId: string): Promise<SKUEntity[]> {
    return this.rest.get(SKURoutes.listSKUs(applicationId));
  }
}

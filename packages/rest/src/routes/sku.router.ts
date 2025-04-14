import type { SkuEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";

/**
 * Router class for handling Discord SKU (Stock Keeping Unit) endpoints.
 *
 * SKUs in Discord represent premium offerings that can be made available to
 * an application's users or guilds. They can be subscriptions (both user and guild),
 * durable, or consumable items.
 *
 * Currently, this router only supports listing SKUs for an application.
 *
 * @see {@link https://discord.com/developers/docs/resources/sku}
 */
export class SkuRouter {
  /**
   * Collection of route patterns for SKU-related endpoints.
   */
  static readonly ROUTES = {
    /**
     * Route for application SKUs collection.
     * @param applicationId - The ID of the application
     * @returns The endpoint path
     */
    applicationSkus: (applicationId: Snowflake) =>
      `/applications/${applicationId}/skus` as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Lists all SKUs for a given application.
   *
   * This endpoint returns all SKUs associated with the application, including
   * subscription offerings. For subscriptions, you will see two SKUs:
   * - One with type 5 (SUBSCRIPTION)
   * - One with type 6 (SUBSCRIPTION_GROUP)
   *
   * For integration and testing entitlements for Subscriptions, you should use
   * the SKU with type 5 (SUBSCRIPTION).
   *
   * @param applicationId - The ID of the application to list SKUs for
   * @returns A promise resolving to an array of SKU entities
   * @see {@link https://discord.com/developers/docs/resources/sku#list-skus}
   */
  listSkus(applicationId: Snowflake): Promise<SkuEntity[]> {
    return this.#rest.get(SkuRouter.ROUTES.applicationSkus(applicationId));
  }
}

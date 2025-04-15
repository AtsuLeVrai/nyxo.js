import type { SkuEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";

/**
 * Router for Discord SKU (Stock Keeping Unit) related endpoints.
 *
 * This class provides methods to interact with Discord's SKU system, which represents
 * premium offerings available to users and guilds in Discord's monetization platform.
 * SKUs are the purchasable items that can be monetized through Discord's app store.
 *
 * @remarks
 * SKUs in Discord represent premium offerings that can be made available to
 * an application's users or guilds. They can be one of several types:
 * - Subscriptions (both user and guild)
 * - Durable items (permanent one-time purchases)
 * - Consumable items (one-time purchases that can be "used up")
 *
 * Applications use SKUs and entitlements to grant access to premium features.
 * Entitlements represent a user's or guild's access to a specific SKU.
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
     * Used to list all SKUs available for an application.
     *
     * @param applicationId - The ID of the application
     * @returns The formatted API route string
     */
    applicationSkusEndpoint: (applicationId: Snowflake) =>
      `/applications/${applicationId}/skus` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new SKU Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches all SKUs for a given application.
   *
   * This method retrieves all SKUs associated with the application, including
   * subscription offerings, durable items, and consumable items. These SKUs
   * represent the premium offerings that can be purchased by users or guilds.
   *
   * @param applicationId - The ID of the application to list SKUs for
   * @returns A promise resolving to an array of SKU entities
   *
   * @see {@link https://discord.com/developers/docs/resources/sku#list-skus}
   *
   * @example
   * ```typescript
   * // Fetch all SKUs for your application
   * const skus = await skuRouter.fetchApplicationSkus("123456789012345678");
   *
   * console.log(`Found ${skus.length} SKUs for this application`);
   *
   * // Group SKUs by type
   * const subscriptions = skus.filter(sku => sku.type === 5); // SUBSCRIPTION
   * const subscriptionGroups = skus.filter(sku => sku.type === 6); // SUBSCRIPTION_GROUP
   * const consumables = skus.filter(sku => sku.type === 1); // CONSUMABLE
   * const durables = skus.filter(sku => sku.type === 2); // DURABLE
   *
   * console.log(`Subscription SKUs: ${subscriptions.length}`);
   * console.log(`Subscription Groups: ${subscriptionGroups.length}`);
   * console.log(`Consumable SKUs: ${consumables.length}`);
   * console.log(`Durable SKUs: ${durables.length}`);
   *
   * // For testing with entitlements for Subscriptions, use the SKU with type 5
   * if (subscriptions.length > 0) {
   *   console.log("Use this SKU ID for subscription testing:", subscriptions[0].id);
   * }
   * ```
   *
   * @remarks
   * For subscriptions, you will see two SKUs:
   * - One with type 5 (SUBSCRIPTION)
   * - One with type 6 (SUBSCRIPTION_GROUP)
   *
   * For integration and testing entitlements for Subscriptions, you should use
   * the SKU with type 5 (SUBSCRIPTION).
   */
  fetchApplicationSkus(applicationId: Snowflake): Promise<SkuEntity[]> {
    return this.#rest.get(
      SkuRouter.SKU_ROUTES.applicationSkusEndpoint(applicationId),
    );
  }
}

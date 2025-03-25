import type { Snowflake, SubscriptionEntity } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type { SubscriptionQuerySchema } from "../schemas/index.js";

/**
 * Router class for handling Discord Subscription endpoints.
 *
 * Subscriptions in Discord represent a user making recurring payments for at least
 * one SKU over an ongoing period. Successful payments grant the user access to
 * entitlements associated with the SKU.
 *
 * Important considerations:
 * - The start of a subscription is determined by its ID
 * - When a subscription renews, its current period is updated
 * - If a user cancels, the subscription enters the ENDING status and canceled_at is set
 * - Subscription status should not be used to grant perks; use entitlements instead
 * - Subscriptions can change states within the current period (e.g., due to payment issues or refunds)
 *
 * @see {@link https://discord.com/developers/docs/resources/subscription}
 */
export class SubscriptionRouter {
  /**
   * Collection of route patterns for subscription-related endpoints.
   */
  static readonly ROUTES = {
    /**
     * Route for SKU subscriptions collection.
     * @param skuId - The ID of the SKU
     * @returns The endpoint path
     */
    skuSubscriptionsBase: (skuId: Snowflake) =>
      `/skus/${skuId}/subscriptions` as const,

    /**
     * Route for a specific SKU subscription.
     * @param skuId - The ID of the SKU
     * @param subscriptionId - The ID of the subscription
     * @returns The endpoint path
     */
    skuSubscription: (skuId: Snowflake, subscriptionId: Snowflake) =>
      `/skus/${skuId}/subscriptions/${subscriptionId}` as const,
  } as const;

  /**
   * The REST client used to make API requests.
   */
  readonly #rest: Rest;

  /**
   * Creates a new instance of the SubscriptionRouter.
   * @param rest - The REST client to use for API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Lists all subscriptions containing the specified SKU.
   *
   * Returns subscriptions filtered by user ID. The user_id parameter is required
   * except when making OAuth queries.
   *
   * Results can be paginated using the before and after parameters, and the
   * number of results can be limited using the limit parameter.
   *
   * @param skuId - The ID of the SKU to list subscriptions for
   * @param query - Query parameters for filtering and pagination
   * @returns A promise resolving to an array of subscription entities
   * @throws Error if the query parameters are invalid
   * @see {@link https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions}
   */
  listSkuSubscriptions(
    skuId: Snowflake,
    query: SubscriptionQuerySchema = {},
  ): Promise<SubscriptionEntity[]> {
    return this.#rest.get(
      SubscriptionRouter.ROUTES.skuSubscriptionsBase(skuId),
      {
        query,
      },
    );
  }

  /**
   * Gets a specific subscription by its ID for a given SKU.
   *
   * @param skuId - The ID of the SKU associated with the subscription
   * @param subscriptionId - The ID of the subscription to retrieve
   * @returns A promise resolving to the subscription entity
   * @see {@link https://discord.com/developers/docs/resources/subscription#get-sku-subscription}
   */
  getSkuSubscription(
    skuId: Snowflake,
    subscriptionId: Snowflake,
  ): Promise<SubscriptionEntity> {
    return this.#rest.get(
      SubscriptionRouter.ROUTES.skuSubscription(skuId, subscriptionId),
    );
  }
}

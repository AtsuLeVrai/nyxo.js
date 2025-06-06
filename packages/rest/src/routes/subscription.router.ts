import type { Snowflake, SubscriptionEntity } from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for query parameters when listing SKU subscriptions.
 * Allows filtering and pagination of subscription results.
 *
 * @see {@link https://discord.com/developers/docs/resources/subscription#query-string-params}
 */
export interface SubscriptionFetchParams {
  /**
   * List subscriptions before this ID.
   * Returns subscriptions with IDs that come before this value.
   */
  before?: Snowflake;

  /**
   * List subscriptions after this ID.
   * Returns subscriptions with IDs that come after this value.
   */
  after?: Snowflake;

  /**
   * Number of results to return (1-100).
   * Defaults to 50 if not specified.
   */
  limit?: number;

  /**
   * User ID for which to return subscriptions.
   * Required for application access token requests.
   */
  user_id?: Snowflake;
}

/**
 * Router for Discord Subscription-related endpoints.
 * Manages subscriptions for premium offerings and recurring monetization.
 *
 * @see {@link https://discord.com/developers/docs/resources/subscription}
 */
export class SubscriptionRouter {
  /**
   * API route constants for subscription-related endpoints.
   */
  static readonly SUBSCRIPTION_ROUTES = {
    /**
     * Route for SKU subscriptions collection.
     * @param skuId - The ID of the SKU
     */
    skuSubscriptionsEndpoint: (skuId: Snowflake) =>
      `/skus/${skuId}/subscriptions` as const,

    /**
     * Route for a specific SKU subscription.
     * @param skuId - The ID of the SKU
     * @param subscriptionId - The ID of the subscription
     */
    skuSubscriptionByIdEndpoint: (
      skuId: Snowflake,
      subscriptionId: Snowflake,
    ) => `/skus/${skuId}/subscriptions/${subscriptionId}` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new instance of a router.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches all subscriptions containing the specified SKU.
   * Retrieves both active and inactive subscriptions with optional filtering.
   *
   * @param skuId - The ID of the SKU to list subscriptions for
   * @param query - Query parameters for filtering and pagination
   * @returns A promise resolving to an array of subscription entities
   * @see {@link https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions}
   */
  fetchSubscriptions(
    skuId: Snowflake,
    query?: SubscriptionFetchParams,
  ): Promise<SubscriptionEntity[]> {
    return this.#rest.get(
      SubscriptionRouter.SUBSCRIPTION_ROUTES.skuSubscriptionsEndpoint(skuId),
      { query },
    );
  }

  /**
   * Fetches a specific subscription by its ID for a given SKU.
   * Retrieves detailed information about a single subscription.
   *
   * @param skuId - The ID of the SKU associated with the subscription
   * @param subscriptionId - The ID of the subscription to retrieve
   * @returns A promise resolving to the subscription entity
   * @see {@link https://discord.com/developers/docs/resources/subscription#get-sku-subscription}
   */
  fetchSubscription(
    skuId: Snowflake,
    subscriptionId: Snowflake,
  ): Promise<SubscriptionEntity> {
    return this.#rest.get(
      SubscriptionRouter.SUBSCRIPTION_ROUTES.skuSubscriptionByIdEndpoint(
        skuId,
        subscriptionId,
      ),
    );
  }
}

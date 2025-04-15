import type { Snowflake, SubscriptionEntity } from "@nyxjs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for query parameters when listing SKU subscriptions.
 *
 * These parameters allow filtering and pagination of subscription results
 * when retrieving subscriptions for a specific SKU. They help you efficiently
 * navigate through subscription data, especially for popular SKUs with many subscribers.
 *
 * @see {@link https://discord.com/developers/docs/resources/subscription#query-string-params}
 */
export interface SubscriptionQuerySchema {
  /**
   * List subscriptions before this ID.
   *
   * When specified, returns subscriptions with IDs that come before this value,
   * ordered by ID in descending order (newer first). Used for backward pagination.
   */
  before?: Snowflake;

  /**
   * List subscriptions after this ID.
   *
   * When specified, returns subscriptions with IDs that come after this value,
   * ordered by ID in ascending order (older first). Used for forward pagination.
   */
  after?: Snowflake;

  /**
   * Number of results to return (1-100).
   *
   * Controls how many subscription objects are returned in a single request.
   * Defaults to 50 if not specified.
   */
  limit?: number;

  /**
   * User ID for which to return subscriptions.
   *
   * When specified, only returns subscriptions belonging to this user.
   * Required for application access token requests.
   * Not required for OAuth2 token requests (where the user is implicit).
   */
  user_id?: Snowflake;
}

/**
 * Router for Discord Subscription-related endpoints.
 *
 * This class provides methods to interact with Discord's subscription system,
 * which enables recurring monetization for applications through premium offerings.
 * Subscriptions represent a user's ongoing paid access to premium features or content.
 *
 * @remarks
 * Subscriptions in Discord represent a user making recurring payments for at least
 * one SKU over an ongoing period. Successful payments grant the user access to
 * entitlements associated with the SKU.
 *
 * Important considerations about subscription lifecycle:
 * - The start of a subscription is determined by its ID (which is a Snowflake with a timestamp)
 * - When a subscription renews, its current_period fields are updated
 * - If a user cancels, the subscription enters the ENDING status and canceled_at is set
 * - Subscription status should not be used to grant perks; use entitlements instead
 * - Subscriptions can change states within the current period (e.g., due to payment issues or refunds)
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
     *
     * @param skuId - The ID of the SKU
     * @returns The formatted API route string
     */
    skuSubscriptionsEndpoint: (skuId: Snowflake) =>
      `/skus/${skuId}/subscriptions` as const,

    /**
     * Route for a specific SKU subscription.
     *
     * @param skuId - The ID of the SKU
     * @param subscriptionId - The ID of the subscription
     * @returns The formatted API route string
     */
    skuSubscriptionByIdEndpoint: (
      skuId: Snowflake,
      subscriptionId: Snowflake,
    ) => `/skus/${skuId}/subscriptions/${subscriptionId}` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Subscription Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches all subscriptions containing the specified SKU.
   *
   * This method retrieves a list of active and inactive subscriptions for a specific
   * premium offering (SKU), with optional filtering by user and pagination support.
   *
   * @param skuId - The ID of the SKU to list subscriptions for
   * @param query - Query parameters for filtering and pagination
   * @returns A promise resolving to an array of subscription entities
   * @throws Error if the query parameters are invalid or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions}
   *
   * @example
   * ```typescript
   * // Fetch all subscriptions for a specific SKU and user
   * const userSubscriptions = await subscriptionRouter.fetchSkuSubscriptions(
   *   "123456789012345678", // SKU ID
   *   {
   *     user_id: "234567890123456789", // User ID
   *     limit: 25
   *   }
   * );
   *
   * console.log(`Found ${userSubscriptions.length} subscriptions`);
   *
   * // Check for active subscriptions
   * const activeSubscriptions = userSubscriptions.filter(
   *   sub => sub.status === 1 // ACTIVE status
   * );
   *
   * if (activeSubscriptions.length > 0) {
   *   console.log("User has active subscriptions:");
   *   activeSubscriptions.forEach(sub => {
   *     const renewalDate = new Date(sub.current_period_end);
   *     console.log(`- Subscription ID: ${sub.id}`);
   *     console.log(`  Next renewal: ${renewalDate.toLocaleDateString()}`);
   *     console.log(`  Payment source: ${sub.payment_source_id}`);
   *   });
   * }
   *
   * // Paginate through all subscriptions for a SKU
   * let allSubscriptions = [];
   * let lastId = null;
   *
   * // Basic pagination example
   * async function fetchAllSubscriptions() {
   *   let batch;
   *   do {
   *     const query = lastId ? { after: lastId, limit: 100 } : { limit: 100 };
   *     batch = await subscriptionRouter.fetchSkuSubscriptions("123456789012345678", query);
   *
   *     allSubscriptions = allSubscriptions.concat(batch);
   *
   *     if (batch.length > 0) {
   *       lastId = batch[batch.length - 1].id;
   *     }
   *   } while (batch.length === 100);
   *
   *   console.log(`Retrieved a total of ${allSubscriptions.length} subscriptions`);
   * }
   * ```
   *
   * @note The user_id parameter is required except when making OAuth queries.
   */
  fetchSkuSubscriptions(
    skuId: Snowflake,
    query: SubscriptionQuerySchema = {},
  ): Promise<SubscriptionEntity[]> {
    return this.#rest.get(
      SubscriptionRouter.SUBSCRIPTION_ROUTES.skuSubscriptionsEndpoint(skuId),
      {
        query,
      },
    );
  }

  /**
   * Fetches a specific subscription by its ID for a given SKU.
   *
   * This method retrieves detailed information about a single subscription,
   * including its current status, renewal dates, and payment details.
   *
   * @param skuId - The ID of the SKU associated with the subscription
   * @param subscriptionId - The ID of the subscription to retrieve
   * @returns A promise resolving to the subscription entity
   * @throws Will throw an error if the subscription doesn't exist or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/subscription#get-sku-subscription}
   *
   * @example
   * ```typescript
   * // Fetch a specific subscription
   * try {
   *   const subscription = await subscriptionRouter.fetchSkuSubscription(
   *     "123456789012345678", // SKU ID
   *     "987654321987654321"  // Subscription ID
   *   );
   *
   *   // Convert subscription status to human-readable form
   *   const statusNames = {
   *     1: "ACTIVE",
   *     2: "CANCELLED",
   *     3: "ENDED",
   *     4: "IDLE",
   *     5: "PAUSED"
   *   };
   *
   *   console.log(`Subscription Status: ${statusNames[subscription.status]}`);
   *
   *   // Calculate remaining time in current period
   *   if (subscription.current_period_end) {
   *     const endDate = new Date(subscription.current_period_end);
   *     const now = new Date();
   *     const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
   *
   *     console.log(`Current period ends: ${endDate.toLocaleDateString()}`);
   *     console.log(`Days remaining: ${daysRemaining}`);
   *   }
   *
   *   // Check if subscription was cancelled
   *   if (subscription.canceled_at) {
   *     console.log(`Cancelled on: ${new Date(subscription.canceled_at).toLocaleDateString()}`);
   *   }
   * } catch (error) {
   *   console.error("Failed to fetch subscription:", error);
   * }
   * ```
   */
  fetchSkuSubscription(
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

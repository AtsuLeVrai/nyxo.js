import { BaseRouter } from "../../bases/index.js";
import type { RouteBuilder } from "../../core/index.js";
import type { SubscriptionEntity } from "./subscription.entity.js";

/**
 * @description Query string parameters for listing SKU subscriptions with pagination.
 * @see {@link https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions}
 */
export interface RESTSubscriptionQueryStringParams
  extends Partial<Pick<SubscriptionEntity, "user_id">> {
  /** List subscriptions before this subscription ID */
  before?: string;
  /** List subscriptions after this subscription ID */
  after?: string;
  /** Number of results to return (1-100, default 50) */
  limit?: number;
}

/**
 * @description REST API routes for Discord subscription operations.
 * @see {@link https://discord.com/developers/docs/resources/subscription}
 */
export const SubscriptionRoutes = {
  /** Route to list all subscriptions for a specific SKU */
  listSKUSubscriptions: (skuId: string) => `/skus/${skuId}/subscriptions` as const,
  /** Route to get a specific subscription for a SKU */
  getSKUSubscription: (skuId: string, subscriptionId: string) =>
    `/skus/${skuId}/subscriptions/${subscriptionId}` as const,
} as const satisfies RouteBuilder;

/**
 * @description High-performance Discord subscription API router with zero-cache, always-fresh approach.
 * @see {@link https://discord.com/developers/docs/resources/subscription}
 */
export class SubscriptionRouter extends BaseRouter {
  /**
   * @description Retrieves all subscriptions containing specified SKU directly from Discord API.
   * @see {@link https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions}
   *
   * @param skuId - SKU snowflake ID to list subscriptions for
   * @param query - Optional pagination and filtering parameters
   * @returns Promise resolving to array of subscription objects
   * @throws {Error} When hitting Discord rate limits
   */
  listSKUSubscriptions(
    skuId: string,
    query?: RESTSubscriptionQueryStringParams,
  ): Promise<SubscriptionEntity[]> {
    return this.rest.get(SubscriptionRoutes.listSKUSubscriptions(skuId), {
      query,
    });
  }

  /**
   * @description Fetches specific subscription by ID directly from Discord API.
   * @see {@link https://discord.com/developers/docs/resources/subscription#get-sku-subscription}
   *
   * @param skuId - SKU snowflake ID that the subscription belongs to
   * @param subscriptionId - Subscription snowflake ID to fetch
   * @returns Promise resolving to subscription object
   * @throws {Error} When subscription doesn't exist
   * @throws {Error} When hitting Discord rate limits
   */
  getSKUSubscription(skuId: string, subscriptionId: string): Promise<SubscriptionEntity> {
    return this.rest.get(SubscriptionRoutes.getSKUSubscription(skuId, subscriptionId));
  }
}

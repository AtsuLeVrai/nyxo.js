import type { Integer, Snowflake, SubscriptionEntity } from "@nyxjs/core";
import { BaseRouter } from "./base.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions}
 */
export interface SubscriptionQueryEntity {
  before?: Snowflake;
  after?: Snowflake;
  limit?: Integer;
  user_id?: Snowflake;
}

export class SubscriptionRouter extends BaseRouter {
  static readonly DEFAULT_LIMIT = 50;
  static readonly MAX_LIMIT = 100;
  static readonly MIN_LIMIT = 1;

  static readonly routes = {
    skuSubscriptions: (
      skuId: Snowflake,
    ): `/skus/${Snowflake}/subscriptions` => {
      return `/skus/${skuId}/subscriptions` as const;
    },

    skuSubscription: (
      skuId: Snowflake,
      subscriptionId: Snowflake,
    ): `/skus/${Snowflake}/subscriptions/${Snowflake}` => {
      return `/skus/${skuId}/subscriptions/${subscriptionId}` as const;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions}
   */
  listSkuSubscriptions(
    skuId: Snowflake,
    query?: SubscriptionQueryEntity,
  ): Promise<SubscriptionEntity[]> {
    if (
      query?.limit &&
      (query.limit < SubscriptionRouter.MIN_LIMIT ||
        query.limit > SubscriptionRouter.MAX_LIMIT)
    ) {
      throw new Error(
        `Limit must be between ${SubscriptionRouter.MIN_LIMIT} and ${SubscriptionRouter.MAX_LIMIT}`,
      );
    }

    if (query?.before && query?.after) {
      throw new Error("Cannot specify both before and after parameters");
    }

    return this.get(SubscriptionRouter.routes.skuSubscriptions(skuId), {
      query: {
        ...query,
        limit: query?.limit || SubscriptionRouter.DEFAULT_LIMIT,
      },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/subscription#get-sku-subscription}
   */
  getSkuSubscription(
    skuId: Snowflake,
    subscriptionId: Snowflake,
  ): Promise<SubscriptionEntity> {
    return this.get(
      SubscriptionRouter.routes.skuSubscription(skuId, subscriptionId),
    );
  }
}

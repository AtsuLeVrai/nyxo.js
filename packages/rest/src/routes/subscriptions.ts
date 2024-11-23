import type { Snowflake, SubscriptionEntity } from "@nyxjs/core";
import type { Rest } from "../core/index.js";

interface SubscriptionQuery {
  before?: Snowflake;
  after?: Snowflake;
  limit?: number;
  user_id?: Snowflake;
}

export class SubscriptionRoutes {
  static routes = {
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

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions}
   */
  listSkuSubscriptions(
    skuId: Snowflake,
    query?: SubscriptionQuery,
  ): Promise<SubscriptionEntity[]> {
    return this.#rest.get(SubscriptionRoutes.routes.skuSubscriptions(skuId), {
      query,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/subscription#get-sku-subscription}
   */
  getSkuSubscription(
    skuId: Snowflake,
    subscriptionId: Snowflake,
  ): Promise<SubscriptionEntity> {
    return this.#rest.get(
      SubscriptionRoutes.routes.skuSubscription(skuId, subscriptionId),
    );
  }
}

import type { Snowflake, SubscriptionEntity } from "@nyxjs/core";
import type { Rest } from "../rest.js";
import {
  type SubscriptionQueryEntity,
  SubscriptionQuerySchema,
} from "../schemas/index.js";

export class SubscriptionRouter {
  static readonly ROUTES = {
    skuSubscriptions: (skuId: Snowflake) =>
      `/skus/${skuId}/subscriptions` as const,
    skuSubscription: (skuId: Snowflake, subscriptionId: Snowflake) =>
      `/skus/${skuId}/subscriptions/${subscriptionId}` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions}
   */
  listSkuSubscriptions(
    skuId: Snowflake,
    query: SubscriptionQueryEntity = {},
  ): Promise<SubscriptionEntity[]> {
    const result = SubscriptionQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.get(SubscriptionRouter.ROUTES.skuSubscriptions(skuId), {
      query: result.data,
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
      SubscriptionRouter.ROUTES.skuSubscription(skuId, subscriptionId),
    );
  }
}

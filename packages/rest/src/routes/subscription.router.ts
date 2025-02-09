import type { Snowflake, SubscriptionEntity } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import { BaseRouter } from "../base/index.js";
import { SubscriptionQuerySchema } from "../schemas/index.js";

export class SubscriptionRouter extends BaseRouter {
  static readonly ROUTES = {
    skuSubscriptionsBase: (skuId: Snowflake) =>
      `/skus/${skuId}/subscriptions` as const,
    skuSubscription: (skuId: Snowflake, subscriptionId: Snowflake) =>
      `/skus/${skuId}/subscriptions/${subscriptionId}` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions}
   */
  listSkuSubscriptions(
    skuId: Snowflake,
    query: SubscriptionQuerySchema = {},
  ): Promise<SubscriptionEntity[]> {
    const result = SubscriptionQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.get(
      SubscriptionRouter.ROUTES.skuSubscriptionsBase(skuId),
      {
        query: result.data,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/subscription#get-sku-subscription}
   */
  getSkuSubscription(
    skuId: Snowflake,
    subscriptionId: Snowflake,
  ): Promise<SubscriptionEntity> {
    return this.rest.get(
      SubscriptionRouter.ROUTES.skuSubscription(skuId, subscriptionId),
    );
  }
}

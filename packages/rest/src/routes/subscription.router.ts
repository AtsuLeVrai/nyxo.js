import type { Snowflake, SubscriptionEntity } from "@nyxjs/core";
import type { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../rest.js";
import { SubscriptionQueryEntity } from "../schemas/index.js";
import type { HttpResponse } from "../types/index.js";

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
    query: z.input<typeof SubscriptionQueryEntity> = {},
  ): Promise<HttpResponse<SubscriptionEntity[]>> {
    const result = SubscriptionQueryEntity.safeParse(query);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
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
  ): Promise<HttpResponse<SubscriptionEntity>> {
    return this.#rest.get(
      SubscriptionRouter.ROUTES.skuSubscription(skuId, subscriptionId),
    );
  }
}

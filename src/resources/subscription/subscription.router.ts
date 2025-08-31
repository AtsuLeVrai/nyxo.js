import { BaseRouter } from "../../bases/index.js";
import type { RouteBuilder } from "../../core/index.js";
import type { SubscriptionEntity } from "./subscription.entity.js";

export interface RESTSubscriptionQueryStringParams
  extends Partial<Pick<SubscriptionEntity, "user_id">> {
  before?: string;
  after?: string;
  limit?: number;
}

export const SubscriptionRoutes = {
  listSKUSubscriptions: (skuId: string) => `/skus/${skuId}/subscriptions` as const,
  getSKUSubscription: (skuId: string, subscriptionId: string) =>
    `/skus/${skuId}/subscriptions/${subscriptionId}` as const,
} as const satisfies RouteBuilder;

export class SubscriptionRouter extends BaseRouter {
  listSKUSubscriptions(
    skuId: string,
    query?: RESTSubscriptionQueryStringParams,
  ): Promise<SubscriptionEntity[]> {
    return this.rest.get(SubscriptionRoutes.listSKUSubscriptions(skuId), {
      query,
    });
  }

  getSKUSubscription(skuId: string, subscriptionId: string): Promise<SubscriptionEntity> {
    return this.rest.get(SubscriptionRoutes.getSKUSubscription(skuId, subscriptionId));
  }
}

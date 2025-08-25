import type { Rest } from "../../core/index.js";
import type { SubscriptionEntity } from "./subscription.entity.js";

export interface SubscriptionFetchParams {
  before?: string;
  after?: string;
  limit?: number;
  user_id?: string;
}

export class SubscriptionRouter {
  static readonly Routes = {
    skuSubscriptionsEndpoint: (skuId: string) => `/skus/${skuId}/subscriptions` as const,
    skuSubscriptionByIdEndpoint: (skuId: string, subscriptionId: string) =>
      `/skus/${skuId}/subscriptions/${subscriptionId}` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchSubscriptions(
    skuId: string,
    query?: SubscriptionFetchParams,
  ): Promise<SubscriptionEntity[]> {
    return this.#rest.get(SubscriptionRouter.Routes.skuSubscriptionsEndpoint(skuId), {
      query,
    });
  }
  fetchSubscription(skuId: string, subscriptionId: string): Promise<SubscriptionEntity> {
    return this.#rest.get(
      SubscriptionRouter.Routes.skuSubscriptionByIdEndpoint(skuId, subscriptionId),
    );
  }
}

import { BaseClass } from "../bases/index.js";
import type { CamelCaseKeys } from "../utils/index.js";

export enum SubscriptionStatus {
  Active = 0,
  Ending = 1,
  Inactive = 2,
}

export interface SubscriptionEntity {
  id: string;
  user_id: string;
  sku_ids: string[];
  entitlement_ids: string[];
  renewal_sku_ids: string[] | null;
  current_period_start: string;
  current_period_end: string;
  status: SubscriptionStatus;
  canceled_at: string | null;
  country?: string;
}

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

export class Subscription
  extends BaseClass<SubscriptionEntity>
  implements CamelCaseKeys<SubscriptionEntity>
{
  readonly id = this.rawData.id;
  readonly userId = this.rawData.user_id;
  readonly skuIds = this.rawData.sku_ids;
  readonly entitlementIds = this.rawData.entitlement_ids;
  readonly renewalSkuIds = this.rawData.renewal_sku_ids;
  readonly currentPeriodStart = this.rawData.current_period_start;
  readonly currentPeriodEnd = this.rawData.current_period_end;
  readonly status = this.rawData.status;
  readonly canceledAt = this.rawData.canceled_at;
  readonly country = this.rawData.country;
}

import type { Snowflake } from "../common/index.js";
import type { EndpointFactory } from "../utils/index.js";

export enum SubscriptionStatus {
  Active = 0,
  Ending = 1,
  Inactive = 2,
}

export interface SubscriptionObject {
  id: Snowflake;
  user_id: Snowflake;
  sku_ids: Snowflake[];
  entitlement_ids: Snowflake[];
  renewal_sku_ids: Snowflake[] | null;
  current_period_start: string;
  current_period_end: string;
  status: SubscriptionStatus;
  canceled_at: string | null;
  country?: string;
}

// Subscription Query Interfaces
export interface ListSKUSubscriptionsQuery {
  before?: Snowflake;
  after?: Snowflake;
  limit?: number;
  user_id?: Snowflake;
}

export const SubscriptionRoutes = {
  // GET /skus/{sku.id}/subscriptions - List SKU Subscriptions
  listSKUSubscriptions: ((skuId: Snowflake) => `/skus/${skuId}/subscriptions`) as EndpointFactory<
    `/skus/${string}/subscriptions`,
    ["GET"],
    SubscriptionObject[],
    false,
    false,
    undefined,
    ListSKUSubscriptionsQuery
  >,

  // GET /skus/{sku.id}/subscriptions/{subscription.id} - Get SKU Subscription
  getSKUSubscription: ((skuId: Snowflake, subscriptionId: Snowflake) =>
    `/skus/${skuId}/subscriptions/${subscriptionId}`) as EndpointFactory<
    `/skus/${string}/subscriptions/${string}`,
    ["GET"],
    SubscriptionObject
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;

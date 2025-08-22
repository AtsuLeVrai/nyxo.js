import type { Snowflake } from "../common/index.js";
import type { EndpointFactory } from "../utils/index.js";

export enum SKUType {
  Durable = 2,
  Consumable = 3,
  Subscription = 5,
  SubscriptionGroup = 6,
}

export enum SKUFlags {
  Available = 1 << 2,
  GuildSubscription = 1 << 7,
  UserSubscription = 1 << 8,
}

export interface SKUObject {
  id: Snowflake;
  type: SKUType;
  application_id: Snowflake;
  name: string;
  slug: string;
  flags: SKUFlags;
}

export const SKURoutes = {
  // GET /applications/{application.id}/skus - List SKUs
  listSKUs: ((applicationId: Snowflake) =>
    `/applications/${applicationId}/skus`) as EndpointFactory<
    `/applications/${string}/skus`,
    ["GET"],
    SKUObject[]
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;

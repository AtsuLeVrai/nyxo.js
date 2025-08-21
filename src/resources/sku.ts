import type { Snowflake } from "../common/index.js";

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
  flags: number | SKUFlags;
}

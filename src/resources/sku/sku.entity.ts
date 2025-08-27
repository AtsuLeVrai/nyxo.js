export enum SKUFlags {
  Available = 1 << 2,
  GuildSubscription = 1 << 7,
  UserSubscription = 1 << 8,
}

export enum SKUType {
  Durable = 2,
  Consumable = 3,
  Subscription = 5,
  SubscriptionGroup = 6,
}

export interface SKUEntity {
  id: string;
  type: SKUType;
  application_id: string;
  name: string;
  slug: string;
  flags: SKUFlags;
}

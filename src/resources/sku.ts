export enum SKUFlags {
  Available = 1 << 2,

  GuildSubscription = 1 << 7,

  UserSubscription = 1 << 8,
}

export enum SKUTypes {
  Durable = 2,

  Consumable = 3,

  Subscription = 5,

  SubscriptionGroup = 6,
}

export interface SKUObject {
  readonly id: string;

  readonly type: SKUTypes;

  readonly application_id: string;

  readonly name: string;

  readonly slug: string;

  readonly flags: SKUFlags;
}

import type { Snowflake } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-flags}
 */
export enum SkuFlags {
  Available = 1 << 2,
  GuildSubscription = 1 << 7,
  UserSubscription = 1 << 8,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-types}
 */
export enum SkuType {
  Durable = 2,
  Consumable = 3,
  Subscription = 5,
  SubscriptionGroup = 6,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-structure}
 */
export interface SkuEntity {
  id: Snowflake;
  type: SkuType;
  application_id: Snowflake;
  name: string;
  slug: string;
  flags: SkuFlags;
}

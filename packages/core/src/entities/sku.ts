import type { BitFieldResolvable, Snowflake } from "../utils/index.js";

/**
 * Represents the flags that can be applied to a SKU.
 *
 * @remarks
 * These flags indicate different properties of SKUs, particularly regarding their
 * availability and subscription type. For subscriptions, there are two types of
 * access levels: Guild Subscriptions (applied to a server) and User Subscriptions
 * (applied to an individual user).
 *
 * @example
 * ```typescript
 * // Check if a SKU is a guild subscription
 * const isGuildSub = (flags & SkuFlags.GuildSubscription) === SkuFlags.GuildSubscription;
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-flags}
 */
export enum SkuFlags {
  /** SKU is available for purchase */
  Available = 1 << 2,
  /** Recurring SKU that can be purchased by a user and applied to a single server */
  GuildSubscription = 1 << 7,
  /** Recurring SKU purchased by a user for themselves */
  UserSubscription = 1 << 8,
}

/**
 * Represents the different types of SKUs that can be created.
 *
 * @remarks
 * For subscriptions, SKUs will have a type of either SUBSCRIPTION (type: 5) or
 * SUBSCRIPTION_GROUP (type: 6). For current implementations, you should use
 * SUBSCRIPTION (type: 5). A SUBSCRIPTION_GROUP is automatically created for
 * each SUBSCRIPTION SKU and is not used at this time.
 *
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-types}
 */
export enum SkuType {
  /** Durable one-time purchase */
  Durable = 2,
  /** Consumable one-time purchase */
  Consumable = 3,
  /** Represents a recurring subscription */
  Subscription = 5,
  /** System-generated group for each SUBSCRIPTION SKU created */
  SubscriptionGroup = 6,
}

/**
 * Represents a SKU (stock-keeping unit) in Discord.
 *
 * @remarks
 * SKUs represent premium offerings that can be made available to your application's
 * users or guilds. They can be one-time purchases (durable or consumable) or
 * recurring subscriptions (user-based or guild-based).
 *
 * @example
 * ```typescript
 * const sku: SkuEntity = {
 *   id: "1088510058284990888",
 *   type: SkuType.Subscription,
 *   application_id: "788708323867885999",
 *   name: "Premium Membership",
 *   slug: "premium-membership",
 *   flags: SkuFlags.Available | SkuFlags.UserSubscription
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-structure}
 */
export interface SkuEntity {
  /** ID of SKU */
  id: Snowflake;
  /** Type of SKU */
  type: SkuType;
  /** ID of the parent application */
  application_id: Snowflake;
  /** Customer-facing name of your premium offering */
  name: string;
  /** System-generated URL slug based on the SKU's name */
  slug: string;
  /** SKU flags combined as a bitfield */
  flags: BitFieldResolvable<SkuFlags>;
}

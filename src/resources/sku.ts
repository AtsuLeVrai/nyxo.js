/**
 * Bitfield flags defining SKU availability and subscription access levels.
 * Controls purchase availability and determines subscription scope (user vs guild).
 *
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-flags} for SKU flags specification
 */
export enum SKUFlags {
  /** SKU is available for purchase */
  Available = 1 << 2,
  /** Recurring SKU purchasable by user and applied to single server (all server members get benefits) */
  GuildSubscription = 1 << 7,
  /** Recurring SKU purchased by user for themselves (benefits apply in every server) */
  UserSubscription = 1 << 8,
}

/**
 * Categories of premium offerings available through Discord's monetization system.
 * Defines purchase behavior, durability, and subscription characteristics.
 *
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-types} for SKU types specification
 */
export enum SKUTypes {
  /** One-time purchase that persists permanently */
  Durable = 2,
  /** One-time purchase that can be consumed/used up */
  Consumable = 3,
  /** Recurring subscription with periodic billing */
  Subscription = 5,
  /** System-generated group for subscription SKUs (not used directly) */
  SubscriptionGroup = 6,
}

/**
 * Stock Keeping Unit representing a premium offering for Discord applications.
 * Defines purchasable content, features, or subscriptions available to users or guilds.
 *
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object} for SKU object specification
 */
export interface SKUObject {
  /** Unique identifier for the SKU */
  readonly id: string;
  /** Category defining purchase behavior and subscription characteristics */
  readonly type: SKUTypes;
  /** Parent application that owns this SKU */
  readonly application_id: string;
  /** Customer-facing name of the premium offering */
  readonly name: string;
  /** System-generated URL slug based on SKU name */
  readonly slug: string;
  /** Bitfield of availability and subscription access level flags */
  readonly flags: SKUFlags;
}

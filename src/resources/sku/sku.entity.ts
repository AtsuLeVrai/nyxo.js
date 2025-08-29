/**
 * @description Bitfield flags for Discord SKUs indicating availability and subscription types.
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-flags}
 */
export enum SKUFlags {
  /**
   * @description SKU is available for purchase.
   */
  Available = 1 << 2,
  /**
   * @description Recurring SKU that can be purchased by a user and applied to a single server, granting access to every user in that server.
   */
  GuildSubscription = 1 << 7,
  /**
   * @description Recurring SKU purchased by a user for themselves, granting access to the purchasing user in every server.
   */
  UserSubscription = 1 << 8,
}

/**
 * @description Types of Discord SKUs for different monetization models and purchase behaviors.
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-types}
 */
export enum SKUType {
  /**
   * @description Durable one-time purchase that persists.
   */
  Durable = 2,
  /**
   * @description Consumable one-time purchase that can be used up.
   */
  Consumable = 3,
  /**
   * @description Represents a recurring subscription (use this type for subscriptions).
   */
  Subscription = 5,
  /**
   * @description System-generated group for each SUBSCRIPTION SKU created (not used directly).
   */
  SubscriptionGroup = 6,
}

/**
 * @description Represents a Discord SKU (stock-keeping unit) for premium offerings available to application users or guilds.
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-structure}
 */
export interface SKUEntity {
  /**
   * @description Unique snowflake identifier for this SKU.
   */
  id: string;
  /**
   * @description Type of SKU determining purchase behavior and availability.
   */
  type: SKUType;
  /**
   * @description Snowflake ID of the parent application that owns this SKU.
   */
  application_id: string;
  /**
   * @description Customer-facing name of your premium offering.
   */
  name: string;
  /**
   * @description System-generated URL slug based on the SKU's name.
   */
  slug: string;
  /**
   * @description Bitfield of SKU flags indicating availability and subscription type.
   */
  flags: SKUFlags;
}

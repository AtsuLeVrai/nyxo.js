import type { Snowflake } from "../managers/index.js";

/**
 * Represents the flags that can be applied to a SKU.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/SKU.md#sku-flags}
 */
export enum SkuFlags {
  /** SKU is available for purchase */
  Available = 1 << 2,

  /**
   * Recurring SKU that can be purchased by a user and applied to a single server.
   * Grants access to every user in that server.
   */
  GuildSubscription = 1 << 7,

  /**
   * Recurring SKU purchased by a user for themselves.
   * Grants access to the purchasing user in every server.
   */
  UserSubscription = 1 << 8,
}

/**
 * Represents the different types of SKUs available on Discord.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/SKU.md#sku-types}
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
 * Represents a SKU (stock-keeping unit) in Discord, which is a premium offering
 * that can be made available to an application's users or guilds.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/SKU.md#sku-object}
 */
export interface SkuEntity {
  /** ID of the SKU */
  id: Snowflake;

  /**
   * Type of SKU
   * @validate For integration and testing entitlements, use the SKU with type 5 (SUBSCRIPTION) instead of type 6 (SUBSCRIPTION_GROUP)
   */
  type: SkuType;

  /** ID of the parent application */
  application_id: Snowflake;

  /** Customer-facing name of your premium offering */
  name: string;

  /** System-generated URL slug based on the SKU's name */
  slug: string;

  /**
   * SKU flags combined as a bitfield.
   * Can be used to differentiate user and server subscriptions with a bitwise & operator.
   * @validate SKU flags must contain at least one valid flag (Available, GuildSubscription, or UserSubscription)
   */
  flags: number;

  /** Optional ID of a dependent SKU */
  dependent_sku_id: Snowflake | null;

  /** Optional manifest labels */
  manifest_labels: string[] | null;

  /** Access type for the SKU */
  access_type: number;

  /** Features for the SKU */
  features: string[];

  /** Optional release date for the SKU */
  release_date: string | null;

  /** Whether the SKU is premium */
  premium: boolean;

  /** Whether to show age gate */
  show_age_gate: boolean;
}

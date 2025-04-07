import type { Snowflake } from "../managers/index.js";

/**
 * Represents the flags that can be applied to a SKU.
 * These flags determine the availability and type of subscription offering.
 * Can be combined as a bitfield and used with bitwise operators to check specific attributes.
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-flags}
 */
export enum SkuFlags {
  /**
   * SKU is available for purchase (1 << 2 = 4)
   * Indicates that this SKU can be actively purchased by users
   */
  Available = 1 << 2,

  /**
   * Recurring SKU that can be purchased by a user and applied to a single server (1 << 7 = 128)
   * Grants access to every user in that server.
   * This is a server-wide subscription where one user pays and all members benefit.
   */
  GuildSubscription = 1 << 7,

  /**
   * Recurring SKU purchased by a user for themselves (1 << 8 = 256)
   * Grants access to the purchasing user in every server.
   * This is a personal subscription where the benefits follow the user across all servers.
   */
  UserSubscription = 1 << 8,
}

/**
 * Represents the different types of SKUs available on Discord.
 * The type determines the purchase behavior and recurrence pattern.
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-types}
 */
export enum SkuType {
  /**
   * Durable one-time purchase (2)
   * A permanent purchase that doesn't expire and isn't consumed on use
   */
  Durable = 2,

  /**
   * Consumable one-time purchase (3)
   * A one-time purchase that is consumed when used
   */
  Consumable = 3,

  /**
   * Represents a recurring subscription (5)
   * A purchase that renews automatically at regular intervals
   * This is the recommended type for subscription implementations
   */
  Subscription = 5,

  /**
   * System-generated group for each SUBSCRIPTION SKU created (6)
   * Automatically created for each Subscription SKU
   * Note: For integration and testing entitlements, use the SKU with type Subscription (5) instead
   */
  SubscriptionGroup = 6,
}

/**
 * Represents a SKU (stock-keeping unit) in Discord, which is a premium offering
 * that can be made available to an application's users or guilds.
 * SKUs define the products that users can purchase, including one-time purchases and subscriptions.
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object}
 */
export interface SkuEntity {
  /**
   * ID of the SKU
   * Unique identifier for this premium offering
   */
  id: Snowflake;

  /**
   * Type of SKU
   * Determines whether this is a one-time purchase or subscription
   * @validate For integration and testing entitlements, use the SKU with type 5 (SUBSCRIPTION) instead of type 6 (SUBSCRIPTION_GROUP)
   */
  type: SkuType;

  /**
   * ID of the parent application
   * Links this SKU to its associated Discord application
   */
  application_id: Snowflake;

  /**
   * Customer-facing name of your premium offering
   * The name shown to users when they view or purchase this SKU
   */
  name: string;

  /**
   * System-generated URL slug based on the SKU's name
   * Automatically created from the name for use in URLs
   */
  slug: string;

  /**
   * SKU flags combined as a bitfield.
   * Can be used to differentiate user and server subscriptions with a bitwise & operator.
   * For example: (flags & SkuFlags.GuildSubscription) to check if it's a guild subscription
   */
  flags: SkuFlags;

  /**
   * Optional ID of a dependent SKU
   * If this SKU depends on another SKU, this will contain its ID
   */
  dependent_sku_id: Snowflake | null;

  /**
   * Optional manifest labels
   * Additional metadata labels that can be used for organization or filtering
   */
  manifest_labels: string[] | null;

  /**
   * Access type for the SKU
   * Defines how access to this premium offering is granted
   */
  access_type: number;

  /**
   * Features for the SKU
   * Array of feature identifiers that this SKU provides
   */
  features: string[];

  /**
   * Optional release date for the SKU
   * When this premium offering becomes available
   */
  release_date: string | null;

  /**
   * Whether the SKU is premium
   * Indicates if this is considered a premium offering
   */
  premium: boolean;

  /**
   * Whether to show age gate
   * Controls if an age verification prompt is shown before purchase
   */
  show_age_gate: boolean;
}

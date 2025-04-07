import type { Snowflake } from "../managers/index.js";

/**
 * Entitlement types representing how a user or guild acquired access to a premium offering.
 * Entitlements in Discord represent that a user or guild has access to a premium feature in your application.
 * Different types indicate different acquisition methods, ranging from direct purchases to gifts and subscriptions.
 * @see {@link https://discord.com/developers/docs/resources/entitlement#entitlement-object-entitlement-types}
 */
export enum EntitlementType {
  /**
   * Entitlement was purchased by user.
   * A direct, one-time purchase made by a user for a non-subscription SKU.
   * @value 1
   */
  Purchase = 1,

  /**
   * Entitlement for Discord Nitro subscription.
   * Access granted through the user's Discord Nitro subscription status.
   * @value 2
   */
  PremiumSubscription = 2,

  /**
   * Entitlement was gifted by developer.
   * Access was granted directly by the application developer as a gift.
   * @value 3
   */
  DeveloperGift = 3,

  /**
   * Entitlement was purchased by a dev in application test mode.
   * A test purchase for development and testing purposes.
   * @value 4
   */
  TestModePurchase = 4,

  /**
   * Entitlement was granted when the SKU was free.
   * User claimed the SKU during a period when it was being offered for free.
   * @value 5
   */
  FreePurchase = 5,

  /**
   * Entitlement was gifted by another user.
   * Another user purchased this entitlement as a gift.
   * @value 6
   */
  UserGift = 6,

  /**
   * Entitlement was claimed by user for free as a Nitro Subscriber.
   * Special case where Nitro subscribers get free access to certain premium offerings.
   * @value 7
   */
  PremiumPurchase = 7,

  /**
   * Entitlement was purchased as an app subscription.
   * A recurring subscription to the application's premium offering.
   * @value 8
   */
  ApplicationSubscription = 8,
}

/**
 * Entitlement structure representing premium access for a user or guild.
 *
 * Entitlements in Discord represent that a user or guild has access to a premium
 * offering in your application. Each entitlement is associated with a particular SKU
 * (Stock Keeping Unit) that you define in the Developer Portal.
 *
 * Entitlements can be granted through various means, including direct purchases,
 * subscriptions, gifts, and promotional campaigns. They can be time-limited,
 * perpetual, or consumable (used once).
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#entitlement-object}
 */
export interface EntitlementEntity {
  /**
   * ID of the entitlement.
   * Unique identifier for this specific entitlement record.
   */
  id: Snowflake;

  /**
   * ID of the SKU.
   * Identifies which premium offering (SKU) this entitlement grants access to.
   * SKUs are defined in your application's Developer Portal.
   */
  sku_id: Snowflake;

  /**
   * ID of the parent application.
   * Identifies which application this entitlement belongs to.
   */
  application_id: Snowflake;

  /**
   * ID of the user that is granted access to the entitlement's SKU.
   * May be undefined if this is a guild-based entitlement.
   * For user-based entitlements, identifies which user has access.
   */
  user_id?: Snowflake;

  /**
   * Type of entitlement.
   * Indicates how this entitlement was acquired (purchase, gift, subscription, etc.).
   */
  type: EntitlementType;

  /**
   * Whether the entitlement was deleted.
   * Indicates if the entitlement has been removed/revoked.
   * Deleted entitlements are typically excluded from queries by default.
   */
  deleted: boolean;

  /**
   * Start date at which the entitlement is valid.
   * For time-limited entitlements, indicates when the entitlement becomes active.
   * Will be null for perpetual entitlements.
   * @format date-time
   */
  starts_at: string | null;

  /**
   * Date at which the entitlement is no longer valid.
   * For time-limited entitlements, indicates when the entitlement expires.
   * Will be null for perpetual entitlements.
   * @format date-time
   */
  ends_at: string | null;

  /**
   * ID of the guild that is granted access to the entitlement's SKU.
   * May be undefined if this is a user-based entitlement.
   * For guild-based entitlements, identifies which guild has access.
   */
  guild_id?: Snowflake;

  /**
   * For consumable entitlements, whether or not the entitlement has been consumed.
   * Once a consumable entitlement is consumed, it is considered used.
   * This field is only relevant for one-time use entitlements.
   */
  consumed?: boolean;

  /**
   * ID of the promotion that granted the entitlement.
   * If the entitlement was granted through a promotional campaign, this identifies which one.
   * Will be null for non-promotional entitlements.
   */
  promotion_id?: Snowflake | null;

  /**
   * ID of the subscription that granted the entitlement.
   * For subscription-based entitlements, identifies the specific subscription.
   * Will be null for non-subscription entitlements.
   */
  subscription_id?: Snowflake | null;

  /**
   * Gift code flags for the entitlement.
   * A bitfield of flags for gift code related entitlements.
   */
  gift_code_flags?: number;
}

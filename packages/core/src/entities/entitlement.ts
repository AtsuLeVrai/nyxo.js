import type { Iso8601 } from "../formatting/index.js";
import type { Snowflake } from "../utils/index.js";

/**
 * Represents the different types of entitlements that can be granted to users or guilds.
 *
 * @remarks
 * Entitlements can be acquired through various means such as direct purchases,
 * subscriptions, gifts, or test mode purchases for development.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#entitlement-object-entitlement-types}
 */
export enum EntitlementType {
  /** Entitlement was purchased directly by the user */
  Purchase = 1,
  /** Entitlement granted through a Discord Nitro subscription */
  PremiumSubscription = 2,
  /** Entitlement was gifted by the application developer */
  DeveloperGift = 3,
  /** Entitlement created through test mode purchase */
  TestModePurchase = 4,
  /** Entitlement granted when the SKU was free */
  FreePurchase = 5,
  /** Entitlement was gifted by another user */
  UserGift = 6,
  /** Entitlement claimed for free by a Nitro subscriber */
  PremiumPurchase = 7,
  /** Entitlement from an application subscription */
  ApplicationSubscription = 8,
}

/**
 * Represents a user or guild's access to a premium offering in an application.
 *
 * @remarks
 * Entitlements are used to track and manage access to premium features or content in Discord applications.
 * They can be associated with either a user or a guild, and may have specific time periods of validity.
 * Consumable entitlements (like one-time purchases) can be marked as consumed.
 *
 * @example
 * ```typescript
 * const entitlement: EntitlementEntity = {
 *   id: "1019653849998299136",
 *   sku_id: "1019475255913222144",
 *   application_id: "1019370614521200640",
 *   user_id: "771129655544643584",
 *   type: EntitlementType.ApplicationSubscription,
 *   deleted: false,
 *   starts_at: "2022-09-14T17:00:18.704163+00:00",
 *   ends_at: "2022-10-14T17:00:18.704163+00:00",
 *   guild_id: "1015034326372454400",
 *   consumed: false
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#entitlement-object-entitlement-structure}
 */
export interface EntitlementEntity {
  /** Unique identifier for the entitlement */
  id: Snowflake;
  /** ID of the SKU (purchasable product) that this entitlement grants access to */
  sku_id: Snowflake;
  /** ID of the parent application that owns the SKU */
  application_id: Snowflake;
  /** ID of the user that has been granted access to the entitlement's SKU */
  user_id?: Snowflake;
  /** The type of entitlement */
  type: EntitlementType;
  /** Whether the entitlement has been deleted */
  deleted: boolean;
  /** Start date when the entitlement becomes valid */
  starts_at?: Iso8601;
  /** End date when the entitlement becomes invalid */
  ends_at?: Iso8601;
  /** ID of the guild that has been granted access to the entitlement's SKU */
  guild_id?: Snowflake;
  /**
   * For consumable entitlements, indicates whether it has been consumed
   * @remarks
   * Only applicable for one-time purchase consumable SKUs
   */
  consumed?: boolean;
}

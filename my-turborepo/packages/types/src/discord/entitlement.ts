/**
 * Types of entitlements representing different methods of premium offering acquisition.
 * Determines how users gained access to premium features and affects entitlement behavior.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#entitlement-object-entitlement-types} for entitlement types specification
 */
export enum EntitlementTypes {
  /** Entitlement was purchased by the user through standard payment */
  Purchase = 1,
  /** Entitlement for Discord Nitro subscription benefits */
  PremiumSubscription = 2,
  /** Entitlement was gifted by a developer for testing or promotional purposes */
  DeveloperGift = 3,
  /** Entitlement was purchased by a developer in application test mode */
  TestModePurchase = 4,
  /** Entitlement was granted when the SKU was available for free */
  FreePurchase = 5,
  /** Entitlement was gifted by another user */
  UserGift = 6,
  /** Entitlement was claimed by user for free as a Nitro subscriber benefit */
  PremiumPurchase = 7,
  /** Entitlement was purchased as an application subscription */
  ApplicationSubscription = 8,
}

/**
 * Owner types for entitlements determining whether access is granted to users or guilds.
 * Used when creating test entitlements to specify the target of premium access.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement} for test entitlement creation
 */
export enum EntitlementOwnerTypes {
  /** Entitlement grants access to an entire guild and its members */
  Guild = 1,
  /** Entitlement grants access to an individual user */
  User = 2,
}

/**
 * Discord entitlement representing user or guild access to premium application features.
 * Entitlements track ownership, validity periods, and consumption state for monetized content.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#entitlement-object} for entitlement object specification
 * @see {@link https://discord.com/developers/docs/monetization/overview} for monetization overview
 */
export interface EntitlementObject {
  /** Unique identifier for this entitlement */
  readonly id: string;
  /** SKU identifier that this entitlement grants access to */
  readonly sku_id: string;
  /** Application that owns this entitlement */
  readonly application_id: string;
  /** User granted access to the entitlement's SKU (if user-targeted) */
  readonly user_id?: string;
  /** Method by which this entitlement was acquired */
  readonly type: EntitlementTypes;
  /** Whether this entitlement has been deleted */
  readonly deleted: boolean;
  /** ISO8601 timestamp when entitlement becomes valid (null for perpetual) */
  readonly starts_at: string | null;
  /** ISO8601 timestamp when entitlement expires (null for perpetual) */
  readonly ends_at: string | null;
  /** Guild granted access to the entitlement's SKU (if guild-targeted) */
  readonly guild_id?: string;
  /** Whether consumable entitlement has been consumed */
  readonly consumed?: boolean;
}

/**
 * Query parameters for filtering and paginating entitlement lists.
 * Supports filtering by user, guild, SKU, and exclusion of ended or deleted entitlements.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements} for list entitlements endpoint
 */
export interface ListEntitlementsQueryStringParams
  extends Pick<EntitlementObject, "user_id" | "guild_id"> {
  /** Comma-delimited list of SKU IDs to filter entitlements */
  readonly sku_ids?: string;
  /** Retrieve entitlements created before this entitlement ID */
  readonly before?: string;
  /** Retrieve entitlements created after this entitlement ID */
  readonly after?: string;
  /** Maximum number of entitlements to return (1-100, default 100) */
  readonly limit?: number;
  /** Whether to exclude expired entitlements (default false) */
  readonly exclude_ended?: boolean;
  /** Whether to exclude deleted entitlements (default true) */
  readonly exclude_deleted?: boolean;
}

/**
 * Request parameters for creating test entitlements for development and testing.
 * Test entitlements allow developers to simulate premium access without real purchases.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement} for create test entitlement endpoint
 */
export interface CreateTestEntitlementJSONParams extends Pick<EntitlementObject, "sku_id"> {
  /** ID of the user or guild to grant the test entitlement to */
  readonly owner_id: string;
  /** Whether the entitlement targets a guild or individual user */
  readonly owner_type: EntitlementOwnerTypes;
}

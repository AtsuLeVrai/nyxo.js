import type { Snowflake } from "@nyxjs/core";

/**
 * Interface for query parameters when listing entitlements.
 * These parameters allow filtering and pagination of entitlement results.
 *
 * @remarks
 * Entitlements represent a user or guild's access to premium offerings in an application.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements-query-string-params}
 */
export interface ListEntitlementQuerySchema {
  /**
   * User ID to look up entitlements for
   *
   * @optional
   */
  user_id?: Snowflake;

  /**
   * Optional comma-delimited list of SKU IDs to check entitlements for
   *
   * @optional
   */
  sku_ids?: string;

  /**
   * Retrieve entitlements before this entitlement ID
   *
   * @optional
   */
  before?: Snowflake;

  /**
   * Retrieve entitlements after this entitlement ID
   *
   * @optional
   */
  after?: Snowflake;

  /**
   * Number of entitlements to return (1-100, default 100)
   *
   * @minimum 1
   * @maximum 100
   * @default 100
   * @integer
   */
  limit?: number;

  /**
   * Guild ID to look up entitlements for
   *
   * @optional
   */
  guild_id?: Snowflake;

  /**
   * Whether to exclude ended entitlements (defaults to false)
   *
   * @default false
   */
  exclude_ended?: boolean;

  /**
   * Whether to exclude deleted entitlements (defaults to true)
   *
   * @default true
   */
  exclude_deleted?: boolean;
}

/**
 * Enum specifying the owner type for test entitlements.
 * Used to indicate whether a test entitlement is for a guild or a user.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params}
 */
export enum EntitlementOwnerType {
  /** Test entitlement for a guild subscription */
  Guild = 1,

  /** Test entitlement for a user subscription */
  User = 2,
}

/**
 * Interface for creating a test entitlement.
 * Test entitlements allow developers to test premium offerings without making actual purchases.
 *
 * @remarks
 * After creating a test entitlement, you'll need to reload your Discord client
 * for the premium access to be visible.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params}
 */
export interface CreateTestEntitlementSchema {
  /** ID of the SKU to grant the entitlement to */
  sku_id: string;

  /** ID of the guild or user to grant the entitlement to */
  owner_id: string;

  /** Whether this is for a guild (1) or user (2) subscription */
  owner_type: EntitlementOwnerType;
}

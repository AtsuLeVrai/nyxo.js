import { Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * Schema for query parameters when listing entitlements.
 * These parameters allow filtering and pagination of entitlement results.
 *
 * @remarks
 * Entitlements represent a user or guild's access to premium offerings in an application.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements-query-string-params}
 */
export const ListEntitlementQuerySchema = z.object({
  /** User ID to look up entitlements for */
  user_id: Snowflake.optional(),

  /** Optional comma-delimited list of SKU IDs to check entitlements for */
  sku_ids: z.string().optional(),

  /** Retrieve entitlements before this entitlement ID */
  before: Snowflake.optional(),

  /** Retrieve entitlements after this entitlement ID */
  after: Snowflake.optional(),

  /** Number of entitlements to return (1-100, default 100) */
  limit: z.number().int().min(1).max(100).default(100),

  /** Guild ID to look up entitlements for */
  guild_id: Snowflake.optional(),

  /** Whether to exclude ended entitlements (defaults to false) */
  exclude_ended: z.boolean().default(false),

  /** Whether to exclude deleted entitlements (defaults to true) */
  exclude_deleted: z.boolean().default(true),
});

export type ListEntitlementQuerySchema = z.input<
  typeof ListEntitlementQuerySchema
>;

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
 * Schema for creating a test entitlement.
 * Test entitlements allow developers to test premium offerings without making actual purchases.
 *
 * @remarks
 * After creating a test entitlement, you'll need to reload your Discord client
 * for the premium access to be visible.
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params}
 */
export const CreateTestEntitlementSchema = z.object({
  /** ID of the SKU to grant the entitlement to */
  sku_id: z.string(),

  /** ID of the guild or user to grant the entitlement to */
  owner_id: z.string(),

  /** Whether this is for a guild (1) or user (2) subscription */
  owner_type: z.nativeEnum(EntitlementOwnerType),
});

export type CreateTestEntitlementSchema = z.input<
  typeof CreateTestEntitlementSchema
>;

import { Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements-query-string-params}
 */
export const ListEntitlementQuerySchema = z.object({
  user_id: Snowflake.optional(),
  sku_ids: z.string().optional(),
  before: Snowflake.optional(),
  after: Snowflake.optional(),
  limit: z.number().int().min(1).max(100).default(100),
  guild_id: Snowflake.optional(),
  exclude_ended: z.boolean().default(false),
  exclude_deleted: z.boolean().default(true),
});

export type ListEntitlementQuerySchema = z.input<
  typeof ListEntitlementQuerySchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params}
 */
export enum EntitlementOwnerType {
  Guild = 1,
  User = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params}
 */
export const CreateTestEntitlementSchema = z.object({
  sku_id: z.string(),
  owner_id: z.string(),
  owner_type: z.nativeEnum(EntitlementOwnerType),
});

export type CreateTestEntitlementSchema = z.input<
  typeof CreateTestEntitlementSchema
>;

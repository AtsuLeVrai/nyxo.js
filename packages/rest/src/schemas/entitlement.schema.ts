import { SnowflakeManager } from "@nyxjs/core";
import { z } from "zod";

export const ListEntitlementsQuerySchema = z
  .object({
    user_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    sku_ids: z.string().optional(),
    before: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    after: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    limit: z.number().int().min(1).max(100).default(100).optional(),
    guild_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    exclude_ended: z.boolean().default(false).optional(),
    exclude_deleted: z.boolean().default(true).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements-query-string-params}
 */
export type ListEntitlementQueryEntity = z.infer<
  typeof ListEntitlementsQuerySchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params}
 */
export enum EntitlementOwnerType {
  Guild = 1,
  User = 2,
}

export const CreateTestEntitlementSchema = z
  .object({
    sku_id: z.string(),
    owner_id: z.string(),
    owner_type: z.nativeEnum(EntitlementOwnerType),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params}
 */
export type CreateTestEntitlementEntity = z.infer<
  typeof CreateTestEntitlementSchema
>;

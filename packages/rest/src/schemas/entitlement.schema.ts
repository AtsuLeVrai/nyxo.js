import { SnowflakeSchema } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements-query-string-params}
 */
export const ListEntitlementsQuerySchema = z
  .object({
    user_id: SnowflakeSchema.optional(),
    sku_ids: z.string().optional(),
    before: SnowflakeSchema.optional(),
    after: SnowflakeSchema.optional(),
    limit: z.number().int().min(1).max(100).default(100).optional(),
    guild_id: SnowflakeSchema.optional(),
    exclude_ended: z.boolean().default(false).optional(),
    exclude_deleted: z.boolean().default(true).optional(),
  })
  .strict();

export type ListEntitlementQueryEntity = z.infer<
  typeof ListEntitlementsQuerySchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params}
 */
export const EntitlementOwnerType = {
  guild: 1,
  user: 2,
} as const;

export type EntitlementOwnerType =
  (typeof EntitlementOwnerType)[keyof typeof EntitlementOwnerType];

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params}
 */
export const CreateTestEntitlementSchema = z
  .object({
    sku_id: z.string(),
    owner_id: z.string(),
    owner_type: z.nativeEnum(EntitlementOwnerType),
  })
  .strict();

export type CreateTestEntitlementEntity = z.infer<
  typeof CreateTestEntitlementSchema
>;

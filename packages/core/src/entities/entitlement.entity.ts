import { z } from "zod";
import { SnowflakeSchema } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#entitlement-object-entitlement-types}
 */
export const EntitlementType = {
  purchase: 1,
  premiumSubscription: 2,
  developerGift: 3,
  testModePurchase: 4,
  freePurchase: 5,
  userGift: 6,
  premiumPurchase: 7,
  applicationSubscription: 8,
} as const;

export type EntitlementType =
  (typeof EntitlementType)[keyof typeof EntitlementType];

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#entitlement-object-entitlement-structure}
 */
export const EntitlementSchema = z
  .object({
    id: SnowflakeSchema,
    sku_id: SnowflakeSchema,
    application_id: SnowflakeSchema,
    user_id: SnowflakeSchema.optional(),
    type: z.nativeEnum(EntitlementType),
    deleted: z.boolean(),
    starts_at: z.string().datetime().nullable(),
    ends_at: z.string().datetime().nullable(),
    guild_id: SnowflakeSchema.optional(),
    consumed: z.boolean().optional(),
  })
  .strict();

export type EntitlementEntity = z.infer<typeof EntitlementSchema>;

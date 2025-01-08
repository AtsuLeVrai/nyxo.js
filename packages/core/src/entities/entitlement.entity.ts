import { z } from "zod";
import { Snowflake } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#entitlement-object-entitlement-types}
 */
export enum EntitlementType {
  Purchase = 1,
  PremiumSubscription = 2,
  DeveloperGift = 3,
  TestModePurchase = 4,
  FreePurchase = 5,
  UserGift = 6,
  PremiumPurchase = 7,
  ApplicationSubscription = 8,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#entitlement-object-entitlement-structure}
 */
export const EntitlementEntity = z
  .object({
    id: Snowflake,
    sku_id: Snowflake,
    application_id: Snowflake,
    user_id: Snowflake.optional(),
    type: z.nativeEnum(EntitlementType),
    deleted: z.boolean(),
    starts_at: z.string().datetime().nullable(),
    ends_at: z.string().datetime().nullable(),
    guild_id: Snowflake.optional(),
    consumed: z.boolean().optional(),
  })
  .strict();

export type EntitlementEntity = z.infer<typeof EntitlementEntity>;

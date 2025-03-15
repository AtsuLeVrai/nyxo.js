import { z } from "zod";
import { Snowflake } from "../managers/index.js";

/**
 * Entitlement types representing how a user acquired access to a premium offering
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/entitlement.md#entitlement-types}
 */
export enum EntitlementType {
  /** Entitlement was purchased by user */
  Purchase = 1,

  /** Entitlement for Discord Nitro subscription */
  PremiumSubscription = 2,

  /** Entitlement was gifted by developer */
  DeveloperGift = 3,

  /** Entitlement was purchased by a dev in application test mode */
  TestModePurchase = 4,

  /** Entitlement was granted when the SKU was free */
  FreePurchase = 5,

  /** Entitlement was gifted by another user */
  UserGift = 6,

  /** Entitlement was claimed by user for free as a Nitro Subscriber */
  PremiumPurchase = 7,

  /** Entitlement was purchased as an app subscription */
  ApplicationSubscription = 8,
}

/**
 * Zod schema for Entitlement
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/entitlement.md#entitlement-structure}
 */
export const EntitlementEntity = z.object({
  /** ID of the entitlement */
  id: Snowflake,

  /** ID of the SKU */
  sku_id: Snowflake,

  /** ID of the parent application */
  application_id: Snowflake,

  /** ID of the user that is granted access to the entitlement's sku (may be null) */
  user_id: Snowflake.optional(),

  /** Type of entitlement */
  type: z.nativeEnum(EntitlementType),

  /** Whether the entitlement was deleted */
  deleted: z.boolean(),

  /** Start date at which the entitlement is valid (may be null) */
  starts_at: z
    .string()
    .nullable()
    .refine((val) => val === null || !Number.isNaN(Date.parse(val)), {
      message: "starts_at must be a valid ISO8601 timestamp or null",
    }),

  /** Date at which the entitlement is no longer valid (may be null) */
  ends_at: z
    .string()
    .nullable()
    .refine((val) => val === null || !Number.isNaN(Date.parse(val)), {
      message: "ends_at must be a valid ISO8601 timestamp or null",
    }),

  /** ID of the guild that is granted access to the entitlement's sku (may be null) */
  guild_id: Snowflake.optional(),

  /** For consumable entitlements, whether or not the entitlement has been consumed */
  consumed: z.boolean().optional(),

  /** ID of the promotion that granted the entitlement (may be null) */
  promotion_id: Snowflake.nullish(),

  /** ID of the subscription that granted the entitlement (may be null) */
  subscription_id: Snowflake.nullish(),
});

export type EntitlementEntity = z.infer<typeof EntitlementEntity>;

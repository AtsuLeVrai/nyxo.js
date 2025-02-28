import { z } from "zod";
import { BitFieldManager, Snowflake } from "../managers/index.js";

/**
 * Represents the flags that can be applied to a SKU.
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-flags}
 */
export enum SkuFlags {
  /** SKU is available for purchase */
  Available = 1 << 2,

  /**
   * Recurring SKU that can be purchased by a user and applied to a single server.
   * Grants access to every user in that server.
   */
  GuildSubscription = 1 << 7,

  /**
   * Recurring SKU purchased by a user for themselves.
   * Grants access to the purchasing user in every server.
   */
  UserSubscription = 1 << 8,
}

/**
 * Represents the different types of SKUs available on Discord.
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-types}
 */
export enum SkuType {
  /** Durable one-time purchase */
  Durable = 2,

  /** Consumable one-time purchase */
  Consumable = 3,

  /** Represents a recurring subscription */
  Subscription = 5,

  /** System-generated group for each SUBSCRIPTION SKU created */
  SubscriptionGroup = 6,
}

/**
 * Represents a SKU (stock-keeping unit) in Discord, which is a premium offering
 * that can be made available to an application's users or guilds.
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-structure}
 */
export const SkuEntity = z.object({
  /** ID of the SKU */
  id: Snowflake,

  /** Type of SKU */
  type: z.nativeEnum(SkuType),

  /** ID of the parent application */
  application_id: Snowflake,

  /** Customer-facing name of your premium offering */
  name: z.string(),

  /** System-generated URL slug based on the SKU's name */
  slug: z.string(),

  /** SKU flags combined as a bitfield */
  flags: z.custom<SkuFlags>(BitFieldManager.isValidBitField),

  /** Optional ID of a dependent SKU */
  dependent_sku_id: Snowflake.nullable(),

  /** Optional manifest labels */
  manifest_labels: z.array(z.string()).nullable(),

  /** Access type for the SKU */
  access_type: z.number(),

  /** Features for the SKU */
  features: z.array(z.string()),

  /** Optional release date for the SKU */
  release_date: z.string().datetime().nullable(),

  /** Whether the SKU is premium */
  premium: z.boolean(),

  /** Whether to show age gate */
  show_age_gate: z.boolean(),
});

export type SkuEntity = z.infer<typeof SkuEntity>;

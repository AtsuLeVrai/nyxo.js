import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { parseBitField } from "../utils/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-flags}
 */
export enum SkuFlags {
  Available = 1 << 2,
  GuildSubscription = 1 << 7,
  UserSubscription = 1 << 8,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-types}
 */
export enum SkuType {
  Durable = 2,
  Consumable = 3,
  Subscription = 5,
  SubscriptionGroup = 6,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-structure}
 */
export const SkuEntity = z.object({
  id: Snowflake,
  type: z.nativeEnum(SkuType),
  application_id: Snowflake,
  name: z.string(),
  slug: z.string(),
  flags: parseBitField<SkuFlags>(),
});

export type SkuEntity = z.infer<typeof SkuEntity>;

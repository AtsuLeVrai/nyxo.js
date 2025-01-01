import { z } from "zod";
import { SnowflakeSchema } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-flags}
 */
export const SkuFlags = {
  available: 1 << 2,
  guildSubscription: 1 << 7,
  userSubscription: 1 << 8,
} as const;

export type SkuFlags = (typeof SkuFlags)[keyof typeof SkuFlags];

/**
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-types}
 */
export const SkuType = {
  durable: 2,
  consumable: 3,
  subscription: 5,
  subscriptionGroup: 6,
} as const;

export type SkuType = (typeof SkuType)[keyof typeof SkuType];

/**
 * @see {@link https://discord.com/developers/docs/resources/sku#sku-object-sku-structure}
 */
export const SkuSchema = z
  .object({
    id: SnowflakeSchema,
    type: z.nativeEnum(SkuType),
    application_id: SnowflakeSchema,
    name: z.string(),
    slug: z.string(),
    flags: z.nativeEnum(SkuFlags),
  })
  .strict();

export type SkuEntity = z.infer<typeof SkuSchema>;

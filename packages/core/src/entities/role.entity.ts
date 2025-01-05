import { z } from "zod";
import { BitFieldManager, SnowflakeSchema } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-flags}
 */
export const RoleFlags = {
  inPrompt: 1 << 0,
} as const;

export type RoleFlags = (typeof RoleFlags)[keyof typeof RoleFlags];

/**
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure}
 */
export const RoleTagsSchema = z
  .object({
    bot_id: SnowflakeSchema.optional(),
    integration_id: SnowflakeSchema.optional(),
    premium_subscriber: z.null().optional(),
    subscription_listing_id: SnowflakeSchema.optional(),
    available_for_purchase: z.null().optional(),
    guild_connections: z.null().optional(),
  })
  .strict();

export type RoleTagsEntity = z.infer<typeof RoleTagsSchema>;

/**
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-structure}
 */
export const RoleSchema = z
  .object({
    id: SnowflakeSchema,
    name: z.string(),
    color: z.number().int(),
    hoist: z.boolean(),
    icon: z.string().nullish(),
    unicode_emoji: z.string().emoji().nullish(),
    position: z.number().int(),
    permissions: z.string(),
    managed: z.boolean(),
    mentionable: z.boolean(),
    tags: RoleTagsSchema.optional(),
    flags: z
      .nativeEnum(RoleFlags)
      .transform((value) => new BitFieldManager<RoleFlags>(value)),
  })
  .strict();

export type RoleEntity = z.infer<typeof RoleSchema>;

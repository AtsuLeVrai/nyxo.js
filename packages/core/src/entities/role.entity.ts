import { z } from "zod";
import { BitFieldManager, Snowflake } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-flags}
 */
export enum RoleFlags {
  InPrompt = 1 << 0,
}

/**
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure}
 */
export const RoleTagsEntity = z.object({
  bot_id: Snowflake.optional(),
  integration_id: Snowflake.optional(),
  premium_subscriber: z.null().optional(),
  subscription_listing_id: Snowflake.optional(),
  available_for_purchase: z.null().optional(),
  guild_connections: z.null().optional(),
});

export type RoleTagsEntity = z.infer<typeof RoleTagsEntity>;

/**
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-structure}
 */
export const RoleEntity = z.object({
  id: Snowflake,
  name: z.string(),
  color: z.number().int(),
  hoist: z.boolean(),
  icon: z.string().nullish(),
  unicode_emoji: z.string().emoji().nullish(),
  position: z.number().int(),
  permissions: z.string().regex(/^\d+$/), // Validate that permissions is a string of digits
  managed: z.boolean(),
  mentionable: z.boolean(),
  tags: RoleTagsEntity.optional(),
  flags: z.custom<RoleFlags>(BitFieldManager.isValidBitField),
});

export type RoleEntity = z.infer<typeof RoleEntity>;

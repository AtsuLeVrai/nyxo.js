import { z } from "zod";
import { BitFieldManager, Snowflake } from "../managers/index.js";

/**
 * Represents the flags that can be applied to a role.
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-flags}
 */
export enum RoleFlags {
  /** Role can be selected by members in an onboarding prompt */
  InPrompt = 1 << 0,
}

/**
 * Represents additional information about a role.
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure}
 */
export const RoleTagsEntity = z.object({
  /** The ID of the bot this role belongs to */
  bot_id: Snowflake.optional(),

  /** The ID of the integration this role belongs to */
  integration_id: Snowflake.optional(),

  /**
   * Whether this is the guild's premium subscriber role
   * When present, this field is null
   */
  premium_subscriber: z.null().optional(),

  /** The ID of this role's subscription SKU and listing */
  subscription_listing_id: Snowflake.optional(),

  /**
   * Whether this role is available for purchase
   * When present, this field is null
   */
  available_for_purchase: z.null().optional(),

  /**
   * Whether this role is a guild's linked role
   * When present, this field is null
   */
  guild_connections: z.null().optional(),
});

export type RoleTagsEntity = z.infer<typeof RoleTagsEntity>;

/**
 * Represents a role within a guild on Discord.
 * Roles represent a set of permissions and can be attached to members.
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-structure}
 */
export const RoleEntity = z.object({
  /** Role ID */
  id: Snowflake,

  /** Role name (1-100 characters) */
  name: z.string().min(1).max(100),

  /** Integer representation of hexadecimal color code */
  color: z.number().int(),

  /** Whether the role is pinned in the user listing */
  hoist: z.boolean(),

  /** Role icon hash */
  icon: z.string().nullish(),

  /** Role unicode emoji */
  unicode_emoji: z.string().emoji().nullish(),

  /** Position of this role in the guild's role hierarchy */
  position: z.number().int(),

  /** Permission bit set as a string representation of a large integer */
  permissions: z.string().regex(/^\d+$/),

  /** Whether this role is managed by an integration */
  managed: z.boolean(),

  /** Whether this role is mentionable */
  mentionable: z.boolean(),

  /** Additional role information */
  tags: z.lazy(() => RoleTagsEntity).optional(),

  /** Role flags combined as a bitfield */
  flags: z.custom<RoleFlags>(BitFieldManager.isValidBitField),
});

export type RoleEntity = z.infer<typeof RoleEntity>;

import type { Integer } from "../formatting/index.js";
import type { BitFieldResolvable, Snowflake } from "../utils/index.js";

/**
 * Represents the flags that can be applied to a role.
 *
 * @remarks
 * Role flags determine special behaviors of roles, such as whether they can be selected
 * during onboarding.
 *
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-flags}
 */
export enum RoleFlags {
  /** Role can be selected by members in an onboarding prompt */
  InPrompt = 1 << 0,
}

/**
 * Represents the tags that can be applied to a role to indicate special properties.
 *
 * @remarks
 * Tags with type null represent booleans. They will be present and set to null if
 * they are "true", and will not be present if they are "false".
 *
 * @example
 * ```typescript
 * const roleTags: RoleTags = {
 *   bot_id: "123456789",
 *   premium_subscriber: null,
 *   guild_connections: null
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure}
 */
export interface RoleTags {
  /** ID of the bot this role belongs to */
  bot_id?: Snowflake;
  /** ID of the integration this role belongs to */
  integration_id?: Snowflake;
  /** Whether this is the guild's premium subscriber (booster) role */
  premium_subscriber?: null;
  /** ID of this role's subscription SKU and listing */
  subscription_listing_id?: Snowflake;
  /** Whether this role is available for purchase */
  available_for_purchase?: null;
  /** Whether this role is a guild's linked role */
  guild_connections?: null;
}

/**
 * Represents a role in Discord.
 *
 * @remarks
 * Roles represent a set of permissions attached to a group of users. They can have
 * specific names, colors, and can be "pinned" to the user listing sidebar. The @everyone
 * role has the same ID as the guild it belongs to.
 *
 * @example
 * ```typescript
 * const role: RoleEntity = {
 *   id: "41771983423143936",
 *   name: "Moderator",
 *   color: 3447003,
 *   hoist: true,
 *   position: 1,
 *   permissions: "66321471",
 *   managed: false,
 *   mentionable: true,
 *   flags: 0
 * };
 * ```
 *
 * Notable behaviors:
 * - Roles without colors (color == 0) don't count towards the final computed color in the user list
 * - Role position is used for permission hierarchy
 * - Managed roles are automatically controlled by integrations or other systems
 * - The @everyone role has the same ID as its guild
 *
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-structure}
 */
export interface RoleEntity {
  /** Role ID */
  id: Snowflake;
  /** Role name */
  name: string;
  /** Integer representation of hexadecimal color code */
  color: Integer;
  /** Whether this role is pinned in the user listing */
  hoist: boolean;
  /** Role icon hash */
  icon?: string | null;
  /** Role unicode emoji */
  unicode_emoji?: string | null;
  /** Position of this role (roles with same position are sorted by ID) */
  position: Integer;
  /** Permission bit set as a string */
  permissions: string;
  /** Whether this role is managed by an integration */
  managed: boolean;
  /** Whether this role is mentionable */
  mentionable: boolean;
  /** The tags this role has */
  tags?: RoleTags;
  /** Role flags combined as a bitfield */
  flags: BitFieldResolvable<RoleFlags>;
}

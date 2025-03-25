import type { Snowflake } from "../managers/index.js";

/**
 * Represents the flags that can be applied to a role.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/topics/permissions.md#role-object-role-flags}
 */
export enum RoleFlags {
  /** Role can be selected by members in an onboarding prompt */
  InPrompt = 1 << 0,
}

/**
 * Interface for role tags
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/topics/permissions.md#role-tags-structure}
 */
export interface RoleTagsEntity {
  /** The ID of the bot this role belongs to */
  bot_id?: Snowflake;

  /** The ID of the integration this role belongs to */
  integration_id?: Snowflake;

  /**
   * Whether this is the guild's premium subscriber role
   * When present, this field is null
   */
  premium_subscriber?: null;

  /** The ID of this role's subscription SKU and listing */
  subscription_listing_id?: Snowflake;

  /**
   * Whether this role is available for purchase
   * When present, this field is null
   */
  available_for_purchase?: null;

  /**
   * Whether this role is a guild's linked role
   * When present, this field is null
   */
  guild_connections?: null;
}

/**
 * Interface for role entities
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/topics/permissions.md#role-object-role-structure}
 */
export interface RoleEntity {
  /** Role ID */
  id: Snowflake;

  /**
   * Role name (1-100 characters)
   * @minLength 1
   * @maxLength 100
   */
  name: string;

  /** Integer representation of hexadecimal color code */
  color: number;

  /** Whether the role is pinned in the user listing */
  hoist: boolean;

  /** Role icon hash */
  icon?: string | null;

  /** Role unicode emoji */
  unicode_emoji?: string | null;

  /** Position of this role in the guild's role hierarchy */
  position: number;

  /** Permission bit set as a string representation of a large integer */
  permissions: string;

  /** Whether this role is managed by an integration */
  managed: boolean;

  /** Whether this role is mentionable */
  mentionable: boolean;

  /** Additional role information */
  tags?: RoleTagsEntity;

  /** Role flags combined as a bitfield */
  flags: RoleFlags;
}

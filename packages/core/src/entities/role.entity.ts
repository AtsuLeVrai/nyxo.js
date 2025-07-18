import type { Snowflake } from "../utils/index.js";

/**
 * Represents the flags that can be applied to a role.
 * Each flag is a bitwise value that can be combined with others.
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-flags}
 */
export enum RoleFlags {
  /**
   * Role can be selected by members in an onboarding prompt.
   * @value 1 << 0 (1)
   */
  InPrompt = 1 << 0,
}

/**
 * Interface for role colors.
 * Represents the color configuration for a role, supporting both single colors and gradients.
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-colors-object}
 */
export interface RoleColorsEntity {
  /**
   * The primary color for the role.
   * This is the main color and will be used as the single color for non-gradient roles.
   */
  primary_color: number;

  /**
   * The secondary color for the role.
   * When set, this will make the role a gradient between the primary and secondary colors.
   * Can only be set if the guild has the ENHANCED_ROLE_COLORS feature.
   */
  secondary_color?: number | null;

  /**
   * The tertiary color for the role.
   * When set, this will turn the gradient into a holographic style.
   * Can only be set if the guild has the ENHANCED_ROLE_COLORS feature.
   * When sending tertiary_color, the API enforces specific values for a holographic style.
   */
  tertiary_color?: number | null;
}

/**
 * Interface for role tags.
 * Tags provide additional information about a role's purpose or source.
 * Tags with type `null` represent booleans. They will be present and set to `null` if they are "true",
 * and will not be present if they are "false".
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure}
 */
export interface RoleTagsEntity {
  /**
   * The ID of the bot this role belongs to.
   * Present if this role is associated with a bot.
   */
  bot_id?: Snowflake;

  /**
   * The ID of the integration this role belongs to.
   * Present if this role is associated with an integration.
   */
  integration_id?: Snowflake;

  /**
   * Whether this is the guild's premium subscriber role.
   * When present, this field is null.
   * Represents the server's boost role.
   */
  premium_subscriber?: null;

  /**
   * The ID of this role's subscription SKU and listing.
   * Present if this role is available through a subscription.
   */
  subscription_listing_id?: Snowflake;

  /**
   * Whether this role is available for purchase.
   * When present, this field is null.
   */
  available_for_purchase?: null;

  /**
   * Whether this role is a guild's linked role.
   * When present, this field is null.
   */
  guild_connections?: null;
}

/**
 * Interface for role entities.
 * Roles represent a set of permissions attached to a group of users.
 * Roles have names, colors, and can be "pinned" to the side bar, causing their members to be listed separately.
 * The `@everyone` role has the same ID as the guild it belongs to.
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-structure}
 */
export interface RoleEntity {
  /**
   * Role ID.
   * Unique identifier for the role.
   */
  id: Snowflake;

  /**
   * Role name (1-100 characters).
   * The display name visible to users.
   */
  name: string;

  /**
   * Integer representation of hexadecimal color code.
   * @deprecated Use the `colors` field instead. This field is still returned for backwards compatibility.
   * Roles without colors (`color == 0`) do not count towards the final computed color in the user list.
   */
  color: number;

  /**
   * The role's color configuration.
   * Contains primary, secondary, and tertiary colors for gradient and holographic effects.
   * Requires the ENHANCED_ROLE_COLORS guild feature for gradient colors.
   */
  colors: RoleColorsEntity;

  /**
   * Whether the role is pinned in the user listing.
   * When true, users with this role are displayed separately in the online members list.
   */
  hoist: boolean;

  /**
   * Role icon hash.
   * Used to display the role's custom icon.
   */
  icon?: string | null;

  /**
   * Role unicode emoji.
   * Used as the role's icon.
   */
  unicode_emoji?: string | null;

  /**
   * Position of this role in the guild's role hierarchy.
   * Roles with the same position are sorted by ID.
   */
  position: number;

  /**
   * Permission bit set as a string representation of a large integer.
   * Defines what actions users with this role can perform.
   */
  permissions: string;

  /**
   * Whether this role is managed by an integration.
   * Managed roles cannot be manually added to or removed from members.
   */
  managed: boolean;

  /**
   * Whether this role is mentionable.
   * Controls if users can @mention this role.
   */
  mentionable: boolean;

  /**
   * Additional role information.
   * Contains metadata about the role's purpose or source.
   */
  tags?: RoleTagsEntity;

  /**
   * Role flags combined as a bitfield.
   * Contains additional role configuration options.
   */
  flags: RoleFlags;
}

/**
 * @description Bitfield flags for Discord roles indicating special behaviors and features.
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-flags}
 */
export enum RoleFlags {
  /**
   * @description Role can be selected by members in an onboarding prompt.
   */
  InPrompt = 1 << 0,
}

/**
 * @description Color configuration for Discord roles supporting gradients and holographic styles.
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-colors-object}
 */
export interface RoleColorsEntity {
  /**
   * @description Primary color for the role (same as legacy color field).
   */
  primary_color: number;
  /**
   * @description Secondary color for gradient effect (requires ENHANCED_ROLE_COLORS guild feature).
   */
  secondary_color?: number | null;
  /**
   * @description Tertiary color for holographic style effect (requires ENHANCED_ROLE_COLORS guild feature).
   */
  tertiary_color?: number | null;
}

/**
 * @description Tag metadata for Discord roles indicating special role types and integrations.
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure}
 */
export interface RoleTagsEntity {
  /**
   * @description Snowflake ID of the bot this role belongs to.
   */
  bot_id?: string;
  /**
   * @description Snowflake ID of the integration this role belongs to.
   */
  integration_id?: string;
  /**
   * @description Whether this is the guild's Nitro Booster role (boolean represented as null when true).
   */
  premium_subscriber?: null;
  /**
   * @description Snowflake ID of this role's subscription SKU and listing.
   */
  subscription_listing_id?: string;
  /**
   * @description Whether this role is available for purchase (boolean represented as null when true).
   */
  available_for_purchase?: null;
  /**
   * @description Whether this role is a guild's linked role (boolean represented as null when true).
   */
  guild_connections?: null;
}

/**
 * @description Represents a Discord guild role with permissions, colors, and hierarchy positioning.
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-structure}
 */
export interface RoleEntity {
  /**
   * @description Unique snowflake identifier for this role.
   */
  id: string;
  /**
   * @description Display name of the role.
   */
  name: string;
  /**
   * @description Legacy integer representation of hexadecimal color code (deprecated, use colors field).
   */
  color: number;
  /**
   * @description Role color configuration supporting gradients and holographic effects.
   */
  colors: RoleColorsEntity;
  /**
   * @description Whether this role is pinned in the user listing sidebar.
   */
  hoist: boolean;
  /**
   * @description Role icon hash for custom role icons.
   */
  icon?: string | null;
  /**
   * @description Unicode emoji used as role icon.
   */
  unicode_emoji?: string | null;
  /**
   * @description Hierarchy position of this role (roles with same position sorted by ID).
   */
  position: number;
  /**
   * @description Permission bitset as string for this role.
   */
  permissions: string;
  /**
   * @description Whether this role is managed by an integration (bot, application, etc.).
   */
  managed: boolean;
  /**
   * @description Whether this role can be mentioned by users.
   */
  mentionable: boolean;
  /**
   * @description Special tags indicating role type and associated integrations.
   */
  tags?: RoleTagsEntity;
  /**
   * @description Bitfield of role flags indicating special behaviors.
   */
  flags: RoleFlags;
}

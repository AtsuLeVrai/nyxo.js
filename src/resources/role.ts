/**
 * Bitfield flags that modify role behavior and visibility within Discord guilds.
 * Controls special role features and user interaction capabilities.
 *
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-flags} for role flags specification
 */
export enum RoleFlags {
  /** Role can be selected by members in guild onboarding prompts */
  InPrompt = 1 << 0,
}

/**
 * Color configuration for Discord roles supporting enhanced visual styling.
 * Enables gradient and holographic effects for guilds with ENHANCED_ROLE_COLORS feature.
 *
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-colors-object} for role colors specification
 */
export interface RoleColorsObject {
  /** Primary color for the role (integer representation of hexadecimal color) */
  readonly primary_color: number;
  /** Secondary color creating gradient effect (requires ENHANCED_ROLE_COLORS feature) */
  readonly secondary_color?: number | null;
  /** Tertiary color enabling holographic style (requires ENHANCED_ROLE_COLORS feature) */
  readonly tertiary_color?: number | null;
}

/**
 * Metadata tags identifying special role types and their associated integrations.
 * Boolean tags are represented as null when true, and omitted when false.
 *
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure} for role tags specification
 */
export interface RoleTagsObject {
  /** Bot ID if this role belongs to a specific bot */
  readonly bot_id?: string;
  /** Integration ID if this role belongs to an integration */
  readonly integration_id?: string;
  /** Boolean tag indicating this is the guild's Server Booster role */
  readonly premium_subscriber?: null;
  /** SKU and listing ID for purchasable subscription roles */
  readonly subscription_listing_id?: string;
  /** Boolean tag indicating this role is available for purchase */
  readonly available_for_purchase?: null;
  /** Boolean tag indicating this is a guild's linked role */
  readonly guild_connections?: null;
}

/**
 * Discord role entity defining permissions, appearance, and hierarchy within guilds.
 * Represents permission sets attached to groups of users with visual customization.
 *
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object} for role object specification
 */
export interface RoleObject {
  /** Unique identifier for the role */
  readonly id: string;
  /** Display name of the role */
  readonly name: string;
  /**
   * Legacy integer color representation (deprecated).
   * @deprecated Use colors.primary_color instead for new implementations
   */
  readonly color: number;
  /** Enhanced color configuration supporting gradients and effects */
  readonly colors: RoleColorsObject;
  /** Whether role is displayed separately in the member list sidebar */
  readonly hoist: boolean;
  /** Role icon hash for image formatting */
  readonly icon?: string | null;
  /** Unicode emoji displayed with the role */
  readonly unicode_emoji?: string | null;
  /** Hierarchical position for permission calculations (higher = more authority) */
  readonly position: number;
  /** Permission bitset as string for long-term stability */
  readonly permissions: string;
  /** Whether role is managed by an integration and cannot be manually assigned */
  readonly managed: boolean;
  /** Whether role can be mentioned to notify all members */
  readonly mentionable: boolean;
  /** Special role metadata and integration associations */
  readonly tags?: RoleTagsObject;
  /** Bitfield of role behavior flags */
  readonly flags: RoleFlags;
}

export enum RoleFlags {
  InPrompt = 1 << 0,
}

export interface RoleColorsObject {
  primary_color: number;
  secondary_color?: number | null;
  tertiary_color?: number | null;
}

export interface RoleTagsObject {
  bot_id?: string;
  integration_id?: string;
  premium_subscriber?: null;
  subscription_listing_id?: string;
  available_for_purchase?: null;
  guild_connections?: null;
}

export interface RoleObject {
  id: string;
  name: string;
  color: number;
  colors: RoleColorsObject;
  hoist: boolean;
  icon?: string | null;
  unicode_emoji?: string | null;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  tags?: RoleTagsObject;
  flags: RoleFlags;
}

/**
 * Checks if a role is hoisted (pinned in user listing)
 * @param role The role to check
 * @returns true if the role is hoisted
 */
export function isRoleHoisted(role: RoleObject): boolean {
  return role.hoist;
}

/**
 * Checks if a role is managed by an integration
 * @param role The role to check
 * @returns true if the role is managed
 */
export function isRoleManaged(role: RoleObject): boolean {
  return role.managed;
}

/**
 * Checks if a role is mentionable
 * @param role The role to check
 * @returns true if the role can be mentioned
 */
export function isRoleMentionable(role: RoleObject): boolean {
  return role.mentionable;
}

/**
 * Checks if a role is a bot role
 * @param role The role to check
 * @returns true if the role belongs to a bot
 */
export function isBotRole(role: RoleObject): boolean {
  return role.tags?.bot_id !== undefined;
}

/**
 * Checks if a role is the premium subscriber role
 * @param role The role to check
 * @returns true if this is the guild's booster role
 */
export function isPremiumSubscriberRole(role: RoleObject): boolean {
  return role.tags?.premium_subscriber !== undefined;
}

/**
 * Checks if a role has an icon
 * @param role The role to check
 * @returns true if the role has a custom icon
 */
export function hasRoleIcon(role: RoleObject): boolean {
  return role.icon !== null && role.icon !== undefined;
}

/**
 * Checks if a role has a unicode emoji
 * @param role The role to check
 * @returns true if the role has a unicode emoji
 */
export function hasRoleUnicodeEmoji(role: RoleObject): boolean {
  return role.unicode_emoji !== null && role.unicode_emoji !== undefined;
}

/**
 * Checks if a role has enhanced colors (gradient/holographic)
 * @param role The role to check
 * @returns true if the role uses enhanced colors
 */
export function hasEnhancedColors(role: RoleObject): boolean {
  return role.colors.secondary_color !== null || role.colors.tertiary_color !== null;
}

/**
 * Checks if a role has the IN_PROMPT flag
 * @param role The role to check
 * @returns true if the role can be selected in onboarding prompts
 */
export function isRoleInPrompt(role: RoleObject): boolean {
  return (role.flags & RoleFlags.InPrompt) === RoleFlags.InPrompt;
}

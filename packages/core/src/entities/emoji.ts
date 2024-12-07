import type { Snowflake } from "../utils/index.js";
import type { UserEntity } from "./user.js";

/**
 * Represents an emoji in Discord.
 *
 * @remarks
 * Emojis can be standard Unicode emojis or custom emojis specific to a guild or application.
 * Custom emojis have an ID and can be managed by the guild or application, while standard emojis only have a name.
 * Premium emojis are a special type that can only be used with server boosts.
 *
 * @example
 * ```typescript
 * // Standard emoji
 * const standardEmoji: EmojiEntity = {
 *   id: null,
 *   name: "🔥"
 * };
 *
 * // Custom guild emoji
 * const customEmoji: EmojiEntity = {
 *   id: "41771983429993937",
 *   name: "LUL",
 *   roles: ["41771983429993000"],
 *   user: {
 *     username: "Luigi",
 *     discriminator: "0002",
 *     id: "96008815106887111"
 *   },
 *   require_colons: true,
 *   managed: false,
 *   animated: false,
 *   available: true
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#emoji-object}
 */
export interface EmojiEntity {
  /**
   * The ID of the emoji.
   * Null for standard Unicode emojis.
   */
  id: Snowflake | null;
  /**
   * The name of the emoji.
   * For standard emojis, this is the Unicode character.
   * For custom emojis, this is the emoji name.
   * Can be null in reaction emoji objects.
   */
  name: string | null;
  /**
   * Array of role IDs allowed to use this emoji.
   * @remarks
   * Premium emojis can have subscription roles, which are roles with an integration_id.
   * An emoji cannot have both subscription roles and non-subscription roles.
   */
  roles?: Snowflake[];
  /**
   * The user that created this emoji.
   * @remarks
   * This field is only available when requesting emoji objects with the appropriate permissions:
   * - For guild emojis: CREATE_GUILD_EXPRESSIONS or MANAGE_GUILD_EXPRESSIONS permissions
   * - For application emojis: Represents the team member that uploaded the emoji
   */
  user?: UserEntity;
  /**
   * Whether this emoji must be wrapped in colons in chat.
   * Always true for custom emojis.
   */
  require_colons?: boolean;
  /**
   * Whether this emoji is managed by an integration (e.g., Twitch).
   */
  managed?: boolean;
  /**
   * Whether this emoji is animated.
   * @remarks
   * This field is returned in MESSAGE_REACTION_ADD, MESSAGE_REACTION_REMOVE
   * and MESSAGE_REACTION_REMOVE_EMOJI gateway events for animated emojis.
   */
  animated?: boolean;
  /**
   * Whether this emoji can be used.
   * May be false due to loss of Server Boosts.
   */
  available?: boolean;
}

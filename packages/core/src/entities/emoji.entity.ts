import type { Snowflake } from "../utils/index.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Interface for a Discord emoji.
 * Represents both standard emoji (Unicode characters) and custom emoji for guilds or applications.
 *
 * There are three main types of emoji:
 * - Standard emoji: Unicode emoji with null ID
 * - Guild emoji: Custom emoji belonging to a specific guild
 * - Application-owned emoji: Custom emoji that can only be used by a specific application
 *
 * @remarks
 * Emojis have a maximum file size of 256 KiB.
 * Each guild can have up to 50 regular custom emoji and 50 animated custom emoji.
 * Premium emoji (with subscription roles) count towards a separate limit of 25.
 * An application can own up to 2000 emojis that can only be used by that app.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#emoji-object}
 */
export interface EmojiEntity {
  /**
   * The unique ID of the emoji.
   * This will be null for standard Unicode emoji.
   * Custom emoji (both guild and application-owned) will have a snowflake ID.
   *
   * @example "41771983429993937" for custom emoji, null for standard emoji like "🔥"
   */
  id: Snowflake | null;

  /**
   * The name of the emoji.
   * For custom emoji, this is the name assigned when created (e.g., "serverboost").
   * For standard emoji, this is the unicode character (e.g., "🔥").
   *
   * @remarks Can be null only in reaction emoji objects in certain gateway events
   * (when custom emoji data is not available, for example, if it was deleted from the guild).
   */
  name: string | null;

  /**
   * Array of role IDs that are allowed to use this emoji.
   * If no roles are specified, the emoji is available to all members in the guild.
   *
   * @remarks
   * - Roles with the `integration_id` tag being the guild's guild_subscription
   *   integration are considered subscription roles.
   * - An emoji cannot have both subscription roles and non-subscription roles.
   * - Emojis with subscription roles are considered premium emoji.
   * - Emojis cannot be converted between normal and premium after creation.
   */
  roles?: Snowflake[];

  /**
   * The user that created this emoji.
   *
   * @remarks
   * - For guild emoji: This field is only returned when the emoji is retrieved with
   *   the `MANAGE_GUILD_EXPRESSIONS` permission, or with the `CREATE_GUILD_EXPRESSIONS`
   *   permission if the current user created the emoji.
   * - For application-owned emoji: This field represents the team member that uploaded
   *   the emoji from the app's settings, or the bot user if uploaded using the API.
   */
  user?: UserEntity;

  /**
   * Whether this emoji must be wrapped in colons to be used in chat.
   * True for most custom emoji that require the format `:emoji_name:`.
   *
   * @remarks This applies to custom emoji, not to standard Unicode emoji.
   */
  require_colons?: boolean;

  /**
   * Whether this emoji is managed by an integration.
   * Managed emoji cannot be modified or deleted by regular users.
   *
   * @remarks
   * Managed emoji are typically created by integrations such as Twitch
   * or Soundboard, and have special behavior.
   */
  managed?: boolean;

  /**
   * Whether this emoji is animated.
   * Animated emoji have a .gif format and play their animation when used.
   *
   * @remarks
   * - Animated emoji use the format `<a:name:id>` in messages.
   * - This field is returned in `MESSAGE_REACTION_ADD`, `MESSAGE_REACTION_REMOVE`,
   *   and `MESSAGE_REACTION_REMOVE_EMOJI` gateway events for animated custom emoji.
   */
  animated?: boolean;

  /**
   * Whether this emoji can be used.
   * May be false due to loss of Server Boosts if it's a guild emoji.
   *
   * @remarks
   * When a guild loses the number of boosts required for certain emoji slots,
   * those emoji become unavailable but are not deleted.
   */
  available?: boolean;
}

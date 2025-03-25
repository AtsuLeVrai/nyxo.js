import type { Snowflake } from "../managers/index.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Interface for a Discord emoji
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/emoji.md#emoji-object}
 */
export interface EmojiEntity {
  /**
   * The ID of the emoji
   * @remarks Standard emoji will have null as ID since they're Unicode characters
   */
  id: Snowflake | null;

  /**
   * The name of the emoji
   * @remarks Can be null in reaction emoji objects
   */
  name: string | null;

  /**
   * Array of role IDs that can use this emoji
   * @remarks Roles allowed to use this emoji
   */
  roles?: Snowflake[];

  /**
   * The user that created this emoji
   * @remarks This field will be returned when the emoji is retrieved with the `MANAGE_GUILD_EXPRESSIONS` permission
   */
  user?: UserEntity;

  /**
   * Whether this emoji must be wrapped in colons
   * @remarks True if the emoji requires colons to be used in chat/etc
   */
  require_colons?: boolean;

  /**
   * Whether this emoji is managed
   * @remarks Indicates if the emoji is managed by an integration (like Twitch)
   */
  managed?: boolean;

  /**
   * Whether this emoji is animated
   * @remarks True if the emoji is animated
   */
  animated?: boolean;

  /**
   * Whether this emoji can be used
   * @remarks May be false due to loss of Server Boosts
   */
  available?: boolean;
}

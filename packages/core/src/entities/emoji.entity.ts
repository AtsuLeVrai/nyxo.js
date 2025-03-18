import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { UserEntity } from "./user.entity.js";

/**
 * Zod schema for a Discord emoji
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/emoji.md#emoji-object}
 */
export const EmojiEntity = z.object({
  /**
   * The ID of the emoji
   * @remarks Standard emoji will have null as ID since they're Unicode characters
   */
  id: Snowflake.nullable(),

  /**
   * The name of the emoji
   * @remarks Can be null in reaction emoji objects
   */
  name: z.string().nullable(),

  /**
   * Array of role IDs that can use this emoji
   * @remarks Roles allowed to use this emoji
   */
  roles: Snowflake.array().optional(),

  /**
   * The user that created this emoji
   * @remarks This field will be returned when the emoji is retrieved with the `MANAGE_GUILD_EXPRESSIONS` permission
   */
  user: z.lazy(() => UserEntity).optional(),

  /**
   * Whether this emoji must be wrapped in colons
   * @remarks True if the emoji requires colons to be used in chat/etc
   */
  require_colons: z.boolean().optional(),

  /**
   * Whether this emoji is managed
   * @remarks Indicates if the emoji is managed by an integration (like Twitch)
   */
  managed: z.boolean().optional(),

  /**
   * Whether this emoji is animated
   * @remarks True if the emoji is animated
   */
  animated: z.boolean().optional(),

  /**
   * Whether this emoji can be used
   * @remarks May be false due to loss of Server Boosts
   */
  available: z.boolean().optional(),
});

export type EmojiEntity = z.infer<typeof EmojiEntity>;

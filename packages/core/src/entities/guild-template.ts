import type { Integer, Iso8601 } from "../formatting/index.js";
import type { Snowflake } from "../utils/index.js";
import type { GuildEntity } from "./guild.js";
import type { UserEntity } from "./user.js";

/**
 * Represents a template that can be used to create new guilds based on a snapshot of an existing guild.
 *
 * @remarks
 * Guild templates allow users to quickly create new guilds with predefined channels, roles, and settings.
 * Templates are created from existing guilds and can be used multiple times.
 * They maintain a snapshot of the source guild's structure, which can be synced when the source guild changes.
 *
 * Creating a guild from a template requires:
 * - For bots: Being in less than 10 guilds
 * - For users: No specific requirements
 *
 * Managing templates requires the MANAGE_GUILD permission.
 *
 * @example
 * ```typescript
 * const template: GuildTemplateEntity = {
 *   code: "hgM48av5Q69A",
 *   name: "Gaming Community",
 *   description: "Perfect setup for gaming communities",
 *   usage_count: 423,
 *   creator_id: "123456789",
 *   creator: {
 *     id: "123456789",
 *     username: "GameMaster",
 *     // ... other user properties
 *   },
 *   created_at: "2023-01-01T12:00:00+00:00",
 *   updated_at: "2023-01-01T12:00:00+00:00",
 *   source_guild_id: "987654321",
 *   serialized_source_guild: {
 *     name: "Original Gaming Server",
 *     // ... partial guild properties
 *   },
 *   is_dirty: false
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#guild-template-object}
 */
export interface GuildTemplateEntity {
  /**
   * The unique identifier code for this template.
   * Used in template URLs and API endpoints.
   */
  code: string;
  /**
   * The name of the template.
   * Must be between 1 and 100 characters long.
   */
  name: string;
  /**
   * The description of the template.
   * Can be null. When provided, must be between 0 and 120 characters long.
   */
  description: string | null;
  /**
   * Number of times this template has been used to create guilds.
   * Increments each time a guild is created using this template.
   */
  usage_count: Integer;
  /**
   * The ID of the user who created this template.
   * This user must have had MANAGE_GUILD permission when creating the template.
   */
  creator_id: Snowflake;
  /**
   * The user object for the creator of this template.
   * Contains user information like username, avatar, etc.
   */
  creator: UserEntity;
  /**
   * Timestamp when this template was created.
   * Uses ISO8601 format.
   */
  created_at: Iso8601;
  /**
   * Timestamp when this template was last synced to the source guild.
   * Updates when the template is synced using the sync endpoint.
   * Uses ISO8601 format.
   */
  updated_at: Iso8601;
  /**
   * The ID of the guild this template was created from.
   * The template maintains a snapshot of this guild's structure.
   */
  source_guild_id: Snowflake;
  /**
   * Partial guild object containing the template's guild configuration.
   * Includes settings like roles, channels, and other guild properties.
   * When creating a new guild, these settings will be applied.
   * Note: IDs in this object are placeholders and will be replaced with actual IDs on guild creation.
   */
  serialized_source_guild: Partial<GuildEntity>;
  /**
   * Whether the template has unsynced changes.
   * True when the source guild has been modified since the template was last synced.
   * Can be null.
   */
  is_dirty: boolean | null;
}

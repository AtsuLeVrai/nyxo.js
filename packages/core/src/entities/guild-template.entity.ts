import type { Snowflake } from "../markdown/index.js";
import type { GuildEntity } from "./guild.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Guild Template structure.
 * Represents a code that when used, creates a guild based on a snapshot of an existing guild.
 * Templates allow users to quickly create new servers with predefined channels, roles, and settings.
 * @see {@link https://discord.com/developers/docs/resources/guild-template#guild-template-object}
 */
export interface GuildTemplateEntity {
  /**
   * The template code (unique ID).
   * A unique identifier for this template that's used when creating new guilds from this template.
   */
  code: string;

  /**
   * Template name.
   * The name displayed for this template in the Discord client.
   */
  name: string;

  /**
   * The description for the template.
   * A brief explanation of what this template includes or is for.
   */
  description: string | null;

  /**
   * Number of times this template has been used.
   * Counter tracking how many guilds have been created using this template.
   */
  usage_count: number;

  /**
   * The ID of the user who created the template.
   * Unique identifier for the template creator.
   */
  creator_id: Snowflake;

  /**
   * The user who created the template.
   * Contains user information about the template creator like username and avatar.
   */
  creator: UserEntity;

  /**
   * When this template was created.
   * ISO8601 timestamp of when the template was initially created.
   */
  created_at: string;

  /**
   * When this template was last synced to the source guild.
   * ISO8601 timestamp of the most recent sync with the source guild.
   */
  updated_at: string;

  /**
   * The ID of the guild this template is based on.
   * Unique identifier for the source guild from which this template was created.
   */
  source_guild_id: Snowflake;

  /**
   * The guild snapshot this template contains.
   * A partial representation of the guild settings and structure captured in this template.
   * Placeholder IDs for channels, roles, etc. are given as integers instead of snowflakes.
   */
  serialized_source_guild: Partial<GuildEntity>;

  /**
   * Whether the template has unsynced changes.
   * Indicates if the source guild has been modified since the template was last synchronized.
   */
  is_dirty: boolean | null;
}

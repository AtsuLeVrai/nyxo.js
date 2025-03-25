import type { Snowflake } from "../managers/index.js";
import type { GuildEntity } from "./guild.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Represents a Discord Guild Template
 * A Guild Template is a code that when used, creates a guild based on a snapshot of an existing guild.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild_template.md#guild-template-object}
 */
export interface GuildTemplateEntity {
  /** The template code (unique ID) */
  code: string;

  /** Template name */
  name: string;

  /** The description for the template (nullable) */
  description: string | null;

  /**
   * Number of times this template has been used
   * @minimum 0
   */
  usage_count: number;

  /** The ID of the user who created the template */
  creator_id: Snowflake;

  /** The user who created the template */
  creator: UserEntity;

  /**
   * When this template was created (ISO8601 timestamp)
   * @format date-time
   * @validate created_at must be a valid ISO8601 timestamp
   */
  created_at: string;

  /**
   * When this template was last synced to the source guild (ISO8601 timestamp)
   * @format date-time
   * @validate updated_at must be a valid ISO8601 timestamp
   */
  updated_at: string;

  /** The ID of the guild this template is based on */
  source_guild_id: Snowflake;

  /** The guild snapshot this template contains; placeholder IDs are given as integers */
  serialized_source_guild: Partial<GuildEntity>;

  /** Whether the template has unsynced changes (nullable) */
  is_dirty: boolean | null;
}

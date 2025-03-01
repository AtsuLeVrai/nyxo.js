import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { GuildEntity } from "./guild.entity.js";
import { UserEntity } from "./user.entity.js";

/**
 * Represents a Discord Guild Template
 * A Guild Template is a code that when used, creates a guild based on a snapshot of an existing guild.
 * @see {@link https://discord.com/developers/docs/resources/guild-template#guild-template-object}
 */
export const GuildTemplateEntity = z.object({
  /** The template code (unique ID) */
  code: z.string(),

  /** Template name */
  name: z.string(),

  /** The description for the template (nullable) */
  description: z.string().nullable(),

  /** Number of times this template has been used */
  usage_count: z.number().int(),

  /** The ID of the user who created the template */
  creator_id: Snowflake,

  /** The user who created the template */
  creator: z.lazy(() => UserEntity),

  /** When this template was created (ISO8601 timestamp) */
  created_at: z.string().datetime(),

  /** When this template was last synced to the source guild (ISO8601 timestamp) */
  updated_at: z.string().datetime(),

  /** The ID of the guild this template is based on */
  source_guild_id: Snowflake,

  /** The guild snapshot this template contains; placeholder IDs are given as integers */
  serialized_source_guild: z.lazy(() => GuildEntity.partial()),

  /** Whether the template has unsynced changes (nullable) */
  is_dirty: z.boolean().nullable(),
});

export type GuildTemplateEntity = z.infer<typeof GuildTemplateEntity>;

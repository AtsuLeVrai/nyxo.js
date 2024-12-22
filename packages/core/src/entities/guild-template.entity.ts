import type { Integer, Iso8601 } from "../formatting/index.js";
import type { Snowflake } from "../managers/index.js";
import type { GuildEntity } from "./guild.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#guild-template-object}
 */
export interface GuildTemplateEntity {
  code: string;
  name: string;
  description: string | null;
  usage_count: Integer;
  creator_id: Snowflake;
  creator: UserEntity;
  created_at: Iso8601;
  updated_at: Iso8601;
  source_guild_id: Snowflake;
  serialized_source_guild: Partial<GuildEntity>;
  is_dirty: boolean | null;
}

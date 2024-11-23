import type { Integer, Iso8601, Snowflake } from "../formatting/index.js";
import type { GuildEntity } from "./guild.js";
import type { UserEntity } from "./user.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#guild-template-object-guild-template-structure}
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

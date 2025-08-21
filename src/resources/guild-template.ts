import type { Snowflake } from "../common/index.js";
import type { GuildObject } from "./guild.js";
import type { UserObject } from "./user.js";

export interface GuildTemplateObject {
  code: string;
  name: string;
  description: string | null;
  usage_count: number;
  creator_id: Snowflake;
  creator: UserObject;
  created_at: string;
  updated_at: string;
  source_guild_id: Snowflake;
  serialized_source_guild: Partial<GuildObject>;
  is_dirty: boolean | null;
}

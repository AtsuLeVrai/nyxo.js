import type { GuildEntity } from "../guild/index.js";
import type { UserEntity } from "../user/index.js";

export interface GuildTemplateEntity {
  code: string;
  name: string;
  description: string | null;
  usage_count: number;
  creator_id: string;
  creator: UserEntity;
  created_at: string;
  updated_at: string;
  source_guild_id: string;
  serialized_source_guild: Partial<GuildEntity>;
  is_dirty: boolean | null;
}

import type { FileInput } from "../utils/index.js";
import type { GuildEntity } from "./guild.js";
import type { UserObject } from "./user.js";

export interface GuildTemplateObject {
  readonly code: string;

  readonly name: string;

  readonly description: string | null;

  readonly usage_count: number;

  readonly creator_id: string;

  readonly creator: UserObject;

  readonly created_at: string;

  readonly updated_at: string;

  readonly source_guild_id: string;

  readonly serialized_source_guild: Partial<GuildEntity>;

  readonly is_dirty: boolean | null;
}

export interface CreateGuildFromTemplateJSONParams extends Pick<GuildTemplateObject, "name"> {
  readonly icon?: FileInput;
}

export type CreateGuildTemplateJSONParams = Pick<GuildTemplateObject, "name"> &
  Partial<Pick<GuildTemplateObject, "description">>;

export type ModifyGuildTemplateJSONParams = Partial<CreateGuildTemplateJSONParams>;

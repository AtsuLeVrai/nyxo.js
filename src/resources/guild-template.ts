import type { Snowflake } from "../common/index.js";
import type { EndpointFactory } from "../utils/index.js";
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

// Guild Template Request Interfaces
export interface CreateGuildTemplateRequest {
  name: string;
  description?: string | null;
}

export interface ModifyGuildTemplateRequest {
  name?: string;
  description?: string | null;
}

export const GuildTemplateRoutes = {
  // GET /guilds/templates/{template.code} - Get Guild Template
  getGuildTemplate: ((templateCode: string) =>
    `/guilds/templates/${templateCode}`) as EndpointFactory<
    `/guilds/templates/${string}`,
    ["GET"],
    GuildTemplateObject
  >,

  // GET /guilds/{guild.id}/templates - Get Guild Templates
  getGuildTemplates: ((guildId: Snowflake) => `/guilds/${guildId}/templates`) as EndpointFactory<
    `/guilds/${string}/templates`,
    ["GET", "POST"],
    GuildTemplateObject[],
    true,
    false,
    CreateGuildTemplateRequest
  >,

  // PUT /guilds/{guild.id}/templates/{template.code} - Sync Guild Template
  syncGuildTemplate: ((guildId: Snowflake, templateCode: string) =>
    `/guilds/${guildId}/templates/${templateCode}`) as EndpointFactory<
    `/guilds/${string}/templates/${string}`,
    ["PUT", "PATCH", "DELETE"],
    GuildTemplateObject,
    true,
    false,
    ModifyGuildTemplateRequest
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;

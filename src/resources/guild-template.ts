import type { GuildEntity } from "./guild/index.js";

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

export interface GuildFromTemplateCreateOptions {
  name: string;
  icon?: FileInput;
}

export interface GuildTemplateCreateOptions {
  name: string;
  description?: string | null;
}

export type GuildTemplateUpdateOptions = Partial<GuildTemplateCreateOptions>;

export const GuildTemplateRoutes = {
  templateByCodeEndpoint: (code: string) => `/guilds/templates/${code}` as const,
  guildTemplatesEndpoint: (guildId: string) => `/guilds/${guildId}/templates` as const,
  guildTemplateByCodeEndpoint: (guildId: string, code: string) =>
    `/guilds/${guildId}/templates/${code}` as const,
} as const satisfies RouteBuilder;

export class GuildTemplateRouter extends BaseRouter {
  fetchGuildTemplate(code: string): Promise<GuildTemplateEntity> {
    return this.rest.get(GuildTemplateRoutes.templateByCodeEndpoint(code));
  }

  async createGuildFromTemplate(
    code: string,
    options: GuildFromTemplateCreateOptions,
  ): Promise<GuildEntity> {
    const processedOptions = await this.processFileOptions(options, ["icon"]);
    return this.rest.post(GuildTemplateRoutes.templateByCodeEndpoint(code), {
      body: JSON.stringify(processedOptions),
    });
  }

  fetchGuildTemplates(guildId: string): Promise<GuildTemplateEntity[]> {
    return this.rest.get(GuildTemplateRoutes.guildTemplatesEndpoint(guildId));
  }

  createGuildTemplate(
    guildId: string,
    options: GuildTemplateCreateOptions,
  ): Promise<GuildTemplateEntity> {
    return this.rest.post(GuildTemplateRoutes.guildTemplatesEndpoint(guildId), {
      body: JSON.stringify(options),
    });
  }

  syncGuildTemplate(guildId: string, code: string): Promise<GuildTemplateEntity> {
    return this.rest.put(GuildTemplateRoutes.guildTemplateByCodeEndpoint(guildId, code));
  }

  updateGuildTemplate(
    guildId: string,
    code: string,
    options: GuildTemplateUpdateOptions,
  ): Promise<GuildTemplateEntity> {
    return this.rest.patch(GuildTemplateRoutes.guildTemplateByCodeEndpoint(guildId, code), {
      body: JSON.stringify(options),
    });
  }

  deleteGuildTemplate(guildId: string, code: string): Promise<GuildTemplateEntity> {
    return this.rest.delete(GuildTemplateRoutes.guildTemplateByCodeEndpoint(guildId, code));
  }
}

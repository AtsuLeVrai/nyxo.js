import type { FileInput, Rest } from "../../core/index.js";
import type { GuildEntity } from "../guild/index.js";
import type { GuildTemplateEntity } from "./guild-template.entity.js";

export interface GuildFromTemplateCreateOptions {
  name: string;
  icon?: FileInput;
}

export interface GuildTemplateCreateOptions {
  name: string;
  description?: string | null;
}

export type GuildTemplateUpdateOptions = Partial<GuildTemplateCreateOptions>;

export class GuildTemplateRouter {
  static readonly Routes = {
    templateByCodeEndpoint: (code: string) => `/guilds/templates/${code}` as const,
    guildTemplatesEndpoint: (guildId: string) => `/guilds/${guildId}/templates` as const,
    guildTemplateByCodeEndpoint: (guildId: string, code: string) =>
      `/guilds/${guildId}/templates/${code}` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchGuildTemplate(code: string): Promise<GuildTemplateEntity> {
    return this.#rest.get(GuildTemplateRouter.Routes.templateByCodeEndpoint(code));
  }
  async createGuildFromTemplate(
    code: string,
    options: GuildFromTemplateCreateOptions,
  ): Promise<GuildEntity> {
    const processedOptions = { ...options };
    if (processedOptions.icon) {
      processedOptions.icon = await this.#rest.toDataUri(processedOptions.icon);
    }
    return this.#rest.post(GuildTemplateRouter.Routes.templateByCodeEndpoint(code), {
      body: JSON.stringify(processedOptions),
    });
  }
  fetchGuildTemplates(guildId: string): Promise<GuildTemplateEntity[]> {
    return this.#rest.get(GuildTemplateRouter.Routes.guildTemplatesEndpoint(guildId));
  }
  createGuildTemplate(
    guildId: string,
    options: GuildTemplateCreateOptions,
  ): Promise<GuildTemplateEntity> {
    return this.#rest.post(GuildTemplateRouter.Routes.guildTemplatesEndpoint(guildId), {
      body: JSON.stringify(options),
    });
  }
  syncGuildTemplate(guildId: string, code: string): Promise<GuildTemplateEntity> {
    return this.#rest.put(GuildTemplateRouter.Routes.guildTemplateByCodeEndpoint(guildId, code));
  }
  updateGuildTemplate(
    guildId: string,
    code: string,
    options: GuildTemplateUpdateOptions,
  ): Promise<GuildTemplateEntity> {
    return this.#rest.patch(GuildTemplateRouter.Routes.guildTemplateByCodeEndpoint(guildId, code), {
      body: JSON.stringify(options),
    });
  }
  deleteGuildTemplate(guildId: string, code: string): Promise<GuildTemplateEntity> {
    return this.#rest.delete(GuildTemplateRouter.Routes.guildTemplateByCodeEndpoint(guildId, code));
  }
}

import type { GuildEntity, GuildTemplateEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type { ImageData } from "../types/index.js";

interface CreateFromTemplate {
  name: string;
  icon?: ImageData;
}

interface CreateTemplate {
  name: string;
  description?: string | null;
}

interface ModifyTemplate {
  name?: string;
  description?: string | null;
}

export class GuildTemplateRoutes {
  static routes = {
    templates: "/guilds/templates",
    template: (code: string): `/guilds/templates/${string}` => {
      return `/guilds/templates/${code}` as const;
    },
    guildTemplates: (guildId: Snowflake): `/guilds/${Snowflake}/templates` => {
      return `/guilds/${guildId}/templates` as const;
    },
    guildTemplate: (
      guildId: Snowflake,
      code: string,
    ): `/guilds/${Snowflake}/templates/${string}` => {
      return `/guilds/${guildId}/templates/${code}` as const;
    },
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-template}
   */
  getTemplate(code: string): Promise<GuildTemplateEntity> {
    return this.#rest.get(GuildTemplateRoutes.routes.template(code));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template}
   */
  createGuildFrom(
    code: string,
    options: CreateFromTemplate,
  ): Promise<GuildEntity> {
    return this.#rest.post(GuildTemplateRoutes.routes.template(code), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-templates}
   */
  getTemplates(guildId: Snowflake): Promise<GuildTemplateEntity[]> {
    return this.#rest.get(GuildTemplateRoutes.routes.guildTemplates(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template}
   */
  create(
    guildId: Snowflake,
    options: CreateTemplate,
  ): Promise<GuildTemplateEntity> {
    return this.#rest.post(GuildTemplateRoutes.routes.guildTemplates(guildId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#sync-guild-template}
   */
  sync(guildId: Snowflake, code: string): Promise<GuildTemplateEntity> {
    return this.#rest.put(
      GuildTemplateRoutes.routes.guildTemplate(guildId, code),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template}
   */
  modify(
    guildId: Snowflake,
    code: string,
    options: ModifyTemplate,
  ): Promise<GuildTemplateEntity> {
    return this.#rest.patch(
      GuildTemplateRoutes.routes.guildTemplate(guildId, code),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#delete-guild-template}
   */
  delete(guildId: Snowflake, code: string): Promise<GuildTemplateEntity> {
    return this.#rest.delete(
      GuildTemplateRoutes.routes.guildTemplate(guildId, code),
    );
  }
}

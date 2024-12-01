import type { GuildEntity, GuildTemplateEntity, Snowflake } from "@nyxjs/core";
import type { ImageData } from "../types/index.js";
import { Router } from "./router.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template-json-params}
 */
export interface CreateFromTemplate extends Pick<GuildTemplateEntity, "name"> {
  icon?: ImageData;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template-json-params}
 */
export type CreateTemplate = Pick<GuildTemplateEntity, "name" | "description">;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template-json-params}
 */
export type ModifyTemplate = Partial<
  Pick<GuildTemplateEntity, "name" | "description">
>;

export class GuildTemplateRouter extends Router {
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

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-template}
   */
  getTemplate(code: string): Promise<GuildTemplateEntity> {
    return this.get(GuildTemplateRouter.routes.template(code));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template}
   */
  createGuildFrom(
    code: string,
    options: CreateFromTemplate,
  ): Promise<GuildEntity> {
    return this.post(GuildTemplateRouter.routes.template(code), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-templates}
   */
  getTemplates(guildId: Snowflake): Promise<GuildTemplateEntity[]> {
    return this.get(GuildTemplateRouter.routes.guildTemplates(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template}
   */
  create(
    guildId: Snowflake,
    options: CreateTemplate,
  ): Promise<GuildTemplateEntity> {
    return this.post(GuildTemplateRouter.routes.guildTemplates(guildId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#sync-guild-template}
   */
  sync(guildId: Snowflake, code: string): Promise<GuildTemplateEntity> {
    return this.put(GuildTemplateRouter.routes.guildTemplate(guildId, code));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template}
   */
  modify(
    guildId: Snowflake,
    code: string,
    options: ModifyTemplate,
  ): Promise<GuildTemplateEntity> {
    return this.patch(GuildTemplateRouter.routes.guildTemplate(guildId, code), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#delete-guild-template}
   */
  deleteTemplate(
    guildId: Snowflake,
    code: string,
  ): Promise<GuildTemplateEntity> {
    return this.delete(GuildTemplateRouter.routes.guildTemplate(guildId, code));
  }
}

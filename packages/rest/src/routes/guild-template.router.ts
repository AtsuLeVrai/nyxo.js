import type { GuildEntity, GuildTemplateEntity, Snowflake } from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";
import {
  type CreateGuildFromGuildTemplateEntity,
  CreateGuildFromGuildTemplateSchema,
  type CreateGuildTemplateEntity,
  CreateGuildTemplateSchema,
  type ModifyGuildTemplateEntity,
  ModifyStageInstanceSchema,
} from "../schemas/index.js";

export class GuildTemplateRouter extends BaseRouter {
  static ROUTES = {
    templates: "/guilds/templates",
    template: (code: string): `/guilds/templates/${string}` => {
      return `/guilds/templates/${code}`;
    },
    guildTemplates: (guildId: Snowflake): `/guilds/${Snowflake}/templates` => {
      return `/guilds/${guildId}/templates`;
    },
    guildTemplate: (
      guildId: Snowflake,
      code: string,
    ): `/guilds/${Snowflake}/templates/${string}` => {
      return `/guilds/${guildId}/templates/${code}`;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-template}
   */
  getTemplate(code: string): Promise<GuildTemplateEntity> {
    return this.get(GuildTemplateRouter.ROUTES.template(code));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template}
   */
  createGuildFrom(
    code: string,
    options: CreateGuildFromGuildTemplateEntity,
  ): Promise<GuildEntity> {
    const result = CreateGuildFromGuildTemplateSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.post(GuildTemplateRouter.ROUTES.template(code), {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-templates}
   */
  getTemplates(guildId: Snowflake): Promise<GuildTemplateEntity[]> {
    return this.get(GuildTemplateRouter.ROUTES.guildTemplates(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template}
   */
  create(
    guildId: Snowflake,
    options: CreateGuildTemplateEntity,
  ): Promise<GuildTemplateEntity> {
    const result = CreateGuildTemplateSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.post(GuildTemplateRouter.ROUTES.guildTemplates(guildId), {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#sync-guild-template}
   */
  sync(guildId: Snowflake, code: string): Promise<GuildTemplateEntity> {
    return this.put(GuildTemplateRouter.ROUTES.guildTemplate(guildId, code));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template}
   */
  modify(
    guildId: Snowflake,
    code: string,
    options: ModifyGuildTemplateEntity,
  ): Promise<GuildTemplateEntity> {
    const result = ModifyStageInstanceSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.patch(GuildTemplateRouter.ROUTES.guildTemplate(guildId, code), {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#delete-guild-template}
   */
  deleteTemplate(
    guildId: Snowflake,
    code: string,
  ): Promise<GuildTemplateEntity> {
    return this.delete(GuildTemplateRouter.ROUTES.guildTemplate(guildId, code));
  }
}

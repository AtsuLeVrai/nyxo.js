import type { GuildEntity, GuildTemplateEntity, Snowflake } from "@nyxjs/core";
import type { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../rest.js";
import {
  CreateGuildFromGuildTemplateEntity,
  CreateGuildTemplateEntity,
  ModifyGuildTemplateEntity,
} from "../schemas/index.js";

export class GuildTemplateRouter {
  static ROUTES = {
    templates: "/guilds/templates" as const,
    template: (code: string) => `/guilds/templates/${code}` as const,
    guildTemplates: (guildId: Snowflake) =>
      `/guilds/${guildId}/templates` as const,
    guildTemplate: (guildId: Snowflake, code: string) =>
      `/guilds/${guildId}/templates/${code}` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-template}
   */
  getGuildTemplate(code: string): Promise<GuildTemplateEntity> {
    return this.#rest.get(GuildTemplateRouter.ROUTES.template(code));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template}
   */
  createGuildFromGuildTemplate(
    code: string,
    options: z.input<typeof CreateGuildFromGuildTemplateEntity>,
  ): Promise<GuildEntity> {
    const result = CreateGuildFromGuildTemplateEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(GuildTemplateRouter.ROUTES.template(code), {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-templates}
   */
  getGuildTemplates(guildId: Snowflake): Promise<GuildTemplateEntity[]> {
    return this.#rest.get(GuildTemplateRouter.ROUTES.guildTemplates(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template}
   */
  createGuildTemplate(
    guildId: Snowflake,
    options: z.input<typeof CreateGuildTemplateEntity>,
  ): Promise<GuildTemplateEntity> {
    const result = CreateGuildTemplateEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(GuildTemplateRouter.ROUTES.guildTemplates(guildId), {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#sync-guild-template}
   */
  syncGuildTemplate(
    guildId: Snowflake,
    code: string,
  ): Promise<GuildTemplateEntity> {
    return this.#rest.put(
      GuildTemplateRouter.ROUTES.guildTemplate(guildId, code),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template}
   */
  modifyGuildTemplate(
    guildId: Snowflake,
    code: string,
    options: z.input<typeof ModifyGuildTemplateEntity>,
  ): Promise<GuildTemplateEntity> {
    const result = ModifyGuildTemplateEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(
      GuildTemplateRouter.ROUTES.guildTemplate(guildId, code),
      {
        body: JSON.stringify(result.data),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#delete-guild-template}
   */
  deleteGuildTemplate(
    guildId: Snowflake,
    code: string,
  ): Promise<GuildTemplateEntity> {
    return this.#rest.delete(
      GuildTemplateRouter.ROUTES.guildTemplate(guildId, code),
    );
  }
}

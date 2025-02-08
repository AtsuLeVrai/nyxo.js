import type { GuildEntity, GuildTemplateEntity, Snowflake } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import { BaseRouter } from "../base/index.js";
import {
  CreateGuildFromGuildTemplateSchema,
  CreateGuildTemplateSchema,
  ModifyGuildTemplateSchema,
} from "../schemas/index.js";

export class GuildTemplateRouter extends BaseRouter {
  static readonly ROUTES = {
    guildTemplatesDefault: "/guilds/templates" as const,
    guildTemplateDefault: (code: string) =>
      `/guilds/templates/${code}` as const,
    guildTemplates: (guildId: Snowflake) =>
      `/guilds/${guildId}/templates` as const,
    guildTemplate: (guildId: Snowflake, code: string) =>
      `/guilds/${guildId}/templates/${code}` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-template}
   */
  getGuildTemplate(code: string): Promise<GuildTemplateEntity> {
    return this.rest.get(
      GuildTemplateRouter.ROUTES.guildTemplateDefault(code),
      undefined,
      this.sessionId,
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template}
   */
  async createGuildFromGuildTemplate(
    code: string,
    options: CreateGuildFromGuildTemplateSchema,
  ): Promise<GuildEntity> {
    const result =
      await CreateGuildFromGuildTemplateSchema.safeParseAsync(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.post(
      GuildTemplateRouter.ROUTES.guildTemplateDefault(code),
      {
        body: JSON.stringify(result.data),
      },
      this.sessionId,
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-templates}
   */
  getGuildTemplates(guildId: Snowflake): Promise<GuildTemplateEntity[]> {
    return this.rest.get(
      GuildTemplateRouter.ROUTES.guildTemplates(guildId),
      undefined,
      this.sessionId,
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template}
   */
  createGuildTemplate(
    guildId: Snowflake,
    options: CreateGuildTemplateSchema,
  ): Promise<GuildTemplateEntity> {
    const result = CreateGuildTemplateSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.post(
      GuildTemplateRouter.ROUTES.guildTemplates(guildId),
      {
        body: JSON.stringify(result.data),
      },
      this.sessionId,
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#sync-guild-template}
   */
  syncGuildTemplate(
    guildId: Snowflake,
    code: string,
  ): Promise<GuildTemplateEntity> {
    return this.rest.put(
      GuildTemplateRouter.ROUTES.guildTemplate(guildId, code),
      undefined,
      this.sessionId,
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template}
   */
  modifyGuildTemplate(
    guildId: Snowflake,
    code: string,
    options: ModifyGuildTemplateSchema,
  ): Promise<GuildTemplateEntity> {
    const result = ModifyGuildTemplateSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.patch(
      GuildTemplateRouter.ROUTES.guildTemplate(guildId, code),
      {
        body: JSON.stringify(result.data),
      },
      this.sessionId,
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-template#delete-guild-template}
   */
  deleteGuildTemplate(
    guildId: Snowflake,
    code: string,
  ): Promise<GuildTemplateEntity> {
    return this.rest.delete(
      GuildTemplateRouter.ROUTES.guildTemplate(guildId, code),
      undefined,
      this.sessionId,
    );
  }
}

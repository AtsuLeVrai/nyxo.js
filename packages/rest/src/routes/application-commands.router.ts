import type {
  ApplicationCommandEntity,
  GuildApplicationCommandPermissionEntity,
  Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../rest.js";
import {
  CreateGlobalApplicationCommandEntity,
  CreateGuildApplicationCommandEntity,
  EditApplicationCommandPermissionsEntity,
  EditGlobalApplicationCommandEntity,
  EditGuildApplicationCommandEntity,
} from "../schemas/index.js";
import type { HttpResponse } from "../types/index.js";

export class ApplicationCommandRouter {
  static readonly ROUTES = {
    base: (applicationId: Snowflake) =>
      `/applications/${applicationId}/commands` as const,
    command: (applicationId: Snowflake, commandId: Snowflake) =>
      `/applications/${applicationId}/commands/${commandId}` as const,
    guildCommands: (applicationId: Snowflake, guildId: Snowflake) =>
      `/applications/${applicationId}/guilds/${guildId}/commands` as const,
    guildCommand: (
      applicationId: Snowflake,
      guildId: Snowflake,
      commandId: Snowflake,
    ) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}` as const,
    guildCommandsPermissions: (applicationId: Snowflake, guildId: Snowflake) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/permissions` as const,
    guildCommandPermissions: (
      applicationId: Snowflake,
      guildId: Snowflake,
      commandId: Snowflake,
    ) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}/permissions` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-commands}
   */
  getGlobalCommands(
    applicationId: Snowflake,
    withLocalizations = false,
  ): Promise<HttpResponse<ApplicationCommandEntity[]>> {
    return this.#rest.get(ApplicationCommandRouter.ROUTES.base(applicationId), {
      query: { with_localizations: withLocalizations },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command}
   */
  createGlobalApplicationCommand(
    applicationId: Snowflake,
    options: z.input<typeof CreateGlobalApplicationCommandEntity>,
  ): Promise<HttpResponse<ApplicationCommandEntity>> {
    const result = CreateGlobalApplicationCommandEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(
      ApplicationCommandRouter.ROUTES.base(applicationId),
      {
        body: JSON.stringify(result.data),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-command}
   */
  getGlobalApplicationCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
  ): Promise<HttpResponse<ApplicationCommandEntity>> {
    return this.#rest.get(
      ApplicationCommandRouter.ROUTES.command(applicationId, commandId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command}
   */
  editGlobalApplicationCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
    options: z.input<typeof EditGlobalApplicationCommandEntity>,
  ): Promise<HttpResponse<ApplicationCommandEntity>> {
    const result = EditGlobalApplicationCommandEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(
      ApplicationCommandRouter.ROUTES.command(applicationId, commandId),
      { body: JSON.stringify(result.data) },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-global-application-command}
   */
  deleteGlobalApplicationCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
  ): Promise<HttpResponse<void>> {
    return this.#rest.delete(
      ApplicationCommandRouter.ROUTES.command(applicationId, commandId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands}
   */
  bulkOverwriteGlobalApplicationCommands(
    applicationId: Snowflake,
    commands: z.input<typeof CreateGlobalApplicationCommandEntity>[],
  ): Promise<HttpResponse<ApplicationCommandEntity[]>> {
    const result = z
      .array(CreateGlobalApplicationCommandEntity)
      .max(200)
      .safeParse(commands);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.put(ApplicationCommandRouter.ROUTES.base(applicationId), {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands}
   */
  getGuildApplicationCommands(
    applicationId: Snowflake,
    guildId: Snowflake,
    withLocalizations = false,
  ): Promise<HttpResponse<ApplicationCommandEntity[]>> {
    return this.#rest.get(
      ApplicationCommandRouter.ROUTES.guildCommands(applicationId, guildId),
      {
        query: { with_localizations: withLocalizations },
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command}
   */
  createGuildApplicationCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    options: z.input<typeof CreateGuildApplicationCommandEntity>,
  ): Promise<HttpResponse<ApplicationCommandEntity>> {
    const result = CreateGuildApplicationCommandEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(
      ApplicationCommandRouter.ROUTES.guildCommands(applicationId, guildId),
      {
        body: JSON.stringify(result.data),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command}
   */
  getGuildApplicationCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
  ): Promise<HttpResponse<ApplicationCommandEntity>> {
    return this.#rest.get(
      ApplicationCommandRouter.ROUTES.guildCommand(
        applicationId,
        guildId,
        commandId,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command}
   */
  editGuildApplicationCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
    options: z.input<typeof EditGuildApplicationCommandEntity>,
  ): Promise<HttpResponse<ApplicationCommandEntity>> {
    const result = EditGuildApplicationCommandEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(
      ApplicationCommandRouter.ROUTES.guildCommand(
        applicationId,
        guildId,
        commandId,
      ),
      {
        body: JSON.stringify(result.data),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-guild-application-command}
   */
  deleteGuildApplicationCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
  ): Promise<HttpResponse<void>> {
    return this.#rest.delete(
      ApplicationCommandRouter.ROUTES.guildCommand(
        applicationId,
        guildId,
        commandId,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands}
   */
  bulkOverwriteGuildApplicationCommands(
    applicationId: Snowflake,
    guildId: Snowflake,
    commands: z.input<typeof CreateGlobalApplicationCommandEntity>[],
  ): Promise<HttpResponse<ApplicationCommandEntity[]>> {
    const result = z
      .array(CreateGlobalApplicationCommandEntity)
      .max(200)
      .safeParse(commands);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.put(
      ApplicationCommandRouter.ROUTES.guildCommands(applicationId, guildId),
      {
        body: JSON.stringify(result.data),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command-permissions}
   */
  getGuildApplicationCommandPermissions(
    applicationId: Snowflake,
    guildId: Snowflake,
  ): Promise<HttpResponse<GuildApplicationCommandPermissionEntity[]>> {
    return this.#rest.get(
      ApplicationCommandRouter.ROUTES.guildCommandsPermissions(
        applicationId,
        guildId,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-application-command-permissions}
   */
  getApplicationCommandPermissions(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
  ): Promise<HttpResponse<GuildApplicationCommandPermissionEntity>> {
    return this.#rest.get(
      ApplicationCommandRouter.ROUTES.guildCommandPermissions(
        applicationId,
        guildId,
        commandId,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions}
   */
  editApplicationCommandPermissions(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
    options: z.input<typeof EditApplicationCommandPermissionsEntity>,
  ): Promise<HttpResponse<GuildApplicationCommandPermissionEntity>> {
    const result = EditApplicationCommandPermissionsEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.put(
      ApplicationCommandRouter.ROUTES.guildCommandPermissions(
        applicationId,
        guildId,
        commandId,
      ),
      {
        body: JSON.stringify(result.data),
      },
    );
  }
}

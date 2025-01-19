import type {
  ApplicationCommandEntity,
  GuildApplicationCommandPermissionEntity,
  Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../rest.js";
import {
  CreateGlobalApplicationCommandSchema,
  CreateGuildApplicationCommandSchema,
  EditApplicationCommandPermissionsSchema,
  EditGlobalApplicationCommandSchema,
  EditGuildApplicationCommandSchema,
} from "../schemas/index.js";

export class ApplicationCommandRouter {
  static readonly ROUTES = {
    applicationsCommands: (applicationId: Snowflake) =>
      `/applications/${applicationId}/commands` as const,
    applicationsCommandsId: (applicationId: Snowflake, commandId: Snowflake) =>
      `/applications/${applicationId}/commands/${commandId}` as const,
    applicationsGuildCommands: (applicationId: Snowflake, guildId: Snowflake) =>
      `/applications/${applicationId}/guilds/${guildId}/commands` as const,
    applicationsGuildCommandsId: (
      applicationId: Snowflake,
      guildId: Snowflake,
      commandId: Snowflake,
    ) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}` as const,
    applicationsGuildCommandsPermissions: (
      applicationId: Snowflake,
      guildId: Snowflake,
    ) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/permissions` as const,
    applicationsGuildCommandsPermissionsId: (
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
  ): Promise<ApplicationCommandEntity[]> {
    return this.#rest.get(
      ApplicationCommandRouter.ROUTES.applicationsCommands(applicationId),
      {
        query: { with_localizations: withLocalizations },
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command}
   */
  createGlobalApplicationCommand(
    applicationId: Snowflake,
    options: CreateGlobalApplicationCommandSchema,
  ): Promise<ApplicationCommandEntity> {
    const result = CreateGlobalApplicationCommandSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(
      ApplicationCommandRouter.ROUTES.applicationsCommands(applicationId),
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
  ): Promise<ApplicationCommandEntity> {
    return this.#rest.get(
      ApplicationCommandRouter.ROUTES.applicationsCommandsId(
        applicationId,
        commandId,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command}
   */
  editGlobalApplicationCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
    options: EditGlobalApplicationCommandSchema,
  ): Promise<ApplicationCommandEntity> {
    const result = EditGlobalApplicationCommandSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(
      ApplicationCommandRouter.ROUTES.applicationsCommandsId(
        applicationId,
        commandId,
      ),
      { body: JSON.stringify(result.data) },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-global-application-command}
   */
  deleteGlobalApplicationCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      ApplicationCommandRouter.ROUTES.applicationsCommandsId(
        applicationId,
        commandId,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands}
   */
  bulkOverwriteGlobalApplicationCommands(
    applicationId: Snowflake,
    commands: CreateGlobalApplicationCommandSchema[],
  ): Promise<ApplicationCommandEntity[]> {
    const result = z
      .array(CreateGlobalApplicationCommandSchema)
      .max(200)
      .safeParse(commands);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.put(
      ApplicationCommandRouter.ROUTES.applicationsCommands(applicationId),
      {
        body: JSON.stringify(result.data),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands}
   */
  getGuildApplicationCommands(
    applicationId: Snowflake,
    guildId: Snowflake,
    withLocalizations = false,
  ): Promise<ApplicationCommandEntity[]> {
    return this.#rest.get(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommands(
        applicationId,
        guildId,
      ),
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
    options: CreateGuildApplicationCommandSchema,
  ): Promise<ApplicationCommandEntity> {
    const result = CreateGuildApplicationCommandSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommands(
        applicationId,
        guildId,
      ),
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
  ): Promise<ApplicationCommandEntity> {
    return this.#rest.get(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommandsId(
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
    options: EditGuildApplicationCommandSchema,
  ): Promise<ApplicationCommandEntity> {
    const result = EditGuildApplicationCommandSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommandsId(
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
  ): Promise<void> {
    return this.#rest.delete(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommandsId(
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
    commands: CreateGlobalApplicationCommandSchema[],
  ): Promise<ApplicationCommandEntity[]> {
    const result = z
      .array(CreateGlobalApplicationCommandSchema)
      .max(200)
      .safeParse(commands);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.put(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommands(
        applicationId,
        guildId,
      ),
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
  ): Promise<GuildApplicationCommandPermissionEntity[]> {
    return this.#rest.get(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommandsPermissions(
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
  ): Promise<GuildApplicationCommandPermissionEntity> {
    return this.#rest.get(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommandsPermissionsId(
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
    options: EditApplicationCommandPermissionsSchema,
  ): Promise<GuildApplicationCommandPermissionEntity> {
    const result = EditApplicationCommandPermissionsSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.put(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommandsPermissionsId(
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

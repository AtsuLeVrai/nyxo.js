import type {
  ApplicationCommandEntity,
  GuildApplicationCommandPermissionEntity,
  Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import type { Rest } from "../rest.js";
import {
  type CreateGlobalApplicationCommandEntity,
  CreateGlobalApplicationCommandSchema,
  type CreateGuildApplicationCommandEntity,
  CreateGuildApplicationCommandSchema,
  type EditApplicationCommandPermissionsEntity,
  EditApplicationCommandPermissionsSchema,
  type EditGlobalApplicationCommandEntity,
  EditGlobalApplicationCommandSchema,
  type EditGuildApplicationCommandEntity,
  EditGuildApplicationCommandSchema,
} from "../schemas/index.js";

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
  ): Promise<ApplicationCommandEntity[]> {
    return this.#rest.get(ApplicationCommandRouter.ROUTES.base(applicationId), {
      query: { with_localizations: withLocalizations },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command}
   */
  createGlobalApplicationCommand(
    applicationId: Snowflake,
    options: CreateGlobalApplicationCommandEntity,
  ): Promise<ApplicationCommandEntity> {
    const result = CreateGlobalApplicationCommandSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
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
  ): Promise<ApplicationCommandEntity> {
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
    options: EditGlobalApplicationCommandEntity,
  ): Promise<ApplicationCommandEntity> {
    const result = EditGlobalApplicationCommandSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
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
  ): Promise<void> {
    return this.#rest.delete(
      ApplicationCommandRouter.ROUTES.command(applicationId, commandId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands}
   */
  bulkOverwriteGlobalApplicationCommands(
    applicationId: Snowflake,
    commands: CreateGlobalApplicationCommandEntity[],
  ): Promise<ApplicationCommandEntity[]> {
    const result = z
      .array(CreateGlobalApplicationCommandSchema)
      .max(200)
      .safeParse(commands);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
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
  ): Promise<ApplicationCommandEntity[]> {
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
    options: CreateGuildApplicationCommandEntity,
  ): Promise<ApplicationCommandEntity> {
    const result = CreateGuildApplicationCommandSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
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
  ): Promise<ApplicationCommandEntity> {
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
    options: EditGuildApplicationCommandEntity,
  ): Promise<ApplicationCommandEntity> {
    const result = EditGuildApplicationCommandSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
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
  ): Promise<void> {
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
    commands: CreateGlobalApplicationCommandEntity[],
  ): Promise<ApplicationCommandEntity[]> {
    const result = z
      .array(CreateGlobalApplicationCommandSchema)
      .max(200)
      .safeParse(commands);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
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
  ): Promise<GuildApplicationCommandPermissionEntity[]> {
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
  ): Promise<GuildApplicationCommandPermissionEntity> {
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
    options: EditApplicationCommandPermissionsEntity,
  ): Promise<GuildApplicationCommandPermissionEntity> {
    const result = EditApplicationCommandPermissionsSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
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

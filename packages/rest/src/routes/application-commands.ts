import type {
  ApplicationCommandEntity,
  ApplicationCommandPermissionEntity,
  GuildApplicationCommandPermissionEntity,
  Snowflake,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions-json-params}
 */
export interface EditCommandPermissionsOptions {
  permissions: ApplicationCommandPermissionEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command-json-params}
 */
export type CreateCommandOptions = Pick<
  ApplicationCommandEntity,
  | "name"
  | "name_localizations"
  | "description"
  | "description_localizations"
  | "options"
  | "default_member_permissions"
  | "dm_permission"
  | "default_permission"
  | "integration_types"
  | "contexts"
  | "type"
  | "nsfw"
>;

export class ApplicationCommandsRouter {
  static routes = {
    base: (applicationId: Snowflake): `/applications/${Snowflake}/commands` => {
      return `/applications/${applicationId}/commands` as const;
    },
    command: (
      applicationId: Snowflake,
      commandId: Snowflake,
    ): `/applications/${Snowflake}/commands/${Snowflake}` => {
      return `/applications/${applicationId}/commands/${commandId}` as const;
    },
    guildCommands: (
      applicationId: Snowflake,
      guildId: Snowflake,
    ): `/applications/${Snowflake}/guilds/${Snowflake}/commands` => {
      return `/applications/${applicationId}/guilds/${guildId}/commands` as const;
    },
    guildCommand: (
      applicationId: Snowflake,
      guildId: Snowflake,
      commandId: Snowflake,
    ): `/applications/${Snowflake}/guilds/${Snowflake}/commands/${Snowflake}` => {
      return `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}` as const;
    },
    guildCommandsPermissions: (
      applicationId: Snowflake,
      guildId: Snowflake,
    ): `/applications/${Snowflake}/guilds/${Snowflake}/commands/permissions` => {
      return `/applications/${applicationId}/guilds/${guildId}/commands/permissions` as const;
    },
    guildCommandPermissions: (
      applicationId: Snowflake,
      guildId: Snowflake,
      commandId: Snowflake,
    ): `/applications/${Snowflake}/guilds/${Snowflake}/commands/${Snowflake}/permissions` => {
      return `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}/permissions` as const;
    },
  } as const;

  readonly #rest: Rest;

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
      ApplicationCommandsRouter.routes.base(applicationId),
      {
        query: { with_localizations: withLocalizations },
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command}
   */
  createGlobalCommand(
    applicationId: Snowflake,
    options: CreateCommandOptions,
  ): Promise<ApplicationCommandEntity> {
    return this.#rest.post(
      ApplicationCommandsRouter.routes.base(applicationId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-command}
   */
  getGlobalCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
  ): Promise<ApplicationCommandEntity> {
    return this.#rest.get(
      ApplicationCommandsRouter.routes.command(applicationId, commandId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command}
   */
  editGlobalCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
    options: Partial<CreateCommandOptions>,
  ): Promise<ApplicationCommandEntity> {
    return this.#rest.patch(
      ApplicationCommandsRouter.routes.command(applicationId, commandId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-global-application-command}
   */
  deleteGlobalCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      ApplicationCommandsRouter.routes.command(applicationId, commandId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands}
   */
  bulkOverwriteGlobalCommands(
    applicationId: Snowflake,
    commands: CreateCommandOptions[],
  ): Promise<ApplicationCommandEntity[]> {
    return this.#rest.put(
      ApplicationCommandsRouter.routes.base(applicationId),
      {
        body: JSON.stringify(commands),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands}
   */
  getGuildCommands(
    applicationId: Snowflake,
    guildId: Snowflake,
    withLocalizations = false,
  ): Promise<ApplicationCommandEntity[]> {
    return this.#rest.get(
      ApplicationCommandsRouter.routes.guildCommands(applicationId, guildId),
      {
        query: { with_localizations: withLocalizations },
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command}
   */
  createGuildCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    options: CreateCommandOptions,
  ): Promise<ApplicationCommandEntity> {
    return this.#rest.post(
      ApplicationCommandsRouter.routes.guildCommands(applicationId, guildId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command}
   */
  getGuildCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
  ): Promise<ApplicationCommandEntity> {
    return this.#rest.get(
      ApplicationCommandsRouter.routes.guildCommand(
        applicationId,
        guildId,
        commandId,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command}
   */
  editGuildCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
    options: Partial<CreateCommandOptions>,
  ): Promise<ApplicationCommandEntity> {
    return this.#rest.patch(
      ApplicationCommandsRouter.routes.guildCommand(
        applicationId,
        guildId,
        commandId,
      ),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-guild-application-command}
   */
  deleteGuildCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      ApplicationCommandsRouter.routes.guildCommand(
        applicationId,
        guildId,
        commandId,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands}
   */
  bulkOverwriteGuildCommands(
    applicationId: Snowflake,
    guildId: Snowflake,
    commands: CreateCommandOptions[],
  ): Promise<ApplicationCommandEntity[]> {
    return this.#rest.put(
      ApplicationCommandsRouter.routes.guildCommands(applicationId, guildId),
      {
        body: JSON.stringify(commands),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command-permissions}
   */
  getGuildCommandsPermissions(
    applicationId: Snowflake,
    guildId: Snowflake,
  ): Promise<GuildApplicationCommandPermissionEntity[]> {
    return this.#rest.get(
      ApplicationCommandsRouter.routes.guildCommandsPermissions(
        applicationId,
        guildId,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-application-command-permissions}
   */
  getCommandPermissions(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
  ): Promise<GuildApplicationCommandPermissionEntity> {
    return this.#rest.get(
      ApplicationCommandsRouter.routes.guildCommandPermissions(
        applicationId,
        guildId,
        commandId,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions}
   */
  editCommandPermissions(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
    options: EditCommandPermissionsOptions,
  ): Promise<GuildApplicationCommandPermissionEntity> {
    return this.#rest.put(
      ApplicationCommandsRouter.routes.guildCommandPermissions(
        applicationId,
        guildId,
        commandId,
      ),
      {
        body: JSON.stringify(options),
      },
    );
  }
}

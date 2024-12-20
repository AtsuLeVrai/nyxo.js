import type {
  ApplicationCommandEntity,
  ApplicationCommandPermissionEntity,
  GuildApplicationCommandPermissionEntity,
  Snowflake,
} from "@nyxjs/core";
import { BaseRouter } from "./base.js";

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions-json-params}
 */
export interface EditCommandPermissionsOptionsEntity {
  permissions: ApplicationCommandPermissionEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command-json-params}
 */
export type CreateCommandOptionsEntity = Pick<
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

export interface ApplicationCommandRoutes {
  readonly base: (
    applicationId: Snowflake,
  ) => `/applications/${Snowflake}/commands`;
  readonly command: (
    applicationId: Snowflake,
    commandId: Snowflake,
  ) => `/applications/${Snowflake}/commands/${Snowflake}`;
  readonly guildCommands: (
    applicationId: Snowflake,
    guildId: Snowflake,
  ) => `/applications/${Snowflake}/guilds/${Snowflake}/commands`;
  readonly guildCommand: (
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
  ) => `/applications/${Snowflake}/guilds/${Snowflake}/commands/${Snowflake}`;
  readonly guildCommandsPermissions: (
    applicationId: Snowflake,
    guildId: Snowflake,
  ) => `/applications/${Snowflake}/guilds/${Snowflake}/commands/permissions`;
  readonly guildCommandPermissions: (
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
  ) => `/applications/${Snowflake}/guilds/${Snowflake}/commands/${Snowflake}/permissions`;
}

export class ApplicationCommandRouter extends BaseRouter {
  static readonly MAX_OPTIONS_PER_COMMAND = 25;
  static readonly MAX_NAME_LENGTH = 32;
  static readonly MAX_DESCRIPTION_LENGTH = 100;
  static readonly MAX_CHOICES_PER_OPTION = 25;
  static readonly MAX_PERMISSION_OVERWRITES = 100;
  static readonly BULK_COMMAND_CREATE_LIMIT = 200;
  static readonly MIN_NAME_CHARACTERS_LENGTH = 1;
  static readonly MIN_DESCRIPTION_CHARACTERS_LENGTH = 1;
  static readonly NAME_REGEX = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

  static readonly ROUTES: ApplicationCommandRoutes = {
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

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-commands}
   */
  getGlobalCommands(
    applicationId: Snowflake,
    withLocalizations = false,
  ): Promise<ApplicationCommandEntity[]> {
    return this.get(ApplicationCommandRouter.ROUTES.base(applicationId), {
      query: { with_localizations: withLocalizations },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command}
   */
  createGlobalApplicationCommand(
    applicationId: Snowflake,
    options: CreateCommandOptionsEntity,
  ): Promise<ApplicationCommandEntity> {
    this.#validateCommandOptions(options);
    return this.post(ApplicationCommandRouter.ROUTES.base(applicationId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-command}
   */
  getGlobalApplicationCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
  ): Promise<ApplicationCommandEntity> {
    return this.get(
      ApplicationCommandRouter.ROUTES.command(applicationId, commandId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command}
   */
  editGlobalApplicationCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
    options: Partial<CreateCommandOptionsEntity>,
  ): Promise<ApplicationCommandEntity> {
    if (options.name || options.description) {
      this.#validateCommandOptions(options as CreateCommandOptionsEntity);
    }

    return this.patch(
      ApplicationCommandRouter.ROUTES.command(applicationId, commandId),
      { body: JSON.stringify(options) },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-global-application-command}
   */
  deleteGlobalApplicationCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
  ): Promise<void> {
    return this.delete(
      ApplicationCommandRouter.ROUTES.command(applicationId, commandId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands}
   */
  bulkOverwriteGlobalApplicationCommands(
    applicationId: Snowflake,
    commands: CreateCommandOptionsEntity[],
  ): Promise<ApplicationCommandEntity[]> {
    if (commands.length > ApplicationCommandRouter.BULK_COMMAND_CREATE_LIMIT) {
      throw new Error(
        `Cannot create more than ${ApplicationCommandRouter.BULK_COMMAND_CREATE_LIMIT} commands at once`,
      );
    }

    for (const cmd of commands.values()) {
      this.#validateCommandOptions(cmd);
    }

    return this.put(ApplicationCommandRouter.ROUTES.base(applicationId), {
      body: JSON.stringify(commands),
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
    return this.get(
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
    options: CreateCommandOptionsEntity,
  ): Promise<ApplicationCommandEntity> {
    this.#validateCommandOptions(options);
    return this.post(
      ApplicationCommandRouter.ROUTES.guildCommands(applicationId, guildId),
      {
        body: JSON.stringify(options),
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
    return this.get(
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
    options: Partial<CreateCommandOptionsEntity>,
  ): Promise<ApplicationCommandEntity> {
    if (options.name || options.description) {
      this.#validateCommandOptions(options as CreateCommandOptionsEntity);
    }

    return this.patch(
      ApplicationCommandRouter.ROUTES.guildCommand(
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
  deleteGuildApplicationCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
  ): Promise<void> {
    return this.delete(
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
    commands: CreateCommandOptionsEntity[],
  ): Promise<ApplicationCommandEntity[]> {
    if (commands.length > ApplicationCommandRouter.BULK_COMMAND_CREATE_LIMIT) {
      throw new Error(
        `Cannot create more than ${ApplicationCommandRouter.BULK_COMMAND_CREATE_LIMIT} commands at once`,
      );
    }

    for (const cmd of commands.values()) {
      this.#validateCommandOptions(cmd);
    }

    return this.put(
      ApplicationCommandRouter.ROUTES.guildCommands(applicationId, guildId),
      {
        body: JSON.stringify(commands),
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
    return this.get(
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
    return this.get(
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
    options: EditCommandPermissionsOptionsEntity,
  ): Promise<GuildApplicationCommandPermissionEntity> {
    if (
      options.permissions.length >
      ApplicationCommandRouter.MAX_PERMISSION_OVERWRITES
    ) {
      throw new Error(
        `Cannot add more than ${ApplicationCommandRouter.MAX_PERMISSION_OVERWRITES} permission overwrites`,
      );
    }

    return this.put(
      ApplicationCommandRouter.ROUTES.guildCommandPermissions(
        applicationId,
        guildId,
        commandId,
      ),
      {
        body: JSON.stringify(options),
      },
    );
  }

  #validateCommandOptions(options: CreateCommandOptionsEntity): void {
    if (options.name) {
      if (!ApplicationCommandRouter.NAME_REGEX.test(options.name)) {
        throw new Error(
          "Command name must match the regex pattern: ^[-_\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$",
        );
      }

      if (
        options.name.length <
          ApplicationCommandRouter.MIN_NAME_CHARACTERS_LENGTH ||
        options.name.length > ApplicationCommandRouter.MAX_NAME_LENGTH
      ) {
        throw new Error(
          `Command name must be between ${ApplicationCommandRouter.MIN_NAME_CHARACTERS_LENGTH} and ${ApplicationCommandRouter.MAX_NAME_LENGTH} characters`,
        );
      }
    }

    if (options.name_localizations) {
      for (const [locale, localizedName] of Object.entries(
        options.name_localizations,
      )) {
        if (
          localizedName &&
          !ApplicationCommandRouter.NAME_REGEX.test(localizedName)
        ) {
          throw new Error(
            `Localized name for ${locale} must match the regex pattern: ^[-_\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$`,
          );
        }
      }
    }

    if (
      options.description &&
      (options.description.length <
        ApplicationCommandRouter.MIN_DESCRIPTION_CHARACTERS_LENGTH ||
        options.description.length >
          ApplicationCommandRouter.MAX_DESCRIPTION_LENGTH)
    ) {
      throw new Error(
        `Command description must be between ${ApplicationCommandRouter.MIN_DESCRIPTION_CHARACTERS_LENGTH} and ${ApplicationCommandRouter.MAX_DESCRIPTION_LENGTH} characters`,
      );
    }

    if (options.description_localizations) {
      for (const [locale, localizedDesc] of Object.entries(
        options.description_localizations,
      )) {
        if (
          localizedDesc &&
          (localizedDesc.length <
            ApplicationCommandRouter.MIN_DESCRIPTION_CHARACTERS_LENGTH ||
            localizedDesc.length >
              ApplicationCommandRouter.MAX_DESCRIPTION_LENGTH)
        ) {
          throw new Error(
            `Localized description for ${locale} must be between ${ApplicationCommandRouter.MIN_DESCRIPTION_CHARACTERS_LENGTH} and ${ApplicationCommandRouter.MAX_DESCRIPTION_LENGTH} characters`,
          );
        }
      }
    }

    if (options.options) {
      if (
        options.options.length >
        ApplicationCommandRouter.MAX_OPTIONS_PER_COMMAND
      ) {
        throw new Error(
          `Commands can have a maximum of ${ApplicationCommandRouter.MAX_OPTIONS_PER_COMMAND} options`,
        );
      }

      let foundOptional = false;
      for (const option of options.options) {
        if (foundOptional && option.required) {
          throw new Error(
            "Required options must be listed before optional options",
          );
        }
        if (!option.required) {
          foundOptional = true;
        }

        if (option.choices && option.autocomplete) {
          throw new Error(
            "Cannot have both choices and autocomplete enabled for an option",
          );
        }

        if (
          option.choices &&
          option.choices?.length >
            ApplicationCommandRouter.MAX_CHOICES_PER_OPTION
        ) {
          throw new Error(
            `Options can have a maximum of ${ApplicationCommandRouter.MAX_CHOICES_PER_OPTION} choices`,
          );
        }

        if (option.name_localizations) {
          for (const [locale, localizedName] of Object.entries(
            option.name_localizations,
          )) {
            if (
              localizedName &&
              !ApplicationCommandRouter.NAME_REGEX.test(localizedName)
            ) {
              throw new Error(
                `Localized option name for ${locale} must match the regex pattern: ^[-_\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$`,
              );
            }
          }
        }
      }
    }
  }
}

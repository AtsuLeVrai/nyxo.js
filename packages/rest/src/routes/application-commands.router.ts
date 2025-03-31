import type {
  AnyApplicationCommandEntity,
  GuildApplicationCommandPermissionEntity,
  Snowflake,
} from "@nyxjs/core";
import { BaseRouter } from "../bases/index.js";
import type {
  CreateGlobalApplicationCommandSchema,
  CreateGuildApplicationCommandSchema,
  EditApplicationCommandPermissionsSchema,
  EditGlobalApplicationCommandSchema,
  EditGuildApplicationCommandSchema,
} from "../schemas/index.js";

/**
 * Router for Discord Application Command-related API endpoints.
 * Provides methods to interact with application commands such as creating, editing,
 * and managing permissions for both global and guild-specific commands.
 */
export class ApplicationCommandRouter extends BaseRouter {
  /**
   * API route constants for application command-related endpoints.
   */
  static readonly ROUTES = {
    /**
     * Route for fetching or managing global commands for an application
     * @param applicationId - ID of the application
     */
    applicationsCommands: (applicationId: Snowflake) =>
      `/applications/${applicationId}/commands` as const,

    /**
     * Route for a specific global command
     * @param applicationId - ID of the application
     * @param commandId - ID of the command
     */
    applicationsCommandsId: (applicationId: Snowflake, commandId: Snowflake) =>
      `/applications/${applicationId}/commands/${commandId}` as const,

    /**
     * Route for fetching or managing guild-specific commands
     * @param applicationId - ID of the application
     * @param guildId - ID of the guild
     */
    applicationsGuildCommands: (applicationId: Snowflake, guildId: Snowflake) =>
      `/applications/${applicationId}/guilds/${guildId}/commands` as const,

    /**
     * Route for a specific guild command
     * @param applicationId - ID of the application
     * @param guildId - ID of the guild
     * @param commandId - ID of the command
     */
    applicationsGuildCommandsId: (
      applicationId: Snowflake,
      guildId: Snowflake,
      commandId: Snowflake,
    ) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}` as const,

    /**
     * Route for fetching permissions for all commands in a guild
     * @param applicationId - ID of the application
     * @param guildId - ID of the guild
     */
    applicationsGuildCommandsPermissions: (
      applicationId: Snowflake,
      guildId: Snowflake,
    ) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/permissions` as const,

    /**
     * Route for fetching or managing permissions for a specific command in a guild
     * @param applicationId - ID of the application
     * @param guildId - ID of the guild
     * @param commandId - ID of the command
     */
    applicationsGuildCommandsPermissionsId: (
      applicationId: Snowflake,
      guildId: Snowflake,
      commandId: Snowflake,
    ) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}/permissions` as const,
  } as const;

  /**
   * Fetches all global commands for the application.
   * @param applicationId - ID of the application
   * @param withLocalizations - Whether to include full localization dictionaries in the response
   * @returns A promise that resolves to an array of application commands
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-commands}
   */
  getGlobalCommands(
    applicationId: Snowflake,
    withLocalizations = false,
  ): Promise<AnyApplicationCommandEntity[]> {
    return this.rest.get(
      ApplicationCommandRouter.ROUTES.applicationsCommands(applicationId),
      {
        query: { with_localizations: withLocalizations },
      },
    );
  }

  /**
   * Creates a new global command for the application.
   * If a command with the same name already exists, it will be updated.
   * @param applicationId - ID of the application
   * @param options - Options for creating the command
   * @returns A promise that resolves to the created or updated command
   * @throws Error if the provided options fail validation
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command}
   */
  createGlobalApplicationCommand(
    applicationId: Snowflake,
    options: CreateGlobalApplicationCommandSchema,
  ): Promise<AnyApplicationCommandEntity> {
    return this.rest.post(
      ApplicationCommandRouter.ROUTES.applicationsCommands(applicationId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Fetches a specific global command for the application.
   * @param applicationId - ID of the application
   * @param commandId - ID of the command to fetch
   * @returns A promise that resolves to the command object
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-command}
   */
  getGlobalApplicationCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
  ): Promise<AnyApplicationCommandEntity> {
    return this.rest.get(
      ApplicationCommandRouter.ROUTES.applicationsCommandsId(
        applicationId,
        commandId,
      ),
    );
  }

  /**
   * Edits a global application command.
   * @param applicationId - ID of the application
   * @param commandId - ID of the command to edit
   * @param options - New properties for the command
   * @returns A promise that resolves to the updated command
   * @throws Error if the provided options fail validation
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command}
   */
  editGlobalApplicationCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
    options: EditGlobalApplicationCommandSchema,
  ): Promise<AnyApplicationCommandEntity> {
    return this.rest.patch(
      ApplicationCommandRouter.ROUTES.applicationsCommandsId(
        applicationId,
        commandId,
      ),
      { body: JSON.stringify(options) },
    );
  }

  /**
   * Deletes a global application command.
   * @param applicationId - ID of the application
   * @param commandId - ID of the command to delete
   * @returns A promise that resolves when the command is deleted
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-global-application-command}
   */
  deleteGlobalApplicationCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
  ): Promise<void> {
    return this.rest.delete(
      ApplicationCommandRouter.ROUTES.applicationsCommandsId(
        applicationId,
        commandId,
      ),
    );
  }

  /**
   * Overwrites all global commands for the application.
   * This will replace all existing commands with the provided ones.
   * @param applicationId - ID of the application
   * @param commands - Array of command objects to register
   * @returns A promise that resolves to an array of the newly registered commands
   * @throws Error if the provided commands fail validation
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands}
   */
  bulkOverwriteGlobalApplicationCommands(
    applicationId: Snowflake,
    commands: CreateGlobalApplicationCommandSchema[],
  ): Promise<AnyApplicationCommandEntity[]> {
    return this.rest.put(
      ApplicationCommandRouter.ROUTES.applicationsCommands(applicationId),
      {
        body: JSON.stringify(commands),
      },
    );
  }

  /**
   * Fetches all guild-specific commands for the application in a specific guild.
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param withLocalizations - Whether to include full localization dictionaries in the response
   * @returns A promise that resolves to an array of application commands
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands}
   */
  getGuildApplicationCommands(
    applicationId: Snowflake,
    guildId: Snowflake,
    withLocalizations = false,
  ): Promise<AnyApplicationCommandEntity[]> {
    return this.rest.get(
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
   * Creates a new guild-specific command.
   * If a command with the same name already exists in the guild, it will be updated.
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param options - Options for creating the command
   * @returns A promise that resolves to the created or updated command
   * @throws Error if the provided options fail validation
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command}
   */
  createGuildApplicationCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    options: CreateGuildApplicationCommandSchema,
  ): Promise<AnyApplicationCommandEntity> {
    return this.rest.post(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommands(
        applicationId,
        guildId,
      ),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Fetches a specific guild command.
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commandId - ID of the command to fetch
   * @returns A promise that resolves to the command object
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command}
   */
  getGuildApplicationCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
  ): Promise<AnyApplicationCommandEntity> {
    return this.rest.get(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommandsId(
        applicationId,
        guildId,
        commandId,
      ),
    );
  }

  /**
   * Edits a guild-specific application command.
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commandId - ID of the command to edit
   * @param options - New properties for the command
   * @returns A promise that resolves to the updated command
   * @throws Error if the provided options fail validation
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command}
   */
  editGuildApplicationCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
    options: EditGuildApplicationCommandSchema,
  ): Promise<AnyApplicationCommandEntity> {
    return this.rest.patch(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommandsId(
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
   * Deletes a guild-specific application command.
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commandId - ID of the command to delete
   * @returns A promise that resolves when the command is deleted
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-guild-application-command}
   */
  deleteGuildApplicationCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
  ): Promise<void> {
    return this.rest.delete(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommandsId(
        applicationId,
        guildId,
        commandId,
      ),
    );
  }

  /**
   * Overwrites all guild-specific commands for the application in a specific guild.
   * This will replace all existing commands with the provided ones.
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commands - Array of command objects to register
   * @returns A promise that resolves to an array of the newly registered commands
   * @throws Error if the provided commands fail validation
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands}
   */
  bulkOverwriteGuildApplicationCommands(
    applicationId: Snowflake,
    guildId: Snowflake,
    commands: CreateGuildApplicationCommandSchema[],
  ): Promise<AnyApplicationCommandEntity[]> {
    return this.rest.put(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommands(
        applicationId,
        guildId,
      ),
      {
        body: JSON.stringify(commands),
      },
    );
  }

  /**
   * Fetches permissions for all commands in a guild.
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @returns A promise that resolves to an array of command permission objects
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command-permissions}
   */
  getGuildApplicationCommandPermissions(
    applicationId: Snowflake,
    guildId: Snowflake,
  ): Promise<GuildApplicationCommandPermissionEntity[]> {
    return this.rest.get(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommandsPermissions(
        applicationId,
        guildId,
      ),
    );
  }

  /**
   * Fetches permissions for a specific command in a guild.
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commandId - ID of the command
   * @returns A promise that resolves to the command permission object
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-application-command-permissions}
   */
  getApplicationCommandPermissions(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
  ): Promise<GuildApplicationCommandPermissionEntity> {
    return this.rest.get(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommandsPermissionsId(
        applicationId,
        guildId,
        commandId,
      ),
    );
  }

  /**
   * Edits permissions for a specific command in a guild.
   * This will overwrite existing permissions for the command.
   * Requires a Bearer token with proper permissions.
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commandId - ID of the command
   * @param options - New permission settings for the command
   * @returns A promise that resolves to the updated command permission object
   * @throws Error if the provided options fail validation
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions}
   */
  editApplicationCommandPermissions(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
    options: EditApplicationCommandPermissionsSchema,
  ): Promise<GuildApplicationCommandPermissionEntity> {
    return this.rest.put(
      ApplicationCommandRouter.ROUTES.applicationsGuildCommandsPermissionsId(
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

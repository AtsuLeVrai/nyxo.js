import type {
  AnyApplicationCommandEntity,
  AnyApplicationCommandOptionEntity,
  ApplicationCommandPermissionEntity,
  ApplicationCommandType,
  ApplicationIntegrationType,
  GuildApplicationCommandPermissionEntity,
  Snowflake,
} from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for editing application command permissions.
 * Defines permission overwrites for command access control.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions}
 */
export interface CommandPermissionsUpdateOptions {
  /**
   * Array of permission objects for the command (maximum 100).
   * Specifies which users or roles can use this command.
   */
  permissions: ApplicationCommandPermissionEntity[];
}

/**
 * Interface for creating a global application command.
 * Defines the required parameters for registering a command that can be used across Discord.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command}
 */
export interface GlobalCommandCreateOptions {
  /**
   * Name of the command (1-32 characters).
   * Must match the regex pattern: `^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$`
   * Used when invoking the command with a slash or in the UI.
   */
  name: string;

  /**
   * Localization dictionary for the name field.
   * Maps locale to localized command name for international support.
   */
  name_localizations?: Record<string, string> | null;

  /**
   * Description of the command (1-100 characters).
   * Shown in the Discord UI when users view available commands.
   */
  description: string;

  /**
   * Localization dictionary for the description field.
   * Maps locale to localized description for international support.
   */
  description_localizations?: Record<string, string> | null;

  /**
   * Array of command options/parameters (maximum 25).
   * Defines the arguments that can be provided when using the command.
   */
  options?: AnyApplicationCommandOptionEntity[];

  /**
   * Permission string required to use the command.
   * When null, everyone can use the command subject to the default permissions.
   */
  default_member_permissions?: string | null;

  /**
   * Whether the command is available in Direct Messages.
   * When false, the command can only be used in guilds.
   */
  dm_permission?: boolean | null;

  /**
   * Whether the command is enabled by default when added to a guild.
   * Deprecated in favor of default_member_permissions.
   */
  default_permission?: boolean | null;

  /**
   * Types of application integrations where this command is available.
   * Controls where users can access the command.
   */
  integration_types?: ApplicationIntegrationType[];

  /**
   * Interaction contexts where the command can be used.
   * Defines the UI locations where the command appears.
   */
  contexts?: number[];

  /**
   * Type of command (defaults to ChatInput/slash command).
   * Determines how users interact with the command.
   */
  type?: ApplicationCommandType;

  /**
   * Whether the command is age-restricted (18+ only).
   * Limits access to the command based on user age verification.
   */
  nsfw?: boolean;
}

/**
 * Interface for editing a global application command.
 * Similar to creating a command but all fields are optional.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command-json-params}
 */
export type GlobalCommandUpdateOptions = Partial<
  Omit<GlobalCommandCreateOptions, "type">
>;

/**
 * Interface for creating a guild-specific application command.
 * Similar to global commands but without integration_types and contexts.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command-json-params}
 */
export type GuildCommandCreateOptions = Omit<
  GlobalCommandCreateOptions,
  "integration_types" | "contexts"
>;

/**
 * Interface for editing a guild-specific application command.
 * All fields are optional, allowing partial updates.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command-json-params}
 */
export type GuildCommandUpdateOptions = Partial<
  Omit<GuildCommandCreateOptions, "type">
>;

/**
 * Router for Discord Application Command-related API endpoints.
 * Manages slash commands and context menu commands.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands}
 */
export class ApplicationCommandRouter {
  /**
   * API route constants for application command-related endpoints.
   */
  static readonly COMMAND_ROUTES = {
    /**
     * Route for global commands for an application.
     * @param applicationId - ID of the application
     */
    globalCommandsEndpoint: (applicationId: Snowflake) =>
      `/applications/${applicationId}/commands` as const,

    /**
     * Route for a specific global command.
     * @param applicationId - ID of the application
     * @param commandId - ID of the command
     */
    globalCommandByIdEndpoint: (
      applicationId: Snowflake,
      commandId: Snowflake,
    ) => `/applications/${applicationId}/commands/${commandId}` as const,

    /**
     * Route for guild-specific commands.
     * @param applicationId - ID of the application
     * @param guildId - ID of the guild
     */
    guildCommandsEndpoint: (applicationId: Snowflake, guildId: Snowflake) =>
      `/applications/${applicationId}/guilds/${guildId}/commands` as const,

    /**
     * Route for a specific guild command.
     * @param applicationId - ID of the application
     * @param guildId - ID of the guild
     * @param commandId - ID of the command
     */
    guildCommandByIdEndpoint: (
      applicationId: Snowflake,
      guildId: Snowflake,
      commandId: Snowflake,
    ) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}` as const,

    /**
     * Route for permissions for all commands in a guild.
     * @param applicationId - ID of the application
     * @param guildId - ID of the guild
     */
    allGuildCommandPermissionsEndpoint: (
      applicationId: Snowflake,
      guildId: Snowflake,
    ) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/permissions` as const,

    /**
     * Route for permissions for a specific command in a guild.
     * @param applicationId - ID of the application
     * @param guildId - ID of the guild
     * @param commandId - ID of the command
     */
    guildCommandPermissionsByIdEndpoint: (
      applicationId: Snowflake,
      guildId: Snowflake,
      commandId: Snowflake,
    ) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}/permissions` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new instance of a router.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches all global commands for the application.
   * Returns commands available in all guilds.
   *
   * @param applicationId - ID of the application
   * @param withLocalizations - Whether to include localization dictionaries
   * @returns A promise resolving to an array of application commands
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-commands}
   */
  fetchGlobalCommands(
    applicationId: Snowflake,
    withLocalizations = false,
  ): Promise<AnyApplicationCommandEntity[]> {
    return this.#rest.get(
      ApplicationCommandRouter.COMMAND_ROUTES.globalCommandsEndpoint(
        applicationId,
      ),
      {
        query: { with_localizations: withLocalizations },
      },
    );
  }

  /**
   * Creates a new global command for the application.
   * May take up to 1 hour to propagate to all guilds.
   *
   * @param applicationId - ID of the application
   * @param options - Options for creating the command
   * @returns A promise resolving to the created command
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command}
   */
  createGlobalCommand(
    applicationId: Snowflake,
    options: GlobalCommandCreateOptions,
  ): Promise<AnyApplicationCommandEntity> {
    return this.#rest.post(
      ApplicationCommandRouter.COMMAND_ROUTES.globalCommandsEndpoint(
        applicationId,
      ),
      { body: JSON.stringify(options) },
    );
  }

  /**
   * Fetches a specific global command for the application.
   *
   * @param applicationId - ID of the application
   * @param commandId - ID of the command to fetch
   * @returns A promise resolving to the command object
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-command}
   */
  fetchGlobalCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
  ): Promise<AnyApplicationCommandEntity> {
    return this.#rest.get(
      ApplicationCommandRouter.COMMAND_ROUTES.globalCommandByIdEndpoint(
        applicationId,
        commandId,
      ),
    );
  }

  /**
   * Edits a global application command.
   * Allows partial updates to an existing command.
   *
   * @param applicationId - ID of the application
   * @param commandId - ID of the command to edit
   * @param options - New properties for the command
   * @returns A promise resolving to the updated command
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command}
   */
  updateGlobalCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
    options: GlobalCommandUpdateOptions,
  ): Promise<AnyApplicationCommandEntity> {
    return this.#rest.patch(
      ApplicationCommandRouter.COMMAND_ROUTES.globalCommandByIdEndpoint(
        applicationId,
        commandId,
      ),
      { body: JSON.stringify(options) },
    );
  }

  /**
   * Deletes a global application command.
   * Removes the command from all guilds.
   *
   * @param applicationId - ID of the application
   * @param commandId - ID of the command to delete
   * @returns A promise that resolves when the command is deleted
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-global-application-command}
   */
  deleteGlobalCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      ApplicationCommandRouter.COMMAND_ROUTES.globalCommandByIdEndpoint(
        applicationId,
        commandId,
      ),
    );
  }

  /**
   * Overwrites all global commands for the application.
   * Replaces all existing commands with the provided ones.
   *
   * @param applicationId - ID of the application
   * @param commands - Array of command objects to register
   * @returns A promise resolving to an array of the registered commands
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands}
   */
  bulkOverwriteGlobalCommands(
    applicationId: Snowflake,
    commands: GlobalCommandCreateOptions[],
  ): Promise<AnyApplicationCommandEntity[]> {
    return this.#rest.put(
      ApplicationCommandRouter.COMMAND_ROUTES.globalCommandsEndpoint(
        applicationId,
      ),
      { body: JSON.stringify(commands) },
    );
  }

  /**
   * Fetches all guild-specific commands for the application.
   * Returns commands available only in the specified guild.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param withLocalizations - Whether to include localization dictionaries
   * @returns A promise resolving to an array of application commands
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands}
   */
  fetchGuildCommands(
    applicationId: Snowflake,
    guildId: Snowflake,
    withLocalizations = false,
  ): Promise<AnyApplicationCommandEntity[]> {
    return this.#rest.get(
      ApplicationCommandRouter.COMMAND_ROUTES.guildCommandsEndpoint(
        applicationId,
        guildId,
      ),
      { query: { with_localizations: withLocalizations } },
    );
  }

  /**
   * Creates a new guild-specific command.
   * Instantly available in the specified guild.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param options - Options for creating the command
   * @returns A promise resolving to the created command
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command}
   */
  createGuildCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    options: GuildCommandCreateOptions,
  ): Promise<AnyApplicationCommandEntity> {
    return this.#rest.post(
      ApplicationCommandRouter.COMMAND_ROUTES.guildCommandsEndpoint(
        applicationId,
        guildId,
      ),
      { body: JSON.stringify(options) },
    );
  }

  /**
   * Fetches a specific guild command.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commandId - ID of the command to fetch
   * @returns A promise resolving to the command object
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command}
   */
  fetchGuildCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
  ): Promise<AnyApplicationCommandEntity> {
    return this.#rest.get(
      ApplicationCommandRouter.COMMAND_ROUTES.guildCommandByIdEndpoint(
        applicationId,
        guildId,
        commandId,
      ),
    );
  }

  /**
   * Edits a guild-specific application command.
   * Changes are immediately visible to users.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commandId - ID of the command to edit
   * @param options - New properties for the command
   * @returns A promise resolving to the updated command
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command}
   */
  updateGuildCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
    options: GuildCommandUpdateOptions,
  ): Promise<AnyApplicationCommandEntity> {
    return this.#rest.patch(
      ApplicationCommandRouter.COMMAND_ROUTES.guildCommandByIdEndpoint(
        applicationId,
        guildId,
        commandId,
      ),
      { body: JSON.stringify(options) },
    );
  }

  /**
   * Deletes a guild-specific application command.
   * Removes the command from the specified guild only.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commandId - ID of the command to delete
   * @returns A promise that resolves when the command is deleted
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-guild-application-command}
   */
  deleteGuildCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      ApplicationCommandRouter.COMMAND_ROUTES.guildCommandByIdEndpoint(
        applicationId,
        guildId,
        commandId,
      ),
    );
  }

  /**
   * Overwrites all guild-specific commands for the application.
   * Replaces all existing commands in the guild.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commands - Array of command objects to register
   * @returns A promise resolving to an array of the registered commands
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands}
   */
  bulkOverwriteGuildCommands(
    applicationId: Snowflake,
    guildId: Snowflake,
    commands: GuildCommandCreateOptions[],
  ): Promise<AnyApplicationCommandEntity[]> {
    return this.#rest.put(
      ApplicationCommandRouter.COMMAND_ROUTES.guildCommandsEndpoint(
        applicationId,
        guildId,
      ),
      { body: JSON.stringify(commands) },
    );
  }

  /**
   * Fetches permissions for all commands in a guild.
   * Shows which users and roles can use each command.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @returns A promise resolving to an array of command permission objects
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command-permissions}
   */
  fetchGuildCommandPermissions(
    applicationId: Snowflake,
    guildId: Snowflake,
  ): Promise<GuildApplicationCommandPermissionEntity[]> {
    return this.#rest.get(
      ApplicationCommandRouter.COMMAND_ROUTES.allGuildCommandPermissionsEndpoint(
        applicationId,
        guildId,
      ),
    );
  }

  /**
   * Fetches permissions for a specific command in a guild.
   * Shows which users and roles can use the command.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commandId - ID of the command
   * @returns A promise resolving to the command permission object
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-application-command-permissions}
   */
  fetchCommandPermissions(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
  ): Promise<GuildApplicationCommandPermissionEntity> {
    return this.#rest.get(
      ApplicationCommandRouter.COMMAND_ROUTES.guildCommandPermissionsByIdEndpoint(
        applicationId,
        guildId,
        commandId,
      ),
    );
  }

  /**
   * Updates permissions for a specific command in a guild.
   * Controls which users and roles can use the command.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commandId - ID of the command
   * @param options - New permission settings for the command
   * @returns A promise resolving to the updated command permission object
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions}
   */
  updateCommandPermissions(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
    options: CommandPermissionsUpdateOptions,
  ): Promise<GuildApplicationCommandPermissionEntity> {
    return this.#rest.put(
      ApplicationCommandRouter.COMMAND_ROUTES.guildCommandPermissionsByIdEndpoint(
        applicationId,
        guildId,
        commandId,
      ),
      { body: JSON.stringify(options) },
    );
  }
}

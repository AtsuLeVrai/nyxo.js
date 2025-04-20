import type {
  AnyApplicationCommandEntity,
  GuildApplicationCommandPermissionEntity,
} from "@nyxojs/core";
import type { Snowflake } from "@nyxojs/core";
import type {
  AnyApplicationCommandOptionEntity,
  ApplicationCommandPermissionEntity,
  ApplicationCommandType,
  ApplicationIntegrationType,
} from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for editing application command permissions.
 *
 * Defines a set of permission overwrites for a command that control which users
 * and roles can use the command in a specific guild. This allows for fine-grained
 * access control at the command level.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions}
 */
export interface EditApplicationCommandPermissionsSchema {
  /**
   * Array of permission objects for the command (maximum 100).
   * Each permission object specifies a user or role and whether
   * they are allowed to use this command.
   */
  permissions: ApplicationCommandPermissionEntity[];
}

/**
 * Interface for creating a global application command.
 *
 * Global commands are available in all guilds that have installed the application,
 * as well as in DMs (if enabled). This interface defines all properties needed
 * to register a new command with Discord.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command}
 */
export interface CreateGlobalApplicationCommandSchema {
  /**
   * Command name (1-32 characters).
   * Must match the regex pattern `^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$`.
   * For slash commands, this will be the text after the slash (e.g., /name).
   */
  name: string;

  /**
   * Localization dictionary for the name field.
   * Allows the command name to be displayed in different languages.
   * Keys must be valid locale identifiers.
   */
  name_localizations?: Record<string, string> | null;

  /**
   * Command description (1-100 characters).
   * Explains the purpose of the command to users.
   * Required for slash commands but empty for user and message commands.
   */
  description: string;

  /**
   * Localization dictionary for the description field.
   * Allows the command description to be displayed in different languages.
   * Keys must be valid locale identifiers.
   */
  description_localizations?: Record<string, string> | null;

  /**
   * Command options/parameters (maximum 25).
   * Defines arguments that users can provide when using the command.
   * Only applicable to slash commands.
   */
  options?: AnyApplicationCommandOptionEntity[];

  /**
   * Permissions required to use the command (bit set as string).
   * If provided, only users with these permissions can use the command.
   * Set to null to allow anyone to use the command (if other restrictions don't apply).
   */
  default_member_permissions?: string | null;

  /**
   * Whether the command is available in DMs with the application.
   * If false, the command can only be used in guilds.
   * @deprecated Use `contexts` instead for more granular control
   */
  dm_permission?: boolean | null;

  /**
   * Whether the command is enabled by default.
   * @deprecated Use `default_member_permissions` instead
   */
  default_permission?: boolean | null;

  /**
   * Installation contexts where the command is available.
   * Controls which types of application integrations have access to this command.
   */
  integration_types?: ApplicationIntegrationType[];

  /**
   * Interaction contexts where the command can be used.
   * Allows restricting commands to specific UI locations in Discord.
   */
  contexts?: number[];

  /**
   * Type of command (defaults to ChatInput/slash command).
   * Determines how the command is invoked in Discord's UI.
   */
  type?: ApplicationCommandType;

  /**
   * Whether the command is age-restricted (18+ only).
   * If true, the command will only be available to users who have verified their age.
   */
  nsfw?: boolean;
}

/**
 * Interface for editing a global application command.
 *
 * Similar to creating a command but all fields are optional, and type cannot be changed.
 * This allows partial updates to existing commands.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command-json-params}
 */
export type EditGlobalApplicationCommandSchema = Partial<
  Omit<CreateGlobalApplicationCommandSchema, "type">
>;

/**
 * Interface for creating a guild-specific application command.
 *
 * Guild commands are only available in specific guilds where they are registered.
 * This interface is similar to global commands but without integration_types and contexts,
 * as these are only applicable to global commands.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command-json-params}
 */
export type CreateGuildApplicationCommandSchema = Omit<
  CreateGlobalApplicationCommandSchema,
  "integration_types" | "contexts"
>;

/**
 * Interface for editing a guild-specific application command.
 *
 * Similar to creating a guild command but all fields are optional, and type cannot be changed.
 * This allows partial updates to existing guild commands.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command-json-params}
 */
export type EditGuildApplicationCommandSchema = Partial<
  Omit<CreateGuildApplicationCommandSchema, "type">
>;

/**
 * Router for Discord Application Command-related API endpoints.
 *
 * This class provides comprehensive methods to interact with Discord's application commands system,
 * including creating, editing, and managing permissions for both global and guild-specific commands.
 *
 * Application commands appear in Discord's UI and can be invoked by users through slash commands,
 * the context menu for users, or the context menu for messages. These commands are the primary way
 * users interact with applications in Discord.
 */
export class ApplicationCommandRouter {
  /**
   * API route constants for application command-related endpoints.
   */
  static readonly COMMAND_ROUTES = {
    /**
     * Route for fetching or managing global commands for an application.
     *
     * @param applicationId - ID of the application
     * @returns The formatted API route string
     */
    globalCommandsEndpoint: (applicationId: Snowflake) =>
      `/applications/${applicationId}/commands` as const,

    /**
     * Route for a specific global command.
     *
     * @param applicationId - ID of the application
     * @param commandId - ID of the command
     * @returns The formatted API route string
     */
    globalCommandByIdEndpoint: (
      applicationId: Snowflake,
      commandId: Snowflake,
    ) => `/applications/${applicationId}/commands/${commandId}` as const,

    /**
     * Route for fetching or managing guild-specific commands.
     *
     * @param applicationId - ID of the application
     * @param guildId - ID of the guild
     * @returns The formatted API route string
     */
    guildCommandsEndpoint: (applicationId: Snowflake, guildId: Snowflake) =>
      `/applications/${applicationId}/guilds/${guildId}/commands` as const,

    /**
     * Route for a specific guild command.
     *
     * @param applicationId - ID of the application
     * @param guildId - ID of the guild
     * @param commandId - ID of the command
     * @returns The formatted API route string
     */
    guildCommandByIdEndpoint: (
      applicationId: Snowflake,
      guildId: Snowflake,
      commandId: Snowflake,
    ) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}` as const,

    /**
     * Route for fetching permissions for all commands in a guild.
     *
     * @param applicationId - ID of the application
     * @param guildId - ID of the guild
     * @returns The formatted API route string
     */
    allGuildCommandPermissionsEndpoint: (
      applicationId: Snowflake,
      guildId: Snowflake,
    ) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/permissions` as const,

    /**
     * Route for fetching or managing permissions for a specific command in a guild.
     *
     * @param applicationId - ID of the application
     * @param guildId - ID of the guild
     * @param commandId - ID of the command
     * @returns The formatted API route string
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
   * Creates a new Application Command Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches all global commands for the application.
   *
   * Global commands are available in all guilds that have installed the application
   * and potentially in DMs (if enabled).
   *
   * @param applicationId - ID of the application
   * @param withLocalizations - Whether to include full localization dictionaries in the response
   * @returns A promise that resolves to an array of application commands
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
   *
   * If a command with the same name already exists, it will be updated.
   * Global commands may take up to 1 hour to propagate to all guilds.
   *
   * @param applicationId - ID of the application
   * @param options - Options for creating the command
   * @returns A promise that resolves to the created or updated command
   * @throws {Error} Error if the provided options fail validation
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command}
   */
  createGlobalCommand(
    applicationId: Snowflake,
    options: CreateGlobalApplicationCommandSchema,
  ): Promise<AnyApplicationCommandEntity> {
    return this.#rest.post(
      ApplicationCommandRouter.COMMAND_ROUTES.globalCommandsEndpoint(
        applicationId,
      ),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Fetches a specific global command for the application.
   *
   * @param applicationId - ID of the application
   * @param commandId - ID of the command to fetch
   * @returns A promise that resolves to the command object
   * @throws {Error} Will throw an error if the command doesn't exist
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
   *
   * This allows partial updates to an existing command. Note that the command's
   * type cannot be changed after creation.
   *
   * @param applicationId - ID of the application
   * @param commandId - ID of the command to edit
   * @param options - New properties for the command
   * @returns A promise that resolves to the updated command
   * @throws {Error} Error if the provided options fail validation
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command}
   */
  updateGlobalCommand(
    applicationId: Snowflake,
    commandId: Snowflake,
    options: EditGlobalApplicationCommandSchema,
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
   *
   * Once deleted, the command will no longer be available in any guild.
   *
   * @param applicationId - ID of the application
   * @param commandId - ID of the command to delete
   * @returns A promise that resolves when the command is deleted
   * @throws {Error} Will throw an error if the command doesn't exist
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
   *
   * This will replace all existing commands with the provided ones.
   * This is useful for bulk updating commands in a single API call.
   *
   * @param applicationId - ID of the application
   * @param commands - Array of command objects to register
   * @returns A promise that resolves to an array of the newly registered commands
   * @throws {Error} Error if the provided commands fail validation
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands}
   */
  bulkOverwriteGlobalCommands(
    applicationId: Snowflake,
    commands: CreateGlobalApplicationCommandSchema[],
  ): Promise<AnyApplicationCommandEntity[]> {
    return this.#rest.put(
      ApplicationCommandRouter.COMMAND_ROUTES.globalCommandsEndpoint(
        applicationId,
      ),
      {
        body: JSON.stringify(commands),
      },
    );
  }

  /**
   * Fetches all guild-specific commands for the application in a specific guild.
   *
   * Guild commands are only available in the guild where they are registered.
   * They are created instantly and do not have the propagation delay of global commands.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param withLocalizations - Whether to include full localization dictionaries in the response
   * @returns A promise that resolves to an array of application commands
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
      {
        query: { with_localizations: withLocalizations },
      },
    );
  }

  /**
   * Creates a new guild-specific command.
   *
   * If a command with the same name already exists in the guild, it will be updated.
   * Guild commands are created instantly and only available in the specified guild.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param options - Options for creating the command
   * @returns A promise that resolves to the created or updated command
   * @throws {Error} Error if the provided options fail validation
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command}
   */
  createGuildCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    options: CreateGuildApplicationCommandSchema,
  ): Promise<AnyApplicationCommandEntity> {
    return this.#rest.post(
      ApplicationCommandRouter.COMMAND_ROUTES.guildCommandsEndpoint(
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
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commandId - ID of the command to fetch
   * @returns A promise that resolves to the command object
   * @throws {Error} Will throw an error if the command doesn't exist
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
   *
   * This allows partial updates to an existing guild command. Note that the
   * command's type cannot be changed after creation.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commandId - ID of the command to edit
   * @param options - New properties for the command
   * @returns A promise that resolves to the updated command
   * @throws {Error} Error if the provided options fail validation
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command}
   */
  updateGuildCommand(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
    options: EditGuildApplicationCommandSchema,
  ): Promise<AnyApplicationCommandEntity> {
    return this.#rest.patch(
      ApplicationCommandRouter.COMMAND_ROUTES.guildCommandByIdEndpoint(
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
   *
   * Once deleted, the command will no longer be available in the guild.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commandId - ID of the command to delete
   * @returns A promise that resolves when the command is deleted
   * @throws {Error} Will throw an error if the command doesn't exist
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
   * Overwrites all guild-specific commands for the application in a specific guild.
   *
   * This will replace all existing commands in the guild with the provided ones.
   * This is useful for bulk updating guild commands in a single API call.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commands - Array of command objects to register
   * @returns A promise that resolves to an array of the newly registered commands
   * @throws {Error} Error if the provided commands fail validation
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands}
   */
  bulkOverwriteGuildCommands(
    applicationId: Snowflake,
    guildId: Snowflake,
    commands: CreateGuildApplicationCommandSchema[],
  ): Promise<AnyApplicationCommandEntity[]> {
    return this.#rest.put(
      ApplicationCommandRouter.COMMAND_ROUTES.guildCommandsEndpoint(
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
   *
   * This provides information about which users and roles have permission
   * to use each command in the specified guild.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @returns A promise that resolves to an array of command permission objects
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
   *
   * This provides information about which users and roles have permission
   * to use the specified command in the guild.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commandId - ID of the command
   * @returns A promise that resolves to the command permission object
   * @throws {Error} Will throw an error if the command doesn't exist
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
   *
   * This will overwrite existing permissions for the command, allowing fine-grained
   * control over which users and roles can use the command in the guild.
   *
   * Note: This endpoint requires a Bearer token with proper permissions, not a Bot token.
   *
   * @param applicationId - ID of the application
   * @param guildId - ID of the guild
   * @param commandId - ID of the command
   * @param options - New permission settings for the command
   * @returns A promise that resolves to the updated command permission object
   * @throws {Error} Error if the provided options fail validation or the token lacks required permissions
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions}
   */
  updateCommandPermissions(
    applicationId: Snowflake,
    guildId: Snowflake,
    commandId: Snowflake,
    options: EditApplicationCommandPermissionsSchema,
  ): Promise<GuildApplicationCommandPermissionEntity> {
    return this.#rest.put(
      ApplicationCommandRouter.COMMAND_ROUTES.guildCommandPermissionsByIdEndpoint(
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

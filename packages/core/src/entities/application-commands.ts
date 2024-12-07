import type { AvailableLocale } from "../enums/index.js";
import type { Integer } from "../formatting/index.js";
import type { Snowflake } from "../utils/index.js";
import type { ApplicationIntegrationType } from "./application.js";
import type { ChannelType } from "./channel.js";
import type { InteractionContextType } from "./interaction.js";

/**
 * Permission types for application commands, defining who can use commands.
 *
 * @remarks
 * These permissions determine if the command can be used by roles, users, or in specific channels.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permission-type}
 */
export enum ApplicationCommandPermissionType {
  /** Command can be used by specific roles */
  Role = 1,
  /** Command can be used by specific users */
  User = 2,
  /** Command can be used in specific channels */
  Channel = 3,
}

/**
 * Represents a permission override for an application command.
 *
 * @example
 * ```typescript
 * const permission: ApplicationCommandPermissionEntity = {
 *   id: "123456789",
 *   type: ApplicationCommandPermissionType.Role,
 *   permission: true
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permissions-structure}
 */
export interface ApplicationCommandPermissionEntity {
  /** ID of the role, user, or channel */
  id: Snowflake;
  /** Type of permission */
  type: ApplicationCommandPermissionType;
  /** Whether to allow (true) or deny (false) the permission */
  permission: boolean;
}

/**
 * Represents permission overrides for an application command in a guild.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure}
 */
export interface GuildApplicationCommandPermissionEntity {
  /** ID of the command */
  id: Snowflake;
  /** ID of the application the command belongs to */
  application_id: Snowflake;
  /** ID of the guild */
  guild_id: Snowflake;
  /** Permission overrides for the command */
  permissions: ApplicationCommandPermissionEntity[];
}

/**
 * Types of entry points for command handlers.
 *
 * @remarks
 * Determines how the interaction is handled - either by the app or by Discord directly.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-entry-point-command-handler-types}
 */
export enum ApplicationCommandEntryPointType {
  /** App handles the interaction using interaction token */
  AppHandler = 1,
  /** Discord handles the interaction by launching activity */
  DiscordLaunchActivity = 2,
}

/**
 * Represents a choice option for an application command.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-choice-structure}
 */
export interface ApplicationCommandOptionChoiceEntity {
  /** Name of the choice */
  name: string;
  /** Localization dictionary for the name */
  name_localizations?: AvailableLocale | null;
  /** Value of the choice (string for string choices, number for number choices) */
  value: string | number;
}

/**
 * Available option types for application commands.
 *
 * @remarks
 * Defines the type of input that can be provided for a command option.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type}
 */
export enum ApplicationCommandOptionType {
  /** Sub-command */
  SubCommand = 1,
  /** Sub-command group */
  SubCommandGroup = 2,
  /** String option type */
  String = 3,
  /** Integer option type */
  Integer = 4,
  /** Boolean option type */
  Boolean = 5,
  /** User option type */
  User = 6,
  /** Channel option type */
  Channel = 7,
  /** Role option type */
  Role = 8,
  /** Mentionable option type (users and roles) */
  Mentionable = 9,
  /** Number option type (double) */
  Number = 10,
  /** Attachment option type */
  Attachment = 11,
}

/**
 * Represents an option for an application command.
 *
 * @remarks
 * Options are the parameters that can be provided when using a command.
 * Required options must be listed before optional options.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface ApplicationCommandOptionEntity {
  /** Type of the option */
  type: ApplicationCommandOptionType;
  /** Name of the option */
  name: string;
  /** Localization dictionary for the name */
  name_localizations?: AvailableLocale | null;
  /** Description of the option */
  description: string;
  /** Localization dictionary for the description */
  description_localizations?: AvailableLocale | null;
  /** Whether the option is required */
  required?: boolean;
  /** Choices for string and number option types */
  choices?: ApplicationCommandOptionChoiceEntity[];
  /** Sub-command options */
  options?: ApplicationCommandOptionEntity[];
  /** Allowed channel types for channel option type */
  channel_types?: ChannelType[];
  /** Minimum value for integer/number option types */
  min_value?: Integer;
  /** Maximum value for integer/number option types */
  max_value?: Integer;
  /** Minimum length for string option type */
  min_length?: Integer;
  /** Maximum length for string option type */
  max_length?: Integer;
  /** Whether autocomplete is enabled for this option */
  autocomplete?: boolean;
}

/**
 * Types of application commands.
 *
 * @remarks
 * Defines where and how the command can be used in the Discord client.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types}
 */
export enum ApplicationCommandType {
  /** Slash commands - text-based commands that show up when typing / */
  ChatInput = 1,
  /** UI-based command in user context menu */
  User = 2,
  /** UI-based command in message context menu */
  Message = 3,
  /** Primary entry point command for app's Activity */
  PrimaryEntryPoint = 4,
}

/**
 * Represents an application command.
 *
 * @remarks
 * Application commands are native ways to interact with apps in the Discord client.
 * They can be global commands or guild-specific commands.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export interface ApplicationCommandEntity {
  /** Unique ID of the command */
  id: Snowflake;
  /** Type of the command */
  type?: ApplicationCommandType;
  /** ID of the application the command belongs to */
  application_id: Snowflake;
  /** ID of the guild if not a global command */
  guild_id?: Snowflake;
  /** Name of the command */
  name: string;
  /** Localization dictionary for the name */
  name_localizations?: AvailableLocale | null;
  /** Description of the command */
  description: string;
  /** Localization dictionary for the description */
  description_localizations?: AvailableLocale | null;
  /** Parameters for the command */
  options?: ApplicationCommandOptionEntity[];
  /** Set of permissions required to use the command */
  default_member_permissions: string | null;
  /** Whether the command is available in DMs */
  dm_permission?: boolean;
  /** Whether the command is enabled by default */
  default_permission?: boolean | null;
  /** Whether the command is age-restricted */
  nsfw?: boolean;
  /** Supported installation contexts for the command */
  integration_types?: ApplicationIntegrationType[];
  /** Supported interaction contexts for the command */
  contexts?: InteractionContextType[] | null;
  /** Autoincrementing version identifier */
  version: Snowflake;
  /** How the interaction should be handled */
  handler?: ApplicationCommandEntryPointType;
}

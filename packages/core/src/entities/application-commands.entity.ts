import type { Locale } from "../enums/index.js";
import type { Snowflake } from "../managers/index.js";
import type { ApplicationIntegrationType } from "./application.entity.js";
import type { ChannelType } from "./channel.entity.js";
import type { InteractionContextType } from "./interaction.entity.js";

/**
 * Available application command option types
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-type}
 */
export enum ApplicationCommandOptionType {
  /** Denotes a subcommand */
  SubCommand = 1,

  /** Denotes a subcommand group */
  SubCommandGroup = 2,

  /** String option type */
  String = 3,

  /** Integer option type (any integer between -2^53 and 2^53) */
  Integer = 4,

  /** Boolean option type */
  Boolean = 5,

  /** User option type */
  User = 6,

  /** Channel option type (includes all channel types + categories) */
  Channel = 7,

  /** Role option type */
  Role = 8,

  /** Mentionable option type (includes users and roles) */
  Mentionable = 9,

  /** Number option type (any double between -2^53 and 2^53) */
  Number = 10,

  /** Attachment option type */
  Attachment = 11,
}

/**
 * Permission types for application commands
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-permissions-object-application-command-permission-type}
 */
export enum ApplicationCommandPermissionType {
  /** Role permission */
  Role = 1,

  /** User permission */
  User = 2,

  /** Channel permission */
  Channel = 3,
}

/**
 * Types of application commands
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-types}
 */
export enum ApplicationCommandType {
  /** Slash commands; text-based commands that show up when a user types / */
  ChatInput = 1,

  /** A UI-based command that shows up when you right click or tap on a user */
  User = 2,

  /** A UI-based command that shows up when you right click or tap on a message */
  Message = 3,

  /** A UI-based command that represents the primary way to invoke an app's Activity */
  PrimaryEntryPoint = 4,
}

/**
 * Handlers for EntryPoint commands
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-entry-point-command-handler-types}
 */
export enum ApplicationCommandEntryPointType {
  /** The app handles the interaction using an interaction token */
  AppHandler = 1,

  /** Discord handles the interaction by launching an Activity and sending a follow-up message without coordinating with the app */
  DiscordLaunchActivity = 2,
}

/**
 * Regular expression pattern for validating command names
 */
export const APPLICATION_COMMAND_NAME_REGEX =
  /^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

/**
 * Represents a choice for a command option
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-choice-structure}
 */
export interface ApplicationCommandOptionChoiceEntity {
  /**
   * 1-100 character choice name
   * @minLength 1
   * @maxLength 100
   */
  name: string;

  /**
   * Localization dictionary for the name field
   * @optional
   */
  name_localizations?: Record<Locale, string> | null;

  /** Value for the choice (string, integer, or double) */
  value: string | number;
}

/**
 * Base interface for all command options with all possible properties
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export interface ApplicationCommandOptionEntity {
  /** Type of command option */
  type: ApplicationCommandOptionType;

  /**
   * 1-32 character name matching the regex pattern
   * @minLength 1
   * @maxLength 32
   * @pattern ^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$
   */
  name: string;

  /**
   * Localization dictionary for the name field
   * @optional
   */
  name_localizations?: Record<Locale, string> | null;

  /**
   * 1-100 character description
   * @minLength 1
   * @maxLength 100
   */
  description: string;

  /**
   * Localization dictionary for the description field
   * @optional
   */
  description_localizations?: Record<Locale, string> | null;

  /** Whether this option is required */
  required?: boolean;

  /**
   * Choices for the user to pick from (up to 25)
   * @maxItems 25
   */
  choices?: ApplicationCommandOptionChoiceEntity[];

  /**
   * Options for this option (for subcommands and groups)
   * @maxItems 25
   */
  options?: ApplicationCommandOptionEntity[];

  /** Channel types that will be shown (for channel options) */
  channel_types?: ChannelType[];

  /** Minimum value (for number and integer options) */
  min_value?: number;

  /** Maximum value (for number and integer options) */
  max_value?: number;

  /**
   * Minimum allowed length (for string options)
   * @minimum 0
   * @maximum 6000
   */
  min_length?: number;

  /**
   * Maximum allowed length (for string options)
   * @minimum 1
   * @maximum 6000
   */
  max_length?: number;

  /** Whether autocomplete interactions are enabled */
  autocomplete?: boolean;
}

/**
 * String Option - For string inputs
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export interface StringOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    "options" | "channel_types" | "min_value" | "max_value"
  > {
  /** String option type */
  type: ApplicationCommandOptionType.String;

  /**
   * Whether this option is required
   * @default false
   */
  required?: boolean;
}

/**
 * Integer Option - For integer inputs
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export interface IntegerOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    "options" | "channel_types" | "min_length" | "max_length"
  > {
  /** Integer option type */
  type: ApplicationCommandOptionType.Integer;

  /**
   * Whether this option is required
   * @default false
   */
  required?: boolean;

  /** Minimum value must be an integer */
  min_value?: number;

  /** Maximum value must be an integer */
  max_value?: number;
}

/**
 * Number Option - For floating point number inputs
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export interface NumberOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    "options" | "channel_types" | "min_length" | "max_length"
  > {
  /** Number option type */
  type: ApplicationCommandOptionType.Number;

  /**
   * Whether this option is required
   * @default false
   */
  required?: boolean;
}

/**
 * Channel Option - For channel selection
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export interface ChannelOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "choices"
    | "options"
    | "min_value"
    | "max_value"
    | "min_length"
    | "max_length"
    | "autocomplete"
  > {
  /** Channel option type */
  type: ApplicationCommandOptionType.Channel;

  /**
   * Whether this option is required
   * @default false
   */
  required?: boolean;
}

/**
 * Boolean Option - For true/false inputs
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export interface BooleanOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "choices"
    | "options"
    | "channel_types"
    | "min_value"
    | "max_value"
    | "min_length"
    | "max_length"
    | "autocomplete"
  > {
  /** Boolean option type */
  type: ApplicationCommandOptionType.Boolean;

  /**
   * Whether this option is required
   * @default false
   */
  required?: boolean;
}

/**
 * User Option - For user selection
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export interface UserOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "choices"
    | "options"
    | "channel_types"
    | "min_value"
    | "max_value"
    | "min_length"
    | "max_length"
    | "autocomplete"
  > {
  /** User option type */
  type: ApplicationCommandOptionType.User;

  /**
   * Whether this option is required
   * @default false
   */
  required?: boolean;
}

/**
 * Role Option - For role selection
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export interface RoleOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "choices"
    | "options"
    | "channel_types"
    | "min_value"
    | "max_value"
    | "min_length"
    | "max_length"
    | "autocomplete"
  > {
  /** Role option type */
  type: ApplicationCommandOptionType.Role;

  /**
   * Whether this option is required
   * @default false
   */
  required?: boolean;
}

/**
 * Mentionable Option - For selecting users or roles
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export interface MentionableOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "choices"
    | "options"
    | "channel_types"
    | "min_value"
    | "max_value"
    | "min_length"
    | "max_length"
    | "autocomplete"
  > {
  /** Mentionable option type */
  type: ApplicationCommandOptionType.Mentionable;

  /**
   * Whether this option is required
   * @default false
   */
  required?: boolean;
}

/**
 * Attachment Option - For file uploads
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export interface AttachmentOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "choices"
    | "options"
    | "channel_types"
    | "min_value"
    | "max_value"
    | "min_length"
    | "max_length"
    | "autocomplete"
  > {
  /** Attachment option type */
  type: ApplicationCommandOptionType.Attachment;

  /**
   * Whether this option is required
   * @default false
   */
  required?: boolean;
}

/**
 * Simple command options (excluding subcommands and groups)
 */
export type AnySimpleApplicationCommandOptionEntity =
  | StringOptionEntity
  | IntegerOptionEntity
  | NumberOptionEntity
  | ChannelOptionEntity
  | BooleanOptionEntity
  | UserOptionEntity
  | RoleOptionEntity
  | MentionableOptionEntity
  | AttachmentOptionEntity;

/**
 * SubCommand Option - A subcommand within a command
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export interface SubOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "choices"
    | "channel_types"
    | "min_value"
    | "max_value"
    | "min_length"
    | "max_length"
    | "autocomplete"
    | "required"
  > {
  /** Subcommand type */
  type: ApplicationCommandOptionType.SubCommand;

  /**
   * Parameters for this subcommand (up to 25)
   * @maxItems 25
   */
  options?: AnySimpleApplicationCommandOptionEntity[];
}

/**
 * SubCommandGroup Option - A group of subcommands
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export interface SubGroupOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "choices"
    | "channel_types"
    | "min_value"
    | "max_value"
    | "min_length"
    | "max_length"
    | "autocomplete"
    | "required"
  > {
  /** Subcommand group type */
  type: ApplicationCommandOptionType.SubCommandGroup;

  /**
   * Subcommands in this group (up to 25)
   * @maxItems 25
   */
  options?: SubOptionEntity[];
}

/**
 * Union of all possible command options with discriminated union pattern
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export type AnyApplicationCommandOptionEntity =
  | SubOptionEntity
  | SubGroupOptionEntity
  | AnySimpleApplicationCommandOptionEntity;

/**
 * Permission structure for application commands
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-permissions-object-application-command-permissions-structure}
 */
export interface ApplicationCommandPermissionEntity {
  /** ID of the role, user, or channel */
  id: Snowflake;

  /** Type of permission (role, user, or channel) */
  type: ApplicationCommandPermissionType;

  /** true to allow, false to disallow */
  permission: boolean;
}

/**
 * Permissions structure for guild commands
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-permissions-object-guild-application-command-permissions-structure}
 */
export interface GuildApplicationCommandPermissionEntity {
  /** ID of the command or the application ID */
  id: Snowflake;

  /** ID of the application the command belongs to */
  application_id: Snowflake;

  /** ID of the guild */
  guild_id: Snowflake;

  /**
   * Permissions for the command in the guild (max 100)
   * @maxItems 100
   */
  permissions: ApplicationCommandPermissionEntity[];
}

/**
 * Complete Application Command structure with all possible properties
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-structure}
 */
export interface ApplicationCommandEntity {
  /** Unique ID of command */
  id: Snowflake;

  /** Type of command */
  type: ApplicationCommandType;

  /** ID of the parent application */
  application_id: Snowflake;

  /** Guild ID of the command, if not global */
  guild_id?: Snowflake;

  /**
   * 1-32 character name matching regex pattern
   * @minLength 1
   * @maxLength 32
   * @pattern ^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$
   */
  name: string;

  /**
   * Localization dictionary for the name field
   * @optional
   */
  name_localizations?: Record<Locale, string> | null;

  /**
   * 1-100 character description
   * @minLength 1
   * @maxLength 100
   */
  description: string;

  /**
   * Localization dictionary for the description field
   * @optional
   */
  description_localizations?: Record<Locale, string> | null;

  /**
   * Parameters for the command (max of 25)
   * @maxItems 25
   */
  options?: AnyApplicationCommandOptionEntity[];

  /** Set of permissions represented as a bit set */
  default_member_permissions: string | null;

  /**
   * Whether command is available in DMs with the app
   * @deprecated - use contexts instead
   */
  dm_permission?: boolean;

  /** Whether command is enabled by default when app is added to guild (deprecated) */
  default_permission?: boolean | null;

  /** Whether command is age-restricted */
  nsfw?: boolean;

  /** Installation contexts where command is available */
  integration_types?: ApplicationIntegrationType[];

  /** Interaction contexts where command can be used */
  contexts?: InteractionContextType[];

  /** Autoincrementing version identifier */
  version: Snowflake;

  /** How the interaction should be handled (for entry point commands) */
  handler?: ApplicationCommandEntryPointType;
}

/**
 * Chat Input Command - Slash commands with /
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-structure}
 */
export interface ChatInputApplicationCommandEntity
  extends Omit<ApplicationCommandEntity, "type" | "handler"> {
  /** Chat input command type */
  type: ApplicationCommandType.ChatInput;
}

/**
 * User Command - Context menu command for users
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-structure}
 */
export interface UserApplicationCommandEntity
  extends Omit<
    ApplicationCommandEntity,
    "type" | "description" | "description_localizations" | "options" | "handler"
  > {
  /** User command type */
  type: ApplicationCommandType.User;
}

/**
 * Message Command - Context menu command for messages
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-structure}
 */
export interface MessageApplicationCommandEntity
  extends Omit<
    ApplicationCommandEntity,
    "type" | "description" | "description_localizations" | "options" | "handler"
  > {
  /** Message command type */
  type: ApplicationCommandType.Message;
}

/**
 * Entry Point Command - Primary way to launch an app's Activity
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-structure}
 */
export interface EntryPointApplicationCommandEntity
  extends Omit<ApplicationCommandEntity, "type" | "options"> {
  /** Entry point command type */
  type: ApplicationCommandType.PrimaryEntryPoint;
  /** How the interaction should be handled */
  handler: ApplicationCommandEntryPointType;
}

/**
 * Union of all application command types with discriminated union pattern
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-structure}
 */
export type AnyApplicationCommandEntity =
  | ChatInputApplicationCommandEntity
  | UserApplicationCommandEntity
  | MessageApplicationCommandEntity
  | EntryPointApplicationCommandEntity;

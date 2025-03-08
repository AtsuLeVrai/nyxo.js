import type { Locale } from "../enums/index.js";
import type { Snowflake } from "../managers/index.js";
import type { ApplicationIntegrationType } from "./application.entity.js";
import type { ChannelType } from "./channel.entity.js";
import type { InteractionContextType } from "./interaction.entity.js";

/**
 * Available application command option types
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type}
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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permission-type}
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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types}
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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-entry-point-command-handler-types}
 */
export enum ApplicationCommandEntryPointType {
  /** The app handles the interaction using an interaction token */
  AppHandler = 1,

  /** Discord handles the interaction by launching an Activity and sending a follow-up message without coordinating with the app */
  DiscordLaunchActivity = 2,
}

/**
 * Represents a choice for a command option
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-choice-structure}
 */
export interface ApplicationCommandOptionChoiceEntity {
  /** 1-100 character choice name */
  name: string;

  /** Localization dictionary for the name field */
  name_localizations?: Record<Locale, string> | null;

  /** Value for the choice (string, integer, or double) */
  value: string | number;
}

/**
 * Base structure for all command options
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface BaseApplicationCommandOptionEntity {
  /** 1-32 character name matching the regex pattern */
  name: string;

  /** Localization dictionary for the name field */
  name_localizations?: Record<Locale, string> | null;

  /** 1-100 character description */
  description: string;

  /** Localization dictionary for the description field */
  description_localizations?: Record<Locale, string> | null;
}

/**
 * String Option - For string inputs
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface StringOptionEntity extends BaseApplicationCommandOptionEntity {
  /** String option type */
  type: ApplicationCommandOptionType.String;

  /** Whether this option is required */
  required?: boolean;

  /** Minimum allowed length (0-6000) */
  min_length?: number;

  /** Maximum allowed length (1-6000) */
  max_length?: number;

  /** Whether autocomplete interactions are enabled */
  autocomplete?: boolean;

  /** Choices for the user to pick from (up to 25) */
  choices?: ApplicationCommandOptionChoiceEntity[];
}

/**
 * Integer Option - For integer inputs
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface IntegerOptionEntity
  extends BaseApplicationCommandOptionEntity {
  /** Integer option type */
  type: ApplicationCommandOptionType.Integer;

  /** Whether this option is required */
  required?: boolean;

  /** Minimum value */
  min_value?: number;

  /** Maximum value */
  max_value?: number;

  /** Whether autocomplete interactions are enabled */
  autocomplete?: boolean;

  /** Choices for the user to pick from (up to 25) */
  choices?: ApplicationCommandOptionChoiceEntity[];
}

/**
 * Number Option - For floating point number inputs
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface NumberOptionEntity extends BaseApplicationCommandOptionEntity {
  /** Number option type */
  type: ApplicationCommandOptionType.Number;

  /** Whether this option is required */
  required?: boolean;

  /** Minimum value */
  min_value?: number;

  /** Maximum value */
  max_value?: number;

  /** Whether autocomplete interactions are enabled */
  autocomplete?: boolean;

  /** Choices for the user to pick from (up to 25) */
  choices?: ApplicationCommandOptionChoiceEntity[];
}

/**
 * Channel Option - For channel selection
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface ChannelOptionEntity
  extends BaseApplicationCommandOptionEntity {
  /** Channel option type */
  type: ApplicationCommandOptionType.Channel;

  /** Whether this option is required */
  required?: boolean;

  /** The channel types that will be shown */
  channel_types?: ChannelType[];
}

/**
 * Boolean Option - For true/false inputs
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface BooleanOptionEntity
  extends BaseApplicationCommandOptionEntity {
  /** Boolean option type */
  type: ApplicationCommandOptionType.Boolean;

  /** Whether this option is required */
  required?: boolean;
}

/**
 * User Option - For user selection
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface UserOptionEntity extends BaseApplicationCommandOptionEntity {
  /** User option type */
  type: ApplicationCommandOptionType.User;

  /** Whether this option is required */
  required?: boolean;
}

/**
 * Role Option - For role selection
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface RoleOptionEntity extends BaseApplicationCommandOptionEntity {
  /** Role option type */
  type: ApplicationCommandOptionType.Role;

  /** Whether this option is required */
  required?: boolean;
}

/**
 * Mentionable Option - For selecting users or roles
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface MentionableOptionEntity
  extends BaseApplicationCommandOptionEntity {
  /** Mentionable option type */
  type: ApplicationCommandOptionType.Mentionable;

  /** Whether this option is required */
  required?: boolean;
}

/**
 * Attachment Option - For file uploads
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface AttachmentOptionEntity
  extends BaseApplicationCommandOptionEntity {
  /** Attachment option type */
  type: ApplicationCommandOptionType.Attachment;

  /** Whether this option is required */
  required?: boolean;
}

/**
 * Simple command options (excluding subcommands and groups)
 */
export type SimpleApplicationCommandOptionEntity =
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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface SubOptionEntity extends BaseApplicationCommandOptionEntity {
  /** Subcommand type */
  type: ApplicationCommandOptionType.SubCommand;

  /** Parameters for this subcommand (up to 25) */
  options: SimpleApplicationCommandOptionEntity[];
}

/**
 * SubCommandGroup Option - A group of subcommands
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface SubGroupOptionEntity
  extends BaseApplicationCommandOptionEntity {
  /** Subcommand group type */
  type: ApplicationCommandOptionType.SubCommandGroup;

  /** Subcommands in this group (up to 25) */
  options: SubOptionEntity[];
}

/**
 * Union of all possible command options with discriminated union pattern
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export type AnyApplicationCommandOptionEntity =
  | SubOptionEntity
  | SubGroupOptionEntity
  | SimpleApplicationCommandOptionEntity;

/**
 * Permission structure for application commands
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permissions-structure}
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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure}
 */
export interface GuildApplicationCommandPermissionEntity {
  /** ID of the command or the application ID */
  id: Snowflake;

  /** ID of the application the command belongs to */
  application_id: Snowflake;

  /** ID of the guild */
  guild_id: Snowflake;

  /** Permissions for the command in the guild (max 100) */
  permissions: ApplicationCommandPermissionEntity[];
}

/**
 * Base Application Command structure - shared by all command types
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export interface BaseApplicationCommandEntity {
  /** Unique ID of command */
  id: Snowflake;

  /** ID of the parent application */
  application_id: Snowflake;

  /** Guild ID of the command, if not global */
  guild_id?: Snowflake;

  /** 1-32 character name matching regex pattern */
  name: string;

  /** Localization dictionary for the name field */
  name_localizations?: Record<Locale, string> | null;

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
}

/**
 * Chat Input Command - Slash commands with /
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export interface ChatInputApplicationCommandEntity
  extends BaseApplicationCommandEntity {
  /** Chat input command type */
  type: ApplicationCommandType.ChatInput;

  /** 1-100 character description */
  description: string;

  /** Localization dictionary for the description field */
  description_localizations?: Record<Locale, string> | null;

  /** Parameters for the command (max of 25) */
  options?: AnyApplicationCommandOptionEntity[];
}

/**
 * User Command - Context menu command for users
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export interface UserApplicationCommandEntity
  extends BaseApplicationCommandEntity {
  /** User command type */
  type: ApplicationCommandType.User;
}

/**
 * Message Command - Context menu command for messages
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export interface MessageApplicationCommandEntity
  extends BaseApplicationCommandEntity {
  /** Message command type */
  type: ApplicationCommandType.Message;
}

/**
 * Entry Point Command - Primary way to launch an app's Activity
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export interface EntryPointApplicationCommandEntity
  extends BaseApplicationCommandEntity {
  /** Entry point command type */
  type: ApplicationCommandType.PrimaryEntryPoint;

  /** 1-100 character description */
  description: string;

  /** Localization dictionary for the description field */
  description_localizations?: Record<Locale, string> | null;

  /** How the interaction should be handled */
  handler: ApplicationCommandEntryPointType;
}

/**
 * Union of all application command types with discriminated union pattern
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export type AnyApplicationCommandEntity =
  | ChatInputApplicationCommandEntity
  | UserApplicationCommandEntity
  | MessageApplicationCommandEntity
  | EntryPointApplicationCommandEntity;

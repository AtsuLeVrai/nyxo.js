import type { LocaleValues } from "../enums/index.js";
import type { Snowflake } from "../utils/index.js";
import type { ApplicationIntegrationType } from "./application.entity.js";
import type { ChannelType } from "./channel.entity.js";
import type { InteractionContextType } from "./interaction.entity.js";

/**
 * Available application command option types.
 * These determine the type of input the user provides when using a command option.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type}
 */
export enum ApplicationCommandOptionType {
  /**
   * Denotes a subcommand within a command.
   * Cannot have required flag, as subcommands don't take direct input.
   */
  SubCommand = 1,

  /**
   * Denotes a subcommand group containing subcommands.
   * Cannot have required flag, as subcommand groups don't take direct input.
   */
  SubCommandGroup = 2,

  /**
   * String option type.
   * Accepts text input from users, can have min_length and max_length constraints.
   */
  String = 3,

  /**
   * Integer option type.
   * Accepts any integer between -2^53 and 2^53.
   */
  Integer = 4,

  /**
   * Boolean option type.
   * Simple true/false toggle.
   */
  Boolean = 5,

  /**
   * User option type.
   * Allows selecting a user from the server.
   */
  User = 6,

  /**
   * Channel option type.
   * Includes all channel types + categories.
   * Can be filtered by channel_types.
   */
  Channel = 7,

  /**
   * Role option type.
   * Allows selecting a role from the server.
   */
  Role = 8,

  /**
   * Mentionable option type.
   * Allows selecting users and roles.
   */
  Mentionable = 9,

  /**
   * Number option type.
   * Accepts any double between -2^53 and 2^53.
   */
  Number = 10,

  /**
   * Attachment option type.
   * Allows for file uploads.
   */
  Attachment = 11,
}

/**
 * Permission types for application commands.
 * These define the target entity type for permission overwrites.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permission-type}
 */
export enum ApplicationCommandPermissionType {
  /**
   * Role permission.
   * Applies to a specific role.
   */
  Role = 1,

  /**
   * User permission.
   * Applies to a specific user.
   */
  User = 2,

  /**
   * Channel permission.
   * Applies to a specific channel.
   */
  Channel = 3,
}

/**
 * Types of application commands.
 * Each type represents a different way users can interact with the command.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types}
 */
export enum ApplicationCommandType {
  /**
   * Slash commands (CHAT_INPUT).
   * Text-based commands that show up when a user types /.
   */
  ChatInput = 1,

  /**
   * User commands.
   * UI-based commands that show up when you right click or tap on a user.
   */
  User = 2,

  /**
   * Message commands.
   * UI-based commands that show up when you right click or tap on a message.
   */
  Message = 3,

  /**
   * Primary entry point commands.
   * UI-based commands that represent the primary way to invoke an app's Activity.
   */
  PrimaryEntryPoint = 4,
}

/**
 * Handlers for Entry Point commands.
 * Determines how the interaction is handled when an Entry Point command is invoked.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#entry-point-command-handler-types}
 */
export enum ApplicationCommandEntryPointType {
  /**
   * The app handles the interaction using an interaction token.
   */
  AppHandler = 1,

  /**
   * Discord handles the interaction by launching an Activity and sending a follow-up message without coordinating with the app.
   */
  DiscordLaunchActivity = 2,
}

/**
 * Regular expression pattern for validating command names.
 * Command names must match this pattern which supports unicode characters.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-naming}
 */
export const APPLICATION_COMMAND_NAME_REGEX =
  /^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

/**
 * Represents a choice for a command option.
 * Choices provide predefined values that users can select from.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-choice-structure}
 */
export interface ApplicationCommandOptionChoiceEntity {
  /**
   * 1-100 character choice name.
   * This is what users will see in the Discord client.
   */
  name: string;

  /**
   * Localization dictionary for the name field.
   * Values follow the same restrictions as name.
   */
  name_localizations?: Partial<Record<LocaleValues, string>> | null;

  /**
   * Value for the choice.
   * Type depends on the option type (string, integer, or double).
   * Up to 100 characters if string.
   */
  value: string | number;
}

/**
 * Base schema for all command options with all possible properties.
 * Contains all fields that may appear in any kind of command option.
 * Many fields are optional as they only apply to specific option types.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface ApplicationCommandOptionEntity {
  /**
   * Type of command option.
   * Determines which other fields are valid and how the option is displayed.
   */
  type: ApplicationCommandOptionType;

  /**
   * 1-32 character name matching the regex pattern.
   * Must be in lowercase for CHAT_INPUT commands.
   */
  name: string;

  /**
   * Localization dictionary for the name field.
   * Values follow the same restrictions as name.
   */
  name_localizations?: Partial<Record<LocaleValues, string>> | null;

  /**
   * 1-100 character description.
   * Explains what the option does.
   */
  description: string;

  /**
   * Localization dictionary for the description field.
   * Values follow the same restrictions as description.
   */
  description_localizations?: Partial<Record<LocaleValues, string>> | null;

  /**
   * Whether this option is required.
   * True if the parameter must be provided when using the command.
   * Cannot be true for SubCommand and SubCommandGroup types.
   */
  required?: boolean;

  /**
   * Choices for the user to pick from.
   * If specified, users can only select from these choices.
   * Only applicable to String, Integer, and Number types.
   */
  choices?: ApplicationCommandOptionChoiceEntity[];

  /**
   * Minimum allowed length.
   * Applicable only to options of type STRING.
   */
  min_length?: number;

  /**
   * Maximum allowed length.
   * Applicable only to options of type STRING.
   */
  max_length?: number;

  /**
   * Minimum value.
   * Any number/integer between -2^53 and 2^53.
   * Only applicable to Integer and Number types.
   */
  min_value?: number;

  /**
   * Maximum value.
   * Any number/integer between -2^53 and 2^53.
   * Only applicable to Integer and Number types.
   */
  max_value?: number;

  /**
   * Whether autocomplete interactions are enabled for this option.
   * Cannot be true if choices are present.
   * Only applicable to String, Integer, and Number types.
   */
  autocomplete?: boolean;

  /**
   * Channel types that will be shown when this option is used.
   * Applicable only to options of type CHANNEL.
   */
  channel_types?: ChannelType[];

  /**
   * Parameters for this subcommand or options for this subcommand group.
   * Only applicable to SubCommand and SubCommandGroup types.
   */
  options?: AnyApplicationCommandOptionEntity[];
}

/**
 * String Option - For string inputs.
 * Can have choices or autocomplete, and length constraints.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface StringCommandOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    "min_value" | "max_value" | "channel_types"
  > {
  /** String option type */
  type: ApplicationCommandOptionType.String;
}

/**
 * Integer Option - For integer inputs.
 * Can have choices or autocomplete, and min/max constraints.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface IntegerCommandOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    "min_length" | "max_length" | "channel_types"
  > {
  /** Integer option type */
  type: ApplicationCommandOptionType.Integer;
}

/**
 * Number Option - For floating point number inputs.
 * Can have choices or autocomplete, and min/max constraints.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface NumberCommandOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    "min_length" | "max_length" | "channel_types"
  > {
  /** Number option type */
  type: ApplicationCommandOptionType.Number;
}

/**
 * Channel Option - For channel selection.
 * Can be filtered to specific channel types.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface ChannelCommandOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "choices"
    | "min_length"
    | "max_length"
    | "min_value"
    | "max_value"
    | "autocomplete"
  > {
  /** Channel option type */
  type: ApplicationCommandOptionType.Channel;
}

/**
 * Boolean Option - For true/false inputs.
 * Simple toggle without additional configuration.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface BooleanCommandOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "choices"
    | "min_length"
    | "max_length"
    | "min_value"
    | "max_value"
    | "autocomplete"
    | "channel_types"
  > {
  /** Boolean option type */
  type: ApplicationCommandOptionType.Boolean;
}

/**
 * User Option - For user selection.
 * Allows selecting a user from the guild.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface UserCommandOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "choices"
    | "min_length"
    | "max_length"
    | "min_value"
    | "max_value"
    | "autocomplete"
    | "channel_types"
  > {
  /** User option type */
  type: ApplicationCommandOptionType.User;
}

/**
 * Role Option - For role selection.
 * Allows selecting a role from the guild.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface RoleCommandOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "choices"
    | "min_length"
    | "max_length"
    | "min_value"
    | "max_value"
    | "autocomplete"
    | "channel_types"
  > {
  /** Role option type */
  type: ApplicationCommandOptionType.Role;
}

/**
 * Mentionable Option - For selecting users or roles.
 * Allows selecting either a user or a role.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface MentionableCommandOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "choices"
    | "min_length"
    | "max_length"
    | "min_value"
    | "max_value"
    | "autocomplete"
    | "channel_types"
  > {
  /** Mentionable option type */
  type: ApplicationCommandOptionType.Mentionable;
}

/**
 * Attachment Option - For file uploads.
 * Allows attaching files to a command.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface AttachmentCommandOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "choices"
    | "min_length"
    | "max_length"
    | "min_value"
    | "max_value"
    | "autocomplete"
    | "channel_types"
  > {
  /** Attachment option type */
  type: ApplicationCommandOptionType.Attachment;
}

/**
 * SubCommand Option - A subcommand within a command.
 * Allows organizing commands into actions.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface SubCommandOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "required"
    | "choices"
    | "min_length"
    | "max_length"
    | "min_value"
    | "max_value"
    | "autocomplete"
    | "channel_types"
  > {
  /** Subcommand type */
  type: ApplicationCommandOptionType.SubCommand;

  /**
   * Parameters for this subcommand (up to 25).
   * Cannot include SubCommand or SubCommandGroup options.
   */
  options?: AnySimpleApplicationCommandOptionEntity[];
}

/**
 * SubCommandGroup Option - A group of subcommands.
 * Allows organizing subcommands by similar action or resource.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface SubCommandGroupOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    | "required"
    | "choices"
    | "min_length"
    | "max_length"
    | "min_value"
    | "max_value"
    | "autocomplete"
    | "channel_types"
  > {
  /** Subcommand group type */
  type: ApplicationCommandOptionType.SubCommandGroup;

  /**
   * Subcommands in this group (up to 25).
   * Only SubCommand options are allowed.
   */
  options: SubCommandOptionEntity[];
}

/**
 * Simple command options (excluding subcommands and groups).
 * Union type for all direct input options.
 */
export type AnySimpleApplicationCommandOptionEntity =
  | StringCommandOptionEntity
  | IntegerCommandOptionEntity
  | NumberCommandOptionEntity
  | ChannelCommandOptionEntity
  | BooleanCommandOptionEntity
  | UserCommandOptionEntity
  | RoleCommandOptionEntity
  | MentionableCommandOptionEntity
  | AttachmentCommandOptionEntity;

/**
 * Complex command options (subcommands and groups).
 * Union type for all options that can contain other options.
 */
export type AnyComplexApplicationCommandOptionEntity =
  | SubCommandOptionEntity
  | SubCommandGroupOptionEntity;

/**
 * Union of all possible command options with discriminated union pattern.
 * Can be used to represent any type of command option.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export type AnyApplicationCommandOptionEntity =
  | AnySimpleApplicationCommandOptionEntity
  | AnyComplexApplicationCommandOptionEntity;

/**
 * Permission structure for application commands.
 * Defines whether specific roles, users, or channels can use a command.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permissions-structure}
 */
export interface ApplicationCommandPermissionEntity {
  /**
   * ID of the role, user, or channel.
   * Can also be a permission constant, such as guild_id for everyone or guild_id - 1 for all channels.
   */
  id: Snowflake;

  /**
   * Type of permission (role, user, or channel).
   * Determines how the ID is interpreted.
   */
  type: ApplicationCommandPermissionType;

  /**
   * Whether to allow or disallow the command.
   * true to allow, false to disallow.
   */
  permission: boolean;
}

/**
 * Permissions structure for guild commands.
 * Returned when fetching the permissions for app's command(s) in a guild.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure}
 */
export interface GuildApplicationCommandPermissionEntity {
  /**
   * ID of the command or the application ID.
   * When it's the application ID, permissions apply to all commands without explicit overwrites.
   */
  id: Snowflake;

  /**
   * ID of the application the command belongs to.
   * Identifies which app owns this command.
   */
  application_id: Snowflake;

  /**
   * ID of the guild.
   * The guild where these permissions apply.
   */
  guild_id: Snowflake;

  /**
   * Permissions for the command in the guild.
   * List of permission overwrites.
   */
  permissions: ApplicationCommandPermissionEntity[];
}

/**
 * Application Command schema with all possible properties.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export interface ApplicationCommandEntity {
  /**
   * Unique ID of command.
   * Auto-assigned by Discord.
   */
  id: Snowflake;

  /**
   * Type of command.
   * Determines how the command is accessed in the client.
   */
  type: ApplicationCommandType;

  /**
   * ID of the parent application.
   * The application that owns this command.
   */
  application_id: Snowflake;

  /**
   * Guild ID of the command, if not global.
   * If present, command is only available in this guild.
   */
  guild_id?: Snowflake;

  /**
   * Name of command, 1-32 characters.
   * Must be lowercase for CHAT_INPUT commands, can be mixed case for others.
   */
  name: string;

  /**
   * Localization dictionary for the name field.
   * Values follow the same restrictions as name.
   */
  name_localizations?: Partial<Record<LocaleValues, string>> | null;

  /**
   * Description for CHAT_INPUT commands, 1-100 characters.
   * Empty string for USER and MESSAGE commands.
   */
  description: string;

  /**
   * Localization dictionary for the description field.
   * Values follow the same restrictions as description.
   */
  description_localizations?: Partial<Record<LocaleValues, string>> | null;

  /**
   * Set of permissions represented as a bit set.
   * Controls which users can use the command by default.
   * null means everyone can use it.
   */
  default_member_permissions: string | null;

  /**
   * Whether command is available in DMs with the app.
   * Only applies to globally-scoped commands.
   * @deprecated Use contexts instead.
   */
  dm_permission?: boolean;

  /**
   * Whether command is enabled by default when app is added to guild.
   * Deprecated, use default_member_permissions instead.
   * @deprecated Replaced by default_member_permissions.
   */
  default_permission?: boolean | null;

  /**
   * Whether command is age-restricted.
   * If true, limits who can see and access the command.
   */
  nsfw?: boolean;

  /**
   * Installation contexts where command is available.
   * Determines if command is available to servers, users, or both.
   */
  integration_types?: ApplicationIntegrationType[];

  /**
   * Interaction contexts where command can be used.
   * Controls whether command is usable in guilds, DMs, or GDMs.
   */
  contexts?: InteractionContextType[];

  /**
   * Autoincrementing version identifier.
   * Updated during substantial record changes.
   */
  version: Snowflake;

  /**
   * Parameters for the command.
   * Only available for CHAT_INPUT commands.
   */
  options?: AnyApplicationCommandOptionEntity[];

  /**
   * How the interaction should be handled.
   * Determines whether the app or Discord handles the interaction.
   */
  handler: ApplicationCommandEntryPointType;
}

/**
 * Chat Input Command - Slash commands with /.
 * Text-based commands that appear in the command menu.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export interface ChatInputApplicationCommandEntity
  extends Omit<ApplicationCommandEntity, "handler"> {
  /**
   * Chat input command type.
   * Always CHAT_INPUT (1).
   */
  type: ApplicationCommandType.ChatInput;
}

/**
 * User Command - Context menu command for users.
 * Appears when right-clicking or tapping on a user.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export interface UserApplicationCommandEntity
  extends Omit<ApplicationCommandEntity, "options" | "handler"> {
  /**
   * User command type.
   * Always USER (2).
   */
  type: ApplicationCommandType.User;
}

/**
 * Message Command - Context menu command for messages.
 * Appears when right-clicking or tapping on a message.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export interface MessageApplicationCommandEntity
  extends Omit<ApplicationCommandEntity, "options" | "handler"> {
  /**
   * Message command type.
   * Always MESSAGE (3).
   */
  type: ApplicationCommandType.Message;
}

/**
 * Entry Point Command - Primary way to launch an app's Activity.
 * Appears in the App Launcher.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export interface EntryPointApplicationCommandEntity
  extends Omit<ApplicationCommandEntity, "options"> {
  /**
   * Entry point command type.
   * Always PRIMARY_ENTRY_POINT (4).
   */
  type: ApplicationCommandType.PrimaryEntryPoint;
}

/**
 * Union of all application command types with discriminated union pattern.
 * Can be used to represent any type of application command.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export type AnyApplicationCommandEntity =
  | ChatInputApplicationCommandEntity
  | UserApplicationCommandEntity
  | MessageApplicationCommandEntity
  | EntryPointApplicationCommandEntity;

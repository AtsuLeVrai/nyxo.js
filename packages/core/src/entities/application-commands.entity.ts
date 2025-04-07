import type { Locale } from "../enums/index.js";
import type { Snowflake } from "../managers/index.js";
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
   * @value 1
   */
  SubCommand = 1,

  /**
   * Denotes a subcommand group containing subcommands.
   * Cannot have required flag, as subcommand groups don't take direct input.
   * @value 2
   */
  SubCommandGroup = 2,

  /**
   * String option type.
   * Accepts text input from users, can have min_length and max_length constraints.
   * @value 3
   */
  String = 3,

  /**
   * Integer option type.
   * Accepts any integer between -2^53 and 2^53.
   * @value 4
   */
  Integer = 4,

  /**
   * Boolean option type.
   * Simple true/false toggle.
   * @value 5
   */
  Boolean = 5,

  /**
   * User option type.
   * Allows selecting a user from the server.
   * @value 6
   */
  User = 6,

  /**
   * Channel option type.
   * Includes all channel types + categories.
   * Can be filtered by channel_types.
   * @value 7
   */
  Channel = 7,

  /**
   * Role option type.
   * Allows selecting a role from the server.
   * @value 8
   */
  Role = 8,

  /**
   * Mentionable option type.
   * Allows selecting users and roles.
   * @value 9
   */
  Mentionable = 9,

  /**
   * Number option type.
   * Accepts any double between -2^53 and 2^53.
   * @value 10
   */
  Number = 10,

  /**
   * Attachment option type.
   * Allows for file uploads.
   * @value 11
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
   * @value 1
   */
  Role = 1,

  /**
   * User permission.
   * Applies to a specific user.
   * @value 2
   */
  User = 2,

  /**
   * Channel permission.
   * Applies to a specific channel.
   * @value 3
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
   * @value 1
   */
  ChatInput = 1,

  /**
   * User commands.
   * UI-based commands that show up when you right click or tap on a user.
   * @value 2
   */
  User = 2,

  /**
   * Message commands.
   * UI-based commands that show up when you right click or tap on a message.
   * @value 3
   */
  Message = 3,

  /**
   * Primary entry point commands.
   * UI-based commands that represent the primary way to invoke an app's Activity.
   * @value 4
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
   * @value 1
   */
  AppHandler = 1,

  /**
   * Discord handles the interaction by launching an Activity and sending a follow-up message without coordinating with the app.
   * @value 2
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
   * @minLength 1
   * @maxLength 100
   */
  name: string;

  /**
   * Localization dictionary for the name field.
   * Values follow the same restrictions as name.
   * @optional
   */
  name_localizations?: Record<Locale, string> | null;

  /**
   * Value for the choice.
   * Type depends on the option type (string, integer, or double).
   * Up to 100 characters if string.
   */
  value: string | number;
}

/**
 * Base interface for all command options with all possible properties.
 * Not all properties apply to all option types.
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
   * @minLength 1
   * @maxLength 32
   * @pattern ^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$
   */
  name: string;

  /**
   * Localization dictionary for the name field.
   * Values follow the same restrictions as name.
   * @optional
   */
  name_localizations?: Record<Locale, string> | null;

  /**
   * 1-100 character description.
   * Explains what the option does.
   * @minLength 1
   * @maxLength 100
   */
  description: string;

  /**
   * Localization dictionary for the description field.
   * Values follow the same restrictions as description.
   * @optional
   */
  description_localizations?: Record<Locale, string> | null;

  /**
   * Whether this option is required.
   * Required options must be listed before optional options.
   * @default false
   */
  required?: boolean;

  /**
   * Choices for the user to pick from.
   * If specified, users can only select from these choices.
   * @maxItems 25
   */
  choices?: ApplicationCommandOptionChoiceEntity[];

  /**
   * Options for this option (for subcommands and groups).
   * @maxItems 25
   */
  options?: ApplicationCommandOptionEntity[];

  /**
   * Channel types that will be shown when this option is used.
   * Applicable only to options of type CHANNEL.
   */
  channel_types?: ChannelType[];

  /**
   * Minimum value permitted.
   * Applicable only to options of type INTEGER or NUMBER.
   */
  min_value?: number;

  /**
   * Maximum value permitted.
   * Applicable only to options of type INTEGER or NUMBER.
   */
  max_value?: number;

  /**
   * Minimum allowed length.
   * Applicable only to options of type STRING.
   * @minimum 0
   * @maximum 6000
   */
  min_length?: number;

  /**
   * Maximum allowed length.
   * Applicable only to options of type STRING.
   * @minimum 1
   * @maximum 6000
   */
  max_length?: number;

  /**
   * Whether autocomplete interactions are enabled for this option.
   * Cannot be true if choices are present.
   * Applicable only to options of type STRING, INTEGER, or NUMBER.
   */
  autocomplete?: boolean;
}

/**
 * String Option - For string inputs.
 * Can have choices or autocomplete, and length constraints.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface StringOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    "options" | "channel_types" | "min_value" | "max_value"
  > {
  /** String option type */
  type: ApplicationCommandOptionType.String;

  /**
   * Whether this option is required.
   * @default false
   */
  required?: boolean;
}

/**
 * Integer Option - For integer inputs.
 * Can have choices or autocomplete, and min/max constraints.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface IntegerOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    "options" | "channel_types" | "min_length" | "max_length"
  > {
  /** Integer option type */
  type: ApplicationCommandOptionType.Integer;

  /**
   * Whether this option is required.
   * @default false
   */
  required?: boolean;

  /**
   * Minimum value must be an integer.
   * Any integer between -2^53 and 2^53.
   */
  min_value?: number;

  /**
   * Maximum value must be an integer.
   * Any integer between -2^53 and 2^53.
   */
  max_value?: number;
}

/**
 * Number Option - For floating point number inputs.
 * Can have choices or autocomplete, and min/max constraints.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface NumberOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    "options" | "channel_types" | "min_length" | "max_length"
  > {
  /** Number option type */
  type: ApplicationCommandOptionType.Number;

  /**
   * Whether this option is required.
   * @default false
   */
  required?: boolean;
}

/**
 * Channel Option - For channel selection.
 * Can be filtered to specific channel types.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
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
   * Whether this option is required.
   * @default false
   */
  required?: boolean;
}

/**
 * Boolean Option - For true/false inputs.
 * Simple toggle without additional configuration.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
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
   * Whether this option is required.
   * @default false
   */
  required?: boolean;
}

/**
 * User Option - For user selection.
 * Allows selecting a user from the guild.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
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
   * Whether this option is required.
   * @default false
   */
  required?: boolean;
}

/**
 * Role Option - For role selection.
 * Allows selecting a role from the guild.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
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
   * Whether this option is required.
   * @default false
   */
  required?: boolean;
}

/**
 * Mentionable Option - For selecting users or roles.
 * Allows selecting either a user or a role.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
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
   * Whether this option is required.
   * @default false
   */
  required?: boolean;
}

/**
 * Attachment Option - For file uploads.
 * Allows attaching files to a command.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
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
   * Whether this option is required.
   * @default false
   */
  required?: boolean;
}

/**
 * Simple command options (excluding subcommands and groups).
 * Union type for all direct input options.
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
 * SubCommand Option - A subcommand within a command.
 * Allows organizing commands into actions.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
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
   * Parameters for this subcommand (up to 25).
   * Cannot include SubCommand or SubCommandGroup options.
   * @maxItems 25
   */
  options?: AnySimpleApplicationCommandOptionEntity[];
}

/**
 * SubCommandGroup Option - A group of subcommands.
 * Allows organizing subcommands by similar action or resource.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
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
   * Subcommands in this group (up to 25).
   * Only SubCommand options are allowed.
   * @maxItems 25
   */
  options?: SubOptionEntity[];
}

/**
 * Union of all possible command options with discriminated union pattern.
 * Can be used to represent any type of command option.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export type AnyApplicationCommandOptionEntity =
  | SubOptionEntity
  | SubGroupOptionEntity
  | AnySimpleApplicationCommandOptionEntity;

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
   * @maxItems 100
   */
  permissions: ApplicationCommandPermissionEntity[];
}

/**
 * Complete Application Command structure with all possible properties.
 * Base interface for all application commands.
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
   * @minLength 1
   * @maxLength 32
   * @pattern ^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$
   */
  name: string;

  /**
   * Localization dictionary for the name field.
   * Values follow the same restrictions as name.
   */
  name_localizations?: Record<Locale, string> | null;

  /**
   * Description for CHAT_INPUT commands, 1-100 characters.
   * Empty string for USER and MESSAGE commands.
   * @minLength 1
   * @maxLength 100
   */
  description: string;

  /**
   * Localization dictionary for the description field.
   * Values follow the same restrictions as description.
   */
  description_localizations?: Record<Locale, string> | null;

  /**
   * Parameters for the command.
   * Only available for CHAT_INPUT commands.
   * @maxItems 25
   */
  options?: AnyApplicationCommandOptionEntity[];

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
   * @default false
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
   * How the interaction should be handled.
   * Only applicable for entry point commands.
   */
  handler?: ApplicationCommandEntryPointType;
}

/**
 * Chat Input Command - Slash commands with /.
 * Text-based commands that appear in the command menu.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export interface ChatInputApplicationCommandEntity
  extends Omit<ApplicationCommandEntity, "type" | "handler"> {
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
  extends Omit<
    ApplicationCommandEntity,
    "type" | "description" | "description_localizations" | "options" | "handler"
  > {
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
  extends Omit<
    ApplicationCommandEntity,
    "type" | "description" | "description_localizations" | "options" | "handler"
  > {
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
  extends Omit<ApplicationCommandEntity, "type" | "options"> {
  /**
   * Entry point command type.
   * Always PRIMARY_ENTRY_POINT (4).
   */
  type: ApplicationCommandType.PrimaryEntryPoint;

  /**
   * How the interaction should be handled.
   * Determines whether the app or Discord handles the interaction.
   */
  handler: ApplicationCommandEntryPointType;
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

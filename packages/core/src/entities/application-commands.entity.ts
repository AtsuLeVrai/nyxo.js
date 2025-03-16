import { z } from "zod";
import { Locale } from "../enums/index.js";
import { Snowflake } from "../managers/index.js";
import { ApplicationIntegrationType } from "./application.entity.js";
import { ChannelType } from "./channel.entity.js";
import { InteractionContextType } from "./interaction.entity.js";

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
export const ApplicationCommandOptionChoiceEntity = z.object({
  /** 1-100 character choice name */
  name: z.string().min(1).max(100),

  /** Localization dictionary for the name field */
  name_localizations: z
    .record(z.nativeEnum(Locale), z.string().min(1).max(100))
    .nullish(),

  /** Value for the choice (string, integer, or double) */
  value: z.union([z.string(), z.number()]),
});

export type ApplicationCommandOptionChoiceEntity = z.infer<
  typeof ApplicationCommandOptionChoiceEntity
>;

/**
 * Complete structure for all command options with all possible properties
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export const ApplicationCommandOptionEntity: z.AnyZodObject = z.object({
  /** Type of command option */
  type: z.nativeEnum(ApplicationCommandOptionType),

  /** 1-32 character name matching the regex pattern */
  name: z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),

  /** Localization dictionary for the name field */
  name_localizations: z
    .record(
      z.nativeEnum(Locale),
      z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
    )
    .nullish(),

  /** 1-100 character description */
  description: z.string().min(1).max(100),

  /** Localization dictionary for the description field */
  description_localizations: z
    .record(z.nativeEnum(Locale), z.string().min(1).max(100))
    .nullish(),

  /** Whether this option is required */
  required: z.boolean().optional(),

  /** Choices for the user to pick from (up to 25) */
  choices: ApplicationCommandOptionChoiceEntity.array().max(25).optional(),

  /** Options for this option (for subcommands and groups) */
  options: z.lazy(() =>
    ApplicationCommandOptionEntity.array().max(25).optional(),
  ),

  /** Channel types that will be shown (for channel options) */
  channel_types: z.nativeEnum(ChannelType).array().optional(),

  /** Minimum value (for number and integer options) */
  min_value: z.number().optional(),

  /** Maximum value (for number and integer options) */
  max_value: z.number().optional(),

  /** Minimum allowed length (for string options) */
  min_length: z.number().int().min(0).max(6000).optional(),

  /** Maximum allowed length (for string options) */
  max_length: z.number().int().min(1).max(6000).optional(),

  /** Whether autocomplete interactions are enabled */
  autocomplete: z.boolean().optional(),
});

export type ApplicationCommandOptionEntity = z.infer<
  typeof ApplicationCommandOptionEntity
>;

/**
 * String Option - For string inputs
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export const StringOptionEntity = ApplicationCommandOptionEntity.omit({
  options: true,
  channel_types: true,
  min_value: true,
  max_value: true,
}).extend({
  /** String option type */
  type: z.literal(ApplicationCommandOptionType.String),

  /** Whether this option is required */
  required: z.boolean().optional().default(false),
});

export type StringOptionEntity = z.infer<typeof StringOptionEntity>;

/**
 * Integer Option - For integer inputs
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export const IntegerOptionEntity = ApplicationCommandOptionEntity.omit({
  options: true,
  channel_types: true,
  min_length: true,
  max_length: true,
}).extend({
  /** Integer option type */
  type: z.literal(ApplicationCommandOptionType.Integer),

  /** Whether this option is required */
  required: z.boolean().optional().default(false),

  /** Minimum value must be an integer */
  min_value: z.number().int().optional(),

  /** Maximum value must be an integer */
  max_value: z.number().int().optional(),
});

export type IntegerOptionEntity = z.infer<typeof IntegerOptionEntity>;

/**
 * Number Option - For floating point number inputs
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export const NumberOptionEntity = ApplicationCommandOptionEntity.omit({
  options: true,
  channel_types: true,
  min_length: true,
  max_length: true,
}).extend({
  /** Number option type */
  type: z.literal(ApplicationCommandOptionType.Number),

  /** Whether this option is required */
  required: z.boolean().optional().default(false),
});

export type NumberOptionEntity = z.infer<typeof NumberOptionEntity>;

/**
 * Channel Option - For channel selection
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export const ChannelOptionEntity = ApplicationCommandOptionEntity.omit({
  choices: true,
  options: true,
  min_value: true,
  max_value: true,
  min_length: true,
  max_length: true,
  autocomplete: true,
}).extend({
  /** Channel option type */
  type: z.literal(ApplicationCommandOptionType.Channel),

  /** Whether this option is required */
  required: z.boolean().optional().default(false),
});

export type ChannelOptionEntity = z.infer<typeof ChannelOptionEntity>;

/**
 * Boolean Option - For true/false inputs
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export const BooleanOptionEntity = ApplicationCommandOptionEntity.omit({
  choices: true,
  options: true,
  channel_types: true,
  min_value: true,
  max_value: true,
  min_length: true,
  max_length: true,
  autocomplete: true,
}).extend({
  /** Boolean option type */
  type: z.literal(ApplicationCommandOptionType.Boolean),

  /** Whether this option is required */
  required: z.boolean().optional().default(false),
});

export type BooleanOptionEntity = z.infer<typeof BooleanOptionEntity>;

/**
 * User Option - For user selection
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export const UserOptionEntity = ApplicationCommandOptionEntity.omit({
  choices: true,
  options: true,
  channel_types: true,
  min_value: true,
  max_value: true,
  min_length: true,
  max_length: true,
  autocomplete: true,
}).extend({
  /** User option type */
  type: z.literal(ApplicationCommandOptionType.User),
  /** Whether this option is required */
  required: z.boolean().optional().default(false),
});

export type UserOptionEntity = z.infer<typeof UserOptionEntity>;

/**
 * Role Option - For role selection
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export const RoleOptionEntity = ApplicationCommandOptionEntity.omit({
  choices: true,
  options: true,
  channel_types: true,
  min_value: true,
  max_value: true,
  min_length: true,
  max_length: true,
  autocomplete: true,
}).extend({
  /** Role option type */
  type: z.literal(ApplicationCommandOptionType.Role),
  /** Whether this option is required */
  required: z.boolean().optional().default(false),
});

export type RoleOptionEntity = z.infer<typeof RoleOptionEntity>;

/**
 * Mentionable Option - For selecting users or roles
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export const MentionableOptionEntity = ApplicationCommandOptionEntity.omit({
  choices: true,
  options: true,
  channel_types: true,
  min_value: true,
  max_value: true,
  min_length: true,
  max_length: true,
  autocomplete: true,
}).extend({
  /** Mentionable option type */
  type: z.literal(ApplicationCommandOptionType.Mentionable),
  /** Whether this option is required */
  required: z.boolean().optional().default(false),
});

export type MentionableOptionEntity = z.infer<typeof MentionableOptionEntity>;

/**
 * Attachment Option - For file uploads
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export const AttachmentOptionEntity = ApplicationCommandOptionEntity.omit({
  choices: true,
  options: true,
  channel_types: true,
  min_value: true,
  max_value: true,
  min_length: true,
  max_length: true,
  autocomplete: true,
}).extend({
  /** Attachment option type */
  type: z.literal(ApplicationCommandOptionType.Attachment),
  /** Whether this option is required */
  required: z.boolean().optional().default(false),
});

export type AttachmentOptionEntity = z.infer<typeof AttachmentOptionEntity>;

/**
 * Simple command options (excluding subcommands and groups)
 */
export const AnySimpleApplicationCommandOptionEntity = z.discriminatedUnion(
  "type",
  [
    StringOptionEntity,
    IntegerOptionEntity,
    NumberOptionEntity,
    ChannelOptionEntity,
    BooleanOptionEntity,
    UserOptionEntity,
    RoleOptionEntity,
    MentionableOptionEntity,
    AttachmentOptionEntity,
  ],
);

export type AnySimpleApplicationCommandOptionEntity = z.infer<
  typeof AnySimpleApplicationCommandOptionEntity
>;

/**
 * SubCommand Option - A subcommand within a command
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export const SubOptionEntity = ApplicationCommandOptionEntity.omit({
  choices: true,
  channel_types: true,
  min_value: true,
  max_value: true,
  min_length: true,
  max_length: true,
  autocomplete: true,
  required: true,
}).extend({
  /** Subcommand type */
  type: z.literal(ApplicationCommandOptionType.SubCommand),
  /** Parameters for this subcommand (up to 25) */
  options: AnySimpleApplicationCommandOptionEntity.array().max(25).optional(),
});

export type SubOptionEntity = z.infer<typeof SubOptionEntity>;

/**
 * SubCommandGroup Option - A group of subcommands
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export const SubGroupOptionEntity = ApplicationCommandOptionEntity.omit({
  choices: true,
  channel_types: true,
  min_value: true,
  max_value: true,
  min_length: true,
  max_length: true,
  autocomplete: true,
  required: true,
}).extend({
  /** Subcommand group type */
  type: z.literal(ApplicationCommandOptionType.SubCommandGroup),
  /** Subcommands in this group (up to 25) */
  options: SubOptionEntity.array().max(25).optional(),
});

export type SubGroupOptionEntity = z.infer<typeof SubGroupOptionEntity>;

/**
 * Union of all possible command options with discriminated union pattern
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-option-structure}
 */
export const AnyApplicationCommandOptionEntity = z.discriminatedUnion("type", [
  SubOptionEntity,
  SubGroupOptionEntity,
  ...AnySimpleApplicationCommandOptionEntity.options,
]);

export type AnyApplicationCommandOptionEntity = z.infer<
  typeof AnyApplicationCommandOptionEntity
>;

/**
 * Permission structure for application commands
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-permissions-object-application-command-permissions-structure}
 */
export const ApplicationCommandPermissionEntity = z.object({
  /** ID of the role, user, or channel */
  id: Snowflake,

  /** Type of permission (role, user, or channel) */
  type: z.nativeEnum(ApplicationCommandPermissionType),

  /** true to allow, false to disallow */
  permission: z.boolean(),
});

export type ApplicationCommandPermissionEntity = z.infer<
  typeof ApplicationCommandPermissionEntity
>;

/**
 * Permissions structure for guild commands
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-permissions-object-guild-application-command-permissions-structure}
 */
export const GuildApplicationCommandPermissionEntity = z.object({
  /** ID of the command or the application ID */
  id: Snowflake,

  /** ID of the application the command belongs to */
  application_id: Snowflake,

  /** ID of the guild */
  guild_id: Snowflake,

  /** Permissions for the command in the guild (max 100) */
  permissions: ApplicationCommandPermissionEntity.array().max(100),
});

export type GuildApplicationCommandPermissionEntity = z.infer<
  typeof GuildApplicationCommandPermissionEntity
>;

/**
 * Complete Application Command structure with all possible properties
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-structure}
 */
export const ApplicationCommandEntity = z.object({
  /** Unique ID of command */
  id: Snowflake,

  /** Type of command */
  type: z.nativeEnum(ApplicationCommandType),

  /** ID of the parent application */
  application_id: Snowflake,

  /** Guild ID of the command, if not global */
  guild_id: Snowflake.optional(),

  /** 1-32 character name matching regex pattern */
  name: z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),

  /** Localization dictionary for the name field */
  name_localizations: z
    .record(
      z.nativeEnum(Locale),
      z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
    )
    .nullish(),

  /** 1-100 character description */
  description: z.string().min(1).max(100),

  /** Localization dictionary for the description field */
  description_localizations: z
    .record(z.nativeEnum(Locale), z.string().min(1).max(100))
    .nullish(),

  /** Parameters for the command (max of 25) */
  options: AnyApplicationCommandOptionEntity.array().max(25).optional(),

  /** Set of permissions represented as a bit set */
  default_member_permissions: z.string().nullable(),

  /**
   * Whether command is available in DMs with the app
   * @deprecated - use contexts instead
   */
  dm_permission: z.boolean().optional(),

  /** Whether command is enabled by default when app is added to guild (deprecated) */
  default_permission: z.boolean().nullish(),

  /** Whether command is age-restricted */
  nsfw: z.boolean().optional(),

  /** Installation contexts where command is available */
  integration_types: z
    .array(z.nativeEnum(ApplicationIntegrationType))
    .optional(),

  /** Interaction contexts where command can be used */
  contexts: z.nativeEnum(InteractionContextType).array().optional(),

  /** Autoincrementing version identifier */
  version: Snowflake,

  /** How the interaction should be handled (for entry point commands) */
  handler: z.nativeEnum(ApplicationCommandEntryPointType).optional(),
});

export type ApplicationCommandEntity = z.infer<typeof ApplicationCommandEntity>;

/**
 * Chat Input Command - Slash commands with /
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-structure}
 */
export const ChatInputApplicationCommandEntity = ApplicationCommandEntity.omit({
  handler: true,
}).extend({
  /** Chat input command type */
  type: z.literal(ApplicationCommandType.ChatInput),
});

export type ChatInputApplicationCommandEntity = z.infer<
  typeof ChatInputApplicationCommandEntity
>;

/**
 * User Command - Context menu command for users
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-structure}
 */
export const UserApplicationCommandEntity = ApplicationCommandEntity.omit({
  description: true,
  description_localizations: true,
  options: true,
  handler: true,
}).extend({
  /** User command type */
  type: z.literal(ApplicationCommandType.User),
});

export type UserApplicationCommandEntity = z.infer<
  typeof UserApplicationCommandEntity
>;

/**
 * Message Command - Context menu command for messages
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-structure}
 */
export const MessageApplicationCommandEntity = ApplicationCommandEntity.omit({
  description: true,
  description_localizations: true,
  options: true,
  handler: true,
}).extend({
  /** Message command type */
  type: z.literal(ApplicationCommandType.Message),
});

export type MessageApplicationCommandEntity = z.infer<
  typeof MessageApplicationCommandEntity
>;

/**
 * Entry Point Command - Primary way to launch an app's Activity
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-structure}
 */
export const EntryPointApplicationCommandEntity = ApplicationCommandEntity.omit(
  {
    options: true,
  },
).extend({
  /** Entry point command type */
  type: z.literal(ApplicationCommandType.PrimaryEntryPoint),
  /** How the interaction should be handled */
  handler: z.nativeEnum(ApplicationCommandEntryPointType),
});

export type EntryPointApplicationCommandEntity = z.infer<
  typeof EntryPointApplicationCommandEntity
>;

/**
 * Union of all application command types with discriminated union pattern
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Application_Commands.md#application-command-object-application-command-structure}
 */
export const AnyApplicationCommandEntity = z.discriminatedUnion("type", [
  ChatInputApplicationCommandEntity,
  UserApplicationCommandEntity,
  MessageApplicationCommandEntity,
  EntryPointApplicationCommandEntity,
]);

export type AnyApplicationCommandEntity = z.infer<
  typeof AnyApplicationCommandEntity
>;

import { z } from "zod";
import { AvailableLocale, createAvailableLocale } from "../enums/index.js";
import { Snowflake } from "../managers/index.js";
import { ApplicationIntegrationType } from "./application.entity.js";
import { ChannelType } from "./channel.entity.js";
import { InteractionContextType } from "./interaction.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type}
 */
export enum ApplicationCommandOptionType {
  SubCommand = 1,
  SubCommandGroup = 2,
  String = 3,
  Integer = 4,
  Boolean = 5,
  User = 6,
  Channel = 7,
  Role = 8,
  Mentionable = 9,
  Number = 10,
  Attachment = 11,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permission-type}
 */
export enum ApplicationCommandPermissionType {
  Role = 1,
  User = 2,
  Channel = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types}
 */
export enum ApplicationCommandType {
  ChatInput = 1,
  User = 2,
  Message = 3,
  PrimaryEntryPoint = 4,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-entry-point-command-handler-types}
 */
export enum ApplicationCommandEntryPointType {
  AppHandler = 1,
  DiscordLaunchActivity = 2,
}

export const APPLICATION_COMMAND_NAME_REGEX =
  /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-choice-structure}
 */
export const ApplicationCommandOptionChoiceEntity = z.object({
  name: z.string().min(1).max(100),
  name_localizations: AvailableLocale.nullish(),
  value: z.union([z.string(), z.number()]),
});

export type ApplicationCommandOptionChoiceEntity = z.infer<
  typeof ApplicationCommandOptionChoiceEntity
>;

/**
 * Base structure for all command options
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export const BaseApplicationCommandOptionEntity = z.object({
  name: z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
  name_localizations: createAvailableLocale(
    z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
  ).nullish(),
  description: z.string().min(1).max(100),
  description_localizations: createAvailableLocale(
    z.string().min(1).max(100),
  ).nullish(),
});

/**
 * SubCommand Option - {@link ApplicationCommandOptionType.SubCommand}
 */
export const SubCommandOptionEntity = BaseApplicationCommandOptionEntity.extend(
  {
    type: z.literal(ApplicationCommandOptionType.SubCommand),
    options: z
      .array(z.lazy(() => SimpleApplicationCommandOptionEntity))
      .max(25)
      .optional(),
  },
);

export type SubCommandOptionEntity = z.infer<typeof SubCommandOptionEntity>;

/**
 * SubCommandGroup Option - {@link ApplicationCommandOptionType.SubCommandGroup}
 */
export const SubCommandGroupOptionEntity =
  BaseApplicationCommandOptionEntity.extend({
    type: z.literal(ApplicationCommandOptionType.SubCommandGroup),
    options: z.array(SubCommandOptionEntity).max(25),
  });

export type SubCommandGroupOptionEntity = z.infer<
  typeof SubCommandGroupOptionEntity
>;

/**
 * String Option - {@link ApplicationCommandOptionType.String}
 */
export const StringOptionEntity = BaseApplicationCommandOptionEntity.extend({
  type: z.literal(ApplicationCommandOptionType.String),
  required: z.boolean().optional(),
  min_length: z.number().int().min(0).max(6000).optional(),
  max_length: z.number().int().min(1).max(6000).optional(),
  autocomplete: z.boolean().optional(),
  choices: z.array(ApplicationCommandOptionChoiceEntity).max(25).optional(),
});

export type StringOptionEntity = z.infer<typeof StringOptionEntity>;

/**
 * Integer Option - {@link ApplicationCommandOptionType.Integer}
 */
export const IntegerOptionEntity = BaseApplicationCommandOptionEntity.extend({
  type: z.literal(ApplicationCommandOptionType.Integer),
  required: z.boolean().optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  autocomplete: z.boolean().optional(),
  choices: z.array(ApplicationCommandOptionChoiceEntity).max(25).optional(),
});

export type IntegerOptionEntity = z.infer<typeof IntegerOptionEntity>;

/**
 * Number/Integer Option - {@link ApplicationCommandOptionType.Number} {@link ApplicationCommandOptionType.Integer}
 */
export const NumberOptionEntity = BaseApplicationCommandOptionEntity.extend({
  type: z.literal(ApplicationCommandOptionType.Number),
  required: z.boolean().optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  autocomplete: z.boolean().optional(),
  choices: z.array(ApplicationCommandOptionChoiceEntity).max(25).optional(),
});

export type NumberOptionEntity = z.infer<typeof NumberOptionEntity>;

/**
 * Channel Option - {@link ApplicationCommandOptionType.Channel}
 */
export const ChannelOptionEntity = BaseApplicationCommandOptionEntity.extend({
  type: z.literal(ApplicationCommandOptionType.Channel),
  required: z.boolean().optional(),
  channel_types: z.array(z.nativeEnum(ChannelType)).optional(),
});

export type ChannelOptionEntity = z.infer<typeof ChannelOptionEntity>;

/**
 * Boolean Option - {@link ApplicationCommandOptionType.Boolean}
 */
export const BooleanOptionEntity = BaseApplicationCommandOptionEntity.extend({
  type: z.literal(ApplicationCommandOptionType.Boolean),
  required: z.boolean().optional(),
});

/**
 * User Option - {@link ApplicationCommandOptionType.User}
 */
export const UserOptionEntity = BaseApplicationCommandOptionEntity.extend({
  type: z.literal(ApplicationCommandOptionType.User),
  required: z.boolean().optional(),
});

/**
 * Role Option - {@link ApplicationCommandOptionType.Role}
 */
export const RoleOptionEntity = BaseApplicationCommandOptionEntity.extend({
  type: z.literal(ApplicationCommandOptionType.Role),
  required: z.boolean().optional(),
});

/**
 * Mentionable Option - {@link ApplicationCommandOptionType.Mentionable}
 */
export const MentionableOptionEntity =
  BaseApplicationCommandOptionEntity.extend({
    type: z.literal(ApplicationCommandOptionType.Mentionable),
    required: z.boolean().optional(),
  });

/**
 * Attachment Option - {@link ApplicationCommandOptionType.Attachment}
 */
export const AttachmentOptionEntity = BaseApplicationCommandOptionEntity.extend(
  {
    type: z.literal(ApplicationCommandOptionType.Attachment),
    required: z.boolean().optional(),
  },
);

/**
 * Union of all possible command options
 */
export const ApplicationCommandOptionEntity = z.discriminatedUnion("type", [
  SubCommandOptionEntity,
  SubCommandGroupOptionEntity,
  StringOptionEntity,
  IntegerOptionEntity,
  NumberOptionEntity,
  ChannelOptionEntity,
  BooleanOptionEntity,
  UserOptionEntity,
  RoleOptionEntity,
  MentionableOptionEntity,
  AttachmentOptionEntity,
]);

export type ApplicationCommandOptionEntity = z.infer<
  typeof ApplicationCommandOptionEntity
>;

/**
 * Simple command options (excluding subcommands and groups)
 */
export const SimpleApplicationCommandOptionEntity = z.union([
  StringOptionEntity,
  IntegerOptionEntity,
  NumberOptionEntity,
  ChannelOptionEntity,
  BooleanOptionEntity,
  UserOptionEntity,
  RoleOptionEntity,
  MentionableOptionEntity,
  AttachmentOptionEntity,
]);

export type SimpleApplicationCommandOptionEntity = z.infer<
  typeof SimpleApplicationCommandOptionEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permissions-structure}
 */
export const ApplicationCommandPermissionEntity = z.object({
  id: Snowflake,
  type: z.nativeEnum(ApplicationCommandPermissionType),
  permission: z.boolean(),
});

export type ApplicationCommandPermissionEntity = z.infer<
  typeof ApplicationCommandPermissionEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure}
 */
export const GuildApplicationCommandPermissionEntity = z.object({
  id: Snowflake,
  application_id: Snowflake,
  guild_id: Snowflake,
  permissions: z.array(ApplicationCommandPermissionEntity),
});

export type GuildApplicationCommandPermissionEntity = z.infer<
  typeof GuildApplicationCommandPermissionEntity
>;

/**
 * Base Application Command - All command types share these properties
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export const BaseApplicationCommandEntity = z.object({
  id: Snowflake,
  application_id: Snowflake,
  guild_id: Snowflake.optional(),
  name: z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
  name_localizations: createAvailableLocale(
    z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
  ).nullish(),
  default_member_permissions: z.string().nullable(),
  dm_permission: z.boolean().optional(),
  default_permission: z.boolean().nullish(),
  nsfw: z.boolean().optional(),
  integration_types: z
    .array(z.nativeEnum(ApplicationIntegrationType))
    .optional(),
  contexts: z.array(z.nativeEnum(InteractionContextType)).nullish(),
  version: Snowflake,
});

/**
 * Chat Input Command - {@link ApplicationCommandType.ChatInput}
 */
export const ChatInputApplicationCommandEntity =
  BaseApplicationCommandEntity.extend({
    type: z.literal(ApplicationCommandType.ChatInput),
    description: z.string().min(1).max(100),
    description_localizations: createAvailableLocale(
      z.string().min(1).max(100),
    ).nullish(),
    options: z.array(ApplicationCommandOptionEntity).max(25).optional(),
  });

export type ChatInputApplicationCommandEntity = z.infer<
  typeof ChatInputApplicationCommandEntity
>;

/**
 * User Command - {@link ApplicationCommandType.User}
 */
export const UserApplicationCommandEntity = BaseApplicationCommandEntity.extend(
  {
    type: z.literal(ApplicationCommandType.User),
  },
);

export type UserApplicationCommandEntity = z.infer<
  typeof UserApplicationCommandEntity
>;

/**
 * Message Command - {@link ApplicationCommandType.Message}
 */
export const MessageApplicationCommandEntity =
  BaseApplicationCommandEntity.extend({
    type: z.literal(ApplicationCommandType.Message),
  });

export type MessageApplicationCommandEntity = z.infer<
  typeof MessageApplicationCommandEntity
>;

/**
 * Entry Point Command - {@link ApplicationCommandType.PrimaryEntryPoint}
 */
export const EntryPointApplicationCommandEntity =
  BaseApplicationCommandEntity.extend({
    type: z.literal(ApplicationCommandType.PrimaryEntryPoint),
    description: z.string().min(1).max(100),
    description_localizations: createAvailableLocale(
      z.string().min(1).max(100),
    ).nullish(),
    handler: z.nativeEnum(ApplicationCommandEntryPointType),
  });

export type EntryPointApplicationCommandEntity = z.infer<
  typeof EntryPointApplicationCommandEntity
>;

/**
 * Union of all application command types
 */
export const ApplicationCommandEntity = z.discriminatedUnion("type", [
  ChatInputApplicationCommandEntity,
  UserApplicationCommandEntity,
  MessageApplicationCommandEntity,
  EntryPointApplicationCommandEntity,
]);

export type ApplicationCommandEntity = z.infer<typeof ApplicationCommandEntity>;

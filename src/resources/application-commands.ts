import type { Snowflake } from "../common/index.js";
import type { Locale } from "../constants/index.js";
import type { ChannelType } from "./channel.js";
import type { InteractionContextType } from "./interaction.js";

export enum ApplicationCommandType {
  ChatInput = 1,
  User = 2,
  Message = 3,
  PrimaryEntryPoint = 4,
}

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

export enum EntryPointCommandHandlerType {
  AppHandler = 1,
  DiscordLaunchActivity = 2,
}

export enum ApplicationCommandPermissionType {
  Role = 1,
  User = 2,
  Channel = 3,
}

export interface ApplicationCommandOptionChoiceObject {
  name: string;
  name_localizations?: Partial<Record<Locale, string>> | null;
  value: string | number;
}

export interface ApplicationCommandOptionObject {
  type: ApplicationCommandOptionType;
  name: string;
  name_localizations?: Partial<Record<Locale, string>> | null;
  description: string;
  description_localizations?: Partial<Record<Locale, string>> | null;
  required?: boolean;
  choices?: ApplicationCommandOptionChoiceObject[];
  options?: ApplicationCommandOptionObject[];
  channel_types?: ChannelType[];
  min_value?: number;
  max_value?: number;
  min_length?: number;
  max_length?: number;
  autocomplete?: boolean;
}

export interface SubCommandApplicationCommandOptionObject
  extends Pick<
    ApplicationCommandOptionObject,
    "name" | "name_localizations" | "description" | "description_localizations" | "options"
  > {
  type: ApplicationCommandOptionType.SubCommand;
  options?: Exclude<
    AnyApplicationCommandOptionObject,
    SubCommandGroupApplicationCommandOptionObject | SubCommandApplicationCommandOptionObject
  >[];
}

export interface SubCommandGroupApplicationCommandOptionObject
  extends Pick<
    ApplicationCommandOptionObject,
    "name" | "name_localizations" | "description" | "description_localizations" | "options"
  > {
  type: ApplicationCommandOptionType.SubCommandGroup;
  options?: SubCommandApplicationCommandOptionObject[];
}

export interface StringApplicationCommandOptionObject
  extends Pick<
    ApplicationCommandOptionObject,
    | "name"
    | "name_localizations"
    | "description"
    | "description_localizations"
    | "required"
    | "choices"
    | "min_length"
    | "max_length"
    | "autocomplete"
  > {
  type: ApplicationCommandOptionType.String;
  choices?: ApplicationCommandOptionChoiceObject[];
}

export interface IntegerApplicationCommandOptionObject
  extends Pick<
    ApplicationCommandOptionObject,
    | "name"
    | "name_localizations"
    | "description"
    | "description_localizations"
    | "required"
    | "choices"
    | "min_value"
    | "max_value"
    | "autocomplete"
  > {
  type: ApplicationCommandOptionType.Integer;
  choices?: ApplicationCommandOptionChoiceObject[];
}

export interface BooleanApplicationCommandOptionObject
  extends Pick<
    ApplicationCommandOptionObject,
    "name" | "name_localizations" | "description" | "description_localizations" | "required"
  > {
  type: ApplicationCommandOptionType.Boolean;
}

export interface UserApplicationCommandOptionObject
  extends Pick<
    ApplicationCommandOptionObject,
    "name" | "name_localizations" | "description" | "description_localizations" | "required"
  > {
  type: ApplicationCommandOptionType.User;
}

export interface ChannelApplicationCommandOptionObject
  extends Pick<
    ApplicationCommandOptionObject,
    | "name"
    | "name_localizations"
    | "description"
    | "description_localizations"
    | "required"
    | "channel_types"
  > {
  type: ApplicationCommandOptionType.Channel;
  channel_types?: ChannelType[];
}

export interface RoleApplicationCommandOptionObject
  extends Pick<
    ApplicationCommandOptionObject,
    "name" | "name_localizations" | "description" | "description_localizations" | "required"
  > {
  type: ApplicationCommandOptionType.Role;
}

export interface MentionableApplicationCommandOptionObject
  extends Pick<
    ApplicationCommandOptionObject,
    "name" | "name_localizations" | "description" | "description_localizations" | "required"
  > {
  type: ApplicationCommandOptionType.Mentionable;
}

export interface NumberApplicationCommandOptionObject
  extends Pick<
    ApplicationCommandOptionObject,
    | "name"
    | "name_localizations"
    | "description"
    | "description_localizations"
    | "required"
    | "choices"
    | "min_value"
    | "max_value"
    | "autocomplete"
  > {
  type: ApplicationCommandOptionType.Number;
  choices?: ApplicationCommandOptionChoiceObject[];
}

export interface AttachmentApplicationCommandOptionObject
  extends Pick<
    ApplicationCommandOptionObject,
    "name" | "name_localizations" | "description" | "description_localizations" | "required"
  > {
  type: ApplicationCommandOptionType.Attachment;
}

export type AnyApplicationCommandOptionObject =
  | SubCommandApplicationCommandOptionObject
  | SubCommandGroupApplicationCommandOptionObject
  | StringApplicationCommandOptionObject
  | IntegerApplicationCommandOptionObject
  | BooleanApplicationCommandOptionObject
  | UserApplicationCommandOptionObject
  | ChannelApplicationCommandOptionObject
  | RoleApplicationCommandOptionObject
  | MentionableApplicationCommandOptionObject
  | NumberApplicationCommandOptionObject
  | AttachmentApplicationCommandOptionObject;

export interface ApplicationCommandObject {
  id: Snowflake;
  type?: ApplicationCommandType;
  application_id: Snowflake;
  guild_id?: Snowflake;
  name: string;
  name_localizations?: Partial<Record<Locale, string>> | null;
  description: string;
  description_localizations?: Partial<Record<Locale, string>> | null;
  options?: ApplicationCommandOptionObject[];
  default_member_permissions: string | null;
  dm_permission?: boolean;
  default_permission?: boolean | null;
  nsfw?: boolean;
  integration_types?: number[];
  contexts?: InteractionContextType[] | null;
  version: Snowflake;
  handler?: EntryPointCommandHandlerType;
}

export interface ChatInputApplicationCommandObject
  extends Pick<
    ApplicationCommandObject,
    | "id"
    | "application_id"
    | "guild_id"
    | "name"
    | "name_localizations"
    | "description"
    | "description_localizations"
    | "options"
    | "default_member_permissions"
    | "dm_permission"
    | "default_permission"
    | "nsfw"
    | "integration_types"
    | "contexts"
    | "version"
  > {
  type?: ApplicationCommandType.ChatInput;
  options?: ApplicationCommandOptionObject[];
}

export interface UserApplicationCommandObject
  extends Pick<
    ApplicationCommandObject,
    | "id"
    | "application_id"
    | "guild_id"
    | "name"
    | "name_localizations"
    | "description"
    | "description_localizations"
    | "default_member_permissions"
    | "dm_permission"
    | "default_permission"
    | "nsfw"
    | "integration_types"
    | "contexts"
    | "version"
  > {
  type: ApplicationCommandType.User;
  description: "";
}

export interface MessageApplicationCommandObject
  extends Pick<
    ApplicationCommandObject,
    | "id"
    | "application_id"
    | "guild_id"
    | "name"
    | "name_localizations"
    | "description"
    | "description_localizations"
    | "default_member_permissions"
    | "dm_permission"
    | "default_permission"
    | "nsfw"
    | "integration_types"
    | "contexts"
    | "version"
  > {
  type: ApplicationCommandType.Message;
  description: "";
}

export interface PrimaryEntryPointApplicationCommandObject
  extends Pick<
    ApplicationCommandObject,
    | "id"
    | "application_id"
    | "guild_id"
    | "name"
    | "name_localizations"
    | "description"
    | "description_localizations"
    | "default_member_permissions"
    | "dm_permission"
    | "default_permission"
    | "nsfw"
    | "integration_types"
    | "contexts"
    | "version"
    | "handler"
  > {
  type: ApplicationCommandType.PrimaryEntryPoint;
  handler?: EntryPointCommandHandlerType;
}

export type AnyApplicationCommandObject =
  | ChatInputApplicationCommandObject
  | UserApplicationCommandObject
  | MessageApplicationCommandObject
  | PrimaryEntryPointApplicationCommandObject;

export interface GuildApplicationCommandPermissionsObject {
  id: Snowflake;
  application_id: Snowflake;
  guild_id: Snowflake;
  permissions: ApplicationCommandPermissionObject[];
}

export interface ApplicationCommandPermissionObject {
  id: Snowflake;
  type: ApplicationCommandPermissionType;
  permission: boolean;
}

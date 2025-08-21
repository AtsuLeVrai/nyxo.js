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

interface BaseApplicationCommandObject {
  id: Snowflake;
  application_id: Snowflake;
  guild_id?: Snowflake;
  name: string;
  name_localizations?: Partial<Record<Locale, string>> | null;
  description: string;
  description_localizations?: Partial<Record<Locale, string>> | null;
  default_member_permissions: string | null;
  dm_permission?: boolean;
  default_permission?: boolean | null;
  nsfw?: boolean;
  integration_types?: number[];
  contexts?: InteractionContextType[] | null;
  version: Snowflake;
}

export interface ChatInputApplicationCommandObject extends BaseApplicationCommandObject {
  type?: ApplicationCommandType.ChatInput;
  options?: ApplicationCommandOptionObject[];
}

export interface UserApplicationCommandObject extends BaseApplicationCommandObject {
  type: ApplicationCommandType.User;
}

export interface MessageApplicationCommandObject extends BaseApplicationCommandObject {
  type: ApplicationCommandType.Message;
}

export interface PrimaryEntryPointApplicationCommandObject extends BaseApplicationCommandObject {
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

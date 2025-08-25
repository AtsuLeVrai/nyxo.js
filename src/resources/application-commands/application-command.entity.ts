import type { LocaleValues } from "../../enum/index.js";
import type { ApplicationIntegrationType } from "../application/index.js";
import type { ChannelType } from "../channel/index.js";
import type { InteractionContextType } from "../interaction/index.js";

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

export enum ApplicationCommandPermissionType {
  Role = 1,
  User = 2,
  Channel = 3,
}

export enum ApplicationCommandType {
  ChatInput = 1,
  User = 2,
  Message = 3,
  PrimaryEntryPoint = 4,
}

export enum ApplicationCommandEntryPointType {
  AppHandler = 1,
  DiscordLaunchActivity = 2,
}

export const APPLICATION_COMMAND_NAME_REGEX = /^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

export interface ApplicationCommandOptionChoiceEntity {
  name: string;
  name_localizations?: Partial<Record<LocaleValues, string>> | null;
  value: string | number;
}

export interface ApplicationCommandOptionEntity {
  type: ApplicationCommandOptionType;
  name: string;
  name_localizations?: Partial<Record<LocaleValues, string>> | null;
  description: string;
  description_localizations?: Partial<Record<LocaleValues, string>> | null;
  required?: boolean;
  choices?: ApplicationCommandOptionChoiceEntity[];
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  autocomplete?: boolean;
  channel_types?: ChannelType[];
  options?: AnyApplicationCommandOptionEntity[];
}

export interface StringCommandOptionEntity
  extends Omit<ApplicationCommandOptionEntity, "min_value" | "max_value" | "channel_types"> {
  type: ApplicationCommandOptionType.String;
}

export interface IntegerCommandOptionEntity
  extends Omit<ApplicationCommandOptionEntity, "min_length" | "max_length" | "channel_types"> {
  type: ApplicationCommandOptionType.Integer;
}

export interface NumberCommandOptionEntity
  extends Omit<ApplicationCommandOptionEntity, "min_length" | "max_length" | "channel_types"> {
  type: ApplicationCommandOptionType.Number;
}

export interface ChannelCommandOptionEntity
  extends Omit<
    ApplicationCommandOptionEntity,
    "choices" | "min_length" | "max_length" | "min_value" | "max_value" | "autocomplete"
  > {
  type: ApplicationCommandOptionType.Channel;
}

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
  type: ApplicationCommandOptionType.Boolean;
}

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
  type: ApplicationCommandOptionType.User;
}

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
  type: ApplicationCommandOptionType.Role;
}

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
  type: ApplicationCommandOptionType.Mentionable;
}

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
  type: ApplicationCommandOptionType.Attachment;
}

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
  type: ApplicationCommandOptionType.SubCommand;
  options?: AnySimpleApplicationCommandOptionEntity[];
}

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
  type: ApplicationCommandOptionType.SubCommandGroup;
  options: SubCommandOptionEntity[];
}

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

export type AnyComplexApplicationCommandOptionEntity =
  | SubCommandOptionEntity
  | SubCommandGroupOptionEntity;

export type AnyApplicationCommandOptionEntity =
  | AnySimpleApplicationCommandOptionEntity
  | AnyComplexApplicationCommandOptionEntity;

export interface ApplicationCommandPermissionEntity {
  id: string;
  type: ApplicationCommandPermissionType;
  permission: boolean;
}

export interface GuildApplicationCommandPermissionEntity {
  id: string;
  application_id: string;
  guild_id: string;
  permissions: ApplicationCommandPermissionEntity[];
}

export interface ApplicationCommandEntity {
  id: string;
  type: ApplicationCommandType;
  application_id: string;
  guild_id?: string;
  name: string;
  name_localizations?: Partial<Record<LocaleValues, string>> | null;
  description: string;
  description_localizations?: Partial<Record<LocaleValues, string>> | null;
  default_member_permissions: string | null;
  dm_permission?: boolean;
  default_permission?: boolean | null;
  nsfw?: boolean;
  integration_types?: ApplicationIntegrationType[];
  contexts?: InteractionContextType[];
  version: string;
  options?: AnyApplicationCommandOptionEntity[];
  handler: ApplicationCommandEntryPointType;
}

export interface ChatInputApplicationCommandEntity
  extends Omit<ApplicationCommandEntity, "handler"> {
  type: ApplicationCommandType.ChatInput;
}

export interface UserApplicationCommandEntity
  extends Omit<ApplicationCommandEntity, "options" | "handler"> {
  type: ApplicationCommandType.User;
}

export interface MessageApplicationCommandEntity
  extends Omit<ApplicationCommandEntity, "options" | "handler"> {
  type: ApplicationCommandType.Message;
}

export interface EntryPointApplicationCommandEntity
  extends Omit<ApplicationCommandEntity, "options"> {
  type: ApplicationCommandType.PrimaryEntryPoint;
}

export type AnyApplicationCommandEntity =
  | ChatInputApplicationCommandEntity
  | UserApplicationCommandEntity
  | MessageApplicationCommandEntity
  | EntryPointApplicationCommandEntity;

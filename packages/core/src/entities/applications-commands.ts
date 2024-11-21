import type { AvailableLocale } from "../enums/index.js";
import type { Integer, Snowflake } from "../formatting/index.js";
import type { ApplicationIntegrationType } from "./applications.js";
import type { ChannelType } from "./channels.js";
import type { InteractionContextType } from "./interactions.js";

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permission-type}
 */
export enum ApplicationCommandPermissionType {
  Role = 1,
  User = 2,
  Channel = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permissions-structure}
 */
export interface ApplicationCommandPermissionEntity {
  id: Snowflake;
  type: ApplicationCommandPermissionType;
  permission: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure}
 */
export interface GuildApplicationCommandPermissionEntity {
  id: Snowflake;
  application_id: Snowflake;
  guild_id: Snowflake;
  permissions: ApplicationCommandPermissionEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-entry-point-command-handler-types}
 */
export enum ApplicationCommandEntryPointType {
  AppHandler = 1,
  DiscordLaunchActivity = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-choice-structure}
 */
export interface ApplicationCommandOptionChoiceEntity {
  name: string;
  name_localizations?: AvailableLocale | null;
  value: string | number;
}

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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface ApplicationCommandOptionEntity {
  type: ApplicationCommandOptionType;
  name: string;
  name_localizations?: AvailableLocale | null;
  description: string;
  description_localizations?: AvailableLocale | null;
  required?: boolean;
  choices?: ApplicationCommandOptionChoiceEntity[];
  options?: ApplicationCommandOptionEntity[];
  channel_types?: ChannelType[];
  min_value?: Integer;
  max_value?: Integer;
  min_length?: Integer;
  max_length?: Integer;
  autocomplete?: boolean;
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
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export interface ApplicationCommandEntity {
  id: Snowflake;
  type?: ApplicationCommandType;
  application_id: Snowflake;
  guild_id?: Snowflake;
  name: string;
  name_localizations?: AvailableLocale | null;
  description: string;
  description_localizations?: AvailableLocale | null;
  options?: ApplicationCommandOptionEntity[];
  default_member_permissions: string | null;
  dm_permission?: boolean;
  default_permission?: boolean | null;
  nsfw?: boolean;
  integration_types?: ApplicationIntegrationType[];
  contexts?: InteractionContextType[] | null;
  version: Snowflake;
  handler?: ApplicationCommandEntryPointType;
}

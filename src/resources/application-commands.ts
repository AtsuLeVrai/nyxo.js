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

export interface CommandPermissionsUpdateOptions {
  permissions: ApplicationCommandPermissionEntity[];
}

export interface GlobalCommandCreateOptions {
  name: string;
  name_localizations?: Record<string, string> | null;
  description: string;
  description_localizations?: Record<string, string> | null;
  options?: AnyApplicationCommandOptionEntity[];
  default_member_permissions?: string | null;
  dm_permission?: boolean | null;
  default_permission?: boolean | null;
  integration_types?: ApplicationIntegrationType[];
  contexts?: number[];
  type?: ApplicationCommandType;
  nsfw?: boolean;
}

export type GlobalCommandUpdateOptions = Partial<Omit<GlobalCommandCreateOptions, "type">>;

export type GuildCommandCreateOptions = Omit<
  GlobalCommandCreateOptions,
  "integration_types" | "contexts"
>;

export type GuildCommandUpdateOptions = Partial<Omit<GuildCommandCreateOptions, "type">>;

export class ApplicationCommandRouter {
  static readonly Routes = {
    globalCommandsEndpoint: (applicationId: string) =>
      `/applications/${applicationId}/commands` as const,
    globalCommandByIdEndpoint: (applicationId: string, commandId: string) =>
      `/applications/${applicationId}/commands/${commandId}` as const,
    guildCommandsEndpoint: (applicationId: string, guildId: string) =>
      `/applications/${applicationId}/guilds/${guildId}/commands` as const,
    guildCommandByIdEndpoint: (applicationId: string, guildId: string, commandId: string) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}` as const,
    allGuildCommandPermissionsEndpoint: (applicationId: string, guildId: string) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/permissions` as const,
    guildCommandPermissionsByIdEndpoint: (
      applicationId: string,
      guildId: string,
      commandId: string,
    ) =>
      `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}/permissions` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchGlobalCommands(
    applicationId: string,
    withLocalizations = false,
  ): Promise<AnyApplicationCommandEntity[]> {
    return this.#rest.get(ApplicationCommandRouter.Routes.globalCommandsEndpoint(applicationId), {
      query: { with_localizations: withLocalizations },
    });
  }
  createGlobalCommand(
    applicationId: string,
    options: GlobalCommandCreateOptions,
  ): Promise<AnyApplicationCommandEntity> {
    return this.#rest.post(ApplicationCommandRouter.Routes.globalCommandsEndpoint(applicationId), {
      body: JSON.stringify(options),
    });
  }
  fetchGlobalCommand(
    applicationId: string,
    commandId: string,
  ): Promise<AnyApplicationCommandEntity> {
    return this.#rest.get(
      ApplicationCommandRouter.Routes.globalCommandByIdEndpoint(applicationId, commandId),
    );
  }
  updateGlobalCommand(
    applicationId: string,
    commandId: string,
    options: GlobalCommandUpdateOptions,
  ): Promise<AnyApplicationCommandEntity> {
    return this.#rest.patch(
      ApplicationCommandRouter.Routes.globalCommandByIdEndpoint(applicationId, commandId),
      { body: JSON.stringify(options) },
    );
  }
  deleteGlobalCommand(applicationId: string, commandId: string): Promise<void> {
    return this.#rest.delete(
      ApplicationCommandRouter.Routes.globalCommandByIdEndpoint(applicationId, commandId),
    );
  }
  bulkOverwriteGlobalCommands(
    applicationId: string,
    commands: GlobalCommandCreateOptions[],
  ): Promise<AnyApplicationCommandEntity[]> {
    return this.#rest.put(ApplicationCommandRouter.Routes.globalCommandsEndpoint(applicationId), {
      body: JSON.stringify(commands),
    });
  }
  fetchGuildCommands(
    applicationId: string,
    guildId: string,
    withLocalizations = false,
  ): Promise<AnyApplicationCommandEntity[]> {
    return this.#rest.get(
      ApplicationCommandRouter.Routes.guildCommandsEndpoint(applicationId, guildId),
      { query: { with_localizations: withLocalizations } },
    );
  }
  createGuildCommand(
    applicationId: string,
    guildId: string,
    options: GuildCommandCreateOptions,
  ): Promise<AnyApplicationCommandEntity> {
    return this.#rest.post(
      ApplicationCommandRouter.Routes.guildCommandsEndpoint(applicationId, guildId),
      { body: JSON.stringify(options) },
    );
  }
  fetchGuildCommand(
    applicationId: string,
    guildId: string,
    commandId: string,
  ): Promise<AnyApplicationCommandEntity> {
    return this.#rest.get(
      ApplicationCommandRouter.Routes.guildCommandByIdEndpoint(applicationId, guildId, commandId),
    );
  }
  updateGuildCommand(
    applicationId: string,
    guildId: string,
    commandId: string,
    options: GuildCommandUpdateOptions,
  ): Promise<AnyApplicationCommandEntity> {
    return this.#rest.patch(
      ApplicationCommandRouter.Routes.guildCommandByIdEndpoint(applicationId, guildId, commandId),
      { body: JSON.stringify(options) },
    );
  }
  deleteGuildCommand(applicationId: string, guildId: string, commandId: string): Promise<void> {
    return this.#rest.delete(
      ApplicationCommandRouter.Routes.guildCommandByIdEndpoint(applicationId, guildId, commandId),
    );
  }
  bulkOverwriteGuildCommands(
    applicationId: string,
    guildId: string,
    commands: GuildCommandCreateOptions[],
  ): Promise<AnyApplicationCommandEntity[]> {
    return this.#rest.put(
      ApplicationCommandRouter.Routes.guildCommandsEndpoint(applicationId, guildId),
      { body: JSON.stringify(commands) },
    );
  }
  fetchGuildCommandPermissions(
    applicationId: string,
    guildId: string,
  ): Promise<GuildApplicationCommandPermissionEntity[]> {
    return this.#rest.get(
      ApplicationCommandRouter.Routes.allGuildCommandPermissionsEndpoint(applicationId, guildId),
    );
  }
  fetchCommandPermissions(
    applicationId: string,
    guildId: string,
    commandId: string,
  ): Promise<GuildApplicationCommandPermissionEntity> {
    return this.#rest.get(
      ApplicationCommandRouter.Routes.guildCommandPermissionsByIdEndpoint(
        applicationId,
        guildId,
        commandId,
      ),
    );
  }
  updateCommandPermissions(
    applicationId: string,
    guildId: string,
    commandId: string,
    options: CommandPermissionsUpdateOptions,
  ): Promise<GuildApplicationCommandPermissionEntity> {
    return this.#rest.put(
      ApplicationCommandRouter.Routes.guildCommandPermissionsByIdEndpoint(
        applicationId,
        guildId,
        commandId,
      ),
      { body: JSON.stringify(options) },
    );
  }
}

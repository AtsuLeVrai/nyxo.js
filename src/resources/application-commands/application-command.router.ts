import type { Rest } from "../../core/index.js";
import type { ApplicationIntegrationType } from "../application/index.js";
import type {
  AnyApplicationCommandEntity,
  AnyApplicationCommandOptionEntity,
  ApplicationCommandPermissionEntity,
  ApplicationCommandType,
  GuildApplicationCommandPermissionEntity,
} from "./application-command.entity.js";

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

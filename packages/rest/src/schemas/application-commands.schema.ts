import type {
  AnyApplicationCommandOptionEntity,
  ApplicationCommandPermissionEntity,
  ApplicationCommandType,
  ApplicationIntegrationType,
} from "@nyxjs/core";

/**
 * Interface for editing application command permissions.
 * Defines a set of permission overwrites for a command.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions}
 */
export interface EditApplicationCommandPermissionsSchema {
  /**
   * Array of permission objects for the command (max 100)
   *
   * @maxItems 100
   */
  permissions: ApplicationCommandPermissionEntity[];
}

/**
 * Interface for creating a global application command.
 * Reuses validation rules from the ApplicationCommandEntity where possible.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command}
 */
export interface CreateGlobalApplicationCommandSchema {
  /**
   * Command name (1-32 characters matching regex)
   *
   * @minLength 1
   * @maxLength 32
   * @pattern ^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$
   */
  name: string;

  /**
   * Localization dictionary for the name field
   *
   * @nullable
   * @optional
   */
  name_localizations?: Record<string, string> | null;

  /**
   * Command description (1-100 characters)
   *
   * @minLength 1
   * @maxLength 100
   * @optional
   */
  description: string;

  /**
   * Localization dictionary for the description field
   *
   * @nullable
   * @optional
   */
  description_localizations?: Record<string, string> | null;

  /**
   * Command options/parameters (max 25)
   *
   * @maxItems 25
   * @optional
   */
  options?: AnyApplicationCommandOptionEntity[];

  /**
   * Permissions required to use the command (bit set as string)
   *
   * @nullable
   */
  default_member_permissions?: string | null;

  /**
   * Whether the command is available in DMs with the app
   * @deprecated Use `contexts` instead
   *
   * @nullable
   * @optional
   */
  dm_permission?: boolean | null;

  /**
   * Whether the command is enabled by default (deprecated)
   *
   * @nullable
   * @optional
   */
  default_permission?: boolean | null;

  /**
   * Installation contexts where the command is available
   *
   * @optional
   */
  integration_types?: ApplicationIntegrationType[];

  /**
   * Interaction contexts where the command can be used
   *
   * @optional
   */
  contexts?: number[];

  /**
   * Type of command (defaults to ChatInput/slash command)
   *
   * @default ApplicationCommandType.ChatInput
   * @optional
   */
  type?: ApplicationCommandType;

  /**
   * Whether the command is age-restricted
   *
   * @optional
   */
  nsfw?: boolean;
}

/**
 * Interface for editing a global application command.
 * Similar to creating a command but all fields are optional, and type cannot be changed.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command-json-params}
 */
export type EditGlobalApplicationCommandSchema = Partial<
  Omit<CreateGlobalApplicationCommandSchema, "type">
>;

/**
 * Interface for creating a guild-specific application command.
 * Similar to global commands but without integration_types and contexts,
 * as these are only applicable to global commands.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command-json-params}
 */
export type CreateGuildApplicationCommandSchema = Omit<
  CreateGlobalApplicationCommandSchema,
  "integration_types" | "contexts"
>;

/**
 * Interface for editing a guild-specific application command.
 * Similar to creating a guild command but all fields are optional, and type cannot be changed.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command-json-params}
 */
export type EditGuildApplicationCommandSchema = Partial<
  Omit<CreateGuildApplicationCommandSchema, "type">
>;
